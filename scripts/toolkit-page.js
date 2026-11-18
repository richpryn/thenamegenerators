/**
 * The Worldbuilder's Naming Toolkit (worldbuilders-naming-toolkit.html): a
 * step-by-step method for naming a fictional world, linking the generators,
 * the Naming Library and the Name Element Finder for each step, with a
 * printable worksheet. A flagship page for writers, Dungeon Masters and
 * worldbuilders to link to.
 */
const fs = require('fs');
const path = require('path');
const layout = require('./layout');

const BASE = 'https://thenamegenerators.com';
const SLUG = 'worldbuilders-naming-toolkit';
const PUBLISHED = '2026-11-18';
const UPDATED = '2026-11-18';

function esc(text) {
  return String(text == null ? '' : text)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// The steps. Each names the Library pages and generators that help with it.
const STEPS = [
  {
    id: 'sound',
    title: 'Give each culture its own sound',
    lead: 'Before naming anything, decide what each people\'s names sound like. Readers can\'t learn your languages, but they notice patterns, and a steady pattern tells them two names belong to the same place.',
    body: `<p>Pick a small set of sounds for each culture and stick to it. Three choices do most of the work:</p>
                <ul>
                    <li><b>Letters:</b> a handful of favourite consonants, and one or two you never use. Hard sounds (k, g, r, d) feel blunt; soft ones (l, n, s, v) feel smooth.</li>
                    <li><b>Syllable shape:</b> short, closed syllables (Brakk, Dorn) or long, open ones (Elaria, Somevi).</li>
                    <li><b>Endings:</b> two or three endings that keep coming back, the way English place names keep ending in -ton and -ham.</li>
                </ul>
                <p>Write the choices down in the worksheet below. The table shows how far two short sound lists can pull names apart.</p>
                <div class="ref-table-wrap"><table class="ref-table">
                    <thead><tr><th scope="col"></th><th scope="col">Hill clans</th><th scope="col">River towns</th></tr></thead>
                    <tbody>
                        <tr><th scope="row">Favourite letters</th><td>k, g, r, d, short a and u</td><td>l, n, s, v, long e and i</td></tr>
                        <tr><th scope="row">Never used</th><td>v, soft th</td><td>k, double consonants</td></tr>
                        <tr><th scope="row">Syllables</th><td>one or two, closed</td><td>three or four, open</td></tr>
                        <tr><th scope="row">Endings</th><td>-ak, -rum, -gard</td><td>-ia, -elle, -is</td></tr>
                        <tr><th scope="row">Sample names</th><td>Brakka, Durgrum, Kadgard</td><td>Selavia, Inelle, Losivenis</td></tr>
                    </tbody>
                </table></div>
                <p class="tk-note">The sample names are invented for this page.</p>`,
    library: ['how-fantasy-names-work', 'constructed-languages'],
    generators: [],
  },
  {
    id: 'parts',
    title: 'Build names from parts that mean something',
    lead: 'Real names are made of meaningful parts: Old English Æthelwulf is \'noble\' plus \'wolf\', and Oxford is a ford for oxen. Giving your invented words meanings, even ones only you know, keeps them consistent.',
    body: `<p>There are two ways to do it:</p>
                <ul>
                    <li><b>Borrow real elements.</b> Search the <a href="reference/name-elements.html">Name Element Finder</a> for a meaning such as <i>wolf</i>, <i>river</i> or <i>king</i> and pick parts from one language. A name built this way sounds rooted, but it is <i>built from real parts</i>, not historical, unless it turns up in the records.</li>
                    <li><b>Invent a small word list.</b> Make up ten or twenty roots for things your world names often (river, hill, fort, king, holy, old) and reuse them. Twenty roots can give you hundreds of names.</li>
                </ul>
                <p>Either way, keep a note of what each part means. When a reader meets a second place ending in your word for <i>ford</i>, the world feels lived in.</p>`,
    library: ['name-prefixes-and-suffixes', 'old-english-names', 'old-norse-names', 'welsh-names'],
    generators: [],
    finder: true,
  },
  {
    id: 'places',
    title: 'Name places from the land and the people',
    lead: 'Most real place names describe the land (a hill, a ford, a clearing) or say who lived there. Fantasy places sound truer when they work the same way.',
    body: `<p>For each place, ask what an early settler would have called it. A town by a river crossing becomes something like "the ford of the alder trees" in your culture's words. Larger features, such as rivers and mountains, often keep the oldest names, because each new people that arrives borrows them.</p>
                <p>That gives you a ready-made history: an old river name from a vanished people, towns named by the settlers who came next, and newer streets named after lords and saints.</p>`,
    library: ['english-place-name-elements', 'fantasy-place-names'],
    generators: ['fantasy_town', 'village', 'fantasy_city', 'kingdom', 'fantasy_country', 'continent', 'river', 'mountain', 'forest', 'island', 'tavern', 'castle'],
  },
  {
    id: 'people',
    title: 'Name the people, then their families',
    lead: 'A first name says which culture someone comes from. A second name shows how that culture thinks about family, work and reputation.',
    body: `<p>Decide how each culture forms its second names. Real ones give you plenty of models:</p>
                <ul>
                    <li><b>Father's or mother's name:</b> Norse Eiríksson, Welsh ap Hywel, Gaelic Mac Domhnaill.</li>
                    <li><b>Work:</b> Smith, Fletcher and Baxter began as jobs.</li>
                    <li><b>Place:</b> someone "of the hill" or "from the ford".</li>
                    <li><b>A byname:</b> a nickname earned in life, like the real Harald Fairhair or Æthelred the Unready.</li>
                </ul>
                <p>A culture that names people after their fathers feels different from one that names them after their trade, and readers pick that up without being told.</p>`,
    library: ['patronymic-names', 'how-surnames-began', 'occupational-surnames', 'naming-fictional-characters'],
    generators: ['character_name', 'npc', 'last_name', 'epithet', 'viking', 'anglo_saxon', 'elf', 'dwarf', 'orc', 'clan'],
  },
  {
    id: 'consistent',
    title: 'Keep a naming bible and check for clashes',
    lead: 'Write down every name you use, with what it means and who or what it belongs to. It stops two characters sharing a name by accident and keeps spellings steady across a long book or campaign.',
    body: `<ul>
                    <li><b>One list per culture</b>, with its sounds and endings at the top (the worksheet below is set out this way).</li>
                    <li><b>Check new names against the list</b> before you use them, so the river people never end up with a hill-clan name.</li>
                    <li><b>Check for clashes outside your world.</b> Search a name before you publish, so you don't borrow a famous character or a brand by mistake. Our generators label names that come from real records or from published books.</li>
                    <li><b>Read names aloud.</b> If you trip over a name, so will your readers, and so will your players at the table.</li>
                </ul>
                <p>The save button on every generator keeps a shortlist in your browser, so you can collect candidates as you go.</p>`,
    library: ['naming-fictional-characters'],
    generators: [],
  },
];

const FAQS = [
  { q: 'How do I make fantasy names sound like they belong to the same world?', a: 'Give each culture a short list of favourite sounds, a syllable shape and two or three endings, and use them for every name from that culture. The repetition is what readers notice.' },
  { q: 'Should I use real-language words in fantasy names?', a: 'You can, as long as you check the meaning and stay inside one language for each culture. Real elements make names feel rooted. Say so if you build a name from them: it is built from real parts, not a recorded historical name.' },
  { q: 'How many names do I need before I start writing?', a: 'Fewer than you think. A sound list, a few endings and a dozen meaningful roots per culture will let you make names as you need them, and they will still match.' },
  { q: 'Can I use names from this site in a published book or game?', a: 'Yes. The names are free to use and you don\'t need to credit us. Check that a name isn\'t already a famous character or a registered brand before you publish.' },
];

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
    <meta property="og:type" content="article">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(desc)}">
    <meta property="og:image" content="${layout.shareImage('home')}">
    <meta property="og:site_name" content="The Name Generators">
    <meta property="twitter:card" content="summary_large_image">

    ${helpers.ICON_LINKS}
    ${layout.headAssets('')}
</head>`;
}

function worksheet() {
  const rows = (n, cols) => Array.from({ length: n }, () => `<tr>${cols.map(() => '<td></td>').join('')}</tr>`).join('');
  const culture = (i) => `
                    <div class="tk-ws-block">
                        <h3>Culture ${i}: ______________________</h3>
                        <table class="tk-ws">
                            <tbody>
                                <tr><th scope="row">Favourite letters</th><td></td></tr>
                                <tr><th scope="row">Never used</th><td></td></tr>
                                <tr><th scope="row">Syllable shape</th><td></td></tr>
                                <tr><th scope="row">Endings</th><td></td></tr>
                                <tr><th scope="row">How second names work</th><td></td></tr>
                            </tbody>
                        </table>
                        <table class="tk-ws tk-ws-grid">
                            <thead><tr><th scope="col">Root</th><th scope="col">Means</th><th scope="col">Root</th><th scope="col">Means</th></tr></thead>
                            <tbody>${rows(5, [1, 2, 3, 4])}</tbody>
                        </table>
                    </div>`;
  return `
            <section class="section tk-worksheet" id="worksheet" aria-labelledby="ws-title">
                <div class="sec-head"><h2 id="ws-title">The naming worksheet</h2><button type="button" class="go hd tap tk-print" data-print>Print the worksheet</button></div>
                <p class="tk-screen-only">Print it, or save it as a PDF from the print window, and fill it in by hand. It follows the steps above: a sound list and word list for each culture, then the places and people you name.</p>
                <div class="tk-ws-sheet">
                    <p class="tk-ws-title">Worldbuilder's naming worksheet · thenamegenerators.com</p>
                    ${culture(1)}
                    ${culture(2)}
                    <div class="tk-ws-block">
                        <h3>Places</h3>
                        <table class="tk-ws tk-ws-grid">
                            <thead><tr><th scope="col">Name</th><th scope="col">Culture</th><th scope="col">What it means</th><th scope="col">What it is</th></tr></thead>
                            <tbody>${rows(8, [1, 2, 3, 4])}</tbody>
                        </table>
                    </div>
                    <div class="tk-ws-block">
                        <h3>People</h3>
                        <table class="tk-ws tk-ws-grid">
                            <thead><tr><th scope="col">Name</th><th scope="col">Culture</th><th scope="col">Second name and why</th><th scope="col">Role</th></tr></thead>
                            <tbody>${rows(8, [1, 2, 3, 4])}</tbody>
                        </table>
                    </div>
                </div>
            </section>`;
}

function page(site, records, helpers, elementCount) {
  const url = `${BASE}/${SLUG}.html`;
  const title = "The Worldbuilder's Naming Toolkit: Name a Fantasy World in 5 Steps";
  const desc = 'A step-by-step method for naming a fictional world so it sounds consistent: sounds, meaningful parts, places, people and a naming bible, with a free printable worksheet.';
  const refBySlug = Object.fromEntries(records.map(r => [r.slug, r]));
  const genByKey = Object.fromEntries(site.all.map(g => [g.key, g]));
  const catOf = (g) => site.categories.find(c => c.slug === g.category);
  const motifs = new Set(['compass-rose', 'library', 'signpost']);

  const steps = STEPS.map((s, i) => {
    const lib = s.library.map(k => refBySlug[k]).filter(Boolean);
    const gens = s.generators.map(k => genByKey[k]).filter(Boolean);
    gens.forEach(g => motifs.add(layout.generatorMotif(g, catOf(g))));
    const tools = [
      ...(s.finder && elementCount ? [`<li><a href="reference/name-elements.html">Name Element Finder</a>: search ${elementCount} real name parts by meaning.</li>`] : []),
      ...lib.map(r => `<li><a href="reference/${r.slug}.html">${esc(r.title)}</a></li>`),
    ];
    return `
            <section class="section tk-step" id="${s.id}" aria-labelledby="step-${s.id}">
                <p class="eyebrow">Step ${i + 1}</p>
                <h2 id="step-${s.id}">${esc(s.title)}</h2>
                <p class="tk-lead">${esc(s.lead)}</p>
                <div class="article">
                ${s.body}
                </div>${tools.length ? `
                <div class="tk-tools hd">
                    <h3>Read more in the Naming Library</h3>
                    <ul class="ref-links">${tools.join('')}</ul>
                </div>` : ''}${gens.length ? `
                <h3 class="tk-gen-h">Generators for this step</h3>
                <div class="genlist compact">
                    ${gens.map(g => `<a href="posts/${g.slug}.html" class="gencard hd tap">${layout.doodle(layout.generatorMotif(g, catOf(g)))}<div><b>${esc(g.title)}</b></div><em aria-hidden="true">→</em></a>`).join('\n                    ')}
                </div>` : ''}
            </section>`;
  }).join('\n');

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'HowTo', name: "How to name a fantasy world", description: desc, url, inLanguage: 'en-GB',
        totalTime: 'PT1H',
        tool: [{ '@type': 'HowToTool', name: 'The naming worksheet (printable)' }],
        step: STEPS.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.title, text: s.lead, url: `${url}#${s.id}` })) },
      { '@type': 'Article', headline: "The Worldbuilder's Naming Toolkit", description: desc, url, datePublished: PUBLISHED, dateModified: UPDATED,
        inLanguage: 'en-GB', author: { '@type': 'Person', name: 'Rich', url: `${BASE}/about.html` },
        publisher: { '@type': 'Organization', name: 'The Name Generators', url: `${BASE}/` } },
      { '@type': 'FAQPage', mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/` },
        { '@type': 'ListItem', position: 2, name: "Worldbuilder's Naming Toolkit", item: url }] },
    ],
  };

  return `${head(helpers, title, desc, url, schema)}
<body class="tk-page">
    ${layout.svgSprite([...motifs])}
    ${layout.siteHeader('', site.categories)}

    <div class="wrap layout">
        <main id="main">
            <nav class="crumb" aria-label="Breadcrumb"><a href="index.html">Home</a> / <span aria-current="page">Worldbuilder's Naming Toolkit</span></nav>
            <article class="guide reference">
                <p class="eyebrow">For writers, Dungeon Masters and worldbuilders</p>
                <div class="titlerow">
                    <h1>The Worldbuilder's Naming <span class="hl">Toolkit</span></h1>
                    ${layout.doodle('compass-rose')}
                </div>
                <div class="ref-glance hd">
                    <h2>At a glance</h2>
                    <p>Names make a world feel real when they follow patterns. This toolkit takes you through five steps: give each culture a sound, build names from parts that mean something, name places from the land, name people and their families, and keep a naming bible. Each step links the generators and research that help, and there's a free <a href="#worksheet">printable worksheet</a> at the end.</p>
                </div>
                <p class="byline">By Rich · ${helpers.longDate(UPDATED)}</p>
                <nav class="tk-steps" aria-label="The five steps"><ol>${STEPS.map(s => `<li><a href="#${s.id}">${esc(s.title)}</a></li>`).join('')}<li><a href="#worksheet">The naming worksheet</a></li></ol></nav>
            </article>
${steps}
${worksheet()}
            <section class="section faq-section">
                <h2>Frequently Asked Questions</h2>
                <div class="faq">
                    ${FAQS.map(f => `<details>
                        <summary><span class="tg hd" aria-hidden="true">+</span>${esc(f.q)}</summary>
                        <div><p>${esc(f.a)}</p></div>
                    </details>`).join('\n                    ')}
                </div>
            </section>
        </main>
    </div>

    ${layout.siteFooter('')}
    ${layout.bodyScripts('')}
    <script>
        document.querySelectorAll('[data-print]').forEach(function (b) {
            b.addEventListener('click', function () {
                document.body.classList.add('tk-printing');
                window.print();
            });
        });
        window.addEventListener('afterprint', function () { document.body.classList.remove('tk-printing'); });
    </script>
</body>
</html>`;
}

function buildToolkit(site, records, helpers, elementCount) {
  fs.writeFileSync(path.join(__dirname, '..', `${SLUG}.html`), layout.stampAssets(page(site, records, helpers, elementCount)));
  console.log(`  ✅ Created: ${SLUG}.html`);
}

/** Generator keys the toolkit links to (they link back from "Understanding these names"). */
const GENERATOR_KEYS = new Set(STEPS.flatMap(s => s.generators));

module.exports = { buildToolkit, SLUG, PUBLISHED, UPDATED, GENERATOR_KEYS };
