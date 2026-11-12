/**
 * The Naming Library (reference/): researched, sourced pages on where names
 * come from and how they're built. One JSON record per topic in
 * content/reference/<slug>.json (see content/reference/README.md).
 *
 * Each record can list the generators that use it; those generator pages get
 * a small "Understanding these names" box linking back here.
 */
const fs = require('fs');
const path = require('path');
const layout = require('./layout');

const REF_CONTENT = path.join(__dirname, '..', 'content', 'reference');
const BASE = 'https://thenamegenerators.com';

const SECTIONS = [
  { key: 'etymology', name: 'Etymology and origins', line: 'Where names come from and how their meanings are traced.' },
  { key: 'construction', name: 'How names are built', line: 'Prefixes, suffixes, compounds and the sounds that make a name work.' },
  { key: 'languages', name: 'Languages and cultures', line: 'Naming traditions from the languages behind many of our generators.' },
  { key: 'history', name: 'Names through history', line: 'How given names and surnames changed over the centuries.' },
  { key: 'fantasy', name: 'Fantasy and fiction', line: 'How invented names are made to sound right for a world.' },
  { key: 'modern', name: 'Modern naming', line: 'Business, brand, stage and online names.' },
];

// How sure we are about a name or meaning. Shown as a badge on every example.
const STATUS = {
  attested: ['Recorded', 'Found in historical records.'],
  reconstructed: ['Reconstructed', 'Worked out by scholars; not found written down.'],
  derived: ['Built from real parts', 'Made by us from genuine word elements.'],
  invented: ['Invented', 'An original name, made for this site.'],
  uncertain: ['Uncertain', 'The origin or meaning is disputed or unproven.'],
};

function loadReference() {
  if (!fs.existsSync(REF_CONTENT)) return [];
  return fs.readdirSync(REF_CONTENT).filter(f => f.endsWith('.json')).sort().map(f => ({
    slug: path.basename(f, '.json'),
    ...JSON.parse(fs.readFileSync(path.join(REF_CONTENT, f), 'utf8')),
  }));
}

function validateReference(records, generators) {
  const errors = [];
  const slugs = new Set(records.map(r => r.slug));
  for (const r of records) {
    const at = `reference/${r.slug}.json`;
    if (!/^[a-z0-9-]+$/.test(r.slug)) errors.push(`${at}: file name must be lowercase-with-hyphens`);
    for (const f of ['title', 'description', 'published', 'section', 'atAGlance']) if (!r[f]) errors.push(`${at}: needs "${f}"`);
    if (r.section && !SECTIONS.some(s => s.key === r.section)) errors.push(`${at}: unknown section "${r.section}"`);
    if (r.description && r.description.length > 160) errors.push(`${at}: description is over 160 characters`);
    const sourceIds = new Set((r.sources || []).map(s => s.id));
    if ((r.sources || []).length < 2) errors.push(`${at}: needs at least 2 sources`);
    for (const s of r.sources || []) if (!s.id || !s.title) errors.push(`${at}: every source needs "id" and "title"`);
    for (const e of r.examples || []) {
      if (!e.name) errors.push(`${at}: an example has no "name"`);
      if (!STATUS[e.status]) errors.push(`${at}: example "${e.name}" needs a status (${Object.keys(STATUS).join(', ')})`);
      if (['attested', 'reconstructed', 'uncertain'].includes(e.status) && !sourceIds.has(e.source)) {
        errors.push(`${at}: example "${e.name}" is ${e.status}, so it needs a "source" from this page's sources`);
      }
    }
    for (const k of r.generators || []) if (!generators[k]) errors.push(`${at}: generator "${k}" doesn't exist`);
    for (const k of r.related || []) if (!slugs.has(k)) errors.push(`${at}: related page "${k}" doesn't exist`);
  }
  return errors;
}

function escapeHtml(text) {
  return String(text == null ? '' : text)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

/** generator key -> reference records that list it (for the box on generator pages). */
function referenceFor(records) {
  const map = {};
  for (const r of records) for (const k of r.generators || []) (map[k] = map[k] || []).push(r);
  return map;
}

/** The "Understanding these names" box on a generator page. */
function generatorBox(records, prefix = '../') {
  if (!records || !records.length) return '';
  return `
            <section class="section ref-box">
                <h2>Understanding these names</h2>
                <p>Where names like these come from, from our Naming Library:</p>
                <ul class="ref-links">
                    ${records.map(r => `<li><a href="${prefix}reference/${r.slug}.html">${escapeHtml(r.title)}</a>: ${escapeHtml(r.description)}</li>`).join('\n                    ')}
                </ul>
            </section>`;
}

function head({ title, desc, url, schema, helpers }) {
  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(desc)}">
    <meta name="author" content="Rich">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
    <link rel="canonical" href="${url}">
    <script type="application/ld+json">
${helpers.scriptJson(schema, 2)}
    </script>
    <meta property="og:type" content="article">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(desc)}">
    <meta property="og:image" content="${layout.shareImage('home')}">
    <meta property="og:site_name" content="The Name Generators">
    <meta property="twitter:card" content="summary_large_image">

    ${helpers.ICON_LINKS}
    ${layout.headAssets('../')}
</head>`;
}

function statusBadge(status) {
  const [label, title] = STATUS[status] || ['', ''];
  return `<span class="ref-status ref-${status}" title="${escapeHtml(title)}">${escapeHtml(label)}</span>`;
}

function referencePage(r, records, site, helpers) {
  const url = `${BASE}/reference/${r.slug}.html`;
  const section = SECTIONS.find(s => s.key === r.section);
  const md = helpers.markdownBold;
  const sources = r.sources || [];
  const srcIndex = Object.fromEntries(sources.map((s, i) => [s.id, i + 1]));
  const gens = (r.generators || []).map(k => site.all.find(g => g.key === k)).filter(Boolean);
  const related = (r.related || []).map(k => records.find(x => x.slug === k)).filter(Boolean);
  const catOf = (gen) => site.categories.find(c => c.slug === gen.category);
  const faqs = r.faqs || [];
  const statuses = [...new Set((r.examples || []).map(e => e.status))];

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Article", "headline": r.title, "description": r.description, "url": url,
        "datePublished": r.published, "dateModified": r.updated || r.published, "inLanguage": "en-GB",
        "author": { "@type": "Person", "name": "Rich", "url": `${BASE}/about.html` },
        "publisher": { "@type": "Organization", "name": "The Name Generators", "url": `${BASE}/` },
        "isPartOf": { "@type": "CollectionPage", "name": "The Naming Library", "url": `${BASE}/reference/` },
        "citation": sources.filter(s => s.url).map(s => s.url) },
      ...(r.term && r.definition ? [{ "@type": "DefinedTerm", "name": r.term, "description": r.definition,
        "inDefinedTermSet": { "@type": "DefinedTermSet", "name": "The Naming Library", "url": `${BASE}/reference/` }, "url": url }] : []),
      { "@type": "BreadcrumbList", "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE}/` },
        { "@type": "ListItem", "position": 2, "name": "Naming Library", "item": `${BASE}/reference/` },
        { "@type": "ListItem", "position": 3, "name": r.title, "item": url }] },
      ...(faqs.length ? [{ "@type": "FAQPage", "mainEntity": faqs.map(f => ({ "@type": "Question", "name": helpers.plainText(f.question),
        "acceptedAnswer": { "@type": "Answer", "text": helpers.plainText(f.answer) } })) }] : []),
    ],
  };

  const examples = (r.examples || []).length ? `
                <h2>${escapeHtml(r.examplesHeading || 'Examples')}</h2>
                <div class="ref-table-wrap"><table class="ref-table">
                    <thead><tr><th>Name</th><th>Meaning or origin</th><th>Status</th></tr></thead>
                    <tbody>
                    ${r.examples.map(e => `<tr><td><b>${escapeHtml(e.name)}</b>${e.language ? `<br><small>${escapeHtml(e.language)}</small>` : ''}</td><td>${md(escapeHtml(e.meaning || ''))}${srcIndex[e.source] ? ` <sup><a href="#src-${srcIndex[e.source]}">[${srcIndex[e.source]}]</a></sup>` : ''}</td><td>${statusBadge(e.status)}</td></tr>`).join('\n                    ')}
                    </tbody>
                </table></div>
                <p class="ref-key">${statuses.map(s => `${statusBadge(s)} ${escapeHtml(STATUS[s][1])}`).join(' ')}</p>` : '';

  const facts = (r.facts || []).length ? `
                <dl class="ref-facts">
                    ${r.facts.map(f => `<div><dt>${escapeHtml(f.label)}</dt><dd>${md(escapeHtml(f.value))}</dd></div>`).join('\n                    ')}
                </dl>` : '';

  const body = (r.sections || []).map(s => `
                <h2>${s.heading}</h2>
                ${md(s.content)}`).join('\n');

  const genHtml = gens.length ? `
            <section class="section">
                <h2>Put it to use</h2>
                <div class="genlist">
                    ${gens.map(g => `<a href="../posts/${g.slug}.html" class="gencard hd tap">${layout.doodle(layout.generatorMotif(g, catOf(g)), 'doodle wob')}<div><b>${escapeHtml(g.title)}</b><span>${escapeHtml(g.description)}</span></div><em aria-hidden="true">→</em></a>`).join('\n                    ')}
                </div>
            </section>` : '';

  const relatedHtml = related.length ? `
            <section class="section">
                <h2>Related in the Naming Library</h2>
                <ul class="ref-links">
                    ${related.map(x => `<li><a href="${x.slug}.html">${escapeHtml(x.title)}</a>: ${escapeHtml(x.description)}</li>`).join('\n                    ')}
                </ul>
            </section>` : '';

  const faqHtml = faqs.length ? `
            <section class="section faq-section">
                <h2>Frequently Asked Questions</h2>
                <div class="faq">
                    ${faqs.map(f => `<details>
                        <summary><span class="tg hd" aria-hidden="true">+</span>${f.question}</summary>
                        <div>${md(f.answer)}</div>
                    </details>`).join('\n                    ')}
                </div>
            </section>` : '';

  const sourcesHtml = `
            <section class="section ref-sources">
                <h2>Sources</h2>
                <ol>
                    ${sources.map((s, i) => `<li id="src-${i + 1}">${s.author ? `${escapeHtml(s.author)}, ` : ''}${s.url ? `<a href="${escapeHtml(s.url)}" rel="noopener">${escapeHtml(s.title)}</a>` : `<cite>${escapeHtml(s.title)}</cite>`}${s.publisher ? `, ${escapeHtml(s.publisher)}` : ''}${s.year ? ` (${escapeHtml(s.year)})` : ''}${s.accessed ? `. Checked ${escapeHtml(helpers.longDate(s.accessed))}` : ''}.</li>`).join('\n                    ')}
                </ol>
                <p class="ref-note">Spotted a mistake? <a href="../about.html">Tell us</a> and we'll check it and put it right.</p>
            </section>`;

  return `${head({ title: r.seoTitle || `${r.title} | The Naming Library`, desc: r.description, url, schema, helpers })}
<body>
    ${layout.svgSprite([...gens.map(g => layout.generatorMotif(g, catOf(g))), 'quill'])}
    ${layout.siteHeader('../', site.categories)}

    <div class="wrap layout">
        <main id="main">
            <nav class="crumb" aria-label="Breadcrumb"><a href="../index.html">Home</a> / <a href="index.html">Naming Library</a> / <span aria-current="page">${escapeHtml(r.title)}</span></nav>
            <article class="guide reference">
                <p class="eyebrow">${escapeHtml(section ? section.name : 'Naming Library')}</p>
                <div class="titlerow">
                    <h1>${escapeHtml(r.title)}</h1>
                    ${layout.doodle(r.motif || 'quill')}
                </div>
                <div class="ref-glance hd">
                    <h2>At a glance</h2>
                    ${md(r.atAGlance)}
                </div>
                <p class="byline">By Rich · ${helpers.longDate(r.updated || r.published)} · ${sources.length} sources</p>
                <div class="section article">${facts}${examples}${body}
                </div>
            </article>${genHtml}${relatedHtml}${faqHtml}${sourcesHtml}
        </main>
        <aside class="side" aria-label="Sidebar"></aside>
    </div>

    ${layout.siteFooter('../')}
    ${layout.bodyScripts('../')}
</body>
</html>`;
}

function referenceIndex(records, site, helpers) {
  const url = `${BASE}/reference/`;
  const title = 'The Naming Library: Where Names Come From and How They Work | The Name Generators';
  const desc = 'Researched, sourced guides to the origins, meanings and construction of names: surnames, patronymics, Old Norse and Old English names, fantasy naming and more.';
  const schema = { "@context": "https://schema.org", "@type": "CollectionPage", "name": "The Naming Library", "description": desc, "url": url,
    "mainEntity": { "@type": "ItemList", "itemListElement": records.map((r, i) => ({ "@type": "ListItem", "position": i + 1, "name": r.title, "url": `${BASE}/reference/${r.slug}.html` })) } };
  const groups = SECTIONS.map(s => ({ ...s, items: records.filter(r => r.section === s.key) })).filter(s => s.items.length);
  return `${head({ title, desc, url, schema, helpers })}
<body>
    ${layout.svgSprite(['quill'])}
    ${layout.siteHeader('../', site.categories)}

    <div class="wrap layout">
        <main id="main">
            <nav class="crumb" aria-label="Breadcrumb"><a href="../index.html">Home</a> / <span aria-current="page">Naming Library</span></nav>
            <div class="titlerow">
                <h1>The Naming <span class="hl">Library</span></h1>
                ${layout.doodle('quill')}
            </div>
            <p class="lede">The origins, meanings and construction of names. Every page cites its sources, and every example says whether the name is historically recorded, reconstructed by scholars, built by us from real word parts, or simply invented.</p>
            ${groups.map(g => `<section class="section">
                <h2>${escapeHtml(g.name)}</h2>
                <p>${escapeHtml(g.line)}</p>
                <div class="genlist">
                    ${g.items.map(r => `<a href="${r.slug}.html" class="gencard hd tap">${layout.doodle(r.motif || 'quill', 'doodle wob')}<div><b>${escapeHtml(r.title)}</b><span>${escapeHtml(r.description)}</span></div><em aria-hidden="true">→</em></a>`).join('\n                    ')}
                </div>
            </section>`).join('\n            ')}
            <section class="section">
                <h2>How we check this library</h2>
                <p>Each fact is checked against at least two sources, such as historical dictionaries, etymological dictionaries and academic works, and those sources are listed on the page. Where scholars disagree, we say so. Names our generators invent are always labelled as invented, so you never mistake a name that sounds Norse for one that is.</p>
            </section>
        </main>
        <aside class="side" aria-label="Sidebar"></aside>
    </div>

    ${layout.siteFooter('../')}
    ${layout.bodyScripts('../')}
</body>
</html>`;
}

/** Writes reference/*.html; returns the records for the sitemap and llms.txt. */
function buildReference(site, helpers) {
  const records = loadReference();
  const dir = path.join(__dirname, '..', 'reference');
  if (!records.length) return records;
  fs.mkdirSync(dir, { recursive: true });
  for (const r of records) fs.writeFileSync(path.join(dir, `${r.slug}.html`), layout.stampAssets(referencePage(r, records, site, helpers)));
  for (const f of fs.readdirSync(dir)) {
    if (f !== 'index.html' && !records.some(r => `${r.slug}.html` === f)) fs.unlinkSync(path.join(dir, f));
  }
  fs.writeFileSync(path.join(dir, 'index.html'), layout.stampAssets(referenceIndex(records, site, helpers)));
  console.log(`  ✅ Created: reference/index.html and ${records.length} Naming Library pages`);
  return records;
}

module.exports = { loadReference, validateReference, referenceFor, generatorBox, buildReference, SECTIONS, STATUS };
