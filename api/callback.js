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
    schemaVersion: 1, source: 'headingsouth.ai', requestType: body.requestType, timing: body.timing,
    scheduledFor: scheduledFor?.toISOString() || null, timezone: text(body.timezone, 100) || 'UTC', locale: body.locale,
    contact: { name, email, phone, company: text(body.company, 160) }, notes: text(body.notes, 1000),
    consent: { call: true, capturedAt: new Date().toISOString(), wordingVersion: 'callback-v1' },
    attribution: Object.fromEntries(Object.entries(body.attribution || {}).filter(([key, value]) => /^[a-z_]+$/i.test(key) && typeof value === 'string').slice(0, 12)),
    page: text(body.page, 240),
  };
  try {
    const result = await fetcher(env.CALLBACK_WEBHOOK_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.CALLBACK_WEBHOOK_TOKEN}` },
      body: JSON.stringify(payload), signal: AbortSignal.timeout(10000),
    });
    if (!result.ok) return json({ error: 'Callback request unavailable' }, 502);
  } catch { return json({ error: 'Callback request unavailable' }, 502); }
  return json({ accepted: true }, 202);
}

export default handleCallback;
