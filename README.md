# adamsass.se

Personal site for **Adam Sass**, trumpet player and composer in Malmö. Vanilla
HTML, CSS and JS. No build step, no framework, no CMS.

Deploys to https://adamsass.se/ via GitHub Pages on push to `main`.

## Local preview

Apache already serves it. `DocumentRoot` is `/Users/jonas/GitHub`, so this repo
is live at:

http://localhost/org/jonasjohansson/adamsass.se/

Nothing to start. All paths in `index.html` are relative, so it works from that
subdirectory as well as from the domain root.

## Files

| Path | What it is |
|---|---|
| `index.html` | The whole page. All copy lives here. |
| `assets/style.css` | All styles. CSS variables at the top, breakpoints at 1100px and 720px. |
| `assets/script.js` | Nav state, scroll reveal, click-to-load video embeds. |
| `assets/img/` | Hero, portrait, Open Graph card. |
| `assets/img/covers/` | Record sleeves, JPEG plus WebP. |
| `favicon/` | Icons. Only `favicon.svg` exists so far. |
| `CNAME` | Custom domain for GitHub Pages. |
| `.github/workflows/deploy.yml` | Uploads the repo root to Pages on push to `main`. |

## Where the content came from

Everything is from what Adam put in the shared drive at
`WWW/adamsass.se`: his own short bio and links (`adamsass.se` doc), `CV 2026.pdf`
for the discography, awards and touring figures, `Recensioner/` for the press
quotes, `Bilder/` for the photographs, and `Skivor/` for the sleeves.

His bio was lightly copy-edited for English grammar. Nothing was invented: if a
fact is not in those files, it is not on the page.

## Still open

Search the source for `TODO`.

1. **Public email** — the page currently shows `adsass98@gmail.com`, taken from
   his correspondence. Confirm he wants that address public.
2. **Photo credits** — captions read "Mattias Foto" and "Maja Gallstad", the
   folder names in the drive. Get the photographers' full names.
3. **Own social links** — the Elsewhere list only has the bands. Add his own
   Instagram and YouTube channel if he wants them.
4. **Favicons** — generate the raster set and uncomment the block in `<head>`.
5. **Live dates** — there is no gigs section. He plays 80 or more concerts a
   year, so it may be worth adding one, but it needs someone to keep it current.

## Images

Source files in the drive are large (one sleeve is 12500px square). Everything
in `assets/img/` is already resized and stripped. To redo one:

```sh
magick source.jpg -resize 2000x -quality 82 -strip assets/img/hero.jpg
magick assets/img/hero.jpg -resize 1600x -quality 78 assets/img/hero.webp
```

Photographs are black and white, sleeves keep their colour. That contrast is the
whole visual idea, so keep new photographs monochrome.

## Conventions

- Copy in English. No em or en dashes: use commas, periods, colons.
- Video embeds are click-to-load. Nothing is requested from YouTube until a
  visitor presses play, and the embeds use `youtube-nocookie.com`.
