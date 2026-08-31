# adamsass.se

Personal site for Adam Sass, trumpet player and composer in Malmö. He leads
People In Orbit (peopleinorbit.se, also built here), co-writes in floats, and
plays with BEQ, Vidar Orchestra and Spontaneity Quartet. He is also
co-applicant on the Signs of Presence tour.

Vanilla HTML, CSS and JS. No build step, no framework, no CMS. The repo root is
the site: pushing to `main` uploads it straight to GitHub Pages.

## Files
- `index.html` — the page, and all copy
- `assets/style.css` — all styles. Variables at the top, breakpoints at 1100px and 720px
- `assets/script.js` — nav state, scroll reveal, click-to-load embeds
- `assets/img/`, `assets/img/covers/`, `favicon/`, `CNAME`, `.github/workflows/deploy.yml`

## Design system
Swiss / International Typographic Style. Josef Müller-Brockmann and Vignelli's
Unigrid are the reference, not a "clean modern website".

- **No motion. None.** No transitions, no fades, no scroll reveals, no smooth
  scrolling, no hover animations, nothing sticky. If you are reaching for
  `transition`, the answer is different spacing.
- **No webfont, no JavaScript.** Helvetica, Arial and Liberation Sans are metric
  siblings and already installed. The page has no script file at all. The only
  third-party requests are the four video players.
- **No rules.** Not one hairline on the page. Space separates things. A column
  of hairlines down a list is decoration pretending to be structure.
- **Nothing explains the page.** No nav, no section titles, no numbered labels,
  no photo captions, no footer, no "back to top". If you are about to add a
  heading that says what the section below contains, that is the fluff Jonas
  keeps deleting. The work is the content.
- **The 12-column grid is the layout.** `.grid` sets it, everything is placed by
  column span, nothing is centred, all text is flush left ragged right.
- **Four type sizes**, set as tokens. A fifth needs a reason. Weight is 400 or
  700 only, because Arial has no medium.
- **Black on white.** No accent colour. The sleeves are the only colour on the
  page and the photographs are black and white.

## What has been cut, and why
Do not reinstate these without being asked. Each was removed as fluff:
the hero's "Trumpet / Composition / Malmö" note; visible photo credits;
numbered section labels; a Groups section that restated the bio; a sixteen-row
"Also appears on" table; a prizes table; two of three press quotes; the nav;
the footer. The prizes, groups and credits are now sentences in the bio, which
is the right home for them: prose reads better than a table of the same facts.

## Content rules
- Every fact on the page traces to a file Adam put in the shared drive at
  `WWW/adamsass.se`. Do not invent biography, dates, credits, or spellings of
  people's names. If it is not in those files, ask.
- His bio was lightly copy-edited for English grammar. Keep his meaning.
- Press quotes are trimmed but never reworded, and always carry the publication.
- Copy in English. No em or en dashes: use commas, periods, colons.

## Gotchas
- CSS shorthand `gap` on a grid sets the row gap as well as the column gap.
  Check both whenever a label drifts from its heading.
- A bare `<em>` inside a flex row becomes its own flex item and picks up the row
  gap on both sides, which reads as a typo. Wrap such text in one element.
- The old nav was clipped at 320px three separate times, each from a different
  cause. It is gone now. If a nav ever comes back: an overflowing flex item is
  invisible in a screenshot, and headless Chrome and an in-page iframe measured
  the same nav differently because of a font fallback, so measure in both.
- Twelve columns divide by four, so a sleeve spans three. When the grid was ten
  columns wide, span three fitted only three sleeves and wrapped the fourth.
- A full-page headless screenshot with a very tall window will not reveal the
  last sections, because the scroll-reveal observer uses a negative bottom
  `rootMargin`. Pass `--force-prefers-reduced-motion` when screenshotting.

## Local preview
Apache serves `/Users/jonas/GitHub` as its DocumentRoot, so this repo is already
live at http://localhost/org/jonasjohansson/adamsass.se/. Do not start another
server. Paths in `index.html` are relative so the subdirectory works.
