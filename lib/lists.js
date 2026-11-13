/**
 * Name list pages (names/): filter the list by gender, search text, origin,
 * first letter and "top 1,000", without reloading. The names are all in the
 * HTML already, so the page works (and is fully readable) without this script.
 */
(function () {
  'use strict';
  const form = document.querySelector('.nl-filters');
  if (!form) return;
  const items = Array.from(document.querySelectorAll('.nl-item'));
  const groups = Array.from(document.querySelectorAll('.nl-group'));
  const q = document.getElementById('nl-q');
  const origin = document.getElementById('nl-origin');
  const letter = document.getElementById('nl-letter');
  const top = document.getElementById('nl-top');
  const shown = document.getElementById('nl-shown');
  const none = document.querySelector('.nl-none');
  let gender = '';

  const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  items.forEach((li) => { li.dataset.text = fold(li.textContent); });

  function apply() {
    const text = q ? fold(q.value.trim()) : '';
    let count = 0;
    items.forEach((li) => {
      const ok = (!gender || li.dataset.gender === gender)
        && (!text || li.dataset.text.includes(text))
        && (!origin || !origin.value || li.dataset.origin === origin.value)
        && (!letter || !letter.value || fold(li.dataset.letter) === fold(letter.value))
        && (!top || !top.checked || (li.dataset.ranked && Number(li.dataset.ranked) <= 1000));
      li.hidden = !ok;
      if (ok) count++;
    });
    groups.forEach((g) => { g.hidden = !g.querySelector('.nl-item:not([hidden])'); });
    if (shown) shown.textContent = count;
    if (none) none.hidden = count > 0;
  }

  form.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-g]');
    if (!chip) return;
    gender = chip.dataset.g;
    form.querySelectorAll('[data-g]').forEach((b) => b.setAttribute('aria-pressed', String(b === chip)));
    apply();
  });
  [q, origin, letter, top].forEach((el) => el && el.addEventListener('input', apply));
})();
