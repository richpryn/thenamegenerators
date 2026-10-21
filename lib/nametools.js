/**
 * The name tools that share Spin the Wheel's list box (docs/redesign/WHEEL.md,
 * "Sibling tools"): Random Name Picker, Raffle, Secret Santa and Team
 * Generator. The page says which one it is with data-tool on #name-tool.
 *
 * Every tool: names one per line (trimmed, blanks ignored, duplicates removed,
 * max 500), saved in this browser under "tng-<tool>", shareable as a
 * #names=Ada~Ben link (plus the tool's own setting), Fill from a generator,
 * and an in-page Clear confirmation. Random picks use crypto.getRandomValues.
 */
(function (global) {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const root = $('name-tool');
  if (!root) return;

  const TOOL = root.dataset.tool;
  const PAGE = root.dataset.page;
  const MIN = Number(root.dataset.min || 2);
  const MAX_LINES = 500;
  const STORE_KEY = `tng-${TOOL}`;
  const SHARE_BASE = `https://thenamegenerators.com/${PAGE}`;
  const START = ['Ada', 'Ben', 'Chloe', 'Dev', 'Ellie', 'Femi', 'Grace', 'Hassan'];
  const reduce = global.matchMedia ? global.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

  const ta = $('nt-names');
  const go = $('nt-go');
  const setting = $('nt-setting'); // the tool's own option (winners, teams), if it has one
  let names = [];
  let busy = false;
  let fromLink = false;

  // ---------- helpers ----------

  function pick(n) {
    const a = new Uint32Array(1);
    global.crypto.getRandomValues(a);
    return a[0] % n;
  }

  function shuffled(list) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const k = pick(i + 1);
      [out[i], out[k]] = [out[k], out[i]];
    }
    return out;
  }

  function announce(text) {
    const live = $('nt-live');
    live.textContent = '';
    setTimeout(() => { live.textContent = text; }, 30);
  }

  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  const wait = (ms) => new Promise((r) => setTimeout(r, reduce.matches ? 0 : ms));

  async function copyText(text, note) {
    try {
      await navigator.clipboard.writeText(text);
      announce(note);
      return true;
    } catch (e) {
      return false;
    }
  }

  // ---------- the list ----------

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

  function setList(list) { ta.value = list.join('\n'); }

  function tidy() {
    const { list, dupes } = parse(ta.value);
    if (dupes || (document.activeElement !== ta && ta.value !== list.join('\n'))) setList(list);
  }

  function readHash() {
    const params = {};
    global.location.hash.replace(/^#/, '').split('&').forEach((pair) => {
      const i = pair.indexOf('=');
      if (i > 0) params[pair.slice(0, i)] = pair.slice(i + 1);
    });
    if (!params.names) return null;
    const list = params.names.split('~').map((part) => {
      try { return decodeURIComponent(part).trim(); } catch (e) { return ''; }
    }).filter(Boolean);
    return list.length ? { list, params } : null;
  }

  function load() {
    const fromHash = readHash();
    let stored = null;
    try { stored = JSON.parse(global.localStorage.getItem(STORE_KEY) || 'null'); } catch (e) { /* blocked */ }
    if (fromHash) {
      fromLink = true;
      setList(fromHash.list);
      if (setting && fromHash.params[setting.dataset.param]) setSetting(decodeURIComponent(fromHash.params[setting.dataset.param]));
      if (tool.fromParams) tool.fromParams(fromHash.params);
      return;
    }
    ta.value = stored && stored.v === 1 && typeof stored.names === 'string' ? stored.names : START.join('\n');
    if (stored && setting && stored.setting) setSetting(stored.setting);
    if (stored && tool.fromStored) tool.fromStored(stored);
  }

  function save() {
    if (fromLink) return;
    const data = { v: 1, names: ta.value };
    if (setting) data.setting = setting.value;
    if (tool.toStored) Object.assign(data, tool.toStored());
    try { global.localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch (e) { /* not saved */ }
  }

  function setSetting(value) {
    if (Array.from(setting.options).some((o) => o.value === value)) setting.value = value;
  }

  function refresh() {
    const parsed = parse(ta.value);
    names = parsed.list;
    const n = names.length;
    $('nt-count').textContent = n === 1 ? '1 name' : n ? `${n} names` : 'No names yet';
    const hint = $('nt-hint');
    if (parsed.lines - parsed.dupes > MAX_LINES) hint.textContent = `Only the first ${MAX_LINES} names are used.`;
    else if (parsed.dupes) hint.textContent = `Removed ${parsed.dupes} ${parsed.dupes === 1 ? 'duplicate' : 'duplicates'}.`;
    else if (n < MIN) hint.textContent = n ? `Add at least ${MIN - n} more ${MIN - n === 1 ? 'name' : 'names'}.` : `Add at least ${MIN} names.`;
    else hint.textContent = '';
    go.disabled = n < MIN || busy;
    $('nt-confirm-text').textContent = `Clear all ${n} ${n === 1 ? 'name' : 'names'}?`;
    $('nt-sharebox').hidden = true;
    if (tool.refresh) tool.refresh();
    save();
  }

  function listChanged() {
    fromLink = false;
    if (tool.reset) tool.reset();
    refresh();
  }

  // ---------- shared buttons ----------

  async function fillFrom() {
    const select = $('nt-fill-from');
    const label = select.selectedOptions[0].textContent;
    const button = $('nt-fill');
    button.disabled = true;
    try {
      const res = await fetch(`data/generators/${encodeURIComponent(select.value)}.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const gen = global.RecipeEngine.createGenerator(await res.json());
      const have = new Set(names.map((x) => x.toLocaleLowerCase()));
      const add = gen.generate({}, 24).filter((x) => !have.has(x.toLocaleLowerCase())).slice(0, 8);
      setList(names.concat(add));
      listChanged();
      announce(`Added ${add.length} ${label.toLowerCase()}.`);
    } catch (e) {
      $('nt-hint').textContent = "Couldn't load those names. Please try again.";
    } finally {
      button.disabled = false;
    }
  }

  async function copyShare() {
    let url = `${SHARE_BASE}#names=${names.map((x) => encodeURIComponent(x).replace(/~/g, '%7E')).join('~')}`;
    if (setting) url += `&${setting.dataset.param}=${encodeURIComponent(setting.value)}`;
    if (tool.shareParams) url += tool.shareParams();
    const box = $('nt-sharebox');
    const input = $('nt-share-url');
    const note = $('nt-share-note');
    box.hidden = false;
    input.value = url;
    if (url.length > 2000) {
      note.textContent = 'This list is too long for a link. Copy the names from the box instead, or share fewer.';
      return;
    }
    if (await copyText(url, 'Share link copied.')) {
      note.textContent = 'Link copied. Anyone who opens it sees this exact list. Nothing is saved on our server.';
    } else {
      input.focus();
      input.select();
      note.textContent = 'Press Ctrl+C or ⌘C to copy the selected link.';
    }
  }

  // ---------- the tools ----------

  const TOOLS = {};

  // Random Name Picker: a face-down deck; Draw turns the top card over.
  TOOLS.picker = (() => {
    let last = -1;
    const card = $('nt-card');
    const face = $('nt-card-face');
    const result = $('nt-result');
    return {
      refresh() {
        if (last >= names.length) last = -1;
        $('nt-remove').disabled = last < 0 || busy;
        $('nt-deck').classList.toggle('empty', names.length < MIN);
      },
      reset() { last = -1; result.hidden = true; face.textContent = '?'; card.classList.remove('up'); },
      async run() {
        result.hidden = true;
        card.classList.remove('up', 'flip');
        face.textContent = '?';
        void card.offsetWidth;
        const win = pick(names.length);
        if (!reduce.matches) card.classList.add('flip');
        await wait(350);
        face.textContent = names[win];
        card.classList.add('up');
        await wait(350);
        card.classList.remove('flip');
        last = win;
        $('nt-result-name').firstElementChild.textContent = names[win];
        result.hidden = false;
        announce(`You drew ${names[win]}.`);
        $('nt-result-remove').focus({ preventScroll: true });
      },
      removeLast() {
        if (last < 0) return;
        const gone = names[last];
        const list = names.slice();
        list.splice(last, 1);
        setList(list);
        listChanged();
        announce(`${gone} removed. ${names.length} left.`);
      },
    };
  })();

  // Raffle: numbered tickets; draw one or several winners in order.
  TOOLS.raffle = (() => {
    let winners = [];
    const grid = $('nt-tickets');
    const result = $('nt-result');
    const ordinal = (k) => ['1st', '2nd', '3rd'][k] || `${k + 1}th`;
    const ticketNo = (i) => `No. ${String(i + 1).padStart(3, '0')}`;
    return {
      refresh() {
        grid.replaceChildren(...names.map((name, i) => {
          const t = el('li', 'nt-ticket hd');
          t.append(el('i', null, ticketNo(i)), el('span', null, name));
          if (winners.includes(i)) t.classList.add('win');
          return t;
        }));
        const max = Math.max(1, Math.min(10, names.length - 1));
        Array.from(setting.options).forEach((o) => { o.disabled = Number(o.value) > max; o.hidden = o.disabled; });
        if (Number(setting.value) > max) setting.value = String(max);
        $('nt-remove').disabled = !winners.length || busy;
      },
      reset() { winners = []; result.hidden = true; },
      async run() {
        const count = Math.min(Number(setting.value), names.length);
        winners = shuffled(names.map((_, i) => i)).slice(0, count);
        const list = $('nt-winners');
        list.replaceChildren();
        result.hidden = false;
        refresh();
        grid.querySelectorAll('.win').forEach((t) => t.classList.remove('win'));
        for (let k = 0; k < winners.length; k++) {
          await wait(k ? 600 : 250);
          const i = winners[k];
          const li = el('li');
          li.append(el('b', null, ordinal(k)), el('i', null, ticketNo(i)), el('span', null, names[i]));
          list.appendChild(li);
          const ticket = grid.children[i];
          if (ticket) ticket.classList.add('win');
        }
        $('nt-result-title').textContent = winners.length === 1 ? 'The winner' : `The ${winners.length} winners`;
        announce(winners.length === 1
          ? `The winner is ${names[winners[0]]}, ticket ${ticketNo(winners[0])}.`
          : `The winners are ${winners.map((i, k) => `${ordinal(k)}, ${names[i]}`).join('; ')}.`);
        $('nt-result-copy').focus({ preventScroll: true });
      },
      removeLast() {
        if (!winners.length) return;
        const gone = new Set(winners);
        const list = names.filter((_, i) => !gone.has(i));
        const count = winners.length;
        setList(list);
        listChanged();
        announce(`${count} ${count === 1 ? 'winner' : 'winners'} removed. ${names.length} left.`);
      },
      copyResult() {
        return winners.map((i, k) => `${ordinal(k)}: ${names[i]} (${ticketNo(i)})`).join('\n');
      },
    };
  })();

  // Secret Santa: everyone gives to someone else, in one random circle
  // (Sattolo's algorithm), and each receiver stays hidden until tapped.
  TOOLS.santa = (() => {
    let pairs = [];
    const out = $('nt-pairs');
    const result = $('nt-result');
    function render() {
      out.replaceChildren(...pairs.map(([giver, receiver], i) => {
        const row = el('li', 'nt-pair');
        const tag = el('span', 'nt-tag hd', giver);
        const btn = el('button', 'nt-tag nt-reveal hd tap', 'Tap to reveal');
        btn.type = 'button';
        btn.setAttribute('aria-label', `Reveal who ${giver} buys for`);
        btn.addEventListener('click', () => {
          btn.textContent = receiver;
          btn.classList.add('shown');
          btn.disabled = true;
          btn.removeAttribute('aria-label');
          announce(`${giver} buys for ${receiver}.`);
        });
        row.append(tag, el('span', 'nt-arrow', '→'), btn);
        row.dataset.i = i;
        return row;
      }));
    }
    return {
      refresh() {},
      reset() { pairs = []; result.hidden = true; },
      async run() {
        const order = names.slice();
        for (let i = order.length - 1; i > 0; i--) {
          const k = pick(i); // Sattolo: k < i, so nobody stays put
          [order[i], order[k]] = [order[k], order[i]];
        }
        const nextOf = new Map(order.map((name, i) => [name, order[(i + 1) % order.length]]));
        pairs = names.map((giver) => [giver, nextOf.get(giver)]);
        render();
        result.hidden = false;
        announce(`Drawn. ${pairs.length} people, each with someone to buy for. Reveal them one at a time.`);
        $('nt-result-title').focus({ preventScroll: true });
      },
      revealAll() {
        out.querySelectorAll('.nt-reveal').forEach((b) => { if (!b.disabled) b.click(); });
      },
      copyResult() {
        return pairs.map(([g, r]) => `${g} → ${r}`).join('\n');
      },
    };
  })();

  // Team Generator: shuffle, then deal round-robin so sizes differ by at most one.
  TOOLS.teams = (() => {
    let teams = [];
    const out = $('nt-teams');
    const result = $('nt-result');
    const modeButtons = Array.from(document.querySelectorAll('[data-mode]'));
    let mode = 'teams';
    function setMode(m) {
      mode = m === 'size' ? 'size' : 'teams';
      modeButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
      $('nt-setting-label').textContent = mode === 'size' ? 'People per team' : 'Number of teams';
    }
    modeButtons.forEach((b) => b.addEventListener('click', () => { setMode(b.dataset.mode); refresh(); }));
    return {
      fromParams(p) { if (p.mode) setMode(p.mode); },
      fromStored(s) { if (s.mode) setMode(s.mode); },
      toStored() { return { mode }; },
      shareParams() { return `&mode=${mode}`; },
      refresh() {
        const n = names.length;
        const max = Math.max(2, Math.min(20, mode === 'size' ? n - 1 : n));
        Array.from(setting.options).forEach((o) => { o.disabled = Number(o.value) > max; o.hidden = o.disabled; });
        if (Number(setting.value) > max) setting.value = String(max);
      },
      reset() { teams = []; result.hidden = true; },
      async run() {
        const k = Number(setting.value);
        const count = mode === 'size' ? Math.ceil(names.length / k) : Math.min(k, names.length);
        teams = Array.from({ length: count }, () => []);
        shuffled(names).forEach((name, i) => teams[i % count].push(name));
        out.replaceChildren(...teams.map((members, t) => {
          const box = el('li', 'nt-team hd');
          box.append(el('b', null, `Team ${t + 1}`));
          const ul = el('ul');
          members.forEach((m) => ul.appendChild(el('li', null, m)));
          box.append(ul);
          return box;
        }));
        result.hidden = false;
        announce(`${count} teams made. ${teams.map((m, t) => `Team ${t + 1}: ${m.join(', ')}`).join('. ')}.`);
        $('nt-result-copy').focus({ preventScroll: true });
      },
      copyResult() {
        return teams.map((m, t) => `Team ${t + 1}: ${m.join(', ')}`).join('\n');
      },
    };
  })();

  const tool = TOOLS[TOOL];

  // ---------- wiring ----------

  ta.addEventListener('input', () => {
    clearTimeout(ta._t);
    ta._t = setTimeout(listChanged, 120);
  });
  ta.addEventListener('change', () => { tidy(); refresh(); });
  ta.addEventListener('paste', () => setTimeout(() => { tidy(); listChanged(); }, 0));
  if (setting) setting.addEventListener('change', () => { fromLink = false; refresh(); });

  async function run() {
    tidy();
    refresh();
    if (names.length < MIN || busy) return;
    busy = true;
    ta.readOnly = true;
    refresh();
    try { await tool.run(); } finally {
      busy = false;
      ta.readOnly = false;
      refresh();
    }
  }

  go.addEventListener('click', run);
  const again = $('nt-result-again');
  if (again) again.addEventListener('click', run);
  const removeBtn = $('nt-remove');
  if (removeBtn) removeBtn.addEventListener('click', () => tool.removeLast());
  const resultRemove = $('nt-result-remove');
  if (resultRemove) resultRemove.addEventListener('click', () => { tool.removeLast(); run(); });
  const revealAll = $('nt-reveal-all');
  if (revealAll) revealAll.addEventListener('click', () => tool.revealAll());
  const copyBtn = $('nt-result-copy');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const ok = await copyText(tool.copyResult(), 'Results copied.');
      copyBtn.textContent = ok ? 'Copied' : 'Copy failed';
      setTimeout(() => { copyBtn.textContent = copyBtn.dataset.label; }, 1500);
    });
  }

  $('nt-fill').addEventListener('click', fillFrom);
  $('nt-share').addEventListener('click', copyShare);
  $('nt-clear').addEventListener('click', () => {
    $('nt-actions').hidden = true;
    $('nt-confirm').hidden = false;
    $('nt-confirm-no').focus();
  });
  $('nt-confirm-no').addEventListener('click', () => {
    $('nt-confirm').hidden = true;
    $('nt-actions').hidden = false;
    $('nt-clear').focus();
  });
  $('nt-confirm-yes').addEventListener('click', () => {
    ta.value = '';
    $('nt-confirm').hidden = true;
    $('nt-actions').hidden = false;
    listChanged();
    ta.focus();
    announce('List cleared.');
  });

  load();
  tidy();
  refresh();

  global.NameTool = { tool: TOOL, names: () => names.slice() };
})(typeof window !== 'undefined' ? window : this);
