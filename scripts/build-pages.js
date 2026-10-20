#!/usr/bin/env node

/**
 * Build Pages Script
 * Generates every page from content/ (see scripts/content.js):
 *   posts/<slug>.html                 one page per generator
 *   categories/<slug>-names.html      one page per category
 *   data/generators/<key>.json        what the homepage generator loads
 *   sitemap.xml, sitemap.html
 * and refreshes the marked sections of index.html, all-generators.html and
 * about.html (between <!-- BUILD:name --> and <!-- /BUILD:name -->).
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { loadContent, validate } = require('./content');
const { filtersHtml } = require('../lib/page.js');

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

// Article text may use **bold**; turn it into HTML (or drop it for plain text).
function markdownBold(html) {
  return String(html || '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}
function plainText(text) {
  return String(text || '').replace(/\*\*/g, '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// JSON for a <script> block: "<" escaped so data can't close the tag.
function scriptJson(value, indent) {
  return JSON.stringify(value, null, indent).replace(/</g, '\\u003c');
}

/** The fields the in-browser engine needs, without the article text. */
function runtimeConfig(gen) {
  const { title, icon, description, seoKeywords, isPopular, popularRank, category, published, updated, article, key, ...config } = gen;
  return config;
}

/** Category links for the nav dropdown. `prefix` is "../" from subfolders. */
function navDropdownHtml(categories, prefix) {
  return categories.map(cat =>
    `<a href="${prefix}categories/${cat.slug}-names.html">${cat.icon} ${escapeHtml(cat.navLabel)}</a>`
  ).join('\n                        ');
}

/**
 * Generate SEO-optimized title
 * Format: "[Primary Keyword] Generator - Free Online Tool | Brand"
 * Target: 50-60 characters for optimal search result display
 * Uses keywords people actually search for (e.g., "dwarf name generator", "elf name generator")
 */
function generateSEOTitle(generator, category) {
  // Extract the main keyword from title (e.g., "Dwarf Name Generator" -> "Dwarf Name")
  // People search for "[thing] name generator" so we want to preserve that pattern
  let titleWords = generator.title.split(' ');
  
  // Remove "Generator" if it's the last word
  if (titleWords[titleWords.length - 1].toLowerCase() === 'generator') {
    titleWords = titleWords.slice(0, -1);
  }
  
  // Get primary keyword - usually first 2 words (e.g., "Dwarf Name", "Elf Name")
  let primaryKeyword = titleWords.slice(0, Math.min(2, titleWords.length)).join(' ');
  
  // Create SEO-friendly title with keywords people search for
  // Format: "[Primary Keyword] Generator - Free Online Tool | Brand"
  const seoTitle = `${primaryKeyword} Generator - Free Online Tool | The Name Generators`;
  
  // Check length (optimal is 50-60 chars for search results)
  if (seoTitle.length > 60) {
    // Try without "Free Online Tool" (saves 20 chars)
    const shorter = `${primaryKeyword} Generator | The Name Generators`;
    if (shorter.length <= 60) {
      return shorter;
    }
    // If still too long, use just the full title
    return generator.title;
  }
  
  return seoTitle;
}

/**
 * Generate schema.org JSON-LD for a generator page
 */
function generateSchemas(generator, category) {
  const schemas = [];
  const baseUrl = "https://thenamegenerators.com";
  const pageUrl = `${baseUrl}/posts/${generator.slug}.html`;

  // Build article body text for LLM parsing
  let articleBody = generator.description;
  if (generator.article && generator.article.intro) {
    articleBody += ' ' + plainText(generator.article.intro);
  }
  if (generator.article && generator.article.sections) {
    generator.article.sections.forEach(section => {
      articleBody += ' ' + section.heading + ' ' + plainText(section.content);
    });
  }

  // Article Schema (enhanced for LLM/AI parsing)
  schemas.push({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": generator.title,
    "description": generator.description,
    "articleBody": articleBody.substring(0, 5000), // Full text for LLMs (limit to 5000 chars)
    "abstract": generator.description,
    "url": pageUrl,
    "author": {
      "@type": "Organization",
      "name": "The Name Generators",
      "url": baseUrl
    },
    "publisher": {
      "@type": "Organization",
      "name": "The Name Generators",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`
      }
    },
    "datePublished": generator.published,
    "dateModified": generator.updated,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": pageUrl
    },
    "articleSection": category.name,
    "keywords": generator.seoKeywords,
    "about": {
      "@type": "Thing",
      "name": generator.title.replace(' Generator', ''),
      "description": generator.description
    },
    "mentions": generator.seoKeywords.split(', ').map(kw => ({
      "@type": "Thing",
      "name": kw.trim()
    }))
  });

  // Breadcrumb Schema
  schemas.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://thenamegenerators.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": category.name,
        "item": `https://thenamegenerators.com/categories/${category.slug}-names.html`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": generator.title,
        "item": `https://thenamegenerators.com/posts/${generator.slug}.html`
      }
    ]
  });

  // WebApplication Schema (enhanced)
  schemas.push({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": generator.title,
    "description": generator.description,
    "url": pageUrl,
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "Any",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "softwareVersion": "1.0",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Generate random names",
      "Filter by category",
      "Multiple name variations",
      "Free to use"
    ]
  });

  // FAQ Schema
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

  // HowTo Schema for the generator tool (AI-friendly)
  schemas.push({
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to use ${generator.title}`,
    "description": `Step-by-step guide to using the ${generator.title}`,
    "step": [
      {
        "@type": "HowToStep",
        "name": "Select options",
        "text": generator.filters && Object.keys(generator.filters).length
          ? `Choose your preferred options from the available filters (${Object.keys(generator.filters).join(', ')})`
          : "Use the default settings or customize as needed"
      },
      {
        "@type": "HowToStep",
        "name": "Generate names",
        "text": "Click the 'Generate Names' button to create your list of names"
      },
      {
        "@type": "HowToStep",
        "name": "Review results",
        "text": "Review the generated names and generate more if needed"
      }
    ],
    "tool": {
      "@type": "SoftwareApplication",
      "name": generator.title,
      "applicationCategory": "UtilityApplication",
      "operatingSystem": "Any"
    }
  });

  // Dataset Schema for AI training/understanding
  schemas.push({
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": `${generator.title} - Name Database`,
    "description": `A collection of ${generator.title.toLowerCase()} names and variations`,
    "keywords": generator.seoKeywords,
    "license": "https://creativecommons.org/licenses/by/4.0/",
    "creator": {
      "@type": "Organization",
      "name": "The Name Generators",
      "url": baseUrl
    },
    "distribution": {
      "@type": "DataDownload",
      "contentUrl": pageUrl,
      "encodingFormat": "text/html"
    }
  });

  return schemas;
}

/**
 * Generate HTML for a single generator page
 */
function generateGeneratorPage(generator, category, site) {
  const schemas = generateSchemas(generator, category);
  // Escape "<" as \u003c so a stray "</script>" in any data string cannot
  // break out of the JSON-LD block. Valid JSON, understood by all parsers.
  const schemaScripts = schemas.map(s =>
    `<script type="application/ld+json">\n${JSON.stringify(s, null, 2).replace(/</g, '\\u003c')}\n</script>`
  ).join('\n    ');

  // Filters (dropdowns and text boxes) come straight from the generator file
  const filterHTML = Object.keys(generator.filters || {}).length
    ? `<div class="filters">${filtersHtml(generator.filters, 'filter-group')}</div>`
    : '';

  const relatedHTML = `
      <section class="related-section">
        <h2>Related Name Generators</h2>
        <div class="related-grid" id="related-generators">
          ${site.related(generator).map(gen =>
            `<a href="../posts/${gen.slug}.html" class="related-card">
            <h3>${gen.icon} ${escapeHtml(gen.title)}</h3>
            <p>${escapeHtml(gen.description)}</p>
          </a>`).join('\n          ') || '<p>No related generators found.</p>'}
        </div>
      </section>`;

  const sameCategory = site.inCategory(category.slug).filter(gen => gen.key !== generator.key);
  const categoryGeneratorsHTML = `
      <section class="category-generators-section">
        <h2>All ${escapeHtml(category.name)} Name Generators</h2>
        <div class="category-generators-grid" id="category-generators">
          ${sameCategory.map(gen =>
            `<a href="../posts/${gen.slug}.html" class="category-generator-item">
            <span class="category-generator-icon">${gen.icon}</span>
            <span class="category-generator-title">${escapeHtml(gen.title)}</span>
          </a>`).join('\n          ') || '<p>No other generators in this category.</p>'}
        </div>
      </section>`;

  // Build article sections HTML
  let sectionsHTML = '';
  if (generator.article && generator.article.sections) {
    sectionsHTML = generator.article.sections.map(section => `
      <section>
        <h2>${section.heading}</h2>
        ${markdownBold(section.content)}
      </section>
    `).join('\n');
  }

  // Build FAQs HTML
  let faqsHTML = '';
  if (generator.article && generator.article.faqs) {
    faqsHTML = `
      <section class="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div class="faq-list">
          ${generator.article.faqs.map(faq => `
            <div class="faq-item">
              <h3 class="faq-question">${faq.question}</h3>
              <p class="faq-answer">${markdownBold(faq.answer)}</p>
            </div>
          `).join('\n          ')}
        </div>
      </section>`;
  }

  // Generate SEO-optimized title
  const seoTitle = generateSEOTitle(generator, category);
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
  const escHeroTitle = escapeHtml(generator.article.hero.title);
  const escHeroTagline = escapeHtml(generator.article.hero.tagline);

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
    
    <link rel="stylesheet" href="../styles/main.css">
    <link rel="stylesheet" href="../styles/blog.css">
</head>
<body>
    <nav class="main-nav">
        <div class="nav-container">
            <a href="../index.html" class="nav-logo">🧑🏻‍💻 The Name Generators</a>
            <button class="menu-toggle" id="menu-toggle" aria-label="Toggle menu">
                <span></span>
                <span></span>
                <span></span>
            </button>
            <div class="nav-links" id="nav-links">
                <a href="../index.html">Home</a>
                <a href="../all-generators.html">All Generators</a>
                <div class="nav-dropdown">
                    <a href="#" class="nav-dropdown-toggle">Categories</a>
                    <div class="nav-dropdown-menu" id="category-dropdown">
                        ${site.navHtml('../')}
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <div class="container">
        <header class="blog-hero">
            <h1>${escHeroTitle}</h1>
            <p class="tagline">${escHeroTagline}</p>
        </header>

        <main>
            <section class="embedded-generator">
                <div class="generator-card">
                    <h2>Generate Your ${escGenTitle}</h2>
                    <p class="generator-description">${escGenDesc}</p>
                    
                    <div class="simple-generator">
                        ${filterHTML}
                        <div class="generator-controls">
                            <button id="generate-btn" class="generate-button">Generate Names</button>
                        </div>
                        <div class="results-area" id="results">
                            <p class="results-placeholder">Click "Generate Names" to see results</p>
                        </div>
                    </div>
                    
                    <div class="cta-box">
                        <p><strong>Need more options?</strong></p>
                        <a href="../index.html" class="cta-button">Try the Ultimate Random Name Generator →</a>
                    </div>
                </div>
            </section>

            <article class="blog-content" itemscope itemtype="https://schema.org/Article">
                <meta itemprop="headline" content="${escGenTitle}">
                <meta itemprop="description" content="${escGenDesc}">
                <section itemprop="articleBody">
                    <p>${markdownBold(generator.article.intro)}</p>
                </section>
                ${sectionsHTML}
            </article>

            ${faqsHTML}
            ${relatedHTML}
            ${categoryGeneratorsHTML}
        </main>

        <footer class="site-footer">
            <p>&copy; ${new Date().getFullYear()} The Name Generators. All rights reserved. | <a href="../sitemap.html" style="color: #4a90e2;">Site Map</a> | <a href="../about.html" style="color: #4a90e2;">About</a></p>
        </footer>
    </div>

    <script type="application/json" id="generator-config">${scriptJson(runtimeConfig(generator))}</script>
    <script src="../lib/recipe-engine.js"></script>
    <script src="../lib/page.js"></script>
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

  const generatorsHTML = generators.map(gen => `
    <a href="../posts/${gen.slug}.html" class="generator-card">
      <h3>${gen.icon} ${escapeHtml(gen.title)}</h3>
      <p>${escapeHtml(gen.description)}</p>
    </a>
  `).join('\n    ');

  // Generate SEO-optimized category title
  const baseUrl = "https://thenamegenerators.com";
  const categorySEOTitle = `${category.name} Name Generators - Free Online Tools | The Name Generators`;
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
    
    <link rel="stylesheet" href="../styles/main.css">
    <link rel="stylesheet" href="../styles/blog.css">
</head>
<body>
    <nav class="main-nav">
        <div class="nav-container">
            <a href="../index.html" class="nav-logo">🧑🏻‍💻 The Name Generators</a>
            <button class="menu-toggle" id="menu-toggle" aria-label="Toggle menu">
                <span></span>
                <span></span>
                <span></span>
            </button>
            <div class="nav-links" id="nav-links">
                <a href="../index.html">Home</a>
                <a href="../all-generators.html">All Generators</a>
                <div class="nav-dropdown">
                    <a href="#" class="nav-dropdown-toggle">Categories</a>
                    <div class="nav-dropdown-menu" id="category-dropdown">
                        ${site.navHtml('../')}
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <div class="container">
        <header class="hero">
            <h1>${category.icon} ${escCatName}</h1>
            <p>${escCatDescription}</p>
            <p class="generator-count">${generators.length} generator${generators.length !== 1 ? 's' : ''} available</p>
        </header>

        <main>
            <div class="generators-grid">
                ${generatorsHTML}
            </div>
        </main>

        <footer class="site-footer">
            <p>&copy; ${new Date().getFullYear()} The Name Generators. All rights reserved. | <a href="../sitemap.html" style="color: #4a90e2;">Site Map</a> | <a href="../about.html" style="color: #4a90e2;">About</a></p>
        </footer>
    </div>

    <script src="../lib/page.js"></script>
</body>
</html>`;

  return html;
}

/**
 * Lookups shared by the page templates.
 */
function makeSite({ categories, generators }) {
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
    popular: () => all.filter(g => g.isPopular)
      .sort((a, b) => (a.popularRank || 999) - (b.popularRank || 999)),
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
  fs.writeFileSync(filePath, html);
  console.log(`  ✅ Updated: ${file}`);
}

function updateStaticPages(site) {
  const nav = site.navHtml('');

  const categoryCards = site.categories.map(cat => `            <a href="categories/${cat.slug}-names.html" class="category-card">
                <span class="category-icon">${cat.icon}</span>
                <h3>${escapeHtml(cat.name)}</h3>
                <p>${escapeHtml(cat.description)}</p>
                <div class="pillar-count">${cat.generators.length} Generator${cat.generators.length !== 1 ? 's' : ''}</div>
            </a>`).join('\n');

  const popularCards = site.popular().slice(0, 20).map(gen => {
    const cat = site.categories.find(c => c.slug === gen.category);
    return `            <a href="posts/${gen.slug}.html" class="popular-generator-card">
                <span class="generator-icon">${gen.icon}</span>
                <div class="generator-info">
                    <h3>${escapeHtml(gen.title)}</h3>
                    <p>${escapeHtml(gen.description)}</p>
                    <span class="category-badge">${cat.icon} ${escapeHtml(cat.name)}</span>
                </div>
            </a>`;
  }).join('\n');

  const categoryOptions = site.categories
    .filter(cat => cat.generators.length)
    .map(cat => `                                <option value="${cat.slug}">${cat.icon} ${escapeHtml(cat.name)}</option>`)
    .join('\n');

  // What the homepage generator needs to fill its "Generator" dropdown
  const homeIndex = Object.fromEntries(site.categories.map(cat => [cat.slug,
    cat.generators.map(k => { const g = site.all.find(x => x.key === k); return { key: k, title: g.title, icon: g.icon }; })]));

  fillMarkers('index.html', {
    nav,
    'category-options': categoryOptions,
    'generator-index': `    <script type="application/json" id="generator-index">${scriptJson(homeIndex)}</script>`,
    categories: categoryCards,
    popular: popularCards,
  });

  // All generators, A to Z; the search box filters these links in place
  const sorted = [...site.all].sort((a, b) =>
    a.title.replace(/[^\w\s]/g, '').trim().toLowerCase().localeCompare(b.title.replace(/[^\w\s]/g, '').trim().toLowerCase()));
  const allList = `                <div class="category-generators-grid">
${sorted.map(gen => {
    const search = [gen.title, gen.description, gen.seoKeywords || '',
      ...(site.categoriesOf[gen.key] || []).map(slug => site.categories.find(c => c.slug === slug).name)].join(' ').toLowerCase();
    return `                    <a href="posts/${gen.slug}.html" class="category-generator-item" data-search="${escapeHtml(search)}">
                        <span class="category-generator-icon">${gen.icon}</span>
                        <span class="category-generator-title">${escapeHtml(gen.title)}</span>
                    </a>`;
  }).join('\n')}
                </div>`;
  fillMarkers('all-generators.html', { nav, generators: allList });
  fillMarkers('about.html', { nav });
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
  for (const gen of Object.values(content.generators)) {
    gen.updated = latest([gen.published, lastChanged(`content/generators/${gen.key}.json`)]);
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

  // Drop runtime files for generators that no longer exist
  for (const file of fs.readdirSync(RUNTIME_DIR)) {
    if (!content.generators[path.basename(file, '.json')]) fs.unlinkSync(path.join(RUNTIME_DIR, file));
  }

  generateSitemap(site);
  generateHtmlSitemap(site);
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
  
  let html = `<!DOCTYPE html>
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
    <link rel="stylesheet" href="styles/main.css">
    <style>
        .sitemap-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        .sitemap-section {
            margin-bottom: 3rem;
        }
        .sitemap-section h2 {
            color: #333;
            border-bottom: 2px solid #4a90e2;
            padding-bottom: 0.5rem;
            margin-bottom: 1rem;
        }
        .sitemap-links {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1rem;
        }
        .sitemap-links a {
            display: block;
            padding: 0.5rem;
            color: #4a90e2;
            text-decoration: none;
            border-left: 3px solid #4a90e2;
            padding-left: 1rem;
            transition: all 0.3s;
        }
        .sitemap-links a:hover {
            background-color: #f5f5f5;
            padding-left: 1.5rem;
        }
        .sitemap-category {
            margin-top: 2rem;
        }
        .sitemap-category h3 {
            color: #666;
            margin-bottom: 0.5rem;
            font-size: 1.1rem;
        }
    </style>
</head>
<body>
    <nav class="main-nav">
        <div class="nav-container">
            <a href="index.html" class="nav-logo">🧑🏻‍💻 The Name Generators</a>
            <div class="nav-links">
                <a href="index.html">Home</a>
                <a href="all-generators.html">All Generators</a>
                <a href="sitemap.html">Site Map</a>
            </div>
        </div>
    </nav>

    <div class="sitemap-container">
        <header>
            <h1>Site Map</h1>
            <p>Complete listing of all pages on The Name Generators</p>
        </header>

        <div class="sitemap-section">
            <h2>Main Pages</h2>
            <div class="sitemap-links">
                <a href="${baseUrl}/">Home</a>
                <a href="${baseUrl}/all-generators.html">All Generators</a>
                <a href="${baseUrl}/about.html">About</a>
                <a href="${baseUrl}/sitemap.html">Site Map</a>
            </div>
        </div>

        <div class="sitemap-section">
            <h2>Category Pages</h2>
            <div class="sitemap-links">
`;

  // Add category pages
  for (const category of site.categories) {
    html += `                <a href="${baseUrl}/categories/${category.slug}-names.html">${category.icon} ${escapeHtml(category.name)}</a>\n`;
  }

  html += `            </div>
        </div>

        <div class="sitemap-section">
            <h2>Name Generators</h2>
`;

  // Generators grouped by category (a generator can appear in more than one)
  for (const category of site.categories.filter(c => c.generators.length)) {
    const generators = site.inCategory(category.slug);
    html += `            <div class="sitemap-category">
                <h3>${escapeHtml(category.name)}</h3>
                <div class="sitemap-links">
`;
    for (const generator of generators) {
      html += `                    <a href="${baseUrl}/posts/${generator.slug}.html">${generator.icon || '⚔️'} ${escapeHtml(generator.title)}</a>\n`;
    }
    html += `                </div>
            </div>
`;
  }

  html += `        </div>
    </div>

    <footer class="site-footer">
        <p>&copy; ${new Date().getFullYear()} The Name Generators. All rights reserved. | <a href="sitemap.html" style="color: #4a90e2;">Site Map</a> | <a href="about.html" style="color: #4a90e2;">About</a></p>
    </footer>
</body>
</html>`;

  const sitemapHtmlPath = path.join(ROOT, 'sitemap.html');
  fs.writeFileSync(sitemapHtmlPath, html);
  console.log(`  ✅ Created: sitemap.html`);
}

// Run if called directly
if (require.main === module) {
  build();
}

module.exports = { build };

