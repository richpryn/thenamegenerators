/**
 * Hand-drawn outlines for the "Grown Up B" design.
 *
 * Every element with class "hd" gets a wobbly marker outline drawn as an SVG
 * on its own box. Elements that also have class "tap" get the black offset
 * shadow that means "you can tap this". Colours come from CSS (--fill, --ink).
 *
 * Outlines are redrawn when an element changes size, when web fonts finish
 * loading and on page load. Elements added later (for example new results)
 * are picked up automatically. Each element keeps its own random seed, so
 * redraws don't jitter.
 */
(function (global) {
  'use strict';
  if (typeof document === 'undefined') return;

  var NS = 'http://www.w3.org/2000/svg';
  var nextSeed = 11;

  function rng(el) {
    if (!el._hdSeed) { el._hdSeed = nextSeed; nextSeed = (nextSeed * 7 + 13) % 997 + 1; }
    var s = el._hdSeed * 131;
    return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  }

  function outline(w, h, j, rnd) {
    var r = Math.min(9, h / 3);
    var J = function () { return (rnd() - 0.5) * 2 * j; };
    var p = [[r + J(), J()], [w / 2 + J(), J() * 0.8], [w - r + J(), J()], [w + J(), r + J()], [w + J() * 0.8, h / 2 + J()], [w + J(), h - r + J()],
      [w - r + J(), h + J()], [w / 2 + J(), h + J() * 0.8], [r + J(), h + J()], [J(), h - r + J()], [J() * 0.8, h / 2 + J()], [J(), r + J()]];
    var c = [[w, 0], [w, h], [0, h], [0, 0]];
    var f = function (n) { return n.toFixed(1); };
    var d = 'M' + f(p[0][0]) + ' ' + f(p[0][1]);
    for (var i = 0; i < 4; i++) {
      var a = p[i * 3 + 1], b = p[i * 3 + 2], n = p[(i * 3 + 3) % 12];
      d += ' L' + f(a[0]) + ' ' + f(a[1]) + ' L' + f(b[0]) + ' ' + f(b[1]) +
        ' Q' + f(c[i][0] + J() * 0.5) + ' ' + f(c[i][1] + J() * 0.5) + ' ' + f(n[0]) + ' ' + f(n[1]);
    }
    return d + ' L' + f(p[0][0] + 5) + ' ' + f(p[0][1] + J());
  }

  // Sizes are set inline so no icon rule (".go svg" etc.) can shrink the outline.
  function svg(cls, w, h, inner) {
    var s = document.createElementNS(NS, 'svg');
    s.setAttribute('class', cls);
    s.setAttribute('width', w);
    s.setAttribute('height', h);
    s.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    s.setAttribute('aria-hidden', 'true');
    s.setAttribute('focusable', 'false');
    s.style.width = w + 'px';
    s.style.height = h + 'px';
    s.innerHTML = inner;
    return s;
  }

  function draw(el, force) {
    var w = el.offsetWidth, h = el.offsetHeight;
    if (!w || !h) return;
    if (!force && el._hdW === w && el._hdH === h && el.classList.contains('drawn')) return;
    el._hdW = w; el._hdH = h;
    var old = el.querySelectorAll(':scope > svg.o, :scope > svg.s');
    for (var i = 0; i < old.length; i++) old[i].remove();
    var rnd = rng(el), j = Math.min(1.6, Math.max(0.8, h / 30));
    var main = outline(w, h, j, rnd), sketch = outline(w, h, j * 1.4, rnd);
    el.prepend(svg('o', w, h, '<path class="f" d="' + main + '"/><path class="k" d="' + sketch + '"/>'));
    if (el.classList.contains('tap')) el.prepend(svg('s', w, h, '<path d="' + main + '"/>'));
    el.classList.add('drawn');
  }

  var ro = typeof ResizeObserver !== 'undefined'
    ? new ResizeObserver(function (entries) { entries.forEach(function (e) { draw(e.target); }); })
    : null;

  function watch(root) {
    var els = (root || document).querySelectorAll('.hd');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el._hdWatched) { draw(el); continue; }
      el._hdWatched = true;
      draw(el);
      if (ro) ro.observe(el);
    }
  }

  function redrawAll() {
    var els = document.querySelectorAll('.hd');
    for (var i = 0; i < els.length; i++) draw(els[i], true);
  }

  function start() {
    watch(document);
    if (typeof MutationObserver !== 'undefined') {
      new MutationObserver(function (records) {
        for (var i = 0; i < records.length; i++) {
          var added = records[i].addedNodes;
          for (var k = 0; k < added.length; k++) {
            var node = added[k];
            if (node.nodeType !== 1) continue;
            if (node.classList.contains('hd')) watch(node.parentNode);
            else if (node.querySelector && node.querySelector('.hd')) watch(node);
          }
        }
      }).observe(document.body, { childList: true, subtree: true });
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(redrawAll);
    global.addEventListener('load', redrawAll);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  global.Outline = { watch: watch, draw: draw, redrawAll: redrawAll };
})(typeof window !== 'undefined' ? window : this);
