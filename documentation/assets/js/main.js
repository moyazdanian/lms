/* ============================================================
   LMS Documentation — page behaviour
   No dependencies. Works from file:// as well as from a server.
   ============================================================ */
(function () {
  "use strict";

  var doc = document;
  var content = doc.querySelector(".chapter");

  /* ---------- on-this-page list ---------- */
  function buildToc() {
    var tocList = doc.getElementById("toc");
    var tocWrap = doc.getElementById("onThisPage");
    if (!tocList || !tocWrap || !content) return [];

    // Each section carries its own id; the heading inside it is the label.
    var sections = Array.prototype.slice.call(content.querySelectorAll(".sec[id] > h2"));

    sections.forEach(function (heading) {
      var id = heading.parentElement.id;

      // "#" anchor link, revealed on hover through CSS
      var anchor = doc.createElement("a");
      anchor.className = "anchor";
      anchor.href = "#" + id;
      anchor.setAttribute("aria-label", "Link to this section");
      anchor.textContent = "#";
      heading.appendChild(anchor);

      var item = doc.createElement("li");
      var link = doc.createElement("a");
      link.href = "#" + id;
      link.textContent = heading.textContent.replace(/#\s*$/, "").trim();
      link.dataset.target = id;
      item.appendChild(link);
      tocList.appendChild(item);
    });

    if (sections.length) tocWrap.hidden = false;
    return sections.map(function (heading) {
      return heading.parentElement;
    });
  }

  /* ---------- reading progress + current section ---------- */
  function trackScroll(sections) {
    var bar = doc.getElementById("progressBar");
    var tocLinks = Array.prototype.slice.call(doc.querySelectorAll(".toc a"));
    var ticking = false;

    function offset() {
      return window.innerHeight * 0.22 + 72;
    }

    function currentId() {
      if (!sections.length) return null;
      if (window.innerHeight + window.scrollY >= doc.body.scrollHeight - 4) {
        return sections[sections.length - 1].id;
      }

      var limit = offset();
      var active = sections[0].id;
      sections.forEach(function (section) {
        if (section.getBoundingClientRect().top <= limit) active = section.id;
      });
      return active;
    }

    function update() {
      ticking = false;

      if (bar) {
        var scrollable = doc.documentElement.scrollHeight - window.innerHeight;
        var ratio = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
        bar.style.width = (ratio * 100).toFixed(2) + "%";
      }

      var id = currentId();
      tocLinks.forEach(function (link) {
        if (link.dataset.target === id) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    function request() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    update();
  }

  /* ---------- copy buttons ---------- */
  // Older-browser path: a hidden textarea plus execCommand. Also the
  // fallback when the Clipboard API is unavailable or refuses to run.
  function legacyCopy(text) {
    return new Promise(function (resolve, reject) {
      var scratch = doc.createElement("textarea");
      scratch.value = text;
      scratch.setAttribute("readonly", "");
      scratch.style.position = "fixed";
      scratch.style.top = "-1000px";
      doc.body.appendChild(scratch);
      scratch.select();
      try {
        doc.execCommand("copy") ? resolve() : reject(new Error("copy failed"));
      } catch (error) {
        reject(error);
      } finally {
        doc.body.removeChild(scratch);
      }
    });
  }

  function copyText(text) {
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      return legacyCopy(text);
    }

    return navigator.clipboard.writeText(text).catch(function () {
      return legacyCopy(text);
    });
  }

  function addCopyButtons() {
    Array.prototype.forEach.call(doc.querySelectorAll(".codeblock"), function (block) {
      var pre = block.querySelector("pre");
      if (!pre) return;

      var button = doc.createElement("button");
      button.type = "button";
      button.className = "cb-copy";
      button.textContent = "Copy";

      button.addEventListener("click", function () {
        copyText(pre.innerText.replace(/\n+$/, "")).then(
          function () {
            button.textContent = "Copied";
            button.dataset.copied = "true";
          },
          function () {
            button.textContent = "Press Ctrl+C";
          }
        );

        window.setTimeout(function () {
          button.textContent = "Copy";
          delete button.dataset.copied;
        }, 1600);
      });

      block.appendChild(button);
    });
  }

  /* ---------- rail filter ---------- */
  function filterRail() {
    var input = doc.getElementById("railFilter");
    if (!input) return;

    var empty = doc.querySelector(".rail-empty");
    var rows = Array.prototype.slice.call(
      doc.querySelectorAll(".chapters li, .toc li")
    );

    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      var matches = 0;

      rows.forEach(function (row) {
        var hit = query === "" || row.textContent.toLowerCase().indexOf(query) !== -1;
        row.hidden = !hit;
        if (hit) matches += 1;
      });

      if (empty) empty.hidden = !(query !== "" && matches === 0);
    });

    input.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        input.value = "";
        input.dispatchEvent(new Event("input"));
        input.blur();
      }
    });
  }

  /* ---------- mobile rail ---------- */
  function railDrawer() {
    var toggle = doc.getElementById("railToggle");
    var rail = doc.getElementById("rail");
    if (!toggle || !rail) return;

    function setOpen(open) {
      rail.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    }

    toggle.addEventListener("click", function () {
      setOpen(!rail.classList.contains("is-open"));
    });

    rail.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });

    doc.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setOpen(false);
    });
  }

  /* ---------- go ---------- */
  var sections = buildToc();
  trackScroll(sections);
  addCopyButtons();
  filterRail();
  railDrawer();
})();
