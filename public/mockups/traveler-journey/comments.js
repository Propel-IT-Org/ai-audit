/* ===========================================================================
   AIVIBLE — team feedback sidebar (customer-journey concept review)
   Injects a collapsible right-hand panel on every v2 screen so teammates can
   leave per-screen comments. Backed by the SAME Supabase project as the
   branding poll (anon insert/read on table `journey_comments`).
   Self-contained — no build step, no deps. Hidden inside iframes/previews.
   =========================================================================== */
(function () {
  if (window.self !== window.top) return;                 // don't show in embedded previews
  if (/(^|[?&])clean=1/.test(location.search)) return;    // ?clean=1 hides it for screenshots

  var SUPABASE_URL = "https://gldlokzjeexlqlwolfnq.supabase.co";
  var ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsZGxva3pqZWV4bHFsd29sZm5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MTQ4MzIsImV4cCI6MjA4NzE5MDgzMn0.oYhbtsjMsSfgRrnoRPcYXysB5HudUOkl6ec3OJVTFIw";
  var REST = SUPABASE_URL + "/rest/v1/journey_comments";
  var HEADERS = { "apikey": ANON_KEY, "Authorization": "Bearer " + ANON_KEY, "Content-Type": "application/json" };

  var NAME_KEY = "aivible-journey-name";
  var SEEN_KEY = "aivible-journey-cmt-seen";   // set once they click the tab — stops the reminder bump

  // ---- which screen are we on? ----
  var SCREENS = {
    // front door
    "indexmock.html": "T0 · Front door (choose journey)",
    // traveler journey
    "plan-start.html": "T1 · Plan a trip",
    "trip-canvas.html": "T2 · Trip planner (Shirube chat)",
    "discover.html": "T3 · Add places (search)",
    "itinerary.html": "T4 · Itinerary",
    "itinerary-stop.html": "T5 · Stop detail",
    "businesses.html": "T6 · Verified directory",
    // SME journey
    "index.html": "S1 · Audit",
    "analyzing.html": "S2 · Analyzing (ChatGPT)",
    "results.html": "S3 · Score & Offer",
    "login.html": "S4 · Login",
    "generating.html": "S5 · Generating + Itinerary",
    "editor.html": "S6 · Editor",
    "editor-2.html": "S7 · Editor (after edit)",
    "editor-paywall.html": "S8 · Paywall",
    "sov.html": "S9 · SoV report",
    "storefront.html": "S10 · Public storefront"
  };
  var file = (location.pathname.split("/").pop() || "index.html");
  if (file === "") file = "index.html";
  var label = SCREENS[file] || file;

  function esc(s) { return (s || "").replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function ago(iso) {
    var d = (Date.now() - new Date(iso).getTime()) / 1000;
    if (d < 60) return "just now";
    if (d < 3600) return Math.floor(d / 60) + "m ago";
    if (d < 86400) return Math.floor(d / 3600) + "h ago";
    return Math.floor(d / 86400) + "d ago";
  }

  // ---- styles ----
  var css = document.createElement("style");
  css.textContent =
    "#avc-tab{position:fixed;top:50%;right:0;transform:translateY(-50%);z-index:99998;background:#18243F;color:#fff;" +
      "writing-mode:vertical-rl;font:700 12px/1 Inter,sans-serif;letter-spacing:.08em;padding:14px 8px;border-radius:12px 0 0 12px;" +
      "cursor:pointer;box-shadow:-4px 0 14px rgba(24,36,63,.25);border:none;}" +
    "#avc-tab b{color:#C8A859;}" +
    "#avc-tab.avc-bump{animation:avcBump 1.5s ease-in-out infinite;}" +
    "@keyframes avcBump{0%,100%{transform:translateY(-50%);}30%{transform:translateY(calc(-50% - 8px));}60%{transform:translateY(calc(-50% + 3px));}}" +
    "#avc-panel{position:fixed;top:0;right:0;height:100vh;width:340px;max-width:88vw;z-index:99999;background:#fff;" +
      "box-shadow:-12px 0 36px rgba(24,36,63,.22);transform:translateX(100%);transition:transform .28s ease;" +
      "display:flex;flex-direction:column;font-family:Inter,'Zen Kaku Gothic New',sans-serif;}" +
    "#avc-panel.open{transform:translateX(0);}" +
    "#avc-head{background:#18243F;color:#fff;padding:14px 16px;}" +
    "#avc-head .eb{font-size:.58rem;font-weight:800;letter-spacing:.24em;text-transform:uppercase;color:#C8A859;}" +
    "#avc-head .sc{font-size:15px;font-weight:700;margin-top:2px;}" +
    "#avc-close{position:absolute;top:12px;right:14px;background:none;border:none;color:#fff;font-size:20px;cursor:pointer;line-height:1;opacity:.8;}" +
    "#avc-form{padding:12px 16px;border-bottom:1px solid #eef0f4;}" +
    "#avc-form input,#avc-form textarea{width:100%;border:1px solid #d7dbe4;border-radius:9px;padding:9px 11px;font-size:13px;font-family:inherit;box-sizing:border-box;}" +
    "#avc-form input:focus,#avc-form textarea:focus{outline:none;border-color:#223A70;box-shadow:0 0 0 2px rgba(34,58,112,.15);}" +
    "#avc-form textarea{margin-top:8px;resize:vertical;min-height:64px;}" +
    ".avc-chip{display:flex;align-items:center;gap:6px;font-size:13px;color:#2b3142;background:#EEF1F8;border:1px solid #D9E0F1;border-radius:9px;padding:9px 11px;}" +
    ".avc-chip b{color:#223A70;font-weight:700;}" +
    "#avc-forget{margin-left:auto;background:none;border:none;color:#9aa1b1;font-size:17px;line-height:1;cursor:pointer;padding:0 2px;}" +
    "#avc-forget:hover{color:#dc2626;}" +
    "#avc-send{margin-top:8px;width:100%;background:#223A70;color:#fff;font-weight:700;border:none;border-radius:10px;padding:11px;font-size:14px;cursor:pointer;}" +
    "#avc-send:hover{background:#18243F;}" +
    "#avc-msg{font-size:12px;margin-top:7px;min-height:14px;}" +
    "#avc-list{flex:1;overflow-y:auto;padding:12px 16px 40px;background:#F7F8FB;}" +
    "#avc-list .empty{color:#9aa1b1;font-size:13px;text-align:center;padding:24px 8px;}" +
    ".avc-c{background:#fff;border:1px solid #eceef3;border-radius:11px;padding:10px 12px;margin-bottom:9px;}" +
    ".avc-c .meta{font-size:11px;color:#8b93a6;margin-bottom:3px;}" +
    ".avc-c .meta b{color:#223A70;font-weight:700;}" +
    ".avc-c .txt{font-size:13px;color:#2b3142;white-space:pre-wrap;line-height:1.45;}" +
    "#avc-allnote{font-size:11px;color:#9aa1b1;padding:0 16px 12px;background:#F7F8FB;}";
  document.head.appendChild(css);

  // ---- tab handle ----
  var tab = document.createElement("button");
  tab.id = "avc-tab";
  tab.innerHTML = '💬 Feedback <b id="avc-count"></b>';
  document.body.appendChild(tab);

  // ---- panel ----
  var panel = document.createElement("div");
  panel.id = "avc-panel";
  panel.innerHTML =
    '<div id="avc-head">' +
      '<button id="avc-close" aria-label="close">×</button>' +
      '<div class="eb">Team feedback</div>' +
      '<div class="sc">' + esc(label) + "</div>" +
    "</div>" +
    '<div id="avc-form">' +
      '<div id="avc-id"></div>' +
      '<textarea id="avc-body" placeholder="Thoughts on this screen? (copy, layout, the F-grade story…)"></textarea>' +
      '<button id="avc-send">Post comment</button>' +
      '<div id="avc-msg"></div>' +
    "</div>" +
    '<div id="avc-allnote">Comments are per-screen — each screen has its own thread.</div>' +
    '<div id="avc-list"><div class="empty">Loading…</div></div>';
  document.body.appendChild(panel);

  var bodyEl = panel.querySelector("#avc-body");
  var sendEl = panel.querySelector("#avc-send");
  var msgEl = panel.querySelector("#avc-msg");
  var listEl = panel.querySelector("#avc-list");
  var countEl = tab.querySelector("#avc-count");

  // ---- remembered identity: once you've commented, we keep your name (clear with ×) ----
  function storedName() { try { return localStorage.getItem(NAME_KEY) || ""; } catch (e) { return ""; } }
  function setStoredName(n) { try { if (n) localStorage.setItem(NAME_KEY, n); else localStorage.removeItem(NAME_KEY); } catch (e) {} }
  function currentName() {
    var n = storedName();
    if (n) return n;
    var inp = panel.querySelector("#avc-name");
    return inp ? inp.value.trim() : "";
  }
  function renderIdentity() {
    var idEl = panel.querySelector("#avc-id");
    var n = storedName();
    if (n) {
      idEl.innerHTML = '<div class="avc-chip">Commenting as <b></b><button id="avc-forget" title="Not you? Remove" aria-label="remove name">×</button></div>';
      idEl.querySelector("b").textContent = n;                 // textContent = XSS-safe
      idEl.querySelector("#avc-forget").addEventListener("click", function () { setStoredName(""); renderIdentity(); });
    } else {
      idEl.innerHTML = '<input id="avc-name" type="text" placeholder="Your name" autocomplete="name" />';
    }
  }
  renderIdentity();

  function setOpen(open) {
    panel.classList.toggle("open", open);
    tab.style.display = open ? "none" : "block";
  }
  function isSeen() { try { return localStorage.getItem(SEEN_KEY) === "1"; } catch (e) { return false; } }
  function markSeen() { try { localStorage.setItem(SEEN_KEY, "1"); } catch (e) {} tab.classList.remove("avc-bump"); }
  tab.addEventListener("click", function () { markSeen(); setOpen(true); });
  panel.querySelector("#avc-close").addEventListener("click", function () { markSeen(); setOpen(false); });

  // ---- load comments for this screen ----
  function load() {
    fetch(REST + "?screen=eq." + encodeURIComponent(file) + "&order=created_at.desc&select=*", { headers: HEADERS })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (rows) {
        countEl.textContent = rows.length ? "(" + rows.length + ")" : "";
        if (!rows.length) { listEl.innerHTML = '<div class="empty">No comments yet on this screen.<br>Be the first 👇</div>'; return; }
        listEl.innerHTML = rows.map(function (c) {
          return '<div class="avc-c"><div class="meta"><b>' + esc(c.author) + "</b> · " + ago(c.created_at) +
            '</div><div class="txt">' + esc(c.body) + "</div></div>";
        }).join("");
      })
      .catch(function (err) { listEl.innerHTML = '<div class="empty">Couldn\'t load comments (' + esc(err.message) + ").</div>"; });
  }

  // ---- post ----
  sendEl.addEventListener("click", function () {
    var author = currentName();
    var body = bodyEl.value.trim();
    if (!author) { msgEl.textContent = "Add your name first."; msgEl.style.color = "#dc2626"; return; }
    if (!body) { msgEl.textContent = "Write a comment first."; msgEl.style.color = "#dc2626"; return; }
    setStoredName(author);                                     // remember after first use
    renderIdentity();                                          // swap input → "Commenting as …" chip
    msgEl.textContent = "Posting…"; msgEl.style.color = "#9aa1b1";
    sendEl.disabled = true;
    fetch(REST, { method: "POST", headers: HEADERS, body: JSON.stringify({ author: author, screen: file, body: body }) })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); })
      .then(function () { bodyEl.value = ""; msgEl.textContent = "Posted ✓"; msgEl.style.color = "#16a34a"; sendEl.disabled = false; load(); })
      .catch(function (err) { msgEl.textContent = "Couldn't post (" + err.message + ")."; msgEl.style.color = "#dc2626"; sendEl.disabled = false; });
  });

  // ---- initial state ----
  // First-timers get a brief peek of the panel, then it tucks away and the tab
  // gently bumps as a reminder until they click it once.
  if (isSeen()) {
    setOpen(false);
  } else {
    setOpen(true);
    setTimeout(function () {
      if (isSeen()) return;                  // they engaged during the peek — leave it
      setOpen(false);
      tab.classList.add("avc-bump");
    }, 2400);
  }
  load();
})();
