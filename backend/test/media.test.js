import test from 'node:test';
import assert from 'node:assert/strict';
import { detectMedia } from '../src/media.js';

test('media rejects empty, nonbinary, HTML and SVG uploads', () => {
  for (const value of [null, {}, Buffer.alloc(0), Buffer.from('<html>'), Buffer.from('<svg>')]) assert.equal(detectMedia(value), null);
});
test('media identifies allowed signatures and sends PDF as raw', () => {
  assert.equal(detectMedia(Buffer.from('%PDF-1.7')).resource, 'raw');
  assert.equal(detectMedia(Buffer.from([255,216,255,224])).type, 'image/jpeg');
  assert.equal(detectMedia(Buffer.from([137,80,78,71,13,10,26,10])).type, 'image/png');
  assert.equal(detectMedia(Buffer.from('RIFF1234WEBP')).type, 'image/webp');
  assert.equal(detectMedia(Buffer.from('RIFF1234WAVE')), null);
});
