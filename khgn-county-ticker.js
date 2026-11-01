/* ==================================================================
   KHGN, Inc. — County ticker
   ------------------------------------------------------------------
   Each county page reads the file ticker.txt in its own folder.
   If that file is missing or empty, it shows /ticker-statewide.txt.

   FILE FORMAT (one item per line):
       Label | Text | Link
   The link is optional. Lines starting with # are notes and are ignored.
   Example:
       100 Years Ago | The Mountain Advocate reports a new bridge. |
   ================================================================== */
(function () {
  "use strict";
  var SECONDS_PER_ITEM = 10;
  var STATEWIDE = "/ticker-statewide.txt";

  var css = [
    ".kt-bar{background:#241A13;border-top:1px solid #4A392A;color:#EDE0C8;font-family:'Public Sans',Arial,sans-serif}",
    ".kt-inner{max-width:1100px;margin:0 auto;padding:7px 20px;display:flex;align-items:center;gap:12px;min-height:40px;box-sizing:border-box}",
    ".kt-label{flex-shrink:0;font-size:12.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#D4AF6A}",
    ".kt-stage{flex:1 1 auto;min-width:0}",
    ".kt-item{display:flex;align-items:center;gap:10px;min-width:0;color:#EDE0C8;text-decoration:none;transition:opacity .45s ease}",
    ".kt-item.kt-hidden{opacity:0}",
    "a.kt-item:hover .kt-text,a.kt-item:focus-visible .kt-text{text-decoration:underline}",
    ".kt-item:focus-visible{outline:3px solid #D4AF6A;outline-offset:2px;border-radius:4px}",
    ".kt-tag{flex-shrink:0;font-size:12.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;padding:3px 8px;border-radius:999px;background:#D4AF6A;color:#1C140F;white-space:nowrap}",
    ".kt-text{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:16px}",
    ".kt-ctrls{flex-shrink:0;display:flex;gap:6px}",
    ".kt-btn{width:38px;height:38px;border-radius:6px;border:1px solid #4A392A;background:#1C140F;color:#EDE0C8;cursor:pointer;font-size:14px;line-height:1;display:flex;align-items:center;justify-content:center}",
    ".kt-btn:hover{border-color:#D4AF6A}",
    ".kt-btn:focus-visible{outline:3px solid #D4AF6A;outline-offset:2px}",
    "@media (max-width:700px){.kt-label{display:none}.kt-text{white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}}",
    "@media (prefers-reduced-motion:reduce){.kt-item{transition:none}}"
  ].join("");

  function parse(text) {
    var items = [];
    (text || "").split(/\r?\n/).forEach(function (line) {
      line = line.trim();
      if (!line || line.charAt(0) === "#") { return; }
      var parts = line.split("|").map(function (p) { return p.trim(); });
      if (parts.length < 2 || !parts[1]) { return; }
      var href = parts[2] || "";
      if (href && !/^(https?:\/\/|\/)/i.test(href)) { href = ""; }
      items.push({ label: parts[0], text: parts[1], href: href });
    });
    return items;
  }

  function load(url) {
    return fetch(url, { cache: "no-cache" }).then(function (r) {
      return r.ok ? r.text() : "";
    }).catch(function () { return ""; });
  }

  function build(items, labelText) {
    var nav = document.querySelector(".site-nav");
    if (!nav || !items.length || document.querySelector(".kt-bar")) { return; }
    var style = document.createElement("style"); style.textContent = css; document.head.appendChild(style);

    var bar = document.createElement("div"); bar.className = "kt-bar";
    bar.setAttribute("role", "region"); bar.setAttribute("aria-label", "News ticker");
    var inner = document.createElement("div"); inner.className = "kt-inner";
    var label = document.createElement("span"); label.className = "kt-label"; label.textContent = labelText;
    var stage = document.createElement("div"); stage.className = "kt-stage"; stage.setAttribute("aria-live", "polite");
    var ctrls = document.createElement("div"); ctrls.className = "kt-ctrls";
    function btn(txt, aria) { var b = document.createElement("button"); b.type = "button"; b.className = "kt-btn"; b.textContent = txt; b.setAttribute("aria-label", aria); return b; }
    var prev = btn("\u2039", "Previous item"), toggle = btn("\u275A\u275A", "Pause ticker"), next = btn("\u203A", "Next item");
    ctrls.appendChild(prev); ctrls.appendChild(toggle); ctrls.appendChild(next);
    inner.appendChild(label); inner.appendChild(stage); inner.appendChild(ctrls);
    bar.appendChild(inner); nav.appendChild(bar);

    var index = 0, playing = true, hovering = false, timer = null;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { playing = false; }

    function render(i) {
      var it = items[i];
      var node = document.createElement(it.href ? "a" : "div");
      node.className = "kt-item";
      if (it.href) { node.href = it.href; if (/^https?:/i.test(it.href)) { node.target = "_blank"; node.rel = "noopener"; } }
      var tag = document.createElement("span"); tag.className = "kt-tag"; tag.textContent = it.label || "News";
      var tx = document.createElement("span"); tx.className = "kt-text"; tx.textContent = it.text;
      node.appendChild(tag); node.appendChild(tx);
      stage.innerHTML = ""; stage.appendChild(node);
      return node;
    }
    var current = render(0);
    function show(i) {
      index = (i + items.length) % items.length;
      current.classList.add("kt-hidden");
      setTimeout(function () { current = render(index); }, reduce ? 0 : 450);
    }
    function updateToggle() {
      toggle.textContent = playing ? "\u275A\u275A" : "\u25B6";
      toggle.setAttribute("aria-label", playing ? "Pause ticker" : "Play ticker");
    }
    function schedule() {
      clearInterval(timer);
      if (playing && !hovering && items.length > 1) { timer = setInterval(function () { show(index + 1); }, SECONDS_PER_ITEM * 1000); }
    }
    prev.addEventListener("click", function () { show(index - 1); schedule(); });
    next.addEventListener("click", function () { show(index + 1); schedule(); });
    toggle.addEventListener("click", function () { playing = !playing; updateToggle(); schedule(); });
    bar.addEventListener("mouseenter", function () { hovering = true; schedule(); });
    bar.addEventListener("mouseleave", function () { hovering = false; schedule(); });
    bar.addEventListener("focusin", function () { hovering = true; schedule(); });
    bar.addEventListener("focusout", function () { hovering = false; schedule(); });
    document.addEventListener("visibilitychange", function () { if (document.hidden) { clearInterval(timer); } else { schedule(); } });
    updateToggle(); schedule();
  }

  function init() {
    var holder = document.querySelector("[data-county-ticker]");
    var countyLabel = holder ? holder.getAttribute("data-county-ticker") : "";
    var countyFile = holder ? (holder.getAttribute("data-ticker-src") || "ticker.txt") : "";
    var first = countyFile ? load(countyFile) : Promise.resolve("");
    first.then(function (t) {
      var items = parse(t);
      if (items.length) { build(items, countyLabel + ":"); return; }
      load(STATEWIDE).then(function (s) { build(parse(s), "On the Trail:"); });
    });
  }
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", init); } else { init(); }
})();
