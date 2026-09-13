(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#nav');
  const closeMenu = () => { nav?.classList.remove('open'); toggle?.setAttribute('aria-expanded', 'false'); };
  toggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav?.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav?.classList.contains('open')) { closeMenu(); toggle.focus(); }
  });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window && !reduced.matches) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add('is-visible'); observer.unobserve(entry.target);
      }
    }, { threshold: .08 });
    // The narrative homepage has a coordinated text treatment in motion.js/CSS.
    if (!document.body.classList.contains('narrative-home')) {
      document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
    }
  }
  let frame;
  const updateSignal = () => {
    frame = null;
    document.documentElement.style.setProperty('--hero-journey', Math.min(scrollY / Math.max(innerHeight, 1), 1));
  };
  if (document.querySelector('.hero-signal') && !reduced.matches) {
    addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(updateSignal); }, { passive: true });
    updateSignal();
  }
  // Native links preserve browser Back, keyboard navigation and modified clicks.
})();
