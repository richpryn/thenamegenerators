#!/usr/bin/env node

/**
 * Build Pages Script
 * Generates every page from content/ (see scripts/content.js):
 *   posts/<slug>.html                 one page per generator
 *   categories/<slug>-names.html      one page per category
 *   data/generators/<key>.json        what the homepage generator loads
 *   sitemap.xml, sitemap.html, 404.html, llms.txt
 * and refreshes the marked sections of index.html, all-generators.html and
 * about.html (between <!-- BUILD:name --> and <!-- /BUILD:name -->).
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { loadContent, validate, withCounts, countNames, countCombinations } = require('./content');
const { filtersHtml, optionLabel } = require('../lib/page.js');
const RecipeEngine = require('../lib/recipe-engine.js');
const layout = require('./layout');

const ROOT = path.join(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'posts');
const CATEGORIES_DIR = path.join(ROOT, 'categories');
const RUNTIME_DIR = path.join(ROOT, 'data/generators');

/**
 * Escape HTML to prevent XSS and fix &amp; issues
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML
 */
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * When a file last changed, as YYYY-MM-DD: today if it has edits not yet
 * committed, otherwise the date of the last commit that touched it. Null if
 * git isn't available. Keeps dates stable from one build to the next.
 */
const TODAY = new Date().toISOString().split('T')[0];
function lastChanged(file) {
  try {
    const git = (...args) => execFileSync('git', args, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    if (git('status', '--porcelain', '--', file)) return TODAY;
    return git('log', '-1', '--format=%cs', '--', file) || TODAY;
  } catch (e) {
    return null;
  }
}

const latest = (dates) => dates.filter(Boolean).sort().pop() || TODAY;

// Article text may use **bold** and *italic*; turn them into HTML (or drop
// them for plain text).
const ITALIC = /(^|[^*\w])\*(?!\*)([^*\s][^*]*?)\*(?!\*)/g;
function markdownBold(html) {
  return String(html || '')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(ITALIC, '$1<em>$2</em>');
}
function plainText(text) {
  return String(text || '').replace(/\*\*/g, '').replace(ITALIC, '$1$2')
    .replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// JSON for a <script> block: "<" escaped so data can't close the tag.
function scriptJson(value, indent) {
  return JSON.stringify(value, null, indent).replace(/</g, '\\u003c');
}

/** The fields the in-browser engine needs, without the article text. */
function runtimeConfig(gen) {
  const { icon, description, seoKeywords, isPopular, popularRank, category, published, updated, article, key, examplePairs, noun, ...config } = gen;
  return config;
}

/** Category links for the menu. `prefix` is "../" from subfolders. */
function navDropdownHtml(categories, prefix) {
  return layout.categoryLinks(categories, prefix);
}

const SITE_NAME = 'The Name Generators';

// Generator pages that changed address: old slug -> new slug (see movedPage).
// (The old warhammer -> hammer entry was removed once the address became the
// Warhammer 40k character page.)
const MOVED_PAGES = {
};

function movedPage(newSlug) {
  const url = `https://thenamegenerators.com/posts/${newSlug}.html`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Moved | ${SITE_NAME}</title>
    <link rel="canonical" href="${url}">
    <meta http-equiv="refresh" content="0; url=${newSlug}.html">
</head>
<body>
    <p>This page has moved to <a href="${newSlug}.html">${url}</a>.</p>
</body>
</html>
`;
}
// Favicons (absolute paths: the 404 page is served at any address)
const ICON_LINKS = `<link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">`;
const AUTHOR = { "@type": "Person", "name": "Rich", "url": "https://thenamegenerators.com/about.html" };
const USAGE_NOTE = "Free to use, no credit needed. If you're naming a business, brand, band or product, check the name isn't already taken or trademarked first.";

/**
 * Page title: the generator's full title, plus the site name, plus
 * "Free Online Tool" when it still fits in ~60 characters.
 */
function generateSEOTitle(generator) {
  if (generator.seoTitle) return generator.seoTitle;
  const withTool = `${generator.title} - Free Online Tool | ${SITE_NAME}`;
  if (withTool.length <= 60) return withTool;
  const withSite = `${generator.title} | ${SITE_NAME}`;
  return withSite.length <= 60 ? withSite : generator.title;
}

/** "Elf Name Generator" -> "Elf Names", "Epithet Generator" -> "Epithets" */
function pluralNoun(generator) {
  if (generator.noun) return generator.noun; // e.g. "Combined Names" when the title isn't "X Generator"
  return generator.title.replace(/\s+Generator$/i, '') + 's';
}

/** "20 October 2026" */
function longDate(iso) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${months[m - 1]} ${y}`;
}

// Small seeded random number generator, so example names only change when
// a generator's names change, not on every build.
function seededRandom(seedText) {
  let h = 1779033703 ^ seedText.length;
  for (let i = 0; i < seedText.length; i++) {
    h = Math.imul(h ^ seedText.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/**
 * Sample names shown in the page's HTML, so search engines and AI tools can
 * see what the generator makes. Grouped by filter choice (up to 6 groups).
 */
function exampleNames(generator) {
  const TOTAL = 24;
  const MAX_GROUPS = 6;
  const engine = RecipeEngine.createGenerator(generator, { random: seededRandom(generator.slug) });
  const filters = generator.filters || {};
  const textValues = {};
  const selectKeys = [];
  for (const [key, f] of Object.entries(filters)) {
    if (f.type === 'text') textValues[key] = f.example || f.default || '';
    else selectKeys.push(key);
  }

  let combos = [{}];
  for (const key of selectKeys) {
    combos = combos.flatMap(c => engine.availableOptions(key, c).map(opt => ({ ...c, [key]: opt })));
  }
  if (combos.length > MAX_GROUPS) {
    const step = combos.length / MAX_GROUPS;
    combos = Array.from({ length: MAX_GROUPS }, (_, i) => combos[Math.floor(i * step)]);
  }

  // Generators that blend typed names show a few example pairs instead
  if (generator.examplePairs) {
    return generator.examplePairs.map(pair => ({
      label: Object.values(pair).join(' + '),
      names: engine.generate({ ...textValues, ...pair }, 4),
    }));
  }

  const perGroup = Math.max(4, Math.ceil(TOTAL / combos.length));
  return combos.map(combo => ({
    label: selectKeys
      .map(k => optionLabel(filters[k], combo[k]).replace(/\s*\(.*\)\s*$/, ''))
      .join(' · '),
    names: engine.generate({ ...textValues, ...combo }, perGroup),
  }));
}

/**
 * "How the X works": written from the generator's own filters and lists, so
 * it's always accurate. Shows each dropdown's choices, with a sample name for
 * each format when the format changes how names are built.
 */
function howItWorksHtml(generator) {
  const filters = generator.filters || {};
  const engine = RecipeEngine.createGenerator(generator, { random: seededRandom(generator.slug + ':how') });
  const names = countNames(generator.data);
  const combinations = countCombinations(generator);
  const label = (f, opt) => optionLabel(f, opt).replace(/\s*\(.*\)\s*$/, '');
  const defaults = {};
  for (const [k, f] of Object.entries(filters)) defaults[k] = f.type === 'text' ? (f.example || f.default || '') : f.options[0];

  if (generator.recipe === 'blend') {
    const [a, b] = generator.inputs.map(k => filters[k].example || filters[k].default || '');
    const sample = engine.generate(defaults, 3).join(', ');
    return `
            <section class="section how-it-works">
                <h2>How the ${escapeHtml(generator.title)} Works</h2>
                <div class="howto hd">
                <p>Type two names and it joins the start of one to the end of the other, at points where the join reads naturally: a vowel meeting a consonant, with a vowel kept on each side. It skips results that just repeat one of the names, keeps the best-sounding ten (closest to the names' average length), and gives them to you in a random order. Very short names are also simply joined end to end.</p>
                <p>For example, ${escapeHtml(a)} and ${escapeHtml(b)} give ${escapeHtml(sample)}. Only the first word of each box is used.</p>
                </div>
            </section>`;
  }

  // "names", or "epithets" for the Epithet Generator
  const noun = /\bNames?\b/.test(generator.title) ? 'names' : pluralNoun(generator).split(' ').pop().toLowerCase();
  const parts = [];
  parts.push(combinations > names
    ? `<p>It works from ${names.toLocaleString('en-GB')} ${noun} and name parts, which combine into over ${roundDownNumber(combinations)} possible results.</p>`
    : `<p>It picks from a list of ${names.toLocaleString('en-GB')} ${noun}.</p>`);

  const choices = [];
  const keys = Object.keys(filters);
  keys.forEach((key, i) => {
    const f = filters[key];
    if (f.type === 'text') {
      choices.push(`<li><strong>${escapeHtml(f.label)}:</strong> type a name and it's built into every result${f.default ? ` (leave it blank to get "${escapeHtml(f.default)}")` : ''}.</li>`);
      return;
    }
    // A switch on this filter changes how names are built: show a sample of each
    const shapes = generator.recipe === 'switch' && generator.on === key && f.options.length <= 8;
    if (shapes) {
      choices.push(`<li><strong>${escapeHtml(f.label)}:</strong><ul>${f.options.map(opt => {
        const [sample] = engine.generate({ ...defaults, [key]: opt }, 1);
        return `<li>${escapeHtml(label(f, opt))}, e.g. <em>${escapeHtml(sample)}</em></li>`;
      }).join('')}</ul></li>`);
    } else {
      choices.push(`<li><strong>${escapeHtml(f.label)}:</strong> ${f.options.map(o => escapeHtml(label(f, o))).join(', ')}.</li>`);
    }
    // Options that only exist for some earlier choices, grouped:
    // "Male and Female: Fire, Ice...; Neutral: Primordial..."
    const earlier = keys[i - 1];
    if (i > 0 && filters[earlier].type !== 'text') {
      const ef = filters[earlier];
      const groups = new Map();
      for (const opt of ef.options) {
        const avail = engine.availableOptions(key, { ...defaults, [earlier]: opt }).map(o => label(f, o)).join(', ');
        groups.set(avail, (groups.get(avail) || []).concat(label(ef, opt)));
      }
      if (groups.size > 1) {
        const and = (list) => list.length > 1 ? list.slice(0, -1).join(', ') + ' and ' + list[list.length - 1] : list[0];
        if (!shapes) choices.pop(); // replace the flat list with the grouped one
        choices.push(`<li><strong>${escapeHtml(f.label)}:</strong> depends on the ${escapeHtml(ef.label.toLowerCase())}:<ul>${
          [...groups].map(([avail, opts]) => `<li>${escapeHtml(and(opts))}: ${escapeHtml(avail)}</li>`).join('')}</ul></li>`);
      }
    }
  });
  if (choices.length) parts.push(`<p>The choices:</p>\n                <ul>${choices.join('')}</ul>`);
  parts.push(`<p>Each press gives you 8 names. "Show 8 more" adds 8 you haven't seen yet, until the names for the choices you've made run out.</p>`);

  return `
            <section class="section how-it-works">
                <h2>How the ${escapeHtml(generator.title)} Works</h2>
                <div class="howto hd">
                ${parts.join('\n                ')}
                </div>
            </section>`;
}

// 2,740 -> "2,700"
function roundDownNumber(n) {
  if (n < 100) return String(n);
  const digits = Math.pow(10, String(Math.floor(n)).length - 2);
  return (Math.floor(n / digits) * digits).toLocaleString('en-GB');
}

/**
 * Generate schema.org JSON-LD for a generator page
 */
function generateSchemas(generator, category, examples) {
  const schemas = [];
  const baseUrl = "https://thenamegenerators.com";
  const pageUrl = `${baseUrl}/posts/${generator.slug}.html`;

  let articleBody = generator.description;
  if (generator.article && generator.article.intro) {
    articleBody += ' ' + plainText(generator.article.intro);
  }
  if (generator.article && generator.article.sections) {
    generator.article.sections.forEach(section => {
      articleBody += ' ' + section.heading + ' ' + plainText(section.content);
    });
  }

  schemas.push({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": generator.title,
    "description": generator.description,
    "articleBody": articleBody.substring(0, 5000),
    "url": pageUrl,
    "author": AUTHOR,
    "publisher": {
      "@type": "Organization",
      "name": SITE_NAME,
      "url": baseUrl
    },
    "datePublished": generator.published,
    "dateModified": generator.updated,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": pageUrl
    },
    "articleSection": category.name,
    "keywords": generator.seoKeywords
  });

  schemas.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": `${baseUrl}/` },
      { "@type": "ListItem", "position": 2, "name": category.name, "item": `${baseUrl}/categories/${category.slug}-names.html` },
      { "@type": "ListItem", "position": 3, "name": generator.title, "item": pageUrl }
    ]
  });

  schemas.push({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": generator.title,
    "description": generator.description,
    "url": pageUrl,
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "Any",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "isAccessibleForFree": true,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": AUTHOR
  });

  // The example names on the page, as a list
  schemas.push({
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Example ${pluralNoun(generator)}`,
    "itemListElement": examples.flatMap(g => g.names).map((name, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": name
    }))
  });

  if (generator.article && generator.article.faqs) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": generator.article.faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": plainText(faq.answer)
        }
      }))
    });
  }

  return schemas;
}

/**
 * Generate HTML for a single generator page
 */
function generateGeneratorPage(generator, category, site) {
  const examples = exampleNames(generator);
  const schemas = generateSchemas(generator, category, examples);
  // Escape "<" as \u003c so a stray "</script>" in any data string cannot
  // break out of the JSON-LD block. Valid JSON, understood by all parsers.
  const schemaScripts = schemas.map(s =>
    `<script type="application/ld+json">\n${JSON.stringify(s, null, 2).replace(/</g, '\\u003c')}\n</script>`
  ).join('\n    ');

  // The generator's controls: option buttons, dropdowns and text boxes
  // Two or more groups of options sit side by side on desktop
  const filterCount = Object.keys(generator.filters || {}).length;
  const filterHTML = filterCount
    ? `<div class="${filterCount > 1 ? 'gen-grid' : 'gen-one'}">${filtersHtml(generator.filters, { prefill: generator.recipe === 'blend' })}</div>`
    : '';

  // Drawings: this generator's own, and one for each linked generator
  const motif = layout.generatorMotif(generator, category);
  const motifs = [motif];
  const catOf = (gen) => site.categories.find(c => c.slug === gen.category);
  const genCard = (gen, { desc = true } = {}) => {
    const m = layout.generatorMotif(gen, catOf(gen));
    motifs.push(m);
    return `<a href="../posts/${gen.slug}.html" class="gencard hd tap">${layout.doodle(m)}<div><b>${escapeHtml(gen.title)}</b>${desc ? `<span>${escapeHtml(gen.description)}</span>` : ''}</div><em aria-hidden="true">→</em></a>`;
  };

  const related = site.related(generator);
  const relatedHTML = related.length ? `
            <section class="section related-section">
                <h2>Related Name Generators</h2>
                <div class="genlist" id="related-generators">
                    ${related.map(gen => genCard(gen)).join('\n                    ')}
                </div>
            </section>` : '';

  const sameCategory = site.inCategory(category.slug).filter(gen => gen.key !== generator.key);
  const categoryGeneratorsHTML = sameCategory.length ? `
            <section class="section category-generators-section">
                <h2>More ${escapeHtml(category.name)} Name Generators</h2>
                <div class="genlist compact" id="category-generators">
                    ${sameCategory.map(gen => genCard(gen, { desc: false })).join('\n                    ')}
                </div>
                <p class="all-link"><a href="../categories/${category.slug}-names.html">All ${escapeHtml(category.name)} name generators</a></p>
            </section>` : '';

  // Article sections (headings and content are trusted HTML from content/)
  let sectionsHTML = '';
  if (generator.article && generator.article.sections) {
    sectionsHTML = generator.article.sections.map(section => `
                <h2>${section.heading}</h2>
                ${markdownBold(section.content)}`).join('\n');
  }

  // FAQs: tap a question to open its answer. Answers stay in the HTML for
  // search engines, and the FAQPage schema is built from the same text.
  let faqsHTML = '';
  if (generator.article && generator.article.faqs && generator.article.faqs.length) {
    faqsHTML = `
            <section class="section faq-section">
                <h2>Frequently Asked Questions</h2>
                <div class="faq">
                    ${generator.article.faqs.map(faq => `<details>
                        <summary><span class="tg hd" aria-hidden="true">+</span>${faq.question}</summary>
                        <div>${markdownBold(faq.answer)}</div>
                    </details>`).join('\n                    ')}
                </div>
            </section>`;
  }
  // Generate SEO-optimized title
  const seoTitle = generateSEOTitle(generator);
  const baseUrl = "https://thenamegenerators.com";
  const pageUrl = `${baseUrl}/posts/${generator.slug}.html`;
  const imageUrl = `${baseUrl}/images/${generator.slug}.jpg`;

  // Enhanced meta description (150-160 characters optimal)
  const metaDescription = generator.description.length > 160
    ? generator.description.substring(0, 157) + '...'
    : generator.description;

  // HTML-escaped values for safe injection into attributes and plain-text
  // headings. (Article intro/section content is intentional HTML and is NOT
  // escaped here.)
  const escTitle = escapeHtml(seoTitle);
  const escDesc = escapeHtml(metaDescription);
  const escKeywords = escapeHtml(generator.seoKeywords);
  const escGenTitle = escapeHtml(generator.title);
  const escGenDesc = escapeHtml(generator.description);
  const escTopic = escapeHtml(generator.title.replace(' Generator', ''));
  const escCategoryName = escapeHtml(category.name);
  const heroTitle = layout.stripEmoji(generator.article.hero.title) || generator.title;
  const escHeroTagline = escapeHtml(generator.article.hero.tagline);
  const escNoun = escapeHtml(pluralNoun(generator));

  // Long names (Roman, spaceships, taverns...) read better one per row on phones
  const exampleList = examples.flatMap(g => g.names);
  const longNames = exampleList.length && exampleList.reduce((n, x) => n + x.length, 0) / exampleList.length > 16;

  const examplesHTML = `
            <section class="section example-names">
                <h2>Example ${escNoun}</h2>
                <p class="sub">A few names this generator came up with. Tap one to copy it, or press "Generate Names" above for more.</p>
                <div class="ex">
                ${examples.map(group => `<div class="exbox hd">
                    ${group.label ? `<h3>${escapeHtml(group.label)}</h3>` : ''}
                    <ul>
                        ${group.names.map(n => `<li>${escapeHtml(n)}</li>`).join('\n                        ')}
                    </ul>
                </div>`).join('\n                ')}
                </div>
            </section>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Mediavine Grow -->
    <script data-grow-initializer="">!(function(){window.growMe||((window.growMe=function(e){window.growMe._.push(e);}),(window.growMe._=[]));var e=document.createElement("script");(e.type="text/javascript"),(e.src="https://faves.grow.me/main.js"),(e.defer=!0),e.setAttribute("data-grow-faves-site-id","U2l0ZTo2YmQ3YzdiOS00MDgwLTQ5MmYtOGEyZi0yZWE3YmU2N2E5ZTU=");var t=document.getElementsByTagName("script")[0];t.parentNode.insertBefore(e,t);})();</script>
    
    <!-- Primary SEO Meta Tags -->
    <title>${escTitle}</title>
    <meta name="title" content="${escTitle}">
    <meta name="description" content="${escDesc}">
    <meta name="keywords" content="${escKeywords}">
    <meta name="author" content="The Name Generators">
    <meta name="robots" content="index, follow">
    <meta name="language" content="English">
    <meta name="revisit-after" content="7 days">
    <link rel="canonical" href="${pageUrl}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${pageUrl}">
    <meta property="og:title" content="${escTitle}">
    <meta property="og:description" content="${escDesc}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:site_name" content="The Name Generators">
    <meta property="og:locale" content="en_US">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${pageUrl}">
    <meta property="twitter:title" content="${escTitle}">
    <meta property="twitter:description" content="${escDesc}">
    <meta property="twitter:image" content="${imageUrl}">

    <!-- Additional Meta Tags -->
    <meta name="generators" content="${generator.slug}">
    <meta name="categories" content="${escCategoryName}">

    <!-- AI/LLM Friendly Meta Tags -->
    <meta name="topic" content="${escTopic}">
    <meta name="content-type" content="name-generator">
    <meta name="ai-index" content="yes">
    <meta name="ai-crawl" content="allow">
    
    <!-- Security Headers -->
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta http-equiv="X-Frame-Options" content="SAMEORIGIN">
    <meta http-equiv="X-XSS-Protection" content="1; mode=block">
    <meta http-equiv="Permissions-Policy" content="geolocation=(), microphone=(), camera=()">
    <meta name="referrer" content="strict-origin-when-cross-origin">
    <meta name="format-detection" content="telephone=no">
    <!-- Content Security Policy (CSP) - Note: Some headers need server configuration -->
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://faves.grow.me; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://faves.grow.me;">
    
    <!-- Schema.org JSON-LD -->
    ${schemaScripts}
    
    ${ICON_LINKS}
    ${layout.headAssets('../')}
</head>
<body>
    ${layout.svgSprite(motifs)}
    ${layout.siteHeader('../', site.categories)}

    <div class="wrap layout">
        <main id="main">
            <nav class="crumb" aria-label="Breadcrumb"><a href="../index.html">Home</a> / <a href="../categories/${category.slug}-names.html">${escapeHtml(category.name)}</a> / <span aria-current="page">${escGenTitle}</span></nav>
            <div class="titlerow">
                <h1>${layout.highlightFirstWord(heroTitle)}</h1>
                ${layout.doodle(motif)}
            </div>
            <p class="lede">${escHeroTagline}</p>

            <section class="sheet hd simple-generator" id="generator" aria-label="${escGenTitle}">
                ${filterHTML}
                <button id="generate-btn" class="go hd tap" type="button"><svg aria-hidden="true" focusable="false"><use href="#i-wand"/></svg>Generate Names</button>
                <div id="results" class="results-area" data-long="${longNames ? 'true' : 'false'}">
                    <p class="results-empty">Press Generate Names for 8 ${escNoun.toLowerCase()}.</p>
                </div>
                <div class="after">
                    <button id="more" class="more hd tap" type="button" hidden>+ Show 8 more</button>
                    <p id="done" class="done-note" tabindex="-1" hidden><svg aria-hidden="true" focusable="false"><use href="#i-tick"/></svg><span data-done-text></span></p>
                </div>
                <div class="foot">
                    <p class="sl" id="shortlist-line">Tap a name to copy it, or the bookmark to keep it.</p>
                    <div class="acts">
                        <button type="button" class="mini hd tap" data-action="copy-all" disabled><svg class="ic" aria-hidden="true" focusable="false"><use href="#i-copy"/></svg><span>Copy</span></button>
                        <button type="button" class="mini hd tap" data-action="clear" disabled><svg class="ic" aria-hidden="true" focusable="false"><use href="#i-clear"/></svg><span>Clear</span></button>
                    </div>
                </div>
                <div class="shortlist" id="shortlist" aria-label="Your shortlist" hidden></div>
                <p class="key"><i aria-hidden="true"></i>black shadow = tap it</p>
            </section>
            <p class="byline">By <a href="../about.html">Rich</a> · Updated <time datetime="${generator.updated}">${longDate(generator.updated)}</time></p>
${examplesHTML}
${howItWorksHtml(generator)}

            <article class="section article" itemscope itemtype="https://schema.org/Article">
                <meta itemprop="headline" content="${escGenTitle}">
                <meta itemprop="description" content="${escGenDesc}">
                <div itemprop="articleBody">
                <p class="big">${markdownBold(generator.article.intro)}</p>
                ${sectionsHTML}
                </div>
            </article>
${faqsHTML}
${relatedHTML}
${categoryGeneratorsHTML}
            <p class="usage-note">${escapeHtml(USAGE_NOTE)}</p>
        </main>
        <aside class="side" aria-label="Sidebar"></aside>
    </div>

    ${layout.siteFooter('../')}

    <script type="application/json" id="generator-config">${scriptJson(runtimeConfig(generator))}</script>
    ${layout.bodyScripts('../', { engine: true })}
</body>
</html>`;

  return html;
}

/**
 * Generate category landing page
 */
function generateCategoryPage(category, site) {
  const categorySlug = category.slug;
  const generators = site.inCategory(categorySlug);
  const catOf = (gen) => site.categories.find(c => c.slug === gen.category);
  const mark = layout.categoryMotif(category);
  const motifs = [mark];

  // "Where to start": a few of the category's best generators, with a line on each
  const featured = (category.featured || []).map(f => {
    const gen = generators.find(g => g.key === f.key);
    const m = layout.generatorMotif(gen, catOf(gen));
    motifs.push(m);
    return `<a href="../posts/${gen.slug}.html" class="feat hd tap">${layout.doodle(m)}<b>${escapeHtml(gen.title)}</b><span>${f.note.charAt(0).toUpperCase() + f.note.slice(1)}</span><span class="open hd" aria-hidden="true">Open →</span></a>`;
  }).join('\n                    ');

  const generatorsHTML = generators.map(gen => {
    const m = layout.generatorMotif(gen, catOf(gen));
    motifs.push(m);
    return `<a href="../posts/${gen.slug}.html" class="gencard hd tap">${layout.doodle(m)}<div><b>${escapeHtml(gen.title)}</b><span>${escapeHtml(gen.description)}</span></div><em aria-hidden="true">→</em></a>`;
  }).join('\n                    ');

  // Generate SEO-optimized category title
  const baseUrl = "https://thenamegenerators.com";
  const categorySEOTitle = category.seoTitle || `${category.name} Name Generators - Free Online Tools | The Name Generators`;
  const categoryUrl = `${baseUrl}/categories/${categorySlug}-names.html`;
  const categoryImageUrl = `${baseUrl}/images/categories/${categorySlug}.jpg`;
  
  // Enhanced category meta description
  const categoryMetaDesc = category.seoDescription.length > 160
    ? category.seoDescription.substring(0, 157) + '...'
    : category.seoDescription;

  // HTML-escaped values for safe attribute/plain-text injection
  const escCatTitle = escapeHtml(categorySEOTitle);
  const escCatDesc = escapeHtml(categoryMetaDesc);
  const escCatName = escapeHtml(category.name);
  const escCatDescription = escapeHtml(category.description);
  const escCatKeywords = escapeHtml(`${category.name.toLowerCase()} names, ${category.name.toLowerCase()} name generator, ${category.name.toLowerCase()} name generators`);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Mediavine Grow -->
    <script data-grow-initializer="">!(function(){window.growMe||((window.growMe=function(e){window.growMe._.push(e);}),(window.growMe._=[]));var e=document.createElement("script");(e.type="text/javascript"),(e.src="https://faves.grow.me/main.js"),(e.defer=!0),e.setAttribute("data-grow-faves-site-id","U2l0ZTo2YmQ3YzdiOS00MDgwLTQ5MmYtOGEyZi0yZWE3YmU2N2E5ZTU=");var t=document.getElementsByTagName("script")[0];t.parentNode.insertBefore(e,t);})();</script>
    
    <!-- Primary SEO Meta Tags -->
    <title>${escCatTitle}</title>
    <meta name="title" content="${escCatTitle}">
    <meta name="description" content="${escCatDesc}">
    <meta name="keywords" content="${escCatKeywords}">
    <meta name="author" content="The Name Generators">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${categoryUrl}">
    <script type="application/ld+json">
${scriptJson({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": `${baseUrl}/` },
    { "@type": "ListItem", "position": 2, "name": category.name, "item": categoryUrl }
  ]
}, 2)}
    </script>
    <script type="application/ld+json">
${scriptJson({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": category.heading || `${category.name} Name Generators`,
  "description": categoryMetaDesc,
  "url": categoryUrl,
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": generators.map((g, i) => ({ "@type": "ListItem", "position": i + 1, "name": g.title, "url": `${baseUrl}/posts/${g.slug}.html` }))
  }
}, 2)}
    </script>
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${categoryUrl}">
    <meta property="og:title" content="${escCatTitle}">
    <meta property="og:description" content="${escCatDesc}">
    <meta property="og:image" content="${categoryImageUrl}">
    <meta property="og:site_name" content="The Name Generators">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${categoryUrl}">
    <meta property="twitter:title" content="${escCatTitle}">
    <meta property="twitter:description" content="${escCatDesc}">
    <meta property="twitter:image" content="${categoryImageUrl}">
    
    ${ICON_LINKS}
    ${layout.headAssets('../')}
</head>
<body>
    ${layout.svgSprite(motifs)}
    ${layout.siteHeader('../', site.categories)}

    <div class="wrap layout">
        <main id="main">
            <nav class="crumb" aria-label="Breadcrumb"><a href="../index.html">Home</a> / <span aria-current="page">${escCatName}</span></nav>
            <div class="titlerow">
                <h1>${layout.highlightFirstWord(category.navLabel.replace(/Names$/, 'Name Generators'))}</h1>
                ${layout.doodle(mark)}
            </div>
            <p class="lede">${escCatDescription}</p>
${category.intro ? `
            <div class="section intro">
                ${category.intro}
            </div>` : ''}
${featured ? `
            <section class="section">
                <h2>Where to start</h2>
                <div class="featured">
                    ${featured}
                </div>
            </section>` : ''}

            <section class="section">
                <h2>All ${generators.length} ${escCatName} generator${generators.length !== 1 ? 's' : ''}</h2>
                <div class="genlist">
                    ${generatorsHTML}
                </div>
            </section>
        </main>
        <aside class="side" aria-label="Sidebar"></aside>
    </div>

    ${layout.siteFooter('../')}
    ${layout.bodyScripts('../')}
</body>
</html>`;

  return html;
}

/**
 * Spin the Wheel (spin-the-wheel.html), built to docs/redesign/WHEEL.md.
 * The tool itself is lib/wheel.js; "Fill from a generator" uses the
 * recipe engine with each generator's runtime file in data/generators/.
 */
const WHEEL_FILL = [
  ['elf', 'Elf names'], ['dwarf', 'Dwarf names'], ['dragon', 'Dragon names'], ['tiefling', 'Tiefling names'],
  ['wizard', 'Wizard names'], ['pirate', 'Pirate names'], ['viking', 'Viking names'], ['superhero', 'Superhero names'],
  ['band', 'Band names'], ['tavern', 'Tavern names'], ['gamertag', 'Gamertags'], ['fantasy_town', 'Town names'],
];
const WHEEL_FAQS = [
  ['Is the wheel really random?', "Yes. The winner is picked by your browser's built-in secure random number generator the moment you press Spin, and every name gets a slice the same size. The spin just shows you where it landed."],
  ['Do you keep my list?', "No. The list is saved in your own browser, so it's still there next time, and nowhere else. A share link carries the names inside the link itself, after the # sign, which browsers never send to the server."],
  ['How many names can I add?', 'Up to 500. Names are written on the wheel up to 120; beyond that the slices are too thin to read, so the wheel shows colours only and the winner appears in the card.'],
  ['What happens if I add the same name twice?', "Duplicates are removed automatically, so everyone gets one slice. If you want someone to have a better chance, add a variation like \"Sam (2)\"."],
  ['Can I take a name off after it wins?', 'Yes. Press "Remove & spin again" in the winner card, or "Remove winner" under the wheel. Handy for turn order or a raffle with several prizes.'],
];

function generateWheelPage(site) {
  const baseUrl = 'https://thenamegenerators.com';
  const url = `${baseUrl}/spin-the-wheel.html`;
  const title = 'Spin the Wheel: Random Name Picker Wheel | The Name Generators';
  const desc = 'Spin a wheel to pick a random name. Type or paste names, spin, remove the winner and spin again. Free, no sign-up, and your list stays in your browser.';
  const fill = WHEEL_FILL.filter(([key]) => site.all.some(g => g.key === key));
  const tools = ['name_combiner', 'gamertag', 'band', 'dnd_fantasy']
    .map(key => site.all.find(g => g.key === key)).filter(Boolean);
  const catOf = (gen) => site.categories.find(c => c.slug === gen.category);
  const motifs = tools.map(g => layout.generatorMotif(g, catOf(g)));
  const wheelDoodle = `<svg class="doodle wob" viewBox="0 0 60 60" aria-hidden="true" focusable="false"><circle cx="30" cy="32" r="22" fill="#fffcf4" stroke="#1e1c18" stroke-width="1.8"/><path d="M30 10 V54 M8 32 H52 M14.5 16.5 L45.5 47.5 M45.5 16.5 L14.5 47.5" stroke="#1e1c18" stroke-width="1.2" stroke-linecap="round"/><path d="M30 32 L30 10 A22 22 0 0 1 45.5 16.5 Z" fill="#efc84a" stroke="#1e1c18" stroke-width="1.2" stroke-linejoin="round"/><circle cx="30" cy="32" r="3.5" fill="#1e1c18"/><path d="M26 3 L34 3 L30 11 Z" fill="#1e1c18"/></svg>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">

    <!-- Mediavine Grow -->
    <script data-grow-initializer="">!(function(){window.growMe||((window.growMe=function(e){window.growMe._.push(e);}),(window.growMe._=[]));var e=document.createElement("script");(e.type="text/javascript"),(e.src="https://faves.grow.me/main.js"),(e.defer=!0),e.setAttribute("data-grow-faves-site-id","U2l0ZTo2YmQ3YzdiOS00MDgwLTQ5MmYtOGEyZi0yZWE3YmU2N2E5ZTU=");var t=document.getElementsByTagName("script")[0];t.parentNode.insertBefore(e,t);})();</script>

    <title>${escapeHtml(title)}</title>
    <meta name="title" content="${escapeHtml(title)}">
    <meta name="description" content="${escapeHtml(desc)}">
    <meta name="keywords" content="spin the wheel, name wheel, random name picker wheel, wheel spinner, random wheel, spin wheel for names, wheel of names, raffle wheel">
    <meta name="author" content="The Name Generators">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${url}">
    <script type="application/ld+json">
${scriptJson({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": `${baseUrl}/` },
    { "@type": "ListItem", "position": 2, "name": "Spin the Wheel", "item": url }
  ]
}, 2)}
    </script>
    <script type="application/ld+json">
${scriptJson({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Spin the Wheel",
  "url": url,
  "description": desc,
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Any (runs in your browser)",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "GBP" },
  "author": AUTHOR
}, 2)}
    </script>
    <script type="application/ld+json">
${scriptJson({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": WHEEL_FAQS.map(([q, a]) => ({ "@type": "Question", "name": q, "acceptedAnswer": { "@type": "Answer", "text": a } }))
}, 2)}
    </script>

    <meta property="og:type" content="website">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(desc)}">
    <meta property="og:site_name" content="The Name Generators">
    <meta property="twitter:card" content="summary">
    <meta property="twitter:title" content="${escapeHtml(title)}">
    <meta property="twitter:description" content="${escapeHtml(desc)}">

    ${ICON_LINKS}
    ${layout.headAssets('')}
</head>
<body>
    ${layout.svgSprite(motifs)}
    ${layout.siteHeader('', site.categories)}

    <div class="wrap layout">
        <main id="main">
            <nav class="crumb" aria-label="Breadcrumb"><a href="index.html">Home</a> / <span aria-current="page">Spin the Wheel</span></nav>
            <div class="titlerow">
                <h1>Spin the <span class="hl">Wheel</span></h1>
                ${wheelDoodle}
            </div>
            <p class="lede">Type or paste names, one per line, then spin. Free, no sign-up, and your list stays in your browser.</p>

            <section class="sheet wt-sheet hd" id="wheel-tool" aria-label="Spin the wheel">
                <div class="wt-grid">
                    <div class="wt-wheelcol">
                        <div class="wt-box">
                            <svg class="wt-pointer wob" id="wt-pointer" viewBox="0 0 40 50" aria-hidden="true" focusable="false"><path d="M8 6 C14 3 26 3 32 6 C33 16 26 34 20 46 C14 34 7 16 8 6 Z" fill="#efc84a" stroke="#1e1c18" stroke-width="2.2" stroke-linejoin="round"/><circle cx="20" cy="13" r="3.4" fill="#1e1c18"/></svg>
                            <div class="wt-spinner" id="wt-spinner" role="button" tabindex="0" aria-label="Spin the wheel" aria-describedby="wt-desc"><canvas id="wt-wheel" aria-hidden="true"></canvas></div>
                            <p class="wt-empty" id="wt-empty" hidden>Add at least two names to spin.</p>
                            <canvas id="wt-confetti" aria-hidden="true"></canvas>
                            <div class="wt-winner hd" id="wt-winner" hidden role="group" aria-labelledby="wt-eyebrow wt-winner-name">
                                <button class="wt-x" id="wt-win-close" type="button" aria-label="Close and keep the name on the wheel">×</button>
                                <div class="wt-eyebrow" id="wt-eyebrow">The wheel picked</div>
                                <strong class="wt-wname" id="wt-winner-name" tabindex="-1"><span></span></strong>
                                <div class="wt-row">
                                    <button class="go hd tap" id="wt-win-remove" type="button">Remove &amp; spin again</button>
                                    <button class="mini hd tap" id="wt-win-again" type="button">Spin again</button>
                                </div>
                            </div>
                        </div>
                        <p class="visually-hidden" id="wt-desc"></p>
                        <button class="go hd tap wt-spin" id="wt-spin" type="button"><svg viewBox="0 0 22 22" aria-hidden="true" focusable="false"><path d="M18 11 A7 7 0 1 1 15.5 5.6" fill="none" stroke="#fffcf4" stroke-width="2.2" stroke-linecap="round"/><path d="M16.5 2 L16 6.3 L11.8 5.6" fill="none" stroke="#efc84a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg><span id="wt-spin-label">Spin</span></button>
                        <div class="wt-quick">
                            <button class="mini hd tap" id="wt-remove" type="button" disabled>Remove winner</button>
                            <button class="mini hd tap" id="wt-shuffle" type="button">Shuffle</button>
                        </div>
                        <p class="wt-status" id="wt-status" aria-hidden="true"></p>
                    </div>

                    <div class="wt-listcol">
                        <div class="label"><label for="wt-names">Names, one per line</label><span class="wt-count" id="wt-count">8 names</span></div>
                        <div class="ctl wt-ta hd"><textarea id="wt-names" spellcheck="false" autocomplete="off" aria-describedby="wt-hint"></textarea></div>
                        <p class="wt-hint" id="wt-hint"></p>

                        <div class="wt-group">
                            <div class="label"><label for="wt-fill-from">Fill from a generator</label><span class="pen">adds 8 names</span></div>
                            <div class="wt-fillrow">
                                <div class="ctl sel hd"><select id="wt-fill-from">
                                    ${fill.map(([key, label]) => `<option value="${key}">${escapeHtml(label)}</option>`).join('\n                                    ')}
                                </select></div>
                                <button class="mini hd tap" id="wt-fill" type="button">Add 8</button>
                            </div>
                        </div>

                        <div class="wt-group">
                            <div class="wt-actions" id="wt-actions">
                                <button class="mini hd tap" id="wt-share" type="button">Copy share link</button>
                                <button class="mini hd tap" id="wt-clear" type="button">Clear list</button>
                            </div>
                            <div class="wt-confirm hd" id="wt-confirm" hidden>
                                <p id="wt-confirm-text">Clear all 8 names?</p>
                                <button class="mini hd tap wt-yes" id="wt-confirm-yes" type="button">Yes, clear</button>
                                <button class="mini hd tap" id="wt-confirm-no" type="button">Keep them</button>
                            </div>
                            <div class="wt-sharebox" id="wt-sharebox" hidden>
                                <div class="ctl hd"><input id="wt-share-url" readonly aria-label="Share link"></div>
                                <p class="wt-hint" id="wt-share-note">Anyone with the link sees this exact list. Nothing is saved on our server.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <p class="visually-hidden" aria-live="polite" id="wt-live"></p>

            <article class="section article">
                <h2>How to use the wheel</h2>
                <p class="big">Put one name on each line, press Spin, and the wheel picks one at random.</p>
                <ol>
                    <li><strong>Add names.</strong> Type them, paste a list from a spreadsheet, or add 8 from one of our name generators.</li>
                    <li><strong>Spin.</strong> Press Spin, tap the wheel, or press Space or Enter when the wheel is selected.</li>
                    <li><strong>Keep going.</strong> "Remove &amp; spin again" takes the winner off so they can't come up again: handy for turn order, or a raffle with several prizes.</li>
                    <li><strong>Share it.</strong> Copy the link and anyone who opens it gets the same list.</li>
                </ol>

                <h2 class="section">Is it fair?</h2>
                <p>Every name gets a slice the same size, and duplicates are removed so nobody gets two. The winner is picked by your browser's built-in secure random number generator the moment you press Spin; the spin is just there to show you where it landed, and the wheel always stops on the name that was picked.</p>

                <h2 class="section">Ideas</h2>
                <p>Pick who goes first at the table, choose a pupil to answer, draw a raffle, decide whose turn it is to make the tea, or put your shortlist of band names on the wheel and let it decide.</p>
            </article>

            <section class="section">
                <h2>Questions</h2>
                <div class="faq">
                    ${WHEEL_FAQS.map(([q, a], i) => `<details${i === 0 ? ' open' : ''}><summary><span class="tg hd" aria-hidden="true">+</span>${escapeHtml(q)}</summary><p>${escapeHtml(a)}</p></details>`).join('\n                    ')}
                </div>
            </section>

            <section class="section">
                <h2>More name tools</h2>
                <div class="tools">
                    ${tools.map((g, i) => `<a class="tool hd tap" href="posts/${g.slug}.html">${layout.doodle(motifs[i])}<div><b>${escapeHtml(g.title)}</b><span>${escapeHtml(g.description.split(/(?<=[.!?])\s/)[0])}</span></div><em aria-hidden="true">→</em></a>`).join('\n                    ')}
                </div>
            </section>
        </main>
        <aside class="side" aria-label="Sidebar"></aside>
    </div>

    ${layout.siteFooter('')}
    ${layout.bodyScripts('', { engine: true })}
    <script src="lib/wheel.js"></script>
</body>
</html>`;
}

/**
 * Lookups shared by the page templates.
 */
function makeSite({ categories, generators, homepage }) {
  const all = Object.values(generators);
  const categoriesOf = {};
  for (const cat of categories) {
    for (const key of cat.generators) (categoriesOf[key] = categoriesOf[key] || []).push(cat.slug);
  }

  // Related generators: shared title words count most, then sharing a
  // category, then popularity. Top 6.
  const STOP = new Set(['name', 'generator', 'the', 'a', 'an', 'and', 'or', 'of', 'for', 'with', 'to', 'in', 'on', 'at', 'by']);
  const words = (title) => title.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/)
    .filter(w => w.length > 2 && !STOP.has(w));
  function score(current, candidate) {
    const a = words(current.title);
    const b = words(candidate.title);
    const exact = a.filter(w => b.includes(w));
    let total = exact.length * 200;
    const used = new Set(exact);
    for (const wa of a) {
      if (used.has(wa)) continue;
      for (const wb of b) {
        if (used.has(wb)) continue;
        if ((wa.length > wb.length && wa.includes(wb)) || (wb.length > wa.length && wb.includes(wa))) {
          total += 100;
          used.add(wa.length > wb.length ? wb : wa);
        }
      }
    }
    if ((categoriesOf[candidate.key] || []).includes(current.category)) total += 50;
    if (candidate.isPopular) total += 20;
    return total;
  }

  return {
    categories,
    all,
    categoriesOf,
    inCategory: (slug) => categories.find(c => c.slug === slug).generators.map(k => generators[k]),
    related: (current) => all
      .filter(g => g.key !== current.key)
      .map(g => ({ g, s: score(current, g) }))
      .sort((x, y) => y.s - x.s || (y.g.isPopular ? 1 : 0) - (x.g.isPopular ? 1 : 0))
      .slice(0, 6)
      .map(x => x.g),
    // content/homepage.json lists the homepage's first picks; the rest of the
    // generators marked isPopular follow, by popularRank
    popular: () => {
      const picks = homepage.popular.map(k => generators[k]);
      return picks.concat(all.filter(g => g.isPopular && !homepage.popular.includes(g.key))
        .sort((a, b) => (a.popularRank || 999) - (b.popularRank || 999)));
    },
    navHtml: (prefix) => navDropdownHtml(categories, prefix),
  };
}

/**
 * Replace the text between <!-- BUILD:name --> and <!-- /BUILD:name --> in a
 * hand-written page.
 */
function fillMarkers(file, sections) {
  const filePath = path.join(ROOT, file);
  let html = fs.readFileSync(filePath, 'utf8');
  for (const [name, content] of Object.entries(sections)) {
    const re = new RegExp(`(<!-- BUILD:${name} -->)[\\s\\S]*?(<!-- /BUILD:${name} -->)`);
    if (!re.test(html)) throw new Error(`${file} is missing <!-- BUILD:${name} --> ... <!-- /BUILD:${name} -->`);
    html = html.replace(re, (_, open, close) => `${open}\n${content}\n${close}`);
  }
  fs.writeFileSync(filePath, layout.stampAssets(html));
  console.log(`  ✅ Updated: ${file}`);
}

function updateStaticPages(site) {
  const catOf = (gen) => site.categories.find(c => c.slug === gen.category);
  const header = layout.siteHeader('', site.categories);
  const footer = layout.siteFooter('');

  const homeCats = site.categories.filter(cat => cat.generators.length);
  const categoryCards = homeCats.map(cat => `            <a href="categories/${cat.slug}-names.html" class="cat hd tap">${layout.doodle(layout.categoryMotif(cat))}<div><b>${escapeHtml(cat.name)}</b><span>${cat.generators.length} generator${cat.generators.length !== 1 ? 's' : ''}</span></div><em aria-hidden="true">→</em></a>`).join('\n');

  const popular = site.popular().slice(0, 20);
  const popularCards = popular.map(gen => `            <a href="posts/${gen.slug}.html" class="feat hd tap">${layout.doodle(layout.generatorMotif(gen, catOf(gen)))}<b>${escapeHtml(gen.title)}</b><span>${escapeHtml(gen.description)}</span><span class="open hd" aria-hidden="true">Open →</span></a>`).join('\n');

  // The homepage generator: one button per category, then a dropdown of its generators
  const categoryOptions = homeCats.map((cat, i) =>
    `                                <button type="button" class="opt hd tap" data-category="${cat.slug}" aria-pressed="${i === 0}">${escapeHtml(cat.name)}</button>`
  ).join('\n');

  // What the homepage generator needs to fill its "Generator" dropdown
  const homeIndex = Object.fromEntries(site.categories.map(cat => [cat.slug,
    cat.generators.map(k => { const g = site.all.find(x => x.key === k); return { key: k, title: g.title, slug: g.slug }; })]));

  const homeMotifs = [...homeCats.map(c => layout.categoryMotif(c)), ...popular.map(g => layout.generatorMotif(g, catOf(g))), 'quill'];

  fillMarkers('index.html', {
    sprite: layout.svgSprite(homeMotifs),
    header,
    'category-options': categoryOptions,
    'generator-index': `    <script type="application/json" id="generator-index">${scriptJson(homeIndex)}</script>`,
    categories: categoryCards,
    popular: popularCards,
    footer,
  });

  // All generators, A to Z; the search box filters these links in place
  const sorted = [...site.all].sort((a, b) =>
    a.title.replace(/[^\w\s]/g, '').trim().toLowerCase().localeCompare(b.title.replace(/[^\w\s]/g, '').trim().toLowerCase()));
  const allMotifs = sorted.map(g => layout.generatorMotif(g, catOf(g)));
  const allList = `                <div class="genlist compact" id="generators-list">
${sorted.map((gen, i) => {
    const search = [gen.title, gen.description, gen.seoKeywords || '',
      ...(site.categoriesOf[gen.key] || []).map(slug => site.categories.find(c => c.slug === slug).name)].join(' ').toLowerCase();
    return `                    <a href="posts/${gen.slug}.html" class="gencard hd tap" data-search="${escapeHtml(search)}">${layout.doodle(allMotifs[i])}<div><b>${escapeHtml(gen.title)}</b></div><em aria-hidden="true">→</em></a>`;
  }).join('\n')}
                </div>`;
  fillMarkers('all-generators.html', { sprite: layout.svgSprite(allMotifs), header, generators: allList, footer });
  fillMarkers('about.html', { sprite: layout.svgSprite(['quill', 'note']), header, footer });
}

/**
 * Main build function
 */
function build() {
  console.log('🚀 Building pages from content/...\n');

  const content = loadContent();
  const { errors, warnings } = validate(content);
  warnings.forEach(w => console.log(`  ⚠️  ${w}`));
  if (errors.length) {
    errors.forEach(e => console.log(`  ❌ ${e}`));
    console.log(`\nBuild stopped: fix the ${errors.length} error(s) above first.`);
    process.exit(1);
  }

  // Last updated = last change to the generator's file (never before it was published)
  for (const [key, gen] of Object.entries(content.generators)) {
    gen.updated = latest([gen.published, lastChanged(`content/generators/${gen.key}.json`)]);
    content.generators[key] = withCounts(gen); // {{names}} etc. -> real numbers
  }

  const site = makeSite(content);
  for (const dir of [POSTS_DIR, CATEGORIES_DIR, RUNTIME_DIR]) fs.mkdirSync(dir, { recursive: true });

  for (const category of content.categories) {
    fs.writeFileSync(path.join(CATEGORIES_DIR, `${category.slug}-names.html`), generateCategoryPage(category, site));
    console.log(`  ✅ Created: categories/${category.slug}-names.html`);
  }

  for (const generator of site.all) {
    const category = content.categories.find(c => c.slug === generator.category);
    fs.writeFileSync(path.join(POSTS_DIR, `${generator.slug}.html`), generateGeneratorPage(generator, category, site));
    fs.writeFileSync(path.join(RUNTIME_DIR, `${generator.key}.json`), JSON.stringify(runtimeConfig(generator)));
    console.log(`  ✅ Created: posts/${generator.slug}.html`);
  }

  // Pages that moved within the site. GitHub Pages can't send real redirects,
  // so the old address keeps a small page that forwards at once; search
  // engines treat an instant refresh plus a canonical link as a move.
  for (const [oldSlug, newSlug] of Object.entries(MOVED_PAGES)) {
    fs.writeFileSync(path.join(POSTS_DIR, `${oldSlug}.html`), movedPage(newSlug));
    console.log(`  ↪️  Forwarding: posts/${oldSlug}.html -> posts/${newSlug}.html`);
  }

  // Drop runtime files for generators that no longer exist
  for (const file of fs.readdirSync(RUNTIME_DIR)) {
    if (!content.generators[path.basename(file, '.json')]) fs.unlinkSync(path.join(RUNTIME_DIR, file));
  }

  fs.writeFileSync(path.join(ROOT, 'spin-the-wheel.html'), generateWheelPage(site));
  console.log('  ✅ Created: spin-the-wheel.html');

  generateSitemap(site);
  generateHtmlSitemap(site);
  generate404(site);
  generateLlmsTxt(site);
  updateStaticPages(site);

  console.log(`\n✨ Build complete! Generated ${site.all.length} generator pages and ${content.categories.length} category pages.`);
  return site;
}

/**
 * Generate sitemap.xml for SEO
 */
function generateSitemap(site) {
  const baseUrl = "https://thenamegenerators.com";
  // lastmod: a generator's last update; a category's newest generator (or
  // categories.json); the site-wide pages the newest change of all.
  const categoriesFile = lastChanged('content/categories.json');
  const categoryDate = (cat) => latest([categoriesFile, ...site.inCategory(cat.slug).map(g => g.updated)]);
  const siteDate = latest([categoriesFile, ...site.all.map(g => g.updated)]);
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${siteDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- All Generators Page -->
  <url>
    <loc>${baseUrl}/all-generators.html</loc>
    <lastmod>${siteDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <!-- Spin the Wheel -->
  <url>
    <loc>${baseUrl}/spin-the-wheel.html</loc>
    <lastmod>${latest([lastChanged('lib/wheel.js')])}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- About Page -->
  <url>
    <loc>${baseUrl}/about.html</loc>
    <lastmod>${latest([lastChanged('about.html')])}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <!-- HTML Sitemap -->
  <url>
    <loc>${baseUrl}/sitemap.html</loc>
    <lastmod>${siteDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;

  // Add category pages
  for (const category of site.categories) {
    sitemap += `  <!-- Category: ${category.name} -->
  <url>
    <loc>${baseUrl}/categories/${category.slug}-names.html</loc>
    <lastmod>${categoryDate(category)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  }

  // Add generator pages
  for (const generator of site.all) {
    sitemap += `  <!-- Generator: ${generator.title} -->
  <url>
    <loc>${baseUrl}/posts/${generator.slug}.html</loc>
    <lastmod>${generator.updated}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
  }

  sitemap += `</urlset>`;

  const sitemapPath = path.join(ROOT, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemap);
  console.log(`  ✅ Created: sitemap.xml`);
}

/**
 * Generate HTML sitemap page for better SEO and crawling
 */
function generateHtmlSitemap(site) {
  const baseUrl = "https://thenamegenerators.com";
  const link = (href, text) => `<li><a href="${href}">${escapeHtml(text)}</a></li>`;
  const groups = site.categories.filter(c => c.generators.length).map(category => `
            <div class="sitemap-group">
                <h3>${escapeHtml(category.name)}</h3>
                <ul class="sitemap-links">
                    ${site.inCategory(category.slug).map(g => link(`${baseUrl}/posts/${g.slug}.html`, g.title)).join('\n                    ')}
                </ul>
            </div>`).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Mediavine Grow -->
    <script data-grow-initializer="">!(function(){window.growMe||((window.growMe=function(e){window.growMe._.push(e);}),(window.growMe._=[]));var e=document.createElement("script");(e.type="text/javascript"),(e.src="https://faves.grow.me/main.js"),(e.defer=!0),e.setAttribute("data-grow-faves-site-id","U2l0ZTo2YmQ3YzdiOS00MDgwLTQ5MmYtOGEyZi0yZWE3YmU2N2E5ZTU=");var t=document.getElementsByTagName("script")[0];t.parentNode.insertBefore(e,t);})();</script>
    
    <title>Site Map - All Pages | The Name Generators</title>
    <meta name="description" content="Complete site map listing all name generator pages, categories, and resources.">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${baseUrl}/sitemap.html">
    ${ICON_LINKS}
    ${layout.headAssets('')}
</head>
<body>
    ${layout.svgSprite([])}
    ${layout.siteHeader('', site.categories)}

    <div class="wrap">
        <main id="main" class="sitemap">
            <div class="titlerow"><h1>Site <span class="hl">Map</span></h1></div>
            <p class="lede">Every page on The Name Generators.</p>

            <section class="section">
                <h2>Main pages</h2>
                <ul class="sitemap-links">
                    ${link(`${baseUrl}/`, 'Home')}
                    ${link(`${baseUrl}/all-generators.html`, 'All Generators')}
                    ${link(`${baseUrl}/spin-the-wheel.html`, 'Spin the Wheel')}
                    ${link(`${baseUrl}/about.html`, 'About')}
                    ${link(`${baseUrl}/sitemap.html`, 'Site Map')}
                </ul>
            </section>

            <section class="section">
                <h2>Category pages</h2>
                <ul class="sitemap-links">
                    ${site.categories.map(c => link(`${baseUrl}/categories/${c.slug}-names.html`, c.name)).join('\n                    ')}
                </ul>
            </section>

            <section class="section">
                <h2>Name generators</h2>
${groups}
            </section>
        </main>
    </div>

    ${layout.siteFooter('')}
    ${layout.bodyScripts('')}
</body>
</html>`;

  const sitemapHtmlPath = path.join(ROOT, 'sitemap.html');
  fs.writeFileSync(sitemapHtmlPath, html);
  console.log(`  ✅ Created: sitemap.html`);
}

/**
 * 404 page. GitHub Pages serves this (with a real 404 status) for any
 * unknown address, so every link is absolute. Old addresses from the
 * previous site still forward to their new pages.
 */
function generate404(site) {
  const OLD_URLS = {
    '/orc-name-generator-skyrim/': '/posts/skyrim-orc-name-generator.html',
    '/orc-name-generator-warhammer/': '/posts/warhammer-orc-name-generator.html',
    '/orc-name-generator-world-of-warcraft/': '/posts/wow-orc-name-generator.html',
    '/orc-name-generator-lord-of-the-rings/': '/posts/lotr-orc-name-generator.html',
    '/half-orc-name-generator/': '/posts/half-orc-name-generator.html',
    '/dungeon-synth-name-generator/': '/posts/dungeon-synth-name-generator.html',
    '/swamp-witch-name-generator/': '/posts/swamp-witch-name-generator.html',
    '/dnd-fantasy-name-generator/': '/posts/dnd-fantasy-name-generator.html',
    '/witch-name-generator-path-of-exhile/': '/posts/path-of-exile-witch-name-generator.html',
    '/witch-name-generator-harry-potter/': '/posts/harry-potter-witch-name-generator.html',
    '/witch-name-generator-hogwarts-legacy/': '/posts/hogwarts-legacy-witch-name-generator.html',
    '/wizard-name-generator-hogwarts-legacy/': '/posts/hogwarts-legacy-wizard-name-generator.html',
    '/funny-wizard-name-generator/': '/posts/funny-wizard-name-generator.html',
    '/wizard-name-generator-lord-of-the-rings/': '/posts/lotr-wizard-name-generator.html'
  };

  const cats = site.categories.filter(c => c.generators.length);
  const categoryCards = cats.map(cat => `<a href="/categories/${cat.slug}-names.html" class="cat hd tap">${layout.doodle(layout.categoryMotif(cat))}<div><b>${escapeHtml(cat.name)}</b><span>${cat.generators.length} generator${cat.generators.length !== 1 ? 's' : ''}</span></div><em aria-hidden="true">→</em></a>`).join('\n                    ');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Not Found | ${SITE_NAME}</title>
    <meta name="robots" content="noindex">
    <script>
        // Addresses from the old site: send visitors to the new page
        const oldUrls = ${scriptJson(OLD_URLS)};
        if (oldUrls[window.location.pathname]) window.location.replace(oldUrls[window.location.pathname]);
    </script>
    ${ICON_LINKS}
    ${layout.headAssets('/')}
</head>
<body>
    ${layout.svgSprite(['lost-map', ...cats.map(c => layout.categoryMotif(c))])}
    ${layout.siteHeader('/', site.categories)}

    <div class="wrap">
        <main id="main">
            <div class="titlerow">
                <h1>Page <span class="hl">not found</span></h1>
                ${layout.doodle('lost-map')}
            </div>
            <p class="lede">That page doesn't exist, or it has moved. Try a category below, or <a href="/all-generators.html">browse all ${site.all.length} generators</a>.</p>

            <section class="section">
                <h2>Categories</h2>
                <div class="catgrid">
                    ${categoryCards}
                </div>
            </section>
        </main>
    </div>

    ${layout.siteFooter('/')}
    ${layout.bodyScripts('/')}
</body>
</html>
`;
  fs.writeFileSync(path.join(ROOT, '404.html'), html);
  console.log('  ✅ Created: 404.html');
}

/**
 * llms.txt: a plain-text map of the site for AI tools (see llmstxt.org).
 */
function generateLlmsTxt(site) {
  const baseUrl = 'https://thenamegenerators.com';
  let text = `# ${SITE_NAME}

> Free online name generators for fantasy characters, places, organisations, objects and more: for D&D and other tabletop games, writing, gaming, worldbuilding, music projects and businesses. Each generator page has the generator, example names and an article on the naming conventions behind them.

Names are free to use, no credit needed. If you're naming a business, brand, band or product, check the name isn't already taken or trademarked first.

Made by Rich: ${baseUrl}/about.html
`;
  for (const cat of site.categories.filter(c => c.generators.length)) {
    text += `\n## ${cat.name}\n\n`;
    text += site.inCategory(cat.slug)
      .map(g => `- [${g.title}](${baseUrl}/posts/${g.slug}.html): ${plainText(g.description)}`)
      .join('\n') + '\n';
  }
  text += `\n## Name tools\n\n- [Spin the Wheel](${baseUrl}/spin-the-wheel.html): a random name picker wheel. Type or paste names, spin, remove the winner and spin again; lists stay in the browser and can be shared as a link.\n`;
  text += `\n## Optional\n\n- [All generators](${baseUrl}/all-generators.html)\n- [Site map](${baseUrl}/sitemap.html)\n`;
  fs.writeFileSync(path.join(ROOT, 'llms.txt'), text);
  console.log('  ✅ Created: llms.txt');
}

// Run if called directly
if (require.main === module) {
  build();
}

module.exports = { build };

