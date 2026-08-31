# adamsass.se

Personal site for Adam Sass, trumpet player and composer in Malmö. He leads
People In Orbit (peopleinorbit.se, also built here), co-writes in floats, and
plays with BEQ, Vidar Orchestra, Spontaneity Quartet and Isildurs Bane. He is
also co-applicant on the Signs of Presence tour.

Vanilla HTML, CSS and JS. No build step, no framework, no CMS. The repo root is
the site: pushing to `main` uploads it straight to GitHub Pages.

## Files
- `index.html` — the page, and all copy
- `assets/style.css` — all styles. Variables at the top, breakpoints at 1100px and 720px
- `assets/script.js` — nav state, scroll reveal, click-to-load embeds
- `assets/img/`, `assets/img/covers/`, `favicon/`, `CNAME`, `.github/workflows/deploy.yml`

## Design system
- Paper `#f2eee5`, ink `#17140f`, one accent: rust `#a8452b`. Do not add a second accent.
- Display type is Instrument Serif, body is Inter. Headings, the lede, record
  titles and press quotes are serif; everything structural is uppercase Inter at
  0.75rem with wide letter-spacing.
- **Photographs are black and white, record sleeves keep their colour.** That is
  the only colour contrast in the design and it carries the whole page. Convert
  any new photograph with `-colorspace Gray`.
- Editorial and quiet on purpose. It sits next to peopleinorbit.se, which is dark
  and image-led, so this one stays light and typographic.

## Content rules
- Every fact on the page traces to a file Adam put in the shared drive at
  `WWW/adamsass.se`. Do not invent biography, dates, credits, or spellings of
  people's names. If it is not in those files, ask.
- His bio was lightly copy-edited for English grammar. Keep his meaning.
- Press quotes are trimmed but never reworded, and always carry the publication.
- Copy in English. No em or en dashes: use commas, periods, colons.

## Gotchas
- `.credits li` and `.facts li` are flex rows. A bare `<em>` inside one becomes
  its own flex item and picks up the row gap on both sides, which reads as a
  typo. Wrap credit text in `.credits__what`.
- CSS shorthand `gap` on a grid sets the row gap too. `.work` splits
  `column-gap` and `row-gap` deliberately.
- A full-page headless screenshot with a very tall window will not reveal the
  last sections, because the scroll-reveal observer uses a negative bottom
  `rootMargin`. Pass `--force-prefers-reduced-motion` when screenshotting.

## Local preview
Apache serves `/Users/jonas/GitHub` as its DocumentRoot, so this repo is already
live at http://localhost/org/jonasjohansson/adamsass.se/. Do not start another
server. Paths in `index.html` are relative so the subdirectory works.
