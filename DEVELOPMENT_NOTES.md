# ROI AI · flagship refinement

## What changed
- Preserved the approved headline, brand thesis, homepage story, all three capabilities and all five sectors.
- Replaced accumulated visual overrides with shared typography, spacing, mineral colour and responsive rules.
- Removed delayed click navigation and full-screen transition overlays. Native links now retain Back, keyboard and modified-click behaviour; supporting browsers get a brief crossfade.
- Generated all eight detail pages as complete HTML from one content source. They remain readable without JavaScript.
- Kept the existing editorial images; optimised their delivered copies to WebP. Fonts are self-hosted with their licences.
- Unified text and browser voice preview in a keyboard-accessible dialog. Escape restores focus; closing or changing modes stops voice. No microphone access is requested on load.
- Demo responses are explicitly labelled; greetings no longer receive the generic consulting fallback.
- Replaced the insecure/incomplete server example with a disabled-by-default, validated server handler. It requires a real deployment rate limiter and parses raw OpenAI Responses output.

## Architecture decision
A static content site does not need a React runtime to be maintainable. This build has zero package dependencies: shared data, shared styling, real HTML routes, and an independently testable advisor boundary. Use a framework when a CMS, authenticated product or richer application state creates a concrete need.

## Verification completed
- 13 automated tests pass: routes and local assets, full HTML content, locked copy, reduced-motion rules, image budget, demo behaviour and server-handler validation/error paths.
- Browser checks at desktop (1440px and the default wider viewport), 390px and 320px: no measured horizontal overflow on the tested homepage and detail layouts.
- Visually checked hero, sector overview, Agrifood and Finance detail pages and the advisor on desktop/mobile.
- Verified mobile menu, browser Back, greeting reply, chat/voice tab keyboard navigation, Escape dismissal and focus restoration.
- No browser console warnings or errors observed in the tested paths.
- Microphone recording, physical-device screen readers and a real OpenAI connection were not tested.

## Remaining release gates
This is a refined prototype, not an assertion that the complete business is ready to launch.
- Connect verified company knowledge, approved pricing/contact details and a real handoff process.
- Deploy the server handler with secrets, durable abuse/rate controls, request budgeting and monitoring.
- Implement and test OpenAI Realtime voice against real browsers/devices. Current voice is browser speech recognition plus speech synthesis, not Realtime.
- Test microphones, audio permissions, interruptions, mobile keyboards and screen readers on physical devices.
- Approve privacy/consent wording and data-retention policies before handling customer conversations.
- Measure field performance after hosting; no invented Lighthouse scores or client results are presented.
- The old separate chat/voice and client-rendered detail files are superseded; Git retains their history.
