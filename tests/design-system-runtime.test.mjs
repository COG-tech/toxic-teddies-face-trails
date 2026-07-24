import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

const tokens = await readFile(new URL('../src/design-system/tokens.css', import.meta.url), 'utf8');
const styles = await readFile(new URL('../styles.css', import.meta.url), 'utf8');
const overrides = await readFile(new URL('../src/design-system/dark-theme-overrides.css', import.meta.url), 'utf8');
const index = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const capacitor = await readFile(new URL('../capacitor.config.ts', import.meta.url), 'utf8');

const requiredTokens = {
  '--tt-toxic-green': '#8DBB13',
  '--tt-slime-green': '#B7E24B',
  '--tt-rust-orange': '#A84F18',
  '--tt-mold-olive': '#6F762C',
  '--tt-patch-purple': '#8F456D',
  '--tt-parchment-100': '#F3E4BD',
  '--tt-parchment-300': '#D8BF8A',
  '--tt-brown-700': '#382D1F',
  '--tt-ink-900': '#1D160F',
  '--tt-grime-900': '#0F0C08',
};

test('runtime tokens use the canonical Toxic Teddies palette', () => {
  for (const [name, value] of Object.entries(requiredTokens)) {
    assert.ok(tokens.includes(`${name}: ${value};`), `${name} must remain ${value}`);
  }
});

test('the app shell uses the dark grime system instead of the retired cream theme', () => {
  assert.ok(styles.includes('html { background: #0F0C08; }'));
  assert.ok(styles.includes('linear-gradient(160deg, rgba(33,30,21,.98), rgba(15,12,8,.98));'));
  assert.ok(styles.includes('color: var(--tt-slime-green, #B7E24B);'));
  assert.ok(!styles.includes('linear-gradient(180deg,#faf6ef,#efe6d7)'));
});

test('feed and accessibility surfaces receive the final dark-theme layer', () => {
  assert.ok(overrides.includes('.feed-profile,\n.feed-post'));
  assert.ok(overrides.includes('.accessible-moves-trigger'));
  assert.ok(index.includes('dark-theme-overrides.css'));
  assert.ok(index.indexOf('dark-theme-overrides.css') > index.indexOf('completion-feed.css'));
});

test('native splash and status bar match the dark app shell', () => {
  assert.ok(capacitor.includes("SplashScreen: {\n      launchAutoHide: true,\n      launchShowDuration: 900,\n      backgroundColor: '#0F0C08'"));
  assert.ok(capacitor.includes("StatusBar: {\n      style: 'LIGHT',\n      backgroundColor: '#0F0C08'"));
});
