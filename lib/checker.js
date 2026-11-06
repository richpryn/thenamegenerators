/**
 * Business Name Checker (business-name-checker.html).
 *
 * Checks a business name in the visitor's browser:
 *   - domains, live, through each registry's public RDAP service (no key);
 *   - the company register: the UK via our Companies House proxy when one
 *     is configured (CONFIG.companiesHouseApi), else links to each register;
 *   - trade marks and social handles: links that open the right search.
 * Next-step buttons (buy the domain, register the company, get a logo) come
 * from content/affiliates.json, which the build writes into CONFIG, so
 * swapping a plain link for an affiliate link is a one-line change there.
 */
(function () {
  'use strict';

  const CONFIG = window.CHECKER_CONFIG || {};
  const $ = (sel, el) => (el || document).querySelector(sel);

  function esc(text) {
    return String(text == null ? '' : text)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  // ---------- Turning a name into the forms we check ----------

  const LEGAL_ENDINGS = /\b(limited|ltd|plc|llp|llc|inc|incorporated|corp|corporation|cic|cio|lp|pllc|ltda|pty|cyf|cyfyngedig|ccc|ag|gmbh|sarl|sa)\.?$/i;

  /** The name without a legal ending: "Crumb & Co Ltd" -> "Crumb & Co". */
  function baseName(name) {
    let n = name.split(/ [–—] /)[0].trim().replace(/\s+/g, ' ');
    for (let i = 0; i < 3; i++) n = n.replace(LEGAL_ENDINGS, '').replace(/[\s,.]+$/, '');
    return n;
  }

  /** Plain ASCII letters and digits only, for domains and handles. */
  function fold(text) {
    return text.normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/&/g, ' and ').replace(/\+/g, ' plus ').replace(/@/g, ' at ')
      .toLowerCase();
  }

  /** Domain labels to try: "crumbandco" and, for 3+ words, "crumb-and-co". */
  function domainLabels(name) {
    const words = fold(baseName(name)).replace(/'/g, '').split(/[^a-z0-9]+/).filter(Boolean);
    if (!words.length) return [];
    const joined = words.join('').slice(0, 63);
    const labels = [joined];
    if (words[0] === 'the' && words.length > 1) labels.push(words.slice(1).join('').slice(0, 63));
    return labels;
  }

  /** A social handle: letters, digits, dots and underscores, max 30. */
  function handle(name) {
    return fold(baseName(name)).replace(/'/g, '').replace(/[^a-z0-9]+/g, '').slice(0, 30);
  }

  /**
   * How Companies House compares names ("same as" rules, simplified):
   * case, punctuation, "the" at the start, the legal ending and some words
   * at the end are ignored, and "&", "+", "and" and "plus" count as one.
   */
  const CH_END_WORDS = ['and company', 'and co', 'company', 'co', 'uk', 'united kingdom', 'great britain', 'gb', 'international', 'group', 'holdings', 'services', 'online', 'com', 'co uk', 'net', 'org', 'export', 'exports', 'import', 'imports'];
  function companiesHouseKey(name) {
    let n = ' ' + fold(baseName(name)).replace(/\bplus\b/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim() + ' ';
    n = n.replace(/^ the /, ' ').replace(/^ www /, ' ');
    let changed = true;
    while (changed) {
      changed = false;
      for (const w of CH_END_WORDS) {
        const end = ' ' + w + ' ';
        if (n.endsWith(end) && n.trim() !== w) { n = n.slice(0, n.length - end.length + 1); changed = true; }
      }
    }
    return n.replace(/ /g, '').toUpperCase();
  }

  // ---------- Domains (RDAP) ----------

  const RDAP = {
    com: 'https://rdap.verisign.com/com/v1/domain/',
    net: 'https://rdap.verisign.com/net/v1/domain/',
    org: 'https://rdap.publicinterestregistry.org/rdap/domain/',
    'co.uk': 'https://rdap.nominet.uk/uk/domain/',
    uk: 'https://rdap.nominet.uk/uk/domain/',
    us: 'https://rdap.nic.us/domain/',
    ca: 'https://rdap.ca.fury.ca/rdap/domain/',
    store: 'https://rdap.radix.host/rdap/domain/',
    online: 'https://rdap.radix.host/rdap/domain/',
  };

  const COUNTRY_TLDS = {
    uk: ['com', 'co.uk', 'uk', 'store'],
    us: ['com', 'us', 'net', 'store'],
    ca: ['com', 'ca', 'net', 'store'],
    other: ['com', 'net', 'org', 'store'],
  };

  async function checkDomain(domain, tld) {
    try {
      const res = await fetch(RDAP[tld] + encodeURIComponent(domain), { headers: { Accept: 'application/rdap+json' } });
      if (res.status === 404) return 'free';
      if (res.ok) return 'taken';
      return 'unknown';
    } catch (e) {
      return 'unknown';
    }
  }

  // ---------- Links and affiliate buttons ----------

  function fill(template, values) {
    return template.replace(/\{(\w+)\}/g, (_, k) => encodeURIComponent(values[k] == null ? '' : values[k]));
  }

  /** A next-step button from affiliates.json; sponsored links are marked. */
  function offerLink(offer, values, label) {
    if (!offer || !offer.url) return '';
    const rel = offer.affiliate ? 'sponsored noopener' : 'noopener';
    return `<a class="ck-btn hd tap" href="${esc(fill(offer.url, values))}" target="_blank" rel="${rel}">${esc(label || offer.label)}</a>`;
  }

  function pick(group, country) {
    if (!group) return null;
    return group[country] || group.global || null;
  }

  // ---------- Rendering ----------

  const STATUS = {
    free: ['Looks free', 'ck-free'],
    taken: ['Taken', 'ck-taken'],
    unknown: ["Couldn't check", 'ck-unknown'],
    checking: ['Checking…', 'ck-wait'],
  };

  function badge(state) {
    const [text, cls] = STATUS[state];
    return `<span class="ck-badge ${cls}">${text}</span>`;
  }

  function renderDomains(box, name, country) {
    const labels = domainLabels(name);
    if (!labels.length) { box.innerHTML = '<p>Type a name with at least one letter or number.</p>'; return; }
    const tlds = COUNTRY_TLDS[country] || COUNTRY_TLDS.other;
    const rows = [];
    labels.forEach((label, li) => tlds.forEach((tld) => {
      if (li > 0 && tld !== 'com') return; // the "without The" form: .com only
      rows.push({ domain: `${label}.${tld}`, tld });
    }));
    const registrar = pick(CONFIG.domains, country);
    box.innerHTML = `<ul class="ck-list">${rows.map((r, i) => `<li data-row="${i}"><span class="ck-item">${esc(r.domain)}</span>${badge('checking')}<span class="ck-act"></span></li>`).join('')}</ul>`;
    rows.forEach((r, i) => {
      checkDomain(r.domain, r.tld).then((state) => {
        const li = box.querySelector(`[data-row="${i}"]`);
        li.querySelector('.ck-badge').outerHTML = badge(state);
        const act = li.querySelector('.ck-act');
        if (state === 'free' && registrar) act.innerHTML = offerLink(registrar, { domain: r.domain }, `Get it at ${registrar.name}`);
        else if (state === 'taken') act.innerHTML = `<a href="https://${esc(r.domain)}" target="_blank" rel="noopener nofollow">Visit</a>`;
        else if (registrar) act.innerHTML = offerLink(registrar, { domain: r.domain }, `Check at ${registrar.name}`);
      });
    });
  }

  async function renderUkCompanies(box, name) {
    const key = companiesHouseKey(name);
    const official = `https://find-and-update.company-information.service.gov.uk/company-name-availability?q=${encodeURIComponent(baseName(name))}`;
    const intro = `<p class="ck-note">Companies House reads your name as <b>${esc(key || '…')}</b>: it ignores capitals, punctuation, "The" at the start, endings such as Ltd and words such as "Services", "Group" or "UK" at the end, and counts "&amp;" and "and" as the same.</p>`;
    const link = `<p><a class="ck-btn hd tap" href="${esc(official)}" target="_blank" rel="noopener">Check on Companies House</a></p>`;
    if (!CONFIG.companiesHouseApi) { box.innerHTML = intro + link; return; }
    box.innerHTML = `<p>${badge('checking')}</p>` + intro;
    try {
      const res = await fetch(`${CONFIG.companiesHouseApi}?q=${encodeURIComponent(baseName(name))}`);
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      const same = (data.items || []).filter((c) => companiesHouseKey(c.title) === key);
      const close = (data.items || []).filter((c) => !same.includes(c)).slice(0, 5);
      const row = (c) => `<li><span class="ck-item">${esc(c.title)}</span><small>${esc(c.status || '')}${c.date ? ' · ' + esc(c.date) : ''}</small></li>`;
      box.innerHTML = (same.length
        ? `<p>${badge('taken')} ${same.length === 1 ? 'A company with the same name is registered:' : 'Companies with the same name are registered:'}</p><ul class="ck-list">${same.map(row).join('')}</ul>`
        : `<p>${badge('free')} No UK company has the same name.</p>`)
        + (close.length ? `<p class="ck-sub">Close matches (Companies House can refuse a name that's "too like" one of these):</p><ul class="ck-list">${close.map(row).join('')}</ul>` : '')
        + intro + link;
    } catch (e) {
      box.innerHTML = `<p>${badge('unknown')}</p>` + intro + link;
    }
  }

  function renderUsCompanies(box, name) {
    const states = CONFIG.usStates || [];
    const saved = (() => { try { return localStorage.getItem('ck-state') || ''; } catch (e) { return ''; } })();
    box.innerHTML = `<p class="ck-note">There's no national register in the US: each state keeps its own, so check the state where you'll form your LLC or corporation (and any state where you'll trade under the name).</p>
      <p><label for="ck-state">Your state</label>
      <select id="ck-state" class="ck-select"><option value="">Choose a state…</option>${states.map((s) => `<option value="${esc(s.code)}"${s.code === saved ? ' selected' : ''}>${esc(s.name)}</option>`).join('')}</select></p>
      <p id="ck-state-go"></p>
      <div id="ck-state-live"></div>`;
    const select = $('#ck-state', box);
    const go = () => {
      const s = states.find((x) => x.code === select.value);
      try { localStorage.setItem('ck-state', select.value); } catch (e) { /* private mode */ }
      $('#ck-state-go', box).innerHTML = s
        ? `<a class="ck-btn hd tap" href="${esc(s.template ? fill(s.template, { q: baseName(name) }) : s.url)}" target="_blank" rel="noopener">Search ${esc(s.name)}'s business register</a>${s.template ? '' : ` <small>Type “${esc(baseName(name))}” into the search box.</small>`}`
        : '';
      const live = $('#ck-state-live', box);
      live.innerHTML = '';
      if (s && (CONFIG.usLive || {})[s.code]) {
        live.innerHTML = `<p>${badge('checking')}</p>`;
        usLiveSearch(s.code, name).then((items) => {
          if (!items) { live.innerHTML = ''; return; }
          const same = items.filter((i) => i.same);
          const row = (c) => `<li><span class="ck-item">${esc(c.title)}</span><small>${esc(c.status || '')}</small></li>`;
          live.innerHTML = (same.length
            ? `<p>${badge('taken')} Registered in ${esc(s.name)}:</p><ul class="ck-list">${same.slice(0, 5).map(row).join('')}</ul>`
            : `<p>${badge('free')} No business in ${esc(s.name)}'s open data has this exact name.</p>`)
            + (items.length > same.length ? `<p class="ck-sub">Similar names there:</p><ul class="ck-list">${items.filter((i) => !i.same).slice(0, 5).map(row).join('')}</ul>` : '')
            + `<p class="ck-small">From ${esc(s.name)}'s published business data, which can be a day or more behind. The state's own search has the final word.</p>`;
        }).catch(() => { live.innerHTML = `<p>${badge('unknown')}</p>`; });
      }
    };
    select.addEventListener('change', go);
    go();
  }

  /**
   * Live search of the states that publish their register as open data
   * (CONFIG.usLive). Names containing every main word of the name come
   * back; one that matches once the legal ending is ignored counts as taken.
   */
  const STOP = new Set(['the', 'and', 'co', 'company', 'of', 'llc', 'inc', 'ltd']);
  async function usLiveSearch(code, name) {
    const src = (CONFIG.usLive || {})[code];
    if (!src) return null;
    const words = fold(baseName(name)).replace(/'/g, '').split(/[^a-z0-9]+/).filter((w) => w.length > 1 && !STOP.has(w)).slice(0, 4);
    if (!words.length) return null;
    const where = words.map((w) => `upper(${src.field}) like '%${w.toUpperCase()}%'`).join(' AND ');
    const res = await fetch(`${src.url}?$limit=50&$select=${src.field}${src.status ? ',' + src.status : ''}&$where=${encodeURIComponent(where)}`);
    if (!res.ok) throw new Error(res.status);
    const rows = await res.json();
    const key = companiesHouseKey(name);
    const seen = new Set();
    const items = [];
    for (const r of rows) {
      const title = r[src.field];
      if (!title || seen.has(title.toUpperCase())) continue;
      seen.add(title.toUpperCase());
      items.push({ title, status: src.status ? r[src.status] : src.statusText, same: companiesHouseKey(title) === key });
    }
    items.sort((a, b) => b.same - a.same);
    return items;
  }

  function renderOtherCompanies(box, name, country) {
    const regs = (CONFIG.registers || {})[country] || [];
    box.innerHTML = regs.length
      ? `<ul class="ck-links">${regs.map((r) => `<li><a href="${esc(r.template ? fill(r.template, { q: baseName(name) }) : r.url)}" target="_blank" rel="noopener">${esc(r.name)}</a>${r.note ? ` <small>${esc(r.note)}</small>` : ''}</li>`).join('')}</ul>`
      : '<p>Search the company register in the country where you\'ll register the business.</p>';
  }

  function renderTradeMarks(box, name, country) {
    const marks = (CONFIG.tradeMarks || []).filter((t) => !t.countries || t.countries.includes(country));
    box.innerHTML = `<p class="ck-note">A registered company name isn't a trade mark. Check nobody has trade-marked the name for the same kind of business.</p>
      <ul class="ck-links">${marks.map((t) => `<li><a href="${esc(t.template ? fill(t.template, { q: baseName(name) }) : t.url)}" target="_blank" rel="noopener">${esc(t.name)}</a>${t.note ? ` <small>${esc(t.note)}</small>` : ''}</li>`).join('')}</ul>`;
  }

  function renderSocial(box, name) {
    const h = handle(name);
    const sites = [
      ['Instagram', `https://www.instagram.com/${h}/`],
      ['TikTok', `https://www.tiktok.com/@${h}`],
      ['Facebook', `https://www.facebook.com/${h}`],
      ['X', `https://x.com/${h}`],
      ['YouTube', `https://www.youtube.com/@${h}`],
      ['Pinterest', `https://www.pinterest.com/${h}/`],
    ];
    box.innerHTML = `<p class="ck-note">Your handle would be <b>@${esc(h)}</b>. Tap each one: if the page says it isn't available or doesn't exist, the handle is probably free.</p>
      <ul class="ck-links ck-social">${sites.map(([n, u]) => `<li><a href="${esc(u)}" target="_blank" rel="noopener nofollow">${n}</a></li>`).join('')}</ul>`;
  }

  function renderNext(box, name, country) {
    const values = { q: baseName(name), domain: (domainLabels(name)[0] || '') + '.com' };
    const formation = pick(CONFIG.formation, country);
    const logo = pick(CONFIG.logo, country);
    const parts = [];
    if (formation) parts.push(`<li><b>Register the business.</b> ${esc(formation.blurb || '')} ${offerLink(formation, values)}</li>`);
    if (logo) parts.push(`<li><b>Make a logo.</b> ${esc(logo.blurb || '')} ${offerLink(logo, values)}</li>`);
    const anyAffiliate = [formation, logo, pick(CONFIG.domains, country)].some((o) => o && o.affiliate);
    box.innerHTML = parts.length
      ? `<ol class="ck-steps">${parts.join('')}</ol>${anyAffiliate && CONFIG.disclosure ? `<p class="ck-disclose">${esc(CONFIG.disclosure)}</p>` : ''}`
      : '';
    box.closest('section').hidden = !parts.length;
  }

  // ---------- The form ----------

  function guessCountry() {
    const lang = (navigator.languages && navigator.languages[0]) || navigator.language || '';
    const m = /-([A-Z]{2})$/i.exec(lang);
    const region = m ? m[1].toUpperCase() : '';
    if (region === 'GB' || region === 'UK') return 'uk';
    if (region === 'US') return 'us';
    if (region === 'CA') return 'ca';
    if (region === 'AU') return 'au';
    if (region === 'IE') return 'ie';
    if (region === 'NZ') return 'nz';
    return 'other';
  }

  function run() {
    const form = $('#ck-form');
    if (!form) return;
    const input = $('#ck-name');
    const country = $('#ck-country');
    const out = $('#ck-results');
    const params = new URLSearchParams(location.search);
    if (params.get('name')) input.value = params.get('name').slice(0, 160);
    let savedCountry = '';
    try { savedCountry = localStorage.getItem('ck-country') || ''; } catch (e) { /* private mode */ }
    country.value = params.get('country') || savedCountry || guessCountry();
    if (!country.value) country.value = 'other';

    function check() {
      const name = input.value.trim().slice(0, 160);
      if (!name) { out.hidden = true; return; }
      const c = country.value;
      try { localStorage.setItem('ck-country', c); } catch (e) { /* private mode */ }
      const url = new URL(location.href);
      url.searchParams.set('name', name);
      history.replaceState(null, '', url);
      out.hidden = false;
      $('#ck-for').textContent = name;
      renderDomains($('#ck-domains'), name, ['uk', 'us', 'ca'].includes(c) ? c : 'other');
      const reg = $('#ck-register');
      if (c === 'uk') renderUkCompanies(reg, name);
      else if (c === 'us') renderUsCompanies(reg, name);
      else renderOtherCompanies(reg, name, c);
      renderTradeMarks($('#ck-marks'), name, c);
      renderSocial($('#ck-social'), name);
      renderNext($('#ck-next'), name, c);
    }

    form.addEventListener('submit', (e) => { e.preventDefault(); check(); });
    country.addEventListener('change', () => { if (input.value.trim()) check(); });
    if (input.value.trim()) check();
  }

  // Exposed for tests.
  window.NameChecker = { baseName, domainLabels, handle, companiesHouseKey };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
