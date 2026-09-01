import { readFile, writeFile } from 'node:fs/promises';
import { parse } from 'yaml';
import { render } from './lib/template.mjs';
import { validate } from './lib/validate.mjs';
import { listCovers, buildCovers } from './lib/images.mjs';

// Adam saves straight to main, from a CMS, with no GitHub account and no way to
// open the Actions tab. Every way this build can fail has to end as one
// sentence naming the file and saying what to do, never a stack trace.
function fail(problem) {
  console.error(`Cannot build the site: ${problem}`);
  console.error('\nThe previous index.html is unchanged and still serving.');
  process.exit(1);
}

const read = async (name) => {
  const file = `content/${name}.yml`;
  let text;
  try {
    text = await readFile(file, 'utf8');
  } catch (error) {
    fail(
      error.code === 'ENOENT'
        ? `${file} is missing. Restore it from the last good commit, or ask Jonas`
        : `${file} could not be read: ${error.message}`
    );
  }
  try {
    // An empty or half saved file parses to null, and `const { records } = null`
    // throws before validate ever gets a chance to say which file is empty.
    return parse(text) ?? {};
  } catch (error) {
    fail(`${file} is not valid YAML. Undo the last save in the CMS: ${error.message}`);
  }
};

const site = await read('site');
const { records } = await read('records');
const { videos } = await read('videos');
const covers = await listCovers();

// Refusing to build is what keeps the previous good page serving.
const errors = validate({ site, records, videos, covers });
if (errors.length) {
  fail(`the content is not valid.\n\n${errors.map((e) => `  - ${e}`).join('\n')}`);
}

try {
  for (const file of await buildCovers(records)) console.log(`image  ${file}`);
} catch (error) {
  fail(`${error.message}. Upload the sleeve again as a JPG or a PNG`);
}

try {
  await writeFile('index.html', render({ site, records, videos }));
} catch (error) {
  fail(`the page could not be rendered: ${error.message}`);
}
console.log('page   index.html');
