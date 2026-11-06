#!/usr/bin/env node
/**
 * How many different names each generator can make.
 *
 *   node scripts/capacity.js elf            every filter combination of one generator
 *   node scripts/capacity.js elf 200        ...and list those under 200
 *   node scripts/capacity.js --thinnest 15  the 15 generators with the fewest names
 *                                           in their weakest combination
 *
 * Counts are sampled (it keeps generating until no new names turn up), so
 * they are a floor, not an exact total. Text boxes use their example value.
 */
const fs = require('fs');
const path = require('path');
const Engine = require('../lib/recipe-engine.js');

const DIR = path.join(__dirname, '..', 'content', 'generators');
const CAP = 400; // stop counting past this: enough to know a combination is fine

function combos(config) {
  const gen = Engine.createGenerator(config);
  const keys = Object.keys(config.filters || {}).filter((k) => config.filters[k].type !== 'text' && k !== config.startsWith);
  let out = [{}];
  for (const k of keys) out = out.flatMap((c) => gen.availableOptions(k, c).map((o) => ({ ...c, [k]: o })));
  for (const [k, f] of Object.entries(config.filters || {})) {
    if (f.type === 'text') out.forEach((c) => { c[k] = f.example || f.default || 'Sam'; });
  }
  return { gen, combos: out };
}

function count(gen, values) {
  const seen = new Set();
  let quiet = 0;
  while (seen.size < CAP && quiet < 30) {
    const before = seen.size;
    gen.generate(values, 10).forEach((n) => seen.add(n));
    quiet = seen.size === before ? quiet + 1 : 0;
  }
  return seen.size;
}

function load(key) {
  return { key, ...JSON.parse(fs.readFileSync(path.join(DIR, `${key}.json`), 'utf8')) };
}

const [arg, n] = process.argv.slice(2);
if (arg === '--thinnest') {
  const rows = fs.readdirSync(DIR).filter((f) => f.endsWith('.json')).map((f) => {
    const config = load(path.basename(f, '.json'));
    const { gen, combos: list } = combos(config);
    let low = { n: Infinity, values: {} };
    for (const values of list) {
      const c = count(gen, values);
      if (c < low.n) low = { n: c, values };
    }
    return { key: config.key, low };
  }).sort((a, b) => a.low.n - b.low.n);
  rows.slice(0, Number(n) || 15).forEach((r) => console.log(`${String(r.low.n).padStart(4)}  ${r.key}  ${JSON.stringify(r.low.values)}`));
} else if (arg) {
  const config = load(arg);
  const { gen, combos: list } = combos(config);
  const min = Number(n) || 0;
  const low = [];
  for (const values of list) {
    const c = count(gen, values);
    if (!min) console.log(`${String(c).padStart(4)}  ${JSON.stringify(values)}`);
    else if (c < min) low.push(`${c}  ${JSON.stringify(values)}`);
  }
  if (min) console.log(low.length ? `${arg}: ${low.length} combination(s) under ${min}\n  ${low.join('\n  ')}` : `${arg}: every combination has ${min}+`);
} else {
  console.log('Usage: node scripts/capacity.js <key> [minimum] | --thinnest [n]');
}
