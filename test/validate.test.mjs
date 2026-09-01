import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { validate } from '../lib/validate.mjs';

const site = {
  email: 'info@adamsass.se',
  city: 'Malmö, Sweden',
  cv_url: 'https://example.com/cv.pdf',
  description: 'A description.',
  short_description: 'Short.',
  bio: ['One.', 'Two.'],
  quote: { text: 'Good.', source: 'Jazz Journal' },
};
const records = [{
  title: 'Viewpoint', band: 'People In Orbit', label: 'April Records',
  year: 2026, link: 'https://example.com/', cover: 'assets/img/covers/src/viewpoint.jpg',
}];
const videos = [{ url: 'https://youtu.be/Vxd4atK0Lyk', title: 'A video' }];
const covers = new Set(['assets/img/covers/src/viewpoint.jpg']);

test('accepts good content', () => {
  assert.deepEqual(validate({ site, records, videos, covers }), []);
});

test('reports a missing email', () => {
  const bad = { ...site, email: '' };
  assert.match(validate({ site: bad, records, videos, covers })[0], /email/);
});

test('reports an email with no at sign', () => {
  const bad = { ...site, email: 'info.adamsass.se' };
  assert.match(validate({ site: bad, records, videos, covers })[0], /email/);
});

test('reports an empty bio', () => {
  const bad = { ...site, bio: [] };
  assert.match(validate({ site: bad, records, videos, covers })[0], /bio/);
});

// validate used to check only that a field was not empty, so a bio holding a
// link with no scheme passed here and threw inside render a moment later. Adam
// got a red X on a tab he cannot see. Rendering the markdown here is the whole
// point: whatever throws becomes a sentence naming the field.
test('reports a bio link with no scheme instead of throwing during render', () => {
  const bad = { ...site, bio: ['Read my [CV](docs.google.com/doc/abc).'] };
  const errors = validate({ site: bad, records, videos, covers });
  assert.equal(errors.length, 1, JSON.stringify(errors));
  assert.match(errors[0], /site\.bio\[0\]/);
  assert.match(errors[0], /https:\/\//);
});

test('reports an unrenderable press quote, and names which field', () => {
  const text = { ...site, quote: { ...site.quote, text: '[a](javascript:alert(1))' } };
  assert.match(validate({ site: text, records, videos, covers })[0], /site\.quote\.text/);

  const source = { ...site, quote: { ...site.quote, source: '[a](ftp://x/)' } };
  assert.match(validate({ site: source, records, videos, covers })[0], /site\.quote\.source/);
});

test('reports a record with no title', () => {
  const bad = [{ ...records[0], title: '' }];
  assert.match(validate({ site, records: bad, videos, covers })[0], /title/);
});

test('reports an implausible year', () => {
  const bad = [{ ...records[0], year: 26 }];
  assert.match(validate({ site, records: bad, videos, covers })[0], /year/);
});

test('reports a cover that is not on disk', () => {
  const bad = [{ ...records[0], cover: 'assets/img/covers/src/missing.jpg' }];
  assert.match(validate({ site, records: bad, videos, covers })[0], /cover/);
});

// coverSlug is many to one, and .pages.yml slugifies uploads the same way, so
// close-away.jpg and close_away.jpg are a couple of clicks apart. Both records
// would write the same four derivatives, the second would win, and two sleeves
// on the page would show the same picture with nothing in the build to say so.
test('reports two covers that would make the same image name', () => {
  const bad = [
    { ...records[0], title: 'Close/Away', cover: 'assets/img/covers/src/close-away.jpg' },
    { ...records[0], title: 'Close Away', cover: 'assets/img/covers/src/close_away.jpg' },
  ];
  const both = new Set([
    'assets/img/covers/src/close-away.jpg',
    'assets/img/covers/src/close_away.jpg',
  ]);
  const errors = validate({ site, records: bad, videos, covers: both });
  assert.equal(errors.length, 1, JSON.stringify(errors));
  assert.match(errors[0], /records\[1\]\.cover/);
  assert.match(errors[0], /records\[0\]\.cover/);
  assert.match(errors[0], /rename/i);
});

test('accepts two covers whose names really are different', () => {
  const two = [records[0], { ...records[0], cover: 'assets/img/covers/src/filament.jpg' }];
  const both = new Set([...covers, 'assets/img/covers/src/filament.jpg']);
  assert.deepEqual(validate({ site, records: two, videos, covers: both }), []);
});

test('reports a link that is not https', () => {
  const bad = [{ ...records[0], link: 'ftp://example.com/' }];
  assert.match(validate({ site, records: bad, videos, covers })[0], /link/);
});

test('reports a video that is not YouTube', () => {
  const bad = [{ url: 'https://vimeo.com/1', title: 'A video' }];
  assert.match(validate({ site, records, videos: bad, covers })[0], /video/i);
});

test('reports no records at all', () => {
  assert.match(validate({ site, records: [], videos, covers })[0], /at least one record/);
});

test('collects every problem, not just the first', () => {
  const bad = { ...site, email: '', bio: [] };
  assert.equal(validate({ site: bad, records, videos, covers }).length, 2);
});

// Every rule, one broken field at a time. Without this, "accepts good content"
// could pass because a rule never runs rather than because the content is good:
// a rule that cannot fail is a rule that is not protecting anything.
const mutations = [
  ['site.email', { site: { ...site, email: 'nope' } }],
  ['site.city', { site: { ...site, city: '  ' } }],
  ['site.cv_url', { site: { ...site, cv_url: 'http://example.com/cv.pdf' } }],
  ['site.description', { site: { ...site, description: '' } }],
  ['site.short_description', { site: { ...site, short_description: '' } }],
  ['site.bio', { site: { ...site, bio: ['One.', ''] } }],
  ['site.quote.text', { site: { ...site, quote: { ...site.quote, text: '' } } }],
  ['site.quote.source', { site: { ...site, quote: { ...site.quote, source: '' } } }],
  ['records[0].title', { records: [{ ...records[0], title: '' }] }],
  ['records[0].band', { records: [{ ...records[0], band: '' }] }],
  ['records[0].label', { records: [{ ...records[0], label: '' }] }],
  ['records[0].cover', { records: [{ ...records[0], cover: '' }] }],
  ['records[0].cover on disk', { records: [{ ...records[0], cover: 'assets/img/covers/src/no.jpg' }] }],
  ['records[0].year', { records: [{ ...records[0], year: 26 }] }],
  ['records[0].link', { records: [{ ...records[0], link: 'ftp://example.com/' }] }],
  ['videos[0].title', { videos: [{ ...videos[0], title: '' }] }],
  ['videos[0].url', { videos: [{ ...videos[0], url: 'https://vimeo.com/1' }] }],
];

for (const [name, patch] of mutations) {
  test(`breaking ${name} is reported, and only that`, () => {
    const errors = validate({ site, records, videos, covers, ...patch });
    assert.equal(errors.length, 1, `expected one error, got ${JSON.stringify(errors)}`);
  });
}

// A year is only ever printed, in the record list and in the cover alt text, so
// `year: "2026"` from a CMS that quoted its number renders the same as 2026 and
// must not take the site off the air. Anything that is not a four digit year
// still fails: that would print as nonsense.
test('accepts a year that YAML quoted into a string', () => {
  const quoted = [{ ...records[0], year: '2026' }];
  assert.deepEqual(validate({ site, records: quoted, videos, covers }), []);
});

test('reports a year that is not four digits, quoted or not', () => {
  for (const year of ['26', 'twenty twenty six', '2026-04-01', '', 2026.5, null]) {
    const bad = [{ ...records[0], year }];
    const errors = validate({ site, records: bad, videos, covers });
    assert.equal(errors.length, 1, `${JSON.stringify(year)} should be one error`);
    assert.match(errors[0], /year/);
  }
});

// An empty or half saved YAML file parses to null, and a list with a blank row
// yields a null item. The operator must read a sentence about it, not a stack
// trace, so validate reports and never throws.
test('does not throw on missing or malformed content', () => {
  const shapes = [
    {},
    { site: null, records: null, videos: null, covers: null },
    { site: undefined, records: undefined, videos: undefined, covers: undefined },
    { site, records: [null], videos: [null], covers },
    { site: 'not an object', records: 'nope', videos: 42, covers },
    { site: { ...site, quote: null, bio: 'a string' }, records, videos, covers },
    { site, records, videos },
  ];
  for (const shape of shapes) {
    const errors = validate(shape);
    assert.ok(Array.isArray(errors), 'validate must return a list');
    assert.ok(errors.length > 0, `expected problems for ${JSON.stringify(shape)}`);
    assert.ok(errors.every((e) => typeof e === 'string'));
  }
});

test('does not throw when called with nothing at all', () => {
  assert.ok(validate().length > 0);
});

// The real content is the case that matters: if this fails, the build fails.
const root = new URL('../', import.meta.url);
const content = (name) => parse(readFileSync(new URL(`content/${name}`, root), 'utf8'));

// The originals move to assets/img/covers/src/ in a later task. Until then they
// sit one directory up beside their generated -300 and -600 derivatives. Read
// whichever directory exists and name the files the way records.yml does, so
// this checks the cover names agree with the disk either side of the move.
function coversOnDisk() {
  const src = new URL('assets/img/covers/src/', root);
  const dir = existsSync(src) ? src : new URL('assets/img/covers/', root);
  const names = readdirSync(dir).filter((n) => n.endsWith('.jpg') && !/-\d+\.jpg$/.test(n));
  return new Set(names.map((n) => `assets/img/covers/src/${n}`));
}

test('the real content validates', () => {
  const onDisk = coversOnDisk();
  assert.ok(onDisk.size > 0, 'found no cover files, so this test would prove nothing');
  const errors = validate({
    site: content('site.yml'),
    records: content('records.yml').records,
    videos: content('videos.yml').videos,
    covers: onDisk,
  });
  assert.deepEqual(errors, []);
});
