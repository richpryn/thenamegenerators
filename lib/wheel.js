/**
 * Spin the Wheel (spin-the-wheel.html). Built to docs/redesign/WHEEL.md.
 *
 * The winner is picked with crypto.getRandomValues the moment Spin is pressed;
 * the animation only shows where it landed. The list lives in the textarea,
 * is saved in this browser (localStorage "tng-wheel") and can be shared as a
 * #names= link, so names never reach the server.
 */
(function (global) {
  'use strict';

  const MAX_LINES = 500;
  const MAX_LABELLED = 120;
  const SPIN_MS = 5200;
  const STORE_KEY = 'tng-wheel';
  const SHARE_BASE = 'https://thenamegenerators.com/spin-the-wheel.html';
  const START = ['Ada', 'Ben', 'Chloe', 'Dev', 'Ellie', 'Femi', 'Grace', 'Hassan'];
  const INK = '#1e1c18';

  const $ = (id) => document.getElementById(id);
  const root = $('wheel-tool');
  if (!root) return;

  const ta = $('wt-names');
  const canvas = $('wt-wheel');
  const spinner = $('wt-spinner');
  const pointer = $('wt-pointer');
  const reduce = global.matchMedia ? global.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  const css = getComputedStyle(document.documentElement);
  const SEG = ['--seg-paper', '--seg-hi', '--seg-pen', '--seg-sage', '--seg-peach']
    .map((v) => css.getPropertyValue(v).trim() || '#fffcf4');

  let names = [];          // what's on the wheel: trimmed, no blanks, no duplicates, max 500
  let removedDupes = 0;    // duplicates left out of the last parse
  let rotation = 0;
  let spinning = false;
  let lastWinner = -1;     // index into names, or -1
  let fromLink = false;    // list came from a share link: don't overwrite the saved list until edited

  // ---------- list ----------

  function parse(text) {
    const out = [];
    const seen = new Set();
    let dupes = 0;
    let lines = 0;
    for (const line of text.split(/\r?\n/)) {
      const t = line.trim();
      if (!t) continue;
      lines++;
      const key = t.toLocaleLowerCase();
      if (seen.has(key)) { dupes++; continue; }
      if (out.length >= MAX_LINES) continue;
      seen.add(key);
      out.push(t);
    }
    return { list: out, dupes, lines };
  }

  function setList(list) {
    ta.value = list.join('\n');
  }

  // Tidy the box itself (drop blanks and duplicates) when the visitor isn't mid-word
  function tidy() {
    const { list, dupes } = parse(ta.value);
    if (dupes || ta.value !== list.join('\n')) {
      if (document.activeElement !== ta || dupes) setList(list);
    }
  }

  function load() {
    const fromHash = readHash();
    if (fromHash) {
      fromLink = true;
      setList(fromHash);
      return;
    }
    let text = START.join('\n');
    try {
      const s = JSON.parse(global.localStorage.getItem(STORE_KEY) || 'null');
      if (s && s.v === 1 && typeof s.names === 'string') text = s.names;
    } catch (e) { /* storage blocked: use the starter list */ }
    ta.value = text;
  }

  function save() {
    if (fromLink) return;
    try { global.localStorage.setItem(STORE_KEY, JSON.stringify({ v: 1, names: ta.value })); } catch (e) { /* not saved */ }
  }

  function readHash() {
    const m = global.location.hash.match(/(?:^#|&)names=([^&]*)/);
    if (!m || !m[1]) return null;
    const list = m[1].split('~').map((part) => {
      try { return decodeURIComponent(part).trim(); } catch (e) { return ''; }
    }).filter(Boolean);
    return list.length ? list : null;
  }

  // ---------- drawing ----------

  function colourFor(i, n) {
    let c = i % SEG.length;
    if (n > 1 && i === n - 1 && c === 0) c = 2; // never the same colour next to the first slice
    return SEG[c];
  }

  // Fixed wobble, so the wheel doesn't shimmer while you type
  function jitter(seed) {
    let s = seed * 9973 + 17;
    return () => { s = (s * 9301 + 49297) % 233280; return s / 233280 - 0.5; };
  }

  const segmenter = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter() : null;
  function graphemes(str) {
    return segmenter ? Array.from(segmenter.segment(str), (g) => g.segment) : Array.from(str);
  }

  // Cut a label to fit, never splitting an emoji or accented letter
  function fit(ctx, text, max) {
    if (ctx.measureText(text).width <= max) return text;
    const g = graphemes(text);
    let lo = 0;
    let hi = g.length;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (ctx.measureText(g.slice(0, mid).join('') + '…').width <= max) lo = mid; else hi = mid - 1;
    }
    return lo ? g.slice(0, lo).join('').trimEnd() + '…' : '';
  }

  function labelSize(n, r) {
    if (n > MAX_LABELLED) return 0;
    const arc = (2 * Math.PI / n) * r * 0.82;
    return Math.max(8, Math.min(19, arc * 0.58, r * 0.11));
  }

  function drawWheel() {
    const S = Math.round(canvas.parentElement.getBoundingClientRect().width);
    if (!S) return;
    const dpr = Math.min(2, global.devicePixelRatio || 1);
    canvas.width = S * dpr;
    canvas.height = S * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, S, S);
    const c = S / 2;
    const r = c - 6;
    const n = names.length;
    const j = jitter(7);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (!n) {
      ctx.beginPath();
      ctx.arc(c, c, r, 0, Math.PI * 2);
      ctx.fillStyle = SEG[0];
      ctx.fill();
    } else {
      const step = 2 * Math.PI / n;
      const a0 = -Math.PI / 2;
      for (let i = 0; i < n; i++) {
        ctx.beginPath();
        ctx.moveTo(c, c);
        ctx.arc(c, c, r, a0 + i * step, a0 + (i + 1) * step);
        ctx.closePath();
        ctx.fillStyle = colourFor(i, n);
        ctx.fill();
      }
      if (n > 1) {
        ctx.strokeStyle = INK;
        ctx.lineWidth = n > 60 ? 0.7 : n > 24 ? 1 : 1.4;
        for (let i = 0; i < n; i++) {
          const a = a0 + i * step;
          const x = c + Math.cos(a) * r;
          const y = c + Math.sin(a) * r;
          const mx = c + Math.cos(a) * r * 0.5 + j() * 2.4;
          const my = c + Math.sin(a) * r * 0.5 + j() * 2.4;
          ctx.beginPath();
          ctx.moveTo(c, c);
          ctx.quadraticCurveTo(mx, my, x, y);
          ctx.stroke();
        }
      }
      const fs = labelSize(n, r);
      if (fs) {
        ctx.fillStyle = INK;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'right';
        ctx.font = `${n > 30 ? 600 : 700} ${fs}px "Schibsted Grotesk","Helvetica Neue",Arial,sans-serif`;
        const inner = r * 0.2;
        const maxLen = r - 14 - inner;
        for (let i = 0; i < n; i++) {
          ctx.save();
          ctx.translate(c, c);
          ctx.rotate(a0 + (i + 0.5) * step);
          ctx.fillText(fit(ctx, names[i], maxLen), r - 14, 0);
          ctx.restore();
        }
      }
    }

    // Rim: a marker line and a lighter sketch line, both a little wobbly
    const rim = (rad, w, alpha, seed) => {
      const jj = jitter(seed);
      ctx.beginPath();
      for (let k = 0; k <= 72; k++) {
        const a = k / 72 * Math.PI * 2;
        const rr = rad + jj() * 1.6;
        const x = c + Math.cos(a) * rr;
        const y = c + Math.sin(a) * rr;
        if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y);
      }
      ctx.globalAlpha = alpha;
      ctx.lineWidth = w;
      ctx.strokeStyle = INK;
      ctx.stroke();
      ctx.globalAlpha = 1;
    };
    rim(r, 2.6, 1, 3);
    rim(r + 3, 0.9, 0.4, 9);

    // Hub
    ctx.beginPath();
    ctx.arc(c, c, r * 0.1 + 6, 0, Math.PI * 2);
    ctx.fillStyle = SEG[0];
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = INK;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(c, c, 4, 0, Math.PI * 2);
    ctx.fillStyle = INK;
    ctx.fill();
  }

  // ---------- state ----------

  function announce(text) {
    const live = $('wt-live');
    live.textContent = '';
    setTimeout(() => { live.textContent = text; }, 30);
  }

  function refresh() {
    const parsed = parse(ta.value);
    names = parsed.list;
    removedDupes = parsed.dupes;
    const n = names.length;

    $('wt-count').textContent = n === 1 ? '1 name' : n ? `${n} names` : 'No names yet';
    $('wt-desc').textContent = `Wheel with ${n} ${n === 1 ? 'name' : 'names'}. Press Space or Enter to spin.`;
    $('wt-empty').hidden = n >= 2;

    const hint = $('wt-hint');
    if (parsed.lines - parsed.dupes > MAX_LINES) hint.textContent = `Only the first ${MAX_LINES} names go on the wheel.`;
    else if (parsed.dupes) hint.textContent = `Removed ${parsed.dupes} ${parsed.dupes === 1 ? 'duplicate' : 'duplicates'}.`;
    else if (n > MAX_LABELLED) hint.textContent = `With more than ${MAX_LABELLED} names the wheel shows colours only. The winner appears in the card.`;
    else if (n === 1) hint.textContent = 'Add at least one more name to spin.';
    else hint.textContent = '';

    const can = n >= 2 && !spinning;
    $('wt-spin').disabled = !can;
    spinner.setAttribute('aria-disabled', String(!can));
    spinner.tabIndex = can ? 0 : -1;
    if (lastWinner >= n) lastWinner = -1;
    $('wt-remove').disabled = lastWinner < 0 || spinning;
    $('wt-shuffle').disabled = n < 2 || spinning;
    $('wt-confirm-text').textContent = `Clear all ${n} ${n === 1 ? 'name' : 'names'}?`;
    $('wt-sharebox').hidden = true;
    drawWheel();
    save();
  }

  // ---------- spinning ----------

  const ease = (t) => 1 - Math.pow(1 - t, 4); // easeOutQuart: quick start, long slow finish

  function pick(n) {
    const a = new Uint32Array(1);
    global.crypto.getRandomValues(a);
    return a[0] % n;
  }

  function setRotation(rad) {
    rotation = rad;
    canvas.style.transform = `rotate(${rad}rad)`;
  }

  function underPointer(rad, n) {
    const step = 2 * Math.PI / n;
    const a = ((-rad % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    return Math.floor(a / step) % n;
  }

  function spin() {
    tidy();
    refresh();
    const n = names.length;
    if (n < 2 || spinning) return;
    hideWinner();
    spinning = true;
    ta.readOnly = true;
    refresh();
    $('wt-spin-label').textContent = 'Spinning…';
    announce('Spinning…');

    const win = pick(n);
    const step = 2 * Math.PI / n;
    const off = (Math.random() - 0.5) * 0.7; // land somewhere inside the slice, not dead centre
    const target = -((win + 0.5 + off) * step);
    const cur = rotation % (2 * Math.PI);
    const delta = ((target - cur) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    const end = rotation + (5 + Math.floor(Math.random() * 2)) * 2 * Math.PI + delta;

    if (reduce.matches) {
      setRotation(end);
      finish(win);
      return;
    }
    const from = rotation;
    const t0 = performance.now();
    let last = underPointer(from, n);
    (function frame(now) {
      const t = Math.min(1, (now - t0) / SPIN_MS);
      const rad = from + (end - from) * ease(t);
      setRotation(rad);
      const at = underPointer(rad, n);
      if (at !== last && n <= 60) {
        last = at;
        pointer.classList.add('tick');
        setTimeout(() => pointer.classList.remove('tick'), 70);
      }
      if (t < 1) requestAnimationFrame(frame); else finish(win);
    })(t0);
  }

  function finish(win) {
    spinning = false;
    ta.readOnly = false;
    lastWinner = win;
    $('wt-spin-label').textContent = 'Spin';
    const name = names[win];
    $('wt-winner-name').firstElementChild.textContent = name;
    const card = $('wt-winner');
    card.hidden = false;
    card.classList.remove('show');
    void card.offsetWidth;
    card.classList.add('show');
    if (global.Outline) {
      global.Outline.draw(card, true);
      card.querySelectorAll('.hd').forEach((el) => global.Outline.draw(el, true));
    }
    $('wt-status').textContent = `Last winner: ${name}`;
    announce(`The wheel picked ${name}.`);
    refresh();
    $('wt-win-remove').focus({ preventScroll: true });
    if (!reduce.matches) confetti();
  }

  function hideWinner() {
    $('wt-winner').hidden = true;
  }

  function removeWinner() {
    if (lastWinner < 0) return;
    const gone = names[lastWinner];
    const list = names.slice();
    list.splice(lastWinner, 1);
    setList(list);
    lastWinner = -1;
    fromLink = false;
    hideWinner();
    refresh();
    announce(`${gone} removed. ${names.length} left.`);
    $('wt-status').textContent = `${gone} removed`;
  }

  // Marker-stroke confetti, about 1.4 seconds
  function confetti() {
    const cv = $('wt-confetti');
    const b = cv.getBoundingClientRect();
    const dpr = Math.min(2, global.devicePixelRatio || 1);
    cv.width = b.width * dpr;
    cv.height = b.height * dpr;
    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cols = [INK, '#efc84a', '#35577a', '#c8714f'];
    const bits = Array.from({ length: 34 }, (_, i) => ({
      x: b.width * (0.2 + Math.random() * 0.6), y: b.height * 0.35,
      vx: (Math.random() - 0.5) * 5, vy: -3 - Math.random() * 4,
      a: Math.random() * 6, va: (Math.random() - 0.5) * 0.3,
      l: 6 + Math.random() * 8, c: cols[i % cols.length],
    }));
    const t0 = performance.now();
    (function f(now) {
      const t = (now - t0) / 1400;
      ctx.clearRect(0, 0, b.width, b.height);
      if (t >= 1) return;
      ctx.globalAlpha = 1 - t * t;
      ctx.lineCap = 'round';
      ctx.lineWidth = 2.4;
      for (const p of bits) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.22; p.a += p.va;
        ctx.strokeStyle = p.c;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.quadraticCurveTo(p.x + Math.cos(p.a) * p.l * 0.5 + 2, p.y + Math.sin(p.a) * p.l * 0.5 - 2,
          p.x + Math.cos(p.a) * p.l, p.y + Math.sin(p.a) * p.l);
        ctx.stroke();
      }
      requestAnimationFrame(f);
    })(t0);
  }

  // ---------- list tools ----------

  function shuffleList() {
    const list = names.slice();
    for (let i = list.length - 1; i > 0; i--) {
      const k = pick(i + 1);
      [list[i], list[k]] = [list[k], list[i]];
    }
    setList(list);
    lastWinner = -1;
    fromLink = false;
    hideWinner();
    refresh();
    announce('List shuffled.');
  }

  // Add 8 names from one of the site's generators, using its default choices
  async function fillFrom() {
    const select = $('wt-fill-from');
    const key = select.value;
    const label = select.selectedOptions[0].textContent;
    const button = $('wt-fill');
    button.disabled = true;
    try {
      const res = await fetch(`data/generators/${encodeURIComponent(key)}.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const gen = global.RecipeEngine.createGenerator(await res.json());
      const have = new Set(names.map((x) => x.toLocaleLowerCase()));
      const add = gen.generate({}, 24).filter((x) => !have.has(x.toLocaleLowerCase())).slice(0, 8);
      setList(names.concat(add));
      fromLink = false;
      refresh();
      announce(`Added ${add.length} ${label.toLowerCase()}.`);
    } catch (e) {
      $('wt-hint').textContent = "Couldn't load those names. Please try again.";
    } finally {
      button.disabled = false;
    }
  }

  function shareLink() {
    const enc = names.map((x) => encodeURIComponent(x).replace(/~/g, '%7E')).join('~');
    return `${SHARE_BASE}#names=${enc}`;
  }

  async function copyShare() {
    const url = shareLink();
    const box = $('wt-sharebox');
    const input = $('wt-share-url');
    const note = $('wt-share-note');
    box.hidden = false;
    input.value = url;
    if (url.length > 2000) {
      note.textContent = 'This list is too long for a link. Copy the names from the box instead, or share fewer.';
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      note.textContent = 'Link copied. Anyone who opens it sees this exact list. Nothing is saved on our server.';
    } catch (e) {
      input.focus();
      input.select();
      note.textContent = 'Press Ctrl+C or ⌘C to copy the selected link.';
    }
  }

  // ---------- wiring ----------

  ta.addEventListener('input', () => {
    clearTimeout(ta._t);
    ta._t = setTimeout(() => { fromLink = false; lastWinner = -1; refresh(); }, 120);
  });
  ta.addEventListener('change', () => { tidy(); refresh(); });
  ta.addEventListener('paste', () => setTimeout(() => { tidy(); fromLink = false; refresh(); }, 0));

  $('wt-spin').addEventListener('click', spin);
  spinner.addEventListener('click', spin);
  spinner.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); spin(); }
  });
  $('wt-win-again').addEventListener('click', () => { hideWinner(); spin(); });
  $('wt-win-remove').addEventListener('click', () => { removeWinner(); spin(); });
  $('wt-win-close').addEventListener('click', () => { hideWinner(); $('wt-spin').focus(); });
  $('wt-remove').addEventListener('click', removeWinner);
  $('wt-shuffle').addEventListener('click', shuffleList);
  $('wt-fill').addEventListener('click', fillFrom);
  $('wt-share').addEventListener('click', copyShare);
  $('wt-clear').addEventListener('click', () => {
    $('wt-actions').hidden = true;
    $('wt-confirm').hidden = false;
    $('wt-confirm-no').focus();
  });
  $('wt-confirm-no').addEventListener('click', () => {
    $('wt-confirm').hidden = true;
    $('wt-actions').hidden = false;
    $('wt-clear').focus();
  });
  $('wt-confirm-yes').addEventListener('click', () => {
    ta.value = '';
    lastWinner = -1;
    fromLink = false;
    hideWinner();
    $('wt-confirm').hidden = true;
    $('wt-actions').hidden = false;
    refresh();
    ta.focus();
    announce('List cleared.');
  });

  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(() => drawWheel()).observe(canvas.parentElement);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawWheel);

  load();
  tidy();
  refresh();

  // For tests: where the wheel would stop for a given rotation
  global.SpinWheel = { underPointer, parse, names: () => names.slice() };
})(typeof window !== 'undefined' ? window : this);
