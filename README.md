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

Build output goes into dist; it is deliberately excluded from Git. Only public assets are copied there. Original image files are retained; deployed pages use optimised WebP versions.

## Hosting
.openai/hosting.json identifies the owner-private Sites preview and dist as its static directory. This does not connect a live AI server. GitHub Pages can also serve dist, but API secrets need a separate server-capable host and same-origin routing.

See DEVELOPMENT_NOTES.md for the audit and release gates, and ADVISOR_SETUP.md before enabling live AI or voice.
