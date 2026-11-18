/**
 * Name Builder (reference/name-builder.html): joins two real name elements
 * into a name, filtered by language, kind, gender and meaning. The data is
 * in the page (#nb-data), written by scripts/builder-page.js; the join and
 * the spelling key match that script.
 */
(function () {
  'use strict';
  const dataEl = document.getElementById('nb-data');
  const form = document.getElementById('nb-form');
  if (!dataEl || !form) return;
  const data = JSON.parse(dataEl.textContent);
  const $ = (id) => document.getElementById(id);
  const lang = $('nb-lang'), kind = $('nb-kind'), gender = $('nb-gender'), selA = $('nb-a'), selB = $('nb-b');
  const out = $('nb-results'), note = $('nb-note');
  const VOWELS = 'aeiouyæAEIOUYÆ';
  const COUNT = 12;

  const join = (a, b) => {
    const end = a.slice(-1).toLowerCase();
    return ((VOWELS.includes(end) && VOWELS.includes(b[0])) || end === b[0].toLowerCase() ? a.slice(0, -1) : a) + b;
  };
  const norm = (n) => String(n).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/æ/g, 'ae').replace(/[þð]/g, 'th').replace(/ǫ/g, 'o').replace(/[^a-z]/g, '')
    .replace(/r$/, '').replace(/(nn|ll)$/, (m) => m[0]);
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function set() {
    const l = data.langs.find((x) => x.key === lang.value) || data.langs[0];
    if (!l[kind.value]) kind.value = l.people ? 'people' : 'places';
    kind.querySelector('option[value="places"]').disabled = !l.places;
    return l[kind.value];
  }

  // The meaning lists offer only meanings that can still give a name.
  function fillMeanings() {
    const s = set();
    $('nb-gender-f').hidden = kind.value !== 'people';
    const seconds = s.second.filter((p) => kind.value !== 'people' || !gender.value || p.g === gender.value);
    const opts = (parts, sel) => {
      const keep = sel.value;
      const seen = new Map();
      parts.forEach((p) => { if (!seen.has(p.m)) seen.set(p.m, p); });
      const list = [...seen.keys()].sort((a, b) => a.localeCompare(b));
      sel.innerHTML = '<option value="">Anything</option>' + list.map((m) => `<option>${esc(m)}</option>`).join('');
      sel.value = list.includes(keep) ? keep : '';
    };
    opts(s.first, selA);
    opts(seconds, selB);
  }

  function build() {
    const s = set();
    const firsts = s.first.filter((p) => !selA.value || p.m === selA.value);
    const seconds = s.second.filter((p) => (!selB.value || p.m === selB.value)
      && (kind.value !== 'people' || !gender.value || p.g === gender.value));
    const pairs = [];
    firsts.forEach((a) => seconds.forEach((b) => { if (a.id !== b.id) pairs.push([a, b]); }));
    for (let i = pairs.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pairs[i], pairs[j]] = [pairs[j], pairs[i]]; }
    const seen = new Set();
    const names = [];
    for (const [a, b] of pairs) {
      const name = join(a.f, b.f);
      if (seen.has(name)) continue;
      seen.add(name);
      names.push({ name, a, b, rec: data.recorded[norm(name)] });
      if (names.length >= COUNT) break;
    }
    // Recorded names first: they're the ones people most often want to know about.
    names.sort((x, y) => (y.rec ? 1 : 0) - (x.rec ? 1 : 0));
    out.innerHTML = names.length ? `<ul class="nb-list">${names.map((x) => `<li class="nb-item"><button type="button" class="nb-name name-copy" title="Copy">${esc(x.name)}</button> ${
      x.rec ? `<a class="prov prov-recorded" href="${esc(x.rec.w)}" title="Found in our sources: see where.">Recorded</a>`
        : '<span class="prov prov-derived" title="Both parts are real; this exact name may or may not appear in the records.">Built from real parts</span>'
    }<span class="nb-parts"><a href="name-elements.html#el-${x.a.id}">${esc(x.a.e)}</a> '${esc(x.a.m)}' + <a href="name-elements.html#el-${x.b.id}">${esc(x.b.e)}</a> '${esc(x.b.m)}'</span></li>`).join('')}</ul>`
      : '<p class="nl-none">No names fit those choices. Try "Anything" for one of the meanings.</p>';
    note.textContent = pairs.length ? `${pairs.length.toLocaleString('en-GB')} possible names with these choices` : '';
  }

  [lang, kind, gender].forEach((el) => el.addEventListener('input', () => { fillMeanings(); build(); }));
  [selA, selB].forEach((el) => el.addEventListener('input', build));
  $('nb-build').addEventListener('click', build);
  fillMeanings();
  build();
})();
