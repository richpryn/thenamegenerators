/**
 * The Name Element Finder (reference/name-elements.html): a searchable table
 * of the word parts real names are built from (Old English wulf 'wolf',
 * Welsh aber 'river mouth' and so on), each with its sources.
 *
 * Data: content/name-elements/*.json, one file per language group, each
 * { sources: [...], elements: [...] } (see content/name-elements/README.md).
 * Every row is in the HTML, so the page reads fully without JavaScript;
 * lib/elements.js adds the search and filters.
 */
const fs = require('fs');
const path = require('path');
const layout = require('./layout');

const DIR = path.join(__dirname, '..', 'content', 'name-elements');
const BASE = 'https://thenamegenerators.com';
const SLUG = 'name-elements';

const LANGUAGES = ['Old English', 'Old Norse', 'Welsh', 'Cornish', 'Scottish Gaelic', 'Irish', 'Latin', 'Ancient Greek',
  'Old High German', 'Frankish', 'Old French'];
// BCP 47 codes for the lang attribute on each headword (screen readers and search engines)
const LANG_CODE = { 'Old English': 'ang', 'Old Norse': 'non', 'Welsh': 'cy', 'Cornish': 'kw', 'Scottish Gaelic': 'gd', 'Irish': 'ga',
  'Latin': 'la', 'Ancient Greek': 'grc', 'Old High German': 'goh', 'Frankish': 'frk', 'Old French': 'fro' };
const USES = { given: 'First names', place: 'Place names', surname: 'Surnames' };
const ELEMENT_STATUS = { attested: ['Recorded', 'The word and its meaning are recorded in dictionaries of the language.'],
  uncertain: ['Uncertain', 'Scholars disagree about the meaning, or it is unproven.'] };
const TAGS = ('wolf bear eagle raven boar horse deer dragon bird animal stone tree oak ash wood water river sea lake marsh spring hill mountain ' +
  'valley island field meadow rock light bright sun moon star fire ice storm noble brave strong hard wise famous fair beloved great small old new ' +
  'young glory white black red green grey gold colour battle war spear sword shield helmet army victory warrior king ruler lord guardian ' +
  'protection peace wealth friend people home gift counsel will power god elf holy magic church farm settlement fort town ford bay harbour ' +
  'enclosure clearing road bridge headland mouth son daughter family nickname occupation').split(' ');
// Meanings offered as one-tap chips above the table (only those with entries are shown).
const CHIPS = ['wolf', 'bear', 'raven', 'eagle', 'dragon', 'stone', 'river', 'sea', 'hill', 'valley', 'island', 'bright', 'fire',
  'noble', 'brave', 'famous', 'battle', 'spear', 'victory', 'king', 'guardian', 'peace', 'god', 'elf', 'fort', 'farm', 'church'];

function escapeHtml(text) {
  return String(text == null ? '' : text)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

/** All groups merged: { elements, sources, files } with per-file source ids kept. */
function loadElements() {
  const out = { elements: [], sources: [], files: [] };
  if (!fs.existsSync(DIR)) return out;
  const seen = new Map();
  for (const f of fs.readdirSync(DIR).filter(f => f.endsWith('.json') && f !== 'meta.json').sort()) {
    const data = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
    out.files.push(f);
    for (const s of data.sources || []) {
      if (seen.has(s.id)) { const prev = seen.get(s.id); if (prev.url !== s.url || prev.title !== s.title) s._clash = f; continue; }
      seen.set(s.id, s);
      out.sources.push({ ...s, _file: f });
    }
    for (const e of data.elements || []) out.elements.push({ ...e, _file: f });
  }
  const order = (l) => { const i = LANGUAGES.indexOf(l); return i < 0 ? 99 : i; };
  const key = (e) => e.element.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/^[-–]/, '').toLowerCase();
  out.elements.sort((a, b) => order(a.language) - order(b.language) || key(a).localeCompare(key(b)));
  return out;
}

function validateElements(data, generators, refSlugs) {
  const errors = [];
  const ids = new Set();
  const sourceIds = new Set(data.sources.map(s => s.id));
  for (const f of data.files) {
    const raw = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
    for (const s of raw.sources || []) {
      if (!s.id || !s.title) errors.push(`name-elements/${f}: every source needs "id" and "title"`);
      if (s._clash) errors.push(`name-elements/${f}: source id "${s.id}" is used for two different sources`);
    }
    const dup = (raw.sources || []).map(s => s.id).filter((id, i, a) => a.indexOf(id) !== i);
    for (const d of new Set(dup)) errors.push(`name-elements/${f}: source id "${d}" appears twice`);
  }
  for (const e of data.elements) {
    const at = `name-elements/${e._file}: "${e.id || e.element}"`;
    if (!e.id || !/^[a-z]+-[a-z0-9-]+$/.test(e.id)) errors.push(`${at}: needs an id like "oe-wulf"`);
    else if (ids.has(e.id)) errors.push(`${at}: id is used twice`); else ids.add(e.id);
    for (const k of ['element', 'language', 'meaning', 'status']) if (!e[k]) errors.push(`${at}: needs "${k}"`);
    if (e.language && !LANGUAGES.includes(e.language)) errors.push(`${at}: unknown language "${e.language}"`);
    if (!Array.isArray(e.use) || !e.use.length || e.use.some(u => !USES[u])) errors.push(`${at}: "use" must list given, place and/or surname`);
    if (!Array.isArray(e.tags) || !e.tags.length) errors.push(`${at}: needs at least one tag`);
    for (const t of e.tags || []) if (!TAGS.includes(t)) errors.push(`${at}: unknown tag "${t}"`);
    if (e.status && !ELEMENT_STATUS[e.status]) errors.push(`${at}: status must be attested or uncertain`);
    if (e.status === 'uncertain' && !e.note) errors.push(`${at}: an uncertain element needs a note saying why`);
    if (!(e.sources || []).length) errors.push(`${at}: needs at least one source`);
    for (const s of e.sources || []) if (!sourceIds.has(s)) errors.push(`${at}: source "${s}" isn't listed`);
    for (const x of e.examples || []) {
      if (!x.name) errors.push(`${at}: an example has no name`);
      if (x.source && !sourceIds.has(x.source)) errors.push(`${at}: example "${x.name}" cites "${x.source}", which isn't listed`);
    }
    if (e.page && !refSlugs.has(e.page)) errors.push(`${at}: Library page "${e.page}" doesn't exist`);
    for (const k of e.generators || []) if (!generators[k]) errors.push(`${at}: generator "${k}" doesn't exist`);
  }
  return errors;
}

/** Generator keys that the finder has elements for. */
function generatorKeys(data) {
  return new Set(data.elements.flatMap(e => e.generators || []));
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

function page(data, site, records, helpers, { published, updated }) {
  const url = `${BASE}/reference/${SLUG}.html`;
  const n = data.elements.length;
  const langs = LANGUAGES.filter(l => data.elements.some(e => e.language === l));
  const title = 'Name Element Finder: Search Name Meanings by Word | The Name Generators';
  const desc = `Search ${n} sourced name elements by meaning (wolf, river, king) across ${langs.length} languages, from Old English and Old Norse to Welsh, Latin and Greek.`;
  const srcIndex = Object.fromEntries(data.sources.map((s, i) => [s.id, i + 1]));
  const refBySlug = Object.fromEntries(records.map(r => [r.slug, r]));
  const genByKey = Object.fromEntries(site.all.map(g => [g.key, g]));
  const tagCount = {};
  data.elements.forEach(e => (e.tags || []).forEach(t => { tagCount[t] = (tagCount[t] || 0) + 1; }));
  const chips = CHIPS.filter(t => tagCount[t]);
  const sup = (ids) => (ids || []).filter(id => srcIndex[id]).map(id => `<a href="#src-${srcIndex[id]}">[${srcIndex[id]}]</a>`).join('');

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "DefinedTermSet", "name": "Name Element Finder", "description": desc, "url": url, "inLanguage": "en-GB",
        "isPartOf": { "@type": "CollectionPage", "name": "The Naming Library", "url": `${BASE}/reference/` },
        "author": { "@type": "Person", "name": "Rich", "url": `${BASE}/about.html` },
        "dateModified": updated,
        "hasDefinedTerm": data.elements.map(e => ({ "@type": "DefinedTerm", "name": e.element, "description": `${e.language}: ${e.meaning}`,
          "url": `${url}#el-${e.id}`, "inLanguage": e.language })) },
      { "@type": "BreadcrumbList", "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE}/` },
        { "@type": "ListItem", "position": 2, "name": "Naming Library", "item": `${BASE}/reference/` },
        { "@type": "ListItem", "position": 3, "name": "Name Element Finder", "item": url }] },
    ],
  };

  const row = (e) => {
    const forms = (e.forms || []).filter(f => f.replace(/-/g, '').toLowerCase() !== e.element.replace(/-/g, '').toLowerCase());
    const examples = (e.examples || []).slice(0, 3).map(x =>
      `<li><b>${escapeHtml(x.name)}</b>${x.parts ? ` <span class="el-parts">${escapeHtml(x.parts)}</span>` : ''}${x.gloss ? ` <span class="el-gloss">'${escapeHtml(x.gloss)}'</span>` : ''}${x.source ? `<sup>${sup([x.source])}</sup>` : ''}</li>`).join('');
    const links = [
      e.page && refBySlug[e.page] ? `<a href="${e.page}.html">${escapeHtml(refBySlug[e.page].title)}</a>` : '',
      ...(e.generators || []).filter(k => genByKey[k]).slice(0, 2).map(k => `<a href="../posts/${genByKey[k].slug}.html">${escapeHtml(genByKey[k].title)}</a>`),
    ].filter(Boolean).join(' · ');
    const text = [e.element, ...(e.forms || []), e.meaning, e.note, e.language, ...(e.tags || []), ...(e.examples || []).map(x => `${x.name} ${x.gloss || ''}`)].join(' ');
    return `<tr class="el-row" id="el-${e.id}" data-lang="${escapeHtml(e.language)}" data-use="${(e.use || []).join(' ')}" data-tags="${(e.tags || []).join(' ')}" data-text="${escapeHtml(text)}">
                        <th scope="row" class="el-c-el"><b lang="${LANG_CODE[e.language] || 'und'}">${escapeHtml(e.element)}</b>${forms.length ? `<span class="el-forms">${escapeHtml(forms.join(', '))}</span>` : ''}</th>
                        <td class="el-c-mean"><span class="el-meaning">'${escapeHtml(e.meaning)}'</span>${e.status === 'uncertain' ? ` <span class="ref-status ref-uncertain" title="${escapeHtml(ELEMENT_STATUS.uncertain[1])}">Uncertain</span>` : ''}<sup>${sup(e.sources)}</sup>${e.note ? `<span class="el-note">${escapeHtml(e.note)}</span>` : ''}${links ? `<span class="el-links">${links}</span>` : ''}</td>
                        <td class="el-c-ex">${examples ? `<ul>${examples}</ul>` : ''}</td>
                        <td class="el-c-lang">${escapeHtml(e.language)}<span>${(e.use || []).map(u => USES[u]).join(', ')}</span></td>
                    </tr>`;
  };

  const filters = `
            <form class="nl-filters el-filters sheet hd" role="search" aria-label="Search name elements" onsubmit="return false">
                <div class="nl-f el-f-q"><label class="nl-fl" for="el-q">Meaning or word</label><input id="el-q" class="name-input" type="search" placeholder="Try wolf, river or king" autocomplete="off"></div>
                <div class="nl-f"><label class="nl-fl" for="el-lang">Language</label><select id="el-lang" class="ck-select"><option value="">All languages</option>${langs.map(l => `<option>${escapeHtml(l)}</option>`).join('')}</select></div>
                <div class="nl-f"><label class="nl-fl" for="el-use">Used in</label><select id="el-use" class="ck-select"><option value="">Any kind of name</option>${Object.entries(USES).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></div>
                <div class="nl-f el-f-chips"><span class="nl-fl">Popular meanings</span><div class="nl-chips" role="group" aria-label="Popular meanings">
                    ${chips.map(t => `<button type="button" class="chip hd tap" data-tag="${t}" aria-pressed="false">${t}</button>`).join('')}
                </div></div>
                <p class="nl-count" aria-live="polite"><span id="el-shown">${n}</span> of ${n} elements</p>
            </form>`;

  const faqs = [
    { q: 'What is a name element?', a: 'A name element is a word or word part that names are built from. Old English names usually join two of them, so Æthelwulf is æþel \'noble\' plus wulf \'wolf\'. Place names work the same way: Oxford is \'ford used by oxen\'.' },
    { q: 'If I join two elements, is the result a real historical name?', a: 'Not necessarily. A pair of genuine elements makes a name that is built from real parts, but unless it turns up in the records it was never actually used. Our Library labels names like that as Built from real parts, not Recorded.' },
    { q: 'Why do some elements say Uncertain?', a: 'Scholars don\'t always agree on what an old word meant, or whether a name really contains it. Where they disagree we say so, rather than pick the most exciting meaning.' },
    { q: 'Do names mean what their elements mean?', a: 'Rarely in a literal way. Early names were often made by passing elements down a family, so a child called Wulfstan was not thought of as a \'wolf stone\'. The meaning tells you where the parts came from, not what the parents intended.' },
  ];

  const sourcesHtml = `
            <section class="section ref-sources">
                <h2>Sources</h2>
                <p>Every element above is checked against at least one of these ${data.sources.length} dictionary entries and scholarly pages. The numbers in the table link to them.</p>
                <details class="el-sources"><summary>Show all ${data.sources.length} sources</summary>
                <ol>
                    ${data.sources.map((s, i) => `<li id="src-${i + 1}">${s.author ? `${escapeHtml(s.author)}, ` : ''}${s.url ? `<a href="${escapeHtml(s.url)}" rel="noopener">${escapeHtml(s.title)}</a>` : `<cite>${escapeHtml(s.title)}</cite>`}${s.publisher ? `, ${escapeHtml(s.publisher)}` : ''}${s.year ? ` (${escapeHtml(s.year)})` : ''}${s.accessed ? `. Checked ${escapeHtml(helpers.longDate(s.accessed))}` : ''}.</li>`).join('\n                    ')}
                </ol>
                </details>
                <p class="ref-note">Spotted a mistake? <a href="../about.html">Tell us</a> and we'll check it and put it right.</p>
            </section>`;

  const relatedSlugs = ['name-prefixes-and-suffixes', 'old-english-names', 'old-norse-names', 'welsh-names', 'english-place-name-elements', 'roman-names'];
  const related = relatedSlugs.map(s => refBySlug[s]).filter(Boolean);

  return `${head({ title, desc, url, schema, helpers })}
<body>
    ${layout.svgSprite(['signpost', 'library'])}
    ${layout.siteHeader('../', site.categories)}

    <div class="wrap layout el-layout">
        <main id="main">
            <nav class="crumb" aria-label="Breadcrumb"><a href="../index.html">Home</a> / <a href="index.html">Naming Library</a> / <span aria-current="page">Name Element Finder</span></nav>
            <article class="guide reference">
                <p class="eyebrow">How names are built</p>
                <div class="titlerow">
                    <h1>Name Element <span class="hl">Finder</span></h1>
                    ${layout.doodle('signpost')}
                </div>
                <div class="ref-glance hd">
                    <h2>At a glance</h2>
                    <p>Search ${n} word parts that real names are built from, in ${langs.length} languages. Type a meaning such as <i>wolf</i>, <i>river</i> or <i>king</i> to see how Old English, Old Norse, Welsh, Gaelic, Latin, Greek and Germanic names said it. Every entry cites a dictionary or scholarly source.</p>
                </div>
                <p class="byline">By Rich · ${helpers.longDate(updated)} · ${data.sources.length} sources</p>
            </article>
${filters}
            <div class="ref-table-wrap el-wrap"><table class="ref-table el-table">
                <thead><tr><th scope="col">Element</th><th scope="col">Meaning</th><th scope="col">Found in</th><th scope="col">Language</th></tr></thead>
                <tbody>
                    ${data.elements.map(row).join('\n                    ')}
                </tbody>
            </table></div>
            <p class="nl-none" hidden>No elements match. Try a broader meaning, such as <i>water</i> instead of <i>brook</i>.</p>

            <section class="section article">
                <h2>Using elements to make a name</h2>
                <p>Most early Germanic names, including Old English and Old Norse ones, join two elements: a first part such as æþel 'noble' or Þór 'Thor', and a second such as wulf 'wolf' or steinn 'stone'. Place names add a description to a landscape word, so a ford, a hill or a farm gets a name from who owned it or what grew there.</p>
                <p>To build your own, pick elements from one language, so the name sounds of a piece, and check the forms column for how a word changes inside a name. A name you build this way is <b>built from real parts</b>, not recorded, unless you find it in the sources. Our <a href="name-prefixes-and-suffixes.html">guide to prefixes and suffixes</a> explains the patterns, and the <a href="name-builder.html">Name Builder</a> joins elements for you.</p>
            </section>

            <section class="section">
                <h2>Related in the Naming Library</h2>
                <ul class="ref-links">
                    ${related.map(x => `<li><a href="${x.slug}.html">${escapeHtml(x.title)}</a>: ${escapeHtml(x.description)}</li>`).join('\n                    ')}
                </ul>
            </section>

            <section class="section faq-section">
                <h2>Frequently Asked Questions</h2>
                <div class="faq">
                    ${faqs.map(f => `<details>
                        <summary><span class="tg hd" aria-hidden="true">+</span>${escapeHtml(f.q)}</summary>
                        <div><p>${escapeHtml(f.a)}</p></div>
                    </details>`).join('\n                    ')}
                </div>
            </section>${sourcesHtml}
        </main>
    </div>

    ${layout.siteFooter('../')}
    ${layout.bodyScripts('../')}
    <script src="${layout.asset('../', 'lib/elements.js')}"></script>
</body>
</html>`;
}

/** Published and updated dates, from content/name-elements/meta.json. */
function dates() {
  const file = path.join(DIR, 'meta.json');
  const meta = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  return { published: meta.published || '2026-11-17', updated: meta.updated || meta.published || '2026-11-17' };
}

/** Writes reference/name-elements.html. Returns { count, published, updated } or null. */
function buildElements(site, records, helpers) {
  const data = loadElements();
  if (!data.elements.length) return null;
  const d = dates();
  fs.writeFileSync(path.join(__dirname, '..', 'reference', `${SLUG}.html`), layout.stampAssets(page(data, site, records, helpers, d)));
  console.log(`  ✅ Created: reference/${SLUG}.html (${data.elements.length} name elements)`);
  return { count: data.elements.length, languages: new Set(data.elements.map(e => e.language)).size, ...d };
}

module.exports = { loadElements, validateElements, generatorKeys, buildElements, dates, SLUG, TAGS, LANGUAGES };
