import sharp from 'sharp';
import { youtubeId } from './youtube.mjs';
import { coverSlug } from './images.mjs';
import { inline } from './markdown.mjs';

const filled = (v) => typeof v === 'string' && v.trim() !== '';

// Not empty is not the same as renderable. `[CV](docs.google.com/doc/abc)`, a
// bare domain pasted out of the address bar, is a link markdown refuses, and
// refusing it during render meant a stack trace on an Actions tab Adam cannot
// read. So every markdown field is rendered here, where a throw becomes a
// sentence naming the field. The rendering itself is thrown away.
const renders = (value, field, errors) => {
  if (!filled(value)) return;
  try {
    inline(value);
  } catch (error) {
    errors.push(`${field} cannot be rendered: ${error.message}`);
  }
};

// A record's year is only ever printed: in the record list, and in the alt text
// of its sleeve. So `year: "2026"`, from a CMS or an editor that quoted the
// number, is accepted, because it renders exactly as 2026 does and failing the
// build over a pair of quotes would take the site off the air for nothing.
// Anything that is not a four digit year is still refused: it would print.
const isYear = (value) => {
  const year = typeof value === 'string' && /^\d{4}$/.test(value.trim()) ? Number(value) : value;
  return Number.isInteger(year) && year >= 1900 && year <= 2100;
};

const MIN_COVER = 600;

// The extension was the only thing checked, so a screenshot renamed .jpg got as
// far as sharp, and a 300 pixel thumbnail was quietly upscaled into a blurry
// sleeve. Both are one drag and drop away in the CMS, and .pages.yml promises
// Adam "at least 600 by 600" without anything enforcing it. Opening the file is
// the only way to know either. The size he can read off Finder goes in the
// message, so he can tell which of his files is the wrong one.
async function coverProblem(file) {
  let size;
  try {
    size = await sharp(file).metadata();
  } catch {
    size = {};
  }
  if (!size.width || !size.height) {
    return 'is not an image the site can open. Save it as a JPG or a PNG and upload it again';
  }
  if (size.width < MIN_COVER || size.height < MIN_COVER) {
    return `is ${size.width} by ${size.height} pixels, and a sleeve needs at least ${MIN_COVER} by ${MIN_COVER}. Upload a larger version`;
  }
  return null;
}

// Never throws. An empty or half saved YAML file parses to null and a blank row
// in a list becomes a null item, so every shape here is one a bad save can
// actually produce. Whoever is reading the failed Action needs a sentence
// naming the field, not a stack trace from the first property access.
//
// Async only because the covers have to be opened to be measured. Every other
// rule here is a comparison.
export async function validate({ site, records, videos, covers } = {}) {
  const errors = [];
  const s = site && typeof site === 'object' ? site : {};
  const onDisk = covers instanceof Set ? covers : new Set();

  if (!filled(s.email) || !s.email.includes('@')) {
    errors.push('site.email must be an email address');
  }
  if (!filled(s.city)) errors.push('site.city must not be empty');
  if (!/^https:\/\//.test(s.cv_url || '')) errors.push('site.cv_url must be an https URL');
  if (!filled(s.description)) errors.push('site.description must not be empty');
  if (!filled(s.short_description)) errors.push('site.short_description must not be empty');
  if (!Array.isArray(s.bio) || s.bio.length === 0 || !s.bio.every(filled)) {
    errors.push('site.bio must be a list of at least one paragraph');
  }
  if (!filled(s.quote?.text)) errors.push('site.quote.text must not be empty');
  if (!filled(s.quote?.source)) errors.push('site.quote.source must not be empty');

  if (Array.isArray(s.bio)) s.bio.forEach((p, i) => renders(p, `site.bio[${i}]`, errors));
  renders(s.quote?.text, 'site.quote.text', errors);
  renders(s.quote?.source, 'site.quote.source', errors);

  if (!Array.isArray(records) || records.length === 0) {
    errors.push('there must be at least one record');
  } else {
    const measure = [];

    // coverSlug is many to one: close-away.jpg and close_away.jpg both become
    // close-away, and the CMS slugifies uploads the same way, so two records
    // one rename apart would write the same four derivatives. The second wins
    // and both sleeves show the same picture, with nothing in the build to say
    // so. Cheaper to refuse the save than to explain the symptom later.
    const slugs = new Map();

    records.forEach((record, i) => {
      const r = record && typeof record === 'object' ? record : {};
      const at = `records[${i}]`;
      for (const field of ['title', 'band', 'label', 'cover']) {
        if (!filled(r[field])) errors.push(`${at}.${field} must not be empty`);
      }
      if (!isYear(r.year)) errors.push(`${at}.year must be a four digit year`);
      if (!/^https:\/\//.test(r.link || '')) errors.push(`${at}.link must be an https URL`);
      if (filled(r.cover)) {
        if (!onDisk.has(r.cover)) errors.push(`${at}.cover is not on disk: ${r.cover}`);
        else measure.push([at, r.cover]);

        const slug = coverSlug(r.cover);
        const first = slugs.get(slug);
        if (first === undefined) slugs.set(slug, i);
        else {
          errors.push(
            `${at}.cover and records[${first}].cover both become the same image name, ` +
              `${slug}: rename one of the two files so the names differ by more than punctuation`
          );
        }
      }
    });

    for (const [at, file] of measure) {
      const problem = await coverProblem(file);
      if (problem) errors.push(`${at}.cover ${problem}`);
    }
  }

  if (!Array.isArray(videos) || videos.length === 0) {
    errors.push('there must be at least one video');
  } else {
    videos.forEach((video, i) => {
      const v = video && typeof video === 'object' ? video : {};
      if (!filled(v.title)) errors.push(`videos[${i}].title must not be empty`);
      try {
        youtubeId(v.url);
      } catch {
        errors.push(`videos[${i}].url is not a YouTube URL: ${v.url}`);
      }
    });
  }

  return errors;
}
