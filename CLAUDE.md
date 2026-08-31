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
- **One typeface: EB Garamond.** No sans anywhere. Weight, size and letterspaced
  caps do all the work. Do not add a second family.
- Paper `#fbf9f5`, ink `#14120f`. **No accent colour.** The record sleeves are
  the only colour on the page and the photographs are black and white. If a new
  element seems to need a colour, it needs better spacing instead.
- One mannerism only: letterspaced uppercase at `--label-size` for structural
  labels. It is set once in a shared rule; do not improvise new label styles.
- Type scale is three steps, and they should stay far apart: the name (~208px at
  1440), section titles (~64px), text (~19px).
- Links are ink with a hairline underline that darkens on hover. One treatment
  sitewide.
- No copy explains a section. If a heading needs a subtitle telling the reader
  what the section contains, delete the subtitle. The About section carries no
  heading at all, on purpose.

## Content rules
- Every fact on the page traces to a file Adam put in the shared drive at
  `WWW/adamsass.se`. Do not invent biography, dates, credits, or spellings of
  people's names. If it is not in those files, ask.
- His bio was lightly copy-edited for English grammar. Keep his meaning.
- Press quotes are trimmed but never reworded, and always carry the publication.
- Copy in English. No em or en dashes: use commas, periods, colons.

## Gotchas
- `.credits li` is a flex row. A bare `<em>` inside one becomes its own flex
  item and picks up the row gap on both sides, which reads as a typo. Wrap
  credit text in `.credits__what`.
- In `.work`, the title and its role line live together in `.work__head`. They
  used to be separate grid children with the description spanning two rows,
  which let a long description stretch the rows and float the role line away
  from the name it belongs to.
- CSS shorthand `gap` on a grid sets the row gap as well as the column gap.
  Check both whenever a label drifts from its heading.
- Five nav labels have to fit one line at 320px. If you add a sixth, re-measure
  rather than assuming it wraps gracefully.
- A full-page headless screenshot with a very tall window will not reveal the
  last sections, because the scroll-reveal observer uses a negative bottom
  `rootMargin`. Pass `--force-prefers-reduced-motion` when screenshotting.

## Local preview
Apache serves `/Users/jonas/GitHub` as its DocumentRoot, so this repo is already
live at http://localhost/org/jonasjohansson/adamsass.se/. Do not start another
server. Paths in `index.html` are relative so the subdirectory works.
