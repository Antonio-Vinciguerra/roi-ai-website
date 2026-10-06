import test from 'node:test';
import assert from 'node:assert/strict';
import { handleCallback } from '../api/callback.js';

const env = {
  CALLBACK_ENABLED: 'true', CALLBACK_WEBHOOK_URL: 'https://n8n.example/webhook/callback', CALLBACK_WEBHOOK_TOKEN: 'test-token', TURNSTILE_SECRET: 'test-secret',
  allowCallbackRequest: async () => true, verifyTurnstile: async token => token === 'human-token',
};
const valid = () => ({ schemaVersion: 1, requestType: 'discovery', timing: 'now', locale: 'en', name: 'Alex Morgan', email: 'alex@example.com', phone: '+44 7700 900123', company: 'Northstar Ltd', notes: 'Interested in an AI roadmap.', timezone: 'Europe/London', page: '/index.html', turnstileToken: 'human-token', consent: { call: true }, attribution: { utm_source: 'google' } });
const request = (body = valid(), origin = 'https://headingsouth.ai') => new Request('https://headingsouth.ai/api/callback', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('callback endpoint fails closed until every server secret and rate limiter is configured', async () => {
  assert.equal((await handleCallback(request(), {})).status, 503);
  assert.equal((await handleCallback(request(), { ...env, allowCallbackRequest: null })).status, 429);
});
test('callback endpoint rejects cross-origin, unverified and incomplete requests', async () => {
  assert.equal((await handleCallback(request(valid(), 'https://elsewhere.example'), env)).status, 403);
  assert.equal((await handleCallback(request({ ...valid(), turnstileToken: 'bot' }), env)).status, 403);
  assert.equal((await handleCallback(request({ ...valid(), phone: 'invalid' }), env)).status, 400);
  assert.equal((await handleCallback(request({ ...valid(), consent: { call: false } }), env)).status, 400);
});
test('callback endpoint forwards only validated consent-led payloads to the protected workflow', async () => {
  let sent;
  const response = await handleCallback(request(), env, async (url, init) => {
    assert.equal(url, env.CALLBACK_WEBHOOK_URL);
    assert.equal(init.headers.Authorization, 'Bearer test-token');
    sent = JSON.parse(init.body);
    return new Response(null, { status: 204 });
  });
  assert.equal(response.status, 202);
  assert.equal(sent.contact.email, 'alex@example.com');
  assert.equal(sent.requestType, 'discovery');
  assert.equal(sent.consent.call, true);
  assert.equal(sent.turnstileToken, undefined);
});
test('scheduled callbacks must have a future time', async () => {
  const response = await handleCallback(request({ ...valid(), timing: 'scheduled', scheduledFor: '2020-01-01T10:00:00.000Z' }), env);
  assert.equal(response.status, 400);
});
