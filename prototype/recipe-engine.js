/**
 * Recipe Engine (prototype)
 * ------------------------------------------------------------------
 * One small, generic engine that builds names by FOLLOWING the recipe
 * declared in each generator's own config. It knows nothing about
 * "elves" or "vampires" — those rules live in the data, not here.
 *
 * Compare with lib/generator.js, where generateNames() is ~1,000 lines
 * of `if (generatorKey === 'vampire') { ... }` special cases. Adding a
 * generator there means editing the engine; here it means writing a
 * JSON file.
 *
 * Supported recipes (enough to cover the whole current site):
 *   - "pick":    choose one name from a single list.
 *                { recipe:"pick", from:"{gender}.{origin}" }
 *   - "combine": take one item from each part and join them.
 *                { recipe:"combine", parts:["{gender}","surnames"], join:" " }
 *   - "template":fill [slots] in a string with items from lists.
 *                { recipe:"template", template:"{prefix} {suffix}" }
 *
 * Each recipe draws without repeats (a shuffled pool per list, reshuffled
 * when exhausted) — same anti-repetition behaviour the current site has,
 * but implemented once instead of per generator.
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

  // "a.b" -> obj.a.b
  function resolve(obj, path) {
    return path.split('.').reduce((node, key) => (node == null ? node : node[key]), obj);
  }

  // "{gender}.{origin}" + {gender:"male",origin:"dnd"} -> "male.dnd"
  function interpolate(path, filters) {
    return path.replace(/\{(\w+)\}/g, (_, name) => filters[name]);
  }

  function createGenerator(config) {
    const pools = new Map(); // resolved list path -> { shuffled, index }

    // Draw one non-repeating item from the list at `key`.
    function drawFrom(key) {
      const list = resolve(config.data, key);
      if (!Array.isArray(list) || list.length === 0) {
        throw new Error(`No name list found at "${key}" for ${config.slug}`);
      }
      let pool = pools.get(key);
      if (!pool || pool.index >= pool.shuffled.length) {
        pool = { shuffled: shuffle(list), index: 0 };
        pools.set(key, pool);
      }
      return String(pool.shuffled[pool.index++]).trim();
    }

    function buildOne(filters) {
      switch (config.recipe) {
        case 'pick':
          return drawFrom(interpolate(config.from, filters));

        case 'combine':
          return config.parts
            .map((part) => drawFrom(interpolate(part, filters)))
            .join(config.join || ' ');

        case 'template':
          // Replace each {listName} token with a draw from that list.
          return config.template.replace(/\{(\w+)\}/g, (_, listName) =>
            drawFrom(interpolate(listName, filters))
          );

        default:
          throw new Error(`Unknown recipe "${config.recipe}" for ${config.slug}`);
      }
    }

    return {
      title: config.title,
      description: config.description,
      filters: config.filters || {},
      generate(filters = {}, count = 10) {
        const out = [];
        for (let i = 0; i < count; i++) out.push(buildOne(filters));
        return out;
      },
    };
  }

  global.RecipeEngine = { createGenerator };
})(typeof window !== 'undefined' ? window : this);
