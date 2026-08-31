# adamsass.se

Personal site for **Adam Sass**, musician in Malmo. Vanilla HTML, CSS and JS.
No build step, no framework, no CMS.

Deploys to https://adamsass.se/ via GitHub Pages on push to `main`.

## Local preview

```sh
python3 -m http.server 3000
# or
npx serve -l 3000
```

Then open http://localhost:3000/.

## Files

| Path | What it is |
|---|---|
| `index.html` | The whole page. All copy lives here. |
| `assets/style.css` | All styles. CSS variables at the top, breakpoints at 1100px and 720px. |
| `assets/script.js` | Nav state, scroll reveal, click-to-load embeds. |
| `assets/img/` | Portrait and the Open Graph image. |
| `favicon/` | Icons. Only `favicon.svg` exists so far. |
| `CNAME` | Custom domain for GitHub Pages. |
| `.github/workflows/deploy.yml` | Uploads the repo root to Pages on push to `main`. |

## Before this goes live

Search the source for `TODO`. Every placeholder is marked. In short:

1. **Copy** — hero line, bio, the facts list, section intros. All currently stand-ins.
2. **Portrait** — replace `assets/img/portrait-placeholder.svg` with a real photo
   (export around 1200px wide as JPEG plus WebP) and update the `<img>` and its credit.
3. **Open Graph image** — add `assets/img/og.jpg` at 1200x630. The meta tags already point at it.
4. **Embeds** — set `data-embed` on each `.embed__facade` button to the provider's
   embed URL. Until then a click logs a warning and does nothing.
5. **Links** — real Instagram, Bandcamp, Spotify and YouTube URLs, or delete the rows.
6. **Email** — confirm which address Adam wants public.
7. **Favicons** — generate the raster set and uncomment the block in `<head>`.
8. **Works** — confirm Adam's role in People in Orbit, and check before publishing
   anything about Signs of Presence while the applications are still open.

## Conventions

- Copy in English. No em or en dashes: use commas, periods, colons.
- Swedish place names are written without diacritics in meta tags so link
  previews stay clean, but use proper spelling in visible copy if preferred.
