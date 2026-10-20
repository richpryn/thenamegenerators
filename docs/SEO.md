# SEO checklist

What's done, what's left, and what to keep an eye on. Replaces the old SEO, Bing and Search Console guides (in git history if ever needed).

## Done

- [x] Google Search Console: domain verified, sitemap submitted
- [x] Bing Webmaster Tools: set up, sitemap submitted
- [x] Every page has a title, description, canonical URL, Open Graph/Twitter tags and schema.org data (built by `scripts/build-pages.js`)
- [x] `sitemap.xml` and `sitemap.html` rebuilt on every build; `robots.txt` points at the sitemap
- [x] Menus, related generators and category lists are plain HTML links that crawlers can follow
- [x] HTTPS (GitHub Pages)
- [x] Page titles use each generator's full name ("Path of Exile Witch Name Generator | The Name Generators")
- [x] Every generator page shows example names in its HTML (marked up as an ItemList), so search engines and AI tools can see what it makes
- [x] "By Rich · Updated <date>" on every generator page; schema credits Rich as author; About page describes him
- [x] Real publish/update dates (see README)
- [x] Usage note on every page and in About: free to use, no credit needed, check availability before using a name commercially
- [x] Proper 404 page (old addresses from the previous site still forward)
- [x] `llms.txt`: a plain-text map of the site for AI tools, rebuilt on every build
- [x] Favicon: `favicon.svg` (the source), `favicon.ico` and `apple-touch-icon.png`, linked from every page

## To do

### 1. Google Analytics
1. Create a GA4 property at https://analytics.google.com for `thenamegenerators.com` and copy the Measurement ID (`G-XXXXXXXXXX`).
2. Add the tag to every page. The build writes the generator and category pages, so it goes in the `<head>` templates in `scripts/build-pages.js` as well as in `index.html`, `all-generators.html` and `about.html`.
3. Allow Google's domains in each page's Content-Security-Policy meta tag (`script-src` and `connect-src`), or the tag will be blocked.
4. In Search Console, link the GA4 property (Settings → Associations).

### 2. Share images and logo (currently missing)
Every page points at an image that doesn't exist, so links shared on social media show no picture:
- Generator pages use `images/<slug>.jpg` and category pages use `images/categories/<slug>.jpg` (1200×630 is the usual size).

Either add the images, or point the build at one shared image until there are per-page ones. Once there's a logo, add it to the schema `publisher` in `scripts/build-pages.js`.

### 3. Check the pages
- Run a few generator pages through https://pagespeed.web.dev (mobile).
- Run one generator page through https://search.google.com/test/rich-results to check the FAQ and breadcrumb data.

### 4. Optional, later
- Visible breadcrumbs on generator pages (the schema has them; the page doesn't show them)
- Drop the meta tags search engines ignore (`keywords`, `revisit-after`, `ai-index`, `ai-crawl`)
- Social sharing buttons
- Backlinks: D&D, writing and worldbuilding communities, directories of tools

## Keep an eye on

- **Monthly:** Search Console → Pages (indexing problems) and Performance (which pages get clicks); Bing Webmaster Tools, the same.
- **After adding generators:** run the build, which updates the sitemaps. Both search consoles re-read them automatically, but you can ask for a new page to be indexed with Search Console → URL Inspection → Request indexing.

## Known quirks

- Pages set `X-Frame-Options` in a `<meta>` tag, which browsers ignore (it only works as a server header, and GitHub Pages can't set headers). Harmless, but it logs a console warning.
