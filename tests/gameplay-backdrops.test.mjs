import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

const manifest = JSON.parse(await readFile('src/content/backdrop-manifest.json', 'utf8'));
const index = await readFile('index.html', 'utf8');
const bootstrap = await readFile('src/app/bootstrap.js', 'utf8');
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

test('gameplay backdrop presentation is bundled without replacing puzzle input code', () => {
  assert.match(index, /gameplay-backdrops\.css\?v=42/);
  assert.doesNotMatch(index, /<script src="\.\/src\/app\/gameplay-backdrops\.js/);
  assert.match(bootstrap, /^import '\.\/gameplay-backdrops\.js';/m);
  assert.match(runtime, /MutationObserver/);
  assert.match(runtime, /--gameplay-backdrop-image/);
});

test('gameplay environment paints above the game-view background and behind every control', () => {
  assert.match(styles, /\.game-view::before\s*\{[\s\S]*z-index:\s*0;/);
  assert.doesNotMatch(styles, /\.game-view::before\s*\{[\s\S]*z-index:\s*-[0-9]+;/);
  assert.match(styles, /\.game-view::after\s*\{[\s\S]*z-index:\s*1;/);
  assert.match(styles, /\.game-view\.has-gameplay-backdrop > \*\s*\{[\s\S]*z-index:\s*2;/);
  assert.match(styles, /\.game-view\.has-gameplay-backdrop \.board-shell\s*\{[\s\S]*width:\s*min\(76%, 690px\);/);
  assert.match(styles, /\.game-view\.has-gameplay-backdrop \.board-shell\s*\{[\s\S]*background:\s*transparent;/);
  assert.match(styles, /\.game-view\.has-gameplay-backdrop \.board-shell::before\s*\{[\s\S]*display:\s*none;/);
  assert.match(styles, /\.game-view\.has-gameplay-backdrop \.board-shell::after\s*\{[\s\S]*background:\s*none;/);
});
