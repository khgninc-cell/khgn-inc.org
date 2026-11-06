/* ==================================================================
   KHGN, Inc. — Shared site menu and footer
   ------------------------------------------------------------------
   Every page loads its menu, and the disclaimer footer at the bottom
   of the page, from this one file. To change the footer wording, edit
   the FOOTER section below. To rename a tab or add
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


  /* ---------- Footer: edit this wording to change the disclaimer everywhere ---------- */
  var FOOTER = [
    '<p><strong>KHGN, Inc.</strong> is the filed assumed name of Kentucky History and Genealogy Network, Inc., a 501(c)(3) nonprofit.</p>',
    '<p><strong>Independence.</strong> KHGN is independent of, and not affiliated with, any government agency, including the Kentucky Secretary of State and its Land Office, the Kentucky Department for Libraries and Archives, and county clerks; any county historical or genealogical society; any genealogical credentialing body, such as the Board for Certification of Genealogists; or Meta Platforms, Inc. Facebook is a trademark of Meta Platforms, Inc.</p>',
    '<p><strong>Not professional advice.</strong> KHGN\u2019s pages, training, and research reviews are educational. They are not legal, surveying, title, tax, financial, medical, or other professional advice. KHGN\u2019s volunteers do not act as attorneys, licensed land surveyors, certified or accredited genealogists, accountants, appraisers, genetic counselors, or any other licensed or credentialed professional. For legal questions, consult an attorney; for boundary or land questions, a licensed land surveyor.</p>',
    '<p><strong>Titles and ratings.</strong> KHGN\u2019s volunteer titles, such as Scout, Register, and Land Commissioner, are historical names for KHGN volunteer roles, and carry no government, legal, or professional authority. KHGN\u2019s research ratings reflect KHGN\u2019s own standards, and are not legal proof of title, kinship, or inheritance. KHGN\u2019s training is unaccredited volunteer education.</p>',
    '<p><strong>Use of AI.</strong> Some images and content on this site were created or edited with the help of AI tools and reviewed by KHGN volunteers.</p>',
    '<p><a href="__MAIN__/volunteer-privacy.html">Privacy Notice</a> &middot; <a href="mailto:privacy@khgn-inc.org">privacy@khgn-inc.org</a></p>'
  ];
  var footerCss = [
    ".khgn-legal{background:#1C140F;border-top:1px solid #4A392A;color:#E0D0AC;font-family:'Public Sans',Arial,sans-serif;font-size:15px;line-height:1.65;margin-top:40px}",
    ".khgn-legal-inner{max-width:1000px;margin:0 auto;padding:26px 20px 34px;box-sizing:border-box}",
    ".khgn-legal p{margin:0 0 10px}",
    ".khgn-legal strong{color:#D4AF6A}",
    ".khgn-legal a{color:#D4AF6A;font-weight:700}",
    ".khgn-legal a:focus-visible{outline:3px solid #D4AF6A;outline-offset:2px}",
    ".khgn-share{max-width:1000px;margin:40px auto 0;padding:0 20px;box-sizing:border-box;font-family:'Public Sans',Arial,sans-serif}",
    ".khgn-share-inner{background:#1C140F;border:1px solid #4A392A;border-radius:12px;padding:16px 18px;display:flex;flex-wrap:wrap;align-items:center;gap:10px}",
    ".khgn-share-label{font-weight:800;color:#D4AF6A;font-size:16px;margin-right:4px}",
    ".khgn-share a,.khgn-share button{display:inline-flex;align-items:center;min-height:46px;padding:10px 16px;border-radius:8px;font:700 16px 'Public Sans',Arial,sans-serif;text-decoration:none;cursor:pointer;border:2px solid #B08D57;background:transparent;color:#EDE0C8}",
    ".khgn-share a:hover,.khgn-share button:hover{border-color:#D4AF6A;color:#D4AF6A}",
    ".khgn-share .ks-fb{background:#2F5F8A;border-color:#2F5F8A;color:#fff}",
    ".khgn-share .ks-fb:hover{background:#3B72A3;border-color:#3B72A3;color:#fff}",
    ".khgn-share a:focus-visible,.khgn-share button:focus-visible{outline:3px solid #D4AF6A;outline-offset:2px}",
    ".khgn-share .ks-status{font-size:15px;color:#E0D0AC}",
    ".khgn-legal{margin-top:20px}"
  ].join("");
  function buildFooter() {
    if (document.querySelector(".khgn-legal")) { return; }
    var st = document.createElement("style"); st.textContent = footerCss; document.head.appendChild(st);
    var f = document.createElement("footer"); f.className = "khgn-legal"; f.setAttribute("aria-label", "Legal notices");
    var inner = document.createElement("div"); inner.className = "khgn-legal-inner";
    inner.innerHTML = FOOTER.join("").replace(/__MAIN__/g, onMain ? "" : MAIN);
    f.appendChild(inner);
    if (onMain) { document.body.appendChild(buildShare()); }
    document.body.appendChild(f);
  }

  /* ---------- Share this page (simple links: nothing loads from Facebook until clicked) ---------- */
  function buildShare() {
    var canon = document.querySelector('link[rel="canonical"]');
    var url = canon ? canon.href : (location.origin + location.pathname);
    var title = document.title || "KHGN, Inc.";
    var wrap = document.createElement("div"); wrap.className = "khgn-share"; wrap.setAttribute("role", "region"); wrap.setAttribute("aria-label", "Share this page");
    var box = document.createElement("div"); box.className = "khgn-share-inner";
    var label = document.createElement("span"); label.className = "khgn-share-label"; label.textContent = "Share this page:";
    box.appendChild(label);
    var fb = document.createElement("a"); fb.className = "ks-fb"; fb.textContent = "Share on Facebook";
    fb.href = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url);
    fb.target = "_blank"; fb.rel = "noopener";
    box.appendChild(fb);
    var em = document.createElement("a"); em.textContent = "Email";
    em.href = "mailto:?subject=" + encodeURIComponent(title) + "&body=" + encodeURIComponent("I thought you might like this page from KHGN, Inc.:\n\n" + url);
    box.appendChild(em);
    var status = document.createElement("span"); status.className = "ks-status"; status.setAttribute("role", "status"); status.setAttribute("aria-live", "polite");
    var cp = document.createElement("button"); cp.type = "button"; cp.textContent = "Copy link";
    cp.addEventListener("click", function () {
      var done = function () { status.textContent = "Link copied."; setTimeout(function () { status.textContent = ""; }, 2500); };
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(url).then(done, function () { status.textContent = url; }); }
      else { status.textContent = url; }
    });
    box.appendChild(cp);
    if (navigator.share) {
      var ns = document.createElement("button"); ns.type = "button"; ns.textContent = "More ways to share";
      ns.addEventListener("click", function () { navigator.share({ title: title, url: url }).catch(function () {}); });
      box.appendChild(ns);
    }
    box.appendChild(status);
    wrap.appendChild(box);
    return wrap;
  }

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
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", buildFooter); } else { buildFooter(); }
})();
