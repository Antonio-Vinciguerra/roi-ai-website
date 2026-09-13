const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#nav');
const updateHeroSignal = () => {
  const progress = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1);
  document.documentElement.style.setProperty('--hero-journey', progress);
};
window.addEventListener('scroll', updateHeroSignal, { passive: true });
updateHeroSignal();

document.querySelectorAll('.capability, .sector-trigger').forEach((link) => {
  link.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const target = link.href;
    const label = link.querySelector('h3, .sector-name')?.textContent.trim() || 'ROI AI';
    const transition = document.createElement('div');
    transition.className = 'route-transition';
    transition.style.setProperty('--x', `${event.clientX}px`);
    transition.style.setProperty('--y', `${event.clientY}px`);
    transition.innerHTML = `<div class="route-lens"></div><p>ROI AI / EXPLORE</p><h2>${label}</h2>`;
    document.body.append(transition);
    requestAnimationFrame(() => transition.classList.add('is-active'));
    window.setTimeout(() => { window.location.href = target; }, 380);
  });
});

toggle?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', isOpen);
});

nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((el, index) => {
  el.style.transitionDelay = `${Math.min((index % 5) * 70, 240)}ms`;
  observer.observe(el);
});
