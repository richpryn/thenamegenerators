/**
 * Baby Name Generator from Parents' Names (baby-name-from-parents.html).
 *
 * Every suggestion is a real first name from the ONS baby name lists for
 * England and Wales (data/parent-names.json, built by scripts/parents-page.js),
 * apart from the optional, clearly labelled "Blends" group. Names are matched
 * on a rough "sound key" (Sophie and Sofia both start "sof"), then ranked by
 * how popular they are now.
 *
 * In Node, require() it for the matcher alone (the build uses it to check
 * the page's example names); in a browser it wires up the page.
 */
(function (global) {
  'use strict';

  // ---- Names: spelling, sound and beats ----

  /** Plain lower-case letters: "Siobhán" -> "siobhan". */
  function plain(s) {
    return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]/g, '');
  }

  /**
   * A rough sound key, so spellings that sound alike match: ph -> f,
   * ck/q/hard c -> k, soft c -> s, y -> i (not at the start), -ie/-ey -> i,
   * a silent final e dropped (Jane -> jan, James -> jams), double letters as one.
   */
  function soundKey(word) {
    let s = plain(word);
    if (!s) return '';
    s = s.replace(/ph/g, 'f').replace(/ck/g, 'k').replace(/q/g, 'k').replace(/x/g, 'ks')
      .replace(/c(?=[eiy])/g, 's').replace(/c/g, 'k');
    s = s.charAt(0) + s.slice(1).replace(/y/g, 'i');
    s = s.replace(/(ie|ey|ee)$/, 'i');
    if (s.length > 3) s = s.replace(/([^aeiou])e(s?)$/, (m, c, z) => (/[aeiou]/.test(s.slice(0, -m.length)) ? c + z : m));
    return s.replace(/([^aeiou])\1+/g, '$1');
  }

  /** Beats in a sound key: vowel groups, with "ia", "io", "ie" mid-word and a final "oe" as two. */
  function syllables(key) {
    const groups = key.match(/[aeiou]+/g) || [];
    let n = 0;
    groups.forEach((g, i) => {
      const last = i === groups.length - 1 && key.endsWith(g);
      if (g.length > 1 && (/^i[aeo]/.test(g) || (last && g === 'oe'))) n += 2;
      else n += 1;
    });
    return Math.max(1, n);
  }

  /** The end that rhymes: from the last vowel sound on, plus the sound before if that's short. */
  function rhyme(key) {
    const m = key.match(/[aeiou]+[^aeiou]*$/);
    if (!m) return key.slice(-2);
    const i = key.length - m[0].length;
    return m[0].length >= 2 ? m[0] : key.slice(Math.max(0, i - 1));
  }

  /** A parent's name as typed, ready to match: { shown, parts, first, last, key, initial }. */
  function parent(raw) {
    const shown = String(raw || '').replace(/\s+/g, ' ').trim().slice(0, 40);
    const parts = shown.split(/[\s\-'’]+/).map(plain).filter(Boolean);
    if (!parts.length) return null;
    const keys = parts.map(soundKey);
    return {
      shown,
      parts,
      keys,
      firstWord: shown.split(/[\s\-]+/)[0],
      lastWord: shown.split(/[\s\-]+/).pop(),
      // How a name starts and ends, by sound and by spelling.
      starts: [keys[0], parts[0]],
      ends: [keys[keys.length - 1], parts[parts.length - 1]],
      initial: parts[0].charAt(0),
      whole: keys.join(''),
      beats: syllables(keys.join('')),
      rhyme: rhyme(keys.join('')),
    };
  }

  // ---- The name list ----

  /**
   * Unpack data/parent-names.json: "Name,rank" entries joined by "|", where a
   * name with no 2025 rank has "Name,,bestRank,yearIndex" instead.
   */
  function loadNames(data) {
    const years = data.years || [];
    const byName = new Map();
    for (const sex of ['girl', 'boy']) {
      String(data[sex] || '').split('|').forEach((entry) => {
        if (!entry) return;
        const [name, r, best, yi] = entry.split(',');
        const rank = r ? Number(r) : 0;
        const pastRank = best ? Number(best) : 0;
        const pastYear = yi ? years[Number(yi)] : 0;
        const key = soundKey(name);
        const item = byName.get(name) || { name, plain: plain(name), key, beats: syllables(key), sex: {} };
        item.sex[sex] = { rank, pastRank, pastYear };
        byName.set(name, item);
      });
    }
    return [...byName.values()];
  }

  /** The figures for one sex, or the better of both for "either". */
  function figures(item, sex) {
    if (sex !== 'either') return item.sex[sex] || null;
    const g = item.sex.girl;
    const b = item.sex.boy;
    if (!g || !b) return g || b;
    return popularity(g) <= popularity(b) ? g : b;
  }

  // Ranked in 2025 first, by rank; then names last ranked in an earlier year.
  function popularity(f) {
    if (!f) return Infinity;
    return f.rank ? f.rank : 10000 + (f.pastRank || 9999);
  }

  // ---- Matching ----

  const startLen = (key, from) => { let i = 0; while (i < key.length && i < from.length && key[i] === from[i]) i++; return i; };
  const endLen = (key, from) => { let i = 0; while (i < key.length && i < from.length && key[key.length - 1 - i] === from[from.length - 1 - i]) i++; return i; };

  // The longest bit of `from` (at least `min` letters) found in `key`, with where it sits.
  function sharedChunk(key, from, min) {
    for (let len = from.length; len >= min; len--) {
      for (let i = 0; i + len <= from.length; i++) {
        const at = key.indexOf(from.slice(i, i + len));
        if (at >= 0) return { len, at };
      }
    }
    return null;
  }

  // Two chunks that don't overlap in the name, the longest pair first.
  function bothChunks(key, a, b) {
    const minA = Math.min(2, a.length);
    const minB = Math.min(2, b.length);
    let best = null;
    for (let la = a.length; la >= minA; la--) {
      for (let i = 0; i + la <= a.length; i++) {
        const ca = a.slice(i, i + la);
        let at = key.indexOf(ca);
        while (at >= 0) {
          const left = key.slice(0, at);
          const right = key.slice(at + la);
          const cb = sharedChunk(left, b, minB) || sharedChunk(right, b, minB);
          if (cb && (!best || la + cb.len > best)) best = la + cb.len;
          at = key.indexOf(ca, at + 1);
        }
      }
    }
    return best;
  }

  /**
   * Suggestions for two parents' names: four groups of real names, each
   * [{ name, rank, pastRank, pastYear, sex, why }], most popular first within
   * each strength of match, and the blends.
   */
  function suggest(names, rawA, rawB, sex = 'either', limit = 60) {
    const A = parent(rawA);
    const B = parent(rawB);
    const out = { starts: [], initials: [], sounds: [], rhythm: [], blends: [], a: A, b: B };
    if (!A && !B) return out;
    const parents = [A, B].filter(Boolean);
    const own = new Set(parents.flatMap((p) => p.parts));
    // Not the parents' own names, or other spellings of them (Dannielle for Daniel).
    const ownKeys = new Set(parents.flatMap((p) => p.keys));
    const pool = names.filter((item) => figures(item, sex) && !own.has(item.plain) && !ownKeys.has(item.key));

    const sortRaw = (list) => list.sort((x, y) => (y.score - x.score) || (popularity(x.f) - popularity(y.f)) || x.item.name.localeCompare(y.item.name));
    const shape = ({ item, f, why }) => ({
      name: item.name,
      rank: f.rank,
      pastRank: f.pastRank,
      pastYear: f.pastYear,
      sex: item.sex.girl && item.sex.boy ? 'both' : (item.sex.girl ? 'girl' : 'boy'),
      why,
    });
    const pick = (list) => sortRaw(list).slice(0, limit).map(shape);
    // Within each strength of match, take turns between the two parents.
    const takeTurns = (list, keyOf, keys) => {
      const sorted = sortRaw(list);
      const mixed = [];
      [...new Set(sorted.map((r) => r.score))].forEach((score) => {
        const queues = keys.map((k) => sorted.filter((r) => r.score === score && keyOf(r) === k));
        while (queues.some((q) => q.length)) queues.forEach((q) => { if (q.length) mixed.push(q.shift()); });
      });
      return mixed.slice(0, limit).map(shape);
    };

    // (1) Starts like one parent, ends like the other: at least four letters
    // between them, with three from one side or two from each (Jemma is
    // J from James + "emma" from Emma; Dani is "Dan" from Daniel + the "ie" of Sophie).
    if (A && B) {
      const found = [];
      for (const item of pool) {
        const spell = [item.key, item.plain];
        let best = null;
        for (const [P, Q] of [[A, B], [B, A]]) {
          for (let v = 0; v < 2; v++) {
            const k = spell[v];
            const s = startLen(k, P.starts[v]);
            const e = endLen(k, Q.ends[v]);
            const pl = P.starts[v].length;
            const ql = Q.ends[v].length;
            if (!s || !e || s + e > k.length || s + e < Math.min(4, pl + ql - 1)) continue;
            // All of one parent's name and a letter more is that name with an ending, not a mix.
            if (s >= pl && pl > 3) continue;
            // A strong side: three letters, or all of a very short name ("Al").
            if (!(s >= 3 || e >= 3 || s === pl || e === ql || Math.min(s, e) >= 2)) continue;
            const score = s + e >= 5 ? 1 : 0;
            if (!best || score > best.score) best = { score, why: `${P.firstWord} + ${Q.lastWord}` };
          }
        }
        if (best) found.push({ item, f: figures(item, sex), score: best.score, why: best.why });
      }
      out.starts = pick(found);
    }

    // (2) The parents' initials: names that start with one and have the
    // other's initial further in (Elijah for Emma and James), then names
    // that start with either. A vowel further in doesn't count: nearly every
    // name has one.
    {
      const inits = [...new Set(parents.map((p) => p.initial))];
      const found = [];
      for (const item of pool) {
        const first = item.plain.charAt(0);
        if (!inits.includes(first)) continue;
        const other = inits.length > 1 ? inits.find((i) => i !== first) : null;
        // Rare names go with the rest, so a run of them can't fill the top.
        const fig = figures(item, sex);
        const common = fig.rank ? fig.rank <= 1000 : fig.pastRank <= 500;
        const both = other && common && !/[aeiou]/.test(other) && item.plain.slice(1).includes(other);
        found.push({ item, f: figures(item, sex), score: both ? 1 : 0, why: both ? `${first.toUpperCase()} + ${other.toUpperCase()}` : `${first.toUpperCase()}` });
      }
      out.initials = inits.length > 1 ? takeTurns(found, (r) => r.item.plain.charAt(0), inits) : pick(found);
    }

    // (3) Has a sound from each parent's name in it, in either order: a run
    // of three or more letters from one and two or more from the other.
    if (A && B) {
      const shown = new Set(out.starts.map((r) => r.name));
      const found = [];
      for (const item of pool) {
        if (shown.has(item.name)) continue;
        let best = 0;
        for (let v = 0; v < 2; v++) {
          const k = v ? item.plain : item.key;
          const as = v ? A.parts : A.keys;
          const bs = v ? B.parts : B.keys;
          as.forEach((a) => bs.forEach((b) => { best = Math.max(best, bothChunks(k, a, b) || 0); }));
        }
        if (best >= Math.min(5, A.whole.length + B.whole.length)) found.push({ item, f: figures(item, sex), score: 0, why: '' });
      }
      out.sounds = pick(found);
    }

    // (4) The same rhythm as one parent's name: the same number of beats and
    // the same ending sound (Gemma for Emma), closest endings first.
    {
      const found = [];
      for (const item of pool) {
        let best = null;
        for (const P of parents) {
          const e = Math.max(endLen(item.key, P.whole), endLen(item.plain, P.parts.join('')));
          if (e < Math.max(2, P.rhyme.length) || item.key === P.whole) continue;
          if (item.beats !== P.beats) continue;
          const score = 0; // most popular first, as with every group
          if (!best || score > best.score) best = { score, why: `like ${P.shown}`, who: P };
        }
        if (best) found.push({ item, f: figures(item, sex), score: best.score, why: best.why, who: best.who });
      }
      out.rhythm = parents.length > 1 ? takeTurns(found, (r) => r.who, parents) : pick(found);
    }

    // Blends: new names made from both, ship-name style (lib/recipe-engine.js).
    const RE = global.RecipeEngine;
    if (A && B && RE && RE.blends) {
      const real = new Map(names.map((item) => [item.plain, item]));
      const a = A.parts[0];
      const b = B.parts[B.parts.length - 1];
      const nice = (w) => w.charAt(0).toUpperCase() + w.slice(1);
      out.blends = RE.blends(nice(a), nice(b), 12)
        .filter((w) => !own.has(plain(w)))
        .map((w) => ({ name: w, real: real.has(plain(w)) }));
    }
    return out;
  }

  const ParentNames = { plain, soundKey, syllables, rhyme, parent, loadNames, suggest, popularity };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ParentNames;
    return;
  }
  global.ParentNames = ParentNames;

  // ---- The page ----

  const BATCH = 12;
  const STORE = 'tng-parents';
  const GROUPS = [
    ['starts', 'Starts like one of you, ends like the other', 'The opening of one name and the ending of the other, by sound or spelling.'],
    ['initials', 'Shares your initials', 'Starts with one of your initials. Names with both come first.'],
    ['sounds', 'Has a sound from both of you', 'A run of letters from each of your names, anywhere in the name.'],
    ['rhythm', 'Same rhythm as your names', 'The same number of beats and the same ending as one of your names.'],
  ];

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function rankText(r) {
    if (r.rank) return { short: `No. ${r.rank.toLocaleString('en-GB')}`, long: `No. ${r.rank.toLocaleString('en-GB')} in England and Wales in 2025` };
    if (r.pastRank) return { short: `${r.pastYear}: No. ${r.pastRank.toLocaleString('en-GB')}`, long: `Not in the 2025 top list; No. ${r.pastRank.toLocaleString('en-GB')} in ${r.pastYear}` };
    return { short: 'Rare', long: 'Given to only a few babies' };
  }

  function setup() {
    const root = document.getElementById('pn-tool');
    if (!root) return;
    const form = document.getElementById('pn-form');
    const inA = document.getElementById('pn-a');
    const inB = document.getElementById('pn-b');
    const sexInput = document.getElementById('pn-sex');
    const out = document.getElementById('pn-results');
    const blendsList = document.getElementById('pn-blends');
    const blendsToggle = document.getElementById('pn-blends-toggle');
    const blendsGroup = document.getElementById('pn-blendgroup');
    let blendsOn = false;
    const live = document.getElementById('pn-live');
    const page = root.dataset.page || '';
    const title = root.dataset.title || '';
    let names = null;
    let loading = null;

    function load() {
      if (names) return Promise.resolve(names);
      if (!loading) {
        loading = fetch(root.dataset.src).then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
          .then((data) => { names = loadNames(data); return names; });
      }
      return loading;
    }

    // Remember the last names typed, in this browser only.
    function remember() {
      try { global.localStorage.setItem(STORE, JSON.stringify({ a: inA.value, b: inB.value, sex: sexInput.value, blends: blendsOn })); } catch (e) { /* storage blocked */ }
    }
    function recall() {
      try {
        const saved = JSON.parse(global.localStorage.getItem(STORE));
        if (!saved) return;
        if (typeof saved.a === 'string') inA.value = saved.a;
        if (typeof saved.b === 'string') inB.value = saved.b;
        if (saved.sex) setSex(saved.sex);
        blendsOn = !!saved.blends;
      } catch (e) { /* storage blocked */ }
    }

    function setOpt(group, input, value) {
      const btn = root.querySelector(`${group} .opt[data-value="${value}"]`);
      if (!btn) return;
      input.value = value;
      root.querySelectorAll(`${group} .opt`).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    }
    const setSex = (value) => setOpt('.pn-sex', sexInput, value);

    function item(r, sex) {
      const rt = rankText(r);
      const tag = sex === 'either' && r.sex !== 'both' ? ` · ${r.sex}` : '';
      // Initials are explained by the heading; the other groups say which parent each part came from.
      const why = r.why && !/^[A-Z]( \+ [A-Z])?$/.test(r.why) ? `<span class="pn-why">${esc(r.why)}</span>` : '';
      return `<li class="pn-item"><div class="pn-main"><button type="button" class="n name-copy" title="Copy">${esc(r.name)}</button>` +
        `<span class="pn-meta" title="${esc(rt.long)}">${esc(rt.short)}${esc(tag)}${why}</span></div>` +
        `<button type="button" class="save hd tap name-save" data-name="${esc(r.name)}" data-title="${esc(title)}" data-page="${esc(page)}"><svg class="ic" aria-hidden="true" focusable="false"><use href="#i-bookmark"/></svg></button></li>`;
    }

    function groupHtml(key, heading, sub, list, sex, note) {
      const head = (count) => `<h3 class="pn-h">${esc(heading)}${count}</h3><p class="pn-sub">${esc(sub)}</p>`;
      if (!list.length) {
        return `<section class="pn-group" data-group="${key}">${head('')}<p class="pn-none">${esc(note)}</p></section>`;
      }
      const first = list.slice(0, BATCH).map((r) => item(r, sex)).join('');
      const more = list.length > BATCH ? `<button type="button" class="more hd tap pn-more" data-group="${key}">+ Show ${Math.min(BATCH, list.length - BATCH)} more</button>` : '';
      return `<section class="pn-group" data-group="${key}">${head(` <span class="pn-count">${list.length}${list.length >= 60 ? '+' : ''}</span>`)}<ul class="pn-list">${first}</ul>${more}</section>`;
    }

    let current = null;

    function render() {
      const a = inA.value;
      const b = inB.value;
      const sex = sexInput.value;
      if (!plain(a) && !plain(b)) {
        out.innerHTML = (a + b).trim()
          ? '<p class="results-empty">The name lists use the letters A to Z, so type the names in those letters (accents are fine).</p>'
          : '<p class="results-empty">Type at least one name to see ideas.</p>';
        current = null;
        renderBlends(null);
        return;
      }
      const res = suggest(names, a, b, sex);
      current = { res, sex };
      const one = !res.a || !res.b;
      const notes = {
        starts: one ? 'Add both names for this one.' : 'No real names start like one of you and end like the other. Try the groups below.',
        initials: 'No names start with these letters.',
        sounds: one ? 'Add both names for this one.' : 'No real names have a sound from both names. Try the groups above.',
        rhythm: 'No close matches for the rhythm of these names.',
      };
      let html = GROUPS.map(([key, heading, sub]) => groupHtml(key, heading, sub, res[key], sex, notes[key])).join('');
      out.innerHTML = html;
      renderBlends(res);
      if (global.NamePage && global.NamePage.syncSaves) global.NamePage.syncSaves();
      const total = GROUPS.reduce((n, [key]) => n + res[key].length, 0);
      if (live) live.textContent = total ? `Found ${total} name ideas.` : 'No matches. Try another spelling.';
    }

    // The invented blends: a separate, labelled list, shown only when asked for.
    function renderBlends(res) {
      const have = res && res.blends.length;
      blendsGroup.hidden = !have;
      if (!have) return;
      blendsToggle.setAttribute('aria-expanded', String(blendsOn));
      const label = [...blendsToggle.childNodes].find((n) => n.nodeType === 3 && n.nodeValue.trim());
      if (label) label.nodeValue = blendsOn ? 'Hide blends' : 'Show blends';
      blendsList.hidden = !blendsOn;
      blendsList.innerHTML = blendsOn ? res.blends.map((x) => `<li class="pn-item"><div class="pn-main"><button type="button" class="n name-copy" title="Copy">${esc(x.name)}</button><span class="pn-meta">${x.real ? 'Also a real name' : 'Invented'}</span></div>` +
        `<button type="button" class="save hd tap name-save" data-name="${esc(x.name)}" data-title="${esc(title)}" data-page="${esc(page)}"><svg class="ic" aria-hidden="true" focusable="false"><use href="#i-bookmark"/></svg></button></li>`).join('') : '';
    }

    function go(scroll) {
      remember();
      out.setAttribute('aria-busy', 'true');
      load().then(() => {
        render();
        out.removeAttribute('aria-busy');
        if (scroll) {
          const top = out.getBoundingClientRect().top;
          if (top > global.innerHeight * 0.7) out.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }).catch(() => {
        out.removeAttribute('aria-busy');
        out.innerHTML = '<p class="results-error">The name lists didn\'t load. Check your connection and try again.</p>';
      });
    }

    out.addEventListener('click', (e) => {
      const btn = e.target.closest('.pn-more');
      if (!btn || !current) return;
      const key = btn.dataset.group;
      const list = current.res[key];
      const ul = btn.previousElementSibling;
      const have = ul.children.length;
      ul.insertAdjacentHTML('beforeend', list.slice(have, have + BATCH).map((r) => item(r, current.sex)).join(''));
      if (global.NamePage && global.NamePage.syncSaves) global.NamePage.syncSaves();
      const left = list.length - ul.children.length;
      if (left > 0) {
        // Change only the label text, so the button keeps its drawn outline.
        const label = [...btn.childNodes].find((n) => n.nodeType === 3 && n.nodeValue.trim());
        if (label) label.nodeValue = `+ Show ${Math.min(BATCH, left)} more`;
      } else {
        btn.remove();
      }
      const next = ul.children[have] && ul.children[have].querySelector('.name-copy');
      if (next) next.focus({ preventScroll: true });
    });

    root.querySelectorAll('.pn-sex .opt').forEach((btn) => btn.addEventListener('click', () => {
      setSex(btn.dataset.value);
      if (current || plain(inA.value) || plain(inB.value)) go(false);
    }));
    blendsToggle.addEventListener('click', () => {
      blendsOn = !blendsOn;
      remember();
      renderBlends(current && current.res);
      if (global.NamePage && global.NamePage.syncSaves) global.NamePage.syncSaves();
    });
    form.addEventListener('submit', (e) => { e.preventDefault(); go(true); });

    // ?a=Emma&b=James opens with those names (links from the page copy).
    const params = new URLSearchParams(global.location.search);
    if (params.get('a') || params.get('b')) {
      inA.value = params.get('a') || '';
      inB.value = params.get('b') || '';
      if (params.get('sex')) setSex(params.get('sex'));
    } else {
      recall();
    }
    go(false);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
  else setup();
})(typeof window !== 'undefined' ? window : this);
