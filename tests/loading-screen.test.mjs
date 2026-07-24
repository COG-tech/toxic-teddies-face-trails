import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import loadingArtwork from '../src/generated/loading-image-part-a.js';

test('approved Toxic Teddies loading artwork is a valid bundled WebP image', () => {
  const bytes = Buffer.from(loadingArtwork, 'base64');
  assert.ok(bytes.length > 20_000, 'loading artwork unexpectedly small');
  assert.equal(bytes.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(bytes.subarray(8, 12).toString('ascii'), 'WEBP');
});

test('startup markup and bootstrap retain the loading-screen lifecycle', async () => {
  const [index, bootstrap] = await Promise.all([
    readFile(new URL('../index.html', import.meta.url), 'utf8'),
    readFile(new URL('../src/app/bootstrap.js', import.meta.url), 'utf8'),
  ]);
  assert.match(index, /id="bootSplash"/);
  assert.match(index, /src="\.\/src\/app\/loading-screen\.js"/);
  assert.match(bootstrap, /ToxicLoadingScreen\?\.hide/);
  assert.match(bootstrap, /Loading the face puzzles/);
});
