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

test('startup markup executes the artwork loader as an ES module', async () => {
  const [index, loader, bootstrap] = await Promise.all([
    readFile(new URL('../index.html', import.meta.url), 'utf8'),
    readFile(new URL('../src/app/loading-screen.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/app/bootstrap.js', import.meta.url), 'utf8'),
  ]);
  assert.match(index, /id="bootSplash"/);
  assert.match(index, /<script\s+type="module"\s+src="\.\/src\/app\/loading-screen\.js\?v=38"><\/script>/);
  assert.doesNotMatch(index, /<script\s+src="\.\/src\/app\/loading-screen\.js/);
  assert.match(loader, /import loadingArtwork from '\.\.\/generated\/loading-image-part-a\.js'/);
  assert.match(loader, /image\.src = `data:image\/webp;base64,\$\{loadingArtwork\}`/);
  assert.match(bootstrap, /ToxicLoadingScreen\?\.hide/);
  assert.match(bootstrap, /Loading the face puzzles/);
  assert.match(bootstrap, /sw\.js\?v=38/);
});
