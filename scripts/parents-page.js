/**
 * Baby Name Generator from Parents' Names (baby-name-from-parents.html).
 *
 * The tool is lib/parentnames.js. Its names are data/parent-names.json, a
 * compact copy of the ONS lists in content/data/ons-names.json (England and
 * Wales, 1996-2025, Open Government Licence v3.0), written here on every build:
 * - one-word names only (no "Aaliyah-Grace" compounds);
 * - given to 5+ babies in 2025, or in the top 1,500 in an earlier ONS year;
 * - minus a short ban list (rude in British English, brands, film and TV
 *   characters, famous people).
 * Each entry is "Name,rank2025", or "Name,,bestRank,yearIndex" for a name
 * with no 2025 rank.
 */
const fs = require('fs');
const path = require('path');
const layout = require('./layout');
const ParentNames = require('../lib/parentnames');

const ROOT = path.join(__dirname, '..');
const ONS_FILE = path.join(ROOT, 'content', 'data', 'ons-names.json');
const DATA_FILE = path.join(ROOT, 'data', 'parent-names.json');
const PAGE = 'baby-name-from-parents.html';
const TITLE = "Baby Name Generator from Parents' Names";

const MIN_COUNT_2025 = 5;
const MAX_PAST_RANK = 1500;
// Every name here is a real recorded name, so none is left out (Rich, 29 Nov 2026).
const BANNED = new Set([]);

const FAQS = [
  ['How does it find names from both parents?', "It reads both names for their sounds, not just their spelling, so Sophie and Sofia both start with \"sof\". Then it looks through the official baby name lists for names that start like one of you and end like the other, share your initials, have a sound from each of you, or have the same rhythm as your names."],
  ['Are these real names?', "Yes. Every name in the four main groups is a real first name given to babies in England and Wales, from the Office for National Statistics lists for 1996 to 2025. Only the Blends group, which is off unless you tick it, has made-up names, and it says so."],
  ['What does the number next to each name mean?', "It's the name's rank in England and Wales in 2025: No. 1 was the most popular. A year instead, like \"2005: No. 120\", means the name wasn't ranked in 2025 and shows its best year since 1996. Names are listed most popular first within each group."],
  ['Why is an accent or a hyphen ignored?', "The ONS lists don't use accents, so Siobhán is matched as Siobhan, and Zoë as Zoe. With a double-barrelled name like Mary-Jane, the first part is used for how a name starts and the last part for how it ends."],
  ['Do you keep the names I type?', "No. The names are matched in your browser, and the last ones you typed are remembered in this browser only, so they're there next time. Names you bookmark go into the same shortlist as every generator on the site."],
];

/** Write data/parent-names.json from the ONS file. Returns its size in bytes. */
function buildData() {
  const ons = JSON.parse(fs.readFileSync(ONS_FILE, 'utf8'));
  const out = { source: ons.source, licence: 'Contains public sector information licensed under the Open Government Licence v3.0.', years: ons.years.slice(1) };
  for (const sex of ['girl', 'boy']) {
    const rows = [];
    for (const [name, v] of Object.entries(ons[sex])) {
      if (!/^[A-Z][a-z]+$/.test(name) || BANNED.has(name)) continue;
      const past = v.slice(1, 6);
      const ranked = past.filter(Boolean);
      const best = ranked.length ? Math.min(...ranked) : 0;
      if (!((v[6] || 0) >= MIN_COUNT_2025 || (best && best <= MAX_PAST_RANK))) continue;
      const sort = v[0] || 10000 + best;
      rows.push([sort, v[0] ? `${name},${v[0]}` : `${name},,${best},${past.indexOf(best)}`]);
    }
    rows.sort((a, b) => a[0] - b[0]);
    out[sex] = rows.map(r => r[1]).join('|');
  }
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  const text = JSON.stringify(out);
  fs.writeFileSync(DATA_FILE, text);
  return Buffer.byteLength(text);
}

/** The worked examples in the copy, run through the real matcher at build time. */
function examples() {
  const names = ParentNames.loadNames(JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')));
  const top = (a, b, sex, group, n) => ParentNames.suggest(names, a, b, sex)[group].slice(0, n).map(r => r.name);
  return { names, top };
}

const EXAMPLE_PAIRS = [['Emma', 'James'], ['Sophie', 'Daniel'], ['Aisha', 'Omar'], ['Siobhán', 'Conor']];
const GROUP_LABELS = [
  ['starts', 'Starts like one, ends like the other'],
  ['initials', 'Shares your initials'],
  ['sounds', 'Has a sound from both'],
  ['rhythm', 'Same rhythm'],
];

const DOODLE = '<svg class="doodle wob" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><circle cx="15" cy="15" r="9" fill="#fffcf4" stroke="#1e1c18" stroke-width="1.6"/><circle cx="33" cy="15" r="9" fill="#efc84a" stroke="#1e1c18" stroke-width="1.6"/><path d="M15 24 C15 30 20 32 24 33 M33 24 C33 30 28 32 24 33" fill="none" stroke="#1e1c18" stroke-width="1.5" stroke-linecap="round"/><circle cx="24" cy="38" r="6.5" fill="#fffcf4" stroke="#1e1c18" stroke-width="1.6"/><path d="M21.5 39 C23 40.5 25 40.5 26.5 39" fill="none" stroke="#1e1c18" stroke-width="1.3" stroke-linecap="round"/></svg>';

/** The page itself, with its tool cards (from the build) put in at `toolCards`. */
function generateParentsPage(site, { escapeHtml, scriptJson, ICON_LINKS, AUTHOR, toolCards }) {
  const { top } = examples();
  const baseUrl = 'https://thenamegenerators.com';
  const url = `${baseUrl}/${PAGE}`;
  const title = "Baby Name Generator from Parents' Names | The Name Generators";
  const desc = "Type both parents' first names to find real baby names that mix them: names that start like one and end like the other, share your initials or sound alike.";
  const list = (names) => names.map(n => `<b>${escapeHtml(n)}</b>`).join(', ');
  const ej = (group, n = 3) => top('Emma', 'James', 'either', group, n);
  const sd = (group, n = 3) => top('Sophie', 'Daniel', 'either', group, n);
  const exampleBoxes = EXAMPLE_PAIRS.map(([a, b]) => {
    const lines = GROUP_LABELS.map(([key, label]) => {
      const names = top(a, b, 'either', key, 3);
      return names.length ? `<li><span class="pn-exlabel">${escapeHtml(label)}:</span> ${names.map(escapeHtml).join(', ')}</li>` : '';
    }).filter(Boolean).join('\n                        ');
    return `<div class="exbox hd">
                    <h3><a href="${PAGE}?a=${encodeURIComponent(a)}&amp;b=${encodeURIComponent(b)}" rel="nofollow">${escapeHtml(a)} + ${escapeHtml(b)}</a></h3>
                    <ul class="pn-exlist">
                        ${lines}
                    </ul>
                </div>`;
  }).join('\n                ');
  const opt = (value, label, on) => `<button type="button" class="opt hd tap" data-value="${value}" aria-pressed="${on}">${label}</button>`;
  const combiner = site.all.find(g => g.key === 'name_combiner');
  const motifs = combiner ? [layout.generatorMotif(combiner, site.categories.find(c => c.slug === combiner.category))] : [];
  const share = layout.shareImage(path.basename(PAGE, '.html'));

  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">

    <!-- Mediavine Grow -->
    <script data-grow-initializer="">!(function(){window.growMe||((window.growMe=function(e){window.growMe._.push(e);}),(window.growMe._=[]));var e=document.createElement("script");(e.type="text/javascript"),(e.src="https://faves.grow.me/main.js"),(e.defer=!0),e.setAttribute("data-grow-faves-site-id","U2l0ZTo2YmQ3YzdiOS00MDgwLTQ5MmYtOGEyZi0yZWE3YmU2N2E5ZTU=");var t=document.getElementsByTagName("script")[0];t.parentNode.insertBefore(e,t);})();</script>

    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(desc)}">
    <meta name="author" content="Rich">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
    <link rel="canonical" href="${url}">
    <script type="application/ld+json">
${scriptJson({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": `${baseUrl}/` },
    { "@type": "ListItem", "position": 2, "name": "Name tools", "item": `${baseUrl}/name-tools.html` },
    { "@type": "ListItem", "position": 3, "name": TITLE, "item": url }
  ]
}, 2)}
    </script>
    <script type="application/ld+json">
${scriptJson({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": TITLE,
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
  "mainEntity": FAQS.map(([q, a]) => ({ "@type": "Question", "name": q, "acceptedAnswer": { "@type": "Answer", "text": a } }))
}, 2)}
    </script>

    <meta property="og:type" content="website">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(desc)}">
    <meta property="og:image" content="${share}">
    <meta property="og:site_name" content="The Name Generators">
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:image" content="${share}">
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
            <nav class="crumb" aria-label="Breadcrumb"><a href="index.html">Home</a> / <a href="name-tools.html">Name tools</a> / <span aria-current="page">Baby Names from Parents' Names</span></nav>
            <div class="titlerow">
                <h1>Baby Name Generator from <span class="hl">Parents' Names</span></h1>
                ${DOODLE}
            </div>
            <p class="lede">Type both your first names for real baby names that link the two of you.</p>

            <section class="sheet hd pn-sheet" id="pn-tool" data-src="${layout.asset('', 'data/parent-names.json')}" data-page="${PAGE}" data-title="Baby names from parents" aria-label="${escapeHtml(TITLE)}">
                <form id="pn-form" autocomplete="off" novalidate>
                    <div class="pn-grid">
                        <div class="group">
                            <label class="label" for="pn-a">Mum / parent 1</label>
                            <div class="ctl hd"><input type="text" id="pn-a" name="a" class="name-input" maxlength="40" placeholder="e.g. Emma" value="Emma" autocomplete="off" autocapitalize="words" spellcheck="false"></div>
                        </div>
                        <div class="group">
                            <label class="label" for="pn-b">Dad / parent 2</label>
                            <div class="ctl hd"><input type="text" id="pn-b" name="b" class="name-input" maxlength="40" placeholder="e.g. James" value="James" autocomplete="off" autocapitalize="words" spellcheck="false"></div>
                        </div>
                    </div>
                    <div class="group pn-sexgroup">
                        <div class="label"><span id="pn-sex-label">Baby</span></div>
                        <div class="opts pn-sex" role="group" aria-labelledby="pn-sex-label">${opt('either', 'Either', true)}${opt('girl', 'Girl', false)}${opt('boy', 'Boy', false)}</div>
                        <input type="hidden" id="pn-sex" value="either">
                    </div>
                    <button class="go hd tap" id="pn-go" type="submit"><svg aria-hidden="true" focusable="false"><use href="#i-wand"/></svg>Find baby names</button>
                </form>
                <p class="pn-key"><span class="prov prov-recorded">Real names</span> <span>from the ONS baby name lists for England and Wales. No. = rank in 2025.</span></p>
                <div id="pn-results" class="results-area pn-results">
                    <p class="results-empty">Press Find baby names to see ideas.</p>
                </div>
                <section class="pn-group pn-blendgroup" id="pn-blendgroup" aria-labelledby="pn-blends-h" hidden>
                    <h3 class="pn-h" id="pn-blends-h">Blends <span class="prov prov-invented">Invented</span></h3>
                    <p class="pn-sub">New names made from the start of one name and the end of the other, as the <a href="posts/name-combiner.html">Name Combiner</a> does. They aren't from the baby name lists, so say them out loud before you fall for one.</p>
                    <button type="button" class="more hd tap" id="pn-blends-toggle" aria-expanded="false">Show blends</button>
                    <ul class="pn-list" id="pn-blends" hidden></ul>
                </section>
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
            <p class="visually-hidden" aria-live="polite" id="pn-live"></p>

            <article class="section article">
                <h2>How it works</h2>
                <p class="big">Every idea is a real first name given to babies in England and Wales, chosen because it links to both of you. The most popular names come first in each group.</p>
                <ol>
                    <li><strong>Starts like one of you, ends like the other.</strong> The opening of one name and the ending of the other, with at least four letters between them. For Emma and James that gives ${list(ej('starts'))}.</li>
                    <li><strong>Shares your initials.</strong> Names that start with one of your initials. Ones that also have the other initial further in come first, like ${list(ej('initials', 2))} for Emma and James.</li>
                    <li><strong>Has a sound from both of you.</strong> A run of letters from each name, anywhere in the new one: ${list(sd('sounds'))} for Sophie and Daniel.</li>
                    <li><strong>Same rhythm.</strong> The same number of beats and the same ending as one of your names, so the names sound like a family: ${list(ej('rhythm'))} next to Emma.</li>
                </ol>
                <p>Names are matched by sound as well as spelling, so Sophie matches names that start "Sof" and Conor matches Konan. Your own names, and other spellings of them, are left out. Choose Girl or Boy to see only names given to girls or boys; Either shows both.</p>
                <p>Press <b>Show blends</b> under the lists for new names made from the start of one name and the end of the other, the same way as the <a href="posts/name-combiner.html">Name Combiner</a>. These are invented, and they're labelled that way.</p>

                <h2 class="section">Before you choose</h2>
                <ul>
                    <li><strong>Say it with the surname.</strong> Out loud, a few times, and shouted up the stairs.</li>
                    <li><strong>Check the initials.</strong> First, middle and surname together shouldn't spell anything awkward.</li>
                    <li><strong>Look at the rank.</strong> A name in the top 10 will probably be shared with a classmate; one past No. 1,000 probably won't be.</li>
                    <li><strong>Keep a shortlist.</strong> Tap the bookmark on any name you like, and compare them side by side later.</li>
                </ul>

                <h2 class="section">Where the names come from</h2>
                <p>The names and ranks come from the Office for National Statistics' <a href="https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/livebirths/datasets/babynamesinenglandandwalesfrom1996" rel="noopener">baby names in England and Wales</a>, 1996 to 2025. Contains public sector information licensed under the <a href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" rel="noopener">Open Government Licence v3.0</a>. The ONS counts each spelling separately and doesn't record accents, so Siobhán is matched as Siobhan.</p>
                <p>The list here has every name given to at least ${MIN_COUNT_2025} babies in 2025, plus any name in the top ${MAX_PAST_RANK.toLocaleString('en-GB')} in an earlier year, which brings back 1990s names like Kirsty and Grant. Double-barrelled names are left out, and so are a few that belong to brands, film characters or famous people.</p>
            </article>

            <section class="section example-names">
                <h2>Examples</h2>
                <p class="sub">The top ideas for four couples. Open one to see every list.</p>
                <div class="ex">
                ${exampleBoxes}
                </div>
            </section>

            <section class="section">
                <h2>Questions</h2>
                <div class="faq">
                    ${FAQS.map(([q, a], i) => `<details${i === 0 ? ' open' : ''}><summary><span class="tg hd" aria-hidden="true">+</span>${escapeHtml(q)}</summary><p>${escapeHtml(a)}</p></details>`).join('\n                    ')}
                </div>
            </section>

            <section class="section">
                <h2>More name tools</h2>
                <div class="tools">
                    ${toolCards}
                </div>
            </section>
        </main>
        <aside class="side" aria-label="Sidebar"></aside>
    </div>

    ${layout.siteFooter('')}
    ${layout.bodyScripts('', { engine: true })}
    <script src="${layout.asset('', 'lib/parentnames.js')}"></script>
</body>
</html>`;
}

module.exports = { buildData, examples, generateParentsPage, BANNED, FAQS, PAGE, TITLE, DATA_FILE, DOODLE };
