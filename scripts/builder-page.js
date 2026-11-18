/**
 * The Name Builder (reference/name-builder.html): pick a language and the
 * meanings you want, and it joins two real, sourced name elements into a
 * name, the way Old English, Old Norse, Germanic and Greek names were made.
 * Every name says what its parts mean, links each part to the Name Element
 * Finder, and is labelled Recorded when it matches a name in our sources, or
 * Built from real parts when it doesn't.
 *
 * Data: content/name-builder.json (joining forms, by element id). The parts'
 * meanings and sources come from content/name-elements/. lib/builder.js runs
 * the page; the examples in the HTML are built here, so the page reads
 * without JavaScript.
 */
const fs = require('fs');
const path = require('path');
const layout = require('./layout');
const Elements = require('./elements-page');

const FILE = path.join(__dirname, '..', 'content', 'name-builder.json');
const BASE = 'https://thenamegenerators.com';
const SLUG = 'name-builder';
const VOWELS = 'aeiouyæAEIOUYÆ';

function esc(text) {
  return String(text == null ? '' : text)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function load() {
  return fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, 'utf8')) : null;
}

/** Two forms joined; a vowel meeting a vowel, or a letter meeting itself, drops the first (Ingi + olf = Ingolf, Os + stan = Ostan). */
function join(first, second) {
  const end = first.slice(-1).toLowerCase();
  const a = (VOWELS.includes(end) && VOWELS.includes(second[0])) || end === second[0].toLowerCase() ? first.slice(0, -1) : first;
  return a + second;
}

/** A spelling key for matching built names to recorded ones: Þorsteinn, Thorstein and Thorsteinn all match. */
function norm(name) {
  return String(name).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/æ/g, 'ae').replace(/[þð]/g, 'th').replace(/ǫ/g, 'o').replace(/[^a-z]/g, '')
    .replace(/r$/, '').replace(/(nn|ll)$/, (m) => m[0]);
}

function validate(generators) {
  const errors = [];
  const b = load();
  if (!b) return errors;
  const ids = new Set(Elements.loadElements().elements.map(e => e.id));
  for (const l of b.languages || []) {
    for (const kind of ['people', 'places']) {
      const s = l[kind];
      if (!s) continue;
      for (const part of ['first', 'second']) {
        for (const row of s[part] || []) {
          const [id, form, gender] = row;
          const at = `name-builder.json: ${l.name} ${kind} ${part} "${form}"`;
          if (!ids.has(id)) errors.push(`${at}: element "${id}" isn't in content/name-elements/`);
          if (!form || /\s/.test(form)) errors.push(`${at}: needs a one-word form`);
          if (kind === 'people' && part === 'second' && !['m', 'f'].includes(gender)) errors.push(`${at}: needs gender "m" or "f"`);
        }
      }
    }
  }
  void generators;
  return errors;
}

/** Everything the page script needs, small: parts with meanings, and recorded names to match. */
function pageData(b, data, records) {
  const byId = Object.fromEntries(data.elements.map(e => [e.id, e]));
  const part = ([id, form, gender]) => {
    const e = byId[id];
    return { id, f: form, g: gender || '', m: e.meaning.split(/[;,]/)[0].trim(), e: e.element, t: e.tags || [] };
  };
  const recorded = {};
  const add = (name, where) => { const k = norm(name); if (k && !recorded[k]) recorded[k] = { n: name, w: where }; };
  for (const e of data.elements) for (const x of e.examples || []) add(x.name, `name-elements.html#el-${e.id}`);
  for (const r of records) for (const x of r.examples || []) if (['attested', 'reconstructed'].includes(x.status)) add(x.name.split(/[ ,(]/)[0], `${r.slug}.html`);
  return {
    langs: b.languages.map(l => ({
      key: l.key, name: l.name, spelling: l.spelling || '',
      people: l.people ? { first: l.people.first.map(part), second: l.people.second.map(part) } : null,
      places: l.places ? { first: l.places.first.map(part), second: l.places.second.map(part) } : null,
    })),
    recorded,
  };
}

/** A few built names per language and kind for the HTML, the same every build. */
function examples(pd) {
  let seed = 7;
  const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const out = [];
  for (const l of pd.langs) {
    for (const kind of ['people', 'places']) {
      const s = l[kind];
      if (!s) continue;
      const names = [];
      const seen = new Set();
      for (let i = 0; i < 200 && names.length < 6; i++) {
        const a = s.first[Math.floor(rand() * s.first.length)];
        const b = s.second[Math.floor(rand() * s.second.length)];
        if (a.id === b.id) continue;
        const name = join(a.f, b.f);
        if (seen.has(name)) continue;
        seen.add(name);
        names.push({ name, a, b, rec: pd.recorded[norm(name)] });
      }
      out.push({ lang: l.name, kind, names });
    }
  }
  return out;
}

function head(helpers, title, desc, url, schema) {
  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(desc)}">
    <meta name="author" content="Rich">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
    <link rel="canonical" href="${url}">
    <script type="application/ld+json">
${helpers.scriptJson(schema, 2)}
    </script>
    <meta property="og:type" content="website">
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

function resultItem(x) {
  const label = x.rec ? '<span class="prov prov-recorded" title="This name is found in our sources.">Recorded</span>'
    : '<span class="prov prov-derived" title="Both parts are real; this exact name may or may not appear in the records.">Built from real parts</span>';
  return `<li class="nb-item"><span class="nb-name">${esc(x.name)}</span> ${label}<span class="nb-parts"><a href="name-elements.html#el-${x.a.id}">${esc(x.a.e)}</a> '${esc(x.a.m)}' + <a href="name-elements.html#el-${x.b.id}">${esc(x.b.e)}</a> '${esc(x.b.m)}'</span></li>`;
}

function page(site, records, helpers, b, pd, dates) {
  const url = `${BASE}/reference/${SLUG}.html`;
  const title = 'Name Builder: Make a Name From Real Old English, Norse and Greek Parts';
  const desc = 'Pick a language and the meanings you want, and build a name from two real, sourced name elements, the way Anglo-Saxons, Vikings and Greeks did.';
  const ex = examples(pd);
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebApplication', name: 'Name Builder', url, description: desc, applicationCategory: 'ReferenceApplication',
        operatingSystem: 'Any', isAccessibleForFree: true, inLanguage: 'en-GB', offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' },
        isPartOf: { '@type': 'CollectionPage', name: 'The Naming Library', url: `${BASE}/reference/` },
        author: { '@type': 'Person', name: 'Rich', url: `${BASE}/about.html` }, dateModified: dates.updated },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/` },
        { '@type': 'ListItem', position: 2, name: 'Naming Library', item: `${BASE}/reference/` },
        { '@type': 'ListItem', position: 3, name: 'Name Builder', item: url }] },
    ],
  };
  const count = pd.langs.reduce((n, l) => n + ['people', 'places'].reduce((m, k) => m + (l[k] ? l[k].first.length + l[k].second.length : 0), 0), 0);

  return `${head(helpers, title, desc, url, schema)}
<body>
    ${layout.svgSprite(['signpost', 'quill'])}
    ${layout.siteHeader('../', site.categories)}

    <div class="wrap layout">
        <main id="main">
            <nav class="crumb" aria-label="Breadcrumb"><a href="../index.html">Home</a> / <a href="index.html">Naming Library</a> / <span aria-current="page">Name Builder</span></nav>
            <article class="guide reference">
                <p class="eyebrow">How names are built</p>
                <div class="titlerow">
                    <h1>Name <span class="hl">Builder</span></h1>
                    ${layout.doodle('quill')}
                </div>
                <div class="ref-glance hd">
                    <h2>At a glance</h2>
                    <p>Anglo-Saxons, Vikings, Franks and Greeks made many names by joining two meaningful words: Æthelwulf is 'noble' + 'wolf', Theodorus is 'god' + 'gift'. Choose a language and the meanings you want, and this builds names the same way from ${count} real, sourced parts. Each name shows what its parts mean, and says whether it is <b>Recorded</b> in our sources or <b>Built from real parts</b>.</p>
                </div>
                <p class="byline">By Rich · ${helpers.longDate(dates.updated)}</p>
            </article>

            <form class="nl-filters nb-form sheet hd" id="nb-form" aria-label="Build a name" onsubmit="return false">
                <div class="nl-f"><label class="nl-fl" for="nb-lang">Language</label><select id="nb-lang" class="ck-select">${pd.langs.map(l => `<option value="${l.key}">${esc(l.name)}</option>`).join('')}</select></div>
                <div class="nl-f"><label class="nl-fl" for="nb-kind">Make a</label><select id="nb-kind" class="ck-select"><option value="people">Person's name</option><option value="places">Place name</option></select></div>
                <div class="nl-f" id="nb-gender-f"><label class="nl-fl" for="nb-gender">For</label><select id="nb-gender" class="ck-select"><option value="">Anyone</option><option value="m">A man</option><option value="f">A woman</option></select></div>
                <div class="nl-f"><label class="nl-fl" for="nb-a">First part means</label><select id="nb-a" class="ck-select"><option value="">Anything</option></select></div>
                <div class="nl-f"><label class="nl-fl" for="nb-b">Second part means</label><select id="nb-b" class="ck-select"><option value="">Anything</option></select></div>
                <div class="nl-f nb-go"><button type="button" class="go hi hd tap" id="nb-build">Build names →</button></div>
                <p class="nl-count nb-note" id="nb-note" aria-live="polite"></p>
            </form>
            <div id="nb-results" class="nb-results" aria-live="polite">
                ${ex.slice(0, 1).map(g => `<ul class="nb-list">${g.names.map(resultItem).join('')}</ul>`).join('')}
            </div>
            <p class="nb-key"><span class="prov prov-recorded">Recorded</span> found in the sources behind our <a href="name-elements.html">Name Element Finder</a> and Library pages. <span class="prov prov-derived">Built from real parts</span> both parts are real and the joining follows the old pattern, but we haven't found this exact name in the records. Tap a name to copy it.</p>

            <section class="section article">
                <h2>How the builder works</h2>
                <p>Early Germanic names usually had two parts, and the second part showed whether the name was a man's or a woman's: Old English <i>-wulf</i> and <i>-stan</i> for men, <i>-gifu</i> and <i>-hild</i> for women. Greek names worked the same way with endings such as <i>-dorus</i> and <i>-dora</i>. The builder keeps to those patterns, uses only parts from the language you choose, and never repeats a part in one name.</p>
                <p>Place names join a description to a word for a farm, a hill, a ford or a valley, so Old English <i>æsc</i> 'ash tree' and <i>ford</i> give a name like Ashford. Many of the results are, or sound like, real places; check before you use one in a story set in the real world.</p>
                <p>Parents didn't usually pick names for their literal meaning: they passed parts down families, so a boy called Wulfstan wasn't thought of as a 'wolf stone'. The meanings tell you what the parts are, not what anyone intended.</p>
                ${pd.langs.filter(l => l.spelling).map(l => `<p><b>${esc(l.name)}:</b> ${esc(l.spelling)}</p>`).join('\n                ')}
            </section>

            <section class="section">
                <h2>Examples</h2>
                <div class="nb-ex">
                ${ex.map(g => `<div class="exbox hd"><h3>${esc(g.lang)}, ${g.kind === 'people' ? 'people' : 'places'}</h3><ul class="nb-list">${g.names.map(resultItem).join('')}</ul></div>`).join('\n                ')}
                </div>
            </section>

            <section class="section">
                <h2>Related</h2>
                <ul class="ref-links">
                    <li><a href="name-elements.html">Name Element Finder</a>: every part used here, with its meaning and sources.</li>
                    ${['name-prefixes-and-suffixes', 'old-english-names', 'old-norse-names', 'english-place-name-elements'].map(s => records.find(r => r.slug === s)).filter(Boolean).map(r => `<li><a href="${r.slug}.html">${esc(r.title)}</a>: ${esc(r.description)}</li>`).join('\n                    ')}
                    <li><a href="../worldbuilders-naming-toolkit.html">The Worldbuilder's Naming Toolkit</a>: use built names to give a fictional culture a consistent sound.</li>
                </ul>
            </section>
        </main>
    </div>

    ${layout.siteFooter('../')}
    ${layout.bodyScripts('../')}
    <script type="application/json" id="nb-data">${helpers.scriptJson(pd)}</script>
    <script src="${layout.asset('../', 'lib/builder.js')}"></script>
</body>
</html>`;
}

function buildBuilder(site, records, helpers) {
  const b = load();
  if (!b) return null;
  const pd = pageData(b, Elements.loadElements(), records);
  fs.writeFileSync(path.join(__dirname, '..', 'reference', `${SLUG}.html`), layout.stampAssets(page(site, records, helpers, b, pd, b)));
  console.log(`  ✅ Created: reference/${SLUG}.html`);
  return b;
}

function dates() {
  const b = load() || {};
  return { published: b.published || '2026-11-18', updated: b.updated || b.published || '2026-11-18' };
}

module.exports = { buildBuilder, validate, dates, join, norm, SLUG };
