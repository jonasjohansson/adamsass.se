import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { render } from '../lib/template.mjs';

// Rendered from the real content, because that is the page that ships. This is
// a smoke test on purpose: comparing the output against a saved copy was tried
// and retired, since every edit to the copy failed it for no reason.
const root = new URL('../', import.meta.url);
const content = (name) => parse(readFileSync(new URL(`content/${name}.yml`, root), 'utf8'));

const site = content('site');
const { records } = content('records');
const { videos } = content('videos');
const html = render({ site, records, videos });

const count = (needle) => html.split(needle).length - 1;

test('the page carries the content it was given', () => {
  assert.ok(html.includes(site.email), 'the email address is on the page');
  assert.equal(count('<li class="record">'), records.length);
  assert.equal(count('<iframe'), videos.length);
});

test('the bio is rendered as markdown, not printed as markdown', () => {
  assert.ok(count('<em>') > 0, 'expected at least one italic out of the bio');
  assert.ok(!html.includes('*Viewpoint*'), 'an asterisk pair reached the page unrendered');
});

// CLAUDE.md says no nav, no footer, no motion, four type sizes, no webfont.
// Those are the rules Jonas keeps deleting things to hold, so they are worth a
// test: a heading that explains a section is exactly what creeps back in.
test('the design rules hold', () => {
  for (const banned of ['<nav', '<footer', 'transition', '<h3', 'fonts.googleapis']) {
    assert.ok(!html.includes(banned), `the page must not contain ${banned}`);
  }
});

// The JSON-LD block is a script element, and JSON.stringify does not escape <.
// Adam has a text field on every one of these values.
test('a </script> in a text field cannot break out of the JSON-LD', () => {
  const bad = { ...site, short_description: 'x </script><script>alert(1)</script>' };
  const out = render({ site: bad, records, videos });
  const block = out.split('application/ld+json')[1].split('</script>')[0];
  assert.ok(!block.includes('<script'), 'the value must not reopen a script element');
  assert.equal(
    JSON.parse(block.slice(block.indexOf('{'))).description,
    bad.short_description,
    'and it must still read back as the words Adam typed'
  );
});
