/* ==================================================================
   KHGN Inc. — "On the Trail" fading ticker
   ------------------------------------------------------------------
   HOW TO ADD IT TO A PAGE
   Put this line in the page's <head>:
       <script src="/khgn-ticker.js" defer></script>
   The ticker places itself at the bottom of the page's navigation bar
   (.site-nav), so it stays on screen with the sticky navigation.

   HOW TO UPDATE THE ITEMS
   Edit the ITEMS list below. Each item is one line: category, title,
   short description (about 60 to 80 characters), and link.
   Categories with a color in CATEGORY_COLORS get their own tag color.
   ================================================================== */
(function () {
  "use strict";

  /* ---------- Items: edit this list to change the ticker ---------- */
  var ITEMS = [
    { cat: "Core Training", title: "The Tipple Trial", desc: "Join the caravan: the core skills every KHGN volunteer needs.", href: "/tipple-trial.html" },
    { cat: "Core Training", title: "Flagging and Welcoming", desc: "Learn to flag rule-breaking posts and welcome new members.", href: "/community-steward-flagging.html" },
    { cat: "First Steps", title: "Getting Started in Genealogy", desc: "Start with your family and investigate like a detective.", href: "/getting-started-genealogy.html" },
    { cat: "First Steps", title: "Rate Your Research", desc: "See which star designation your evidence reaches.", href: "/rate-your-research.html" },
    { cat: "Record Field Guides", title: "The Census, 1790 to 1950", desc: "What every census asked, decade by decade, with Kentucky notes.", href: "/census-field-guide.html" },
    { cat: "Practice Your Skills", title: "The KHGN Evidence Framework", desc: "Weigh evidence like a court, from opening statement to verdict.", href: "/khgn_suggested_trial_framework.html" },
    { cat: "Practice Your Skills", title: "Same Name, Wrong Man", desc: "Two men, same name, same county. Can you pick the right one?", href: "/khgn_case_study_1_same_name.html" },
    { cat: "Practice Your Skills", title: "Build Your Case", desc: "Apply the framework to your own family history.", href: "/khgn_build_your_case.html" },
    { cat: "Practice Your Skills", title: "Working With AI Responsibly", desc: "Where AI helps, where it misleads, and why people verify.", href: "/working-with-ai.html" },
    { cat: "Story Trails", title: "The Road to Kentucky", desc: "From an agent's promise in Ireland to a Kentucky homestead.", href: "/khgn_road_to_kentucky.html" },
    { cat: "Dignified History", title: "Roads Between the Stations", desc: "How Kentucky's early turnpikes were built, and who built them.", href: "/khgn_roads_between_stations.html" },
    { cat: "Trail Routes", title: "Volunteer with KHGN", desc: "Choose your route up the mountain. Here's how to enroll.", href: "/game-portal.html#enroll" }
  ];

  var CATEGORY_COLORS = {
    "Core Training":        { bg: "#3B7BB0", fg: "#FFFFFF" },
    "First Steps":          { bg: "#82A671", fg: "#1C140F" },
    "Record Field Guides":  { bg: "#D4AF6A", fg: "#1C140F" },
    "Practice Your Skills": { bg: "#6B8A5C", fg: "#FFFFFF" },
    "Story Trails":         { bg: "#B08D57", fg: "#1C140F" },
    "Dignified History":    { bg: "#7A6A58", fg: "#FFFFFF" },
    "Trail Routes":         { bg: "#A63D2F", fg: "#FFFFFF" }
  };
  var DEFAULT_COLOR = { bg: "#4A392A", fg: "#EDE0C8" };

  var SECONDS_PER_ITEM = 6;
  var LABEL = "On the Trail:";

  /* ---------- Styles ---------- */
  var css = [
    ".kt-bar{background:#241A13;border-top:1px solid #4A392A;color:#EDE0C8;font-family:'Public Sans',Arial,sans-serif}",
    ".kt-inner{max-width:1100px;margin:0 auto;padding:7px 20px;display:flex;align-items:center;gap:12px;min-height:40px;box-sizing:border-box}",
    ".kt-label{flex-shrink:0;font-size:12.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#D4AF6A}",
    ".kt-stage{flex:1 1 auto;min-width:0;position:relative}",
    ".kt-item{display:flex;align-items:center;gap:10px;min-width:0;text-decoration:none;color:#EDE0C8;transition:opacity .45s ease}",
    ".kt-item.kt-hidden{opacity:0}",
    ".kt-item:hover .kt-title,.kt-item:focus-visible .kt-title{text-decoration:underline}",
    ".kt-item:focus-visible{outline:3px solid #D4AF6A;outline-offset:2px;border-radius:4px}",
    ".kt-tag{flex-shrink:0;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;padding:3px 8px;border-radius:999px;white-space:nowrap}",
    ".kt-title{flex-shrink:0;font-weight:800;font-size:14.5px;white-space:nowrap}",
    ".kt-desc{min-width:0;font-size:14px;color:#E0D0AC;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".kt-view{flex-shrink:0;font-size:13.5px;font-weight:800;color:#D4AF6A;white-space:nowrap}",
    ".kt-controls{flex-shrink:0;display:flex;gap:4px}",
    ".kt-btn{width:30px;height:30px;display:flex;align-items:center;justify-content:center;border-radius:6px;border:1px solid #4A392A;background:transparent;color:#EDE0C8;cursor:pointer;font:inherit;font-size:20px;line-height:1;padding:0 0 2px}",
    ".kt-btn:hover{border-color:#B08D57;color:#D4AF6A}",
    ".kt-btn:focus-visible{outline:3px solid #D4AF6A;outline-offset:2px}",
    ".kt-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}",
    "@media (max-width:760px){.kt-desc{display:none}.kt-label{display:none}}",
    "@media (max-width:480px){.kt-view{display:none}.kt-title{white-space:normal;font-size:14px}.kt-tag{font-size:10px;padding:2px 6px}}",
    "@media (prefers-reduced-motion:reduce){.kt-item{transition:none}}"
  ].join("");

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) { n.className = cls; }
    if (text != null) { n.textContent = text; }
    return n;
  }

  function init() {
    var nav = document.querySelector(".site-nav");
    if (!nav || !ITEMS.length || document.querySelector(".kt-bar")) { return; }

    var style = el("style"); style.textContent = css; document.head.appendChild(style);

    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var index = 0, timer = null, playing = !reduceMotion, hovering = false;

    var bar = el("div", "kt-bar");
    bar.setAttribute("role", "region");
    bar.setAttribute("aria-label", "Featured on the Trail");
    var inner = el("div", "kt-inner");
    var label = el("span", "kt-label", LABEL);
    var stage = el("div", "kt-stage");
    var link = el("a", "kt-item");
    var tag = el("span", "kt-tag");
    var title = el("span", "kt-title");
    var desc = el("span", "kt-desc");
    var view = el("span", "kt-view", "View \u2192");
    link.appendChild(tag); link.appendChild(title); link.appendChild(desc); link.appendChild(view);
    stage.appendChild(link);

    var live = el("span", "kt-sr");
    live.setAttribute("aria-live", "polite");
    stage.appendChild(live);

    var controls = el("div", "kt-controls");
    var prev = el("button", "kt-btn", "\u2039"); prev.type = "button"; prev.setAttribute("aria-label", "Previous item");
    var toggle = el("button", "kt-btn"); toggle.type = "button";
    var next = el("button", "kt-btn", "\u203A"); next.type = "button"; next.setAttribute("aria-label", "Next item");
    controls.appendChild(prev); controls.appendChild(toggle); controls.appendChild(next);

    inner.appendChild(label); inner.appendChild(stage); inner.appendChild(controls);
    bar.appendChild(inner);
    nav.appendChild(bar);

    function render(i) {
      var item = ITEMS[i];
      var color = CATEGORY_COLORS[item.cat] || DEFAULT_COLOR;
      tag.textContent = item.cat;
      tag.style.background = color.bg; tag.style.color = color.fg;
      title.textContent = item.title;
      desc.textContent = "\u2014 " + item.desc;
      link.href = item.href;
      link.setAttribute("aria-label", item.cat + ": " + item.title + ". " + item.desc);
      if (!playing) { live.textContent = item.cat + ": " + item.title; }
    }

    function show(i) {
      index = (i + ITEMS.length) % ITEMS.length;
      if (reduceMotion) { render(index); return; }
      link.classList.add("kt-hidden");
      setTimeout(function () { render(index); link.classList.remove("kt-hidden"); }, 450);
    }

    function updateToggle() {
      toggle.textContent = playing ? "\u275A\u275A" : "\u25B6\uFE0E";
      toggle.style.fontSize = playing ? "10px" : "12px";
      toggle.setAttribute("aria-label", playing ? "Pause" : "Play");
      toggle.setAttribute("aria-pressed", playing ? "false" : "true");
    }
    function schedule() {
      clearInterval(timer);
      if (playing && !hovering) { timer = setInterval(function () { show(index + 1); }, SECONDS_PER_ITEM * 1000); }
    }

    prev.addEventListener("click", function () { show(index - 1); schedule(); });
    next.addEventListener("click", function () { show(index + 1); schedule(); });
    toggle.addEventListener("click", function () { playing = !playing; updateToggle(); schedule(); });

    bar.addEventListener("mouseenter", function () { hovering = true; schedule(); });
    bar.addEventListener("mouseleave", function () { hovering = false; schedule(); });
    bar.addEventListener("focusin", function () { hovering = true; schedule(); });
    bar.addEventListener("focusout", function () { hovering = false; schedule(); });
    document.addEventListener("visibilitychange", function () { if (document.hidden) { clearInterval(timer); } else { schedule(); } });

    /* Keep in-page links from landing underneath the taller sticky header */
    function setScrollPadding() { document.documentElement.style.scrollPaddingTop = (nav.offsetHeight + 8) + "px"; }
    setScrollPadding();
    window.addEventListener("resize", setScrollPadding);

    render(0);
    updateToggle();
    schedule();
  }

  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", init); } else { init(); }
})();
