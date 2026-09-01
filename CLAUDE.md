# adamsass.se

Personal site for Adam Sass, trumpet player and composer in Malmö. He leads
People In Orbit (peopleinorbit.se, also built here), co-writes in floats, and
plays with BEQ, Vidar Orchestra and Spontaneity Quartet. He is also
co-applicant on the Signs of Presence tour.

Vanilla HTML and CSS. No framework, and no JavaScript on the page. There is a
build step, and only because Adam edits the site himself through Pages CMS:
`content/*.yml` holds the copy and `build.mjs` renders the site into `_site/`.
A GitHub Action builds that and deploys it as a Pages artifact, the same way
lumenproject.se, elverket.com and soundsofsaving.org work. Nothing generated is
committed and the Action never pushes.

## Files
- `content/*.yml` — all the copy. Adam edits these in Pages CMS, not by hand
- `build.mjs`, `lib/` — renders `index.html` and the cover derivatives
- `_site/` — the built site. Generated, gitignored, never edited
- `assets/style.css` — all styles. Variables at the top, breakpoints at 1000px and 700px
- `assets/img/covers/src/` — cover originals. The build makes the 300 and 600
  sizes, and `covers/.manifest.json` records which originals they were made from
- `.pages.yml` — the fields Adam sees in the CMS. It is his whole interface
- `lib/static.mjs` — the list of files copied into `_site/` verbatim
- `assets/img/`, `favicon/`, `CNAME`, `.github/workflows/deploy.yml`

## Editing the site
- `npm install` once, then `npm run build` to write `_site/`
- `npm test` runs the unit tests. The build refuses to run on invalid content
- Adam edits at https://app.pagescms.org. He signs in with a magic link and has
  no GitHub account, which is fine and deliberate

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
- `index.html` is generated into `_site/` and is not in git. Edit
  `content/*.yml` for copy or `lib/template.mjs` for markup.
- A new file in `assets/` is not published until it is named in
  `lib/static.mjs`. The copy list is explicit on purpose: it is what keeps the
  cover originals, `node_modules` and the plans out of the deployed site.
- File timestamps are worthless on the Action. `actions/checkout` writes the
  whole tree in one go, in path order, so `covers/src/viewpoint.jpg` is always
  written before `covers/viewpoint-600.jpg` and the derivative always looks
  newer than its source. What gets rebuilt is decided by a hash of the source
  bytes in `assets/img/covers/.manifest.json`. Rebuilding everything instead
  would ping-pong the committed binaries: libvips encodes differently on macOS
  and on Linux.
- Adam's markdown is inline only, by design: italic, bold and links. Adding
  block level markdown would let a heading in, and with it a fifth type size.
  It also does not nest, so `**a *b* c**` renders wrong. Do not nest markers.
- Pages CMS commits straight to `main`, so a bad save would be live in minutes.
  `lib/validate.mjs` is what stops that: it fails the build, no artifact is
  uploaded, and the last good deploy keeps serving. Keep it honest.
- The Action deploys an artifact and has `contents: read`. It does not push, so
  it cannot race a save. An earlier version did commit the built page back to
  `main`, and on 1 Sep 2026 two saves seconds apart cost one of those commits:
  the push was rejected, the run went green anyway, and the site served a stale
  page. Do not reintroduce a workflow that writes to the repo.

## Local preview
Run `npm run build`, then open
http://localhost/org/jonasjohansson/adamsass.se/_site/. Apache serves
`/Users/jonas/GitHub` as its DocumentRoot, so there is no server to start; the
`_site/` on the end is the only difference from before. Paths are relative, so
the subdirectory works.
