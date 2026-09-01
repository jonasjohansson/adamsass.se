# adamsass.se

Personal site for **Adam Sass**, trumpet player and composer in Malmö.

One page. Vanilla HTML and CSS, no framework, **no JavaScript on the page and
no webfont**. The only third-party requests are the four video players.

Deploys to https://adamsass.se/ on push to `main`. GitHub Pages is set to
**Deploy from a branch** (`main`, `/`), so it serves the repo root directly.
Branch deploy also picks up the `CNAME` file by itself, which the Actions build
type does not, which is why it stays that way.

## Adam edits this himself

The copy lives in `content/*.yml`, and Adam edits it at
[app.pagescms.org](https://app.pagescms.org) through [Pages
CMS](https://pagescms.org). He signs in with an emailed magic link and needs no
GitHub account. `.pages.yml` defines the three things he sees, About, Records
and Videos, and it is his entire interface: he never touches HTML, so the grid,
the type scale and the no-motion rule are not reachable from the CMS.

Saving commits to `main`, which runs `.github/workflows/build.yml`: it runs the
tests, renders `index.html` from the content files, generates any missing cover
sizes, and commits the result. A change is live in about a minute.

If the content is invalid the build refuses to run, nothing is committed, and
the previous page keeps serving. That is `lib/validate.mjs`, and it is the only
thing standing between a bad save and the live site, so keep it honest.

## Building

```sh
npm install     # once
npm run build   # regenerate index.html and any missing cover sizes
npm test        # unit tests
```

`index.html` is **generated**. Do not edit it: edit `content/*.yml` for copy, or
`lib/template.mjs` for markup. Cover originals go in `assets/img/covers/src/`
and the build makes the 300 and 600 pixel JPEG and WebP versions from them.
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
| `build.mjs`, `lib/` | Renders `index.html` and the cover sizes. |
| `index.html` | Generated. Do not edit. |
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
