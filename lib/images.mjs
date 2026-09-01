import { readdir, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

export const COVERS_SRC = 'assets/img/covers/src';
export const COVERS_OUT = 'assets/img/covers';
const WIDTHS = [300, 600];

// Adam uploads whatever his desktop calls the file. "Roadwork Ahead (final).jpg"
// has to become the same `roadwork-ahead-final-300.webp` on every machine, so
// the name is folded to ASCII, lowercased, and cut down to letters and digits.
export function coverSlug(file) {
  return path
    .basename(String(file), path.extname(String(file)))
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
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

async function isCurrent(out, srcMtime) {
  try {
    return (await stat(out)).mtimeMs >= srcMtime;
  } catch {
    return false;
  }
}

// One upload in, four files out. Adam should never have to think about this.
export async function buildCovers(records, { out = COVERS_OUT } = {}) {
  await mkdir(out, { recursive: true });
  const written = [];

  for (const r of records) {
    const slug = coverSlug(r.cover);
    const srcMtime = (await stat(r.cover)).mtimeMs;

    for (const width of WIDTHS) {
      const jpg = `${out}/${slug}-${width}.jpg`;
      const webp = `${out}/${slug}-${width}.webp`;

      if (!(await isCurrent(jpg, srcMtime))) {
        await sharp(r.cover)
          .resize(width, width, { fit: 'cover' })
          .jpeg({ quality: 82, mozjpeg: true })
          .toFile(jpg);
        written.push(jpg);
      }
      if (!(await isCurrent(webp, srcMtime))) {
        await sharp(r.cover)
          .resize(width, width, { fit: 'cover' })
          .webp({ quality: 80 })
          .toFile(webp);
        written.push(webp);
      }
    }
  }
  return written;
}
