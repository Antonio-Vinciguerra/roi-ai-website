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
  if (document.body.classList.contains('narrative-home')) continue;
  for (const child of section.children) {
    if (!child.matches('.scroll-story,.intelligence-lens,.scroll-cue,.hero-index,.hero-content,details')) child.classList.add('scene-reveal');
  }
}

// One text treatment, without stacking entrance effects on parent containers.
const textTargets = [...document.querySelectorAll('.narrative-home main h2,.narrative-home main h3,.narrative-home .chapter-content>p,.narrative-home .challenge-copy>p,.narrative-home .approach-intro>p,.narrative-home .step>p,.narrative-home .position-copy,.narrative-home .sector-intro>p,.narrative-home .contact-side>p')]
  .filter(element => !element.closest('details'));
textTargets.forEach(element => element.classList.add('text-arrival'));
if (!CSS.supports('animation-timeline: view()') && 'IntersectionObserver' in window) {
  const active = new Set();
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      if (reduced.matches) continue;
      const animation = entry.target.animate([
        {opacity:.08, transform:'translateY(16px)', filter:'blur(2px)'},
        {opacity:1, transform:'translateY(0)', filter:'blur(0)'}
      ], {duration:1200, easing:'cubic-bezier(.2,.65,.2,1)'});
      active.add(animation);
      animation.finished.then(() => active.delete(animation)).catch(() => active.delete(animation));
    }
  }, {threshold:.12});
  textTargets.forEach(element => observer.observe(element));
  reduced.addEventListener('change', () => {
    if (reduced.matches) { active.forEach(animation => animation.cancel()); active.clear(); }
  });
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
