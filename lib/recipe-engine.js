/**
 * Recipe Engine
 * ------------------------------------------------------------------
 * One small, generic engine that builds names by FOLLOWING the recipe
 * declared in each generator's own JSON file (content/generators/*.json).
 * It knows nothing about elves or vampires: those rules live in the data.
 *
 * Paths
 *   A path points at a name list inside the generator's `data`, using dots:
 *   "male.tolkien". `{filter}` is replaced with the chosen filter value, so
 *   "{gender}.{origin}" becomes "male.tolkien".
 *   If a path stops at a group of lists, the engine draws from every list
 *   inside it combined. "*" means every list in the generator.
 *
 * Recipes
 *   pick      One name from one list.
 *             { "recipe": "pick", "from": "{gender}.{origin}" }
 *   combine   One item from each part, joined.
 *             { "recipe": "combine", "parts": ["{gender}", "surnames"], "join": " " }
 *             "join": "auto" adds a space unless the next part starts lowercase
 *             (Night + shade = Nightshade, Agent + Kane = Agent Kane).
 *   template  Fill a pattern. [path] draws from a list, {filter} inserts a
 *             filter or text-box value. Give an array to pick a pattern at random.
 *             { "recipe": "template", "template": "The [baseNames] Shield" }
 *   switch    Use a different recipe depending on one filter.
 *             { "recipe": "switch", "on": "format", "cases": { "full_name": {...} },
 *               "default": {...} }   <- optional, for any option not in cases
 *
 * Optional extras on any recipe
 *   slots     Fill placeholders inside the drawn names themselves:
 *             { "slots": { "Name": "prefixes" } } turns "Guild of [Name]"
 *             into "Guild of Ironhold".
 *   distinct  Stop names in one batch from looking alike. Each rule compares
 *             the "first" word or the "rest" of the name, optionally only its
 *             first `length` letters, and `alike` lists starts that count as
 *             the same sound.
 *
 * Every list is drawn without repeats: a shuffled copy per list, reshuffled
 * only when it runs out.
 */
(function (global) {
  'use strict';

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // "{gender}.firstNames" + {gender: "male"} -> "male.firstNames"
  function interpolate(path, values) {
    return path.replace(/\{(\w+)\}/g, (_, name) => (values[name] == null ? '' : values[name]));
  }

  // Every list inside a node, flattened into one.
  function allLists(node) {
    if (Array.isArray(node)) return node;
    if (node && typeof node === 'object') {
      return Object.values(node).reduce((acc, child) => acc.concat(allLists(child)), []);
    }
    return [];
  }

  // Walk "a.b.c" into data. A missing step stops the walk where it is, so
  // the caller draws from everything under the last node that did exist.
  function resolveList(data, path) {
    let node = data;
    for (const key of path.split('.').filter(Boolean)) {
      if (!node || typeof node !== 'object' || Array.isArray(node) || !(key in node)) break;
      node = node[key];
    }
    return allLists(node);
  }

  // Keys used by a `distinct` rule to decide whether two names look alike.
  function similarityKeys(name, rules) {
    const words = String(name).trim().split(/\s+/);
    const keys = [];
    rules.forEach((rule, i) => {
      let part = rule.part === 'rest' ? words.slice(1).join(' ') : words[0] || '';
      part = part.toLowerCase();
      if (!part) return;
      if (rule.length) {
        if (part.length >= rule.length) keys.push(`${i}:${part.slice(0, rule.length)}`);
      } else {
        keys.push(`${i}:${part}`);
      }
      (rule.alike || []).forEach((group, g) => {
        if (group.some((start) => part.startsWith(start))) keys.push(`${i}:alike${g}`);
      });
    });
    return keys;
  }

  function createGenerator(config) {
    const pools = new Map(); // resolved list path -> { shuffled, index }

    function drawFrom(path) {
      let pool = pools.get(path);
      if (!pool || pool.index >= pool.shuffled.length) {
        const list = resolveList(config.data, path);
        if (list.length === 0) {
          throw new Error(`No names found at "${path}" for ${config.slug}`);
        }
        pool = { shuffled: shuffle(list), index: 0 };
        pools.set(path, pool);
      }
      return String(pool.shuffled[pool.index++]).trim();
    }

    function fillSlots(text, recipe, values) {
      if (!recipe.slots) return text;
      return text.replace(/\[(\w+)\]/g, (match, slot) =>
        recipe.slots[slot] ? drawFrom(interpolate(recipe.slots[slot], values)) : match
      );
    }

    function draw(path, recipe, values) {
      return fillSlots(drawFrom(interpolate(path, values)), recipe, values);
    }

    function buildOne(recipe, values) {
      switch (recipe.recipe) {
        case 'pick':
          return draw(recipe.from, recipe, values);

        case 'combine': {
          const parts = recipe.parts.map((part) => draw(part, recipe, values));
          if (recipe.join !== 'auto') return parts.join(recipe.join == null ? ' ' : recipe.join);
          return parts.reduce((out, part) =>
            /^[a-z]/.test(part) ? out + part : out + ' ' + part
          );
        }

        case 'template': {
          const templates = [].concat(recipe.template);
          const template = templates[Math.floor(Math.random() * templates.length)];
          // One pass, so text typed by the visitor is never read as a token.
          return template.replace(/\[([^\]]+)\]|\{(\w+)\}/g, (_, path, value) =>
            path ? draw(path, recipe, values) : (values[value] == null ? '' : String(values[value]))
          );
        }

        case 'switch': {
          const choice = recipe.cases[values[recipe.on]] || recipe.default;
          if (!choice) throw new Error(`No recipe for ${recipe.on}="${values[recipe.on]}" in ${config.slug}`);
          return buildOne(choice, values);
        }

        default:
          throw new Error(`Unknown recipe "${recipe.recipe}" for ${config.slug}`);
      }
    }

    // Fill in defaults for anything the page didn't send.
    function withDefaults(values) {
      const out = {};
      for (const [key, filter] of Object.entries(config.filters || {})) {
        const given = values[key] == null ? '' : String(values[key]).trim();
        if (given) out[key] = given;
        else if (filter.type === 'text') out[key] = filter.default || '';
        else out[key] = filter.options[0];
      }
      return out;
    }

    function pathExists(path) {
      if (path === '*') return true;
      let node = config.data;
      for (const key of path.split('.').filter(Boolean)) {
        if (!node || typeof node !== 'object' || Array.isArray(node) || !(key in node)) return false;
        node = node[key];
      }
      return allLists(node).length > 0;
    }

    // Could this recipe find every list it needs? Values left empty drop out
    // of the path; a switch whose filter isn't chosen yet is fine if any case is.
    function canBuild(recipe, values) {
      if (recipe.recipe === 'switch') {
        const choice = recipe.cases[values[recipe.on]] || (values[recipe.on] ? recipe.default : null);
        if (choice) return canBuild(choice, values);
        return Object.values(recipe.cases).concat(recipe.default || []).some((c) => canBuild(c, values));
      }
      let paths = [];
      if (recipe.recipe === 'pick') paths = [recipe.from];
      if (recipe.recipe === 'combine') paths = recipe.parts;
      if (recipe.recipe === 'template') {
        [].concat(recipe.template).forEach((t) => t.replace(/\[([^\]]+)\]/g, (_, p) => paths.push(p)));
      }
      paths = paths.concat(Object.values(recipe.slots || {}));
      return paths.every((p) => pathExists(interpolate(p, values)));
    }

    return {
      /**
       * Which options of a dropdown make sense, given the choices in the
       * dropdowns before it (e.g. which dragon types exist for "neutral").
       */
      availableOptions(filterKey, values = {}) {
        const keys = Object.keys(config.filters || {});
        const earlier = {};
        for (const k of keys) {
          if (k === filterKey) break;
          if (values[k] != null) earlier[k] = values[k];
        }
        return config.filters[filterKey].options.filter((opt) =>
          canBuild(config, { ...earlier, [filterKey]: opt })
        );
      },

      generate(values = {}, count = 10) {
        const filled = withDefaults(values);
        const rules = config.distinct || [];
        const out = [];
        const used = new Set();
        let attempts = 0;
        const maxAttempts = count * 20;
        while (out.length < count) {
          const name = buildOne(config, filled);
          const keys = rules.length ? similarityKeys(name, rules) : [];
          attempts++;
          // Give up on looking different rather than return too few names.
          if (keys.some((k) => used.has(k)) && attempts < maxAttempts) continue;
          keys.forEach((k) => used.add(k));
          out.push(name);
        }
        return out;
      },
    };
  }

  const RecipeEngine = { createGenerator, resolveList };
  if (typeof module !== 'undefined' && module.exports) module.exports = RecipeEngine;
  else global.RecipeEngine = RecipeEngine;
})(typeof window !== 'undefined' ? window : this);
