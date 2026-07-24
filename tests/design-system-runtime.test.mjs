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
    assert.match(tokens, new RegExp(`${name}:\\s*${value}`, 'i'), `${name} must remain ${value}`);
  }
});

test('the app shell uses the dark grime system instead of the retired cream theme', () => {
  assert.match(styles, /html\s*\{[^}]*background:\s*#0F0C08/i);
  assert.match(styles, /\.teddy-card\s*\{[\s\S]*linear-gradient\(160deg,[\s\S]*rgba\(15,12,8,\.98\)/i);
  assert.match(styles, /\.home-header h1\s*\{[\s\S]*--tt-slime-green/i);
  assert.doesNotMatch(styles, /linear-gradient\(180deg,#faf6ef,#efe6d7\)/i);
});

test('feed and accessibility surfaces receive the final dark-theme layer', () => {
  assert.match(overrides, /\.feed-profile,[\s\S]*\.feed-post/);
  assert.match(overrides, /\.accessible-moves-trigger/);
  assert.match(index, /dark-theme-overrides\.css/);
  assert.ok(index.indexOf('dark-theme-overrides.css') > index.indexOf('completion-feed.css'));
});

test('native splash and status bar match the dark app shell', () => {
  assert.match(capacitor, /SplashScreen:[\s\S]*backgroundColor:\s*'#0F0C08'/);
  assert.match(capacitor, /StatusBar:[\s\S]*style:\s*'LIGHT'/);
  assert.match(capacitor, /StatusBar:[\s\S]*backgroundColor:\s*'#0F0C08'/);
});
