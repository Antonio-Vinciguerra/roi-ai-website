# ROI AI · the experience standard

The interface should demonstrate a way of thinking: from signal, through judgment, to a useful decision and a test of value.

## Preserve
- The approved hero: “Innovation built for measurable growth.”
- A completely clean hero composition without decorative diagrams.
- Warm paper, ink, mineral tones and quiet editorial imagery.
- Direct access, readable content, natural scrolling and native navigation.
- Technology as the means, ROI as the standard and growth as the outcome.

## Make the interaction earn its place
- A visitor action should reveal evidence, a distinction, a trade-off or a useful next step.
- Imagery provides context. Diagrams explain relationships. Neither impersonates live data.
- Show how working together produces a decision brief, a solution blueprint and a value review.
- Carry the selected example into the next page and into an explicitly opened advisor.
- Every sector has its own business questions; shared components should not produce identical content.
- Motion connects states without delaying navigation, hiding reading content or requiring an opening click.
- Touch and keyboard interactions must offer the same choices. Respect reduced motion.

## Be credible
All current scenarios are authored illustrations. There are no fabricated clients, performance figures or live intelligence feeds. The advisor remains a guided demo until its verified knowledge and server-side AI/voice integrations are ready.

## Previous prototype verification (before the September 13 motion revision)
- 21 automated tests covering the prior foundation plus scenarios, labels, context and primary text contrast.
- Interactive sector and scenario selection, engagement deliverables, build/buy/integrate/stop choices, scenario continuity and advisor context checked in the browser.
- All eight detail pages checked for horizontal overflow at 320px.
- Mobile scenario/advisor interaction checked at 390px.
- Real microphone conversations, physical-device assistive technology and live AI remain release gates.

## Earlier scene prototype · September 13, 2026 (superseded)

The mobile experience should feel composed for a phone. Reduce repeated vertical spacing, combine related process controls and deliverables, and keep the advisor clear of the reading area.

Capabilities use one photographic scene with three perspectives. When the complete scene fits the viewport, native scrolling advances the selection inside a finite sticky stage. Buttons remain available. Short screens, enlarged layouts and reduced motion use an unpinned presentation. Without JavaScript, all three capability articles and their links remain visible.

Use native CSS view timelines for gradual arrivals and image depth, with a readable default on unsupported browsers. Use cross-document View Transitions for a capability image to carry into its detail page. Avoid wheel interception, touch smoothing, page gates and artificial navigation delays. Reduced motion removes the spatial transitions.

Existing photography is presented at a larger scale and with a lighter treatment. Decorative SVG diagrams have been removed from rendered capability and sector imagery. Scenario choices are clearly controls, not spatial measurements.

Research informing the implementation:

- [WebKit: Safari 26.4 threaded scroll animations](https://webkit.org/blog/17862/webkit-features-for-safari-26-4/): native view/scroll timelines can run on the compositor.
- [Chrome: cross-document View Transitions](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document): continuity between real document routes without replacing navigation.
- [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/): evaluated for elaborate timelines; this revision does not require that dependency.
- [Lenis](https://github.com/darkroomengineering/lenis): evaluated for scroll smoothing; preserve native touch and trackpad behaviour for this site.

Validation for this revision: production build, existing automated suite, link/asset checks and script syntax checks. The supplied screenshots informed the redesign; the new motion has not yet been visually verified on a physical iPhone.

## Continuous landscape revision

The hero now leads directly into three full-width photographic chapters: Operate, Grow and Invest. Each is a real anchor in normal document flow, with its own service link. A sticky landscape blends continuously as successive chapters enter; scrolling backward reverses that same blend. There are no capability tabs, timed scene switches, input interception or screen-height eligibility tests.

The first reading is lighter: problem exploration, engagement deliverables, vendor-choice reasoning and sector scenarios remain available in native disclosures. All five sectors also have direct, always-visible links. The approved headline, palette, final invitation and advisor are preserved. Service-page process controls remain unchanged.

Reduced motion uses a stationary background and unpinned content. Text enlargement can increase chapter height naturally; no reading content is constrained to a fixed viewport height. A no-script visitor still has all capability text, service links, sector links and disclosures.

Validation: 25 automated tests cover the existing site plus continuous blend boundaries, small/large viewport calculations, static chapter access, navigation targets and the absence of scroll interception. A production build and script syntax checks are required before publication. This revision has not had browser visual QA or physical-iPhone testing; those remain necessary before a final design sign-off.

## Desktop-width correction and text arrival

The legacy capability gallery declared three grid tracks. Setting the new story to `display:grid` accidentally reactivated those tracks. The story now explicitly declares one full-width track, zero gap and full-width overlapping layers; the more specific selector also overrides mobile gallery defaults.

Opening text resolves softly from slight blur and a small vertical offset, with a short stagger between the introduction, headline and supporting copy. Scroll text uses the same visual treatment through native view timelines, with an IntersectionObserver/Web Animations fallback. Old parent-level homepage entrances are disabled to avoid compounded motion. Reduced motion shows all text immediately. No text masking or clipping is introduced.

Two regression checks cover the explicit full-width layout declarations and text-animation fallbacks (27 automated tests total). The user's desktop screenshot is the evidence for the reported defect; this fix has not been browser-visually tested.

## Spatial reveal refinement

The previous opacity/blur entrances are replaced by spatial text reveals: explicit headline lines rise through a clipping boundary with a slight perspective turn. Body paragraphs remain naturally wrapping units. Opening lines take approximately 1.9 seconds with a small stagger; scrolling immediately hands control back to the visitor. Later headings and copy, including the eight service/sector pages, use the same reversible entry/reading/exit rhythm. The central reading zone is fully revealed and stationary.

Photography now reveals upward through a feathered image mask rather than only crossfading, with restrained vertical depth. There is a clipping fallback where image masks are unavailable. Native scrolling, the full-width grid fix, approved words, colours and advisor are preserved.

Only presentational, non-interactive text is wrapped. Emphasis stays in the document; no duplicate screen-reader text or per-letter fragmentation is introduced. Reduced motion restores original nodes, focus exposes linked headings, and print styles show all text. Responsive process line breaks are rebuilt on breakpoint changes. All original content is readable if scripts fail or are disabled.

29 automated checks cover bounded and reversible motion, the readable middle across short/tall viewports, delivery to all nine pages, retained navigation and the earlier width regression. No browser visual QA or physical-device validation was performed in this turn.

## Stationary dissolve — supersedes the text roll

The user clarified that text should materialise in place, not arrive from below. The text-roll wrappers, clipping and perspective have been removed entirely. Original text nodes and natural line wrapping are now untouched. Opening text approaches full opacity over approximately two seconds with a small headline/supporting-copy stagger. Scroll-controlled opacity has time-based smoothing, so fast scrolling cannot abruptly switch text on; the central reading zone stays fully visible. Focus, reduced motion and print reveal text immediately. The photographic motion and all layout/copy decisions are unchanged.

Existing tests now check stationary opacity, timing, no text-node mutation, and the maintained reading zone. Visual browser/device review remains outstanding.

## Overlapping word formation

The user approved trying words forming in overlapping groups, with timing as the main design concern. Text now materialises in pairs, with a bounded stagger across each sentence and a restrained soft-focus-to-sharp effect. Words never translate or rotate. The opening is slightly more gradual than scrolling; the same treatment reaches the later homepage sections and service pages. Long paragraphs do not incur increasing delays.

Whitespace, emphasis and explicit line breaks are retained. Words are rendered once; reduced motion restores the original nodes, focus reveals linked headings immediately, and print remains fully readable. Filters are removed from settled words. Existing tests cover the formation endpoints and bounded timing for both short headlines and long paragraphs. Visual timing still requires desktop and physical-mobile review.

## Downward-only pacing and image continuity

The opening time constant increases from 720 to 960 ms; subsequent text uses 780 ms. Each text block begins a complete reveal on entering the reading area, then remains visible for the rest of that page visit. Pausing no longer leaves a partly revealed block. Upward scrolling completes visible text immediately and does not replay the reveal.

Photographs now use a time-led dissolve rather than a masked wipe, keyed to the actual chapter copy rather than the chapter's surrounding whitespace. First downward visits dissolve in; upward returns and revisits restore the matching image without an entrance replay. Reduced motion and no-script fallbacks remain readable. The shared logic applies at both mobile and desktop widths.

Validation remains automated/source-level; physical-device visual timing has not been checked.
