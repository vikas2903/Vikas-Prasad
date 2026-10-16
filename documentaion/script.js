(function () {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  const menuBtn = document.getElementById('menuBtn');
  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');
  const sections = Array.from(document.querySelectorAll('main section'));
  const navLinks = Array.from(document.querySelectorAll('.sidebar a'));

  document.getElementById('year').textContent = new Date().getFullYear();

  /* Mobile menu */
  function setMenu(open) {
    sidebar.classList.toggle('open', open);
    overlay.classList.toggle('show', open);
    menuBtn.setAttribute('aria-expanded', open);
  }
  menuBtn.addEventListener('click', () => setMenu(!sidebar.classList.contains('open')));
  overlay.addEventListener('click', () => setMenu(false));
  navLinks.forEach(a => a.addEventListener('click', () => setMenu(false)));

  /* Active link on scroll */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { rootMargin: '-80px 0px -65% 0px' });
  sections.forEach(s => observer.observe(s));

  /* Search */
  const index = sections.map(s => ({
    id: s.id,
    title: s.dataset.title || s.id,
    text: s.innerText.replace(/\s+/g, ' ').trim()
  }));

  function snippet(text, q) {
    const i = text.toLowerCase().indexOf(q);
    if (i < 0) return text.slice(0, 90) + '…';
    const start = Math.max(0, i - 35);
    return (start ? '…' : '') + text.slice(start, i + q.length + 60) + '…';
  }

  function esc(s) {
    return s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) { results.hidden = true; return; }
    const hits = index.filter(s => s.text.toLowerCase().includes(q) || s.title.toLowerCase().includes(q));
    results.innerHTML = hits.length
      ? hits.map(h => `<a href="#${h.id}"><b>${esc(h.title)}</b><span>${esc(snippet(h.text, q))}</span></a>`).join('')
      : '<div class="empty">No results found.</div>';
    results.hidden = false;
  });
  results.addEventListener('click', e => {
    if (e.target.closest('a')) { results.hidden = true; input.value = ''; }
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.search')) results.hidden = true;
  });
  document.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement !== input) { e.preventDefault(); input.focus(); }
    if (e.key === 'Escape') { results.hidden = true; input.blur(); }
  });

  /* Copy buttons */
  document.querySelectorAll('.copy').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.parentElement.querySelector('code').innerText;
      try {
        await navigator.clipboard.writeText(text);
      } catch (err) {
        const ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); ta.remove();
      }
      btn.textContent = 'Copied!';
      setTimeout(() => (btn.textContent = 'Copy'), 1500);
    });
  });

  /* FAQ: keep one open at a time */
  const details = document.querySelectorAll('.accordion details');
  details.forEach(d => d.addEventListener('toggle', () => {
    if (d.open) details.forEach(o => { if (o !== d) o.open = false; });
  }));
})();
