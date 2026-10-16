#!/usr/bin/env node
/**
 * Prototype builder
 * -----------------------------------------------------------------
 * Reads one generator config + the shared engine and writes a single
 * SELF-CONTAINED HTML page: the engine and that generator's own data
 * are inlined, so the page fetches NOTHING at runtime.
 *
 * Contrast with the current build: every generated page loads
 * lib/generator.js and then fetches all 10 category JSON files
 * (~1.8 MB) just to render one generator + a nav dropdown.
 */
const fs = require('fs');
const path = require('path');

const engineSrc = fs.readFileSync(path.join(__dirname, 'recipe-engine.js'), 'utf8');

function escapeHtml(t) {
  return String(t == null ? '' : t)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function buildPage(config) {
  const title = escapeHtml(config.title);
  const desc = escapeHtml(config.description || '');

  // Filter <select>s, built from the config's declared filters.
  const filtersHtml = Object.entries(config.filters || {}).map(([key, f]) => {
    const opts = f.options.map((o) => {
      const label = o.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      return `<option value="${escapeHtml(o)}">${escapeHtml(label)}</option>`;
    }).join('');
    return `<label>${escapeHtml(f.label)}
        <select id="f-${escapeHtml(key)}" name="${escapeHtml(key)}">${opts}</select>
      </label>`;
  }).join('\n      ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${desc}">
  <style>
    body { font-family: system-ui, sans-serif; max-width: 640px; margin: 2rem auto; padding: 0 1rem; color: #222; }
    h1 { margin-bottom: .25rem; }
    .lead { color: #666; margin-top: 0; }
    .controls { display: flex; flex-wrap: wrap; gap: 1rem; align-items: end; margin: 1.5rem 0; }
    label { display: flex; flex-direction: column; font-size: .85rem; gap: .25rem; }
    select, input { padding: .4rem .5rem; font-size: 1rem; }
    button { padding: .6rem 1.2rem; font-size: 1rem; cursor: pointer; background: #4a90e2; color: #fff; border: 0; border-radius: 6px; }
    ul { list-style: none; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: .4rem; }
    li { background: #f4f6f9; padding: .5rem .75rem; border-radius: 6px; }
    .note { margin-top: 2rem; font-size: .8rem; color: #888; border-top: 1px solid #eee; padding-top: 1rem; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p class="lead">${desc}</p>

  <div class="controls">
      ${filtersHtml}
      <label>Count
        <input type="number" id="count" value="10" min="1" max="50">
      </label>
      <button id="go">Generate Names</button>
  </div>

  <ul id="results"><li>Click “Generate Names”.</li></ul>

  <p class="note">Self-contained page. Engine + data are inlined below — no fetches, no shared global generator.</p>

  <!-- Shared engine, inlined -->
  <script>${engineSrc}</script>

  <!-- This generator's own config + data, inlined -->
  <script>
    const CONFIG = ${JSON.stringify(config)};
    const gen = RecipeEngine.createGenerator(CONFIG);
    const results = document.getElementById('results');
    const escape = (t) => { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; };

    document.getElementById('go').addEventListener('click', () => {
      const filters = {};
      Object.keys(CONFIG.filters || {}).forEach((k) => {
        const el = document.getElementById('f-' + k);
        if (el) filters[k] = el.value;
      });
      const count = Math.min(50, Math.max(1, parseInt(document.getElementById('count').value, 10) || 10));
      try {
        const names = gen.generate(filters, count);
        results.innerHTML = names.map((n) => '<li>' + escape(n) + '</li>').join('');
      } catch (e) {
        results.innerHTML = '<li style="background:#fdd">' + escape(e.message) + '</li>';
      }
    });
  </script>
</body>
</html>`;
}

function run() {
  const dir = path.join(__dirname, 'generators');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
  for (const file of files) {
    const config = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    const out = path.join(__dirname, `${config.slug}.html`);
    fs.writeFileSync(out, buildPage(config));
    const kb = (fs.statSync(out).size / 1024).toFixed(1);
    console.log(`  built ${config.slug}.html  (${kb} KB, self-contained)`);
  }
}

run();
