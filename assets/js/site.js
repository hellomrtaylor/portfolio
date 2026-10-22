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

// Highlight the current chapter in the case study index. On phones the pill shows
// only the current chapter (li.is-current) plus an arrow to the next one.
const links = [...document.querySelectorAll('.chapters a')];
if (links.length) {
  const nextLink = document.createElement('a');
  nextLink.className = 'chapter-next';
  nextLink.innerHTML = '<span class="icon-arrow" aria-hidden="true"></span>';
  links[0].closest('.chapters').append(nextLink);
  const setCurrent = (i) => {
    links.forEach((a, j) => a.parentElement.classList.toggle('is-current', j === i));
    const next = links[i + 1];
    nextLink.hidden = !next;
    if (next) { nextLink.href = next.hash; nextLink.setAttribute('aria-label', `Next section: ${next.textContent}`); }
  };
  setCurrent(0);
  if ('IntersectionObserver' in window) {
    const byId = new Map(links.map((a) => [a.hash.slice(1), a]));
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const a = byId.get(en.target.id);
        if (!a) return;
        links.forEach((l) => l.classList.remove('active'));
        a.classList.add('active');
        setCurrent(links.indexOf(a));
        const bar = a.closest('ol');
        const l = a.offsetLeft, r = l + a.offsetWidth;
        if (l < bar.scrollLeft || r > bar.scrollLeft + bar.clientWidth) bar.scrollLeft = l - 16;
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    byId.forEach((_, id) => { const s = document.getElementById(id); if (s) obs.observe(s); });
  }
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

// Paired videos (a [data-sync] group) run on the first one's clock, so a
// before and after scroll past the same point at the same moment
document.querySelectorAll('[data-sync]').forEach((g) => {
  const [lead, ...rest] = g.querySelectorAll('video');
  if (!lead || reduceMotion) return;
  const sync = () => rest.forEach((v) => {
    if (Math.abs(v.currentTime - lead.currentTime) > 0.15) v.currentTime = lead.currentTime;
  });
  lead.addEventListener('play', () => { sync(); rest.forEach((v) => v.play().catch(() => {})); });
  lead.addEventListener('pause', () => rest.forEach((v) => v.pause()));
  lead.addEventListener('timeupdate', sync);
});

// Sideways galleries: the arrows step one screen at a time, a mouse can
// drag the row (trackpads and touch scroll it natively), and each arrow fades out
// at its end of the row
document.querySelectorAll('[data-gallery]').forEach((g) => {
  const track = g.querySelector('.gallery-track');
  const prev = g.querySelector('.gallery-nav .prev');
  const next = g.querySelector('.gallery-nav .next');
  const shots = [...track.querySelectorAll('.shot')];
  const pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
  const update = () => {
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2
      || !shots.some((i) => i.offsetLeft > track.scrollLeft + pad + 2);
  };
  const go = (dir) => {
    const x = track.scrollLeft + pad;
    const target = dir > 0 ? shots.find((i) => i.offsetLeft > x + 2) : shots.slice().reverse().find((i) => i.offsetLeft < x - 2);
    track.scrollTo({ left: target ? target.offsetLeft - pad : (dir > 0 ? track.scrollWidth : 0), behavior: reduceMotion ? 'auto' : 'smooth' });
  };
  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();

  let startX = 0, startLeft = 0, moved = false;
  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    startX = e.clientX; startLeft = track.scrollLeft; moved = false;
    track.setPointerCapture(e.pointerId);
    track.classList.add('dragging');
  });
  track.addEventListener('pointermove', (e) => {
    if (!track.classList.contains('dragging')) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 3) moved = true;
    track.scrollLeft = startLeft - dx;
  });
  const end = (e) => {
    if (!track.classList.contains('dragging')) return;
    track.classList.remove('dragging');
    if (track.hasPointerCapture(e.pointerId)) track.releasePointerCapture(e.pointerId);
    // settle on the nearest screen after a drag
    const x = track.scrollLeft + pad;
    const nearest = shots.reduce((a, b) => (Math.abs(b.offsetLeft - x) < Math.abs(a.offsetLeft - x) ? b : a));
    track.scrollTo({ left: nearest.offsetLeft - pad, behavior: reduceMotion ? 'auto' : 'smooth' });
  };
  track.addEventListener('pointerup', end);
  track.addEventListener('pointercancel', end);
  track.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
});

// Links to a screen inside a gallery (href="#id" on a .gallery-item) scroll the page
// to the gallery, then slide the gallery along to that screen
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  const target = document.getElementById(a.getAttribute('href').slice(1));
  const track = target && target.closest('.gallery-track');
  if (!track) return;
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const behavior = reduceMotion ? 'auto' : 'smooth';
    track.closest('.gallery').scrollIntoView({ behavior, block: 'start' });
    const pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    track.scrollTo({ left: target.offsetLeft - pad, behavior });
  });
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
