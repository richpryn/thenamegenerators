# SEO checklist

What's done, what's left, and what to keep an eye on. Replaces the old SEO, Bing and Search Console guides (in git history if ever needed).

## Done

- [x] Google Search Console: domain verified, sitemap submitted
- [x] Bing Webmaster Tools: set up, sitemap submitted
- [x] Every page has a title, description, canonical URL, Open Graph/Twitter tags and schema.org data (built by `scripts/build-pages.js`)
- [x] `sitemap.xml` and `sitemap.html` rebuilt on every build; `robots.txt` points at the sitemap
- [x] Menus, related generators and category lists are plain HTML links that crawlers can follow
- [x] HTTPS (GitHub Pages)

## To do

### 1. Google Analytics
1. Create a GA4 property at https://analytics.google.com for `thenamegenerators.com` and copy the Measurement ID (`G-XXXXXXXXXX`).
2. Add the tag to every page. The build writes the generator and category pages, so it goes in the `<head>` templates in `scripts/build-pages.js` as well as in `index.html`, `all-generators.html` and `about.html`.
3. Allow Google's domains in each page's Content-Security-Policy meta tag (`script-src` and `connect-src`), or the tag will be blocked.
4. In Search Console, link the GA4 property (Settings → Associations).

### 2. Share images and logo (currently missing)
Every page points at an image that doesn't exist, so links shared on social media show no picture:
- Generator pages use `images/<slug>.jpg` and category pages use `images/categories/<slug>.jpg` (1200×630 is the usual size).
- Schema data names `logo.png` as the site logo.

Either add the images, or point the build at one shared image until there are per-page ones.

### 3. Favicon
There isn't one. Add `favicon.ico` (and ideally `favicon.svg` and `apple-touch-icon.png`) with `<link rel="icon">` tags in the page templates.

### 4. Check the pages
- Run a few generator pages through https://pagespeed.web.dev (mobile).
- Run one generator page through https://search.google.com/test/rich-results to check the FAQ and breadcrumb data.

### 5. Optional, later
- Visible breadcrumbs on generator pages (the schema has them; the page doesn't show them)
- Social sharing buttons
- Backlinks: D&D, writing and worldbuilding communities, directories of tools

## Keep an eye on

- **Monthly:** Search Console → Pages (indexing problems) and Performance (which pages get clicks); Bing Webmaster Tools, the same.
- **After adding generators:** run the build, which updates the sitemaps. Both search consoles re-read them automatically, but you can ask for a new page to be indexed with Search Console → URL Inspection → Request indexing.

## Known quirks

- The build stamps the current date into every page's `datePublished`/`dateModified` and the sitemap's `lastmod`, so every page looks freshly published after each build. Better to keep real dates per generator.
- Pages set `X-Frame-Options` in a `<meta>` tag, which browsers ignore (it only works as a server header, and GitHub Pages can't set headers). Harmless, but it logs a console warning.
