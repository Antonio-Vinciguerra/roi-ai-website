/* Register before the first render. Native links retain history, focus, new-tab
   behaviour and network error handling; no router or delayed click is needed. */
(() => {
  const root = document.documentElement;
  const detail = root.classList.contains('detail-scene');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const restored = performance.getEntriesByType('navigation')[0]?.type === 'back_forward';
  let visited = restored;
  let activeTransition = null;
  const canEnter = () => detail && !reduced.matches && !location.hash && !visited;
  if (canEnter()) root.dataset.pageArrival = 'soft';

  addEventListener('pagereveal', event => {
    const transition = event.viewTransition;
    activeTransition = transition || null;
    if (!canEnter()) {
      root.dataset.pageArrival = 'settled';
      transition?.skipTransition();
      return;
    }
    if (transition) {
      // This flag replaces the fallback before the new snapshot is captured.
      // Keep it after completion so the fallback cannot start a second reveal.
      root.dataset.pageArrival = 'native';
      transition.ready.catch(() => { root.dataset.pageArrival = 'settled'; });
    }
  });
  addEventListener('pageshow', event => {
    if (event.persisted) root.dataset.pageArrival = 'settled';
  });
  addEventListener('pagehide', () => { visited = true; });
  addEventListener('focusin', () => {
    root.dataset.pageArrival = 'settled';
    activeTransition?.skipTransition();
  });
  reduced.addEventListener('change', () => {
    if (reduced.matches) {
      root.dataset.pageArrival = 'settled';
      activeTransition?.skipTransition();
    }
  });
})();
