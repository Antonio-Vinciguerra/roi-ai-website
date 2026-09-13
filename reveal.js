import { approachOpacity, wordFormation } from './scene-math.mjs';
import { readingLines, lineFormation, readingFloor } from './reveal-timing.mjs';

export function installTextDissolve() {
  // Utility/error pages without the motion stylesheet keep their original HTML.
  if (!document.querySelector('link[href="reveal.css"]')) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const records = [...document.querySelectorAll('main h1,main h2,main h3,main p,.hero>.eyebrow')]
    .filter(el => !el.closest('.detail-hero,details,[data-lens],.approach-workbench,footer,noscript,[aria-live]') &&
      !el.matches('.section-label,.lens-disclaimer') && !el.querySelector('button,a,input'))
    .map(el => ({el, opacity:1, target:1, delay:0, seen:false, hero:!!el.closest('.hero'), note:!!el.closest('.hero-note'), headline:el.matches('.hero-title'), lines:null, words:[], original:[...el.childNodes].map(node => node.cloneNode(true))}));
  let frame = 0;
  let previousTime = 0;
  let firstRun = true;
  let lastScroll = Math.max(0, scrollY);
  let direction = 1;
  let headerHeight = document.querySelector('.site-header')?.offsetHeight || 78;

  function prepareWords(record) {
    record.el.replaceChildren(...record.original.map(node => node.cloneNode(true)));
    record.words = [];
    record.lastPaint = null;
    if (reduced.matches) return;
    const walker = document.createTreeWalker(record.el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const fragment = document.createDocumentFragment();
      for (const token of node.textContent.match(/\s+|\S+/g) || []) {
        if (/^\s+$/.test(token)) fragment.append(document.createTextNode(token));
        else {
          const word = document.createElement('span');
          word.className = 'formation-word';
          word.textContent = token;
          record.words.push(word);
          fragment.append(word);
        }
      }
      node.replaceWith(fragment);
    }
  }

  function measureHeadline(record) {
    if (!record.headline || !record.words.length) return;
    record.lines = readingLines(record.words.map(word => word.getBoundingClientRect()));
    record.lastPaint = null;
  }
  function refreshLines() {
    for (const record of records) {
      if (!record.headline) continue;
      measureHeadline(record);
      paint(record);
    }
    schedule();
  }

  function paint(record) {
    if (record.lastPaint === record.opacity) return;
    record.lastPaint = record.opacity;
    const blur = record.hero ? (record.el.matches('h1,h2,h3') ? 2.8 : 1.6) : (record.el.matches('h1,h2,h3') ? 1 : .45);
    record.words.forEach((word, index) => {
      const opacity = record.headline && record.lines
        ? lineFormation(record.opacity, record.lines.order[index], record.lines.count)
        : wordFormation(record.opacity, index, record.words.length);
      word.style.setProperty('--word-opacity', opacity.toFixed(4));
      word.style.setProperty('--word-filter', opacity > .999 || opacity < .001 ? 'none' : 'blur(' + (blur * (1 - opacity) ** 2).toFixed(3) + 'px)');
    });
  }

  function update(time) {
    frame = 0;
    if (reduced.matches || document.hidden) { previousTime = 0; return; }
    const dt = previousTime ? Math.min(64, time - previousTime) : 16;
    previousTime = time;
    const viewport = document.documentElement.clientHeight;
    let settling = false;
    // Batch geometry reads before writes; overlapping word groups stay in place.
    for (const record of records) {
      const rect = record.el.getBoundingClientRect();
      const focused = record.el.contains(document.activeElement) || record.el.closest('a:focus');
      const reached = rect.top < viewport * (record.hero ? .94 : .98);
      if (!record.seen && reached) {
        record.seen = true;
        // Returning upward, jumping past content or focusing it exposes it
        // immediately. Downward entry starts one complete, time-led reveal.
        if (direction < 0 || rect.bottom < headerHeight || focused) record.opacity = 1;
      }
      record.target = record.seen || focused ? 1 : 0;
      if (time < record.delay) record.target = 0;
      // The note shares the word formation, with a shorter overlapping clock.
      // Keep the headline and all later scrolling text exactly as approved.
      record.opacity = focused || (direction < 0 && record.seen) ? 1
        : approachOpacity(record.opacity, record.target, dt, record.note ? 780 : record.hero ? 1320 : 620);
      if (!record.hero && record.seen) record.opacity = Math.max(record.opacity, readingFloor(rect.top, viewport));
      if (Math.abs(record.opacity - record.target) < .002) record.opacity = record.target;
      else settling = true;
      if (time < record.delay) settling = true;
    }
    for (const record of records) paint(record);
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
    document.body.classList.toggle('roi-dissolve', !reduced.matches);
    for (const record of records) {
      prepareWords(record);
      record.el.classList.toggle('text-dissolve', !reduced.matches);
      measureHeadline(record);
      const rect = record.el.getBoundingClientRect();
      record.seen = record.seen || rect.top < viewport * .94;
      record.opacity = opening && record.hero ? 0 : record.seen ? 1 : 0;
      record.delay = opening && record.hero ? now + (record.note ? 700 : record.el.matches('h1') ? 100 : 0) : 0;
      if (!reduced.matches) paint(record);
    }
    firstRun = false;
    if (!reduced.matches) schedule();
  }
  addEventListener('scroll', () => {
    const position = Math.max(0, scrollY);
    if (Math.abs(position - lastScroll) > .5) direction = position > lastScroll ? 1 : -1;
    lastScroll = position;
    if (direction < 0) records.forEach(record => { if (record.seen) record.delay = 0; });
    schedule();
  }, {passive:true});
  addEventListener('resize', () => {
    headerHeight = document.querySelector('.site-header')?.offsetHeight || 78;
    refreshLines();
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
  document.fonts.ready.then(refreshLines);
  configure();
}
