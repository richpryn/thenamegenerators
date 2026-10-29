/**
 * Loads content/ and checks it. Used by build-pages.js and validate-data.js.
 *
 *   content/categories.json        categories, in menu order, each listing
 *                                  the generators shown on its page
 *   content/generators/<key>.json  one file per generator: page text,
 *                                  filters, recipe and name lists
 */
const fs = require('fs');
const path = require('path');
const RecipeEngine = require('../lib/recipe-engine.js');

const CONTENT_DIR = path.join(__dirname, '../content');
const GENERATORS_DIR = path.join(CONTENT_DIR, 'generators');
const MIN_NAMES = 100;

function loadContent() {
  const categories = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, 'categories.json'), 'utf8'));
  const generators = {};
  for (const file of fs.readdirSync(GENERATORS_DIR).filter((f) => f.endsWith('.json')).sort()) {
    const key = path.basename(file, '.json');
    try {
      generators[key] = { key, ...JSON.parse(fs.readFileSync(path.join(GENERATORS_DIR, file), 'utf8')) };
    } catch (e) {
      throw new Error(`content/generators/${file} is not valid JSON: ${e.message}`);
    }
  }
  const homepagePath = path.join(CONTENT_DIR, 'homepage.json');
  const homepage = fs.existsSync(homepagePath) ? JSON.parse(fs.readFileSync(homepagePath, 'utf8')) : { popular: [] };
  const sisterPath = path.join(CONTENT_DIR, 'sister-links.json');
  const sisterLinks = fs.existsSync(sisterPath) ? JSON.parse(fs.readFileSync(sisterPath, 'utf8')) : { boxes: [] };
  // content/guides/*.json: naming guides (see generateGuidePage)
  const guidesDir = path.join(CONTENT_DIR, 'guides');
  const guides = fs.existsSync(guidesDir) ? fs.readdirSync(guidesDir).filter((f) => f.endsWith('.json')).sort()
    .map((f) => ({ slug: path.basename(f, '.json'), ...JSON.parse(fs.readFileSync(path.join(guidesDir, f), 'utf8')) })) : [];
  return { categories, generators, homepage, sisterLinks, guides };
}

function countNames(node) {
  if (Array.isArray(node)) return node.length;
  if (node && typeof node === 'object') return Object.values(node).reduce((n, v) => n + countNames(v), 0);
  return 0;
}

function emptyLists(node, at = '') {
  if (Array.isArray(node)) return node.length ? [] : [at];
  if (node && typeof node === 'object') {
    return Object.entries(node).flatMap(([k, v]) => emptyLists(v, at ? `${at}.${k}` : k));
  }
  return [];
}

function recipesIn(recipe) {
  if (recipe.recipe !== 'switch') return [recipe];
  return Object.values(recipe.cases || {}).concat(recipe.default || []).flatMap(recipesIn);
}

/** Returns { errors: [], warnings: [] }, each message naming its file. */
function validate({ categories, generators, homepage = { popular: [] }, sisterLinks = { boxes: [] }, guides = [] }) {
  const errors = [];
  const warnings = [];
  for (const g of guides) {
    const at = `guides/${g.slug}.json`;
    if (!/^[a-z0-9-]+$/.test(g.slug)) errors.push(`${at}: the file name must be lowercase-with-hyphens`);
    for (const f of ['title', 'description', 'published', 'intro']) if (!g[f]) errors.push(`${at}: needs "${f}"`);
    if (g.description && g.description.length > 160) warnings.push(`${at}: description is over 160 characters`);
    if (!(g.sections || []).length) errors.push(`${at}: needs at least one section`);
    for (const k of g.related || []) if (!generators[k]) errors.push(`${at}: related generator "${k}" doesn't exist`);
  }
  for (const box of sisterLinks.boxes || []) {
    const id = box.id || '?';
    if (!/^https:\/\//.test(box.url || '')) errors.push(`sister-links.json: box "${id}" needs an https "url"`);
    if (!(box.text || '').includes('{link}')) errors.push(`sister-links.json: box "${id}" text needs {link}`);
    if (!box.linkText) errors.push(`sister-links.json: box "${id}" needs "linkText"`);
    for (const key of box.generators || []) {
      if (!generators[key]) errors.push(`sister-links.json: box "${id}" lists "${key}", which isn't a generator`);
    }
  }
  const categorySlugs = new Set(categories.map((c) => c.slug));
  for (const key of homepage.popular || []) {
    if (!generators[key]) errors.push(`homepage.json: "${key}" isn't a generator`);
  }
  const listedIn = {};

  for (const cat of categories) {
    for (const field of ['name', 'slug', 'icon', 'description', 'seoDescription', 'navLabel']) {
      if (!cat[field]) errors.push(`categories.json: category ${cat.slug || '?'} is missing "${field}"`);
    }
    for (const f of cat.featured || []) {
      if (!(cat.generators || []).includes(f.key)) errors.push(`categories.json: ${cat.slug} features "${f.key}", which isn't in its generators list`);
      if (!f.note) errors.push(`categories.json: ${cat.slug} featured "${f.key}" needs a "note"`);
    }
    if (cat.seoTitle && cat.seoTitle.length > 65) warnings.push(`categories.json: ${cat.slug} seoTitle is ${cat.seoTitle.length} characters (aim for 60 or fewer)`);
    for (const key of cat.generators || []) {
      if (!generators[key]) errors.push(`categories.json: ${cat.slug} lists "${key}" but content/generators/${key}.json doesn't exist`);
      (listedIn[key] = listedIn[key] || []).push(cat.slug);
    }
  }

  const slugs = {};
  for (const [key, gen] of Object.entries(generators)) {
    const file = `generators/${key}.json`;
    for (const field of ['title', 'slug', 'icon', 'category', 'published', 'description', 'seoKeywords', 'recipe', 'data']) {
      if (!gen[field]) errors.push(`${file}: missing "${field}"`);
    }
    if (gen.seoTitle && gen.seoTitle.length > 65) warnings.push(`${file}: seoTitle is ${gen.seoTitle.length} characters (aim for 60 or fewer)`);
    if (gen.published && !/^\d{4}-\d{2}-\d{2}$/.test(gen.published)) {
      errors.push(`${file}: "published" should be a date like 2026-10-20`);
    }
    if (!gen.article || !gen.article.hero || !gen.article.hero.title || !gen.article.intro) {
      errors.push(`${file}: needs article.hero.title, article.hero.tagline and article.intro`);
    }
    if (gen.slug) {
      if (slugs[gen.slug]) errors.push(`${file}: slug "${gen.slug}" is also used by ${slugs[gen.slug]}`);
      slugs[gen.slug] = file;
    }
    if (gen.category && !categorySlugs.has(gen.category)) {
      errors.push(`${file}: category "${gen.category}" isn't in categories.json`);
    } else if (gen.category && !(listedIn[key] || []).includes(gen.category)) {
      errors.push(`${file}: category is "${gen.category}" but that category in categories.json doesn't list "${key}"`);
    }
    if (!listedIn[key]) warnings.push(`${file}: not listed in any category, so it won't appear in menus`);
    if (!gen.recipe || !gen.data) continue;

    // Recipe shape
    for (const r of recipesIn(gen)) {
      if (!['pick', 'combine', 'template', 'blend'].includes(r.recipe)) {
        errors.push(`${file}: unknown recipe "${r.recipe}" (use pick, combine, template, blend or switch)`);
      }
      if (r.recipe === 'blend' && !(Array.isArray(r.inputs) && r.inputs.length === 2 &&
          r.inputs.every((k) => (gen.filters || {})[k] && gen.filters[k].type === 'text'))) {
        errors.push(`${file}: a "blend" recipe needs "inputs": the keys of two text filters`);
      }
      if (r.recipe === 'pick' && typeof r.from !== 'string') errors.push(`${file}: a "pick" recipe needs "from"`);
      if (r.recipe === 'combine' && !Array.isArray(r.parts)) errors.push(`${file}: a "combine" recipe needs "parts"`);
      if (r.recipe === 'template' && !r.template) errors.push(`${file}: a "template" recipe needs "template"`);
    }
    if (gen.recipe === 'switch') {
      const filter = (gen.filters || {})[gen.on];
      if (!filter) {
        errors.push(`${file}: switch is "on" "${gen.on}" but there's no filter called that`);
      } else {
        for (const opt of filter.options) {
          if (!gen.cases[opt] && !gen.default) errors.push(`${file}: switch has no case for "${opt}" and no "default"`);
        }
        for (const c of Object.keys(gen.cases || {})) {
          if (!filter.options.includes(c)) warnings.push(`${file}: switch case "${c}" isn't one of the ${gen.on} options`);
        }
      }
    }
    for (const [fk, f] of Object.entries(gen.filters || {})) {
      if (f.type !== 'text' && (!Array.isArray(f.options) || f.options.length === 0)) {
        errors.push(`${file}: filter "${fk}" needs an "options" list`);
      }
    }
    if (errors.some((e) => e.startsWith(file))) continue;

    // Every option must lead somewhere, and every combination must generate.
    const engine = RecipeEngine.createGenerator(gen);
    const selectKeys = Object.keys(gen.filters || {}).filter((k) => gen.filters[k].type !== 'text');
    const everAvailable = Object.fromEntries(selectKeys.map((k) => [k, new Set()]));
    const walk = (i, values) => {
      if (i === selectKeys.length) {
        try {
          const names = engine.generate(values, 3);
          if (names.some((n) => !n || /undefined|\[|\]/.test(n))) {
            errors.push(`${file}: ${JSON.stringify(values)} gives odd names, e.g. "${names[0]}"`);
          }
        } catch (e) {
          errors.push(`${file}: ${JSON.stringify(values)} fails: ${e.message}`);
        }
        return;
      }
      const key = selectKeys[i];
      for (const opt of engine.availableOptions(key, values)) {
        everAvailable[key].add(opt);
        walk(i + 1, { ...values, [key]: opt });
      }
    };
    // Text boxes get their example values, so blends and templates have something to work on
    const typed = Object.fromEntries(Object.entries(gen.filters || {})
      .filter(([, f]) => f.type === 'text').map(([k, f]) => [k, f.example || f.default || '']));
    walk(0, typed);
    for (const k of selectKeys) {
      const never = gen.filters[k].options.filter((o) => !everAvailable[k].has(o));
      if (never.length) errors.push(`${file}: filter "${k}" option(s) ${never.join(', ')} never find any names`);
    }

    const unknownTokens = (JSON.stringify(gen.article || {}) + (gen.description || ''))
      .match(/\{\{(?!names\}\}|combinations\}\}|count:)[^}]*\}\}/g);
    if (unknownTokens) errors.push(`${file}: unknown placeholder(s) ${[...new Set(unknownTokens)].join(', ')}`);
    for (const m of (JSON.stringify(gen.article || {})).matchAll(/\{\{count:([^}]+)\}\}/g)) {
      if (!RecipeEngine.resolveList(gen.data, m[1]).length || !m[1].split('.').every(Boolean)) errors.push(`${file}: {{count:${m[1]}}} doesn't match a list`);
    }
    for (const at of emptyLists(gen.data)) warnings.push(`${file}: list "${at}" is empty`);
    const total = countNames(gen.data);
    const blendsTyped = recipesIn(gen).some((r) => r.recipe === 'blend');
    if (total < MIN_NAMES && !blendsTyped) warnings.push(`${file}: only ${total} names (aim for at least ${MIN_NAMES})`);
  }

  // Drawings (content/illustrations.json): every generator and category should
  // have one. A drawing not in the library yet falls back to the category's.
  const illustrationsFile = path.join(CONTENT_DIR, 'illustrations.json');
  if (fs.existsSync(illustrationsFile)) {
    const map = JSON.parse(fs.readFileSync(illustrationsFile, 'utf8'));
    const Illustrations = require('../lib/illustrations.js');
    for (const key of Object.keys(generators)) {
      if (!(map.generators || {})[key]) warnings.push(`illustrations.json: no drawing for generator "${key}" (its category's is used)`);
    }
    for (const key of Object.keys(map.generators || {})) {
      if (!generators[key]) warnings.push(`illustrations.json: "${key}" isn't a generator`);
    }
    for (const cat of categories) {
      const id = (map.categories || {})[cat.slug];
      if (!id) warnings.push(`illustrations.json: no drawing for category "${cat.slug}"`);
      else if (!Illustrations.has(id)) errors.push(`illustrations.json: category "${cat.slug}" uses "${id}", which isn't in lib/illustrations.js`);
    }
  }

  return { errors, warnings };
}

/**
 * How many different names a generator can produce, across every filter
 * combination: a list counts its entries; combining lists multiplies them.
 */
function countCombinations(gen) {
  const engine = RecipeEngine.createGenerator(gen);
  const listAt = (p, values) => RecipeEngine.resolveList(gen.data, p.replace(/\{(\w+)\}/g, (_, k) => values[k] || ''));
  // A list's size, counting each item's own [Slot] fillers: only the slots an
  // item actually uses multiply it ("The [Fiddler]'s Chair" uses one of many).
  const size = (p, values, slots) => {
    const list = listAt(p, values);
    if (!slots) return list.length;
    return list.reduce((sum, item) => sum + [...String(item).matchAll(/\[(\w+)\]/g)]
      .reduce((n, m) => (slots[m[1]] ? n * size(slots[m[1]], values, null) : n), 1), 0);
  };
  const count = (r, values) => {
    if (r.recipe === 'switch') {
      const choice = r.cases[values[r.on]] || r.default;
      return choice ? count(choice, values) : 0;
    }
    if (r.recipe === 'pick') return size(r.from, values, r.slots);
    if (r.recipe === 'combine') return r.parts.reduce((n, p) => n * size(p, values, r.slots), 1);
    if (r.recipe === 'template') {
      // A template listed twice is a weighting, not twice the names
      return [...new Set([].concat(r.template))].reduce((sum, t) =>
        sum + [...t.matchAll(/\[([^\]]+)\]/g)].reduce((n, m) => n * size(m[1], values, r.slots), 1), 0);
    }
    return 0;
  };
  let combos = [{}];
  for (const [key, f] of Object.entries(gen.filters || {})) {
    if (f.type === 'text') continue;
    combos = combos.flatMap((c) => engine.availableOptions(key, c).map((opt) => ({ ...c, [key]: opt })));
  }
  // An "any" choice mixes the others, so it adds nothing new
  return combos.filter((c) => !Object.values(c).includes('any')).reduce((n, c) => n + count(gen, c), 0);
}

// 2,740 -> "2,700"; 1,195 -> "1,100" (for "over {{combinations}}")
function roundDown(n) {
  if (n >= 1e12) return 'a trillion'; // "over a trillion": past that, the digits mean nothing
  if (n < 100) return String(n);
  const digits = Math.pow(10, String(Math.floor(n)).length - 2);
  return (Math.floor(n / digits) * digits).toLocaleString('en-GB');
}

/**
 * Fill count placeholders in article text, so numbers stay right as names
 * are added:
 *   {{names}}          every entry in every list, e.g. "1,195"
 *   {{combinations}}   different names it can make, rounded down ("over {{combinations}}")
 *   {{count:surnames}} entries in one list (a path, as in recipes)
 */
function fillCounts(gen, text) {
  return String(text).replace(/\{\{(names|combinations|count:([^}]+))\}\}/g, (match, what, listPath) => {
    if (what === 'names') return countNames(gen.data).toLocaleString('en-GB');
    if (what === 'combinations') return roundDown(countCombinations(gen));
    return RecipeEngine.resolveList(gen.data, listPath).length.toLocaleString('en-GB');
  });
}

/** A copy of the generator with placeholders filled in throughout its article. */
function withCounts(gen) {
  const fill = (v) => typeof v === 'string' ? fillCounts(gen, v)
    : Array.isArray(v) ? v.map(fill)
    : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fill(x)]))
    : v;
  return { ...gen, description: fill(gen.description), article: fill(gen.article) };
}

module.exports = { loadContent, validate, countNames, countCombinations, withCounts };
