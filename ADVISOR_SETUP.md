# Advisor integration

The delivered website runs in clearly labelled guided-demo mode. Both typing and browser voice preview are available. There is no live model or knowledge base connected.

## Never put a key in the website or GitHub
Set OPENAI_API_KEY, OPENAI_MODEL and ADVISOR_ENABLED in a server host's secret/environment settings. Do not paste a secret into advisor-config.js, client JavaScript, a Git remote, or a committed .env file.

## Text integration
api/advisor.js exports handleAdvisor(Request, env, fetcher). It is a standards-based Request/Response handler, not an Express/Vercel handler; adapt it explicitly to your chosen server host.
The static Sites build deliberately excludes this file and does not create an API route.

1. Mount the handler at a same-origin /api/advisor route.
2. Supply a real shared rate limiter as env.allowRequest(request), with IP/session controls, overall budget caps and bot protection. The handler fails closed without it. Origin validation alone is not authentication.
3. Configure the server secrets and choose a currently supported model after checking its cost/latency tradeoff.
4. Add verified knowledge retrieval on the server and evaluate answers before release. The current persona has no company knowledge beyond the approved positioning.
5. Change window.ROI_ADVISOR_API_URL to '/api/advisor' only after the server is deployed and tested.
6. Verify unhappy paths, timeouts, provider limits, prompt injection, privacy and handoff. Live failures never fall back silently to demo replies.

The handler accepts at most eight short user/assistant messages, bounds request bytes, rejects browser-provided system instructions, keeps the persona server-side, limits output and disables response storage. Conversation text is still sent to the provider when live mode is enabled; publish an appropriate privacy notice.

## Future Realtime voice
Keep voice as a parallel mode of the same advisor. Use a user-initiated WebRTC connection with a server-side session setup route; never send a standard OpenAI API key to the browser. The server should apply the same persona, verified knowledge tools, origin checks, durable rate limits and budget policy.
Follow the current OpenAI Realtime calls documentation for server-mediated SDP exchange or short-lived client credentials. Track every microphone stream and peer connection, stop tracks and close the connection on End/close/page exit, expose mute and interruption controls, and retain a visible text transcript. Add a deliberate consent step before connecting audio.

Current browser voice preview is not equivalent to Realtime. Browser and OS support varies and recognition can use a browser-vendor service. It must not be marketed as guaranteed accessible real-time voice.

## References
- [OpenAI Responses API](https://developers.openai.com/api/reference/typescript/resources/beta/subresources/responses/methods/create)
- [OpenAI Realtime calls](https://developers.openai.com/api/reference/typescript/resources/realtime/subresources/calls/methods/create)
