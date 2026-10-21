/**
 * Shared page parts for the "Grown Up B" design: the <head> assets, the site
 * header and footer, the inline SVG sprite and the drawings. Used by
 * scripts/build-pages.js for every generated page and for the marked sections
 * of the hand-written pages (index.html, about.html, all-generators.html).
 *
 * `prefix` is how a page reaches the site root: "" from the root, "../" from
 * posts/ and categories/, "/" for the 404 page (served at any address).
 */

const Illustrations = require('../lib/illustrations.js');
const ILLUSTRATION_MAP = require('../content/illustrations.json');

const SITE_NAME = 'The Name Generators';

function escapeHtml(text) {
  if (text == null) return '';
  return String(text)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// ---------- <head> assets ----------

/** Stylesheet and the two fonts every page needs first, preloaded. */
function headAssets(prefix) {
  return `<link rel="preload" href="${prefix}fonts/schibsted-grotesk-latin.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="${prefix}fonts/newsreader-latin.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="stylesheet" href="${prefix}styles/site.css">`;
}

/** Scripts at the end of <body>. Generator pages also load the recipe engine first. */
function bodyScripts(prefix, { engine = false } = {}) {
  return [
    engine ? `<script src="${prefix}lib/recipe-engine.js"></script>` : '',
    `<script src="${prefix}lib/page.js"></script>`,
    `<script src="${prefix}lib/outline.js"></script>`,
  ].filter(Boolean).join('\n    ');
}

// ---------- Drawings ----------

/** The drawing for a category (its mark). */
function categoryMotif(category) {
  const id = ILLUSTRATION_MAP.categories[category.slug];
  return Illustrations.has(id) ? id : 'quill';
}

/** The drawing for a generator, falling back to its category's mark until its own is drawn. */
function generatorMotif(generator, category) {
  const id = ILLUSTRATION_MAP.generators[generator.key];
  if (Illustrations.has(id)) return id;
  return category ? categoryMotif(category) : 'quill';
}

/** A drawing on the page. It's decorative: the text next to it says what it is. */
function doodle(id, cls = 'doodle') {
  return `<svg class="${cls} wob" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><use href="#m-${id}"/></svg>`;
}

// Small interface icons, drawn in the same marker style.
const ICONS = {
  bookmark: '<symbol id="i-bookmark" viewBox="0 0 15 17"><path d="M2 1.5 H13 V15.5 L7.5 11.5 L2 15.5 Z"/></symbol>',
  wand: '<symbol id="i-wand" viewBox="0 0 22 22"><path d="M3 19 L15 7 M13 5 L17 9 M15 3 C17 1 21 5 19 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 19 l-1 2 l2 -1" fill="none" stroke="#efc84a" stroke-width="2" stroke-linecap="round"/></symbol>',
  copy: '<symbol id="i-copy" viewBox="0 0 14 14"><rect x="4.5" y="4.5" width="8" height="8" rx="1.5"/><path d="M9.5 2.5 V2 a1 1 0 0 0 -1 -1 H2.5 a1 1 0 0 0 -1 1 V8 a1 1 0 0 0 1 1 H3"/></symbol>',
  clear: '<symbol id="i-clear" viewBox="0 0 14 14"><path d="M3 3 L11 11 M11 3 L3 11"/></symbol>',
  tick: '<symbol id="i-tick" viewBox="0 0 22 18"><path d="M2 10 C5 12 7 14 8 16 C11 10 15 5 20 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></symbol>',
};

/**
 * The inline sprite at the top of <body>: the wobble filter, the interface
 * icons and only the drawings this page uses.
 */
function svgSprite(motifIds = []) {
  const unique = [...new Set(motifIds)].filter(id => Illustrations.has(id));
  return `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
      <filter id="wob"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="5"/><feDisplacementMap in="SourceGraphic" scale="2.2"/></filter>
      ${Object.values(ICONS).join('\n      ')}
      ${unique.map(id => Illustrations.symbol(id)).join('\n      ')}
    </defs></svg>`;
}

// ---------- Header and footer ----------

const LOGO = `<svg class="wob" viewBox="0 0 30 30" aria-hidden="true" focusable="false"><path d="M15 2 C19 8 23 12 23 17 C23 22 19 26 15 28 C11 26 7 22 7 17 C7 12 11 8 15 2 Z" fill="#fffcf4" stroke="#1e1c18" stroke-width="1.8" stroke-linejoin="round"/><path d="M15 12 V24" stroke="#1e1c18" stroke-width="1.6" stroke-linecap="round"/><circle cx="15" cy="12" r="2" fill="#1e1c18"/><path d="M4 26 C8 24 10 27 14 25" fill="none" stroke="#efc84a" stroke-width="3" stroke-linecap="round"/></svg>`;

const MENU_ICON = `<svg viewBox="0 0 18 14" aria-hidden="true" focusable="false"><path d="M1 2 C6 3 12 1 17 2 M1 7 C6 8 12 6 17 7 M1 12 C6 13 12 11 17 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

const RULE = `<svg class="hrule wob" viewBox="0 0 400 10" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M1 5 C40 3 80 7 130 5 S220 3 270 6 S350 4 399 5" fill="none" stroke="#1e1c18" stroke-width="1.6" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>`;

/** Category links for the menu (plain links, so search engines follow them). */
function categoryLinks(categories, prefix, indent = '              ') {
  return categories.map(cat =>
    `<li><a href="${prefix}categories/${cat.slug}-names.html">${escapeHtml(cat.navLabel)}</a></li>`
  ).join(`\n${indent}`);
}

/** Header A ("Roomy"): logo, menu button on phones, links on desktop, then a hand-drawn rule. */
function siteHeader(prefix, categories) {
  const home = prefix === '/' ? '/' : `${prefix}index.html`;
  return `<header class="site-header">
      <div class="wrap bar">
        <a class="logo" href="${home}">${LOGO}<b>${SITE_NAME}</b></a>
        <button class="menu-toggle hd tap" id="menu-toggle" type="button" aria-expanded="false" aria-controls="nav-links">${MENU_ICON}Menu</button>
        <nav class="site-nav" aria-label="Main">
          <ul class="nav-links" id="nav-links">
            <li><a href="${home}">Home</a></li>
            <li><a href="${prefix}all-generators.html">All generators</a></li>
            <li class="nav-dropdown">
              <button class="nav-dropdown-toggle" type="button" aria-expanded="false" aria-controls="category-dropdown">Categories</button>
              <ul class="nav-dropdown-menu" id="category-dropdown">
              ${categoryLinks(categories, prefix)}
              </ul>
            </li>
            <li><a href="${prefix}about.html">About</a></li>
          </ul>
        </nav>
      </div>
      <div class="wrap">${RULE}</div>
    </header>`;
}

function siteFooter(prefix) {
  return `<footer class="site-footer">
      <div class="wrap">
        <p>&copy; <span id="current-year">${new Date().getFullYear()}</span> ${SITE_NAME} · <a href="${prefix}about.html">About</a> · <a href="${prefix}all-generators.html">All generators</a> · <a href="${prefix}spin-the-wheel.html">Spin the Wheel</a> · <a href="${prefix}name-tools.html">Name tools</a> · <a href="${prefix}sitemap.html">Site map</a></p>
      </div>
    </footer>`;
}

// ---------- Small helpers ----------

/** "Elf Name Generator" -> "<span class="hl">Elf</span> Name Generator" */
function highlightFirstWord(text) {
  const safe = escapeHtml(text);
  const m = safe.match(/^(\S+)(\s.*)?$/);
  return m ? `<span class="hl">${m[1]}</span>${m[2] || ''}` : safe;
}

/** Drop a leading emoji (and the space after it) from a title. */
function stripEmoji(text) {
  return String(text || '').replace(/^[^\p{L}\p{N}]+/u, '').trim();
}

module.exports = {
  SITE_NAME, escapeHtml, headAssets, bodyScripts, svgSprite, siteHeader, siteFooter,
  doodle, categoryMotif, generatorMotif, highlightFirstWord, stripEmoji, categoryLinks,
};
