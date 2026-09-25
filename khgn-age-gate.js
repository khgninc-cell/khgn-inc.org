/* ==================================================================
   KHGN Inc. — Age Gate for the Game Portal and training games
   ------------------------------------------------------------------
   HOW TO INSTALL
   1. Upload this file to the main folder of the website, next to
      game-portal.html, so its address is:
        https://khgn-inc.org/khgn-age-gate.js
   2. Paste these lines inside the <head> of EVERY page to protect,
      as high in the <head> as possible:

      <script src="/khgn-age-gate.js"></script>
      <noscript><style>body > *{display:none !important}body::before{content:"Please turn on JavaScript in your browser to view the KHGN Game Portal.";display:block;padding:40px 24px;font:18px/1.5 system-ui,sans-serif}</style></noscript>

   A visitor who passes the gate once is not asked again on the other
   game pages until they close the browser tab.

   PRIVACY: the birthdate is checked and discarded. Nothing personal is
   stored. The only things saved are a "passed" flag (cleared when the
   tab closes) and, after an underage entry, the time the lockout ends.
   ================================================================== */
(function () {
  "use strict";

  /* ---------- Settings the Website Subcommittee can change ---------- */
  var MIN_AGE = 20;                                   // minimum age to enter
  var LOCKOUT_HOURS = 24;                             // how long an underage result is remembered
  var HOME_URL = "https://khgn-inc.org/index.html";   // where "home page" links go

  var PASS_KEY = "khgnAgeGatePassed";
  var LOCK_KEY = "khgnAgeGateLockUntil";
  var root = document.documentElement;

  function safeGet(store, key) { try { return store.getItem(key); } catch (e) { return null; } }
  function safeSet(store, key, val) { try { store.setItem(key, val); } catch (e) {} }

  /* Already passed during this visit: show the page and stop. */
  if (safeGet(sessionStorage, PASS_KEY) === "yes") {
    root.classList.add("khgn-age-ok");
    return;
  }

  /* ---------- Styles: hide the page until the gate is passed ---------- */
  var css = [
    "html:not(.khgn-age-ok) body > *:not(#khgn-gate){display:none !important}",
    "html:not(.khgn-age-ok) body{overflow:hidden}",
    "#khgn-gate{--navy:#1F3A5F;--navy-deep:#13233A;--brass:#8A5A14;--paper:#F5F7FA;--ink:#1B2230;--muted:#4A5263;--line:#B8C2D1;",
      "position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:24px;",
      "overflow-y:auto;box-sizing:border-box;background:var(--navy-deep);color:var(--ink);",
      "font-family:'Source Sans 3','Segoe UI',system-ui,-apple-system,sans-serif;text-align:left}",
    "#khgn-gate *{box-sizing:border-box}",
    "#khgn-gate [hidden]{display:none !important}",
    "#khgn-gate .kg-panel{width:100%;max-width:440px;background:var(--paper);border-top:6px solid var(--brass);border-radius:6px;padding:32px 28px 28px}",
    "#khgn-gate .kg-org{margin:0 0 20px;font-size:15px;font-weight:700;letter-spacing:.04em;color:var(--navy)}",
    "#khgn-gate h1{margin:0 0 8px;font-family:'Libre Caslon Text',Georgia,'Times New Roman',serif;font-size:26px;line-height:1.2;color:var(--ink);font-weight:700}",
    "#khgn-gate p{margin:0 0 20px;font-size:16px;line-height:1.5;color:var(--muted)}",
    "#khgn-gate fieldset{display:grid;grid-template-columns:1.6fr 1fr 1.2fr;gap:10px;margin:0 0 8px;padding:0;border:0;min-width:0}",
    "#khgn-gate legend{grid-column:1/-1;margin-bottom:8px;padding:0;font-size:15px;font-weight:600;color:var(--ink)}",
    "#khgn-gate label{display:flex;flex-direction:column;gap:4px;font-size:14px;color:var(--muted)}",
    "#khgn-gate select{width:100%;min-height:44px;padding:8px 10px;font:inherit;font-size:16px;color:var(--ink);background:#fff;border:1.5px solid var(--line);border-radius:4px}",
    "#khgn-gate select:focus-visible,#khgn-gate button:focus-visible,#khgn-gate a:focus-visible,#khgn-gate h1:focus-visible{outline:3px solid var(--brass);outline-offset:2px}",
    "#khgn-gate .kg-error{min-height:22px;margin:4px 0 12px;font-size:15px;font-weight:600;color:#9B1C1C}",
    "#khgn-gate button{width:100%;min-height:48px;font:inherit;font-size:17px;font-weight:700;color:#fff;background:var(--navy);border:0;border-radius:4px;cursor:pointer}",
    "#khgn-gate button:hover{background:var(--navy-deep)}",
    "#khgn-gate .kg-home{display:inline-block;margin-top:16px;font-size:15px;color:var(--navy)}",
    "#khgn-gate .kg-home:hover{color:var(--brass)}",
    "@media (max-width:420px){#khgn-gate .kg-panel{padding:24px 18px 20px}#khgn-gate fieldset{grid-template-columns:1fr 1fr}#khgn-gate fieldset label:first-of-type{grid-column:1/-1}}"
  ].join("");
  var style = document.createElement("style");
  style.id = "khgn-age-gate-style";
  style.textContent = css;
  (document.head || root).appendChild(style);

  /* ---------- Build the gate once the page body exists ---------- */
  function build() {
    var gate = document.createElement("div");
    gate.id = "khgn-gate";
    gate.innerHTML =
      '<div class="kg-panel" role="dialog" aria-modal="true" aria-labelledby="kg-title">' +
        '<p class="kg-org">KHGN Inc.</p>' +
        '<div id="kg-ask">' +
          '<h1 id="kg-title">Before you continue</h1>' +
          '<p>Enter your date of birth to open the Game Portal.</p>' +
          '<form id="kg-form" novalidate>' +
            '<fieldset>' +
              '<legend>Date of birth</legend>' +
              '<label>Month<select id="kg-month"></select></label>' +
              '<label>Day<select id="kg-day"></select></label>' +
              '<label>Year<select id="kg-year"></select></label>' +
            '</fieldset>' +
            '<div class="kg-error" id="kg-error" role="alert" aria-live="assertive"></div>' +
            '<button type="submit">Continue</button>' +
          '</form>' +
          '<a class="kg-home" href="' + HOME_URL + '">Return to the home page</a>' +
        '</div>' +
        '<div id="kg-denied" hidden>' +
          '<h1 id="kg-denied-title" tabindex="-1">This area isn\'t available</h1>' +
          '<p>The Game Portal is for visitors ' + MIN_AGE + ' and older. You\'re welcome to keep browsing the rest of our website.</p>' +
          '<a class="kg-home" href="' + HOME_URL + '">Go to the home page</a>' +
        '</div>' +
      '</div>';
    document.body.insertBefore(gate, document.body.firstChild);

    var askView = document.getElementById("kg-ask");
    var deniedView = document.getElementById("kg-denied");
    var form = document.getElementById("kg-form");
    var monthSel = document.getElementById("kg-month");
    var daySel = document.getElementById("kg-day");
    var yearSel = document.getElementById("kg-year");
    var errorBox = document.getElementById("kg-error");

    function showDenied() {
      askView.hidden = true;
      deniedView.hidden = false;
      document.getElementById("kg-denied-title").focus();
    }

    function unlock() {
      root.classList.add("khgn-age-ok");
      gate.parentNode.removeChild(gate);
      var heading = document.querySelector("h1");
      if (heading) {
        if (!heading.hasAttribute("tabindex")) { heading.setAttribute("tabindex", "-1"); }
        heading.focus();
      }
    }

    /* Keep keyboard focus inside the gate */
    gate.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") { return; }
      var items = Array.prototype.filter.call(
        gate.querySelectorAll("select, button, a[href]"),
        function (el) { return el.offsetParent !== null; }
      );
      if (!items.length) { return; }
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    /* Still locked out from an underage entry? */
    var lockUntil = parseInt(safeGet(localStorage, LOCK_KEY), 10);
    if (lockUntil && Date.now() < lockUntil) { showDenied(); return; }

    /* Fill the date menus */
    var MONTHS = ["January", "February", "March", "April", "May", "June", "July",
                  "August", "September", "October", "November", "December"];
    function addOption(sel, value, label) {
      var o = document.createElement("option");
      o.value = value; o.textContent = label; sel.appendChild(o);
    }
    addOption(monthSel, "", "Month");
    MONTHS.forEach(function (m, i) { addOption(monthSel, String(i + 1), m); });
    addOption(yearSel, "", "Year");
    var thisYear = new Date().getFullYear();
    for (var y = thisYear; y >= thisYear - 110; y--) { addOption(yearSel, String(y), String(y)); }

    function fillDays() {
      var keep = daySel.value;
      var m = parseInt(monthSel.value, 10);
      var yr = parseInt(yearSel.value, 10) || 2000;
      var max = m ? new Date(yr, m, 0).getDate() : 31;
      daySel.innerHTML = "";
      addOption(daySel, "", "Day");
      for (var d = 1; d <= max; d++) { addOption(daySel, String(d), String(d)); }
      if (keep && parseInt(keep, 10) <= max) { daySel.value = keep; }
    }
    fillDays();
    monthSel.addEventListener("change", fillDays);
    yearSel.addEventListener("change", fillDays);
    monthSel.focus();

    /* Check the date */
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      errorBox.textContent = "";
      var m = parseInt(monthSel.value, 10);
      var d = parseInt(daySel.value, 10);
      var yr = parseInt(yearSel.value, 10);
      if (!m || !d || !yr) {
        errorBox.textContent = "Choose a month, day, and year to continue.";
        return;
      }
      var today = new Date();
      if (new Date(yr, m - 1, d) > today) {
        errorBox.textContent = "That date is in the future. Check the year and try again.";
        return;
      }
      var age = today.getFullYear() - yr;
      var hadBirthday = (today.getMonth() + 1 > m) ||
                        (today.getMonth() + 1 === m && today.getDate() >= d);
      if (!hadBirthday) { age--; }

      /* Clear the choices right away so the birthdate is never kept */
      monthSel.value = ""; daySel.value = ""; yearSel.value = "";

      if (age >= MIN_AGE) {
        safeSet(sessionStorage, PASS_KEY, "yes");
        unlock();
      } else {
        safeSet(localStorage, LOCK_KEY, String(Date.now() + LOCKOUT_HOURS * 3600 * 1000));
        showDenied();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
