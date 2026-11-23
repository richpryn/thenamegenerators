/*
 * The Name Generators: for pages that embed one of our generators.
 * Optional. It lets each embedded generator grow to fit its names; without it
 * the frame keeps the height set in its code. https://thenamegenerators.com/embed-name-generators.html
 */
(function () {
  if (window.__tngEmbed) return;
  window.__tngEmbed = true;
  window.addEventListener('message', function (e) {
    var origin = e.origin;
    if (origin !== 'https://thenamegenerators.com' && origin !== window.location.origin) return;
    if (!e.data || typeof e.data.tngEmbedHeight !== 'number') return;
    var frames = document.querySelectorAll('iframe[data-tng-embed]');
    for (var i = 0; i < frames.length; i++) {
      if (frames[i].contentWindow === e.source) {
        frames[i].style.height = Math.min(Math.max(e.data.tngEmbedHeight, 200), 3000) + 'px';
      }
    }
  });
})();
