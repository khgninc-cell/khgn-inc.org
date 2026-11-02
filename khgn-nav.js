/* ==================================================================
   KHGN, Inc. — Shared site menu
   ------------------------------------------------------------------
   Every page loads its menu from this one file. To rename a tab or add
   a page, edit the MENU list below; every page updates at once.

   HOW TO ADD THE MENU TO A PAGE
   On khgn-inc.org, put these two lines right after the page's <body> tag:
       <div id="khgn-nav"></div>
       <script src="/khgn-nav.js"></script>
   On the training site (training.khgn-inc.org), use the full address:
       <div id="khgn-nav" data-current="Trailhead Training"></div>
       <script src="https://khgn-inc.org/khgn-nav.js"></script>
   data-current (optional) names the tab to highlight on that page.
   ================================================================== */
(function () {
  "use strict";

  /* ---------- Menu: edit this list to change the menu ---------- */
  var BRAND = { text: "KHGN Inc.", href: "/index.html" };
  var MENU = [
    { label: "Home",                  href: "/index.html",           match: ["", "index.html"] },
    { label: "County Hubs",           href: "/socialmedia.html",     match: ["socialmedia.html", "counties"] },
    { label: "Volunteer Recruitment", href: "/get-involved.html",    match: ["get-involved.html", "recruiting.html"] },
    { label: "Donation Portal",       href: "/donation-portal.html", match: ["donation-portal.html"] },
    { label: "Volunteer Training",    href: "/training.html",        match: ["training.html"] },
    { label: "Trailhead Training",    href: "/game-portal.html",     match: ["game-portal.html"] }
  ];

  /* ---------- Styles ---------- */
  var css = [
    ".site-nav{background:#1C140F;border-bottom:1px solid #4A392A;position:sticky;top:0;z-index:1000}",
    ".kn-inner{max-width:1100px;margin:0 auto;padding:0 20px;min-height:68px;display:flex;align-items:center;gap:20px;box-sizing:border-box;font-family:'Public Sans',Arial,sans-serif}",
    ".kn-brand{color:#D4AF6A;text-decoration:none;font-family:'Rye',Georgia,serif;font-weight:400;font-size:22px;white-space:nowrap}",
    ".kn-links{margin-left:auto;display:flex;align-items:center;gap:18px}",
    ".kn-links a{color:#EDE0C8;text-decoration:none;font-size:16px;font-weight:600;padding:8px 0;border-bottom:2px solid transparent}",
    ".kn-links a:hover{color:#D4AF6A}",
    ".kn-links a.kn-current{color:#D4AF6A;border-bottom-color:#B08D57}",
    ".kn-brand:focus-visible,.kn-links a:focus-visible,.kn-toggle:focus-visible{outline:3px solid #D4AF6A;outline-offset:2px}",
    ".kn-toggle{display:none;margin-left:auto;padding:10px;border:none;background:transparent;cursor:pointer}",
    ".kn-bar{display:block;width:26px;height:3px;margin:5px 0;border-radius:999px;background:#D4AF6A}",
    "@media (max-width:760px){.kn-inner{flex-wrap:wrap;padding:12px 20px;min-height:0}.kn-toggle{display:block}.kn-links{display:none;width:100%;margin-left:0;flex-direction:column;align-items:flex-start;gap:0;padding:8px 0 4px}.site-nav.kn-open .kn-links{display:flex}.kn-links a{width:100%;padding:12px 0;font-size:17px}}"
  ].join("");

  /* On other KHGN sites, such as the training site, links point back to the main site */
  var MAIN = "https://khgn-inc.org";
  var host = location.hostname.toLowerCase();
  var onMain = host === "khgn-inc.org" || host === "www.khgn-inc.org" || host === "localhost" || host === "127.0.0.1" || host === "";
  function full(href) { return onMain ? href : MAIN + href; }

  function currentKey() {
    var parts = location.pathname.split("/").filter(Boolean);
    if (parts[0] && parts[0].toLowerCase() === "counties") { return "counties"; }
    return (parts.pop() || "").toLowerCase();
  }

  function build() {
    var holder = document.getElementById("khgn-nav");
    if (!holder || document.querySelector(".site-nav[data-khgn]")) { return; }
    var style = document.createElement("style"); style.textContent = css; document.head.appendChild(style);

    var key = currentKey();
    var nav = document.createElement("nav");
    nav.className = "site-nav"; nav.setAttribute("aria-label", "Global"); nav.setAttribute("data-khgn", "");
    var inner = document.createElement("div"); inner.className = "kn-inner";

    var brand = document.createElement("a"); brand.className = "kn-brand"; brand.href = full(BRAND.href); brand.textContent = BRAND.text;
    var toggle = document.createElement("button");
    toggle.type = "button"; toggle.className = "kn-toggle";
    toggle.setAttribute("aria-expanded", "false"); toggle.setAttribute("aria-label", "Open menu");
    for (var b = 0; b < 3; b++) { var bar = document.createElement("span"); bar.className = "kn-bar"; toggle.appendChild(bar); }

    var links = document.createElement("div"); links.className = "kn-links";
    MENU.forEach(function (item) {
      var a = document.createElement("a"); a.href = full(item.href); a.textContent = item.label;
      var forced = holder.getAttribute("data-current");
      if (forced ? forced === item.label : (onMain && item.match.indexOf(key) > -1)) { a.className = "kn-current"; a.setAttribute("aria-current", "page"); }
      a.addEventListener("click", function () { nav.classList.remove("kn-open"); toggle.setAttribute("aria-expanded", "false"); });
      links.appendChild(a);
    });
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("kn-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    inner.appendChild(brand); inner.appendChild(toggle); inner.appendChild(links);
    nav.appendChild(inner);
    holder.parentNode.replaceChild(nav, holder);
  }
  build();
})();
