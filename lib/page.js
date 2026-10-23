/**
 * Page script shared by every page: the menu, plus the name generator widget.
 * The build (scripts/build-pages.js) also uses filtersHtml() so the controls
 * on generator pages are in the HTML before any JavaScript runs.
 *
 * Generator markup ("Grown Up B"):
 *   .simple-generator          the card holding the controls
 *   [data-filter]              one value per filter: a <select>, a text <input>,
 *                              or a hidden <input> driven by option buttons
 *   #generate-btn              makes 8 new names
 *   #results                   where names appear (data-long="true" = one column on phones)
 *   #more / #done              "Show 8 more", and the line shown when names run out
 *   #shortlist-line, #shortlist  the shortlist summary and list
 */
(function (global) {
  'use strict';

  const BATCH = 8;

  function escapeHtml(text) {
    return String(text == null ? '' : text)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function optionLabel(filter, opt) {
    if (filter.optionLabels && filter.optionLabels[opt]) return filter.optionLabels[opt];
    return opt.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }

  // Short lists of short options become big buttons; anything longer is a
  // dropdown. A label's example in brackets, "Harsh (Vharuzul)", becomes the
  // button "Harsh" with "e.g. Vharuzul" as a handwritten hint by the label.
  const MAX_BUTTONS = 6;
  const MAX_BUTTON_LABEL = 18;
  const MAX_BUTTON_TEXT = 62; // all of a group's labels together
  function splitLabel(text) {
    const m = String(text).match(/^(.*?)\s*\(([^()]*)\)\s*$/);
    return m && m[1] ? { label: m[1], hint: m[2] } : { label: String(text), hint: '' };
  }
  function usesButtons(filter) {
    if (filter.type === 'text' || !Array.isArray(filter.options) || filter.options.length > MAX_BUTTONS) return false;
    const labels = filter.options.map((opt) => splitLabel(optionLabel(filter, opt)).label);
    // Long labels together wrap into four or five rows on a phone, so they get a dropdown instead
    return labels.every((label) => label.length <= MAX_BUTTON_LABEL) &&
      labels.reduce((sum, label) => sum + label.length, 0) <= MAX_BUTTON_TEXT;
  }
  function hintText(hint) {
    if (!hint) return '';
    return /^(e\.g\.|eg\b)/i.test(hint) ? hint : `e.g. ${hint}`;
  }

  /** Markup for a generator's controls: option buttons, dropdowns and text boxes. */
  // `prefill` puts each text box's example in it, so blend generators open with names showing.
  function filtersHtml(filters, { prefill = false } = {}) {
    return Object.entries(filters || {}).map(([key, filter]) => {
      const k = escapeHtml(key);
      const id = `filter-${k}`;
      const label = escapeHtml(filter.label);
      if (filter.type === 'text') {
        return `
          <div class="group">
            <label class="label" for="${id}">${label}</label>
            <div class="ctl hd"><input type="text" id="${id}" name="${k}" data-filter="${k}" placeholder="${escapeHtml(filter.placeholder || '')}"${prefill && filter.example ? ` value="${escapeHtml(filter.example)}"` : ''} class="name-input" autocomplete="off"></div>
          </div>`;
      }
      if (usesButtons(filter)) {
        const parts = filter.options.map((opt) => splitLabel(optionLabel(filter, opt)));
        return `
          <div class="group" role="group" aria-labelledby="${id}-label">
            <div class="label"><span id="${id}-label">${label}</span><span class="pen" data-hint-for="${k}" aria-hidden="true">${escapeHtml(hintText(parts[0].hint))}</span></div>
            <div class="opts" data-buttons-for="${k}">
              ${filter.options.map((opt, i) => `<button type="button" class="opt hd tap" data-value="${escapeHtml(opt)}" data-hint="${escapeHtml(hintText(parts[i].hint))}"${parts[i].hint ? ` title="${escapeHtml(optionLabel(filter, opt))}"` : ''} aria-pressed="${i === 0}">${escapeHtml(parts[i].label)}</button>`).join('\n              ')}
            </div>
            <input type="hidden" id="${id}" name="${k}" data-filter="${k}" value="${escapeHtml(filter.options[0])}">
          </div>`;
      }
      return `
          <div class="group">
            <label class="label" for="${id}">${label}</label>
            <div class="ctl sel hd">
              <select id="${id}" name="${k}" data-filter="${k}">
                ${filter.options.map((opt) => `<option value="${escapeHtml(opt)}">${escapeHtml(optionLabel(filter, opt))}</option>`).join('\n                ')}
              </select>
            </div>
          </div>`;
    }).join('\n');
  }

  function readValues(root) {
    const values = {};
    root.querySelectorAll('[data-filter]').forEach((el) => { values[el.dataset.filter] = el.value; });
    return values;
  }

  function buttonsFor(root, key) {
    return root.querySelector(`[data-buttons-for="${key}"]`);
  }

  function setValue(root, key, value) {
    const input = root.querySelector(`[data-filter="${key}"]`);
    if (!input) return false;
    if (input.tagName === 'SELECT') {
      if (!Array.from(input.options).some((o) => o.value === value && !o.disabled)) return false;
      input.value = value;
      return true;
    }
    const group = buttonsFor(root, key);
    if (group) {
      const target = group.querySelector(`[data-value="${CSS.escape(value)}"]`);
      if (!target || target.hidden) return false;
      group.querySelectorAll('.opt').forEach((b) => b.setAttribute('aria-pressed', String(b === target)));
      const hint = root.querySelector(`[data-hint-for="${key}"]`);
      if (hint) hint.textContent = target.dataset.hint || '';
    }
    input.value = value;
    return true;
  }

  // Hide choices that don't exist for the choices before them (e.g. dragon
  // types for "neutral"), moving off a choice that just vanished.
  function updateAvailability(root, gen, config) {
    const values = readValues(root);
    for (const key of Object.keys(config.filters || {})) {
      if ((config.filters[key] || {}).type === 'text') continue;
      const allowed = new Set(gen.availableOptions(key, values));
      // A choice with only one option left (Gender for a band name) isn't a
      // choice: hide the whole field until it means something again.
      const field = root.querySelector(`[data-filter="${key}"]`);
      const groupEl = field && field.closest('.group');
      if (groupEl) groupEl.hidden = allowed.size <= 1;
      const select = root.querySelector(`select[data-filter="${key}"]`);
      if (select) {
        Array.from(select.options).forEach((o) => { o.disabled = !allowed.has(o.value); o.hidden = o.disabled; });
        if (!allowed.has(select.value) && allowed.size) {
          select.value = Array.from(select.options).find((o) => !o.disabled).value;
        }
        values[key] = select.value;
        continue;
      }
      const group = buttonsFor(root, key);
      const input = root.querySelector(`[data-filter="${key}"]`);
      if (group && input) {
        group.querySelectorAll('.opt').forEach((b) => { b.hidden = !allowed.has(b.dataset.value); });
        if (!allowed.has(input.value) && allowed.size) setValue(root, key, [...allowed][0]);
        values[key] = input.value;
      }
    }
  }

  // ---- Names: tap a name to copy it, the bookmark to keep it ----

  /** Where a name came from, for the shortlist: { title, slug }. */
  function sourceOf(config) {
    return { title: config.title || '', slug: config.slug || '' };
  }

  function nameItem(name, source, index) {
    const li = document.createElement('li');
    li.className = 'new';
    li.style.setProperty('--i', index);
    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'n name-copy';
    copy.textContent = name;
    copy.title = 'Copy';
    const save = document.createElement('button');
    save.type = 'button';
    save.className = 'save hd tap name-save';
    save.dataset.name = name;
    save.dataset.title = source.title;
    save.dataset.slug = source.slug;
    save.innerHTML = '<svg class="ic" aria-hidden="true" focusable="false"><use href="#i-bookmark"/></svg>';
    li.append(copy, save);
    return li;
  }

  // The example names are plain text in the HTML (for search engines); make
  // each one copy when tapped.
  function enhanceExamples() {
    document.querySelectorAll('.exbox li').forEach((li) => {
      const name = li.textContent.trim();
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'name-copy';
      btn.textContent = name;
      btn.title = 'Copy';
      li.replaceChildren(btn);
    });
  }

  function copyText(text) {
    if (global.navigator.clipboard && global.isSecureContext) {
      return global.navigator.clipboard.writeText(text);
    }
    // Fallback for pages opened from disk or older browsers.
    return new Promise((resolve, reject) => {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      try {
        if (document.execCommand('copy')) resolve(); else reject(new Error('Copy failed'));
      } catch (error) {
        reject(error);
      } finally {
        area.remove();
      }
    });
  }

  // One polite live region per page, so screen readers hear "Copied" and new names.
  function announce(message) {
    let status = document.getElementById('name-status');
    if (!status) {
      status = document.createElement('p');
      status.id = 'name-status';
      status.className = 'visually-hidden';
      status.setAttribute('role', 'status');
      document.body.appendChild(status);
    }
    status.textContent = '';
    setTimeout(() => { status.textContent = message; }, 50);
  }

  function flash(el, state) {
    el.dataset.state = state;
    clearTimeout(el._flashTimer);
    el._flashTimer = setTimeout(() => { delete el.dataset.state; }, 1500);
  }

  function copyWithFeedback(el, text, message) {
    copyText(text)
      .then(() => { flash(el, 'copied'); announce(message); })
      .catch(() => { flash(el, 'failed'); announce('Could not copy. Select the text and copy it instead.'); });
  }

  // ---- Shortlist: kept in this browser, shared by every generator ----

  const SHORTLIST_KEY = 'tng-shortlist';
  const SHORTLIST_MAX = 200;

  function loadShortlist() {
    try {
      const list = JSON.parse(global.localStorage.getItem(SHORTLIST_KEY));
      return Array.isArray(list) ? list.filter((item) => item && typeof item.name === 'string') : [];
    } catch (error) {
      return [];
    }
  }

  // If storage is blocked (private mode, settings), the shortlist lasts until the page closes.
  let memoryShortlist = null;

  function saveShortlist(list) {
    memoryShortlist = list.slice(-SHORTLIST_MAX);
    try {
      global.localStorage.setItem(SHORTLIST_KEY, JSON.stringify(memoryShortlist));
      memoryShortlist = null;
    } catch (error) {
      // Keep using memoryShortlist.
    }
    renderShortlist();
    syncSaves();
  }

  function shortlist() {
    return memoryShortlist ? memoryShortlist.slice() : loadShortlist();
  }

  const sameItem = (a, b) => a.name === b.name && a.slug === b.slug;

  function toggleSaved(item) {
    const list = shortlist();
    const at = list.findIndex((saved) => sameItem(saved, item));
    if (at >= 0) list.splice(at, 1); else list.push(item);
    saveShortlist(list);
    return at < 0;
  }

  function syncSaves() {
    const list = shortlist();
    document.querySelectorAll('.name-save').forEach((btn) => {
      const saved = list.some((item) => sameItem(item, btn.dataset));
      btn.setAttribute('aria-pressed', String(saved));
      btn.setAttribute('aria-label', `${saved ? 'Remove' : 'Save'} ${btn.dataset.name} ${saved ? 'from' : 'to'} your shortlist`);
    });
  }

  // Generator pages live in posts/; the homepage is at the root.
  function postsPrefix() {
    return /\/(posts|categories)\//.test(global.location.pathname) ? '../posts/' : 'posts/';
  }

  function renderShortlist() {
    const line = document.getElementById('shortlist-line');
    const panel = document.getElementById('shortlist');
    const list = shortlist();
    document.querySelectorAll('[data-action="copy-all"], [data-action="clear"]').forEach((b) => { b.disabled = !list.length; });
    if (line) {
      line.textContent = list.length
        ? `Your shortlist (${list.length}), saved in this browser across every generator.`
        : 'Tap a name to copy it, or the bookmark to keep it.';
    }
    if (!panel) return;
    panel.hidden = list.length === 0;
    if (!list.length) { panel.replaceChildren(); return; }
    const prefix = postsPrefix();
    panel.innerHTML = `<ul class="shortlist-items">
        ${list.map((item, i) => `<li>
          <button type="button" class="name-copy">${escapeHtml(item.name)}</button>
          ${item.slug ? `<a class="shortlist-source" href="${prefix}${encodeURIComponent(item.slug)}.html">${escapeHtml(item.title || 'Generator')}</a>` : ''}
          <button type="button" class="shortlist-remove" data-index="${i}" aria-label="Remove ${escapeHtml(item.name)} from your shortlist"><svg aria-hidden="true" focusable="false"><use href="#i-clear"/></svg></button>
        </li>`).join('')}
      </ul>`;
  }

  // Shortlist buttons say what happened: "Copied", or "Sure?" before clearing.
  function say(button, text) {
    const label = button.querySelector('span') || button;
    if (!button.dataset.label) button.dataset.label = label.textContent;
    label.textContent = text;
    clearTimeout(button._sayTimer);
    button._sayTimer = setTimeout(() => {
      label.textContent = button.dataset.label;
      delete button.dataset.confirm;
    }, 2500);
  }

  // One set of click handlers for the whole page, so names added later work too.
  function setupNameActions() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('button');
      if (!target || target.disabled) return;
      if (target.classList.contains('name-copy')) {
        copyWithFeedback(target, target.textContent, `Copied ${target.textContent}`);
      } else if (target.classList.contains('name-save')) {
        const { name, title, slug } = target.dataset;
        const added = toggleSaved({ name, title, slug });
        announce(added ? `Saved ${name} to your shortlist` : `Removed ${name} from your shortlist`);
      } else if (target.classList.contains('shortlist-remove')) {
        const list = shortlist();
        const [removed] = list.splice(Number(target.dataset.index), 1);
        saveShortlist(list);
        if (removed) announce(`Removed ${removed.name} from your shortlist`);
      } else if (target.dataset.action === 'copy-all') {
        copyText(shortlist().map((item) => item.name).join('\n'))
          .then(() => { say(target, 'Copied'); announce('Copied your shortlist'); })
          .catch(() => { say(target, 'Copy failed'); });
      } else if (target.dataset.action === 'clear') {
        // A second tap confirms, so one slip can't wipe the list.
        if (target.dataset.confirm) { delete target.dataset.confirm; saveShortlist([]); say(target, 'Cleared'); announce('Cleared your shortlist'); }
        else { target.dataset.confirm = '1'; say(target, 'Sure? Tap again'); }
      }
    });
    // Keep bookmarks and the list in step with other tabs.
    global.addEventListener('storage', (e) => {
      if (e.key === SHORTLIST_KEY) { renderShortlist(); syncSaves(); }
    });
    renderShortlist();
  }

  // ---- The generator ----

  /**
   * Wire up a generator. `root` holds the controls, `button` makes 8 new
   * names, `results` shows them, `more` adds 8 the visitor hasn't seen and
   * `done` says when there are no more. `onGenerate` runs after each new batch
   * (generator pages use it to keep the address up to date).
   */
  function mountGenerator({ config, root, button, results, more, done, onGenerate }) {
    const gen = global.RecipeEngine.createGenerator(config);
    const source = sourceOf(config);
    const shown = new Set();
    let lastKey = null;
    let values = null;
    let list = null;

    // Once every name for these choices has been shown, "Show 8 more" becomes
    // "Start again", which shuffles the whole list again from the top.
    function setFinished(finished) {
      if (more) {
        more.hidden = !list;
        more.dataset.restart = finished ? 'true' : '';
        // Change only the label text, so the button keeps its drawn outline
        const label = [...more.childNodes].find((n) => n.nodeType === 3 && n.nodeValue.trim());
        if (label) label.nodeValue = finished ? '↻ Start again' : '+ Show 8 more';
      }
      if (done) {
        done.hidden = !finished;
        const text = done.querySelector('[data-done-text]') || done;
        text.textContent = shown.size === 1 ? "That's the only name for these choices." : `You've seen all ${shown.size} names for these choices.`;
      }
    }

    function render(names, append) {
      if (!append) {
        results.replaceChildren();
        list = document.createElement('ul');
        list.className = 'results name-results' + (results.dataset.long === 'true' ? ' long' : '');
        results.appendChild(list);
      }
      names.forEach((name, i) => list.appendChild(nameItem(name, source, i)));
      fitColumns();
      syncSaves();
    }

    // Use one column (on phones) when a word in any name is too wide for its
    // column, so usernames like "Nether_Buster" are never split mid-word, or
    // when most names would wrap onto a second line.
    function fitColumns() {
      if (!list || results.dataset.long === 'true') return;
      list.classList.remove('long');
      const first = list.querySelector('.n');
      if (!first) return;
      const ctx = document.createElement('canvas').getContext('2d');
      ctx.font = getComputedStyle(first).font;
      const room = first.clientWidth;
      const names = [...list.querySelectorAll('.n')].map((n) => n.textContent);
      const tooWide = names.some((name) =>
        name.split(/\s+/).some((word) => ctx.measureText(word).width > room));
      const wrapping = names.filter((name) => ctx.measureText(name).width > room).length;
      list.classList.toggle('long', tooWide || wrapping > names.length / 2);
    }
    let fitTimer;
    window.addEventListener('resize', () => { clearTimeout(fitTimer); fitTimer = setTimeout(fitColumns, 150); });

    // Names the engine hasn't shown yet for these choices, up to `limit`.
    // Stops early when it keeps finding only names already seen.
    function freshNames(limit) {
      const fresh = [];
      let quietRounds = 0;
      for (let round = 0; round < 60 && fresh.length < limit && quietRounds < 8; round++) {
        const before = fresh.length;
        gen.generate(values, BATCH).forEach((n) => {
          if (n && !shown.has(n) && fresh.length < limit) { shown.add(n); fresh.push(n); }
        });
        quietRounds = fresh.length === before ? quietRounds + 1 : 0;
      }
      return fresh;
    }

    // Each press shows names not seen since the choices last changed. Once
    // every name has been seen, start again from the full list.
    function generate() {
      try {
        values = readValues(root);
        const key = JSON.stringify(values);
        if (key !== lastKey) { shown.clear(); lastKey = key; }
        let names = freshNames(BATCH);
        if (names.length < BATCH) {
          const keep = names;
          shown.clear();
          keep.forEach((n) => shown.add(n));
          names = keep.concat(freshNames(BATCH - keep.length));
        }
        if (!names.length) {
          list = null;
          const letter = config.startsWith && values[config.startsWith];
          results.innerHTML = letter && letter !== 'any'
            ? `<p class="results-empty">No names start with ${letter.toUpperCase()} for these choices. Try another letter, or change the options above.</p>`
            : '<p class="results-empty">Fill in the boxes above, then press Generate Names.</p>';
          setFinished(false);
          if (more) more.hidden = true;
          return;
        }
        render(names, false);
        setFinished(names.length < BATCH);
        announce(`${names.length} new names`);
        if (onGenerate) onGenerate();
      } catch (error) {
        console.error('Generation error:', error);
        list = null;
        results.innerHTML = '<p class="results-error">Something went wrong making names. Please try again.</p>';
      }
    }

    // Add up to 8 names not shown yet; fewer means the choices have run out.
    function showMore() {
      if (!values || !list || more.dataset.restart === 'true') return generate();
      const fresh = freshNames(BATCH);
      if (fresh.length) {
        render(fresh, true);
        announce(`${fresh.length} more names`);
      }
      setFinished(fresh.length < BATCH);
      if (!fresh.length && done) done.focus();
    }

    function onChange() {
      updateAvailability(root, gen, config);
      if (list) generate(); // names already showing: refresh them for the new choice
    }

    root.addEventListener('click', (e) => {
      const opt = e.target.closest('.opt');
      if (!opt || opt.hidden) return;
      const group = opt.closest('[data-buttons-for]');
      if (!group || opt.getAttribute('aria-pressed') === 'true') return;
      setValue(root, group.dataset.buttonsFor, opt.dataset.value);
      onChange();
    });
    root.querySelectorAll('select[data-filter]').forEach((el) => el.addEventListener('change', onChange));
    root.querySelectorAll('input.name-input').forEach((el) => el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); generate(); }
    }));
    updateAvailability(root, gen, config);
    button.onclick = generate;
    if (more) more.onclick = showMore;
    return { generate, showMore };
  }

  // ---- Menu ----

  function setupMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    const dropdowns = [...document.querySelectorAll('.nav-dropdown')].map(el => ({ el, toggle: el.querySelector('.nav-dropdown-toggle') }));
    const setOpen = (el, toggle, open) => {
      el.classList.toggle('active', open);
      if (toggle) toggle.setAttribute('aria-expanded', String(open));
    };
    if (menuToggle && navLinks) {
      menuToggle.addEventListener('click', () => setOpen(navLinks, menuToggle, !navLinks.classList.contains('active')));
    }
    // Underline the group this page belongs to, and the page itself in its list
    const here = global.location.pathname.replace(/\/$/, '/index.html');
    dropdowns.forEach(({ el }) => {
      const link = [...el.querySelectorAll('a')].find(a => a.pathname === here);
      if (!link) return;
      el.classList.add('current');
      link.setAttribute('aria-current', 'page');
    });
    // One menu group open at a time
    dropdowns.forEach(({ el, toggle }) => {
      if (!toggle) return;
      toggle.addEventListener('click', () => {
        const open = !el.classList.contains('active');
        dropdowns.forEach(d => setOpen(d.el, d.toggle, false));
        setOpen(el, toggle, open);
      });
    });
    document.addEventListener('click', (e) => {
      dropdowns.forEach(d => { if (!d.el.contains(e.target)) setOpen(d.el, d.toggle, false); });
    });
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const open = dropdowns.find(d => d.el.classList.contains('active'));
      if (open) { setOpen(open.el, open.toggle, false); open.toggle.focus(); }
      else if (navLinks && navLinks.classList.contains('active')) { setOpen(navLinks, menuToggle, false); menuToggle.focus(); }
    });
  }

  // ---- Generator pages: settings kept in the address ----

  // Apply ?gender=female&origin=tolkien from a shared link. Returns true if the
  // link carried any settings, so the page can show names straight away.
  // (Old links may still carry n=16; it's ignored now that every press gives 8.)
  function applyUrlSettings(root) {
    const params = new URLSearchParams(global.location.search);
    let found = false;
    root.querySelectorAll('[data-filter]').forEach((el) => {
      if (el.classList.contains('name-input')) return;
      const value = params.get(el.dataset.filter);
      if (value != null && setValue(root, el.dataset.filter, value)) found = true;
    });
    return found;
  }

  // Put the current choices in the address bar, so copying it shares the setup.
  function writeUrlSettings(root) {
    const params = new URLSearchParams();
    root.querySelectorAll('[data-filter]').forEach((el) => {
      if (!el.classList.contains('name-input')) params.set(el.dataset.filter, el.value);
    });
    const query = params.toString();
    try {
      global.history.replaceState(null, '', global.location.pathname + (query ? `?${query}` : '') + global.location.hash);
    } catch (error) {
      // Some browsers refuse replaceState on file:// pages.
    }
  }

  // Generator pages carry their own config in <script id="generator-config">.
  function setupGeneratorPage() {
    const configEl = document.getElementById('generator-config');
    if (!configEl) return;
    const config = JSON.parse(configEl.textContent);
    const root = document.querySelector('.simple-generator');
    const fromLink = applyUrlSettings(root);
    const widget = mountGenerator({
      config,
      root,
      button: document.getElementById('generate-btn'),
      results: document.getElementById('results'),
      more: document.getElementById('more'),
      done: document.getElementById('done'),
      onGenerate: () => writeUrlSettings(root),
    });
    enhanceExamples();
    // Show names straight away, so the page opens ready to use.
    widget.generate();
    if (!fromLink) {
      try { global.history.replaceState(null, '', global.location.pathname + global.location.hash); } catch (error) { /* file:// */ }
    }
  }

  const NamePage = { escapeHtml, optionLabel, filtersHtml, usesButtons, mountGenerator, updateAvailability };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = NamePage;
  } else {
    global.NamePage = NamePage;
    setupMenu();
    setupNameActions();
    setupGeneratorPage();
    const year = document.getElementById('current-year');
    if (year) year.textContent = new Date().getFullYear();
  }
})(typeof window !== 'undefined' ? window : this);
