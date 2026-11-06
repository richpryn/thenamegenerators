/**
 * The Business Name Checker page (business-name-checker.html).
 * The tool is lib/checker.js; its links and next-step buttons come from
 * content/affiliates.json, written into the page as window.CHECKER_CONFIG.
 */
const fs = require('fs');
const path = require('path');
const layout = require('./layout');

const CONFIG_FILE = path.join(__dirname, '..', 'content', 'affiliates.json');

const FAQS = [
  ['Is this business name checker free?', "Yes. It runs in your browser, there's no sign-up, and we don't keep the names you check."],
  ['How do I check if a business name is taken in the UK?', 'Search it on the Companies House register, which this page does for you, then check the domain, the social handles and the UK IPO trade mark register. Companies House ignores capitals, punctuation, "The" at the start and endings such as Ltd, so "The Crumb Co. Ltd" counts as the same name as "Crumb Co".'],
  ['How do I check if a business name is taken in the US?', "Each state keeps its own register, so search the Secretary of State's business search in the state where you'll form your LLC or corporation. Then search the USPTO trade mark database: a federal trade mark protects a name across the whole country, whatever the state registers say."],
  ['If the company name is free, can I use it?', "Not always. A name can be free on the company register but trade-marked by someone else, or too like an existing company's name. Check the trade mark registers too, and if you're spending real money on the brand, ask a solicitor or attorney."],
  ['What does "Looks free" mean for a domain?', "The domain's registry has no record of it, so it's very likely available to buy. Premium and reserved names can still show as free here, so the registrar's own search has the final word."],
  ['Why can\'t you check Instagram and TikTok handles automatically?', "The social networks don't let other websites look up handles. The links open each profile address: if the page says it doesn't exist, the handle is probably free."],
];

function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
}

/** Business generators (pages with "checkName": true), grouped by category. */
function businessLinks(site, escapeHtml) {
  const gens = site.all.filter(g => g.checkName);
  const byCat = new Map();
  for (const g of gens) {
    if (!byCat.has(g.category)) byCat.set(g.category, []);
    byCat.get(g.category).push(g);
  }
  const groups = [...byCat.entries()].map(([slug, list]) => {
    const cat = site.categories.find(c => c.slug === slug);
    const links = list.sort((a, b) => a.title.localeCompare(b.title))
      .map(g => `<li><a href="posts/${g.slug}.html">${escapeHtml(g.title.replace(/ Generator$/, ''))}</a></li>`).join('');
    return `<div class="ck-group"><h3>${escapeHtml(cat ? (cat.navLabel || cat.name) : 'Business')}</h3><ul class="ck-links">${links}</ul></div>`;
  });
  return { count: gens.length, html: groups.join('\n') };
}

function generateCheckerPage(site, { escapeHtml, scriptJson, ICON_LINKS, AUTHOR }) {
  const cfg = loadConfig();
  const baseUrl = 'https://thenamegenerators.com';
  const url = `${baseUrl}/business-name-checker.html`;
  const title = 'Business Name Checker: Is My Business Name Taken? | The Name Generators';
  const desc = 'Check if a business name is taken: company registers in the UK and US, .com and local domains, trade marks and Instagram and TikTok handles, in one go. Free.';
  const links = businessLinks(site, escapeHtml);
  const clientConfig = {
    companiesHouseApi: cfg.companiesHouseApi || '',
    disclosure: cfg.disclosure,
    domains: cfg.domains,
    formation: cfg.formation,
    logo: cfg.logo,
    usStates: cfg.usStates,
    registers: cfg.registers,
    tradeMarks: cfg.tradeMarks,
  };
  const countries = [['uk', 'United Kingdom'], ['us', 'United States'], ['ca', 'Canada'], ['au', 'Australia'], ['ie', 'Ireland'], ['nz', 'New Zealand'], ['other', 'Somewhere else']];

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
    { "@type": "ListItem", "position": 2, "name": "Business Name Checker", "item": url }
  ]
}, 2)}
    </script>
    <script type="application/ld+json">
${scriptJson({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Business Name Checker",
  "url": url,
  "description": desc,
  "applicationCategory": "BusinessApplication",
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
    <meta property="og:image" content="${layout.shareImage('business-name-checker')}">
    <meta property="og:site_name" content="The Name Generators">
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:image" content="${layout.shareImage('business-name-checker')}">
    <meta property="twitter:title" content="${escapeHtml(title)}">
    <meta property="twitter:description" content="${escapeHtml(desc)}">

    ${ICON_LINKS}
    ${layout.headAssets('')}
</head>
<body>
    ${layout.svgSprite([])}
    ${layout.siteHeader('', site.categories)}

    <div class="wrap layout">
        <main id="main">
            <nav class="crumb" aria-label="Breadcrumb"><a href="index.html">Home</a> / <span aria-current="page">Business Name Checker</span></nav>
            <div class="titlerow">
                <h1>Business Name <span class="hl">Checker</span></h1>
            </div>
            <p class="lede">Is your business name taken? Check the company register, domains, trade marks and social handles in one go. Free, and nothing you type is stored.</p>

            <section class="sheet hd ck-sheet" aria-label="Check a business name">
                <form id="ck-form" class="ck-form" autocomplete="off">
                    <div class="ck-field ck-field-name">
                        <label for="ck-name">Business name</label>
                        <input type="text" id="ck-name" name="name" class="name-input" maxlength="160" placeholder="e.g. Crumb &amp; Co." required>
                    </div>
                    <div class="ck-field">
                        <label for="ck-country">Where will you trade?</label>
                        <select id="ck-country" name="country" class="ck-select">
                            ${countries.map(([v, n]) => `<option value="${v}">${n}</option>`).join('\n                            ')}
                        </select>
                    </div>
                    <button class="go hd tap" type="submit">Check this name</button>
                </form>
            </section>

            <div id="ck-results" class="ck-results" hidden aria-live="polite">
                <h2 class="ck-for">Results for <span id="ck-for"></span></h2>
                <section class="ck-card hd"><h3>Domains</h3><div id="ck-domains"></div></section>
                <section class="ck-card hd"><h3>Company register</h3><div id="ck-register"></div></section>
                <section class="ck-card hd"><h3>Trade marks</h3><div id="ck-marks"></div></section>
                <section class="ck-card hd"><h3>Social handles</h3><div id="ck-social"></div></section>
                <section class="ck-card hd ck-card-next"><h3>Next steps</h3><div id="ck-next"></div></section>
                <p class="ck-small">These checks are a quick first look, not legal advice. Before you spend money on signs or branding, check the official registers yourself.</p>
            </div>

            <article class="section article">
                <h2>How to check a business name is free</h2>
                <ol>
                    <li><strong>The company register.</strong> In the UK that's Companies House, which won't accept a name that's the "same as" one already registered, and can refuse one that's "too like" another. In the US, each state keeps its own register, so check the state where you'll form your LLC or corporation.</li>
                    <li><strong>Trade marks.</strong> A company name and a trade mark are different things. Someone can own the trade mark for a name that's free on the company register, and they can stop you trading under it. Check the UK IPO, the USPTO or the register for your country.</li>
                    <li><strong>The domain.</strong> A matching .com, or .co.uk in the UK, makes you easier to find. If both are taken, a short extra word such as "bakery" or "studio" often frees one up.</li>
                    <li><strong>Social handles.</strong> Grab the same handle everywhere you'll post, even before you're ready to use it.</li>
                </ol>
                <h2>Need a name first?</h2>
                <p>We have ${links.count} business name generators, one for each kind of business, and every name has a <b>Check</b> button that opens it here.</p>
                <div class="ck-groups">
                ${links.html}
                </div>
                <h2>Questions</h2>
                ${FAQS.map(([q, a]) => `<h3>${escapeHtml(q)}</h3>\n                <p>${escapeHtml(a)}</p>`).join('\n                ')}
            </article>
        </main>
        <aside class="side" aria-label="Sidebar"></aside>
    </div>

    ${layout.siteFooter('')}
    ${layout.bodyScripts('', {})}
    <script>window.CHECKER_CONFIG = ${scriptJson(clientConfig)};</script>
    <script src="${layout.asset('', 'lib/checker.js')}"></script>
</body>
</html>`;
}

module.exports = { generateCheckerPage, loadConfig };
