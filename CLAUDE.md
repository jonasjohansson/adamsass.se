# adamsass.se

Personal site for Adam Sass, musician in Malmo, working in modern jazz and
improvisation. He plays in People in Orbit (peopleinorbit.se, also built here)
and is a co-applicant on the Signs of Presence tour.

Vanilla HTML, CSS and JS. No build step, no framework, no CMS. The repo root is
the site: pushing to `main` uploads it straight to GitHub Pages.

## Files
- `index.html` — the page, and all copy
- `assets/style.css` — all styles. Variables at the top, breakpoints at 1100px and 720px
- `assets/script.js` — nav state, scroll reveal, click-to-load embeds
- `assets/img/`, `favicon/`, `CNAME`, `.github/workflows/deploy.yml`

## Design system
- Paper `#f2eee5`, ink `#17140f`, one accent: rust `#a8452b`. Do not add a second accent.
- Display type is Instrument Serif, body is Inter. Headings, the lede and the
  contact address are serif; everything structural is uppercase Inter at 0.75rem
  with wide letter-spacing.
- Editorial and quiet on purpose. It sits next to peopleinorbit.se, which is dark
  and image-heavy, so this one stays light and typographic.

## Conventions
- Copy in English. No em or en dashes: use commas, periods, colons.
- Everything still unwritten is marked `TODO` in the source. Do not silently
  invent biography, dates or credits for a real person: leave the TODO standing
  and ask.
- Embeds are click-to-load. Nothing is requested from Bandcamp, Spotify or
  YouTube until a visitor clicks. Keep it that way.

## Local preview
`python3 -m http.server 3000`, then http://localhost:3000/.
