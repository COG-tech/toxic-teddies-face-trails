import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

const manifest = JSON.parse(await readFile('src/content/backdrop-manifest.json', 'utf8'));
const index = await readFile('index.html', 'utf8');
const runtime = await readFile('src/app/gameplay-backdrops.js', 'utf8');
const styles = await readFile('src/design-system/gameplay-backdrops.css', 'utf8');
const serviceWorker = await readFile('sw.js', 'utf8');

const expected = [
  './assets/backdrops/tt01/neutral.webp',
  './assets/backdrops/tt01/evil-grin.webp',
  './assets/backdrops/tt01/gross.webp',
  './assets/backdrops/tt01/angry.webp',
  './assets/backdrops/tt01/maniacal-laugh.webp',
];

test('Toxic Toby uses five owner-approved WebP gameplay backdrops', async () => {
  assert.deepEqual(manifest.backdrops.map(item => item.src), expected);
  assert.ok(manifest.backdrops.every(item => item.status === 'owner_approved'));
  assert.ok(manifest.backdrops.every(item => item.version === 2));

  for (const src of expected) {
    const bytes = await readFile(src.replace('./', ''));
    assert.equal(bytes.subarray(0, 4).toString('ascii'), 'RIFF');
    assert.equal(bytes.subarray(8, 12).toString('ascii'), 'WEBP');
    assert.match(serviceWorker, new RegExp(src.replaceAll('.', '\\.')));
  }
});

test('gameplay backdrop presentation is loaded without replacing puzzle input code', () => {
  assert.match(index, /gameplay-backdrops\.css\?v=41/);
  assert.match(index, /gameplay-backdrops\.js\?v=41/);
  assert.match(runtime, /MutationObserver/);
  assert.match(runtime, /--gameplay-backdrop-image/);
  assert.match(styles, /\.game-view\.has-gameplay-backdrop::before/);
  assert.match(styles, /\.board-backdrop\s*\{/);
});
