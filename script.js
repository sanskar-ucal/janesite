(() => {
  'use strict';

  // -------------------------
  // Theme: system preference + persistent manual override
  // -------------------------
  const root = document.documentElement;
  const themeButton = document.getElementById('theme-toggle');
  const themeLabel = document.getElementById('theme-label');
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');

  function syncTheme() {
    const isDark = root.dataset.theme !== 'light';
    themeLabel.textContent = isDark ? 'Light' : 'Dark';
    themeButton.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
    themeButton.setAttribute('aria-pressed', String(!isDark));
    if (themeColorMeta) themeColorMeta.content = isDark ? '#161c25' : '#f6f5f1';
  }

  themeButton.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('jane-theme', next); } catch (_) { /* private mode */ }
    syncTheme();
  });
  syncTheme();

  // -------------------------
  // Reveal motion: unobtrusive and accessible
  // -------------------------
  const reveals = [...document.querySelectorAll('.reveal')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('is-visible'));
  } else {
    const groups = new Map();
    for (const el of reveals) {
      const parent = el.parentElement;
      const index = groups.get(parent) || 0;
      el.style.setProperty('--delay', `${Math.min(index, 4) * 0.07}s`);
      groups.set(parent, index + 1);
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
    reveals.forEach((el) => observer.observe(el));
  }

  // -------------------------
  // Nav: active section & smooth hover indicator
  // -------------------------
  const nav = document.querySelector('.nav');
  const navLinks = document.querySelector('.nav-links');
  const indicator = document.querySelector('.nav-indicator');
  const links = [...document.querySelectorAll('.nav-link')];
  const sections = links.map((link) => document.getElementById(link.dataset.section)).filter(Boolean);
  let hoveredLink = null;

  function moveIndicator(link) {
    if (!link || getComputedStyle(link).display === 'none') {
      indicator.style.opacity = '0';
      return;
    }
    indicator.style.width = `${link.offsetWidth}px`;
    indicator.style.transform = `translateX(${link.offsetLeft}px)`;
    indicator.style.opacity = '1';
  }

  function currentLink() {
    return links.find((link) => link.classList.contains('is-active'));
  }

  links.forEach((link) => {
    link.addEventListener('mouseenter', () => { hoveredLink = link; moveIndicator(link); });
    link.addEventListener('focus', () => moveIndicator(link));
    link.addEventListener('blur', () => moveIndicator(hoveredLink || currentLink()));
    link.addEventListener('click', () => { hoveredLink = null; });
  });
  navLinks.addEventListener('mouseleave', () => { hoveredLink = null; moveIndicator(currentLink()); });

  function updateNav() {
    nav.classList.toggle('is-scrolled', window.scrollY > 24);
    const probe = window.innerHeight * 0.38;
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10;
    let activeId = null;
    sections.forEach((section) => {
      const bounds = section.getBoundingClientRect();
      if (bounds.top <= probe && bounds.bottom > probe) activeId = section.id;
    });
    if (atBottom) activeId = 'contact';

    links.forEach((link) => {
      const active = link.dataset.section === activeId;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    moveIndicator(hoveredLink || currentLink());
  }

  let frameRequested = false;
  function scheduleUpdate() {
    if (frameRequested) return;
    frameRequested = true;
    requestAnimationFrame(() => {
      updateNav();
      frameRequested = false;
    });
  }
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('load', scheduleUpdate);
  updateNav();

  // -------------------------
  // Ottawa local time & current copyright year
  // -------------------------
  const timeElement = document.getElementById('local-time');
  if (timeElement) {
    const ottawaClock = new Intl.DateTimeFormat('en-CA', {
      hour: 'numeric', minute: '2-digit', hour12: true,
      timeZone: 'America/Toronto', timeZoneName: 'short'
    });
    function updateClock() { timeElement.textContent = ottawaClock.format(new Date()); }
    updateClock();
    setInterval(updateClock, 30_000);
  }
  const yearElement = document.getElementById('year');
  if (yearElement) yearElement.textContent = new Date().getFullYear();
})();
