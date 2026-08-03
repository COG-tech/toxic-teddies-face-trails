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
    assert.equal(data.levelVersion, 2);
    assert.equal(data.compilerVersion, 'toxic-toby-portrait-v2');
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
