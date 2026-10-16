# Recipe-engine prototype

A side-by-side demo of the **declarative recipe** approach for `elf` and
`vampire`, so you can compare it with the current code before converting all 66
generators. Nothing here touches the live site.

## Try it

Open either file directly in a browser (double-click works — no server needed):

- `elf-name-generator.html`
- `vampire-name-generator.html`

## What's in here

| File | What it is |
|------|------------|
| `recipe-engine.js` | The entire engine — ~90 lines, generic, knows nothing about elves or vampires. |
| `generators/elf.json` | Elf config: data **plus** the recipe for building names. |
| `generators/vampire.json` | Vampire config, same idea. |
| `build-prototype.js` | Inlines the engine + one config into a self-contained page. |
| `*-name-generator.html` | The built pages (open these). |

## The core idea

**Today**, the rule "how do I build a name" lives in `lib/generator.js`, keyed by
generator name:

```js
// lib/generator.js — ~1,000 lines of this
if (generatorKey === 'vampire') { /* combine first + surname */ }
if (generatorKey === 'elf')     { /* walk data[gender][origin] */ }
if (generatorKey === 'guild')   { /* prefix + suffix */ }
// ...a dozen more special cases
```

Every new *kind* of generator = another branch in that one file. That's why it
became "one huge generator."

**In the prototype**, the rule moves into the generator's own JSON:

```jsonc
// generators/vampire.json
{
  "recipe": "combine",            // take one item from each part...
  "parts": ["{gender}", "surnames"],
  "join": " ",                    // ...and join with a space
  "filters": { "gender": { "options": ["male", "female", "non_binary"] } },
  "data": { "male": [...], "female": [...], "surnames": [...] }
}

// generators/elf.json
{
  "recipe": "pick",               // pick one name from a single list
  "from": "{gender}.{origin}",    // which list depends on the filters
  "data": { "male": { "tolkien": [...], "dnd": [...] }, ... }
}
```

The engine just **follows the recipe**. Three recipes — `pick`, `combine`,
`template` — already cover essentially everything the current site does
(vampire/dnd_fantasy = `combine`; elf/dwarf/etc = `pick`; guild/clan/sword
formats = `template`).

## Why this is better

| | Current site | Prototype |
|---|---|---|
| Add a generator | Edit the 1,000-line engine | Add one JSON file |
| Engine size | ~1,000 lines, growing | ~90 lines, fixed |
| Data loaded per page | **~1.8 MB** (all 10 category files) | **~2 KB** (just this generator) |
| Runtime fetches | Several | **Zero** (data inlined) |
| Works offline / `file://` | No (`alert()`s and fails) | Yes |
| One generator breaking others | Easy (shared file) | Impossible (isolated) |

## What a full migration would add back

This prototype is deliberately minimal to make the comparison clear. The real
pages would keep your existing SEO stack: the `<head>` meta/OG/Twitter tags,
JSON-LD schema, the article body + FAQs, nav, related generators, and styling.
None of that conflicts with the recipe engine — it only replaces the tangled
name-building logic underneath.

The 1,000-line `lib/generator.js` collapses to this ~90-line engine plus one
small config per generator.
