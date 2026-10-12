// Close open menus (Work, reading progress) on outside click or Escape
const MENUS = 'details.work-menu[open], details.progress[open]';
document.addEventListener('click', (e) => {
  document.querySelectorAll(MENUS).forEach((d) => {
    if (!d.contains(e.target)) d.removeAttribute('open');
  });
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  document.querySelectorAll(MENUS).forEach((d) => {
    d.removeAttribute('open');
    d.querySelector('summary').focus();
  });
});

// Reading progress pill on case studies, built from the contents list.
// It appears under the nav once the contents list has scrolled away, names the
// current chapter, fills a line as you read, and opens to the full chapter list.
const contents = document.querySelector('.chapters');
const header = document.querySelector('.site-header');
if (contents && header) {
  const links = [...contents.querySelectorAll('ol a')];
  const sections = links.map((a) => document.getElementById(a.hash.slice(1))).filter(Boolean);

  const pill = document.createElement('details');
  pill.className = 'progress';
  pill.innerHTML =
    '<summary><span class="progress-name"></span><span class="progress-count"></span>' +
    '<span class="progress-bar" aria-hidden="true"><i></i></span></summary>';
  const list = document.createElement('ol');
  links.forEach((a) => {
    const li = document.createElement('li');
    const copy = document.createElement('a');
    copy.href = a.hash;
    copy.textContent = a.textContent;
    li.append(copy);
    list.append(li);
  });
  pill.append(list);
  header.append(pill);

  const nameEl = pill.querySelector('.progress-name');
  const countEl = pill.querySelector('.progress-count');
  const barEl = pill.querySelector('.progress-bar');
  const pillLinks = [...list.querySelectorAll('a')];
  list.addEventListener('click', (e) => { if (e.target.closest('a')) pill.removeAttribute('open'); });

  let current = -1;
  const update = () => {
    const y = window.scrollY;
    const line = y + window.innerHeight * 0.35; // the reading line, a third of the way down
    // show once the contents list is above the nav
    const shown = contents.getBoundingClientRect().bottom < header.offsetHeight;
    pill.classList.toggle('is-on', shown);
    if (!shown) pill.removeAttribute('open');

    let i = 0;
    sections.forEach((s, n) => { if (s.offsetTop <= line) i = n; });
    if (i !== current) {
      current = i;
      nameEl.textContent = links[i].textContent;
      countEl.textContent = `${i + 1} of ${links.length}`;
      pillLinks.forEach((a, n) => (n === i ? a.setAttribute('aria-current', 'step') : a.removeAttribute('aria-current')));
    }

    const first = sections[0];
    const last = sections[sections.length - 1];
    const start = first.offsetTop;
    const end = Math.max(start + 1, last.offsetTop + last.offsetHeight - window.innerHeight);
    const p = Math.min(1, Math.max(0, (y - start + window.innerHeight * 0.35) / (end - start + window.innerHeight * 0.35)));
    barEl.style.setProperty('--p', p.toFixed(3));
  };

  let queued = false;
  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; update(); });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
}
