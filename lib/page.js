/**
 * Page script shared by every page: the mobile menu, plus the name generator
 * widget. The build (scripts/build-pages.js) also uses filtersHtml() so the
 * dropdowns on generator pages are in the HTML before any JavaScript runs.
 */
(function (global) {
  'use strict';

  function escapeHtml(text) {
    return String(text == null ? '' : text)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function optionLabel(filter, opt) {
    if (filter.optionLabels && filter.optionLabels[opt]) return filter.optionLabels[opt];
    return opt.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }

  /** Markup for a generator's dropdowns and text boxes. */
  function filtersHtml(filters, groupClass) {
    return Object.entries(filters || {}).map(([key, filter]) => {
      const id = `filter-${escapeHtml(key)}`;
      const control = filter.type === 'text'
        ? `<input type="text" id="${id}" name="${escapeHtml(key)}" data-filter="${escapeHtml(key)}" placeholder="${escapeHtml(filter.placeholder || '')}" class="name-input">`
        : `<select id="${id}" name="${escapeHtml(key)}" data-filter="${escapeHtml(key)}">
              ${filter.options.map((opt) => `<option value="${escapeHtml(opt)}">${escapeHtml(optionLabel(filter, opt))}</option>`).join('\n              ')}
            </select>`;
      return `
          <div class="${groupClass}">
            <label for="${id}">${escapeHtml(filter.label)}:</label>
            ${control}
          </div>`;
    }).join('\n');
  }

  function readValues(root) {
    const values = {};
    root.querySelectorAll('[data-filter]').forEach((el) => { values[el.dataset.filter] = el.value; });
    return values;
  }

  // Grey out dropdown options that don't exist for the choices above them
  // (e.g. dragon types for "neutral"), moving off a choice that just vanished.
  function updateAvailability(root, gen, config) {
    const values = readValues(root);
    for (const key of Object.keys(config.filters || {})) {
      const select = root.querySelector(`select[data-filter="${key}"]`);
      if (!select) continue;
      const allowed = new Set(gen.availableOptions(key, values));
      Array.from(select.options).forEach((o) => { o.disabled = !allowed.has(o.value); o.hidden = o.disabled; });
      if (!allowed.has(select.value) && allowed.size) {
        select.value = Array.from(select.options).find((o) => !o.disabled).value;
      }
      values[key] = select.value;
    }
  }

  // ---- Results: click a name to copy it, ♥ to add it to the shortlist ----

  /** Where a name came from, for the shortlist: { title, slug }. */
  function sourceOf(config) {
    return { title: config.title || '', slug: config.slug || '' };
  }

  function nameItem(name, source) {
    const li = document.createElement('li');
    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'name-copy';
    copy.textContent = name;
    copy.title = 'Copy';
    const save = document.createElement('button');
    save.type = 'button';
    save.className = 'name-save';
    save.dataset.name = name;
    save.dataset.title = source.title;
    save.dataset.slug = source.slug;
    li.append(copy, save);
    return li;
  }

  function showNames(resultsEl, names, source, asked) {
    names = names.filter(Boolean);
    if (!names.length) {
      resultsEl.innerHTML = '<p class="results-placeholder">Fill in the boxes above, then press Generate Names.</p>';
      return;
    }
    const hint = document.createElement('p');
    hint.className = 'results-hint';
    hint.textContent = 'Click a name to copy it, or ♥ it to save it to your shortlist.';
    const list = document.createElement('ul');
    list.className = 'name-results';
    names.forEach((name) => list.appendChild(nameItem(name, source)));
    resultsEl.replaceChildren(hint, list);
    if (asked && names.length < asked) {
      const all = document.createElement('p');
      all.className = 'results-hint';
      all.textContent = names.length === 1 ? "That's the only name for these choices." : `That's all ${names.length} names for these choices.`;
      resultsEl.appendChild(all);
    }
    syncHearts();
  }

  // The example names are plain text in the HTML (for search engines); give
  // them the same copy and ♥ buttons once the page loads.
  function enhanceExamples(source) {
    document.querySelectorAll('.example-names .name-results').forEach((list) => {
      Array.from(list.children).forEach((li) => list.replaceChild(nameItem(li.textContent.trim(), source), li));
    });
    syncHearts();
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

  // One polite live region per page, so screen readers hear "Copied".
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
    syncHearts();
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

  function syncHearts() {
    const list = shortlist();
    document.querySelectorAll('.name-save').forEach((btn) => {
      const saved = list.some((item) => sameItem(item, btn.dataset));
      btn.setAttribute('aria-pressed', String(saved));
      btn.setAttribute('aria-label', `${saved ? 'Remove' : 'Save'} ${btn.dataset.name} ${saved ? 'from' : 'to'} your shortlist`);
      btn.textContent = saved ? '♥' : '♡';
    });
  }

  // Generator pages live in posts/; the homepage is at the root.
  function postsPrefix() {
    return /\/(posts|categories)\//.test(global.location.pathname) ? '../posts/' : 'posts/';
  }

  function renderShortlist() {
    const panel = document.getElementById('shortlist');
    if (!panel) return;
    const list = shortlist();
    panel.hidden = list.length === 0;
    if (!list.length) { panel.replaceChildren(); return; }
    const prefix = postsPrefix();
    panel.innerHTML = `
      <div class="shortlist-header">
        <h3>Your shortlist <span class="shortlist-count">(${list.length})</span></h3>
        <div class="shortlist-actions">
          <button type="button" class="shortlist-button" data-action="copy-all">Copy all</button>
          <button type="button" class="shortlist-button" data-action="clear">Clear</button>
        </div>
      </div>
      <ul class="shortlist-items">
        ${list.map((item, i) => `<li>
          <button type="button" class="name-copy">${escapeHtml(item.name)}</button>
          ${item.slug ? `<a class="shortlist-source" href="${prefix}${encodeURIComponent(item.slug)}.html">${escapeHtml(item.title || 'Generator')}</a>` : ''}
          <button type="button" class="shortlist-remove" data-index="${i}" aria-label="Remove ${escapeHtml(item.name)} from your shortlist">×</button>
        </li>`).join('')}
      </ul>
      <p class="shortlist-note">Saved in this browser, across every generator on the site.</p>`;
  }

  // One set of click handlers for the whole page, so names added later work too.
  function setupNameActions() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('button');
      if (!target) return;
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
        copyWithFeedback(target, shortlist().map((item) => item.name).join('\n'), 'Copied your shortlist');
      } else if (target.dataset.action === 'clear') {
        if (global.confirm('Clear every name from your shortlist?')) saveShortlist([]);
      }
    });
    // Keep hearts and the panel in step with other tabs.
    global.addEventListener('storage', (e) => {
      if (e.key === SHORTLIST_KEY) { renderShortlist(); syncHearts(); }
    });
    renderShortlist();
  }

  function showError(resultsEl, error) {
    console.error('Generation error:', error);
    resultsEl.innerHTML = '<p class="error">Error generating names. Please try again.</p>';
  }

  /**
   * Wire up a generator: `root` holds the filter controls, `button` generates,
   * `results` shows the names, `getCount` says how many. `onGenerate` runs
   * after each batch (generator pages use it to keep the URL up to date).
   */
  function mountGenerator({ config, root, button, results, getCount, onGenerate }) {
    const gen = global.RecipeEngine.createGenerator(config);
    root.querySelectorAll('select[data-filter]').forEach((el) =>
      el.addEventListener('change', () => updateAvailability(root, gen, config))
    );
    updateAvailability(root, gen, config);
    button.onclick = () => {
      try {
        const asked = getCount();
        showNames(results, gen.generate(readValues(root), asked), sourceOf(config), asked);
        if (onGenerate) onGenerate();
      } catch (error) {
        showError(results, error);
      }
    };
  }

  function setupMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    const categoryDropdown = document.querySelector('.nav-dropdown');
    if (!menuToggle || !navLinks) return;
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
    // Close menu when clicking on a link
    navLinks.addEventListener('click', (e) => {
      if (e.target.tagName === 'A' && !e.target.classList.contains('nav-dropdown-toggle')) {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
      }
    });
    // Handle dropdown toggle on mobile
    const dropdownToggle = document.querySelector('.nav-dropdown-toggle');
    if (dropdownToggle && categoryDropdown) {
      dropdownToggle.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          categoryDropdown.classList.toggle('active');
        }
      });
    }
  }

  // ---- Generator pages: how many names, and settings kept in the URL ----

  const COUNT_KEY = 'tng-count';

  function storedCount() {
    try { return global.localStorage.getItem(COUNT_KEY); } catch (error) { return null; }
  }

  function setSelect(select, value) {
    if (value == null || !Array.from(select.options).some((o) => o.value === value)) return false;
    select.value = value;
    return true;
  }

  // Apply ?gender=female&origin=tolkien&n=16 from a shared link. Returns true if
  // the link carried any settings, so the page can show names straight away.
  function applyUrlSettings(root, countEl) {
    const params = new URLSearchParams(global.location.search);
    let found = false;
    root.querySelectorAll('select[data-filter]').forEach((select) => {
      if (setSelect(select, params.get(select.dataset.filter))) found = true;
    });
    if (countEl && setSelect(countEl, params.get('n'))) found = true;
    return found;
  }

  // Put the current choices in the address bar, so copying it shares the setup.
  function writeUrlSettings(root, countEl) {
    const params = new URLSearchParams();
    root.querySelectorAll('select[data-filter]').forEach((select) => params.set(select.dataset.filter, select.value));
    if (countEl && countEl.value !== countEl.dataset.default) params.set('n', countEl.value);
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
    const button = document.getElementById('generate-btn');
    const countEl = document.getElementById('name-count');
    if (countEl) {
      countEl.dataset.default = countEl.value;
      setSelect(countEl, storedCount());
      countEl.addEventListener('change', () => {
        try { global.localStorage.setItem(COUNT_KEY, countEl.value); } catch (error) { /* not saved */ }
      });
    }
    const fromLink = applyUrlSettings(root, countEl);
    mountGenerator({
      config,
      root,
      button,
      results: document.getElementById('results'),
      getCount: () => (countEl ? Number(countEl.value) : 8),
      onGenerate: () => writeUrlSettings(root, countEl),
    });
    enhanceExamples(sourceOf(config));
    if (fromLink) button.click();
  }

  const NamePage = { escapeHtml, optionLabel, filtersHtml, mountGenerator };
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
