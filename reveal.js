import { textRollFrame } from './scene-math.mjs';

export function installTextRoll() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width:700px)');
  const targets = [...document.querySelectorAll('main h1,main h2,main h3,main p,.hero>.eyebrow')]
    .filter(el => !el.closest('details,[data-lens],.approach-workbench,footer,noscript,[aria-live]') &&
      !el.matches('.section-label,.lens-disclaimer') && !el.querySelector('button,a,input'));
  const records = targets.map(el => ({ el, original: [...el.childNodes].map(node => node.cloneNode(true)), lines: [] }));
  const visible = new Set();
  const opening = new Set();
  let frame = 0;
  let firstRun = true;
  let headerHeight = document.querySelector('.site-header')?.offsetHeight || 78;

  function restore(record) {
    record.el.replaceChildren(...record.original.map(node => node.cloneNode(true)));
    record.el.classList.remove('roll-text');
    record.lines = [];
  }
  function wrap(record) {
    restore(record);
    // Preserve semantic emphasis and explicit headline lines. Body copy remains
    // one naturally wrapping unit; it is never split into inaccessible glyphs.
    const nodes = [...record.el.childNodes];
    let ink;
    const newLine = () => {
      if (record.lines.length) record.el.append(document.createTextNode('\n'));
      const line = document.createElement('span');
      line.className = 'roll-line';
      ink = document.createElement('span');
      ink.className = 'roll-ink';
      line.append(ink);
      record.el.append(line);
      record.lines.push({ line, ink });
    };
    record.el.replaceChildren();
    newLine();
    for (const node of nodes) {
      if (node.nodeName === 'BR') {
        // Mobile process headings deliberately use a single flowing line.
        if (mobile.matches && record.el.closest('.step')) ink.append(document.createTextNode(' '));
        else newLine();
      } else ink.append(node);
    }
    record.el.classList.add('roll-text');
  }

  function cancelOpening() {
    opening.forEach(animation => animation.cancel());
    opening.clear();
  }
  function update() {
    frame = 0;
    if (reduced.matches || document.hidden) return;
    const viewport = document.documentElement.clientHeight;
    // Read every visible line first, then write, avoiding interleaved layout work.
    const changes = [];
    for (const record of visible) {
      const focused = record.el.contains(document.activeElement) || record.el.closest('a:focus');
      for (const { line, ink } of record.lines) {
        const rect = line.getBoundingClientRect();
        const state = focused ? {y:0,tilt:0} : textRollFrame(rect.top, rect.height, viewport, headerHeight);
        // The opening is time-led; hero text must not fall back into a partial
        // entry state when its timed reveal finishes on a short viewport.
        if (record.el.closest('.hero')) {
          state.y = Math.min(0, state.y);
          state.tilt = Math.max(0, state.tilt);
        }
        changes.push({ink, ...state});
      }
    }
    for (const {ink,y,tilt} of changes) {
      ink.style.setProperty('--roll-y', y + '%');
      ink.style.setProperty('--roll-tilt', tilt + 'deg');
    }
  }
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    for (const entry of entries) {
      const record = records.find(record => record.el === entry.target);
      if (entry.isIntersecting) visible.add(record);
      else visible.delete(record);
    }
    schedule();
  }, {rootMargin:'240px 0px'}) : null;

  function configure() {
    cancelOpening();
    headerHeight = document.querySelector('.site-header')?.offsetHeight || 78;
    visible.clear();
    observer?.disconnect();
    records.forEach(record => {
      if (reduced.matches) restore(record);
      else {
        wrap(record);
        visible.add(record);
        observer?.observe(record.el);
      }
    });
    document.body.classList.toggle('roi-motion', !reduced.matches);
    update();
    if (firstRun && !reduced.matches && scrollY < 40 && !location.hash) {
      for (const record of records.filter(record => record.el.closest('.hero'))) {
        const base = record.el.matches('h1') ? 160 : record.el.closest('.hero-note') ? 480 : 0;
        record.lines.forEach(({ink}, i) => {
          const animation = ink.animate([
            {transform:'perspective(1000px) translate3d(0,130%,0) rotateX(-5deg)'},
            {transform:'perspective(1000px) translate3d(0,0,0) rotateX(0deg)'}
          ], {duration:1900, delay:base + i * 140, easing:'cubic-bezier(.22,.62,.2,1)', fill:'backwards'});
          opening.add(animation);
          animation.finished.then(() => opening.delete(animation)).catch(() => opening.delete(animation));
        });
      }
    }
    firstRun = false;
  }
  addEventListener('scroll', () => { cancelOpening(); schedule(); }, {passive:true});
  addEventListener('resize', () => {
    headerHeight = document.querySelector('.site-header')?.offsetHeight || 78;
    schedule();
  }, {passive:true});
  document.addEventListener('focusin', schedule);
  document.addEventListener('visibilitychange', () => { cancelOpening(); schedule(); });
  addEventListener('pageshow', schedule);
  mobile.addEventListener('change', configure);
  reduced.addEventListener('change', configure);
  document.fonts.ready.then(schedule);
  configure();
}
