import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const DIRS = {
  up: {dr: -1, dc: 0},
  right: {dr: 0, dc: 1},
  down: {dr: 1, dc: 0},
  left: {dr: 0, dc: -1},
};

const key = (row, col) => `${row}:${col}`;
const root = process.cwd();
const reportsDirectory = path.join(root, 'compiler', 'reports');
await mkdir(reportsDirectory, {recursive: true});

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function validatePiece(piece, size, occupancy, seenIds) {
  assert(piece?.id && !seenIds.has(piece.id), `Duplicate or missing piece ID: ${piece?.id}`);
  seenIds.add(piece.id);
  assert(Array.isArray(piece.cells) && piece.cells.length >= 2, `${piece.id}: path must contain at least two cells`);
  assert(DIRS[piece.exitDirection], `${piece.id}: invalid exit direction ${piece.exitDirection}`);

  const ownCells = new Set();
  for (let index = 0; index < piece.cells.length; index += 1) {
    const [row, col] = piece.cells[index];
    assert(Number.isInteger(row) && Number.isInteger(col), `${piece.id}: non-integer cell`);
    assert(row >= 0 && row < size && col >= 0 && col < size, `${piece.id}: cell outside board`);
    const cellKey = key(row, col);
    assert(!ownCells.has(cellKey), `${piece.id}: self-intersection at ${cellKey}`);
    assert(!occupancy.has(cellKey), `${piece.id}: overlaps ${occupancy.get(cellKey)} at ${cellKey}`);
    ownCells.add(cellKey);
    occupancy.set(cellKey, piece.id);

    if (index > 0) {
      const [previousRow, previousCol] = piece.cells[index - 1];
      const distance = Math.abs(row - previousRow) + Math.abs(col - previousCol);
      assert(distance === 1, `${piece.id}: non-orthogonal or disconnected segment at index ${index}`);
    }
  }

  const [headRow, headCol] = piece.cells[0];
  const [behindRow, behindCol] = piece.cells[1];
  const expected = headRow < behindRow ? 'up'
    : headRow > behindRow ? 'down'
      : headCol < behindCol ? 'left'
        : 'right';
  assert(piece.exitDirection === expected, `${piece.id}: arrow direction is not tangent to the true head endpoint`);
}

function blockers(piece, active, occupancy, size) {
  const direction = DIRS[piece.exitDirection];
  const [headRow, headCol] = piece.cells[0];
  let row = headRow + direction.dr;
  let col = headCol + direction.dc;
  const result = [];
  const seen = new Set();
  while (row >= 0 && row < size && col >= 0 && col < size) {
    const blockerId = occupancy.get(key(row, col));
    if (blockerId && blockerId !== piece.id && active.has(blockerId) && !seen.has(blockerId)) {
      seen.add(blockerId);
      result.push(blockerId);
    }
    row += direction.dr;
    col += direction.dc;
  }
  return result;
}

const reports = [];
for (let level = 1; level <= 5; level += 1) {
  const filePath = path.join(root, 'levels', 'tt01', `level-${level}.json`);
  const data = JSON.parse(await readFile(filePath, 'utf8'));
  assert(data.teddy === 'tt01', `Level ${level}: incorrect Teddy ID`);
  assert(data.level === level, `Level ${level}: incorrect level number`);
  assert(data.movementRule === 'arrowhead_ray_clear_to_edge', `Level ${level}: incorrect movement rule`);
  assert(Array.isArray(data.pieces) && data.pieces.length > 0, `Level ${level}: no pieces`);

  const occupancy = new Map();
  const seenIds = new Set();
  for (const piece of data.pieces) validatePiece(piece, data.gridSize, occupancy, seenIds);

  const byId = new Map(data.pieces.map(piece => [piece.id, piece]));
  const active = new Set(byId.keys());
  const initialOpen = data.pieces.filter(piece => blockers(piece, active, occupancy, data.gridSize).length === 0);
  assert(initialOpen.length > 0, `Level ${level}: no initially open path`);

  const order = Array.isArray(data.solutionOrder) ? data.solutionOrder : [];
  assert(order.length === data.pieces.length, `Level ${level}: solution order length mismatch`);
  for (const pieceId of order) {
    const piece = byId.get(pieceId);
    assert(piece, `Level ${level}: solution references missing ${pieceId}`);
    const blockingIds = blockers(piece, active, occupancy, data.gridSize);
    assert(blockingIds.length === 0, `Level ${level}: solution path ${pieceId} blocked by ${blockingIds.join(', ')}`);
    active.delete(pieceId);
  }
  assert(active.size === 0, `Level ${level}: solver left ${active.size} paths active`);

  const report = {
    teddyId: 'tt01',
    level,
    expressionId: data.expression,
    gridSize: data.gridSize,
    pathCount: data.pieces.length,
    initialOpenCount: initialOpen.length,
    verifiedNoOverlap: true,
    verifiedOrthogonal: true,
    verifiedEndpointTangents: true,
    verifiedSolvable: true,
    movementRule: data.movementRule,
    compilerVersion: data.compilerVersion,
    levelVersion: data.levelVersion,
  };
  reports.push(report);
  await writeFile(
    path.join(reportsDirectory, `tt01-level-${level}.json`),
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8',
  );
}

console.log(`Validated ${reports.length} Toxic Toby production levels (${reports.reduce((sum, report) => sum + report.pathCount, 0)} paths).`);
