/**
 * Cookie consent. Google Analytics only loads after the visitor accepts.
 * The choice is kept in localStorage ("granted" or "denied"); until there is
 * one, a small banner asks. window.tngConsent.open() shows the banner again
 * (used by the "Change cookie settings" button on privacy.html).
 */
(function () {
  var GA_ID = 'G-R34WKHG3SR';
  var KEY = 'tng-consent';

  function read() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function save(value) {
    try { localStorage.setItem(KEY, value); } catch (e) { /* private mode: ask again next page */ }
  }

  function loadAnalytics() {
    if (window.gtag) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }

  // Remove the _ga cookies Google Analytics set, on this host and its parent domain.
  function clearAnalyticsCookies() {
    var host = location.hostname;
    var domains = ['', host, '.' + host, '.' + host.replace(/^www\./, '')];
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (!/^_ga/.test(name)) return;
      domains.forEach(function (d) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + (d ? '; domain=' + d : '');
      });
    });
  }

  function choose(value) {
    save(value);
    var bar = document.getElementById('consent');
    if (bar) bar.remove();
    if (value === 'granted') {
      loadAnalytics();
    } else if (window.gtag) {
      // They had accepted on this page and changed their mind: stop and tidy up.
      window['ga-disable-' + GA_ID] = true;
      clearAnalyticsCookies();
    } else {
      clearAnalyticsCookies();
    }
    document.dispatchEvent(new CustomEvent('tng-consent', { detail: value }));
  }

  function open() {
    if (document.getElementById('consent')) return;
    var bar = document.createElement('div');
    bar.id = 'consent';
    bar.className = 'consent';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Cookie choice');
    bar.innerHTML =
      '<p>Can we use Google Analytics cookies to see which generators people use? ' +
      'Nothing is set unless you say yes. <a href="/privacy.html">Privacy</a></p>' +
      '<div class="consent-btns">' +
      '<button type="button" class="consent-btn hd" data-choice="granted">Accept</button>' +
      '<button type="button" class="consent-btn hd" data-choice="denied">Reject</button>' +
      '</div>';
    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-choice]');
      if (btn) choose(btn.getAttribute('data-choice'));
    });
    document.body.appendChild(bar);
  }

  window.tngConsent = { open: open, choice: read };

  var choice = read();
  if (choice === 'granted') {
    loadAnalytics();
  } else if (choice !== 'denied') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', open);
    else open();
  }
})();
