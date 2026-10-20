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

  function showNames(resultsEl, names) {
    const list = document.createElement('ul');
    list.className = 'name-results';
    names.forEach((name) => {
      const li = document.createElement('li');
      li.textContent = name;
      list.appendChild(li);
    });
    resultsEl.replaceChildren(list);
  }

  function showError(resultsEl, error) {
    console.error('Generation error:', error);
    resultsEl.innerHTML = '<p class="error">Error generating names. Please try again.</p>';
  }

  /**
   * Wire up a generator: `root` holds the filter controls, `button` generates,
   * `results` shows the names, `getCount` says how many.
   */
  function mountGenerator({ config, root, button, results, getCount }) {
    const gen = global.RecipeEngine.createGenerator(config);
    root.querySelectorAll('select[data-filter]').forEach((el) =>
      el.addEventListener('change', () => updateAvailability(root, gen, config))
    );
    updateAvailability(root, gen, config);
    button.onclick = () => {
      try {
        showNames(results, gen.generate(readValues(root), getCount()));
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

  // Generator pages carry their own config in <script id="generator-config">.
  function setupGeneratorPage() {
    const configEl = document.getElementById('generator-config');
    if (!configEl) return;
    mountGenerator({
      config: JSON.parse(configEl.textContent),
      root: document.querySelector('.simple-generator'),
      button: document.getElementById('generate-btn'),
      results: document.getElementById('results'),
      getCount: () => 8,
    });
  }

  const NamePage = { escapeHtml, optionLabel, filtersHtml, mountGenerator };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = NamePage;
  } else {
    global.NamePage = NamePage;
    setupMenu();
    setupGeneratorPage();
    const year = document.getElementById('current-year');
    if (year) year.textContent = new Date().getFullYear();
  }
})(typeof window !== 'undefined' ? window : this);
