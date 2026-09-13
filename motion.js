import { landscapeFrame } from './scene-math.mjs';
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

// Every chapter stays in normal document flow. No scroll interception, hidden
// links, timed scene switches or minimum screen-height requirement.
for (const story of document.querySelectorAll('[data-scroll-story]')) {
  const chapters = [...story.querySelectorAll('[data-chapter]')];
  const landscapes = [...story.querySelectorAll('[data-landscape]')];
  const backdrop = story.querySelector('.story-backdrop');
  const count = story.querySelector('[data-story-count]');
  const progress = story.querySelector('.story-progress i');
  let queued = 0;
  let inView = true;
  function update() {
    queued = 0;
    if (reduced.matches || !inView || document.hidden) return;
    const height = backdrop.clientHeight;
    const inset = parseFloat(getComputedStyle(backdrop).top) || 0;
    let active = 0;
    chapters.forEach((chapter, index) => {
      const rect = chapter.getBoundingClientRect();
      const state = landscapeFrame(rect.top - inset, height, index);
      landscapes[index].style.opacity = state.opacity;
      landscapes[index].style.transform = `translate3d(0,${state.shift}px,0) scale(1.09)`;
      if (state.opacity >= .5) active = index;
      const exit = Math.max(0, Math.min(1, (height * .35 - (rect.bottom - inset)) / (height * .35)));
      const copy = chapter.querySelector('.chapter-content');
      const focused = chapter.contains(document.activeElement);
      copy.style.opacity = focused ? 1 : 1 - exit * .8;
      copy.style.transform = focused ? 'none' : `translate3d(0,${-exit * 20}px,0)`;
    });
    count.textContent = `0${active + 1} — 03`;
    const rect = story.getBoundingClientRect();
    progress.style.transform = `scaleX(${Math.max(0, Math.min(1, (height - rect.top + inset) / rect.height))})`;
  }
  const schedule = () => { if (!queued) queued = requestAnimationFrame(update); };
  const configure = () => {
    story.classList.toggle('has-motion', !reduced.matches);
    if (reduced.matches) {
      [...landscapes, ...story.querySelectorAll('.chapter-content')].forEach(el => {
        el.style.removeProperty('opacity'); el.style.removeProperty('transform');
      });
    }
    schedule();
  };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { inView = entries[0].isIntersecting; if (inView) schedule(); }, {rootMargin:'100px'}).observe(story);
  }
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule, {passive:true});
  addEventListener('pageshow', configure);
  document.addEventListener('visibilitychange', schedule);
  story.addEventListener('focusin', schedule);
  reduced.addEventListener('change', configure);
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(story);
  document.fonts.ready.then(schedule);
  configure();
}

for (const section of document.querySelectorAll('main > section')) {
  for (const child of section.children) {
    if (!child.matches('.scroll-story,.intelligence-lens,.scroll-cue,.hero-index,.hero-content,details')) child.classList.add('scene-reveal');
  }
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
