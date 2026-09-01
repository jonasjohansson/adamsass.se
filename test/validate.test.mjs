import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { parse } from 'yaml';
import { validate } from '../lib/validate.mjs';

// validate opens every cover it is told is on disk, so the covers here are real
// files in a temp directory. The suite must never write into assets/: those
// derivatives are committed binaries.
const tmp = await mkdtemp(path.join(tmpdir(), 'validate-'));
after(() => rm(tmp, { recursive: true, force: true }));

async function square(name, size = 900) {
  const file = path.join(tmp, name);
  await sharp({ create: { width: size, height: size, channels: 3, background: '#808080' } })
    .jpeg()
    .toFile(file);
  return file;
}

const cover = await square('viewpoint.jpg');

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
  year: 2026, link: 'https://example.com/', cover,
}];
const videos = [{ url: 'https://youtu.be/Vxd4atK0Lyk', title: 'A video' }];
const covers = new Set([cover]);

test('accepts good content', async () => {
  assert.deepEqual(await validate({ site, records, videos, covers }), []);
});

test('reports a missing email', async () => {
  const bad = { ...site, email: '' };
  assert.match((await validate({ site: bad, records, videos, covers }))[0], /email/);
});

test('reports an email with no at sign', async () => {
  const bad = { ...site, email: 'info.adamsass.se' };
  assert.match((await validate({ site: bad, records, videos, covers }))[0], /email/);
});

test('reports an empty bio', async () => {
  const bad = { ...site, bio: [] };
  assert.match((await validate({ site: bad, records, videos, covers }))[0], /bio/);
});

// validate used to check only that a field was not empty, so a bio holding a
// link with no scheme passed here and threw inside render a moment later. Adam
// got a red X on a tab he cannot see. Rendering the markdown here is the whole
// point: whatever throws becomes a sentence naming the field.
test('reports a bio link with no scheme instead of throwing during render', async () => {
  const bad = { ...site, bio: ['Read my [CV](docs.google.com/doc/abc).'] };
  const errors = await validate({ site: bad, records, videos, covers });
  assert.equal(errors.length, 1, JSON.stringify(errors));
  assert.match(errors[0], /site\.bio\[0\]/);
  assert.match(errors[0], /https:\/\//);
});

test('reports an unrenderable press quote, and names which field', async () => {
  const text = { ...site, quote: { ...site.quote, text: '[a](javascript:alert(1))' } };
  assert.match((await validate({ site: text, records, videos, covers }))[0], /site\.quote\.text/);

  const source = { ...site, quote: { ...site.quote, source: '[a](ftp://x/)' } };
  assert.match((await validate({ site: source, records, videos, covers }))[0], /site\.quote\.source/);
});

test('reports a record with no title', async () => {
  const bad = [{ ...records[0], title: '' }];
  assert.match((await validate({ site, records: bad, videos, covers }))[0], /title/);
});

test('reports an implausible year', async () => {
  const bad = [{ ...records[0], year: 26 }];
  assert.match((await validate({ site, records: bad, videos, covers }))[0], /year/);
});

test('reports a cover that is not on disk', async () => {
  const bad = [{ ...records[0], cover: path.join(tmp, 'missing.jpg') }];
  assert.match((await validate({ site, records: bad, videos, covers }))[0], /cover/);
});

// coverSlug is many to one, and .pages.yml slugifies uploads the same way, so
// close-away.jpg and close_away.jpg are a couple of clicks apart. Both records
// would write the same four derivatives, the second would win, and two sleeves
// on the page would show the same picture with nothing in the build to say so.
test('reports two covers that would make the same image name', async () => {
  const hyphen = await square('close-away.jpg');
  const underscore = await square('close_away.jpg');
  const bad = [
    { ...records[0], title: 'Close/Away', cover: hyphen },
    { ...records[0], title: 'Close Away', cover: underscore },
  ];
  const both = new Set([hyphen, underscore]);
  const errors = await validate({ site, records: bad, videos, covers: both });
  assert.equal(errors.length, 1, JSON.stringify(errors));
  assert.match(errors[0], /records\[1\]\.cover/);
  assert.match(errors[0], /records\[0\]\.cover/);
  assert.match(errors[0], /rename/i);
});

test('accepts two covers whose names really are different', async () => {
  const filament = await square('filament.jpg');
  const two = [records[0], { ...records[0], cover: filament }];
  const both = new Set([...covers, filament]);
  assert.deepEqual(await validate({ site, records: two, videos, covers: both }), []);
});

// .pages.yml tells Adam "at least 600 by 600" and nothing enforced it, so a
// thumbnail was upscaled into a blurry sleeve and shipped. The size he can see
// in Finder has to be in the message, or he cannot tell what went wrong.
test('reports a cover that is too small for a sleeve', async () => {
  const small = await square('small.jpg', 300);
  const bad = [{ ...records[0], cover: small }];
  const errors = await validate({ site, records: bad, videos, covers: new Set([small]) });
  assert.equal(errors.length, 1, JSON.stringify(errors));
  assert.match(errors[0], /records\[0\]\.cover/);
  assert.match(errors[0], /300 by 300/);
  assert.match(errors[0], /600/);
});

test('accepts a cover that is exactly the minimum', async () => {
  const exact = await square('exact.jpg', 600);
  const ok = [{ ...records[0], cover: exact }];
  assert.deepEqual(await validate({ site, records: ok, videos, covers: new Set([exact]) }), []);
});

// A file named .jpg is not an image. Downloading a sleeve from a web page often
// saves the HTML page around it, and the extension survives the trip.
test('reports a cover that is not an image at all', async () => {
  const fake = path.join(tmp, 'not-really.jpg');
  await writeFile(fake, '<html>this is a web page, not a sleeve</html>');
  const bad = [{ ...records[0], cover: fake }];
  const errors = await validate({ site, records: bad, videos, covers: new Set([fake]) });
  assert.equal(errors.length, 1, JSON.stringify(errors));
  assert.match(errors[0], /records\[0\]\.cover/);
  assert.match(errors[0], /JPG|PNG/);
});

test('reports a link that is not https', async () => {
  const bad = [{ ...records[0], link: 'ftp://example.com/' }];
  assert.match((await validate({ site, records: bad, videos, covers }))[0], /link/);
});

test('reports a video that is not YouTube', async () => {
  const bad = [{ url: 'https://vimeo.com/1', title: 'A video' }];
  assert.match((await validate({ site, records, videos: bad, covers }))[0], /video/i);
});

test('reports no records at all', async () => {
  assert.match((await validate({ site, records: [], videos, covers }))[0], /at least one record/);
});

test('collects every problem, not just the first', async () => {
  const bad = { ...site, email: '', bio: [] };
  assert.equal((await validate({ site: bad, records, videos, covers })).length, 2);
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
  ['records[0].cover on disk', { records: [{ ...records[0], cover: path.join(tmp, 'no.jpg') }] }],
  ['records[0].year', { records: [{ ...records[0], year: 26 }] }],
  ['records[0].link', { records: [{ ...records[0], link: 'ftp://example.com/' }] }],
  ['videos[0].title', { videos: [{ ...videos[0], title: '' }] }],
  ['videos[0].url', { videos: [{ ...videos[0], url: 'https://vimeo.com/1' }] }],
];

for (const [name, patch] of mutations) {
  test(`breaking ${name} is reported, and only that`, async () => {
    const errors = await validate({ site, records, videos, covers, ...patch });
    assert.equal(errors.length, 1, `expected one error, got ${JSON.stringify(errors)}`);
  });
}

// A year is only ever printed, in the record list and in the cover alt text, so
// `year: "2026"` from a CMS that quoted its number renders the same as 2026 and
// must not take the site off the air. Anything that is not a four digit year
// still fails: that would print as nonsense.
test('accepts a year that YAML quoted into a string', async () => {
  const quoted = [{ ...records[0], year: '2026' }];
  assert.deepEqual(await validate({ site, records: quoted, videos, covers }), []);
});

test('reports a year that is not four digits, quoted or not', async () => {
  for (const year of ['26', 'twenty twenty six', '2026-04-01', '', 2026.5, null]) {
    const bad = [{ ...records[0], year }];
    const errors = await validate({ site, records: bad, videos, covers });
    assert.equal(errors.length, 1, `${JSON.stringify(year)} should be one error`);
    assert.match(errors[0], /year/);
  }
});

// An empty or half saved YAML file parses to null, and a list with a blank row
// yields a null item. The operator must read a sentence about it, not a stack
// trace, so validate reports and never throws.
test('does not throw on missing or malformed content', async () => {
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
    const errors = await validate(shape);
    assert.ok(Array.isArray(errors), 'validate must return a list');
    assert.ok(errors.length > 0, `expected problems for ${JSON.stringify(shape)}`);
    assert.ok(errors.every((e) => typeof e === 'string'));
  }
});

test('does not throw when called with nothing at all', async () => {
  assert.ok((await validate()).length > 0);
});

// The real content is the case that matters: if this fails, the build fails.
const root = new URL('../', import.meta.url);
const content = (name) => parse(readFileSync(new URL(`content/${name}`, root), 'utf8'));

// The originals as records.yml names them. Reading the directory rather than
// trusting the file is the point: this is what proves the covers Adam wrote
// down are the covers on disk, at the size the sleeves need.
function coversOnDisk() {
  const dir = new URL('assets/img/covers/src/', root);
  return new Set(readdirSync(dir).map((n) => `assets/img/covers/src/${n}`));
}

test('the real content validates', async () => {
  const onDisk = coversOnDisk();
  assert.ok(onDisk.size > 0, 'found no cover files, so this test would prove nothing');
  const errors = await validate({
    site: content('site.yml'),
    records: content('records.yml').records,
    videos: content('videos.yml').videos,
    covers: onDisk,
  });
  assert.deepEqual(errors, []);
});
