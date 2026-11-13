/**
 * Name lists (names/): big, browsable lists of real names, such as "names that
 * mean moon", Welsh baby names, dog names. One JSON file per page in
 * content/lists/<slug>.json (see content/lists/README.md).
 *
 * Each name shows its meaning, origin, how sure we are (the Naming Library's
 * labels) and, where it's a real given name, its rank in England and Wales
 * from the ONS (content/data/ons-names.json). lib/lists.js adds the filters.
 */
const fs = require('fs');
const path = require('path');
const layout = require('./layout');

const LIST_CONTENT = path.join(__dirname, '..', 'content', 'lists');
const ONS_FILE = path.join(__dirname, '..', 'content', 'data', 'ons-names.json');
const BASE = 'https://thenamegenerators.com';

const SECTIONS = [
  { key: 'meanings', name: 'Names by meaning', line: 'Girl, boy and gender-neutral names that mean moon, light, fire, love and more, every meaning checked.' },
  { key: 'heritage', name: 'Names by heritage', line: 'Welsh, Old English, Victorian and Old Norse names, with meanings and how to say them.' },
  { key: 'pets', name: 'Pet names', line: 'Names for dogs and cats, from classic to funny.' },
  { key: 'fantasy', name: 'Fantasy name lists', line: 'Hand-picked names from our generators, for stories and games.' },
];
const STATUS = {
  attested: ['Checked', 'The meaning is recorded in the sources below.'],
  uncertain: ['Disputed', 'The meaning is disputed or popular but unproven.'],
  derived: ['Word name', 'A modern name made from a real word.'],
  invented: ['Invented', 'An original name, made for this site.'],
};
const GENDER_LABEL = { girl: 'Girl', boy: 'Boy', any: 'Any gender' };
const ONS_SOURCE = { id: 'ons', title: 'Baby names in England and Wales: 1996 to 2025', publisher: 'Office for National Statistics', url: 'https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/livebirths/datasets/babynamesinenglandandwalesfrom1996', note: 'Contains public sector information licensed under the Open Government Licence v3.0.' };

let ons = null;
function onsData() {
  if (ons === null) ons = fs.existsSync(ONS_FILE) ? JSON.parse(fs.readFileSync(ONS_FILE, 'utf8')) : { girl: {}, boy: {}, years: [] };
  return ons;
}

/** ONS ranks for a name: {rank, year, past, pastYear, count} for the group's gender (or the better of both). */
function onsRank(name, gender) {
  const d = onsData();
  const pick = (g) => {
    const r = d[g] && d[g][name];
    if (!r || !r[0]) return null;
    // The earliest year it was ranked, for the trend (2010 if possible)
    const idx = [3, 2, 4, 1, 5].find(i => r[i]);
    return { gender: g, rank: r[0], year: d.years[0], count: r[d.years.length], past: idx != null ? r[idx] : null, pastYear: idx != null ? d.years[idx] : null };
  };
  if (gender === 'girl' || gender === 'boy') return pick(gender);
  const a = pick('girl'); const b = pick('boy');
  if (a && b) return a.rank <= b.rank ? a : b;
  return a || b;
}

function loadLists() {
  if (!fs.existsSync(LIST_CONTENT)) return [];
  return fs.readdirSync(LIST_CONTENT).filter(f => f.endsWith('.json')).sort().map(f => ({
    slug: path.basename(f, '.json'),
    ...JSON.parse(fs.readFileSync(path.join(LIST_CONTENT, f), 'utf8')),
  }));
}

function validateLists(lists, generators, referenceSlugs) {
  const errors = [];
  // Links may point at drafts waiting for review; they're skipped until published.
  const draftDir = path.join(__dirname, '..', 'content', 'lists-drafts');
  const drafts = fs.existsSync(draftDir) ? fs.readdirSync(draftDir).filter(f => f.endsWith('.json')).map(f => path.basename(f, '.json')) : [];
  const slugs = new Set([...lists.map(l => l.slug), ...drafts]);
  for (const l of lists) {
    const at = `lists/${l.slug}.json`;
    if (!/^[a-z0-9-]+$/.test(l.slug)) errors.push(`${at}: file name must be lowercase-with-hyphens`);
    for (const f of ['title', 'description', 'published', 'section', 'intro']) if (!l[f]) errors.push(`${at}: needs "${f}"`);
    if (l.section && !SECTIONS.some(s => s.key === l.section)) errors.push(`${at}: unknown section "${l.section}"`);
    if (l.description && l.description.length > 160) errors.push(`${at}: description is over 160 characters`);
    if (!(l.groups || []).length) errors.push(`${at}: needs at least one group of names`);
    const sourceIds = new Set((l.sources || []).map(s => s.id));
    let meanings = 0;
    for (const g of l.groups || []) {
      if (!g.heading) errors.push(`${at}: a group has no heading`);
      if (g.gender && !GENDER_LABEL[g.gender]) errors.push(`${at}: group "${g.heading}" has unknown gender "${g.gender}"`);
      const seen = new Set();
      for (const n of g.names || []) {
        if (!n.name) { errors.push(`${at}: a name in "${g.heading}" is empty`); continue; }
        if (seen.has(n.name)) errors.push(`${at}: "${n.name}" appears twice in "${g.heading}"`);
        seen.add(n.name);
        if (n.status && !STATUS[n.status]) errors.push(`${at}: "${n.name}" has unknown status "${n.status}"`);
        if (n.meaning) meanings++;
        if (n.meaning && !n.status) errors.push(`${at}: "${n.name}" gives a meaning, so it needs a status`);
        if (['attested', 'uncertain'].includes(n.status) && !sourceIds.has(n.source)) errors.push(`${at}: "${n.name}" is ${n.status}, so it needs a "source" from this page's sources`);
      }
    }
    if (meanings && (l.sources || []).length < 2) errors.push(`${at}: gives meanings, so it needs at least 2 sources`);
    for (const k of l.generators || []) if (!generators[k]) errors.push(`${at}: generator "${k}" doesn't exist`);
    for (const k of l.reference || []) if (!referenceSlugs.has(k)) errors.push(`${at}: reference page "${k}" doesn't exist`);
    for (const k of l.lists || []) if (!slugs.has(k)) errors.push(`${at}: list "${k}" doesn't exist`);
  }
  return errors;
}

function esc(text) {
  return String(text == null ? '' : text)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

/** generator key -> lists that link it, for a box on the generator page. */
function listsFor(lists) {
  const map = {};
  for (const l of lists) for (const k of l.generators || []) (map[k] = map[k] || []).push(l);
  return map;
}

function generatorBox(lists) {
  if (!lists || !lists.length) return '';
  return `
            <section class="section list-links hd">
                <svg class="doodle ref-box-d wob" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><use href="#m-name-list"/></svg>
                <h2>Name lists</h2>
                <p>Real names to browse, with their meanings checked:</p>
                <ul class="ref-links">
                    ${lists.map(l => `<li><a href="../names/${l.slug}.html">${esc(l.title)}</a>: ${esc(l.description)}</li>`).join('\n                    ')}
                </ul>
            </section>`;
}

function head({ title, desc, url, schema, helpers }) {
  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Mediavine Grow -->
    <script data-grow-initializer="">!(function(){window.growMe||((window.growMe=function(e){window.growMe._.push(e);}),(window.growMe._=[]));var e=document.createElement("script");(e.type="text/javascript"),(e.src="https://faves.grow.me/main.js"),(e.defer=!0),e.setAttribute("data-grow-faves-site-id","U2l0ZTo2YmQ3YzdiOS00MDgwLTQ5MmYtOGEyZi0yZWE3YmU2N2E5ZTU=");var t=document.getElementsByTagName("script")[0];t.parentNode.insertBefore(e,t);})();</script>

    <title>${esc(title)}</title>
    <meta name="description" content="${esc(desc)}">
    <meta name="author" content="Rich">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
    <link rel="canonical" href="${url}">
    <script type="application/ld+json">
${helpers.scriptJson(schema, 2)}
    </script>
    <meta property="og:type" content="article">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(desc)}">
    <meta property="og:image" content="${layout.shareImage('home')}">
    <meta property="og:site_name" content="The Name Generators">
    <meta property="twitter:card" content="summary_large_image">

    ${helpers.ICON_LINKS}
    ${layout.headAssets('../')}
</head>`;
}

function rankHtml(r) {
  if (!r) return '';
  let trend = '';
  if (r.past) {
    if (r.past > r.rank * 1.15) trend = `<span class="nl-up" title="Up from #${r.past.toLocaleString('en-GB')} in ${r.pastYear}">↑ from #${r.past.toLocaleString('en-GB')} in ${r.pastYear}</span>`;
    else if (r.rank > r.past * 1.15) trend = `<span class="nl-down" title="Down from #${r.past.toLocaleString('en-GB')} in ${r.pastYear}">↓ from #${r.past.toLocaleString('en-GB')} in ${r.pastYear}</span>`;
  } else if (r.pastYear == null) {
    trend = '<span class="nl-up">new</span>';
  }
  return `<span class="nl-rank" title="${r.count ? `${r.count.toLocaleString('en-GB')} ${r.gender === 'girl' ? 'girls' : 'boys'} given this name in England and Wales in ${r.year}` : ''}">#${r.rank.toLocaleString('en-GB')} in ${r.year}${r.gender && r.groupGender === 'any' ? ` (${r.gender}s)` : ''}</span> ${trend}`;
}

function listPage(l, lists, site, refs, helpers) {
  const url = `${BASE}/names/${l.slug}.html`;
  const md = helpers.markdownBold;
  const section = SECTIONS.find(s => s.key === l.section);
  const usesRanks = l.section === 'meanings' || l.section === 'heritage';
  const sources = (l.sources || []).slice();
  const srcIndex = Object.fromEntries(sources.map((s, i) => [s.id, i + 1]));
  let ranked = 0;
  const total = (l.groups || []).reduce((n, g) => n + (g.names || []).length, 0);
  const origins = [...new Set((l.groups || []).flatMap(g => (g.names || []).map(n => n.origin).filter(Boolean)))].sort();
  const genders = [...new Set((l.groups || []).map(g => g.gender).filter(Boolean))];
  const statuses = new Set();

  const groupsHtml = (l.groups || []).map((g, gi) => {
    const items = (g.names || []).map(n => {
      const r = usesRanks ? onsRank(n.name, g.gender) : null;
      if (r) { ranked++; r.groupGender = g.gender; }
      if (n.status) statuses.add(n.status);
      const [label, tip] = STATUS[n.status] || [];
      const cite = srcIndex[n.source] ? ` <sup><a href="#src-${srcIndex[n.source]}">[${srcIndex[n.source]}]</a></sup>` : '';
      const meaning = n.meaning ? `<span class="nl-meaning">“${esc(n.meaning)}”</span>` : '';
      return `<li class="nl-item" data-gender="${esc(g.gender || '')}" data-origin="${esc(n.origin || '')}" data-letter="${esc(n.name.normalize('NFD').charAt(0).toUpperCase())}" data-ranked="${r ? r.rank : ''}">
                        <div class="nl-top"><button type="button" class="name-copy nl-name" title="Copy">${esc(n.name)}</button>${n.pronounce ? ` <span class="nl-say">${esc(n.pronounce)}</span>` : ''}
                        <button type="button" class="save hd tap name-save" data-name="${esc(n.name)}" data-title="${esc(l.title)}" data-slug="" aria-pressed="false" aria-label="Save ${esc(n.name)} to your shortlist"><svg class="ic" aria-hidden="true" focusable="false"><use href="#i-bookmark"/></svg></button></div>
                        <p class="nl-info">${meaning}${n.origin ? ` <span class="nl-origin">${esc(n.origin)}</span>` : ''}${label ? ` <span class="ref-status ref-${n.status}" title="${esc(tip)}">${esc(label)}</span>` : ''}${cite}</p>${n.note ? `\n                        <p class="nl-note">${md(esc(n.note))}</p>` : ''}${r ? `\n                        <p class="nl-stats">${rankHtml(r)}</p>` : ''}
                    </li>`;
    }).join('\n                    ');
    return `
            <section class="section nl-group" id="group-${gi + 1}" data-gender="${esc(g.gender || '')}">
                <h2>${esc(g.heading)} <small>(${(g.names || []).length})</small></h2>${g.intro ? `\n                <p>${md(g.intro)}</p>` : ''}
                <ul class="nl-list">
                    ${items}
                </ul>
            </section>`;
  }).join('');

  if (ranked) sources.push(ONS_SOURCE);
  const gens = (l.generators || []).map(k => site.all.find(g => g.key === k)).filter(Boolean);
  const catOf = (gen) => site.categories.find(c => c.slug === gen.category);
  const refPages = (l.reference || []).map(k => refs.find(r => r.slug === k)).filter(Boolean);
  const related = (l.lists || []).map(k => lists.find(x => x.slug === k)).filter(Boolean);
  const faqs = l.faqs || [];

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Article", "headline": l.title, "description": l.description, "url": url,
        "datePublished": l.published, "dateModified": l.updated || l.published, "inLanguage": "en-GB",
        "author": { "@type": "Person", "name": "Rich", "url": `${BASE}/about.html` },
        "publisher": { "@type": "Organization", "name": "The Name Generators", "url": `${BASE}/` },
        "citation": sources.filter(s => s.url).map(s => s.url) },
      { "@type": "ItemList", "name": l.title, "numberOfItems": total,
        "itemListElement": (l.groups || []).flatMap(g => g.names || []).slice(0, 100).map((n, i) => ({ "@type": "ListItem", "position": i + 1, "name": n.name })) },
      { "@type": "BreadcrumbList", "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE}/` },
        { "@type": "ListItem", "position": 2, "name": "Name lists", "item": `${BASE}/names/` },
        { "@type": "ListItem", "position": 3, "name": l.title, "item": url }] },
      ...(faqs.length ? [{ "@type": "FAQPage", "mainEntity": faqs.map(f => ({ "@type": "Question", "name": helpers.plainText(f.question),
        "acceptedAnswer": { "@type": "Answer", "text": helpers.plainText(f.answer) } })) }] : []),
    ],
  };

  const filters = `
            <form class="nl-filters sheet hd" role="search" aria-label="Filter the list" onsubmit="return false">
                ${genders.length > 1 ? `<div class="nl-f"><span class="nl-fl">Show</span><div class="nl-chips" role="group" aria-label="Gender">
                    <button type="button" class="chip hd tap" data-g="" aria-pressed="true">All</button>${genders.map(g => `<button type="button" class="chip hd tap" data-g="${g}" aria-pressed="false">${GENDER_LABEL[g]}</button>`).join('')}
                </div></div>` : ''}
                <div class="nl-f"><label class="nl-fl" for="nl-q">Search</label><input id="nl-q" class="name-input" type="search" placeholder="Name or meaning" autocomplete="off"></div>
                ${origins.length > 2 ? `<div class="nl-f"><label class="nl-fl" for="nl-origin">Origin</label><select id="nl-origin" class="ck-select"><option value="">Any origin</option>${origins.map(o => `<option>${esc(o)}</option>`).join('')}</select></div>` : ''}
                <div class="nl-f"><label class="nl-fl" for="nl-letter">Starts with</label><select id="nl-letter" class="ck-select"><option value="">Any letter</option>${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(c => `<option>${c}</option>`).join('')}</select></div>
                ${ranked ? `<div class="nl-f nl-check"><label><input type="checkbox" id="nl-top"> Only names in the top 1,000</label></div>` : ''}
                <p class="nl-count" aria-live="polite"><span id="nl-shown">${total}</span> of ${total} names</p>
            </form>`;

  const statusKey = statuses.size ? `
                <ul class="ref-key">${[...statuses].map(s => `<li><span class="ref-status ref-${s}">${STATUS[s][0]}</span> ${esc(STATUS[s][1])}</li>`).join('')}</ul>` : '';

  const body = (l.sections || []).map(s => `
                <h2>${s.heading}</h2>
                ${md(s.content)}`).join('\n');

  const genHtml = gens.length ? `
            <section class="section">
                <h2>Make more like these</h2>
                <div class="genlist">
                    ${gens.map(g => `<a href="../posts/${g.slug}.html" class="gencard hd tap">${layout.doodle(layout.generatorMotif(g, catOf(g)), 'doodle wob')}<div><b>${esc(g.title)}</b><span>${esc(g.description)}</span></div><em aria-hidden="true">→</em></a>`).join('\n                    ')}
                </div>
            </section>` : '';
  const moreHtml = (refPages.length || related.length) ? `
            <section class="section">
                <h2>Read more</h2>
                <ul class="ref-links">
                    ${related.map(x => `<li><a href="${x.slug}.html">${esc(x.title)}</a>: ${esc(x.description)}</li>`).join('\n                    ')}
                    ${refPages.map(r => `<li><a href="../reference/${r.slug}.html">${esc(r.title)}</a> (Naming Library): ${esc(r.description)}</li>`).join('\n                    ')}
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
  const sourcesHtml = sources.length ? `
            <section class="section ref-sources">
                <h2>Sources</h2>
                <ol>
                    ${sources.map((s, i) => `<li id="src-${i + 1}">${s.author ? `${esc(s.author)}, ` : ''}${s.url ? `<a href="${esc(s.url)}" rel="noopener">${esc(s.title)}</a>` : `<cite>${esc(s.title)}</cite>`}${s.publisher ? `, ${esc(s.publisher)}` : ''}${s.year ? ` (${esc(s.year)})` : ''}${s.accessed ? `. Checked ${esc(helpers.longDate(s.accessed))}` : ''}.${s.note ? ` ${esc(s.note)}` : ''}</li>`).join('\n                    ')}
                </ol>
                <p class="ref-note">Spotted a mistake? <a href="../about.html">Tell us</a> and we'll check it and put it right.</p>
            </section>` : '';

  const summary = [`${total} names`];
  if (ranked) summary.push(`${ranked} with their real rank in England and Wales`);
  if (statuses.has('attested')) summary.push('every meaning checked against the sources below');

  return `${head({ title: l.seoTitle || `${l.title} | The Name Generators`, desc: l.description, url, schema, helpers })}
<body>
    ${layout.svgSprite([...gens.map(g => layout.generatorMotif(g, catOf(g))), l.motif || 'name-list'])}
    ${layout.siteHeader('../', site.categories)}

    <div class="wrap layout">
        <main id="main" class="namelist">
            <nav class="crumb" aria-label="Breadcrumb"><a href="../index.html">Home</a> / <a href="index.html">Name lists</a> / <span aria-current="page">${esc(l.title)}</span></nav>
            <p class="eyebrow">${esc(section ? section.name : 'Name lists')}</p>
            <div class="titlerow">
                <h1>${esc(l.title)}</h1>
                ${layout.doodle(l.motif || 'name-list')}
            </div>
            <div class="lede">${md(l.intro)}</div>
            <p class="byline">By <a href="../about.html">Rich</a> · ${helpers.longDate(l.updated || l.published)} · ${summary.join(' · ')}</p>
            ${filters}${statusKey}
            ${groupsHtml}
            <p class="nl-none" hidden>No names match. Try a different letter or origin.</p>
            <article class="section article">${body}
            </article>${genHtml}${moreHtml}${faqHtml}${sourcesHtml}
        </main>
        <aside class="side" aria-label="Sidebar"></aside>
    </div>

    ${layout.siteFooter('../')}
    ${layout.bodyScripts('../')}
    <script src="${layout.asset('../', 'lib/lists.js')}"></script>
</body>
</html>`;
}

function listIndex(lists, site, helpers) {
  const url = `${BASE}/names/`;
  const title = 'Name Lists: Names by Meaning, Heritage, Pets and Fantasy | The Name Generators';
  const desc = 'Browsable lists of names with checked meanings and real popularity: names that mean moon, light or fire, Welsh and Old Norse names, dog and cat names.';
  const schema = { "@context": "https://schema.org", "@type": "CollectionPage", "name": "Name lists", "description": desc, "url": url,
    "mainEntity": { "@type": "ItemList", "itemListElement": lists.map((l, i) => ({ "@type": "ListItem", "position": i + 1, "name": l.title, "url": `${BASE}/names/${l.slug}.html` })) } };
  const groups = SECTIONS.map(s => ({ ...s, items: lists.filter(l => l.section === s.key) })).filter(s => s.items.length);
  return `${head({ title, desc, url, schema, helpers })}
<body>
    ${layout.svgSprite([...new Set(lists.map(l => l.motif || 'name-list'))])}
    ${layout.siteHeader('../', site.categories)}

    <div class="wrap layout">
        <main id="main">
            <nav class="crumb" aria-label="Breadcrumb"><a href="../index.html">Home</a> / <span aria-current="page">Name lists</span></nav>
            <div class="titlerow">
                <h1>Name <span class="hl">Lists</span></h1>
            </div>
            <p class="lede">Big lists of real names you can filter and save. Meanings are checked against named sources, popularity comes from the Office for National Statistics, and anything disputed is marked as disputed.</p>
            ${groups.map(g => `<section class="section">
                <h2>${esc(g.name)}</h2>
                <p>${esc(g.line)}</p>
                <div class="genlist">
                    ${g.items.map(l => `<a href="${l.slug}.html" class="gencard hd tap">${layout.doodle(l.motif || 'name-list', 'doodle wob')}<div><b>${esc(l.title)}</b><span>${esc(l.description)}</span></div><em aria-hidden="true">→</em></a>`).join('\n                    ')}
                </div>
            </section>`).join('\n            ')}
        </main>
        <aside class="side" aria-label="Sidebar"></aside>
    </div>

    ${layout.siteFooter('../')}
    ${layout.bodyScripts('../')}
</body>
</html>`;
}

function buildLists(site, refs, helpers) {
  const lists = loadLists();
  const dir = path.join(__dirname, '..', 'names');
  if (!lists.length) return lists;
  fs.mkdirSync(dir, { recursive: true });
  for (const l of lists) fs.writeFileSync(path.join(dir, `${l.slug}.html`), layout.stampAssets(listPage(l, lists, site, refs, helpers)));
  for (const f of fs.readdirSync(dir)) {
    if (f !== 'index.html' && !lists.some(l => `${l.slug}.html` === f)) fs.unlinkSync(path.join(dir, f));
  }
  fs.writeFileSync(path.join(dir, 'index.html'), layout.stampAssets(listIndex(lists, site, helpers)));
  console.log(`  ✅ Created: names/index.html and ${lists.length} name list pages`);
  return lists;
}

module.exports = { loadLists, validateLists, listsFor, generatorBox, buildLists, onsRank, SECTIONS };
