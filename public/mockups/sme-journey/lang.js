// EN/JP toggle — same pattern as mockup v1, shared across pages.
// Elements opt in with data-en / data-jp (innerHTML, simple inline tags allowed)
// and data-en-ph / data-jp-ph for input placeholders.
(function () {
  function apply(l) {
    document.querySelectorAll('[data-en]').forEach(function (el) {
      el.innerHTML = l === 'jp' ? (el.dataset.jp || el.dataset.en) : el.dataset.en;
    });
    document.querySelectorAll('[data-en-ph]').forEach(function (el) {
      el.placeholder = l === 'jp' ? (el.dataset.jpPh || el.dataset.enPh) : el.dataset.enPh;
    });
    document.querySelectorAll('[data-lang-toggle]').forEach(function (b) {
      b.textContent = l === 'jp' ? 'EN' : '日本語';
      b.dataset.target = l === 'jp' ? 'en' : 'jp';
    });
    document.documentElement.lang = l === 'jp' ? 'ja' : 'en';
    localStorage.setItem('aivible-mock-lang', l);
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-lang-toggle]');
    if (t) { e.preventDefault(); apply(t.dataset.target || 'jp'); }
  });
  apply(localStorage.getItem('aivible-mock-lang') || 'en');
})();
