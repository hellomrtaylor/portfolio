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
