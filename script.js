const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#nav');
const arrival = document.querySelector('#arrival');

if (arrival) {
  document.body.classList.add('arrival-visible');
  document.querySelector('#arrival-enter').addEventListener('click', () => {
    arrival.classList.add('is-leaving');
    document.body.classList.remove('arrival-visible');
    window.setTimeout(() => arrival.remove(), 700);
  });
}

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
