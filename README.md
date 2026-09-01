# adamsass.se

Personal site for **Adam Sass**, trumpet player and composer in Malmö.

One page. Vanilla HTML and CSS, no framework, **no JavaScript on the page and
no webfont**. The only third-party requests are the four video players.

Deploys to https://adamsass.se/ on push to `main`, as a GitHub Pages artifact
built by `.github/workflows/deploy.yml`. Same shape as lumenproject.se,
elverket.com and soundsofsaving.org. The Action has `contents: read` and pushes
nothing; `CNAME` is copied into the artifact and the custom domain is claimed on
the Pages API, because an Actions deploy does not adopt a `CNAME` file the way
branch deploy did.

## Adam edits this himself

The copy lives in `content/*.yml`, and Adam edits it at
[app.pagescms.org](https://app.pagescms.org) through [Pages
CMS](https://pagescms.org). He signs in with an emailed magic link and needs no
GitHub account. `.pages.yml` defines the three things he sees, About, Records
and Videos, and it is his entire interface: he never touches HTML, so the grid,
the type scale and the no-motion rule are not reachable from the CMS.

Saving commits to `main`, which runs `.github/workflows/build.yml`: it runs the
tests, renders `index.html` from the content files, generates any missing cover
sizes, and commits the result. GitHub Pages then does its own deploy, so a
change takes a couple of minutes to appear, not seconds.

If the content is invalid the build refuses to run, nothing is committed, and
the previous page keeps serving. That is `lib/validate.mjs`, and it is the only
thing standing between a bad save and the live site, so keep it honest.

### When a save does not appear

**Adam cannot see this himself, and that is the weak point.** He has no GitHub
account, so a failed build is invisible to him: his change simply never shows
up. The failure notification goes to Jonas, as the person who installed the
app. So if Adam says an edit did not take, look at the Actions tab before
looking at anything else.

Every message the build produces names the field and what to do, in English,
because Adam is the one who has to act on it. If a failure ever produces a
stack trace instead, that is a bug in `lib/validate.mjs` or `build.mjs`: the
rule is that anything Adam can type becomes a sentence, not a trace.

Two states worth knowing, neither of them a problem:

- Two saves seconds apart cancel the older run (`concurrency: cancel-in-progress`)
  and the newer one deploys everything. Nothing is lost, because the build reads
  whatever content is on `main` at checkout.

  This used to be a real hazard. The first version of the workflow committed the
  built page back to `main`, and on 1 Sep 2026 two saves seconds apart cost one
  of those commits: the push was rejected, no second run was ever queued, the
  Action reported success anyway, and the site quietly served a stale page until
  it was rebuilt by hand. Deploying an artifact removes the failure rather than
  handling it — there is no commit to lose. Do not reintroduce a workflow that
  writes to the repo.
- Deleting a record leaves its original in `assets/img/covers/src/` and its
  four derivatives behind. Nothing points at them and they cost only disk.
  Delete them by hand if it ever bothers you.

After any of Adam's saves the local `main` is behind by his commit, so pull
before pushing. Nothing generated is in git, so there is nothing to conflict.

## Building

```sh
npm install     # once
npm run build   # write _site/
npm test        # unit tests
```

The built site lands in `_site/`, which is gitignored: **nothing generated is
committed**. Preview it at
http://localhost/org/jonasjohansson/adamsass.se/_site/ after a build.

Edit `content/*.yml` for copy, `lib/template.mjs` for markup, and
`lib/static.mjs` to publish a file that the build does not generate. Cover
originals go in `assets/img/covers/src/` and are the only images in git; the
build makes the 300 and 600 pixel JPEG and WebP versions into `_site/`, and the
Action caches them keyed on the originals so they are not re-encoded every run.
The originals themselves are never published.
A sleeve has to be at least 600 by 600 or the build refuses it, and which
sleeves get remade is decided by a hash of the original's bytes, kept in
`assets/img/covers/.manifest.json`. Not by timestamps: a checkout writes the
whole tree at once, so on the Action a timestamp says nothing about age.

Adam's markdown is inline only, on purpose: `*italic*`, `**bold**` and
`[label](url)`. Block level markdown would let a heading in, and with it a
fifth type size. It also does not nest, so do not write `**a *b* c**`.

## Local preview

Apache already serves it. `DocumentRoot` is `/Users/jonas/GitHub`, so this repo
is live at:

http://localhost/org/jonasjohansson/adamsass.se/

Nothing to start. All paths are relative, so it works from that subdirectory as
well as from the domain root.

## Files

| Path | What it is |
|---|---|
| `content/*.yml` | All the copy. What Adam edits. |
| `.pages.yml` | The fields Adam sees in the CMS. |
| `build.mjs`, `lib/` | Renders the site into `_site/`. |
| `_site/` | The built site. Generated, gitignored. |
| `assets/style.css` | All styles. Tokens at the top, breakpoints at 1000px and 700px. |
| `assets/img/` | Hero, portrait, Open Graph card. |
| `assets/img/covers/` | Generated sleeves, JPEG plus WebP. |
| `assets/img/covers/src/` | Sleeve originals, uploaded through the CMS. |
| `assets/img/covers/.manifest.json` | A hash of each original. What tells the build which sleeves to remake. |
| `.github/workflows/build.yml` | Builds and commits the page when content changes. |
| `favicon/` | Icons. |
| `CNAME` | Custom domain. |
| `robots.txt`, `sitemap.xml` | SEO. The sitemap has one URL, because there is one page. |

## Where the content came from

Everything is from what Adam put in the shared drive at `WWW/adamsass.se`: his
own short bio and links, `CV 2026.pdf` for the discography, prizes and touring
figures, `Recensioner/` for the press quote, `Bilder/` for the photographs and
`Skivor/` for the sleeves. His bio was copy-edited and consolidated into
continuous prose. Nothing was invented: if a fact is not in those files, it is
not on the page.

## Record links

Each sleeve links to where you can listen or buy, preferring the label:

| Album | Links to | Why |
|---|---|---|
| Viewpoint | People In Orbit Bandcamp | `aprilrecords.dk` does not resolve; Bandcamp is April Records' real home |
| Filament | floats Bandcamp | The page Sonde Records' own Bandcamp points to |
| Close/Away | Naxos Direct item 1203059 | `prophonerecords.se` redirects here, so it is Prophone's own shop |
| Roadwork Ahead | floats Bandcamp | No Bagissimo page exists; the back catalogue moved to Sonde |

Naxos Direct is a single-page app, so **any** slug under `/items/` returns 200.
The item ID is what resolves the record. Verified against
`https://nxd-api.naxos.com/item/info?itemId=1203059&siteId=1`, which returns
title `Close/Away`, item number `PCD317`, label `Prophone`. If you change that
link, verify the same way; a 200 proves nothing there.

## CV

The CV link points at the Google Doc's PDF export endpoint:

```
https://docs.google.com/document/d/<id>/export?format=pdf
```

Editing the Doc updates the PDF: there is no file to regenerate or re-upload.
The Doc is shared as anyone with the link can view, which the export endpoint
needs. Verified signed out: HTTP 200, `application/pdf`, downloads as
`Adam Sass CV.pdf`.

Source is `CV 2026.pdf` in the shared drive, translated into English and set in
a classic CV structure: contact block, bio, then dated entries under all-caps
headings.

## Still open

1. **Photo credits.** Mattias Foto and Maja Gallstad shot the two photographs.
   Their credits are HTML comments, not printed on the page, at Jonas's
   request. Worth checking neither photographer expects a visible credit.
2. **The domain cannot receive mail yet.** The page shows `info@adamsass.se`,
   but `adamsass.se` has **no MX records**, so anything sent there bounces.
   There is an SPF record pointing at `_spf.mx.cloudflare.net`, so Cloudflare
   Email Routing looks half configured: finish it in Cloudflare (Email >
   Email Routing), which adds the three `route*.mx.cloudflare.net` MX records
   and forwards to a real inbox. Check with:

   ```sh
   dig +short adamsass.se MX
   ```

   Empty output means the address on the site is dead.
3. **Favicons.** Generate the raster set and uncomment the block in `<head>`.
4. **Live dates.** There is no gigs section. He played 82 concerts in 2025, so
   one may be worth it, but it needs someone to keep it current.

## Images

Sources in the drive are large (one sleeve is 12500px square). Everything in
`assets/img/` is resized and stripped. To redo one:

```sh
magick source.jpg -colorspace Gray -resize 2000x -quality 82 -strip assets/img/hero.jpg
magick assets/img/hero.jpg -resize 1600x -quality 78 assets/img/hero.webp
```

Photographs are black and white, sleeves keep their colour. That contrast is
the whole visual idea, so keep new photographs monochrome.
