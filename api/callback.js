const supportedLocales = new Set(['en', 'it', 'fr', 'es', 'pt-BR']);
const types = new Set(['discovery', 'support', 'information']);
const timings = new Set(['now', 'scheduled']);
const text = (value, maximum) => typeof value === 'string' ? value.trim().replace(/[<>]/g, '').slice(0, maximum) : '';

const json = (body, status = 200) => Response.json(body, { headers: { 'Cache-Control': 'no-store' }, status });
const originPermitted = request => {
  const origin = request.headers.get('origin');
  return origin && origin === new URL(request.url).origin;
};

export async function handleCallback(request, env = {}, fetcher = fetch) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!originPermitted(request)) return json({ error: 'Origin not permitted' }, 403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ error: 'Expected JSON' }, 415);
  if (env.CALLBACK_ENABLED !== 'true' || !env.CALLBACK_WEBHOOK_URL || !env.CALLBACK_WEBHOOK_TOKEN || !env.TURNSTILE_SECRET)
    return json({ error: 'Callback requests are not configured.' }, 503);
  if (typeof env.allowCallbackRequest !== 'function' || !await env.allowCallbackRequest(request))
    return json({ error: 'Please try again later.' }, 429);
  if (Number(request.headers.get('content-length') || 0) > 8000) return json({ error: 'Request too large' }, 413);

  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
  if (!body || body.schemaVersion !== 1 || !types.has(body.requestType) || !timings.has(body.timing) ||
    !supportedLocales.has(body.locale) || !body?.consent?.call) return json({ error: 'Invalid callback request' }, 400);
  const name = text(body.name, 120);
  const email = text(body.email, 160).toLowerCase();
  const phone = text(body.phone, 32);
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || !/^[+()0-9 .-]{7,32}$/.test(phone)) return json({ error: 'Invalid contact details' }, 400);
  let scheduledFor = null;
  if (body.timing === 'scheduled') {
    scheduledFor = new Date(body.scheduledFor || '');
    if (Number.isNaN(scheduledFor.getTime()) || scheduledFor <= new Date()) return json({ error: 'Scheduled time must be in the future' }, 400);
  }
  const verify = typeof env.verifyTurnstile === 'function'
    ? env.verifyTurnstile
    : async token => {
      const result = await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token, remoteip: request.headers.get('CF-Connecting-IP') || '' }),
        signal: AbortSignal.timeout(8000),
      });
      return result.ok && Boolean((await result.json()).success);
    };
  if (!await verify(body.turnstileToken)) return json({ error: 'Verification failed' }, 403);

  const payload = {
    schemaVersion: 1, source: 'headingsouth.ai', channel: 'voice', requestId: /^[a-zA-Z0-9_-]{8,80}$/.test(body.requestId || '') ? body.requestId : crypto.randomUUID(), requestType: body.requestType, timing: body.timing,
    scheduledFor: scheduledFor?.toISOString() || null, timezone: text(body.timezone, 100) || 'UTC', locale: body.locale,
    contact: { name, email, phone, company: text(body.company, 160) }, notes: text(body.notes, 1000),
    consent: { call: true, capturedAt: new Date().toISOString(), wordingVersion: 'callback-v1' },
    attribution: Object.fromEntries(Object.entries(body.attribution || {}).filter(([key, value]) => /^[a-z_]+$/i.test(key) && typeof value === 'string').slice(0, 12)),
    page: text(body.page, 240),
  };
  try {
    const result = await fetcher(env.CALLBACK_WEBHOOK_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.CALLBACK_WEBHOOK_TOKEN}` },
      body: JSON.stringify(payload), signal: AbortSignal.timeout(45000),
    });
    if (!result.ok) return json({ error: 'Callback request unavailable' }, 502);
    const saved=await result.json();
    if(saved.accepted!==true||!saved.contactId||!saved.dealId) return json({error:'Callback request was not confirmed'},502);
  } catch { return json({ error: 'Callback request unavailable' }, 502); }
  return json({ accepted: true }, 202);
}

const safeEqual = (left, right) => {
  if (typeof left !== 'string' || typeof right !== 'string' || left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
};

const hmacHex = async (secret, message) => {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return Array.from(new Uint8Array(signature)).map(byte => byte.toString(16).padStart(2, '0')).join('');
};

const signatureParts = value => Object.fromEntries(String(value || '').split(',').map(part => part.trim().split('=', 2)).filter(([key, item]) => key && item));

export async function handlePostCall(request, env = {}, fetcher = fetch, now = Date.now()) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ error: 'Expected JSON' }, 415);
  if (!env.ELEVENLABS_WEBHOOK_SECRET || !env.CALLBACK_POSTCALL_WEBHOOK_URL || !env.CALLBACK_WEBHOOK_TOKEN)
    return json({ error: 'Post-call processing is not configured.' }, 503);
  const rawBody = await request.text();
  if (rawBody.length > 256000) return json({ error: 'Request too large' }, 413);
  const { t: timestamp, v0: signature } = signatureParts(request.headers.get('ElevenLabs-Signature'));
  if (!timestamp || !signature || !/^\d+$/.test(timestamp) || Math.abs(now - Number(timestamp) * 1000) > 30 * 60 * 1000)
    return json({ error: 'Invalid signature' }, 401);
  const expected = await hmacHex(env.ELEVENLABS_WEBHOOK_SECRET, `${timestamp}.${rawBody}`);
  if (!safeEqual(expected, signature)) return json({ error: 'Invalid signature' }, 401);

  let event;
  try { event = JSON.parse(rawBody); } catch { return json({ error: 'Invalid JSON' }, 400); }
  if (!event || !['post_call_transcription', 'call_initiation_failure'].includes(event.type) || !event.data)
    return json({ error: 'Unsupported event' }, 400);

  const data = event.data;
  const analysis = data.analysis || {};
  const metadata = data.metadata || {};
  const vars=data.conversation_initiation_client_data?.dynamic_variables || {};
  const payload = {
    schemaVersion: 1,
    source: 'elevenlabs',
    requestId: text(vars.hs_request_id,80), locale: text(vars.journey_language,12),
    crm: {contactId:text(String(vars.hs_contact_id||''),32),dealId:text(String(vars.hs_deal_id||''),32)},
    transcript: Array.isArray(data.transcript)?data.transcript.filter(t=>['user','agent'].includes(t.role)&&typeof t.message==='string').slice(0,300).map(t=>({role:t.role,message:text(t.message,4000)})):[],
    type: event.type,
    eventTimestamp: event.event_timestamp || '',
    conversationId: data.conversation_id || '',
    agentId: data.agent_id || '',
    status: data.status || '',
    userId: data.conversation_initiation_client_data?.user_id || metadata.user_id || data.user_id || '',
    phone: metadata.phone_call?.external_number || metadata.phone_number || '',
    transcriptSummary: analysis.transcript_summary || analysis.summary || '',
    callSuccessful: analysis.call_successful,
    dataCollection: analysis.data_collection_results || analysis.data_collection || {},
    failureReason: data.failure_reason || data.error || '',
  };
  try {
    const result = await fetcher(env.CALLBACK_POSTCALL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.CALLBACK_WEBHOOK_TOKEN}` },
      body: JSON.stringify(payload), signal: AbortSignal.timeout(45000),
    });
    if (!result.ok) return json({ error: 'Post-call processing unavailable' }, 502);
  } catch { return json({ error: 'Post-call processing unavailable' }, 502); }
  return json({ accepted: true }, 200);
}

export default handleCallback;
