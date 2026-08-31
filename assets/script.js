/* adamsass.se
   Three small things: nav state, scroll reveal, click-to-load embeds.
   No dependencies, no build. */

(() => {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- nav: hairline + name appear once the hero is scrolled past --- */

  const nav = document.getElementById("nav");
  const hero = document.getElementById("top");

  if (nav && hero && "IntersectionObserver" in window) {
    new IntersectionObserver(
      ([entry]) => nav.classList.toggle("is-stuck", !entry.isIntersecting),
      { rootMargin: "-70px 0px 0px 0px" }
    ).observe(hero);
  }

  /* --- nav: mark the section currently in view --- */

  const links = [...document.querySelectorAll(".nav__list a")];
  const sections = links
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    const seen = new Map();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target.id, e.intersectionRatio));
        // The section with the largest visible share wins, so a short section
        // scrolled halfway does not steal the highlight from a tall one.
        let best = null;
        let bestRatio = 0;
        seen.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = id;
          }
        });
        links.forEach((a) =>
          a.classList.toggle("is-active", bestRatio > 0 && a.getAttribute("href") === "#" + best)
        );
      },
      { threshold: [0, 0.15, 0.35, 0.6, 0.9] }
    );
    sections.forEach((s) => observer.observe(s));
  }

  /* --- reveal on scroll --- */

  const revealables = document.querySelectorAll(
    ".section__title, .section__intro, .hero__figure, .about__portrait, .about__text, .record, .press, .credits, .embed, .work, .contact"
  );

  if (reduced || !("IntersectionObserver" in window)) {
    revealables.forEach((el) => el.classList.add("is-in"));
  } else {
    revealables.forEach((el, i) => {
      el.classList.add("reveal");
      el.style.transitionDelay = Math.min(i % 4, 3) * 60 + "ms";
    });
    const revealer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-in");
          obs.unobserve(e.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
    );
    revealables.forEach((el) => revealer.observe(el));
  }

  /* --- click-to-load embeds ---
     Nothing is fetched from Bandcamp, Spotify or YouTube until a visitor
     clicks. Keeps the page fast and avoids third-party cookies on load.
     Set data-embed on the button to the provider's embed URL. */

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
      frame.height = facade.closest(".embed--wide") ? 460 : 340;
      facade.replaceWith(frame);
    });
  });
})();
