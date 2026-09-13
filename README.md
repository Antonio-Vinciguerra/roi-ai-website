# ROI AI website

A calm, responsive static flagship prototype. The headline and agreed positioning are preserved. There are eight fully rendered capability/sector pages and one shared text/voice demo advisor.

## Run
Use Node.js 22 or newer. There are no package dependencies to install.

```sh
npm run build
npm test
npm run dev
```

Open http://127.0.0.1:4173. Preview the built site over HTTP, not the source HTML via file://. The browser advisor imports a small module and microphone features depend on browser security rules.

## Edit
- index.html: homepage narrative
- content.mjs: all detail-page copy
- style.css: shared visual system
- scripts/build.mjs: static page templates and asset allowlist
- advisor.js / advisor.css: shared accessible conversation panel
- advisor-demo.mjs: clearly labelled scripted replies
- advisor-persona.js and api/advisor.js: future server-only integration
- experience-data.mjs: 21 illustrative business scenarios, with no live or client data
- experience-render.mjs: shared interactive experience markup and homepage modules
- experience.js / experience.css: signal-to-decision interaction system
- motion.js / motion.css: responsive scene choreography, compact mobile process and capability transitions

The homepage uses explicit template markers for its shared modules. The build fills them; the generated pages retain a readable default example without JavaScript. Sector selection updates the example, and the chosen scenario travels in the link to its detail page. Advisor handoff carries the selected example only after the visitor opens the conversation.

Build output goes into dist; it is deliberately excluded from Git. Only public assets are copied there. Original image files are retained; deployed pages use optimised WebP versions.

## Hosting
.openai/hosting.json identifies the existing public Sites preview and dist as its static directory. The public GitHub Pages website is https://antonio-vinciguerra.github.io/roi-ai-website/ and publishes the built files from the gh-pages branch. The main branch contains source; rebuilding and publishing gh-pages is required after changing source. These static deployments do not connect a live AI server; API secrets need a separate server-capable host and same-origin routing.

See DEVELOPMENT_NOTES.md for the audit and release gates, and ADVISOR_SETUP.md before enabling live AI or voice.
