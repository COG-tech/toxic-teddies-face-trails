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

const expected = [
  './assets/backdrops/tt01/neutral.webp',
  './assets/backdrops/tt01/evil-grin.webp',
  './assets/backdrops/tt01/gross.webp',
  './assets/backdrops/tt01/angry.webp',
  './assets/backdrops/tt01/maniacal-laugh.webp',
];

function fakeStyle() {
  return {
    backgroundImage: '',
    backgroundPosition: '',
    backgroundSize: '',
    backgroundRepeat: '',
    setProperty(name, value) {
      this[name] = value;
    },
    removeProperty(name) {
      const camel = name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      this[camel] = '';
      delete this[name];
    },
  };
}

function fakeClassList() {
  const values = new Set();
  return {
    add: (...names) => names.forEach(name => values.add(name)),
    remove: (...names) => names.forEach(name => values.delete(name)),
    contains: name => values.has(name),
  };
}

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

test('gameplay backdrop and measured fit are bundled without replacing puzzle input code', () => {
  assert.match(index, /gameplay-backdrops\.css\?v=48/);
  assert.doesNotMatch(index, /<script src="\.\/src\/app\/gameplay-backdrops\.js/);
  assert.match(bootstrap, /^import '\.\/gameplay-backdrops\.js';/m);
  assert.match(bootstrap, /^import '\.\/gameplay-fit\.js';/m);
  assert.match(bootstrap, /^import '\.\.\/design-system\/gameplay-fit\.css';/m);
  assert.match(bootstrap, /sw\.js\?v=50/);
  assert.match(serviceWorker, /toxic-teddies-arrow-escape-v50/);
  assert.match(runtime, /new URL\(source, document\.baseURI\)\.href/);
  assert.match(runtime, /new Image\(\)/);
  assert.match(runtime, /gameView\.style\.backgroundImage/);
  assert.match(runtime, /gameView\.style\.backgroundPosition = '50% 42%'/);
  assert.match(runtime, /gameView\.style\.backgroundSize = 'auto 122%'/);
  assert.match(runtime, /gameplayBackdropCrop = '122%-at-42%'/);
  assert.match(runtime, /gameplayBackdropStatus = 'loaded'/);
  assert.doesNotMatch(runtime, /--gameplay-backdrop-image/);
});

test('relative manifest paths become absolute loaded URLs and use the cropped undistorted presentation', async () => {
  const gameView = {style: fakeStyle(), classList: fakeClassList(), dataset: {}};
  const boardBackdrop = {style: fakeStyle(), dataset: {}};
  boardBackdrop.style.backgroundImage = "url('./assets/backdrops/tt01/neutral.webp')";
  boardBackdrop.style.backgroundPosition = '50% 50%';

  const originals = {
    document: globalThis.document,
    Image: globalThis.Image,
    MutationObserver: globalThis.MutationObserver,
  };

  class FakeImage {
    constructor() {
      this.listeners = new Map();
      this.complete = false;
      this.naturalWidth = 0;
    }

    addEventListener(type, listener) {
      this.listeners.set(type, listener);
    }

    set src(value) {
      this.value = value;
      this.complete = true;
      this.naturalWidth = 1080;
      queueMicrotask(() => this.listeners.get('load')?.());
    }

    get src() {
      return this.value;
    }
  }

  try {
    globalThis.document = {
      baseURI: 'https://example.test/toxic-teddies-face-trails/play/',
      getElementById(id) {
        if (id === 'gameView') return gameView;
        if (id === 'boardBackdrop') return boardBackdrop;
        return null;
      },
    };
    globalThis.Image = FakeImage;
    globalThis.MutationObserver = class {
      constructor(callback) {
        this.callback = callback;
      }
      observe() {}
    };

    await import(`../src/app/gameplay-backdrops.js?test=${Date.now()}`);
    await new Promise(resolve => setTimeout(resolve, 0));

    const expectedUrl = 'https://example.test/toxic-teddies-face-trails/play/assets/backdrops/tt01/neutral.webp';
    assert.equal(gameView.dataset.gameplayBackdropStatus, 'loaded');
    assert.equal(gameView.dataset.gameplayBackdropUrl, expectedUrl);
    assert.equal(gameView.dataset.gameplayBackdropCrop, '122%-at-42%');
    assert.equal(gameView.style.backgroundImage, `url(${JSON.stringify(expectedUrl)})`);
    assert.equal(gameView.style.backgroundPosition, '50% 42%');
    assert.equal(gameView.style.backgroundSize, 'auto 122%');
    assert.equal(gameView.classList.contains('has-gameplay-backdrop'), true);
  } finally {
    globalThis.document = originals.document;
    globalThis.Image = originals.Image;
    globalThis.MutationObserver = originals.MutationObserver;
  }
});

test('the intro remains visible until the requested route, backdrop and measured puzzle are ready', () => {
  assert.match(loader, /waitForInitialRouteReady/);
  assert.match(loader, /renderedPathCount > 0/);
  assert.match(loader, /gameplayBackdropStatus === 'loaded'/);
  assert.match(loader, /puzzleFitStatus === 'fitted'/);
  assert.match(loader, /await waitForInitialRouteReady\(\)/);
});

test('gameplay-first presentation removes wide edges and fits each rendered Teddy from real path bounds', () => {
  assert.match(styles, /\.game-view\s*\{[\s\S]*background-size:\s*cover;/);
  assert.doesNotMatch(styles, /z-index:\s*-[0-9]+;/);
  assert.match(styles, /\.game-view\.has-gameplay-backdrop > \*\s*\{[\s\S]*z-index:\s*1;/);
  assert.match(styles, /\.game-view\.has-gameplay-backdrop \.game-topbar\s*\{[\s\S]*position:\s*absolute;[\s\S]*height:\s*44px;[\s\S]*background:\s*transparent;/);
  assert.match(styles, /\.game-view\.has-gameplay-backdrop \.game-title h2\s*\{[\s\S]*font-size:\s*\.72rem;/);
  assert.match(styles, /\.game-view\.has-gameplay-backdrop \.status-text\s*\{[\s\S]*clip-path:\s*inset\(50%\)/);
  assert.match(styles, /\.game-view\.has-gameplay-backdrop \.game-footer\s*\{[\s\S]*position:\s*absolute;[\s\S]*width:\s*44px;[\s\S]*height:\s*44px;/);
  assert.match(styles, /\.game-view\.has-gameplay-backdrop \.accessible-moves-trigger\s*\{[\s\S]*width:\s*44px;[\s\S]*height:\s*44px;[\s\S]*font-size:\s*0;/);
  assert.match(styles, /\.game-view\.has-gameplay-backdrop \.level-buttons\s*\{[\s\S]*display:\s*none !important;/);
  assert.match(styles, /\.game-view\.has-gameplay-backdrop \.board-shell\s*\{[\s\S]*position:\s*absolute;[\s\S]*top:\s*50%;[\s\S]*width:\s*100%;/);

  assert.match(fitStyles, /\.game-view\.has-gameplay-backdrop \.board,[\s\S]*\.preview-layer\s*\{[\s\S]*inset:\s*0;[\s\S]*width:\s*100%;[\s\S]*height:\s*100%;/);
  assert.match(fitStyles, /@media \(max-width: 620px\)[\s\S]*\.game-view\s*\{[\s\S]*width:\s*100%;[\s\S]*height:\s*calc\(100dvh - var\(--safe-top, 0px\) - var\(--safe-bottom, 0px\)\);[\s\S]*aspect-ratio:\s*auto;/);
  assert.doesNotMatch(fitStyles, /125%|-12\.5%/);

  assert.match(fitRuntime, /TARGET_VISUAL_FILL = 0\.94/);
  assert.match(fitRuntime, /getBBox\(\{fill: true, stroke: true, markers: true\}\)/);
  assert.match(fitRuntime, /board\.setAttribute\('viewBox', viewBox\)/);
  assert.match(fitRuntime, /preview\?\.setAttribute\('viewBox', viewBox\)/);
  assert.match(fitRuntime, /new MutationObserver\(scheduleFit\)\.observe\(board, \{[\s\S]*childList: true,[\s\S]*subtree: true/);
  assert.match(fitRuntime, /gameView\.dataset\.puzzleFitStatus = 'fitted'/);
  assert.match(fitRuntime, /widthFill = bounds\.width \/ squareSize/);

  assert.match(visualAudit, /transformedSvgRect/);
  assert.match(visualAudit, /puzzleInsideGame/);
});
