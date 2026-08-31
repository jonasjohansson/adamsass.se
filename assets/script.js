/* adamsass.se
   Two behaviours, both functional: mark the section in view, and load a video
   only when asked. No motion, no reveal, no scroll effects: the design does not
   animate, so neither does the script. */

(() => {
  "use strict";

  /* --- mark the section currently in view --- */

  const links = [...document.querySelectorAll("#nav a")];
  const sections = links
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    const ratios = new Map();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => ratios.set(e.target.id, e.intersectionRatio));
        // Largest visible share wins, so a short section scrolled halfway does
        // not steal the mark from a tall one.
        let best = null;
        let bestRatio = 0;
        ratios.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = id;
          }
        });
        links.forEach((a) =>
          a.classList.toggle(
            "is-active",
            bestRatio > 0 && a.getAttribute("href") === "#" + best
          )
        );
      },
      { threshold: [0, 0.15, 0.35, 0.6, 0.9] }
    );
    sections.forEach((s) => observer.observe(s));
  }

  /* --- click-to-load video ---
     Nothing is fetched from YouTube until a visitor asks for it, and the embed
     uses youtube-nocookie. Set data-embed to the provider's embed URL. */

  document.querySelectorAll(".embed__facade").forEach((facade) => {
    facade.addEventListener("click", () => {
      const src = facade.dataset.embed;
      if (!src || src.startsWith("TODO")) {
        console.warn("Embed URL not set yet on:", facade);
        return;
      }
      const frame = document.createElement("iframe");
      frame.src = src;
      frame.title = facade.dataset.title || "Embedded player";
      frame.loading = "lazy";
      frame.allow = "autoplay; encrypted-media; fullscreen; picture-in-picture";
      frame.setAttribute("allowfullscreen", "");
      facade.replaceWith(frame);
    });
  });
})();
