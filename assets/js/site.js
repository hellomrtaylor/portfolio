// Close the Work menu on outside click or Escape
document.addEventListener('click', (e) => {
  document.querySelectorAll('details.work-menu[open]').forEach((d) => {
    if (!d.contains(e.target)) d.removeAttribute('open');
  });
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  document.querySelectorAll('details.work-menu[open]').forEach((d) => {
    d.removeAttribute('open');
    d.querySelector('summary').focus();
  });
});

// Highlight the current chapter in the case study index
const links = [...document.querySelectorAll('.chapters a')];
if (links.length && 'IntersectionObserver' in window) {
  const byId = new Map(links.map((a) => [a.hash.slice(1), a]));
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => a.classList.remove('active'));
      const a = byId.get(en.target.id);
      if (a) {
        a.classList.add('active');
        const bar = a.closest('ol');
        const l = a.offsetLeft, r = l + a.offsetWidth;
        if (l < bar.scrollLeft || r > bar.scrollLeft + bar.clientWidth) bar.scrollLeft = l - 16;
      }
    });
  }, { rootMargin: '-35% 0px -60% 0px' });
  byId.forEach((_, id) => { const s = document.getElementById(id); if (s) obs.observe(s); });
}

// Start every fresh page visit at the top (e.g. after "Next case study"),
// even in viewers that carry the old scroll position across pages and re-apply
// it after load. Back/forward and links to a #section keep normal behaviour.
const TOP_KEY = 'at:start-at-top';
document.addEventListener('click', (e) => {
  const a = e.target.closest && e.target.closest('a[href]');
  if (!a) return;
  const url = new URL(a.href, location.href);
  if (url.origin === location.origin && url.pathname !== location.pathname && !url.hash) {
    try { sessionStorage.setItem(TOP_KEY, '1'); } catch (err) { /* storage unavailable */ }
  }
});

let startAtTop = false;
try {
  startAtTop = sessionStorage.getItem(TOP_KEY) === '1';
  sessionStorage.removeItem(TOP_KEY);
} catch (err) { /* storage unavailable */ }
const nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
if (nav && nav.type === 'navigate') startAtTop = true;

if (startAtTop && !location.hash) {
  let userMoved = false;
  const stop = () => { userMoved = true; };
  ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach((t) => window.addEventListener(t, stop, { once: true, passive: true }));
  const toTop = () => {
    if (userMoved) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    // if an outer viewer scrolls instead of this page, bring the top into its view too
    if (window.parent !== window) document.documentElement.scrollIntoView({ block: 'start', behavior: 'instant' });
  };
  toTop();
  const settle = () => [0, 60, 150, 300, 600, 1000].forEach((ms) => setTimeout(toTop, ms));
  if (document.readyState === 'complete') settle();
  else window.addEventListener('load', settle, { once: true });
}

// Brand switcher: tabs pick which brand's image shows (arrow keys move between tabs)
document.querySelectorAll('.brand-switch').forEach((fig) => {
  const tabs = [...fig.querySelectorAll('[role="tab"]')];
  const select = (tab) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).classList.toggle('is-active', on);
    });
    tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', (e) => {
      const n = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (n === undefined) return;
      e.preventDefault();
      const next = tabs[(n + tabs.length) % tabs.length];
      select(next); next.focus();
    });
  });
});

// Looping prototype videos: pick the sharper file on dense screens, play only while
// on screen, and leave playback to the viewer when they prefer reduced motion
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('video.loop-video').forEach((v) => {
  if (window.devicePixelRatio * v.getBoundingClientRect().width > 1200) {
    v.querySelectorAll('source[data-hires]').forEach((s) => { s.src = s.dataset.hires; });
    if (v.dataset.hiresPoster) v.poster = v.dataset.hiresPoster;
  }
  if (reduceMotion) {
    v.controls = true;
    v.preload = 'metadata';
    v.load();
    return;
  }
  if (!('IntersectionObserver' in window)) { v.load(); v.play().catch(() => {}); return; }
  let loaded = false;
  new IntersectionObserver(([en]) => {
    if (en.isIntersecting) {
      if (!loaded) { v.load(); loaded = true; }
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, { threshold: 0.25 }).observe(v);
});

// Sections fade and rise in one by one: those on screen at load are staggered,
// later ones come in as they're scrolled to. The head script adds .rv (and skips
// it for reduced motion); __rv tells its fallback timer this script ran.
window.__rv = true;
// Keep this selector in step with the .rv rule in site.css
const RV = 'main > section:not(.hero, .cs-hero), .hero > .wrap > *, .cs-hero > .wrap > *, .pager, .contact';
if (document.documentElement.classList.contains('rv')) {
  const queue = [];
  let timer = null;
  const step = () => {
    const el = queue.shift();
    if (!el) { timer = null; return; }
    el.classList.add('in');
    timer = setTimeout(step, 90);
  };
  const io = new IntersectionObserver((entries) => {
    entries.filter((e) => e.isIntersecting)
      .sort((a, b) => (a.target.compareDocumentPosition(b.target) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
      .forEach((e) => { io.unobserve(e.target); queue.push(e.target); });
    // wait a frame so the hidden state paints first and the fade actually runs
    if (!timer) timer = requestAnimationFrame(() => requestAnimationFrame(step));
  }, { threshold: 0.01 });
  document.querySelectorAll(RV).forEach((el) => io.observe(el));
}
