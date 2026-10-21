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

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SITE_NAME = 'The Name Generators';

function escapeHtml(text) {
  if (text == null) return '';
  return String(text)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// ---------- <head> assets ----------

// Stylesheets and scripts get "?v=<hash of the file>" so browsers fetch the
// new copy after every change instead of keeping a stale cached one.
const ASSETS = ['styles/site.css', 'lib/page.js', 'lib/outline.js', 'lib/recipe-engine.js', 'lib/wheel.js', 'lib/nametools.js', 'lib/consent.js',
  'favicon.svg', 'favicon.ico', 'apple-touch-icon.png'];
const versions = {};
function assetVersion(file) {
  if (!versions[file]) {
    const body = fs.readFileSync(path.join(__dirname, '..', file));
    versions[file] = crypto.createHash('sha1').update(body).digest('hex').slice(0, 8);
  }
  return versions[file];
}
function asset(prefix, file) {
  return `${prefix}${file}?v=${assetVersion(file)}`;
}

/** Stamp the asset links in a hand-written page with their current versions. */
function stampAssets(html) {
  for (const file of ASSETS) {
    const re = new RegExp(`((?:href|src)="(?:/|\\.\\./)?)${file.replace(/[.]/g, '\\.')}(?:\\?v=[0-9a-f]+)?"`, 'g');
    html = html.replace(re, (_, start) => `${start}${file}?v=${assetVersion(file)}"`);
  }
  return html;
}

// Google Analytics loads from lib/consent.js, and only once the visitor
// accepts. Pages with a Content-Security-Policy must allow
// www.googletagmanager.com (scripts) and *.google-analytics.com (connect).
function analyticsTag(prefix) {
  return `<script src="${asset(prefix, 'lib/consent.js')}" defer></script>`;
}

/**
 * The share image for a page (made by scripts/share-images.js), or the
 * homepage's while a page doesn't have its own yet.
 */
function shareImage(name) {
  const file = fs.existsSync(path.join(__dirname, '..', 'images', 'share', `${name}.png`)) ? name : 'home';
  return `https://thenamegenerators.com/images/share/${file}.png`;
}

/** Analytics, then the stylesheet and the two fonts every page needs first, preloaded. */
function headAssets(prefix) {
  return `${analyticsTag(prefix)}
    <link rel="preload" href="${prefix}fonts/schibsted-grotesk-latin.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="${prefix}fonts/newsreader-latin.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="stylesheet" href="${asset(prefix, 'styles/site.css')}">`;
}

/** Scripts at the end of <body>. Generator pages also load the recipe engine first. */
function bodyScripts(prefix, { engine = false } = {}) {
  return [
    engine ? `<script src="${asset(prefix, 'lib/recipe-engine.js')}"></script>` : '',
    `<script src="${asset(prefix, 'lib/page.js')}"></script>`,
    `<script src="${asset(prefix, 'lib/outline.js')}"></script>`,
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

const LOGO = `<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path d="M11 3 C25 2 40 4 53 3 C58 3 61 6 61 11 C62 25 60 39 61 53 C61 58 58 61 53 61 C39 62 25 60 11 61 C6 61 3 58 3 53 C2 39 4 25 3 11 C3 6 6 3 11 3 Z" fill="#fffcf4"/><path d="M3 11 C3 6 6 3 11 3 C25 2 40 4 53 3 C58 3 61 6 61 11 L61 25 C45 26 20 24 3 25 Z" fill="#efc84a"/><path d="M3 25 C20 24 45 26 61 25 M24 9 V20 M24 14.5 H31 M31 9 V20 M38 9 V20" fill="none" stroke="#1e1c18" stroke-width="3" stroke-linecap="round"/><path d="M11 47 C15 36 20 36 19 46 C18 52 24 40 27 42 C30 44 28 50 32 47 C36 44 36 38 40 42 C43 46 44 50 48 44 C50 41 52 42 54 45" fill="none" stroke="#1e1c18" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 3 C25 2 40 4 53 3 C58 3 61 6 61 11 C62 25 60 39 61 53 C61 58 58 61 53 61 C39 62 25 60 11 61 C6 61 3 58 3 53 C2 39 4 25 3 11 C3 6 6 3 11 3 Z" fill="none" stroke="#1e1c18" stroke-width="3"/></svg>`;

const MENU_ICON = `<svg viewBox="0 0 18 14" aria-hidden="true" focusable="false"><path d="M1 2 C6 3 12 1 17 2 M1 7 C6 8 12 6 17 7 M1 12 C6 13 12 11 17 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

const RULE = `<svg class="hrule wob" viewBox="0 0 400 10" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M1 5 C40 3 80 7 130 5 S220 3 270 6 S350 4 399 5" fill="none" stroke="#1e1c18" stroke-width="1.6" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>`;

/** Category links for the menu (plain links, so search engines follow them). */
function categoryLinks(categories, prefix, indent = '              ') {
  return categories.map(cat =>
    `<li><a href="${prefix}categories/${cat.slug}-names.html">${escapeHtml(cat.navLabel)}</a></li>`
  ).join(`\n${indent}`);
}

/**
 * The main menu: a short, hand-picked set of the generators people come for,
 * grouped the way they search, with each group's hub pages at the bottom
 * (and, for Fantasy, a separate row for the seasonal hubs).
 * Every generator stays one click away through "All generators".
 * The build checks that every link here points to a real page.
 */
const MENU = [
  { label: 'Fantasy', id: 'menu-fantasy', links: [
    ['posts/elf-name-generator.html', 'Elf names'],
    ['posts/dwarf-name-generator.html', 'Dwarf names'],
    ['posts/dragon-name-generator.html', 'Dragon names'],
    ['posts/tiefling-name-generator.html', 'Tiefling names'],
    ['posts/wizard-name-generator.html', 'Wizard names'],
    ['posts/vampire-name-generator.html', 'Vampire names'],
    ['posts/tavern-name-generator.html', 'Tavern names'],
    ['posts/fantasy-town-name-generator.html', 'Town & village names'],
    ['posts/epithet-generator.html', 'Epithets & titles'],
  ], more: [['categories/fantasy-names.html', 'Fantasy'], ['categories/dnd-names.html', 'D&D'], ['categories/mythical-names.html', 'Mythical creatures'], ['categories/mythology-names.html', 'Mythology'], ['categories/wuxia-names.html', 'Wuxia']],
  seasonal: [['categories/christmas-names.html', 'Christmas'], ['categories/halloween-names.html', 'Halloween']] },
  { label: 'Games & TV', id: 'menu-games', links: [
    ['posts/minecraft-username-generator.html', 'Minecraft usernames'],
    ['posts/hogwarts-legacy-witch-name-generator.html', 'Hogwarts Legacy witch'],
    ['posts/hogwarts-legacy-wizard-name-generator.html', 'Hogwarts Legacy wizard'],
    ['posts/baldurs-gate-3-name-generator.html', "Baldur's Gate 3"],
    ['posts/skyrim-orc-name-generator.html', 'Skyrim orc'],
    ['posts/khajiit-name-generator.html', 'Khajiit'],
    ['posts/elden-ring-name-generator.html', 'Elden Ring'],
    ['posts/warhammer-name-generator.html', 'Warhammer 40k'],
    ['posts/star-wars-name-generator.html', 'Star Wars'],
    ['posts/game-of-thrones-name-generator.html', 'Game of Thrones'],
  ], more: [['categories/minecraft-names.html', 'Minecraft'], ['categories/pop_culture-names.html', 'Pop culture'], ['categories/elder_scrolls-names.html', 'Elder Scrolls']] },
  { label: 'Music & online', id: 'menu-music', links: [
    ['posts/band-name-generator.html', 'Band names'],
    ['posts/rapper-name-generator.html', 'Rapper names'],
    ['posts/dj-name-generator.html', 'DJ names'],
    ['posts/album-name-generator.html', 'Album names'],
    ['posts/stage-name-generator.html', 'Stage names'],
    ['posts/podcast-name-generator.html', 'Podcast names'],
    ['posts/youtube-channel-name-generator.html', 'YouTube channel names'],
    ['posts/gamertag-generator.html', 'Gamertags'],
  ], more: [['categories/music-names.html', 'Music']] },
  { label: 'Business', id: 'menu-business', links: [
    ['posts/business-name-generator.html', 'Business names'],
    ['posts/company-name-generator.html', 'Company names'],
    ['posts/brand-name-generator.html', 'Brand names'],
    ['posts/cafe-name-generator.html', 'Café names'],
    ['posts/event-name-generator.html', 'Event & party names'],
  ], more: [['categories/organizations-names.html', 'Organisations'], ['categories/events-names.html', 'Events']] },
  { label: 'Name tools', id: 'menu-tools', links: [
    ['spin-the-wheel.html', 'Spin the Wheel'],
    ['random-name-picker.html', 'Random name picker'],
    ['raffle-picker.html', 'Raffle / pick a winner'],
    ['secret-santa-generator.html', 'Secret Santa'],
    ['team-generator.html', 'Team generator'],
    ['posts/name-combiner.html', 'Name combiner'],
  ], more: [['name-tools.html', 'Name tools']] },
];

/** Every page the menu links to, for the build's link check. */
function menuPages() {
  return MENU.flatMap(group => [...group.links, ...group.more, ...(group.seasonal || [])].map(([href]) => href));
}

/** Header A ("Roomy"): logo, menu button on phones, links on desktop, then a hand-drawn rule. */
function siteHeader(prefix) {
  const home = prefix === '/' ? '/' : `${prefix}index.html`;
  const link = ([href, text]) => `<a href="${prefix}${href}">${escapeHtml(text)}</a>`;
  const groups = MENU.map(group => `<li class="nav-dropdown">
              <button class="nav-dropdown-toggle" type="button" aria-expanded="false" aria-controls="${group.id}"><span class="nav-label">${escapeHtml(group.label)}</span></button>
              <ul class="nav-dropdown-menu" id="${group.id}">
                ${group.links.map(l => `<li>${link(l)}</li>`).join('\n                ')}
                <li class="nav-more">More: ${group.more.map(link).join(' · ')}</li>${group.seasonal ? `
                <li class="nav-more">Seasonal: ${group.seasonal.map(link).join(' · ')}</li>` : ''}
              </ul>
            </li>`).join('\n            ');
  return `<header class="site-header">
      <div class="wrap bar">
        <a class="logo" href="${home}">${LOGO}<b>${SITE_NAME}</b></a>
        <button class="menu-toggle hd tap" id="menu-toggle" type="button" aria-expanded="false" aria-controls="nav-links">${MENU_ICON}Menu</button>
        <nav class="site-nav" aria-label="Main">
          <ul class="nav-links" id="nav-links">
            ${groups}
            <li><a href="${prefix}all-generators.html">All generators</a></li>
          </ul>
        </nav>
      </div>
      <div class="wrap">${RULE}</div>
    </header>`;
}

function siteFooter(prefix) {
  return `<footer class="site-footer">
      <div class="wrap">
        <p>&copy; <span id="current-year">${new Date().getFullYear()}</span> ${SITE_NAME} · <a href="${prefix}about.html">About</a> · <a href="${prefix}all-generators.html">All generators</a> · <a href="${prefix}spin-the-wheel.html">Spin the Wheel</a> · <a href="${prefix}name-tools.html">Name tools</a> · <a href="${prefix}sitemap.html">Site map</a> · <a href="${prefix}privacy.html">Privacy</a></p>
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
  analyticsTag, shareImage, LOGO,
  SITE_NAME, escapeHtml, asset, menuPages, headAssets, stampAssets, bodyScripts, svgSprite, siteHeader, siteFooter,
  doodle, categoryMotif, generatorMotif, highlightFirstWord, stripEmoji, categoryLinks,
};
