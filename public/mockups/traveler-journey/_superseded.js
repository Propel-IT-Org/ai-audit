/* Soft feedback-mode banner for the mockups (the team's quick-comment surface).
   Mockups mirror the live design but let reviewers see every screen-state without
   running a search. Use the Feedback panel on the right to comment per screen. */
(function () {
  if (/sitemap\.html$/.test(location.pathname)) return; // sitemap is a live IA map
  var bar = document.createElement("div");
  bar.style.cssText =
    "position:sticky;top:0;z-index:99999;background:#F4F1EA;color:#18243F;" +
    "font:600 12.5px/1.45 Inter,system-ui,sans-serif;padding:7px 14px;display:flex;" +
    "gap:8px;align-items:center;justify-content:center;flex-wrap:wrap;text-align:center;" +
    "border-bottom:1px solid #E6E0D2;";
  bar.innerHTML =
    "✏️ Mockup preview — leave feedback on any screen with the panel · " +
    '<a href="/concept-traveler-journey/sitemap.html" style="color:#4E69A8;text-decoration:underline;font-weight:700;">↑ sitemap index</a>';
  document.body.insertBefore(bar, document.body.firstChild);
})();
