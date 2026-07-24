import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

const staticArtworkUrl = new URL('../public/assets/branding/loading/toxic-teddies-loading.webp', import.meta.url);
const sourceUrls = Array.from({length: 5}, (_, index) =>
  new URL(`../src/generated/loading-image-approved-part-${String(index + 1).padStart(2, '0')}.txt`, import.meta.url),
);
const expectedByteLength = 64_450;
const expectedSha256 = 'a0a6a06e34b538027b755427d0a24026b988d69705468dff1bf075e2286198ed';

async function readApprovedArtwork() {
  const parts = await Promise.all(sourceUrls.map(url => readFile(url, 'utf8')));
  return Buffer.from(parts.map(part => part.trim()).join(''), 'base64');
}

test('approved Toxic Teddies loading artwork materializes as the exact real WebP file', async () => {
  await import(`../scripts/materialize-brand-assets.mjs?test=${Date.now()}`);
  const [expected, actual] = await Promise.all([
    readApprovedArtwork(),
    readFile(staticArtworkUrl),
  ]);
  assert.equal(actual.length, expectedByteLength, 'loading artwork byte length changed');
  assert.equal(createHash('sha256').update(actual).digest('hex'), expectedSha256, 'loading artwork checksum changed');
  assert.equal(actual.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(actual.subarray(8, 12).toString('ascii'), 'WEBP');
  assert.deepEqual(actual, expected, 'materialized artwork differs from the approved source chunks');
});

test('startup markup loads the approved artwork without waiting for JavaScript', async () => {
  const [index, loader, bootstrap, serviceWorker, theme] = await Promise.all([
    readFile(new URL('../index.html', import.meta.url), 'utf8'),
    readFile(new URL('../src/app/loading-screen.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/app/bootstrap.js', import.meta.url), 'utf8'),
    readFile(new URL('../sw.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/design-system/dark-theme-overrides.css', import.meta.url), 'utf8'),
  ]);
  const assetPath = './assets/branding/loading/toxic-teddies-loading.webp';
  assert.match(index, /id="bootSplash"/);
  assert.match(index, new RegExp(`id="bootSplashImage"[\\s\\S]*src="${assetPath.replaceAll('.', '\\.') }"`));
  assert.match(index, /<link rel="preload" as="image" type="image\/webp" href="\.\/assets\/branding\/loading\/toxic-teddies-loading\.webp" \/>/);
  assert.match(index, /<script src="\.\/src\/app\/loading-screen\.js\?v=39"><\/script>/);
  assert.doesNotMatch(loader, /loading-image-part-a|data:image\/webp;base64|import\s/);
  assert.match(index, /class="home-brand-logo"[\s\S]*toxic-teddies-loading\.webp/);
  assert.match(theme, /\.home-brand-logo/);
  assert.match(theme, /\.home-brand-logo img/);
  assert.match(bootstrap, /ToxicLoadingScreen\?\.hide/);
  assert.match(bootstrap, /Loading the face puzzles/);
  assert.match(bootstrap, /sw\.js\?v=39/);
  assert.match(serviceWorker, /toxic-teddies-arrow-escape-v39/);
  assert.match(serviceWorker, /assets\/branding\/loading\/toxic-teddies-loading\.webp/);
});
