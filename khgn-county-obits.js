/* ==================================================================
   KHGN, Inc. — County newspapers: The Town Crier and obituaries
   ------------------------------------------------------------------
   Each county page reads two optional files from its own folder:

   news.txt  (articles, separated by a line of three dashes ---)
       Title: King News, January 1922
       Place: King, Knox County, Kentucky   (optional)
       Source: Mountain Advocate (Barbourville, Ky.), January 20, 1922, page 4
       Link: https://www.loc.gov/resource/...
       Each following line is one paragraph of the transcription.
       ---

   obituaries.txt  (one entry per line)
       Name | Date of death | Newspaper and date | Text

   Lines starting with # are notes and are ignored. Use items at least
   100 years old (public domain), proofread against the original.

   When either file has entries, "The Town Crier" appears at the bottom
   of the county page, set apart from the County Hub above it, with a
   "Read The Town Crier" button near the top of the page. A name search
   appears once there are three or more items. Press Enter (or the
   "Go to next mention" button) to move to each highlighted mention.
   ================================================================== */
(function () {
  "use strict";
  var SEARCH_MIN = 3;

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) { e.className = cls; } if (text) { e.textContent = text; } return e; }
  function slug(t) { return "tc-" + t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }
  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function getText(url) {
    return fetch(url, { cache: "no-cache" }).then(function (r) { return r.ok ? r.text() : ""; }).catch(function () { return ""; });
  }

  function parseNews(text) {
    var arts = [], cur = null;
    (text || "").split(/\r?\n/).forEach(function (raw) {
      var line = raw.trim();
      if (line.charAt(0) === "#") { return; }
      if (/^-{3,}$/.test(line)) { if (cur) { arts.push(cur); } cur = null; return; }
      if (!line) { return; }
      if (!cur) { cur = { title: "", place: "", source: "", link: "", paras: [] }; }
      var m = line.match(/^(Title|Place|Source|Link):\s*(.*)$/i);
      if (m && !cur.paras.length) { cur[m[1].toLowerCase()] = m[2]; return; }
      cur.paras.push(line);
    });
    if (cur) { arts.push(cur); }
    return arts.filter(function (a) { return a.title && a.paras.length; });
  }
  function parseObits(text) {
    var out = [];
    (text || "").split(/\r?\n/).forEach(function (line) {
      line = line.trim();
      if (!line || line.charAt(0) === "#") { return; }
      var p = line.split("|").map(function (s) { return s.trim(); });
      if (p[0]) { out.push({ name: p[0], date: p[1] || "", source: p[2] || "", text: p[3] || "" }); }
    });
    return out;
  }

  function countyInfo() {
    var county = document.body.getAttribute("data-county-ticker") || "this county";
    var seat = "";
    document.querySelectorAll(".fact").forEach(function (f) {
      var b = f.querySelector("b");
      if (b && /county seat/i.test(b.textContent)) { seat = f.textContent.replace(b.textContent, "").trim(); }
    });
    return { county: county, seat: seat };
  }

  function addStyle() {
    var css = [
      ".tc-break{margin:56px 0 30px;text-align:center;color:#D4AF6A;font-size:22px;letter-spacing:.6em;display:flex;align-items:center;gap:18px}",
      ".tc-break:before,.tc-break:after{content:'';flex:1;height:2px;background:linear-gradient(90deg,transparent,#B08D57,transparent)}",
      ".tc-mast{text-align:center;background:#1C140F;border:2px solid #B08D57;border-radius:12px;padding:26px 20px 22px;margin:0 0 22px}",
      ".tc-mast h2{font-family:'Rye',Georgia,serif;font-weight:400;color:#D4AF6A;font-size:clamp(34px,7vw,52px);margin:0;line-height:1.1}",
      ".tc-mast .tc-hear{font-family:'Rye',Georgia,serif;color:#EDE0C8;font-size:clamp(19px,3.6vw,24px);margin:10px 0 6px}",
      ".tc-mast .tc-sub{color:#E0D0AC;font-size:17px;margin:0}",
      "#town-crier .tc-notice{background:#F3D9D3;border-left:6px solid #A63D2F;border-radius:8px;padding:14px 16px;margin:0 0 16px;color:#5A1F16;font-size:18px}",
      "#town-crier .tc-notice b{color:#8E2A1F}",
      "#town-crier .tc-records{background:rgba(0,0,0,.04);border:1px solid #D8C7A3;border-radius:8px;padding:14px 16px;margin:0 0 6px}",
      "#town-crier .tc-records h3{font-family:'Rye',Georgia,serif;font-weight:400;color:#221A12;font-size:21px;margin:0 0 8px}",
      "#town-crier .tc-records ul{margin:0;padding-left:22px}",
      "#town-crier .tc-records li{margin-bottom:6px;color:#221A12}",
      "#town-crier h3.tc-h{font-family:'Rye',Georgia,serif;font-weight:400;color:#221A12;font-size:24px;margin:0 0 12px}",
      "#town-crier .tc-search{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:0 0 6px}",
      "#town-crier .tc-search label{font-weight:700}",
      "#town-crier .tc-search input{flex:1 1 240px;min-height:50px;padding:8px 12px;font:18px 'Public Sans',sans-serif;border:2px solid #D8C7A3;border-radius:8px;background:#fff;color:#221A12}",
      "#town-crier .tc-status{font-size:16px;color:#5E5242;min-height:1.2em;margin:0 0 12px}",
      "#town-crier .tc-toc{margin:0;padding:0;list-style:none;display:grid;gap:8px}",
      "#town-crier .tc-toc a{display:block;padding:12px 14px;border:1px solid #D8C7A3;border-radius:8px;background:rgba(0,0,0,.03);text-decoration:none;font-size:18px}",
      "#town-crier .tc-toc a:hover{border-color:#B08D57}",
      "#town-crier .tc-toc span{display:block;font-size:15px;color:#5E5242;font-weight:400}",
      "#town-crier article{scroll-margin-top:120px}",
      "#town-crier article h3{font-family:'Rye',Georgia,serif;font-weight:400;color:#221A12;font-size:25px;margin:0 0 4px}",
      "#town-crier .tc-place{font-size:17px;font-weight:700;color:#7A3A1E;margin:0 0 2px}",
      "#town-crier .tc-src{font-size:15.5px;color:#5E5242;font-style:italic;margin:0 0 14px}",
      "#town-crier p.tc-p{font-size:19px;line-height:1.7;margin:0 0 10px;color:#221A12}",
      "#town-crier mark{background:#F6D57A;color:#221A12;padding:0 2px;border-radius:3px;scroll-margin-top:140px;scroll-margin-bottom:140px}",
      "#town-crier mark.tc-current{background:#F28C28;box-shadow:0 0 0 2px #A63D2F}",
      "#town-crier .tc-next{min-height:50px;padding:8px 16px;font:700 18px 'Public Sans',sans-serif;background:#A63D2F;color:#fff;border:0;border-radius:8px;cursor:pointer}",
      "#town-crier .tc-next:hover{background:#C2503F}",
      "#town-crier .tc-next:focus-visible{outline:3px solid #D4AF6A;outline-offset:2px}",
      "#town-crier .tc-next[hidden]{display:none}",
      "#town-crier .tc-links{display:flex;flex-wrap:wrap;gap:16px;margin-top:14px;font-size:16px}",
      "#town-crier .tc-obits{list-style:none;margin:0;padding:0;display:grid;gap:10px}",
      "#town-crier .tc-obits li{border:1px solid #D8C7A3;border-radius:8px;padding:12px 14px;background:rgba(0,0,0,.03)}",
      "#town-crier .tc-obits b{display:block;font-size:19px}",
      "#town-crier .tc-obits .tc-date{display:block;font-size:15px;color:#5E5242}",
      "#town-crier .tc-obits .tc-osrc{display:block;font-size:15px;color:#6B5A42;font-style:italic}",
      ".tab-tc{background:#A63D2F;color:#fff}",
      ".tab-tc:hover{background:#C2503F}"
    ].join("");
    var s = document.createElement("style"); s.textContent = css; document.head.appendChild(s);
  }

  /* text that can be searched and highlighted */
  var searchable = [];
  function hl(node, text) { node.setAttribute("data-raw", text); node.textContent = text; searchable.push(node); return node; }

  function build(arts, obits) {
    addStyle();
    var info = countyInfo();
    var wrap = el("div"); wrap.id = "town-crier";

    var brk = el("div", "tc-break", "✦ ✦ ✦"); brk.setAttribute("aria-hidden", "true");
    wrap.appendChild(brk);

    var mast = el("div", "tc-mast");
    mast.appendChild(el("h2", "", "The Town Crier"));
    mast.appendChild(el("p", "tc-hear", "Hear ye, hear ye! Read all about it!"));
    mast.appendChild(el("p", "tc-sub", "News from " + info.county + "’s old newspapers, transcribed by KHGN volunteers from items at least 100 years old."));
    wrap.appendChild(mast);

    /* notice and where to find the records */
    var guide = el("section");
    var notice = el("p", "tc-notice");
    notice.appendChild(el("b", "", "Newspapers are leads, not proof. "));
    notice.appendChild(document.createTextNode("Old newspapers can contain mistakes in names, dates, and places. Use what you find here as a clue, then confirm it in the official records."));
    guide.appendChild(notice);
    var rec = el("div", "tc-records");
    rec.appendChild(el("h3", "", "Where to find the records for " + info.county));
    var at = info.seat ? (/ and /.test(info.seat) ? " at the courthouses in " + info.seat : " at the courthouse in " + info.seat) : " at the county courthouse";
    var ul = el("ul");
    [
      ["Marriages, deeds, and wills: ", "the County Clerk’s office" + at],
      ["Court cases and divorces: ", "the Circuit Court Clerk’s office" + at],
      ["Birth and death certificates, 1911 and later: ", "the Kentucky Office of Vital Statistics"],
      ["Older records and microfilm: ", "the Kentucky Department for Libraries and Archives (KDLA)"],
      ["Land grants and patents: ", "the Kentucky Land Office, Kentucky Secretary of State"],
      ["If the courthouse burned, or the county formed later: ", "check the parent and neighboring counties too"]
    ].forEach(function (r) { var li = el("li"); li.appendChild(el("b", "", r[0])); li.appendChild(document.createTextNode(r[1])); ul.appendChild(li); });
    rec.appendChild(ul);
    guide.appendChild(rec);
    wrap.appendChild(guide);

    var items = [];
    var main = el("section");
    var status = null;
    if (arts.length + obits.length >= SEARCH_MIN) {
      var srch = el("div", "tc-search");
      var lab = el("label", "", "Search The Town Crier for a name:"); lab.setAttribute("for", "tc-find");
      var inp = el("input"); inp.type = "search"; inp.id = "tc-find"; inp.placeholder = "Type a name, such as a surname"; inp.autocomplete = "off";
      var nextBtn = el("button", "tc-next", "Go to next mention"); nextBtn.type = "button"; nextBtn.id = "tc-next"; nextBtn.hidden = true;
      srch.appendChild(lab); srch.appendChild(inp); srch.appendChild(nextBtn); main.appendChild(srch);
      status = el("p", "tc-status"); status.setAttribute("role", "status"); status.setAttribute("aria-live", "polite"); main.appendChild(status);
    }

    var used = {};
    if (arts.length) {
      main.appendChild(el("h3", "tc-h", "In This Edition"));
      var toc = el("ul", "tc-toc"); toc.id = "tc-list";
      arts.forEach(function (a) {
        var id = slug(a.title); while (used[id]) { id += "-2"; } used[id] = 1; a.id = id;
        var li = el("li"), link = el("a"); link.href = "#" + id;
        link.appendChild(document.createTextNode(a.title));
        if (a.place) { link.appendChild(el("span", "", a.place)); }
        if (a.source) { link.appendChild(el("span", "", a.source)); }
        li.appendChild(link); toc.appendChild(li); a.tocItem = li;
      });
      main.appendChild(toc);
    }
    wrap.appendChild(main);

    arts.forEach(function (a) {
      var art = el("section"); art.appendChild(el("article"));
      var body = art.firstChild; body.id = a.id;
      body.appendChild(hl(el("h3"), a.title));
      if (a.place) { body.appendChild(hl(el("p", "tc-place"), a.place)); }
      if (a.source) { body.appendChild(el("p", "tc-src", "From the " + a.source)); }
      a.paras.forEach(function (p) { body.appendChild(hl(el("p", "tc-p"), p)); });
      var links = el("div", "tc-links");
      if (/^https?:\/\//i.test(a.link)) {
        var o = el("a", "", "See the original newspaper page"); o.href = a.link; o.target = "_blank"; o.rel = "noopener"; links.appendChild(o);
      }
      var back = el("a", "", "Back to the list of articles"); back.href = arts.length ? "#tc-list" : "#town-crier"; links.appendChild(back);
      body.appendChild(links);
      wrap.appendChild(art);
      items.push({ box: art, toc: a.tocItem, text: (a.title + " " + a.place + " " + a.paras.join(" ")).toLowerCase() });
    });

    if (obits.length) {
      var os = el("section"); os.id = "tc-obituaries";
      os.appendChild(el("h3", "tc-h", "From the Obituary Columns"));
      var ol = el("ul", "tc-obits");
      obits.forEach(function (o) {
        var li = el("li");
        li.appendChild(hl(el("b"), o.name));
        if (o.date) { li.appendChild(el("span", "tc-date", o.date)); }
        if (o.text) { li.appendChild(hl(el("p", "tc-p"), o.text)); }
        if (o.source) { li.appendChild(el("span", "tc-osrc", "Source: " + o.source)); }
        ol.appendChild(li);
        items.push({ box: li, toc: null, text: (o.name + " " + o.text).toLowerCase() });
      });
      os.appendChild(ol);
      wrap.appendChild(os);
      var oldObits = document.getElementById("obituaries");
      if (oldObits) { oldObits.hidden = true; }
    }

    /* place The Town Crier after the County Hub content, before the closing note */
    var note = document.querySelector("body > .small-note");
    if (note) { note.parentNode.insertBefore(wrap, note); } else { document.body.appendChild(wrap); }

    var tabs = document.querySelector(".tabs");
    if (tabs && !tabs.querySelector(".tab-tc")) {
      var t = el("a", "tab tab-tc", "Read The Town Crier"); t.href = "#town-crier"; tabs.appendChild(t);
    }

    if (status) {
      var obitBox = document.getElementById("tc-obituaries");
      document.getElementById("tc-find").addEventListener("input", function () {
        var q = this.value.trim().toLowerCase(), shown = 0, re = null;
        if (q) { re = new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi"); }
        searchable.forEach(function (n) {
          var raw = n.getAttribute("data-raw");
          n.innerHTML = re ? esc(raw).replace(re, "<mark>$1</mark>") : esc(raw);
        });
        items.forEach(function (it) {
          var hit = !q || it.text.indexOf(q) !== -1;
          it.box.hidden = !hit; if (it.toc) { it.toc.hidden = !hit; }
          if (hit) { shown++; }
        });
        if (obitBox) { obitBox.hidden = q && !obitBox.querySelector(".tc-obits li:not([hidden])"); }
        status.textContent = q ? (shown ? shown + (shown === 1 ? " item mentions" : " items mention") + " “" + this.value.trim() + ".” Press Enter or the button to go to each mention." : "No items mention “" + this.value.trim() + ".”") : "";
        cur = -1;
        document.getElementById("tc-next").hidden = !(q && shown);
      });
      /* step through the highlighted mentions, one at a time */
      var cur = -1;
      function goNext() {
        var marks = Array.prototype.filter.call(document.querySelectorAll("#town-crier mark"), function (m) { return m.offsetParent !== null; });
        if (!marks.length) { return; }
        marks.forEach(function (m) { m.classList.remove("tc-current"); });
        cur = (cur + 1) % marks.length;
        var m = marks[cur];
        m.classList.add("tc-current");
        m.scrollIntoView({ behavior: "smooth", block: "center" });
        var q = document.getElementById("tc-find").value.trim();
        status.textContent = "Mention " + (cur + 1) + " of " + marks.length + " for “" + q + ".” Press Enter or the button for the next one.";
      }
      document.getElementById("tc-next").addEventListener("click", goNext);
      document.getElementById("tc-find").addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); goNext(); }
      });
    }

    if (location.hash && /^#(town-crier|tc-)/.test(location.hash)) {
      var target = document.getElementById(location.hash.slice(1));
      if (target) { target.scrollIntoView(); }
    }
  }

  function init() {
    if (!document.body.hasAttribute("data-county-ticker")) { return; }
    var obitBox = document.getElementById("obituaries");
    var obitSrc = (obitBox && obitBox.getAttribute("data-src")) || "obituaries.txt";
    Promise.all([getText("news.txt"), getText(obitSrc)]).then(function (r) {
      var arts = parseNews(r[0]), obits = parseObits(r[1]);
      if (arts.length || obits.length) { build(arts, obits); }
    });
  }
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", init); } else { init(); }
})();

/* ==================================================================
   KHGN, Inc. — Seasonal county banner
   ------------------------------------------------------------------
   Each county folder may hold up to four banners:
       banner-fall.webp    (shows about Sept. 22 to Dec. 20)
       banner-winter.webp  (about Dec. 21 to March 19)
       banner-spring.webp  (about March 20 to June 20)
       banner-summer.webp  (about June 21 to Sept. 21)
   The page shows the current season's banner. If that one is not
   uploaded yet, it shows the most recent earlier season instead.
   A county with no banner files looks exactly as before.
   ================================================================== */
(function () {
  "use strict";
  var ORDER = ["winter", "spring", "summer", "fall"];
  function currentSeason(d) {
    var md = (d.getMonth() + 1) * 100 + d.getDate();
    if (md >= 1221 || md < 320) { return "winter"; }
    if (md < 621) { return "spring"; }
    if (md < 922) { return "summer"; }
    return "fall";
  }
  function init() {
    var county = document.body.getAttribute("data-county-ticker");
    var h1 = document.querySelector("h1");
    if (!county || !h1) { return; }
    var start = ORDER.indexOf(currentSeason(new Date()));
    var tries = [0, 1, 2, 3].map(function (k) { return ORDER[(start - k + 4) % 4]; });
    var style = document.createElement("style");
    style.textContent = ".kc-banner{margin:6px 0 18px}.kc-banner img{display:block;width:100%;height:auto;aspect-ratio:1200/626;border-radius:10px;border:1px solid #4A392A;background:#1C140F}.kc-banner figcaption{font-size:14px;font-style:italic;color:#E0D0AC;margin-top:6px;text-align:right}";
    document.head.appendChild(style);
    var fig = document.createElement("figure"); fig.className = "kc-banner";
    var img = document.createElement("img");
    img.width = 1200; img.height = 626; img.decoding = "async";
    var cap = document.createElement("figcaption");
    cap.textContent = "Banner created with the help of AI, with human review.";
    fig.appendChild(img); fig.appendChild(cap);
    var i = 0;
    function next() {
      if (i >= tries.length) { if (fig.parentNode) { fig.parentNode.removeChild(fig); } return; }
      var s = tries[i++];
      img.alt = county + ", Kentucky History and Genealogy Network, Inc., " + s + " banner";
      img.src = "banner-" + s + ".webp";
    }
    img.addEventListener("error", next);
    h1.parentNode.insertBefore(fig, h1);
    next();
  }
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", init); } else { init(); }
})();
