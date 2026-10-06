import test from 'node:test';
import assert from 'node:assert/strict';
import { handleCallback, handlePostCall } from '../api/callback.js';

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

test('post-call events require a fresh valid ElevenLabs HMAC and forward a minimised record', async () => {
  const raw = JSON.stringify({ type: 'post_call_transcription', event_timestamp: 123, data: {
    conversation_id: 'conv_1', agent_id: 'agent_1', status: 'done',
    metadata: { user_id: 'alex@example.com', phone_call: { external_number: '+447700900123' } },
    analysis: { transcript_summary: 'Interested in a discovery call.', data_collection_results: { disposition: 'qualified' } },
  } });
  const timestamp = Math.floor(Date.now() / 1000);
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode('eleven-secret'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const bytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${raw}`));
  const signature = Array.from(new Uint8Array(bytes)).map(byte => byte.toString(16).padStart(2, '0')).join('');
  let sent;
  const response = await handlePostCall(new Request('https://headingsouth.ai/api/callback/post-call', { method: 'POST', headers: { 'Content-Type': 'application/json', 'ElevenLabs-Signature': `t=${timestamp},v0=${signature}` }, body: raw }), {
    ELEVENLABS_WEBHOOK_SECRET: 'eleven-secret', CALLBACK_POSTCALL_WEBHOOK_URL: 'https://n8n.example/webhook/post-call', CALLBACK_WEBHOOK_TOKEN: 'post-token',
  }, async (url, init) => {
    assert.equal(url, 'https://n8n.example/webhook/post-call');
    assert.equal(init.headers.Authorization, 'Bearer post-token');
    sent = JSON.parse(init.body);
    return new Response(null, { status: 204 });
  });
  assert.equal(response.status, 200);
  assert.equal(sent.userId, 'alex@example.com');
  assert.equal(sent.transcriptSummary, 'Interested in a discovery call.');
  assert.equal(sent.conversationId, 'conv_1');
});

test('post-call events reject invalid signatures', async () => {
  const response = await handlePostCall(new Request('https://headingsouth.ai/api/callback/post-call', { method: 'POST', headers: { 'Content-Type': 'application/json', 'ElevenLabs-Signature': 't=1,v0=bad' }, body: '{}' }), {
    ELEVENLABS_WEBHOOK_SECRET: 'eleven-secret', CALLBACK_POSTCALL_WEBHOOK_URL: 'https://n8n.example/webhook/post-call', CALLBACK_WEBHOOK_TOKEN: 'post-token',
  }, fetch, Date.now());
  assert.equal(response.status, 401);
});
