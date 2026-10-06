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

export default {
  async fetch(request, env, context) {
    if (new URL(request.url).pathname !== '/api/callback') return new Response('Not found', { status: 404 });
    return handleCallback(request, env, context);
  },
};
