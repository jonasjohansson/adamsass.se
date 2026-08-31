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
Swiss / International Typographic Style. Josef Müller-Brockmann and Vignelli's
Unigrid are the reference, not a "clean modern website".

- **No motion. None.** No transitions, no fades, no scroll reveals, no smooth
  scrolling, no hover animations, no sticky labels that slide. State changes are
  instant. If you are reaching for `transition`, the answer is different spacing.
- **No webfont.** Helvetica, Arial and Liberation Sans are metric siblings and
  already installed. The page makes zero third-party requests. Do not add a font
  link; do not swap in a Google approximation of a grotesque.
- **The 12-column grid is the layout.** `.grid` sets it, everything is placed on
  it by column span, nothing is centred, all text is flush left ragged right.
  Section labels sit in columns 1 to 3, content in 3 to 13. Sub-grids inside a
  section body are ten columns, matching the body's width.
- **Four type sizes**, set as tokens: display, lede, body, label. A fifth needs a
  reason. Weight is 400 or 700 only, because Arial has no medium.
- **Black on white.** No accent colour. The record sleeves are the only colour on
  the page and the photographs are black and white.
- Rules carry the structure: 1px black between sections, 1px light grey between
  rows inside a list.
- One mannerism: uppercase at `--t-label` with `--track-label`. Set once in a
  shared rule, never improvised per component.
- No copy explains a section. If a heading needs a subtitle saying what the
  section contains, delete the subtitle.

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
- Five nav labels have to fit one line at 320px. This broke twice: once from
  tracking that was too wide, once from `flex: 1 1 0` tracks forcing each item
  to its content width and pushing the fifth out of view. Measure
  `#nav li` bounding boxes at 320 and 390 after any nav change; do not judge it
  from a screenshot, the overflowing item is invisible.
- The section body is ten columns, so a record sleeve spans two, giving five
  modules a row with four filled. Span three fits only three and wraps the
  fourth onto a row by itself.
- A full-page headless screenshot with a very tall window will not reveal the
  last sections, because the scroll-reveal observer uses a negative bottom
  `rootMargin`. Pass `--force-prefers-reduced-motion` when screenshotting.

## Local preview
Apache serves `/Users/jonas/GitHub` as its DocumentRoot, so this repo is already
live at http://localhost/org/jonasjohansson/adamsass.se/. Do not start another
server. Paths in `index.html` are relative so the subdirectory works.
