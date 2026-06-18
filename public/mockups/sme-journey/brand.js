/* ===========================================================================
   AIVIBLE brand injector — Japan Blue Index refinement
   - logoMark(): concept #5 Ukiyo-e wave mark (used in every header)
   - shirube():     concept #3 mascot (chat assistant avatar + hero greeters)
   Runs on every v2 screen; swaps the old "●" dot and the "✨" chat avatars
   so the whole funnel reads as one brand without editing 9 headers by hand.
   =========================================================================== */
(function () {
  // ---- Ukiyo-e wave logo mark (concept #5) ----
  function logoMark(size) {
    size = size || 26;
    return '<svg class="av-logo__mark" width="' + size + '" height="' + size + '" viewBox="0 0 32 32" aria-hidden="true">' +
      '<rect width="32" height="32" rx="8" fill="#F5EEDC"/>' +
      '<circle cx="22.5" cy="9.5" r="4.3" fill="#D6452C"/>' +
      '<path d="M0 23 C5.5 16 10.5 27 16 21.5 C21 16.5 26.5 25 32 19.5 L32 32 L0 32 Z" fill="#1F4788"/>' +
      '<circle cx="8.5" cy="23" r="1.25" fill="#fff"/>' +
      '<circle cx="17.5" cy="25" r="1" fill="#fff"/>' +
      '<circle cx="25.5" cy="24" r="1" fill="#fff"/>' +
      '</svg>';
  }

  // ---- Shirube mascot (concept #3) ----
  function shirube(size) {
    size = size || 32;
    return '<svg class="shirube" width="' + size + '" height="' + size + '" viewBox="0 0 64 64" aria-hidden="true">' +
      '<defs><linearGradient id="shirubeG" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#6E80E0"/><stop offset="1" stop-color="#4A5DC4"/></linearGradient></defs>' +
      '<path d="M32 3 C49 3 59 14 59 32 C59 49 50 61 32 61 C14 61 5 49 5 32 C5 14 15 3 32 3 Z" fill="url(#shirubeG)"/>' +
      '<ellipse cx="24" cy="30" rx="3.4" ry="4.6" fill="#fff"/>' +
      '<ellipse cx="40" cy="30" rx="3.4" ry="4.6" fill="#fff"/>' +
      '<circle cx="24.6" cy="31.6" r="1.7" fill="#2A2A4A"/>' +
      '<circle cx="40.6" cy="31.6" r="1.7" fill="#2A2A4A"/>' +
      '<path d="M27 41 Q32 46 37 41" stroke="#2A2A4A" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
      '<g transform="rotate(-10 47 47)"><rect x="41" y="41" width="13" height="13" rx="2.5" fill="#E0344A" stroke="#fff" stroke-width="1.5"/>' +
      '<text x="47.5" y="50.7" font-size="9" font-weight="700" fill="#fff" text-anchor="middle" font-family="serif">藍</text></g>' +
      '</svg>';
  }

  window.AivibleBrand = { logoMark: logoMark, shirube: shirube };

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    // 1) every "●" japan-red dot -> wave logo mark
    document.querySelectorAll('span.japan-red').forEach(function (el) {
      if (el.textContent.trim() === '●') {
        var size = el.classList.contains('text-xl') ? 26 : (el.classList.contains('text-lg') ? 23 : 18);
        var holder = document.createElement('span');
        holder.style.lineHeight = '0';
        holder.innerHTML = logoMark(size);
        el.replaceWith(holder.firstChild);
      }
    });

    // 2) editor chat "✨" gradient avatars -> Shirube mascot
    document.querySelectorAll('span').forEach(function (el) {
      if (el.textContent.trim() === '✨' && /rounded-full/.test(el.className) && /(from-indigo|from-purple|gradient)/.test(el.className)) {
        var sz = el.classList.contains('w-8') ? 30 : (el.classList.contains('w-7') ? 26 : 24);
        ['bg-gradient-to-br', 'from-indigo-500', 'to-purple-500', 'text-white', 'text-sm', 'text-xs'].forEach(function (c) { el.classList.remove(c); });
        el.style.background = 'transparent';
        el.innerHTML = shirube(sz);
      }
    });
  });
})();
