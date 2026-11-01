(() => {
  /* ---------- Reveal on scroll ---------- */
  const groups = new Map();
  document.querySelectorAll(".reveal").forEach((el) => {
    const parent = el.parentElement;
    const i = groups.get(parent) || 0;
    el.style.setProperty("--d", `${Math.min(i, 5) * 0.06}s`);
    groups.set(parent, i + 1);
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  /* ---------- Navbar: scrolled state, active link, sliding indicator ---------- */
  const nav = document.querySelector(".nav");
  const navLinks = document.querySelector(".nav-links");
  const indicator = document.querySelector(".nav-indicator");
  const links = [...document.querySelectorAll(".nav-link")];
  const sections = links.map((l) => document.getElementById(l.dataset.section));

  const moveIndicator = (link) => {
    if (!link) {
      indicator.style.opacity = "0";
      return;
    }
    indicator.style.opacity = "1";
    indicator.style.width = `${link.offsetWidth}px`;
    indicator.style.transform = `translateX(${link.offsetLeft}px)`;
  };

  const activeLink = () => links.find((l) => l.classList.contains("is-active"));

  links.forEach((link) => link.addEventListener("mouseenter", () => moveIndicator(link)));
  navLinks.addEventListener("mouseleave", () => moveIndicator(activeLink()));

  const update = () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 30);

    const probe = window.innerHeight * 0.4;
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    let current = null;
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= probe && rect.bottom > probe) current = section.id;
    });
    if (atBottom) current = sections[sections.length - 1].id;

    links.forEach((link) => link.classList.toggle("is-active", link.dataset.section === current));
    moveIndicator(activeLink());
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      update();
      ticking = false;
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();

  /* ---------- Ottawa local time ---------- */
  const timeEl = document.getElementById("local-time");
  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Toronto",
    timeZoneName: "short",
  });
  const tick = () => (timeEl.textContent = formatter.format(new Date()));
  tick();
  setInterval(tick, 30000);

  document.getElementById("year").textContent = new Date().getFullYear();
})();
