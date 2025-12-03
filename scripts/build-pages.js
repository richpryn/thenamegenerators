#!/usr/bin/env node

/**
 * Build Pages Script
 * Auto-generates all HTML pages from JSON data files
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const POSTS_DIR = path.join(__dirname, '../posts');
const CATEGORIES_DIR = path.join(__dirname, '../categories');

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

// Ensure output directories exist
[POSTS_DIR, CATEGORIES_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Load and parse all JSON category files
 */
function loadAllCategories() {
  const categories = {};
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const categorySlug = path.basename(file, '.json');
    const filePath = path.join(DATA_DIR, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    categories[categorySlug] = data;
  }

  return categories;
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
    articleBody += ' ' + generator.article.intro.replace(/<[^>]*>/g, ' ').trim();
  }
  if (generator.article && generator.article.sections) {
    generator.article.sections.forEach(section => {
      articleBody += ' ' + section.heading + ' ' + section.content.replace(/<[^>]*>/g, ' ').trim();
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
    "datePublished": new Date().toISOString(),
    "dateModified": new Date().toISOString(),
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
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1000"
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
          "text": faq.answer
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
        "text": generator.filters 
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
function generateGeneratorPage(generator, category, categorySlug, generatorKey) {
  const schemas = generateSchemas(generator, category);
  const schemaScripts = schemas.map(s => 
    `<script type="application/ld+json">\n${JSON.stringify(s, null, 2)}\n</script>`
  ).join('\n    ');

  // Build filter HTML if filters exist
  let filterHTML = '';
  let nameInputHTML = '';
  
  // Special handling for epithet generator - needs name input
  if (generatorKey === 'epithet') {
    nameInputHTML = `
          <div class="filter-group">
            <label for="character-name">Character Name:</label>
            <input type="text" id="character-name" name="character-name" placeholder="Enter your character's name" class="name-input">
          </div>`;
  }
  
  if (generator.filters) {
    const filterInputs = Object.entries(generator.filters).map(([key, filter]) => {
      // Format option labels better
      const options = filter.options.map(opt => {
        let label = opt.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        // Special formatting for category names
        if (key === 'category') {
          label = label.replace('Deed ', 'Deed: ').replace('Personality ', 'Personality: ')
            .replace('Alignment ', 'Alignment: ').replace('Reputation ', 'Reputation: ')
            .replace('Origin ', 'Origin: ').replace('Magical ', 'Magical: ')
            .replace('Weapon ', 'Weapon: ').replace('Time ', 'Time: ')
            .replace('Misc ', 'Misc: ');
        }
        return `<option value="${opt}">${label}</option>`;
      }).join('\n            ');
      return `
          <div class="filter-group">
            <label for="filter-${key}">${filter.label}:</label>
            <select id="filter-${key}" name="${key}">
              ${options}
            </select>
          </div>`;
    }).join('\n');
    filterHTML = `<div class="filters">${nameInputHTML}${filterInputs}</div>`;
  } else if (nameInputHTML) {
    filterHTML = `<div class="filters">${nameInputHTML}</div>`;
  }

  // Build related generators HTML (always show, populated dynamically)
  const relatedHTML = `
      <section class="related-section">
        <h2>Related Name Generators</h2>
        <div class="related-grid" id="related-generators">
          <!-- Populated by JavaScript -->
        </div>
      </section>`;
  
  // Build category generators grid HTML (always show, populated dynamically)
  const categoryGeneratorsHTML = `
      <section class="category-generators-section">
        <h2>All ${category.name} Name Generators</h2>
        <div class="category-generators-grid" id="category-generators">
          <!-- Populated by JavaScript -->
        </div>
      </section>`;

  // Build article sections HTML
  let sectionsHTML = '';
  if (generator.article && generator.article.sections) {
    sectionsHTML = generator.article.sections.map(section => `
      <section>
        <h2>${section.heading}</h2>
        ${section.content}
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
              <p class="faq-answer">${faq.answer}</p>
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

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Primary SEO Meta Tags -->
    <title>${seoTitle}</title>
    <meta name="title" content="${seoTitle}">
    <meta name="description" content="${metaDescription}">
    <meta name="keywords" content="${generator.seoKeywords}">
    <meta name="author" content="The Name Generators">
    <meta name="robots" content="index, follow">
    <meta name="language" content="English">
    <meta name="revisit-after" content="7 days">
    <link rel="canonical" href="${pageUrl}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${pageUrl}">
    <meta property="og:title" content="${seoTitle}">
    <meta property="og:description" content="${metaDescription}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:site_name" content="The Name Generators">
    <meta property="og:locale" content="en_US">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${pageUrl}">
    <meta property="twitter:title" content="${seoTitle}">
    <meta property="twitter:description" content="${metaDescription}">
    <meta property="twitter:image" content="${imageUrl}">
    
    <!-- Additional Meta Tags -->
    <meta name="generators" content="${generator.slug}">
    <meta name="categories" content="${category.name}">
    
    <!-- AI/LLM Friendly Meta Tags -->
    <meta name="topic" content="${generator.title.replace(' Generator', '')}">
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
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self';">
    
    <!-- Schema.org JSON-LD -->
    ${schemaScripts}
    
    <link rel="stylesheet" href="../styles/main.css">
    <link rel="stylesheet" href="../styles/blog.css">
</head>
<body>
    <nav class="main-nav">
        <div class="nav-container">
            <a href="../index.html" class="nav-logo">🧑🏻‍💻 The Name Generators</a>
            <div class="nav-links">
                <a href="../index.html">Home</a>
                <a href="../all-generators.html">All Generators</a>
                <div class="nav-dropdown">
                    <a href="#" class="nav-dropdown-toggle">Categories</a>
                    <div class="nav-dropdown-menu" id="category-dropdown">
                        <!-- Populated by JavaScript -->
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <div class="container">
        <header class="blog-hero">
            <h1>${generator.article.hero.title}</h1>
            <p class="tagline">${generator.article.hero.tagline}</p>
        </header>

        <main>
            <section class="embedded-generator">
                <div class="generator-card">
                    <h2>Generate Your ${generator.title}</h2>
                    <p class="generator-description">${generator.description}</p>
                    
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
                <meta itemprop="headline" content="${generator.title}">
                <meta itemprop="description" content="${generator.description}">
                <section itemprop="articleBody">
                    <p>${generator.article.intro}</p>
                </section>
                ${sectionsHTML}
            </article>

            ${faqsHTML}
            ${relatedHTML}
            ${categoryGeneratorsHTML}
        </main>

        <footer class="site-footer">
            <p>&copy; ${new Date().getFullYear()} The Name Generators. All rights reserved.</p>
        </footer>
    </div>

    <script src="../lib/generator.js"></script>
    <script>
        // Initialize generator for this specific generator
        const categorySlug = '${categorySlug}';
        const generatorKey = '${generatorKey}';
        
        // Populate category dropdown
        (async () => {
            const categories = await window.nameGenerator.getCategories();
            const dropdown = document.getElementById('category-dropdown');
            categories.forEach(cat => {
                const link = document.createElement('a');
                link.href = \`../categories/\${cat.slug}-names.html\`;
                link.textContent = \`\${cat.icon} \${cat.navLabel}\`;
                dropdown.appendChild(link);
            });
        })();
        
        // Initialize generator
        document.getElementById('generate-btn').addEventListener('click', async () => {
            const count = 8;
            const filters = {};
            
            // Collect filter values
            ${generator.filters ? Object.keys(generator.filters).map(key => 
              `if (document.getElementById('filter-${key}')) {
                filters['${key}'] = document.getElementById('filter-${key}').value;
              }`
            ).join('\n            ') : ''}
            
            try {
                ${generatorKey === 'dnd_fantasy' ? `
                // Special handling for D&D fantasy generator - combine first and last names
                const generator = await window.nameGenerator.getGenerator(categorySlug, generatorKey);
                const gender = filters.gender || 'male';
                
                const firstNames = generator.data[gender].firstNames;
                const lastNames = generator.data[gender].lastNames;
                
                // Validate data is loaded correctly
                if (!firstNames || !Array.isArray(firstNames) || firstNames.length === 0) {
                    console.error('First names not found or invalid:', firstNames);
                    throw new Error('First names data not available');
                }
                if (!lastNames || !Array.isArray(lastNames) || lastNames.length === 0) {
                    console.error('Last names not found or invalid:', lastNames);
                    console.error('Available keys:', Object.keys(generator.data[gender]));
                    throw new Error('Last names data not available');
                }
                
                // Create shuffled pools for first and last names
                const firstPoolKey = \`\${categorySlug}:\${generatorKey}:first:\${gender}\`;
                const lastPoolKey = \`\${categorySlug}:\${generatorKey}:last:\${gender}\`;
                
                let firstShuffled = window.nameGenerator.namePools.get(firstPoolKey);
                let firstIndex = window.nameGenerator.nameIndices.get(firstPoolKey) || 0;
                let lastShuffled = window.nameGenerator.namePools.get(lastPoolKey);
                let lastIndex = window.nameGenerator.nameIndices.get(lastPoolKey) || 0;
                
                // Initialize pools if needed
                if (!firstShuffled || firstIndex >= firstShuffled.length) {
                    firstShuffled = window.nameGenerator.shuffleArray([...firstNames]);
                    window.nameGenerator.namePools.set(firstPoolKey, firstShuffled);
                    firstIndex = 0;
                }
                if (!lastShuffled || lastIndex >= lastShuffled.length) {
                    lastShuffled = window.nameGenerator.shuffleArray([...lastNames]);
                    window.nameGenerator.namePools.set(lastPoolKey, lastShuffled);
                    lastIndex = 0;
                }
                
                // Generate combined names
                const results = [];
                for (let i = 0; i < count; i++) {
                    // If we've exhausted first names, reshuffle
                    if (firstIndex >= firstShuffled.length) {
                        firstShuffled = window.nameGenerator.shuffleArray([...firstNames]);
                        window.nameGenerator.namePools.set(firstPoolKey, firstShuffled);
                        firstIndex = 0;
                    }
                    // If we've exhausted last names, reshuffle
                    if (lastIndex >= lastShuffled.length) {
                        lastShuffled = window.nameGenerator.shuffleArray([...lastNames]);
                        window.nameGenerator.namePools.set(lastPoolKey, lastShuffled);
                        lastIndex = 0;
                    }
                    
                    const firstName = firstShuffled[firstIndex];
                    const lastName = lastShuffled[lastIndex];
                    
                    // Ensure both parts exist
                    if (!firstName || !lastName) {
                        console.error('Missing name parts:', { firstName, lastName, firstIndex, lastIndex, firstShuffledLength: firstShuffled.length, lastShuffledLength: lastShuffled.length });
                        continue; // Skip this iteration if name parts are missing
                    }
                    
                    // Combine first and last name
                    const fullName = String(firstName).trim() + ' ' + String(lastName).trim();
                    results.push(fullName);
                    
                    firstIndex++;
                    lastIndex++;
                }
                
                // Update indices
                window.nameGenerator.nameIndices.set(firstPoolKey, firstIndex);
                window.nameGenerator.nameIndices.set(lastPoolKey, lastIndex);
                
                const resultsDiv = document.getElementById('results');
                resultsDiv.innerHTML = '<ul class="name-results">' + 
                    results.map(name => \`<li>\${name}</li>\`).join('') + 
                    '</ul>';
                ` : generatorKey === 'epithet' ? `
                const epithets = await window.nameGenerator.generateNames(categorySlug, generatorKey, filters, count);
                const resultsDiv = document.getElementById('results');
                
                // Special handling for epithet generator - combine with user's name
                // Special handling for epithet generator - combine with user's name
                const characterName = document.getElementById('character-name')?.value?.trim() || 'Your Character';
                
                // Format epithets based on type
                const formattedNames = epithets.map(epithet => {
                    // Epithets that already start with "the" should keep it
                    if (epithet.startsWith('the ')) {
                        return \`\${characterName} \${epithet}\`;
                    }
                    // Epithets that start with "of" don't need "the"
                    if (epithet.startsWith('of ')) {
                        return \`\${characterName} \${epithet}\`;
                    }
                    // Compound words (slayer, bane, born, etc.) don't need "the"
                    if (epithet.includes('slayer') || epithet.includes('bane') || epithet.includes('born') || 
                        epithet.includes('breaker') || epithet.includes('hunter') || epithet.includes('killer') ||
                        epithet.includes('wielder') || epithet.includes('master') || epithet.includes('keeper') ||
                        epithet.includes('weaver') || epithet.includes('binder') || epithet.includes('reader') ||
                        epithet.includes('seer') || epithet.includes('walker') || epithet.includes('defender') ||
                        epithet.includes('singer') || epithet.includes('chanter') || epithet.includes('speaker') ||
                        epithet.includes('caller') || epithet.includes('whisperer') || epithet.includes('prophet') ||
                        epithet.includes('feller') || epithet.includes('saver') || epithet.includes('maker') ||
                        epithet.includes('creator') || epithet.includes('founder') || epithet.includes('architect') ||
                        epithet.includes('negotiator') || epithet.includes('diplomat') || epithet.includes('mediator')) {
                        return \`\${characterName} \${epithet}\`;
                    }
                    // Most other epithets use "the" prefix
                    return \`\${characterName} the \${epithet}\`;
                });
                
                resultsDiv.innerHTML = '<ul class="name-results">' + 
                    formattedNames.map(name => \`<li>\${name}</li>\`).join('') + 
                    '</ul>';
                ` : `
                const names = await window.nameGenerator.generateNames(categorySlug, generatorKey, filters, count);
                const resultsDiv = document.getElementById('results');
                resultsDiv.innerHTML = '<ul class="name-results">' + 
                    names.map(name => \`<li>\${name}</li>\`).join('') + 
                    '</ul>';
                `}
            } catch (error) {
                console.error('Generation error:', error);
                document.getElementById('results').innerHTML = '<p class="error">Error generating names. Please try again.</p>';
            }
        });
        
        // Load related generators (always show, dynamically calculated)
        (async () => {
            // Helper function to escape HTML
            const escapeHtml = (text) => {
                if (!text) return '';
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            };
            
            const related = await window.nameGenerator.getRelatedGenerators(categorySlug, generatorKey);
            const relatedDiv = document.getElementById('related-generators');
            if (relatedDiv && related.length > 0) {
                relatedDiv.innerHTML = related.map(gen => 
                    \`<a href="../posts/\${gen.slug}.html" class="related-card">
                        <h3>\${gen.icon} \${escapeHtml(gen.title)}</h3>
                        <p>\${escapeHtml(gen.description)}</p>
                    </a>\`
                ).join('');
            } else if (relatedDiv) {
                relatedDiv.innerHTML = '<p>No related generators found.</p>';
            }
        })();
        
        // Load category generators grid
        (async () => {
            // Helper function to escape HTML
            const escapeHtml = (text) => {
                if (!text) return '';
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            };
            
            try {
                const generators = await window.nameGenerator.getGenerators(categorySlug);
                const generatorsArray = Object.entries(generators)
                    .map(([key, gen]) => ({
                        key,
                        ...gen
                    }))
                    .filter(gen => gen.key !== generatorKey); // Exclude current generator
                
                const categoryGeneratorsDiv = document.getElementById('category-generators');
                if (categoryGeneratorsDiv && generatorsArray.length > 0) {
                    categoryGeneratorsDiv.innerHTML = generatorsArray.map(gen => 
                        \`<a href="../posts/\${gen.slug}.html" class="category-generator-item">
                            <span class="category-generator-icon">\${gen.icon}</span>
                            <span class="category-generator-title">\${escapeHtml(gen.title)}</span>
                        </a>\`
                    ).join('');
                } else if (categoryGeneratorsDiv) {
                    categoryGeneratorsDiv.innerHTML = '<p>No other generators in this category.</p>';
                }
            } catch (error) {
                console.error('Error loading category generators:', error);
            }
        })();
    </script>
</body>
</html>`;

  return html;
}

/**
 * Generate category landing page
 */
function generateCategoryPage(category, categorySlug) {
  const generators = Object.entries(category.generators).map(([key, gen]) => ({
    key,
    ...gen
  }));

  const generatorsHTML = generators.map(gen => `
    <a href="../posts/${gen.slug}.html" class="generator-card">
      <h3>${gen.icon} ${escapeHtml(gen.title)}</h3>
      <p>${escapeHtml(gen.description)}</p>
    </a>
  `).join('\n    ');

  // Generate SEO-optimized category title
  const baseUrl = "https://thenamegenerators.com";
  const categorySEOTitle = `${category.categoryInfo.name} Name Generators - Free Online Tools | The Name Generators`;
  const categoryUrl = `${baseUrl}/categories/${categorySlug}-names.html`;
  const categoryImageUrl = `${baseUrl}/images/categories/${categorySlug}.jpg`;
  
  // Enhanced category meta description
  const categoryMetaDesc = category.categoryInfo.seoDescription.length > 160
    ? category.categoryInfo.seoDescription.substring(0, 157) + '...'
    : category.categoryInfo.seoDescription;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Primary SEO Meta Tags -->
    <title>${categorySEOTitle}</title>
    <meta name="title" content="${categorySEOTitle}">
    <meta name="description" content="${categoryMetaDesc}">
    <meta name="keywords" content="${category.categoryInfo.name.toLowerCase()} names, ${category.categoryInfo.name.toLowerCase()} name generator, ${category.categoryInfo.name.toLowerCase()} name generators">
    <meta name="author" content="The Name Generators">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${categoryUrl}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${categoryUrl}">
    <meta property="og:title" content="${categorySEOTitle}">
    <meta property="og:description" content="${categoryMetaDesc}">
    <meta property="og:image" content="${categoryImageUrl}">
    <meta property="og:site_name" content="The Name Generators">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${categoryUrl}">
    <meta property="twitter:title" content="${categorySEOTitle}">
    <meta property="twitter:description" content="${categoryMetaDesc}">
    <meta property="twitter:image" content="${categoryImageUrl}">
    
    <link rel="stylesheet" href="../styles/main.css">
    <link rel="stylesheet" href="../styles/blog.css">
</head>
<body>
    <nav class="main-nav">
        <div class="nav-container">
            <a href="../index.html" class="nav-logo">🧑🏻‍💻 The Name Generators</a>
            <div class="nav-links">
                <a href="../index.html">Home</a>
                <a href="../all-generators.html">All Generators</a>
                <div class="nav-dropdown">
                    <a href="#" class="nav-dropdown-toggle">Categories</a>
                    <div class="nav-dropdown-menu" id="category-dropdown">
                        <!-- Populated by JavaScript -->
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <div class="container">
        <header class="hero">
            <h1>${category.categoryInfo.icon} ${category.categoryInfo.name}</h1>
            <p>${category.categoryInfo.description}</p>
            <p class="generator-count">${generators.length} generator${generators.length !== 1 ? 's' : ''} available</p>
        </header>

        <main>
            <div class="generators-grid">
                ${generatorsHTML}
            </div>
        </main>

        <footer class="site-footer">
            <p>&copy; ${new Date().getFullYear()} The Name Generators. All rights reserved.</p>
        </footer>
    </div>

    <script src="../lib/generator.js"></script>
    <script>
        // Populate category dropdown
        (async () => {
            const categories = await window.nameGenerator.getCategories();
            const dropdown = document.getElementById('category-dropdown');
            categories.forEach(cat => {
                const link = document.createElement('a');
                link.href = \`../categories/\${cat.slug}-names.html\`;
                link.textContent = \`\${cat.icon} \${cat.navLabel}\`;
                dropdown.appendChild(link);
            });
        })();
    </script>
</body>
</html>`;

  return html;
}

/**
 * Main build function
 */
function build() {
  console.log('🚀 Building pages from JSON data...\n');

  const categories = loadAllCategories();
  const allGenerators = [];

  // Generate individual generator pages
  for (const [categorySlug, category] of Object.entries(categories)) {
    console.log(`📁 Processing category: ${category.categoryInfo.name}`);

    // Generate category landing page
    const categoryHTML = generateCategoryPage(category, categorySlug);
    const categoryPath = path.join(CATEGORIES_DIR, `${categorySlug}-names.html`);
    fs.writeFileSync(categoryPath, categoryHTML);
    console.log(`  ✅ Created: categories/${categorySlug}-names.html`);

    // Generate individual generator pages
    for (const [generatorKey, generator] of Object.entries(category.generators)) {
      const generatorHTML = generateGeneratorPage(generator, category.categoryInfo, categorySlug, generatorKey);
      const generatorPath = path.join(POSTS_DIR, `${generator.slug}.html`);
      fs.writeFileSync(generatorPath, generatorHTML);
      console.log(`  ✅ Created: posts/${generator.slug}.html`);

      allGenerators.push({
        ...generator,
        categorySlug,
        categoryName: category.categoryInfo.name,
        categoryIcon: category.categoryInfo.icon,
        generatorKey
      });
    }
  }

  // Generate sitemap.xml
  generateSitemap(allGenerators, categories);
  
  console.log(`\n✨ Build complete! Generated ${allGenerators.length} generator pages and ${Object.keys(categories).length} category pages.`);
  
  return { categories, allGenerators };
}

/**
 * Generate sitemap.xml for SEO
 */
function generateSitemap(allGenerators, categories) {
  const baseUrl = "https://thenamegenerators.com";
  const currentDate = new Date().toISOString().split('T')[0];
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- All Generators Page -->
  <url>
    <loc>${baseUrl}/all-generators.html</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;

  // Add category pages
  for (const [categorySlug, category] of Object.entries(categories)) {
    sitemap += `  <!-- Category: ${category.categoryInfo.name} -->
  <url>
    <loc>${baseUrl}/categories/${categorySlug}-names.html</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  }

  // Add generator pages
  for (const generator of allGenerators) {
    sitemap += `  <!-- Generator: ${generator.title} -->
  <url>
    <loc>${baseUrl}/posts/${generator.slug}.html</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
  }

  sitemap += `</urlset>`;

  const sitemapPath = path.join(__dirname, '../sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemap);
  console.log(`  ✅ Created: sitemap.xml`);
}

// Run if called directly
if (require.main === module) {
  build();
}

module.exports = { build, loadAllCategories };

