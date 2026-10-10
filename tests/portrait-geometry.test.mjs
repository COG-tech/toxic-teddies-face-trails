import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

function boundsForPieces(pieces) {
  const cells = pieces.flatMap(piece => piece.cells);
  const rows = cells.map(([row]) => row);
  const cols = cells.map(([, col]) => col);
  const height = Math.max(...rows) - Math.min(...rows) + 1;
  const width = Math.max(...cols) - Math.min(...cols) + 1;
  return {height, width, aspectRatio: height / width};
}

for (let level = 1; level <= 5; level += 1) {
  test(`Toxic Toby level ${level} uses portrait-native authored geometry`, async () => {
    const data = JSON.parse(await readFile(`levels/tt01/level-${level}.json`, 'utf8'));
    assert.equal(data.schemaVersion, 12);
    assert.equal(data.levelVersion, 3);
    assert.equal(data.compilerVersion, 'toxic-toby-teddy-v3');
    assert.equal(data.quality?.geometryMode, 'portrait_native');
    assert.ok(data.gridRows > data.gridCols, 'authored grid must be portrait');
    assert.equal(data.gridSize, data.gridRows, 'legacy gridSize must remain the larger dimension');
    assert.ok(data.pieces.length >= 110, 'portrait face became too sparse');
    assert.ok(data.pieces.length <= 210, 'portrait face became impractically dense');

    const ids = new Set(data.pieces.map(piece => piece.id));
    assert.equal(ids.size, data.pieces.length, 'path IDs must remain unique');
    assert.equal(data.solutionOrder.length, data.pieces.length, 'solution order must cover every path');

    const bounds = boundsForPieces(data.pieces);
    assert.ok(bounds.aspectRatio >= 1.42, `face is not tall enough: ${bounds.aspectRatio}`);
    assert.ok(bounds.aspectRatio <= 1.65, `face is too narrow or tall: ${bounds.aspectRatio}`);
  });
}

test('portrait generator does not use presentation stretching', async () => {
  const source = await readFile('scripts/extract-dense-levels.mjs', 'utf8');
  assert.match(source, /Portrait-native authoring/);
  assert.match(source, /gridRows/);
  assert.match(source, /gridCols/);
  assert.match(source, /geometryMode: 'portrait_native'/);
  assert.doesNotMatch(source, /scaleY|preserveAspectRatio.*none/);
});

for (let level = 1; level <= 5; level += 1) {
  test(`Toxic Toby level ${level} keeps its nose, ears, cheeks and mouth landmarks`, async () => {
    const data = JSON.parse(await readFile(`levels/tt01/level-${level}.json`, 'utf8'));
    const normalized = ([r, c]) => ({
      x: (c - (data.gridCols - 1) / 2) / ((data.gridCols - 1) / 2),
      y: (r - (data.gridRows - 1) / 2) / ((data.gridRows - 1) / 2),
    });
    const all = data.pieces.flatMap(p => p.cells).map(normalized);
    const nose = data.pieces.filter(p => p.style === 'nose').flatMap(p => p.cells).map(normalized);
    assert.ok(nose.length >= 12, 'nose is too faint to be a landmark');
    assert.ok(nose.every(p => Math.abs(p.x) <= .17 && p.y >= .14 && p.y < .40), 'nose-colored trails spilled out of the muzzle');
    assert.ok(all.some(p => p.x < -.55 && p.y > .1 && p.y < .35), 'left cheek is missing');
    assert.ok(all.some(p => p.x > .55 && p.y > .1 && p.y < .35), 'right cheek is missing');
    assert.ok(Math.max(...all.map(p => p.y)) <= .67, 'chin returned to the long taper');
    for (const side of [-1, 1]) {
      assert.ok(all.some(p => side * p.x > .44 && p.y < -.60), 'round ear crown is missing');
      assert.ok(all.some(p => side * p.x > .30 && side * p.x < .48 && p.y > -.44 && p.y < -.35), 'ear attachment is missing');
    }
    assert.ok(data.pieces.some(p => p.style === 'mouth'), 'expression mouth is missing');
    assert.ok(data.pieces.some(p => p.style === 'muzzle'), 'muzzle is missing');
  });
}

test('ear radii are circular in square cell coordinates on every portrait grid', async () => {
  const source = await readFile('scripts/extract-dense-levels.mjs', 'utf8');
  assert.match(source, /earRadiusY = earRadiusX \* halfCol \/ halfRow/);
  assert.match(source, /innerRadiusY = innerRadiusX \* halfCol \/ halfRow/);
});
