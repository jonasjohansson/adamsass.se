import { youtubeId } from './youtube.mjs';
import { coverSlug } from './images.mjs';

const filled = (v) => typeof v === 'string' && v.trim() !== '';

// A record's year is only ever printed: in the record list, and in the alt text
// of its sleeve. So `year: "2026"`, from a CMS or an editor that quoted the
// number, is accepted, because it renders exactly as 2026 does and failing the
// build over a pair of quotes would take the site off the air for nothing.
// Anything that is not a four digit year is still refused: it would print.
const isYear = (value) => {
  const year = typeof value === 'string' && /^\d{4}$/.test(value.trim()) ? Number(value) : value;
  return Number.isInteger(year) && year >= 1900 && year <= 2100;
};

// Never throws. An empty or half saved YAML file parses to null and a blank row
// in a list becomes a null item, so every shape here is one a bad save can
// actually produce. Whoever is reading the failed Action needs a sentence
// naming the field, not a stack trace from the first property access.
export function validate({ site, records, videos, covers } = {}) {
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

  if (!Array.isArray(records) || records.length === 0) {
    errors.push('there must be at least one record');
  } else {
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
      if (filled(r.cover) && !onDisk.has(r.cover)) {
        errors.push(`${at}.cover is not on disk: ${r.cover}`);
      }
      if (filled(r.cover)) {
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
