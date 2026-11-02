/* ==================================================================
   KHGN, Inc. — Training path marker
   ------------------------------------------------------------------
   Shows visitors where they are on the public training path, and on
   the last step, how to become a volunteer.
   Add this line to a page's <head>:
       <script src="/khgn-path.js" defer></script>
   To change the steps, edit the STEPS list below.
   ================================================================== */
(function () {
  "use strict";
  var STEPS = [
    { file: "tipple-trial.html",               label: "Level 1",    href: "/tipple-trial.html" },
    { file: "tipple-trial-level-2.html",       label: "Level 2",    href: "/Tipple-Trial-level-2.html" },
    { file: "tipple-trial-level-3.html",       label: "Level 3",    href: "/Tipple-Trial-level-3.html" },
    { file: "tipple-trial-level-4.html",       label: "Level 4",    href: "/Tipple-Trial-level-4.html" },
    { file: "tipple-trial-final-quiz.html",    label: "Final Review", href: "/Tipple-Trial-final-quiz.html" },
    { file: "community-steward-flagging.html", label: "Flagging and Welcoming", href: "/community-steward-flagging.html" },
    { file: "#volunteer",                      label: "Become a Volunteer", href: "/game-portal.html#enroll" }
  ];
  var FB_PAGE = "https://www.facebook.com/KHGNINC/";

  var css = [
    ".kp-wrap{margin:0 0 18px;font-family:'Public Sans',Arial,sans-serif}",
    ".kp-title{font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#D4AF6A;margin:0 0 8px}",
    ".kp-list{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:6px;align-items:center}",
    ".kp-list li{display:flex;align-items:center;gap:6px}",
    ".kp-list li+li::before{content:'\\2192';color:#B08D57;font-weight:700}",
    ".kp-step{display:inline-block;padding:7px 12px;border-radius:999px;font-size:15px;font-weight:700;text-decoration:none;border:1.5px solid #4A392A;background:#1C140F;color:#E0D0AC}",
    "a.kp-step:hover{border-color:#D4AF6A;color:#F7F1E5}",
    ".kp-step.kp-done{border-color:#6B8A5C;color:#B9D4AC}",
    ".kp-step.kp-current{background:#D4AF6A;border-color:#D4AF6A;color:#1C140F}",
    ".kp-step:focus-visible{outline:3px solid #D4AF6A;outline-offset:2px}",
    ".kp-next{background:#EDE0C8;color:#221A12;border-radius:14px;border-top:4px solid #A63D2F;padding:22px 22px 18px;margin:26px 0;font-family:'Public Sans',Arial,sans-serif;font-size:17px;line-height:1.6;box-shadow:0 10px 30px rgba(0,0,0,.35)}",
    ".kp-next h2{font-family:'Rye',Georgia,serif;font-weight:400;font-size:26px;margin:0 0 8px;color:#221A12}",
    ".kp-next ol{margin:8px 0 14px;padding-left:24px}",
    ".kp-next li{margin-bottom:8px}",
    ".kp-next a{color:#A63D2F;font-weight:700}",
    ".kp-btn{display:inline-block;background:#A63D2F;color:#fff !important;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:10px;margin:4px 8px 4px 0}",
    ".kp-btn:hover{background:#C2503F}",
    ".kp-btn.kp-ghost{background:transparent;color:#A63D2F !important;border:2px solid #A63D2F}",
    ".kp-btn.kp-ghost:hover{background:#A63D2F;color:#fff !important}"
  ].join("");

  function current() {
    var f = (location.pathname.split("/").pop() || "").toLowerCase();
    for (var i = 0; i < STEPS.length; i++) { if (STEPS[i].file === f) { return i; } }
    return -1;
  }

  function marker(idx) {
    var wrap = document.createElement("nav");
    wrap.className = "kp-wrap"; wrap.setAttribute("aria-label", "Your training path");
    var t = document.createElement("p"); t.className = "kp-title";
    t.textContent = "Your path: step " + (idx + 1) + " of " + STEPS.length;
    var ol = document.createElement("ol"); ol.className = "kp-list";
    STEPS.forEach(function (s, i) {
      var li = document.createElement("li");
      var el = document.createElement(i === idx ? "span" : "a");
      el.className = "kp-step" + (i < idx ? " kp-done" : "") + (i === idx ? " kp-current" : "");
      el.textContent = (i < idx ? "\u2713 " : "") + s.label;
      if (i === idx) { el.setAttribute("aria-current", "step"); } else { el.href = s.href; }
      li.appendChild(el); ol.appendChild(li);
    });
    wrap.appendChild(t); wrap.appendChild(ol);
    return wrap;
  }

  function nextSteps() {
    var box = document.createElement("section");
    box.className = "kp-next"; box.id = "become-a-volunteer";
    box.innerHTML =
      '<h2>What\u2019s Next: Become a KHGN Volunteer</h2>' +
      '<p>You\u2019ve walked the public training path. If you\u2019d like to help moderate a county group, welcome new members, or serve on a Trail Route, here\u2019s how to take the next step:</p>' +
      '<ol>' +
      '<li><strong>Send a message</strong> to <a href="' + FB_PAGE + '" target="_blank" rel="noopener">KHGN\u2019s Facebook Page</a> letting us know you\u2019ve completed the Tipple Trial.</li>' +
      '<li><strong>Talk with us.</strong> We\u2019ll schedule a short phone call to meet you and go over the role that fits you.</li>' +
      '<li><strong>Get approved.</strong> Once approved, you\u2019ll receive access to your Trail Route training by email.</li>' +
      '</ol>' +
      '<p><a class="kp-btn" href="' + FB_PAGE + '" target="_blank" rel="noopener">Message KHGN on Facebook</a>' +
      '<a class="kp-btn kp-ghost" href="/game-portal.html#enroll">See the Trail Routes</a></p>';
    return box;
  }

  function init() {
    var idx = current();
    if (idx < 0) { return; }
    var style = document.createElement("style"); style.textContent = css; document.head.appendChild(style);
    var mast = document.querySelector(".masthead");
    var m = marker(idx);
    if (mast && mast.parentNode) { mast.parentNode.insertBefore(m, mast.nextSibling); }
    else {
      var wrap = document.querySelector(".wrap") || document.body;
      wrap.insertBefore(m, wrap.firstChild);
    }
    if (STEPS[idx].file === "community-steward-flagging.html") {
      var foot = document.querySelector(".wrap footer") || document.querySelector("footer");
      var n = nextSteps();
      if (foot && foot.parentNode) { foot.parentNode.insertBefore(n, foot); } else { document.body.appendChild(n); }
    }
  }
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", init); } else { init(); }
})();
