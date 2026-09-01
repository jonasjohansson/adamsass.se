import { readFile, writeFile } from 'node:fs/promises';
import { parse } from 'yaml';
import { render } from './lib/template.mjs';
import { validate } from './lib/validate.mjs';
import { listCovers, buildCovers } from './lib/images.mjs';

const read = async (name) => parse(await readFile(`content/${name}.yml`, 'utf8'));

const site = await read('site');
const { records } = await read('records');
const { videos } = await read('videos');
const covers = await listCovers();

// Adam saves straight to main, so a bad save would be live in under a minute.
// Refusing to build is what keeps the previous good page serving.
const errors = validate({ site, records, videos, covers });
if (errors.length) {
  console.error('Content is not valid, refusing to build:\n');
  for (const e of errors) console.error(`  - ${e}`);
  console.error('\nThe previous index.html is unchanged and still serving.');
  process.exit(1);
}

for (const file of await buildCovers(records)) console.log(`image  ${file}`);

await writeFile('index.html', render({ site, records, videos }));
console.log('page   index.html');
