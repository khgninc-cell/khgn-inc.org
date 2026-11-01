/* ==================================================================
   KHGN, Inc. — County at a Glance
   ------------------------------------------------------------------
   Each county page reads about.txt in its own folder. The banner stays
   hidden until the file has content; then it replaces the
   "just getting started" note.

   FILE FORMAT (one item per line):  Label | Text
       Formed | 1799
       Formed from | Lincoln County
       Named for | Henry Knox, the first U.S. Secretary of War
       History | A short paragraph about the county's history.
       History | Another paragraph, if you like.
       Source | Where the facts came from
   "History" lines become paragraphs, "Source" lines are listed at the
   bottom, and any other label appears as a fact. Lines starting with #
   are notes and are ignored.
   ================================================================== */
(function () {
  "use strict";
  function init() {
    var box = document.getElementById("about");
    if (!box) { return; }
    fetch(box.getAttribute("data-src") || "about.txt", { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.text() : ""; })
      .catch(function () { return ""; })
      .then(function (text) {
        var facts = [], history = [], sources = [];
        (text || "").split(/\r?\n/).forEach(function (line) {
          line = line.trim();
          if (!line || line.charAt(0) === "#") { return; }
          var i = line.indexOf("|");
          if (i < 0) { return; }
          var label = line.slice(0, i).trim(), value = line.slice(i + 1).trim();
          if (!value) { return; }
          var key = label.toLowerCase();
          if (key === "history") { history.push(value); }
          else if (key === "source" || key === "sources") { sources.push(value); }
          else { facts.push([label, value]); }
        });
        if (!facts.length && !history.length) { return; }
        var grid = box.querySelector(".facts");
        facts.forEach(function (f) {
          var d = document.createElement("div"); d.className = "fact";
          var b = document.createElement("b"); b.textContent = f[0];
          d.appendChild(b); d.appendChild(document.createTextNode(f[1]));
          grid.appendChild(d);
        });
        var hist = box.querySelector(".history");
        history.forEach(function (h) { var p = document.createElement("p"); p.textContent = h; hist.appendChild(p); });
        if (sources.length) {
          var src = box.querySelector(".sources");
          var lab = document.createElement("b"); lab.textContent = "Sources";
          src.appendChild(lab);
          var ul = document.createElement("ul");
          sources.forEach(function (s) { var li = document.createElement("li"); li.textContent = s; ul.appendChild(li); });
          src.appendChild(ul);
        }
        box.hidden = false;
        var waiting = document.getElementById("getting-started");
        if (waiting) { waiting.hidden = true; }
      });
  }
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", init); } else { init(); }
})();
