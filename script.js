(() => {
  'use strict';
  const root = document.documentElement;
  const themeButton = document.getElementById('theme-toggle');
  const themeLabel = document.getElementById('theme-label');
  const themeMeta = document.querySelector('meta[name="theme-color"]');

  function syncTheme() {
    const dark = root.dataset.theme !== 'light';
    themeLabel.textContent = dark ? 'Light' : 'Dark';
    themeButton.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} mode`);
    themeButton.setAttribute('title', `Switch to ${dark ? 'light' : 'dark'} mode`);
    if (themeMeta) themeMeta.content = dark ? '#131719' : '#f7f7f3';
  }

  themeButton.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    try { localStorage.setItem('jane-portfolio-theme', next); } catch (_) { /* private mode */ }
    syncTheme();
  });
  syncTheme();

  const reveals = Array.from(document.querySelectorAll('.reveal'));
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('visible'));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .07, rootMargin: '0px 0px -18px 0px' });
    reveals.forEach(el => observer.observe(el));
  }

  const nav = document.querySelector('.nav');
  const links = Array.from(document.querySelectorAll('[data-nav]'));
  const sections = links.map(link => document.getElementById(link.dataset.nav)).filter(Boolean);
  let requested = false;
  function updateNav() {
    nav.classList.toggle('is-scrolled', scrollY > 15);
    const scanY = window.innerHeight * .3;
    let current = '';
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= scanY && rect.bottom > scanY) current = section.id;
    });
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 5) current = 'contact';
    links.forEach(link => {
      const active = link.dataset.nav === current;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function onScroll() {
    if (requested) return;
    requested = true;
    requestAnimationFrame(() => { requested = false; updateNav(); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  updateNav();

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
