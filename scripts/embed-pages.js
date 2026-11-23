/**
 * Embeds: any generator can be put on another website.
 *
 *   embed/<slug>.html            the generator card on its own (noindex, no ads, no analytics)
 *   lib/embed.js                 optional script for the host page: lets the iframe set its own height
 *   embed-name-generators.html   the page explaining embeds, with a picker and the code
 *
 * The snippet puts the credit link OUTSIDE the iframe, in the host page's own
 * HTML: a link inside an iframe belongs to the framed page, so only the outside
 * one is a link from the host site. The credit's anchor text is the site name,
 * not a keyword, as Google asks of links in widgets.
 */
const fs = require('fs');
const path = require('path');
const layout = require('./layout');

const ROOT = path.join(__dirname, '..');
const EMBED_DIR = path.join(ROOT, 'embed');
const BASE = 'https://thenamegenerators.com';
const EXPLAINER = 'embed-name-generators.html';
const DEFAULT_HEIGHT = 560;
const DEMO_KEY = 'elf';

const embedUrl = (g) => `${BASE}/embed/${g.slug}.html`;
const pageUrl = (g) => `${BASE}/posts/${g.slug}.html`;

/** The code a site owner pastes into their page. */
function snippet(g, escapeHtml) {
  return `<iframe src="${embedUrl(g)}" title="${escapeHtml(g.title)}" data-tng-embed width="100%" height="${DEFAULT_HEIGHT}" style="border:0;width:100%;max-width:720px" loading="lazy" allow="clipboard-write"></iframe>
<p style="margin:4px 0 16px;font-size:14px">${escapeHtml(g.title)} by <a href="${pageUrl(g)}">The Name Generators</a></p>
<script src="${BASE}/lib/embed.js" async></script>`;
}

/** The fold-out box under a generator, with its embed code. */
function embedBoxHtml(g, escapeHtml) {
  return `<details class="embed-box">
                <summary>Put this generator on your website</summary>
                <p>Free for blogs, campaign sites, class pages and wikis, with no ads. Paste this into your page's HTML:</p>
                <textarea class="embed-code" readonly rows="5" aria-label="Embed code for the ${escapeHtml(g.title)}">${escapeHtml(snippet(g, escapeHtml))}</textarea>
                <p class="embed-acts"><button type="button" class="mini hd tap" data-embed-copy><svg class="ic" aria-hidden="true" focusable="false"><use href="#i-copy"/></svg><span>Copy code</span></button> <a href="../${EXPLAINER}">How embedding works</a></p>
            </details>`;
}

/** Tells the host page how tall the generator is, so lib/embed.js can fit the iframe to it. */
const HEIGHT_SCRIPT = `(function(){if(window.parent===window)return;var last=0;function send(){var h=Math.ceil(document.documentElement.getBoundingClientRect().height);if(h!==last){last=h;window.parent.postMessage({tngEmbedHeight:h},'*');}}if('ResizeObserver' in window)new ResizeObserver(send).observe(document.body);window.addEventListener('load',send);send();})();`;

function embedPage(g, card, { escapeHtml, scriptJson, runtimeConfig, ICON_LINKS }) {
  const more = `${pageUrl(g)}?utm_source=embed&amp;utm_medium=widget`;
  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(g.title)} | The Name Generators</title>
    <meta name="robots" content="noindex, follow">
    <link rel="canonical" href="${pageUrl(g)}">
    <base target="_blank">
    ${ICON_LINKS}
    <link rel="preload" href="../fonts/schibsted-grotesk-latin.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="../fonts/newsreader-latin.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="stylesheet" href="${layout.asset('../', 'styles/site.css')}">
</head>
<body class="embed-page">
    ${layout.svgSprite([])}
    <main class="embed-wrap">
        <p class="embed-head"><b>${escapeHtml(g.title)}</b> <a href="${more}" rel="noopener">More at The Name Generators</a></p>
        ${card}
    </main>
    <script type="application/json" id="generator-config">${scriptJson(runtimeConfig(g))}</script>
    ${layout.bodyScripts('../', { engine: true })}
    <script>${HEIGHT_SCRIPT}</script>
</body>
</html>`;
}

function explainerPage(site, { escapeHtml, scriptJson, ICON_LINKS }) {
  const url = `${BASE}/${EXPLAINER}`;
  const title = 'Embed a Name Generator on Your Site | The Name Generators';
  const desc = `Put any of our ${site.all.length} free name generators on your blog, campaign site, class page or wiki. Copy one line of code: no ads, no sign-up.`;
  const demo = site.all.find(g => g.key === DEMO_KEY) || site.all[0];
  const groups = site.categories
    .map(c => ({ c, gens: c.generators.map(k => site.all.find(g => g.key === k)).filter(Boolean) }))
    .filter(x => x.gens.length);
  const seen = new Set();
  const options = groups.map(({ c, gens }) => {
    const opts = gens.filter(g => !seen.has(g.key) && seen.add(g.key))
      .map(g => `<option value="${g.slug}" data-title="${escapeHtml(g.title)}"${g.key === demo.key ? ' selected' : ''}>${escapeHtml(g.title)}</option>`);
    return opts.length ? `<optgroup label="${escapeHtml(c.name)}">${opts.join('')}</optgroup>` : '';
  }).join('\n                        ');
  const faqs = [
    ['Is it free?', 'Yes. Any site can embed any generator, including business sites, and the names it makes are free to use.'],
    ['Does it show ads or track my visitors?', "No. The embedded generator has no ads, sets no cookies and loads no analytics. Names a visitor saves are kept in their own browser."],
    ['Why is there a credit line under it?', 'The line under the generator tells your readers where it comes from. Please leave it in: it is the only thing we ask in return.'],
    ['Can I change the size?', `Yes. It fills the width you give it, up to 720 pixels. The last line of the code lets it grow to fit the names; if your site removes scripts, it stays at ${DEFAULT_HEIGHT} pixels tall, and you can change height="${DEFAULT_HEIGHT}" to suit.`],
    ['Where do I paste the code?', 'Anywhere your site accepts HTML: a Custom HTML block in WordPress, an Embed or Code block in Squarespace and Wix, or straight into a page on your own site.'],
  ];
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
${scriptJson({
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'WebPage', name: 'Embed a name generator', description: desc, url, inLanguage: 'en-GB' },
    { '@type': 'FAQPage', mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  ],
}, 2)}
    </script>
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(desc)}">
    <meta property="og:image" content="${layout.shareImage('embed-name-generators')}">
    <meta property="og:site_name" content="The Name Generators">
    <meta property="twitter:card" content="summary_large_image">

    ${ICON_LINKS}
    ${layout.headAssets('')}
</head>
<body>
    ${layout.svgSprite([])}
    ${layout.siteHeader('', site.categories)}

    <div class="wrap layout">
        <main id="main">
            <nav class="crumb" aria-label="Breadcrumb"><a href="index.html">Home</a> / <span aria-current="page">Embed a generator</span></nav>
            <div class="titlerow">
                <h1>Embed a <span class="hl">Name Generator</span></h1>
            </div>
            <p class="lede">Put any of our ${site.all.length} name generators on your own site: a blog, a campaign wiki, a class page or a writing group. It's free, with no ads and no sign-up.</p>

            <section class="sheet hd embed-picker">
                <label class="label" for="embed-pick">Choose a generator</label>
                <select id="embed-pick" class="embed-select">
                        ${options}
                </select>
                <p class="label embed-label">The code</p>
                <textarea id="embed-code" class="embed-code" readonly rows="5" aria-label="Embed code">${escapeHtml(snippet(demo, escapeHtml))}</textarea>
                <p class="embed-acts"><button type="button" class="mini hd tap" data-embed-copy><svg class="ic" aria-hidden="true" focusable="false"><use href="#i-copy"/></svg><span>Copy code</span></button></p>
                <p class="label embed-label">How it looks</p>
                <div class="embed-preview">
                    <iframe id="embed-preview" src="embed/${demo.slug}.html" title="${escapeHtml(demo.title)}" data-tng-embed width="100%" height="${DEFAULT_HEIGHT}" style="border:0;width:100%;max-width:720px" loading="lazy" allow="clipboard-write"></iframe>
                    <p class="embed-credit"><span id="embed-credit-title">${escapeHtml(demo.title)}</span> by <a href="posts/${demo.slug}.html" id="embed-credit-link">The Name Generators</a></p>
                </div>
            </section>

            <div class="section article">
                <h2>How it works</h2>
                <ol>
                    <li>Pick a generator above, or press <strong>Put this generator on your website</strong> under any generator.</li>
                    <li>Copy the code and paste it where your site accepts HTML.</li>
                    <li>Your readers get the full generator, with every option, right on your page.</li>
                </ol>
                <p>The generator runs inside a frame, so it always has our latest names and fixes without you changing anything. Names are made in your reader's browser; nothing they press is sent to us or to you.</p>
            </div>

            <section class="section faqs">
                <h2>Questions</h2>
                ${faqs.map(([q, a]) => `<details class="faq hd"><summary>${escapeHtml(q)}</summary><p>${escapeHtml(a)}</p></details>`).join('\n                ')}
            </section>
        </main>
        <aside class="side" aria-label="Sidebar"></aside>
    </div>

    ${layout.siteFooter('')}
    ${layout.bodyScripts('')}
    <script src="lib/embed.js"></script>
    <script>
    (function () {
      var pick = document.getElementById('embed-pick');
      var code = document.getElementById('embed-code');
      var frame = document.getElementById('embed-preview');
      var credit = document.getElementById('embed-credit-title');
      var link = document.getElementById('embed-credit-link');
      var template = code.value;
      var demoSlug = ${JSON.stringify(demo.slug)};
      var demoTitle = ${JSON.stringify(demo.title)};
      pick.addEventListener('change', function () {
        var opt = pick.options[pick.selectedIndex];
        var title = opt.getAttribute('data-title');
        code.value = template.split(demoSlug).join(opt.value).split(demoTitle).join(title);
        frame.src = 'embed/' + opt.value + '.html';
        frame.title = title;
        credit.textContent = title;
        link.href = 'posts/' + opt.value + '.html';
      });
    })();
    </script>
</body>
</html>`;
}

function buildEmbeds(site, cards, helpers) {
  fs.mkdirSync(EMBED_DIR, { recursive: true });
  const keep = new Set();
  for (const g of site.all) {
    if (!cards[g.key]) continue;
    fs.writeFileSync(path.join(EMBED_DIR, `${g.slug}.html`), embedPage(g, cards[g.key], helpers));
    keep.add(`${g.slug}.html`);
  }
  for (const file of fs.readdirSync(EMBED_DIR)) {
    if (!keep.has(file)) fs.unlinkSync(path.join(EMBED_DIR, file));
  }
  fs.writeFileSync(path.join(ROOT, EXPLAINER), explainerPage(site, helpers));
  console.log(`  ✅ Created: ${EXPLAINER} and ${keep.size} embed pages`);
}

module.exports = { buildEmbeds, embedBoxHtml, snippet, EXPLAINER };
