import { cp, mkdir } from 'node:fs/promises';
import path from 'node:path';

// Everything the page needs that the build does not generate. The cover
// originals are deliberately absent: they are the CMS's working copies, some of
// them several megabytes, and nothing on the page ever links to one.
//
// The generated covers are absent for the opposite reason. They are written
// straight into the output by buildCovers, and the Action restores them there
// from cache before the build runs, so copying over them would undo that.
const COPY = [
  'assets/style.css',
  'assets/img/hero-800.jpg',
  'assets/img/hero-1600.jpg',
  'assets/img/hero-800.webp',
  'assets/img/hero.webp',
  'assets/img/og.jpg',
  'assets/img/portrait-400.jpg',
  'assets/img/portrait-800.jpg',
  'assets/img/portrait-400.webp',
  'assets/img/portrait-800.webp',
  'favicon',
  'CNAME',
  'robots.txt',
  'sitemap.xml',
];

export async function copyStatic(out) {
  for (const entry of COPY) {
    const target = `${out}/${entry}`;
    await mkdir(path.dirname(target), { recursive: true });
    await cp(entry, target, { recursive: true });
  }
  return COPY.length;
}
