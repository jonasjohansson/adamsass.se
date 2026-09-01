import { readdir, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import sharp from 'sharp';

const COVERS_SRC = 'assets/img/covers/src';
const COVERS_OUT = '_site/assets/img/covers';
const WIDTHS = [300, 600];
const MANIFEST = '.manifest.json';

// Adam uploads whatever his desktop calls the file. "Roadwork Ahead (final).jpg"
// has to become the same `roadwork-ahead-final-300.webp` on every machine, so
// the name is folded to ASCII, lowercased, and cut down to letters and digits.
export function coverSlug(file) {
  return path
    .basename(String(file), path.extname(String(file)))
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function listCovers(dir = COVERS_SRC) {
  try {
    const files = await readdir(dir);
    return new Set(files.filter((f) => /\.(jpe?g|png)$/i.test(f)).map((f) => `${dir}/${f}`));
  } catch {
    return new Set();
  }
}

// What has to be rebuilt is decided by a hash of the source bytes, kept in a
// small file committed beside the derivatives. Not by mtimes: a checkout writes
// the whole tree at once in path order, so on the Action
// covers/src/viewpoint.jpg is written before covers/viewpoint-600.jpg and the
// derivative always looks newer than the source it was made from. Adam's new
// sleeve would be skipped for ever, and the build would report success.
//
// Rebuilding everything every time is not the answer either: libvips encodes
// differently on macOS and on Linux, so the committed binaries would flip back
// and forth between Jonas's laptop and the Action on every content change.
async function readManifest(file) {
  try {
    const parsed = JSON.parse(await readFile(file, 'utf8'));
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    // Missing, truncated, or hand edited into nonsense. Every cover then looks
    // changed and is rebuilt, which costs seconds. Throwing would cost the site.
    return {};
  }
}

const hashOf = async (file) => createHash('sha256').update(await readFile(file)).digest('hex');

const onDisk = async (file) => {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
};

// One upload in, four files out. Adam should never have to think about this.
export async function buildCovers(records, { out = COVERS_OUT } = {}) {
  await mkdir(out, { recursive: true });
  const manifestFile = `${out}/${MANIFEST}`;
  const previous = await readManifest(manifestFile);
  const current = {};
  const written = [];

  for (const r of records) {
    const slug = coverSlug(r.cover);
    let hash;
    try {
      hash = await hashOf(r.cover);
    } catch (error) {
      throw new Error(`the cover ${r.cover} could not be read: ${error.message}`);
    }
    current[slug] = hash;

    const outputs = WIDTHS.flatMap((w) => [`${out}/${slug}-${w}.jpg`, `${out}/${slug}-${w}.webp`]);
    const unchanged = previous[slug] === hash;
    if (unchanged && (await Promise.all(outputs.map(onDisk))).every(Boolean)) continue;

    for (const width of WIDTHS) {
      const jpg = `${out}/${slug}-${width}.jpg`;
      const webp = `${out}/${slug}-${width}.webp`;
      try {
        await sharp(r.cover)
          .resize(width, width, { fit: 'cover' })
          .jpeg({ quality: 82, mozjpeg: true })
          .toFile(jpg);
        await sharp(r.cover)
          .resize(width, width, { fit: 'cover' })
          .webp({ quality: 80 })
          .toFile(webp);
      } catch (error) {
        throw new Error(`the cover ${r.cover} could not be opened as an image: ${error.message}`);
      }
      written.push(jpg, webp);
    }
  }

  // Written last, and only once every derivative is on disk: a manifest saved
  // past a failure would claim covers that were never made.
  await writeFile(manifestFile, `${JSON.stringify(current, null, 2)}\n`);
  return written;
}
