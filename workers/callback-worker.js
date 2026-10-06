const allowedLocales = new Set(['en', 'it', 'fr', 'es', 'pt-BR']);
const requestTypes = new Set(['discovery', 'support', 'information']);
const timings = new Set(['now', 'scheduled']);

const respond = (body, status = 200) => Response.json(body, {
  status,
  headers: { 'Cache-Control': 'no-store' },
});

const clean = (value, maximum) => typeof value === 'string'
  ? value.trim().replace(/[<>]/g, '').slice(0, maximum)
  : '';

async function digest(value) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function withinRateLimit(request, context) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const key = 'https://callback-rate-limit.internal/' + await digest(ip);
  const now = Date.now();
  const cached = await caches.default.match(key);
  let counter = cached ? await cached.json().catch(() => null) : null;
  if (!counter || now - counter.started > 600000) counter = { started: now, count: 0 };
  counter.count += 1;
  if (counter.count > 5) return false;
  context.waitUntil(caches.default.put(key, new Response(JSON.stringify(counter), {
    headers: { 'Cache-Control': 'max-age=600' },
  })));
  return true;
}

async function handleCallback(request, env, context) {
  if (request.method !== 'POST') return respond({ error: 'Method not allowed' }, 405);
  if (request.headers.get('origin') !== new URL(request.url).origin) {
    return respond({ error: 'Origin not permitted' }, 403);
  }
  if (!request.headers.get('content-type')?.startsWith('application/json')) {
    return respond({ error: 'Expected JSON' }, 415);
  }
  if (env.CALLBACK_ENABLED !== 'true' || !env.CALLBACK_WEBHOOK_URL || !env.CALLBACK_WEBHOOK_TOKEN || !env.TURNSTILE_SECRET) {
    return respond({ error: 'Callback requests are not configured.' }, 503);
  }
  if (!await withinRateLimit(request, context)) return respond({ error: 'Please try again later.' }, 429);
  if (Number(request.headers.get('content-length') || 0) > 8000) return respond({ error: 'Request too large' }, 413);

  let body;
  try { body = await request.json(); } catch { return respond({ error: 'Invalid JSON' }, 400); }
  if (!body || body.schemaVersion !== 1 || !requestTypes.has(body.requestType)
    || !timings.has(body.timing) || !allowedLocales.has(body.locale) || !body?.consent?.call) {
    return respond({ error: 'Invalid callback request' }, 400);
  }

  const name = clean(body.name, 120);
  const email = clean(body.email, 160).toLowerCase();
  const phone = clean(body.phone, 32);
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || !/^[+()0-9 .-]{7,32}$/.test(phone)) {
    return respond({ error: 'Invalid contact details' }, 400);
  }

  let scheduledFor = null;
  if (body.timing === 'scheduled') {
    scheduledFor = new Date(body.scheduledFor || '');
    if (Number.isNaN(scheduledFor.getTime()) || scheduledFor <= new Date()) {
      return respond({ error: 'Scheduled time must be in the future' }, 400);
    }
  }

  const verification = new FormData();
  verification.set('secret', env.TURNSTILE_SECRET);
  verification.set('response', body.turnstileToken || '');
  verification.set('remoteip', request.headers.get('CF-Connecting-IP') || '');
  let verified = false;
  try {
    const check = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', body: verification, signal: AbortSignal.timeout(8000),
    });
    verified = check.ok && (await check.json()).success === true;
  } catch { /* rejected below */ }
  if (!verified) return respond({ error: 'Verification failed' }, 403);

  const payload = {
    schemaVersion: 1,
    source: 'headingsouth.ai',
    requestType: body.requestType,
    timing: body.timing,
    scheduledFor: scheduledFor?.toISOString() || null,
    timezone: clean(body.timezone, 100) || 'UTC',
    locale: body.locale,
    contact: { name, email, phone, company: clean(body.company, 160) },
    notes: clean(body.notes, 1000),
    consent: { call: true, capturedAt: new Date().toISOString(), wordingVersion: 'callback-v1' },
    attribution: Object.fromEntries(Object.entries(body.attribution || {})
      .filter(([key, value]) => /^[a-z_]+$/i.test(key) && typeof value === 'string').slice(0, 12)),
    page: clean(body.page, 240),
  };
  try {
    const upstream = await fetch(env.CALLBACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + env.CALLBACK_WEBHOOK_TOKEN },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });
    if (!upstream.ok) return respond({ error: 'Callback request unavailable' }, 502);
  } catch { return respond({ error: 'Callback request unavailable' }, 502); }
  return respond({ accepted: true }, 202);
}

const safeEqual = (left, right) => {
  if (typeof left !== 'string' || typeof right !== 'string' || left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
};

async function hmacHex(secret, message) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return Array.from(new Uint8Array(signature)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

const signatureParts = (value) => Object.fromEntries(String(value || '').split(',').map((part) => part.trim().split('=', 2)).filter(([key, item]) => key && item));

async function handlePostCall(request, env) {
  if (request.method !== 'POST') return respond({ error: 'Method not allowed' }, 405);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return respond({ error: 'Expected JSON' }, 415);
  if (!env.ELEVENLABS_WEBHOOK_SECRET || !env.CALLBACK_POSTCALL_WEBHOOK_URL || !env.CALLBACK_WEBHOOK_TOKEN) {
    return respond({ error: 'Post-call processing is not configured.' }, 503);
  }
  const rawBody = await request.text();
  if (rawBody.length > 256000) return respond({ error: 'Request too large' }, 413);
  const { t: timestamp, v0: signature } = signatureParts(request.headers.get('ElevenLabs-Signature'));
  if (!timestamp || !signature || !/^\d+$/.test(timestamp) || Math.abs(Date.now() - Number(timestamp) * 1000) > 30 * 60 * 1000) {
    return respond({ error: 'Invalid signature' }, 401);
  }
  const expected = await hmacHex(env.ELEVENLABS_WEBHOOK_SECRET, `${timestamp}.${rawBody}`);
  if (!safeEqual(expected, signature)) return respond({ error: 'Invalid signature' }, 401);

  let event;
  try { event = JSON.parse(rawBody); } catch { return respond({ error: 'Invalid JSON' }, 400); }
  if (!event || !['post_call_transcription', 'call_initiation_failure'].includes(event.type) || !event.data) {
    return respond({ error: 'Unsupported event' }, 400);
  }
  const data = event.data;
  const analysis = data.analysis || {};
  const metadata = data.metadata || {};
  const payload = {
    schemaVersion: 1, source: 'elevenlabs', type: event.type, eventTimestamp: event.event_timestamp || '',
    conversationId: data.conversation_id || '', agentId: data.agent_id || '', status: data.status || '',
    userId: metadata.user_id || data.user_id || '', phone: metadata.phone_call?.external_number || metadata.phone_number || '',
    transcriptSummary: analysis.transcript_summary || analysis.summary || '', callSuccessful: analysis.call_successful,
    dataCollection: analysis.data_collection_results || analysis.data_collection || {}, failureReason: data.failure_reason || data.error || '',
  };
  try {
    const upstream = await fetch(env.CALLBACK_POSTCALL_WEBHOOK_URL, {
      method: 'POST',
      // The n8n endpoint uses the same private bearer token as the intake route.
      // This avoids creating a second long-lived secret while retaining separate
      // HMAC verification for the ElevenLabs-to-Worker leg.
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + env.CALLBACK_WEBHOOK_TOKEN },
      body: JSON.stringify(payload), signal: AbortSignal.timeout(10000),
    });
    if (!upstream.ok) return respond({ error: 'Post-call processing unavailable' }, 502);
  } catch { return respond({ error: 'Post-call processing unavailable' }, 502); }
  return respond({ accepted: true }, 200);
}

export default {
  async fetch(request, env, context) {
    const path = new URL(request.url).pathname;
    if (path === '/api/callback') return handleCallback(request, env, context);
    if (path === '/api/callback/post-call') return handlePostCall(request, env);
    return new Response('Not found', { status: 404 });
  },
};
