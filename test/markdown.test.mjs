import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inline } from '../lib/markdown.mjs';

test('passes plain text through', () => {
  assert.equal(inline('Adam Sass plays trumpet.'), 'Adam Sass plays trumpet.');
});

test('escapes HTML', () => {
  assert.equal(inline('a <script>x</script> b'), 'a &lt;script&gt;x&lt;/script&gt; b');
});

test('escapes ampersands', () => {
  assert.equal(inline('Sass & Co'), 'Sass &amp; Co');
});

test('renders italic', () => {
  assert.equal(inline('the album *Viewpoint* came out'), 'the album <em>Viewpoint</em> came out');
});

test('renders bold', () => {
  assert.equal(inline('**loud**'), '<strong>loud</strong>');
});

test('prefers bold over italic for double asterisks', () => {
  assert.equal(inline('**a** and *b*'), '<strong>a</strong> and <em>b</em>');
});

test('renders a link with rel noopener', () => {
  assert.equal(
    inline('leads [People In Orbit](https://peopleinorbit.se/) today'),
    'leads <a href="https://peopleinorbit.se/" rel="noopener">People In Orbit</a> today'
  );
});

test('renders a mailto link without rel', () => {
  assert.equal(
    inline('[info@adamsass.se](mailto:info@adamsass.se)'),
    '<a href="mailto:info@adamsass.se">info@adamsass.se</a>'
  );
});

test('renders italic inside a link label', () => {
  assert.equal(
    inline('[*Viewpoint*](https://example.com/)'),
    '<a href="https://example.com/" rel="noopener"><em>Viewpoint</em></a>'
  );
});

test('rejects a javascript: URL', () => {
  assert.throws(() => inline('[x](javascript:alert(1))'), /unsupported URL/);
});

// A leading slash is a path in this repo. Two of them are a host, so
// //evil.example.com would load from somewhere else entirely.
test('rejects a protocol relative URL', () => {
  assert.throws(() => inline('[x](//evil.example.com)'), /unsupported URL/);
});

test('still allows a path in this repo', () => {
  assert.equal(
    inline('[the CV](/assets/cv.pdf)'),
    '<a href="/assets/cv.pdf" rel="noopener">the CV</a>'
  );
});

// The link a musician actually types. It has to be refused somewhere, and
// lib/validate.mjs turns this throw into a sentence naming the field.
test('rejects a link with no scheme at all', () => {
  assert.throws(() => inline('[CV](docs.google.com/doc/abc)'), /unsupported URL/);
});

test('leaves spaced asterisks alone', () => {
  assert.equal(inline('2 * 3 and 4 * 5'), '2 * 3 and 4 * 5');
});

test('still emphasises a single word', () => {
  assert.equal(inline('*Viewpoint*'), '<em>Viewpoint</em>');
});
