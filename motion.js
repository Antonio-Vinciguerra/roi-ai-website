const reduced = matchMedia('(prefers-reduced-motion: reduce)');

// Native CSS timelines animate arrivals; existing IntersectionObserver covers older browsers.
for (const section of document.querySelectorAll('main > section')) {
  for (const child of section.children) {
    if (!child.matches('.capability-gallery,.intelligence-lens,.scroll-cue,.hero-index,.hero-content')) {
      child.classList.add('scene-reveal');
    }
  }
}

// Compact mobile process navigation uses the same deliverables as the full experience.
for (const [groupIndex, group] of [...document.querySelectorAll('.approach,.working')].entries()) {
  const steps = [...group.querySelectorAll('.step')];
  const bench = group.querySelector('.approach-workbench');
  if (!steps.length || !bench) continue;
  const setPhase = index => {
    steps.forEach((step, i) => {
      step.classList.toggle('is-current', i === index);
      step.querySelector('.step-control').setAttribute('aria-pressed', String(i === index));
    });
  };
  steps.forEach((step, i) => {
    const title = step.querySelector('h3');
    const button = document.createElement('button');
    button.className = 'step-control';
    button.type = 'button';
    button.append(...title.childNodes);
    title.append(button);
    button.setAttribute('aria-controls', 'process-deliverable-' + groupIndex);
    button.addEventListener('click', () => bench.querySelector('[data-phase="' + i + '"]').click());
  });
  bench.querySelector('.workbench-document').id = 'process-deliverable-' + groupIndex;
  group.classList.add('process-enhanced');
  bench.addEventListener('phasechange', event => setPhase(event.detail));
  setPhase(0);
}

// A finite three-scene sequence, with ordinary controls and links at every size.
for (const story of document.querySelectorAll('[data-capability-story]')) {
  const panels = [...story.querySelectorAll('[data-capability-panel]')];
  const controls = story.querySelector('.capability-controls');
  const buttons = [...controls.querySelectorAll('button')];
  const stage = story.querySelector('.capability-stage');
  let selected = -1;
  let visible = true;
  let frame = 0;
  const select = index => {
    if (index === selected) return;
    panels.forEach((panel, i) => {
      panel.inert = i !== index;
      panel.setAttribute('aria-hidden', String(i !== index));
      panel.classList.toggle('is-current', i === index);
      buttons[i].setAttribute('aria-pressed', String(i === index));
    });
    selected = index;
  };
  select(0);
  controls.hidden = false;
  story.classList.add('is-enhanced');

  const update = () => {
    frame = 0;
    if (!visible || !story.classList.contains('is-cinematic')) return;
    if (panels[selected]?.contains(document.activeElement)) return;
    const top = parseFloat(getComputedStyle(stage).top) || 0;
    const travel = story.offsetHeight - stage.offsetHeight;
    const progress = Math.max(0, Math.min(1, (top - story.getBoundingClientRect().top) / Math.max(1, travel)));
    select(Math.min(panels.length - 1, Math.floor(progress * panels.length)));
  };
  const schedule = () => { if (!frame && visible) frame = requestAnimationFrame(update); };
  const fit = () => {
    const inset = innerWidth <= 700 ? 72 : 96;
    // Never pin a scene that would clip its text or controls, including at enlarged text sizes.
    const fits = !reduced.matches && innerHeight >= 680 && stage.offsetHeight + inset + 20 < innerHeight;
    story.classList.toggle('is-cinematic', fits);
    schedule();
  };
  const choose = index => {
    select(index);
    if (story.classList.contains('is-cinematic')) {
      const inset = parseFloat(getComputedStyle(stage).top) || 0;
      const rect = story.getBoundingClientRect();
      // Once the stage is held, choosing a scene changes its position within that same scene.
      if (rect.top <= inset && rect.bottom >= stage.offsetHeight + inset) {
        const travel = story.offsetHeight - stage.offsetHeight;
        window.scrollTo({top: scrollY + rect.top - inset + travel * ((index + .35) / panels.length), behavior:'instant'});
      }
    }
  };
  buttons.forEach((button, i) => button.addEventListener('click', () => choose(i)));
  controls.addEventListener('keydown', event => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const i = buttons.indexOf(document.activeElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (i + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
    buttons[next].focus();
    choose(next);
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }, {rootMargin:'120px'}).observe(story);
  }
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', fit, {passive:true});
  addEventListener('pageshow', fit);
  reduced.addEventListener('change', fit);
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(stage);
  document.fonts.ready.then(fit);
  fit();
}

// The clicked capability photograph carries into its real page when supported.
addEventListener('pageswap', event => {
  if (reduced.matches || !event.viewTransition || !event.activation) return;
  const url = new URL(event.activation.entry.url);
  if (url.origin !== location.origin) return;
  const key = url.pathname.split('/').pop().replace(/\.html$/, '');
  if (!['operate','grow','invest'].includes(key)) return;
  const panel = document.querySelector('#capability-' + key);
  if (!panel?.classList.contains('is-current')) return;
  const art = panel.querySelector('.capability-art');
  art.style.viewTransitionName = 'sector-image';
  event.viewTransition.finished.finally(() => { art.style.viewTransitionName = ''; });
});
addEventListener('pageshow', () => {
  document.querySelectorAll('.capability-art').forEach(art => { art.style.viewTransitionName = ''; });
});
