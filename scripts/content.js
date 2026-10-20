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
  return { categories, generators, homepage };
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
function validate({ categories, generators, homepage = { popular: [] } }) {
  const errors = [];
  const warnings = [];
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
      if (!['pick', 'combine', 'template'].includes(r.recipe)) {
        errors.push(`${file}: unknown recipe "${r.recipe}" (use pick, combine, template or switch)`);
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
    walk(0, {});
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
    if (total < MIN_NAMES) warnings.push(`${file}: only ${total} names (aim for at least ${MIN_NAMES})`);
  }

  return { errors, warnings };
}

/**
 * How many different names a generator can produce, across every filter
 * combination: a list counts its entries; combining lists multiplies them.
 */
function countCombinations(gen) {
  const engine = RecipeEngine.createGenerator(gen);
  const size = (p, values) => RecipeEngine.resolveList(gen.data, p.replace(/\{(\w+)\}/g, (_, k) => values[k] || '')).length;
  const slotFactor = (r, values) => Object.values(r.slots || {}).reduce((n, p) => n * size(p, values), 1);
  const count = (r, values) => {
    if (r.recipe === 'switch') {
      const choice = r.cases[values[r.on]] || r.default;
      return choice ? count(choice, values) : 0;
    }
    if (r.recipe === 'pick') return size(r.from, values) * slotFactor(r, values);
    if (r.recipe === 'combine') return r.parts.reduce((n, p) => n * size(p, values), 1) * slotFactor(r, values);
    if (r.recipe === 'template') {
      return [].concat(r.template).reduce((sum, t) =>
        sum + [...t.matchAll(/\[([^\]]+)\]/g)].reduce((n, m) => n * size(m[1], values), 1), 0) * slotFactor(r, values);
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
