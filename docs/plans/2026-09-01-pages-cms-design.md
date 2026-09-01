# Pages CMS for adamsass.se

Adam edits the records, videos, bio, press quote and contact details himself.
Jonas keeps the design system.

## The problem

Pages CMS edits data files with a schema. It does not edit HTML: its only HTML
option is a raw code editor, which is GitHub's web editor with a nicer font.
All the copy on this site lives inline in `index.html`, and the repo has no
build step. So the content has to move out into data files, and something has
to render the page.

That costs the "no build step, no framework" rule in CLAUDE.md. Accepted
deliberately, and only for this.

## Access

Pages CMS invites collaborators by email with a passwordless magic link. Adam
does not need a GitHub account. Jonas signs in with GitHub as the repository
owner, installs the app on `adamsass.se`, and invites Adam; Adam's saves commit
through Jonas's installation.

## Content

Three files, which is what Adam sees as three items in the CMS sidebar.

- `content/site.yml` — email, city, CV link, meta description, bio as a list of
  paragraphs, press quote as text plus source.
- `content/records.yml` — a reorderable list: title, band, label, year, link,
  cover.
- `content/videos.yml` — a reorderable list: YouTube URL, title.

## Template

`build.mjs` holds the markup as a tagged template literal and renders
`index.html`. No template language, no dependency beyond `sharp`, and the
markup still highlights in an editor.

## Bio formatting

Paragraphs are plain text. HTML is escaped first, then only `*italic*`,
`**bold**` and `[text](url)` are honoured. Italic is there because album titles
need `<em>`.

Not a rich text field, deliberately. A rich text field would let Adam introduce
a heading, and with it a fifth type size.

## Images

Adam uploads one cover to `assets/img/covers/src/`. The build makes the `-300`
and `-600` jpg and webp derivatives with `sharp`, skipping any already current.

The hero and the portrait stay hand managed and out of the CMS. They are not
going to change, and leaving them out removes a chunk of the machinery.

## Deploy

A workflow on pushes touching `content/`, `assets/img/covers/src/` or the build
script runs the build and commits `index.html` and any new derivatives back to
`main`. The existing legacy Pages deploy from `main` root picks it up. The path
filter keeps the workflow from retriggering itself. Local Apache preview is
unaffected.

## Safety

Pages CMS commits straight to `main`, so a bad save would be live in under a
minute. The build validates first: required fields present, year sane, cover
file actually on disk. A failure fails the Action, and the previous good
`index.html` keeps serving.

Adam never sees markup, so the grid, the type scale and the no motion rule are
not reachable from the CMS at all.

## Cost

`index.html` becomes a generated file. Jonas stops editing it directly and
edits `build.mjs` or the YAML instead.
