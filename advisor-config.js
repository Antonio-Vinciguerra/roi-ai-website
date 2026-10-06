// Public configuration only. Never put a secret here.
// The live assistant is served through the same secure Heading South origin.
window.ROI_ADVISOR_API_URL = '/api/advisor';
// This route accepts consent-led callback requests. It is intentionally served
// from the Heading South origin so provider credentials never reach the browser.
window.ROI_CALLBACK_API_URL = '/api/callback';
// Set this to the public Cloudflare Turnstile site key only at deployment time.
// An empty value keeps callback requests unavailable rather than unprotected.
window.ROI_TURNSTILE_SITE_KEY = '0x4AAAAAAFPQLl75FqSIq6hE';
