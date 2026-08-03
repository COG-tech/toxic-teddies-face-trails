import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

const manifest = JSON.parse(await readFile('src/content/backdrop-manifest.json', 'utf8'));
const index = await readFile('index.html', 'utf8');
const bootstrap = await readFile('src/app/bootstrap.js', 'utf8');
const loader = await readFile('dense-loader.js', 'utf8');
const runtime = await readFile('src/app/gameplay-backdrops.js', 'utf8');
const fitRuntime = await readFile('src/app/gameplay-fit.js', 'utf8');
const styles = await readFile('src/design-system/gameplay-backdrops.css', 'utf8');
const fitStyles = await readFile('src/design-system/gameplay-fit.css', 'utf8');
const serviceWorker = await readFile('sw.js', 'utf8');
const visualAudit = await readFile('scripts/capture-gameplay-backdrop-audit.mjs', 'utf8');

test('gameplay uses a generated adaptive frame instead of raster backdrop assets', () => {
  assert.equal(manifest.presentation_mode, 'generated_css');
  assert.deepEqual(manifest.backdrops, []);
  assert.match(runtime, /has-generated-gameplay-frame/);
  assert.match(runtime, /gameplayBackdropMode = 'generated-css'/);
  assert.match(runtime, /gameplayBackdropStatus = 'loaded'/);
  assert.match(runtime, /backgroundImage = 'none'/);
  assert.doesNotMatch(runtime, /new Image\(/);
  assert.doesNotMatch(runtime, /gameplayBackdropUrl\s*=/);
  assert.doesNotMatch(serviceWorker, /assets\/backdrops\/tt01/);
});

test('adaptive canvas assets and cache version are bundled', () => {
  assert.match(index, /gameplay-backdrops\.css\?v=52/);
  assert.match(index, /bootstrap\.js\?v=52/);
  assert.match(bootstrap, /^import '\.\/gameplay-backdrops\.js';/m);
  assert.match(bootstrap, /^import '\.\/gameplay-fit\.js';/m);
  assert.match(bootstrap, /^import '\.\.\/design-system\/gameplay-fit\.css';/m);
  assert.match(bootstrap, /sw\.js\?v=52/);
  assert.match(serviceWorker, /toxic-teddies-arrow-escape-v52/);
});

test('the intro remains visible until generated frame and locked puzzle are ready', () => {
  assert.match(loader, /waitForInitialRouteReady/);
  assert.match(loader, /renderedPathCount > 0/);
  assert.match(loader, /gameplayBackdropStatus === 'loaded'/);
  assert.match(loader, /puzzleFitStatus === 'fitted'/);
  assert.match(loader, /await waitForInitialRouteReady\(\)/);
});

test('the engine preserves the Teddy aspect ratio and locks scale during play', () => {
  assert.match(fitRuntime, /TARGET_VISUAL_FILL = 0\.94/);
  assert.match(fitRuntime, /getBBox\(\{fill: true, stroke: true, markers: true\}\)/);
  assert.match(fitRuntime, /lockedFit = Object\.freeze/);
  assert.match(fitRuntime, /initialPathCount: pathCount/);
  assert.match(fitRuntime, /preserveAspectRatio', 'xMidYMid meet'/);
  assert.doesNotMatch(fitRuntime, /preserveAspectRatio', 'none'/);
  assert.match(fitRuntime, /puzzleAspectPreserved = 'true'/);
  assert.match(fitRuntime, /attributeFilter: \['viewBox'\]/);
  assert.doesNotMatch(fitRuntime, /childList:\s*true/);
  assert.doesNotMatch(fitRuntime, /subtree:\s*true/);
});

test('the game canvas follows the full viewport and the visible HUD stays tiny', () => {
  assert.match(fitStyles, /\.game-view\.has-gameplay-backdrop\s*\{[\s\S]*width:\s*100vw;[\s\S]*height:\s*calc\(100dvh/);
  assert.match(fitStyles, /\.board-shell\s*\{[\s\S]*top:\s*max\(24px/);
  assert.match(styles, /has-generated-gameplay-frame/);
  assert.match(styles, /\.top-icon::before\s*\{[\s\S]*width:\s*24px;[\s\S]*height:\s*24px;/);
  assert.match(styles, /\.top-icon\s*\{[\s\S]*width:\s*44px;[\s\S]*height:\s*44px;/);
  assert.match(styles, /\.game-title h2\s*\{[\s\S]*font-size:\s*\.48rem;/);
  assert.match(styles, /\.progress\s*\{[\s\S]*font-size:\s*\.36rem;/);
  assert.match(styles, /\.board-backdrop\s*\{[\s\S]*display:\s*none !important;/);
  assert.match(visualAudit, /puzzleAspectRatio/);
  assert.match(visualAudit, /puzzleInsideGame/);
});
