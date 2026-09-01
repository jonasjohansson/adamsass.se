import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parse } from 'yaml';
import { render } from '../lib/template.mjs';

// Migration guard. The whole point of moving copy into content files is that
// the page does not change. A later task deletes this once that is proven.
const squash = (html) => html.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();

test('renders the page it replaced', async () => {
  const site = parse(await readFile('content/site.yml', 'utf8'));
  const { records } = parse(await readFile('content/records.yml', 'utf8'));
  const { videos } = parse(await readFile('content/videos.yml', 'utf8'));
  const baseline = await readFile('test/fixtures/index.baseline.html', 'utf8');

  assert.equal(squash(render({ site, records, videos })), squash(baseline));
});
