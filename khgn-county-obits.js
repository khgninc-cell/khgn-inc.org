/* ==================================================================
   KHGN, Inc. — County obituaries, 1926 and earlier
   ------------------------------------------------------------------
   Each county page reads obituaries.txt in its own folder. The section
   stays hidden until the file has at least one entry.

   FILE FORMAT (one entry per line):
       Name | Date of death | Newspaper and date | Text
   Lines starting with # are notes and are ignored.
   Example:
       John H. Smith | March 3, 1924 | Mountain Advocate, March 7, 1924 | Farmer, survived by his wife and six children.
   ================================================================== */
(function () {
  "use strict";
  function init() {
    var box = document.getElementById("obituaries");
    if (!box) { return; }
    var list = box.querySelector(".obit-list");
    fetch(box.getAttribute("data-src") || "obituaries.txt", { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.text() : ""; })
      .catch(function () { return ""; })
      .then(function (text) {
        var n = 0;
        (text || "").split(/\r?\n/).forEach(function (line) {
          line = line.trim();
          if (!line || line.charAt(0) === "#") { return; }
          var p = line.split("|").map(function (s) { return s.trim(); });
          if (!p[0]) { return; }
          var li = document.createElement("li");
          var name = document.createElement("b"); name.textContent = p[0];
          li.appendChild(name);
          if (p[1]) { var d = document.createElement("span"); d.className = "obit-date"; d.textContent = p[1]; li.appendChild(d); }
          if (p[3]) { var t = document.createElement("p"); t.textContent = p[3]; li.appendChild(t); }
          if (p[2]) { var s = document.createElement("span"); s.className = "obit-source"; s.textContent = "Source: " + p[2]; li.appendChild(s); }
          list.appendChild(li); n++;
        });
        if (n) { box.hidden = false; }
      });
  }
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", init); } else { init(); }
})();
