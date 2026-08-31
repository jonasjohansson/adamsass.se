# adamsass.se

Personal site for **Adam Sass**, trumpet player and composer in Malmö.

One page. Vanilla HTML and CSS, no build step, no framework, no CMS, **no
JavaScript and no webfont**. The only third-party requests are the four video
players.

Deploys to https://adamsass.se/ via GitHub Pages on push to `main`.

## Local preview

Apache already serves it. `DocumentRoot` is `/Users/jonas/GitHub`, so this repo
is live at:

http://localhost/org/jonasjohansson/adamsass.se/

Nothing to start. All paths are relative, so it works from that subdirectory as
well as from the domain root.

## Files

| Path | What it is |
|---|---|
| `index.html` | The whole page. All copy lives here. |
| `assets/style.css` | All styles. Tokens at the top, breakpoints at 1000px and 700px. |
| `assets/img/` | Hero, portrait, Open Graph card. |
| `assets/img/covers/` | Record sleeves, JPEG plus WebP. |
| `favicon/` | Icons. Only `favicon.svg` exists so far. |
| `CNAME` | Custom domain. |
| `.github/workflows/deploy.yml` | Uploads the repo root to Pages on push to `main`. |

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

## Still open

1. **Photo credits.** Mattias Foto and Maja Gallstad shot the two photographs.
   Their credits are HTML comments, not printed on the page, at Jonas's
   request. Worth checking neither photographer expects a visible credit.
2. **The email** is `adsass98@gmail.com`, taken from correspondence rather than
   from the folder Adam uploaded. Confirm it is the address he wants public.
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
