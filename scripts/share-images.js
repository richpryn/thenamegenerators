#!/usr/bin/env node
/**
 * Share images: the 1200×630 picture social sites and search engines show
 * when a page is shared. Each one is drawn from the page's own illustration
 * and title, in the site's fonts and colours, and saved to images/share/.
 *
 *   NODE_PATH=$(npm root -g) node scripts/share-images.js
 *
 * Run it after adding a generator, category or page, then run the build so
 * pages point at the new image (a page without one uses images/share/home.png).
 * Only images whose title, line or drawing changed are redrawn; the record of
 * what each was drawn from is kept in images/share/manifest.json.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { chromium } = require('playwright');
const { loadContent } = require('./content');
const layout = require('./layout');
const { NAME_TOOLS, STATIC_SHARE_PAGES } = require('./build-pages');
const Illustrations = require('../lib/illustrations.js');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'images', 'share');
const MANIFEST = path.join(OUT, 'manifest.json');

/** Every page that gets a share image: name, title, a short line and a drawing. */
function sharePages() {
  const content = loadContent();
  const bySlug = Object.fromEntries(content.categories.map(c => [c.slug, c]));
  const pages = [];
  for (const g of Object.values(content.generators)) {
    const category = bySlug[g.category];
    pages.push({
      name: g.slug,
      title: layout.stripEmoji(g.title),
      line: g.article && g.article.hero ? g.article.hero.tagline : g.description,
      drawing: { motif: layout.generatorMotif(g, category) },
    });
  }
  for (const c of content.categories) {
    pages.push({ name: `category-${c.slug}`, title: c.heading.split(':')[0], line: c.description, drawing: { motif: layout.categoryMotif(c) } });
  }
  for (const t of NAME_TOOLS) {
    pages.push({ name: path.basename(t.page, '.html'), title: t.title, line: t.short, drawing: { svg: t.doodle } });
  }
  for (const p of STATIC_SHARE_PAGES) {
    pages.push({ name: p.name, title: p.title, line: p.line, drawing: { motif: p.motif } });
  }
  return pages;
}

function cardHtml(page) {
  const drawing = page.drawing.svg
    ? page.drawing.svg.replace('class="doodle wob"', 'class="art"')
    : `<svg class="art" viewBox="0 0 48 48" aria-hidden="true"><use href="#m-${page.drawing.motif}"/></svg>`;
  const sprite = layout.svgSprite(page.drawing.motif ? [page.drawing.motif] : []);
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<base href="file://${ROOT}/">
<link rel="stylesheet" href="styles/site.css">
<style>
  html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:var(--paper)}
  .card{position:absolute;inset:36px;--fill:var(--card);display:grid;grid-template-columns:1fr 330px;gap:40px;align-items:center;padding:56px 64px}
  .brand{position:absolute;left:64px;top:44px;display:flex;align-items:center;gap:14px;font:800 26px/1 var(--head)}
  .brand svg{width:44px;height:44px}
  h1{font-size:${page.title.length > 40 ? 56 : page.title.length > 28 ? 66 : 76}px;line-height:1.02;margin:40px 0 0}
  p{font:italic 30px/1.3 var(--body);color:var(--muted);margin:22px 0 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .url{position:absolute;left:64px;bottom:40px;font:24px/1 var(--hand);color:var(--pen)}
  .art{width:330px;height:330px;filter:url(#wob)}
</style></head>
<body>${sprite}
<div class="card hd">
  <div class="brand">${layout.LOGO}<span>${layout.escapeHtml(layout.SITE_NAME)}</span></div>
  <div><h1>${layout.highlightFirstWord(page.title)}</h1>${page.line ? `<p>${layout.escapeHtml(page.line)}</p>` : ''}</div>
  ${drawing}
  <div class="url">thenamegenerators.com</div>
</div>
<script src="lib/outline.js"></script>
</body></html>`;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  let manifest = {};
  try { manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8')); } catch (e) { /* first run */ }
  const style = crypto.createHash('sha1').update(fs.readFileSync(path.join(ROOT, 'styles/site.css'))).digest('hex');
  const pages = sharePages();
  const todo = pages.filter(p => {
    p.hash = crypto.createHash('sha1').update(JSON.stringify([p.title, p.line, p.drawing,
      p.drawing.motif && Illustrations.MOTIFS[p.drawing.motif], cardHtml.toString(), style])).digest('hex').slice(0, 12);
    return manifest[p.name] !== p.hash || !fs.existsSync(path.join(OUT, `${p.name}.png`));
  });

  if (todo.length) {
    const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
    const tab = await browser.newPage({ viewport: { width: 1200, height: 630 } });
    for (const p of todo) {
      const file = path.join(OUT, '_card.html');
      fs.writeFileSync(file, cardHtml(p));
      await tab.goto(`file://${file}`);
      await tab.evaluate(() => document.fonts.ready);
      await tab.waitForTimeout(150);
      await tab.screenshot({ path: path.join(OUT, `${p.name}.png`) });
      manifest[p.name] = p.hash;
    }
    fs.unlinkSync(path.join(OUT, '_card.html'));
    await browser.close();
  }

  // Drop images for pages that no longer exist
  const names = new Set(pages.map(p => p.name));
  for (const name of Object.keys(manifest)) {
    if (names.has(name)) continue;
    delete manifest[name];
    fs.rmSync(path.join(OUT, `${name}.png`), { force: true });
  }
  fs.writeFileSync(MANIFEST, JSON.stringify(Object.fromEntries(Object.entries(manifest).sort()), null, 1) + '\n');
  console.log(`Share images: ${todo.length} drawn, ${pages.length - todo.length} unchanged (${pages.length} in all).`);
})();
