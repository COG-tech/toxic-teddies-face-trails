import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import loadingArtwork from '../src/generated/loading-image-part-a.js';

const staticArtworkUrl = new URL('../public/assets/branding/loading/toxic-teddies-loading.webp', import.meta.url);

test('approved Toxic Teddies loading artwork materializes as a real WebP file', async () => {
  await import(`../scripts/materialize-brand-assets.mjs?test=${Date.now()}`);
  const [expected, actual] = await Promise.all([
    Promise.resolve(Buffer.from(loadingArtwork, 'base64')),
    readFile(staticArtworkUrl),
  ]);
  assert.ok(actual.length > 20_000, 'loading artwork unexpectedly small');
  assert.equal(actual.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(actual.subarray(8, 12).toString('ascii'), 'WEBP');
  assert.deepEqual(actual, expected, 'materialized artwork differs from the approved source payload');
});

test('startup markup loads the approved artwork without waiting for JavaScript', async () => {
  const [index, loader, bootstrap, serviceWorker] = await Promise.all([
    readFile(new URL('../index.html', import.meta.url), 'utf8'),
    readFile(new URL('../src/app/loading-screen.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/app/bootstrap.js', import.meta.url), 'utf8'),
    readFile(new URL('../sw.js', import.meta.url), 'utf8'),
  ]);
  const assetPath = './assets/branding/loading/toxic-teddies-loading.webp';
  assert.match(index, /id="bootSplash"/);
  assert.match(index, new RegExp(`id="bootSplashImage"[\\s\\S]*src="${assetPath.replaceAll('.', '\\.') }"`));
  assert.match(index, /<link rel="preload" as="image" type="image\/webp" href="\.\/assets\/branding\/loading\/toxic-teddies-loading\.webp" \/>/);
  assert.match(index, /<script src="\.\/src\/app\/loading-screen\.js\?v=39"><\/script>/);
  assert.doesNotMatch(loader, /loading-image-part-a|data:image\/webp;base64/);
  assert.match(index, /class="home-brand-logo"[\s\S]*toxic-teddies-loading\.webp/);
  assert.match(bootstrap, /ToxicLoadingScreen\?\.hide/);
  assert.match(bootstrap, /Loading the face puzzles/);
  assert.match(bootstrap, /sw\.js\?v=39/);
  assert.match(serviceWorker, /toxic-teddies-arrow-escape-v39/);
  assert.match(serviceWorker, /assets\/branding\/loading\/toxic-teddies-loading\.webp/);
});
