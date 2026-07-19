import { TEDDIES, DIFFICULTIES } from '../characters.js';

const DIRS = {
  up: { dr: -1, dc: 0 },
  right: { dr: 0, dc: 1 },
  down: { dr: 1, dc: 0 },
  left: { dr: 0, dc: -1 }
};

const keyOf = (row, col) => `${row}:${col}`;

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed) {
  return function random() {
    let value = seed += 0x6D2B79F5;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function faceCells(size) {
  const cells = [];
  const half = (size - 1) / 2;
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const x = (col - half) / half;
      const y = (row - half) / half;
      const head = (x * x) / (0.79 * 0.79) + ((y + 0.01) * (y + 0.01)) / (0.83 * 0.83) <= 1;
      const leftEar = ((x + 0.68) ** 2) / (0.29 ** 2) + ((y + 0.68) ** 2) / (0.29 ** 2) <= 1;
      const rightEar = ((x - 0.68) ** 2) / (0.29 ** 2) + ((y + 0.68) ** 2) / (0.29 ** 2) <= 1;
      if (head || leftEar || rightEar) cells.push({ row, col, key: keyOf(row, col) });
    }
  }
  return cells;
}

function rayKeys(cell, direction, size) {
  const dir = DIRS[direction];
  const keys = [];
  let row = cell.row + dir.dr;
  let col = cell.col + dir.dc;
  while (row >= 0 && row < size && col >= 0 && col < size) {
    keys.push(keyOf(row, col));
    row += dir.dr;
    col += dir.dc;
  }
  return keys;
}

function generate(teddy, teddyIndex, level) {
  const diff = DIFFICULTIES[level - 1];
  const rng = mulberry32(hashString(`${teddy.id}:${level}:arrow-face-v2`));
  const cells = faceCells(diff.size);
  const fullKeys = new Set(cells.map(cell => cell.key));
  const remaining = new Map(cells.map(cell => [cell.key, cell]));
  const directions = new Map();
  const solution = [];

  while (remaining.size) {
    const candidates = [];
    for (const cell of remaining.values()) {
      for (const direction of Object.keys(DIRS)) {
        const ray = rayKeys(cell, direction, diff.size);
        if (ray.some(key => remaining.has(key))) continue;
        const removedAhead = ray.filter(key => fullKeys.has(key) && !remaining.has(key)).length;
        candidates.push({ cell, direction, removedAhead });
      }
    }

    if (!candidates.length) throw new Error(`No candidates for ${teddy.id} level ${level}.`);
    const dependent = candidates.filter(candidate => candidate.removedAhead > 0);
    const useDependency = dependent.length > 0 && solution.length > 0 && rng() < diff.dependency;
    const pool = useDependency ? dependent : candidates;
    let chosen;

    if (useDependency && rng() < diff.dependency) {
      const maxDependency = Math.max(...pool.map(candidate => candidate.removedAhead));
      const strongest = pool.filter(candidate => candidate.removedAhead >= Math.max(1, maxDependency - 1));
      chosen = strongest[Math.floor(rng() * strongest.length)];
    } else {
      chosen = pool[Math.floor(rng() * pool.length)];
    }

    directions.set(chosen.cell.key, chosen.direction);
    solution.push(chosen.cell.key);
    remaining.delete(chosen.cell.key);
  }

  return { size: diff.size, cells, directions, solution, teddyIndex };
}

let totalTiles = 0;
for (let teddyIndex = 0; teddyIndex < TEDDIES.length; teddyIndex += 1) {
  const teddy = TEDDIES[teddyIndex];
  for (let level = 1; level <= DIFFICULTIES.length; level += 1) {
    const puzzle = generate(teddy, teddyIndex, level);
    const active = new Map(puzzle.cells.map(cell => [cell.key, cell]));

    for (const key of puzzle.solution) {
      const cell = active.get(key);
      if (!cell) throw new Error(`${teddy.id} level ${level}: missing solution cell ${key}.`);
      const direction = puzzle.directions.get(key);
      const blockers = rayKeys(cell, direction, puzzle.size).filter(rayKey => active.has(rayKey));
      if (blockers.length) {
        throw new Error(`${teddy.id} level ${level}: ${key} is blocked by ${blockers.join(', ')}.`);
      }
      active.delete(key);
    }

    if (active.size) throw new Error(`${teddy.id} level ${level}: ${active.size} tiles remain.`);
    totalTiles += puzzle.cells.length;
  }
}

console.log(`Validated ${TEDDIES.length * DIFFICULTIES.length} guaranteed-solvable Toxic Teddy arrow puzzles (${totalTiles} tiles).`);
