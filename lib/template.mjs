import { inline, escapeHtml } from './markdown.mjs';
import { youtubeId } from './youtube.mjs';
import { coverSlug } from './images.mjs';

// The page, rendered from the content files. This is a transcription of the
// index.html it replaces, with the copy pulled out. Everything that is not
// copy stays hard coded: Adam edits words, not markup.
//
// The bands in memberOf, the sameAs links, knowsAbout and the address are hand
// maintained on purpose. They are the same five bands the bio names, and eight
// more CMS fields is eight more things to get wrong in structured data nobody
// proofreads. The hero and portrait pictures are hard coded for the same
// reason: the photographs are not Adam's to swap.

// JSON.stringify escapes quotes and backslashes but not <, and this block is a
// script element: a </script> typed into a CMS text field would close it and
// the rest of the page would arrive as script. \u003c is the same character to
// every JSON reader, and to Google.
const json = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

const record = (r) => {
  const slug = coverSlug(r.cover);
  const alt = escapeHtml(`${r.band}, ${r.title}, ${r.label} ${r.year}`);
  return `          <li class="record">
            <a class="record__link" href="${escapeHtml(r.link)}" rel="noopener">
              <picture>
                <source type="image/webp" sizes="(max-width: 700px) 45vw, 23vw"
                        srcset="assets/img/covers/${slug}-300.webp 300w, assets/img/covers/${slug}-600.webp 600w" />
                <img src="assets/img/covers/${slug}-600.jpg"
                     srcset="assets/img/covers/${slug}-300.jpg 300w, assets/img/covers/${slug}-600.jpg 600w"
                     sizes="(max-width: 700px) 45vw, 23vw"
                     alt="${alt}" width="600" height="600"
                     loading="lazy" decoding="async" />
              </picture>
              <h2 class="record__title">${escapeHtml(r.title)}</h2>
              <p class="record__meta">${escapeHtml(r.band)}<br />${escapeHtml(r.label)}, ${escapeHtml(r.year)}</p>
            </a>
          </li>`;
};

const film = (v) => `          <li class="film">
            <iframe
              src="https://www.youtube-nocookie.com/embed/${youtubeId(v.url)}?rel=0"
              title="${escapeHtml(v.title)}"
              loading="lazy"
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowfullscreen
            ></iframe>
          </li>`;

// The first paragraph is the lede. The rest are bare: four type sizes, and a
// paragraph does not need a class to say it is a paragraph.
const paragraph = (text, i) => `          <p${i === 0 ? ' class="lede"' : ''}>
            ${inline(text)}
          </p>`;

export function render({ site, records, videos }) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Adam Sass</title>

    <meta
      name="description"
      content="${escapeHtml(site.description)}"
    />
    <link rel="canonical" href="https://adamsass.se/" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Adam Sass" />
    <meta property="og:title" content="Adam Sass" />
    <meta
      property="og:description"
      content="${escapeHtml(site.short_description)}"
    />
    <meta property="og:url" content="https://adamsass.se/" />
    <meta property="og:image" content="https://adamsass.se/assets/img/og.jpg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Adam Sass playing trumpet on stage" />
    <meta property="og:locale" content="en_GB" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Adam Sass" />
    <meta
      name="twitter:description"
      content="${escapeHtml(site.short_description)}"
    />
    <meta name="twitter:image" content="https://adamsass.se/assets/img/og.jpg" />
    <meta name="twitter:image:alt" content="Adam Sass playing trumpet on stage" />

    <meta name="theme-color" content="#ffffff" />
    <link rel="icon" type="image/svg+xml" href="favicon/favicon.svg" />
    <link rel="icon" type="image/png" sizes="96x96" href="favicon/favicon-96x96.png" />
    <link rel="shortcut icon" href="favicon/favicon.ico" />
    <link rel="apple-touch-icon" sizes="180x180" href="favicon/apple-touch-icon.png" />
    <link rel="manifest" href="favicon/site.webmanifest" />

    <!-- No webfont on purpose: Helvetica, Arial and Liberation Sans are metric
         siblings and already on the machine. No script either. The only
         third-party requests on the page are the video players. -->
    <link rel="stylesheet" href="assets/style.css" />

    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Adam Sass",
        "url": "https://adamsass.se/",
        "image": "https://adamsass.se/assets/img/og.jpg",
        "jobTitle": "Musician and composer",
        "description": ${json(site.short_description)},
        "email": ${json(`mailto:${site.email}`)},
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Malmö",
          "addressCountry": "SE"
        },
        "knowsAbout": ["Jazz", "Improvised music", "Composition", "Trumpet"],
        "memberOf": [
          { "@type": "MusicGroup", "name": "People In Orbit", "url": "https://peopleinorbit.se/" },
          { "@type": "MusicGroup", "name": "floats", "url": "https://floatsmusik.bandcamp.com/" },
          { "@type": "MusicGroup", "name": "BEQ", "url": "https://linktr.ee/beq.band" },
          { "@type": "MusicGroup", "name": "Vidar Orchestra" },
          { "@type": "MusicGroup", "name": "Spontaneity Quartet" }
        ],
        "sameAs": [
          "https://peopleinorbit.se/",
          "https://peopleinorbit.bandcamp.com/",
          "https://floatsmusik.bandcamp.com/"
        ]
      }
    </script>
  </head>

  <body>
    <header class="hero grid" id="top">
      <h1 class="hero__name">Adam Sass</h1>
      <p class="hero__contact">
        <a href="mailto:${escapeHtml(site.email)}">${escapeHtml(site.email)}</a><br />
        <a
          href="${escapeHtml(site.cv_url)}"
          rel="noopener"
          >CV</a
        ><br />
        ${escapeHtml(site.city)}
      </p>
    </header>

    <!-- Photo: Mattias Foto. Credit kept here at Jonas's request rather than
         printed on the page. -->
    <figure class="plate">
      <picture>
        <source type="image/webp" sizes="100vw"
                srcset="assets/img/hero-800.webp 800w, assets/img/hero.webp 1600w" />
        <img src="assets/img/hero-1600.jpg"
             srcset="assets/img/hero-800.jpg 800w, assets/img/hero-1600.jpg 1600w"
             sizes="100vw"
             alt="Adam Sass playing trumpet on stage" width="1600" height="1067"
             fetchpriority="high" decoding="async" />
      </picture>
    </figure>

    <main>
      <section class="section grid" id="biography">
        <!-- Photo: Maja Gallstad. -->
        <figure class="bio__portrait">
          <picture>
            <source type="image/webp" sizes="(max-width: 700px) 240px, 30vw"
                    srcset="assets/img/portrait-400.webp 400w, assets/img/portrait-800.webp 800w" />
            <img src="assets/img/portrait-800.jpg"
                 srcset="assets/img/portrait-400.jpg 400w, assets/img/portrait-800.jpg 800w"
                 sizes="(max-width: 700px) 240px, 30vw"
                 alt="Portrait of Adam Sass" width="800" height="1200"
                 loading="lazy" decoding="async" />
          </picture>
        </figure>

        <div class="bio__text">
${site.bio.map(paragraph).join('\n')}

          <blockquote class="quote">
            <p>${inline(site.quote.text)}</p>
            <cite>${inline(site.quote.source)}</cite>
          </blockquote>
        </div>
      </section>

      <section class="section grid" id="records">
        <ul class="records">
${records.map(record).join('\n')}
        </ul>
      </section>

      <section class="section grid" id="video">
        <ul class="films">
${videos.map(film).join('\n')}
        </ul>
      </section>

    </main>

  </body>
</html>
`;
}
