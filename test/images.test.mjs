import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, utimes, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { coverSlug, listCovers, buildCovers } from '../lib/images.mjs';

test('takes the slug from the file name', () => {
  assert.equal(coverSlug('assets/img/covers/src/viewpoint.jpg'), 'viewpoint');
});

test('handles a hyphenated name', () => {
  assert.equal(coverSlug('assets/img/covers/src/close-away.jpg'), 'close-away');
});

test('handles a leading slash from the CMS media picker', () => {
  assert.equal(coverSlug('/assets/img/covers/src/filament.jpg'), 'filament');
});

test('slugifies a name Adam might upload', () => {
  assert.equal(coverSlug('assets/img/covers/src/Roadwork Ahead (final).jpg'), 'roadwork-ahead-final');
});

test('folds accents rather than dropping the word', () => {
  assert.equal(coverSlug('assets/img/covers/src/Malmö Session.JPG'), 'malmo-session');
});

test('an empty path slugifies to an empty string', () => {
  // Not reachable through the build: validate.mjs refuses an empty cover and
  // one that is not on disk. Recorded here so the behaviour is not a surprise.
  assert.equal(coverSlug(''), '');
  // A dotfile has no extension by Node's reckoning, so the whole name is kept.
  assert.equal(coverSlug('.jpg'), 'jpg');
  // A trailing slash leaves the directory as the basename, which is worth
  // knowing: it does not throw, it just names the wrong thing.
  assert.equal(coverSlug('assets/img/covers/src/'), 'src');
});

// Everything below writes to a temp directory. The suite must never touch
// assets/: those derivatives are committed binaries.
const MANIFEST = '.manifest.json';

async function square(file, background = '#808080', size = 900) {
  await sharp({ create: { width: size, height: size, channels: 3, background } })
    .jpeg()
    .toFile(file);
}

async function fixture() {
  const dir = await mkdtemp(path.join(tmpdir(), 'covers-'));
  const out = path.join(dir, 'out');
  const cover = path.join(dir, 'placeholder.jpg');
  await square(cover);
  return { dir, out, cover };
}

test('lists only the source images it can resize', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'covers-'));
  try {
    await writeFile(path.join(dir, 'a.jpg'), '');
    await writeFile(path.join(dir, 'b.PNG'), '');
    await writeFile(path.join(dir, 'c.webp'), '');
    await writeFile(path.join(dir, 'notes.txt'), '');
    assert.deepEqual(
      [...(await listCovers(dir))].sort(),
      [`${dir}/a.jpg`, `${dir}/b.PNG`].sort()
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('listing a directory that is not there is empty, not an error', async () => {
  assert.equal((await listCovers(path.join(tmpdir(), 'no-such-covers-dir'))).size, 0);
});

test('one upload becomes four derivatives, and skips the second time', async () => {
  const { dir, out, cover } = await fixture();
  try {
    const first = await buildCovers([{ cover }], { out });
    assert.deepEqual(first.sort(), [
      `${out}/placeholder-300.jpg`,
      `${out}/placeholder-300.webp`,
      `${out}/placeholder-600.jpg`,
      `${out}/placeholder-600.webp`,
    ]);

    const meta = await sharp(`${out}/placeholder-600.jpg`).metadata();
    assert.equal(meta.width, 600);
    assert.equal(meta.height, 600);

    assert.deepEqual(await buildCovers([{ cover }], { out }), []);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('records the source hash in a manifest beside the derivatives', async () => {
  const { dir, out, cover } = await fixture();
  try {
    await buildCovers([{ cover }], { out });
    const manifest = JSON.parse(await readFile(path.join(out, MANIFEST), 'utf8'));
    assert.deepEqual(Object.keys(manifest), ['placeholder']);
    assert.match(manifest.placeholder, /^[0-9a-f]{64}$/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('regenerates when the source bytes change', async () => {
  const { dir, out, cover } = await fixture();
  try {
    await buildCovers([{ cover }], { out });
    await square(cover, '#101010');

    assert.equal((await buildCovers([{ cover }], { out })).length, 4);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

// The bug this manifest exists for. actions/checkout writes the whole tree in
// one go, in path order, so assets/img/covers/src/viewpoint.jpg lands before
// assets/img/covers/viewpoint-600.jpg and the derivative always looks newer
// than its source. A build that trusted mtimes skipped Adam's new sleeve for
// ever, and reported success.
test('regenerates changed bytes even when every output is newer than the source', async () => {
  const { dir, out, cover } = await fixture();
  try {
    await buildCovers([{ cover }], { out });
    await square(cover, '#101010');

    const old = new Date(Date.now() - 60_000);
    await utimes(cover, old, old);

    assert.equal((await buildCovers([{ cover }], { out })).length, 4);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

// The other half of the same rule. A checkout also touches every source file,
// so a build that trusted mtimes would re-encode all four sleeves on every
// content change, and sharp encodes differently on macOS and on the Action:
// the committed binaries would flip back and forth for ever.
test('a source that is touched but unchanged is left alone', async () => {
  const { dir, out, cover } = await fixture();
  try {
    await buildCovers([{ cover }], { out });

    const later = new Date(Date.now() + 60_000);
    await utimes(cover, later, later);

    assert.deepEqual(await buildCovers([{ cover }], { out }), []);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('regenerates when one derivative has gone missing', async () => {
  const { dir, out, cover } = await fixture();
  try {
    await buildCovers([{ cover }], { out });
    await rm(`${out}/placeholder-300.webp`);

    assert.equal((await buildCovers([{ cover }], { out })).length, 4);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('regenerates when the manifest is missing', async () => {
  const { dir, out, cover } = await fixture();
  try {
    await buildCovers([{ cover }], { out });
    await rm(path.join(out, MANIFEST));

    assert.equal((await buildCovers([{ cover }], { out })).length, 4);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

// Rebuilding four images nobody asked for costs a few seconds. Throwing here
// would take the site off the air over a file nobody reads.
test('regenerates when the manifest is corrupt, rather than throwing', async () => {
  const { dir, out, cover } = await fixture();
  try {
    await buildCovers([{ cover }], { out });
    await writeFile(path.join(out, MANIFEST), '{ not json');

    assert.equal((await buildCovers([{ cover }], { out })).length, 4);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('names the file when a cover cannot be opened as an image', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'covers-'));
  const cover = path.join(dir, 'not-really.jpg');
  try {
    await writeFile(cover, 'this is a text file with a jpg name');
    await assert.rejects(() => buildCovers([{ cover }], { out: path.join(dir, 'out') }), new RegExp(cover));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
