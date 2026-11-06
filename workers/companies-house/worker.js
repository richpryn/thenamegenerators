/**
 * Companies House proxy for the Business Name Checker.
 *
 * GET /?q=<name>  ->  { items: [{ title, number, status, date }] }
 *
 * The Companies House key lives only here, as the Worker secret CH_API_KEY,
 * never in the website's code. Only thenamegenerators.com may call it,
 * answers are cached for a day, and each visitor is limited to a few
 * lookups a minute, so the site stays well inside Companies House's limit
 * of 600 requests every 5 minutes.
 */
const ALLOWED_ORIGINS = ['https://thenamegenerators.com', 'https://www.thenamegenerators.com'];
const PER_MINUTE = 20;
const hits = new Map(); // ip -> [count, minute]

function cors(origin) {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET',
    Vary: 'Origin',
  };
}

function json(body, status, origin, extra) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors(origin), ...(extra || {}) },
  });
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors(origin) });
    if (request.method !== 'GET') return json({ error: 'GET only' }, 405, origin);
    if (origin && !ALLOWED_ORIGINS.includes(origin)) return json({ error: 'Not allowed' }, 403, origin);

    const url = new URL(request.url);
    const q = (url.searchParams.get('q') || '').trim().slice(0, 160);
    if (!q) return json({ error: 'Missing q' }, 400, origin);

    // Simple per-visitor limit (per Worker instance; good enough to stop abuse).
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const minute = Math.floor(Date.now() / 60000);
    const [count, at] = hits.get(ip) || [0, minute];
    const now = at === minute ? count + 1 : 1;
    hits.set(ip, [now, minute]);
    if (now > PER_MINUTE) return json({ error: 'Too many checks, try again in a minute' }, 429, origin);

    // Cached answer for the same name (case-insensitive) for a day.
    const cache = caches.default;
    const cacheKey = new Request(`https://cache.internal/ch?q=${encodeURIComponent(q.toLowerCase())}`);
    const cached = await cache.match(cacheKey);
    if (cached) {
      const body = await cached.text();
      return new Response(body, { headers: { 'Content-Type': 'application/json', ...cors(origin), 'X-Cache': 'HIT' } });
    }

    const api = `https://api.company-information.service.gov.uk/search/companies?q=${encodeURIComponent(q)}&items_per_page=20`;
    const res = await fetch(api, { headers: { Authorization: 'Basic ' + btoa(env.CH_API_KEY + ':') } });
    if (!res.ok) return json({ error: 'Companies House unavailable', status: res.status }, 502, origin);
    const data = await res.json();
    const items = (data.items || []).map((c) => ({
      title: c.title,
      number: c.company_number,
      status: c.company_status,
      date: c.date_of_creation,
    }));
    const body = JSON.stringify({ items });
    ctx.waitUntil(cache.put(cacheKey, new Response(body, { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'max-age=86400' } })));
    return new Response(body, { headers: { 'Content-Type': 'application/json', ...cors(origin), 'X-Cache': 'MISS' } });
  },
};
