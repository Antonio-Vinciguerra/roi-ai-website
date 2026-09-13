import { textDissolveFrame, approachOpacity } from './scene-math.mjs';

export function installTextDissolve() {
  // Utility/error pages without the motion stylesheet keep their original HTML.
  if (!document.querySelector('link[href="reveal.css"]')) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const records = [...document.querySelectorAll('main h1,main h2,main h3,main p,.hero>.eyebrow')]
    .filter(el => !el.closest('details,[data-lens],.approach-workbench,footer,noscript,[aria-live]') &&
      !el.matches('.section-label,.lens-disclaimer') && !el.querySelector('button,a,input'))
    .map(el => ({el, opacity:1, target:1, delay:0, hero:!!el.closest('.hero')}));
  let frame = 0;
  let previousTime = 0;
  let firstRun = true;
  let headerHeight = document.querySelector('.site-header')?.offsetHeight || 78;

  function update(time) {
    frame = 0;
    if (reduced.matches || document.hidden) { previousTime = 0; return; }
    const dt = previousTime ? Math.min(64, time - previousTime) : 16;
    previousTime = time;
    const viewport = document.documentElement.clientHeight;
    let settling = false;
    // Batch geometry reads before opacity writes. Text never moves or gets split.
    for (const record of records) {
      const rect = record.el.getBoundingClientRect();
      const focused = record.el.contains(document.activeElement) || record.el.closest('a:focus');
      record.target = focused ? 1 : textDissolveFrame(rect.top, rect.height, viewport, headerHeight, record.hero);
      if (time < record.delay) record.target = 0;
      record.opacity = focused ? 1 : approachOpacity(record.opacity, record.target, dt, record.hero ? 680 : 520);
      if (Math.abs(record.opacity - record.target) < .002) record.opacity = record.target;
      else settling = true;
      if (time < record.delay) settling = true;
    }
    for (const record of records) record.el.style.setProperty('--text-opacity', record.opacity.toFixed(4));
    if (settling) frame = requestAnimationFrame(update);
    else previousTime = 0;
  }
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  function configure() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0; previousTime = 0;
    const opening = firstRun && scrollY < 40 && !location.hash;
    const now = performance.now();
    const viewport = document.documentElement.clientHeight;
    for (const record of records) {
      record.el.style.removeProperty('--text-opacity');
      record.el.classList.toggle('text-dissolve', !reduced.matches);
      const rect = record.el.getBoundingClientRect();
      record.opacity = opening && record.hero ? 0 : textDissolveFrame(rect.top, rect.height, viewport, headerHeight, record.hero);
      record.delay = opening && record.hero ? now + (record.el.matches('h1') ? 100 : record.el.closest('.hero-note') ? 300 : 0) : 0;
      if (!reduced.matches) record.el.style.setProperty('--text-opacity', record.opacity);
    }
    document.body.classList.toggle('roi-dissolve', !reduced.matches);
    firstRun = false;
    if (!reduced.matches) schedule();
  }
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', () => {
    headerHeight = document.querySelector('.site-header')?.offsetHeight || 78;
    schedule();
  }, {passive:true});
  document.addEventListener('focusin', () => {
    for (const record of records) {
      if (record.el.contains(document.activeElement) || record.el.closest('a:focus')) {
        record.delay = 0; record.opacity = 1;
      }
    }
    schedule();
  });
  document.addEventListener('visibilitychange', () => {
    previousTime = 0;
    if (!document.hidden) schedule();
  });
  addEventListener('pageshow', schedule);
  reduced.addEventListener('change', configure);
  document.fonts.ready.then(schedule);
  configure();
}
