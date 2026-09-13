const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#nav');

toggle?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', isOpen);
});

nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}));

document.querySelectorAll('.sector-trigger').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    const item = trigger.closest('.sector-item');
    const wasActive = item.classList.contains('active');
    document.querySelectorAll('.sector-item').forEach((other) => {
      other.classList.remove('active');
      other.querySelector('.sector-trigger').setAttribute('aria-expanded', 'false');
      other.querySelector('.sector-trigger i').textContent = '+';
    });
    if (!wasActive) {
      item.classList.add('active');
      trigger.setAttribute('aria-expanded', 'true');
      trigger.querySelector('i').textContent = '−';
    }
  });
});

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
