import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, stat, utimes, writeFile } from 'node:fs/promises';
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
async function fixture() {
  const dir = await mkdtemp(path.join(tmpdir(), 'covers-'));
  const src = path.join(dir, 'src');
  const out = path.join(dir, 'out');
  await sharp({
    create: { width: 900, height: 900, channels: 3, background: '#808080' },
  })
    .jpeg()
    .toFile(path.join(dir, 'placeholder.jpg'));
  return { dir, src, out };
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
  const { dir, out } = await fixture();
  const cover = path.join(dir, 'placeholder.jpg');
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

test('regenerates when the source is genuinely newer', async () => {
  const { dir, out } = await fixture();
  const cover = path.join(dir, 'placeholder.jpg');
  try {
    await buildCovers([{ cover }], { out });
    const before = (await stat(`${out}/placeholder-600.jpg`)).mtimeMs;

    const later = new Date(Date.now() + 60_000);
    await utimes(cover, later, later);

    assert.equal((await buildCovers([{ cover }], { out })).length, 4);
    assert.ok((await stat(`${out}/placeholder-600.jpg`)).mtimeMs > before);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
