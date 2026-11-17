/**
 * Name Element Finder (reference/name-elements.html): filter the table by
 * text, language, kind of name and meaning chips. Every row is already in
 * the HTML, so the page reads fully without this script. ?q=wolf on the
 * address pre-fills the search.
 */
(function () {
  'use strict';
  const form = document.querySelector('.el-filters');
  if (!form) return;
  const rows = Array.from(document.querySelectorAll('.el-row'));
  const q = document.getElementById('el-q');
  const lang = document.getElementById('el-lang');
  const use = document.getElementById('el-use');
  const shown = document.getElementById('el-shown');
  const none = document.querySelector('.nl-none');
  const chips = Array.from(form.querySelectorAll('[data-tag]'));
  let tag = '';

  const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/æ/g, 'ae').replace(/[þð]/g, 'th').replace(/ø|ǫ/g, 'o');
  rows.forEach((tr) => { tr._text = ' ' + fold(tr.dataset.text) + ' '; tr._tags = ' ' + tr.dataset.tags + ' '; tr._use = ' ' + tr.dataset.use + ' '; });

  function apply() {
    const words = fold(q.value.trim()).split(/\s+/).filter(Boolean);
    let count = 0;
    rows.forEach((tr) => {
      const ok = words.every((w) => tr._text.includes(w))
        && (!tag || tr._tags.includes(' ' + tag + ' '))
        && (!lang.value || tr.dataset.lang === lang.value)
        && (!use.value || tr._use.includes(' ' + use.value + ' '));
      tr.hidden = !ok;
      if (ok) count++;
    });
    shown.textContent = count;
    none.hidden = count > 0;
  }

  form.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-tag]');
    if (!chip) return;
    tag = chip.getAttribute('aria-pressed') === 'true' ? '' : chip.dataset.tag;
    chips.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tag === tag)));
    apply();
  });
  [q, lang, use].forEach((el) => el.addEventListener('input', apply));

  const start = new URLSearchParams(location.search).get('q');
  if (start) { q.value = start; apply(); }
})();
