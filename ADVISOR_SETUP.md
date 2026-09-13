# ROI AI Advisor — deployment handoff

The current advisor is a polished local demo. It uses prepared responses until a secure endpoint is connected.

## Persona

The live persona is in `advisor-persona.js`. It is designed to behave as a senior B2B AI consultant: curious, commercially literate, precise and useful without pressure. Change this file as the ROI AI point of view and knowledge base develop.

## Secure OpenAI connection

1. Deploy the site to a host with serverless functions (for example, Vercel, Netlify or Cloudflare Workers). GitHub Pages alone is static and cannot safely store an OpenAI API key.
2. Add `OPENAI_API_KEY` and `OPENAI_MODEL` from `.env.example` in that host’s server-side environment settings.
3. Adapt `api/advisor.js` to the host’s function format if necessary and deploy it as `/api/advisor`.
4. Set `window.ROI_ADVISOR_API_URL = '/api/advisor';` in `advisor-config.js`.

Never enter an OpenAI key into `advisor-config.js`, `chat.js`, or any other browser-facing file.

## Knowledge base next

Add only approved ROI AI content: service definitions, sector material, decision frameworks, FAQs, policies and verified case evidence. The advisor should cite or link to the source material when it answers factual questions.
