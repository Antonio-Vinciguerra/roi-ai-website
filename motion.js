import { approachOpacity } from './scene-math.mjs';
import { installTextDissolve } from './reveal.js';
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

// Image chapters use the same time-led dissolve as the text. On an upward
// return the correct photograph is restored without replaying its entrance.
for (const story of document.querySelectorAll('[data-scroll-story]')) {
  const chapters = [...story.querySelectorAll('[data-chapter]')];
  const landscapes = [...story.querySelectorAll('[data-landscape]')];
  const backdrop = story.querySelector('.story-backdrop');
  const count = story.querySelector('[data-story-count]');
  const progress = story.querySelector('.story-progress i');
  const seen = new Set();
  const opacity = landscapes.map(() => 0);
  let queued = 0, previousTime = 0, selected = -1;
  let lastScroll = Math.max(0, scrollY), direction = 1;
  let inView = true;
  let firstEntry = true;
  function update(time) {
    queued = 0;
    if (reduced.matches || !inView || document.hidden) { previousTime = 0; return; }
    const height = backdrop.clientHeight;
    const inset = parseFloat(getComputedStyle(backdrop).top) || 0;
    const bounds = story.getBoundingClientRect();
    if (bounds.top > innerHeight * .94 || bounds.bottom < inset) return;
    const dt = previousTime ? Math.min(64, time - previousTime) : 16;
    previousTime = time;
    let active = 0;
    chapters.forEach((chapter, index) => {
      // Follow the actual text, not the large empty spacing around its chapter.
      const top = chapter.querySelector('.chapter-content').getBoundingClientRect().top;
      if (top < inset + height * .82) active = index;
    });
    const revisit = active !== selected && seen.has(active);
    const restore = direction < 0 || revisit || (firstEntry && bounds.top < -height * .5);
    if (active !== selected) { selected = active; seen.add(active); }
    firstEntry = false;
    let settling = false;
    landscapes.forEach((landscape, index) => {
      const target = index <= active ? 1 : 0;
      opacity[index] = restore ? target : approachOpacity(opacity[index], target, dt, 700);
      if (Math.abs(opacity[index] - target) < .002) opacity[index] = target;
      else settling = true;
      landscape.style.opacity = opacity[index].toFixed(4);
    });
    count.textContent = '0' + (active + 1) + ' — 03';
    progress.style.transform = 'scaleX(' + Math.max(0, Math.min(1, (height - bounds.top + inset) / bounds.height)) + ')';
    if (settling) queued = requestAnimationFrame(update);
    else previousTime = 0;
  }
  const schedule = () => { if (!queued) queued = requestAnimationFrame(update); };
  const configure = () => {
    story.classList.toggle('has-motion', !reduced.matches);
    landscapes.forEach((el, i) => {
      el.style.removeProperty('transform');
      if (reduced.matches) el.style.removeProperty('opacity');
      else el.style.opacity = opacity[i];
    });
    schedule();
  };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { inView = entries[0].isIntersecting; if (inView) schedule(); }, {rootMargin:'100px'}).observe(story);
  }
  addEventListener('scroll', () => {
    const position = Math.max(0, scrollY);
    if (Math.abs(position - lastScroll) > .5) direction = position > lastScroll ? 1 : -1;
    lastScroll = position;
    schedule();
  }, {passive:true});
  addEventListener('resize', schedule, {passive:true});
  addEventListener('pageshow', schedule);
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', configure);
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(story);
  document.fonts.ready.then(schedule);
  configure();
}


// Preserve the compact, synchronized process controls on service pages.
for (const [groupIndex, group] of [...document.querySelectorAll('.working')].entries()) {
  const steps = [...group.querySelectorAll('.step')];
  const bench = group.querySelector('.approach-workbench');
  if (!steps.length || !bench) continue;
  const setPhase = index => steps.forEach((step, i) => {
    step.classList.toggle('is-current', i === index);
    step.querySelector('.step-control').setAttribute('aria-pressed', String(i === index));
  });
  steps.forEach((step, i) => {
    const title = step.querySelector('h3');
    const button = document.createElement('button');
    button.className = 'step-control'; button.type = 'button';
    button.append(...title.childNodes); title.append(button);
    button.setAttribute('aria-controls', 'process-deliverable-' + groupIndex);
    button.addEventListener('click', () => bench.querySelector('[data-phase="' + i + '"]').click());
  });
  bench.querySelector('.workbench-document').id = 'process-deliverable-' + groupIndex;
  group.classList.add('process-enhanced');
  bench.addEventListener('phasechange', event => setPhase(event.detail));
  setPhase(0);
}

installTextDissolve();
