// DOM/runtime regression harness only. Layout, SVG measurement and animation
// are simulated; this must never be presented as browser or physical-phone QA.
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import * as progression from '../../src/game/progression.js';
import {createSaveStore} from '../../src/storage/save-store.js';

const read = file => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');
export const settle = () => new Promise(resolve => setTimeout(resolve, 12));

export async function waitFor(predicate, message = 'Runtime did not settle') {
  const deadline = Date.now() + 3000;
  while (!predicate()) {
    if (Date.now() > deadline) throw new Error(message);
    await settle();
  }
}

export async function runtime({save = null, route = '', failLevel = null} = {}) {
  const html = (await read('index.html')).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
  const dom = new JSDOM(html, {url: `https://toxic.test/${route}`, runScripts: 'outside-only', pretendToBeVisual: true});
  const {window} = dom;
  window.structuredClone = structuredClone;
  window.matchMedia = () => ({matches: true, addEventListener() {}, removeEventListener() {}});
  window.document.documentElement.classList.add('reduced-motion');
  window.Element.prototype.animate = () => ({finished: Promise.resolve(), cancel() {}});
  window.SVGElement.prototype.getBBox = function() {
    const coords = [...this.querySelectorAll('.dense-rope-body')].flatMap(p => {
      const numbers = p.getAttribute('d').match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
      return Array.from({length: numbers.length / 2}, (_, i) => [numbers[i * 2], numbers[i * 2 + 1]]);
    });
    if (!coords.length) return {x: 0, y: 0, width: 0, height: 0};
    const xs = coords.map(p => p[0]), ys = coords.map(p => p[1]);
    return {x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys)};
  };
  let writes = structuredClone(save);
  const bridge = {readProgress: async () => writes, writeProgress: async value => {writes = structuredClone(value);}};
  const buildInfo = JSON.parse(await read('src/generated/build-info.json'));
  let registry = await read('src/content/content-registry.js');
  for (const match of [...registry.matchAll(/import (\w+) from '(\.\/[^']+\.json)';/g)]) {
    registry = registry.replace(match[0], `const ${match[1]} = ${await read(`src/content/${match[2].slice(2)}`)};`);
  }
  window.eval(registry.replace('export function', 'function') + '\nwindow.ToxicContent = createContentRegistry();');
  // Save-store's legacy bridge reads this global; keep it empty and explicit.
  globalThis.localStorage = {getItem: () => null};
  const store = await createSaveStore(bridge, window.ToxicContent, buildInfo);
  window.ToxicSaveStore = store;
  window.ToxicBuildInfo = buildInfo;
  window.ToxicProgression = progression;
  window.ToxicAccessibility = {announce() {}, update() {}};
  window.ToxicInputControllerFactory = () => ({refresh() {}});
  window.fetch = async url => {
    const filename = new URL(String(url), window.location.href).pathname.slice(1);
    if (failLevel && filename === `levels/tt01/level-${failLevel}.json`) return {ok: false};
    const text = await read(filename);
    return {ok: true, text: async () => text, json: async () => JSON.parse(text)};
  };
  const sources = await Promise.all(['compiled-app.js', 'hard-mode-v3.js', 'compiled-level-source.js', 'interaction-fix.js', 'mobile-enhancements.js'].map(read));
  sources[0] = sources[0].replace(/\bboot\(\);\s*$/, '');
  window.eval(sources.join('\n') + `
    window.testGame = {state, openGame, showHome, goNext, resetLevel, blockersAhead, attemptMove};
    boot();
  `);
  window.eval(await read('src/app/gameplay-fit.js'));
  if (!route.includes('teddy=') && !route.includes('feed=')) await window.testGame.openGame(0, 1);
  await waitFor(() => window.testGame.state.data || window.document.getElementById('feedView').classList.contains('hidden') === false);
  if (window.testGame.state.data) await waitFor(() => window.ToxicPuzzleFit.getMetrics());
  return {
    dom, window, game: window.testGame, store,
    getSaved: async () => {await store.flush(); return structuredClone(writes);},
    setFailedLevel: level => {failLevel = level;},
    close: () => {dom.window.close();},
  };
}

export async function remove(runtime, id) {
  const piece = runtime.game.state.byId.get(id);
  runtime.game.attemptMove(piece, {inputType: 'test'});
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}
