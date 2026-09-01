import { test } from 'node:test';
import assert from 'node:assert/strict';
import { youtubeId } from '../lib/youtube.mjs';

test('reads a watch URL', () => {
  assert.equal(youtubeId('https://www.youtube.com/watch?v=Vxd4atK0Lyk'), 'Vxd4atK0Lyk');
});

test('reads a watch URL with extra params', () => {
  assert.equal(youtubeId('https://www.youtube.com/watch?v=Vxd4atK0Lyk&t=42s'), 'Vxd4atK0Lyk');
});

test('reads a short URL', () => {
  assert.equal(youtubeId('https://youtu.be/SDsLV3x8Hio?si=abc'), 'SDsLV3x8Hio');
});

test('reads an embed URL', () => {
  assert.equal(youtubeId('https://www.youtube-nocookie.com/embed/xywivVx0vAk?rel=0'), 'xywivVx0vAk');
});

test('accepts a bare ID', () => {
  assert.equal(youtubeId('VFJng3vejoQ'), 'VFJng3vejoQ');
});

test('rejects anything else', () => {
  assert.throws(() => youtubeId('https://vimeo.com/12345'), /not a YouTube/);
});

test('reads a watch URL where v is not the first parameter', () => {
  assert.equal(youtubeId('https://www.youtube.com/watch?app=desktop&v=Vxd4atK0Lyk'), 'Vxd4atK0Lyk');
});

test('reads a watch URL with a playlist after the ID', () => {
  assert.equal(
    youtubeId('https://www.youtube.com/watch?v=Vxd4atK0Lyk&list=PLb7yFbBiEZs&index=2'),
    'Vxd4atK0Lyk'
  );
});

test('takes the first v parameter, as a browser would', () => {
  assert.equal(
    youtubeId('https://www.youtube.com/watch?v=Vxd4atK0Lyk&v=SDsLV3x8Hio'),
    'Vxd4atK0Lyk'
  );
});

// The ID is all we keep: the build writes it into a youtube-nocookie.com embed
// URL of our own making, so a lookalike host cannot point the iframe anywhere.
test('takes the ID out of a lookalike host, because only the ID is used', () => {
  assert.equal(youtubeId('https://evil.example.com/youtu.be/Vxd4atK0Lyk'), 'Vxd4atK0Lyk');
});
