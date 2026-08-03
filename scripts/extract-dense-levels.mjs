import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const EXPRESSIONS = ['neutral', 'evil_grin', 'gross', 'angry', 'maniacal_laugh'];
const CONFIG = {
  1: {rows: 87, cols: 57, target: 132, seed: 27001, maxPieces: 240},
  2: {rows: 89, cols: 59, target: 140, seed: 27002, maxPieces: 250},
  3: {rows: 91, cols: 61, target: 146, seed: 27003, maxPieces: 260},
  4: {rows: 93, cols: 63, target: 154, seed: 27004, maxPieces: 270},
  5: {rows: 95, cols: 65, target: 160, seed: 27005, maxPieces: 280},
};
const STYLE = {
  button_eye: 'rust', button_core: 'rust', infected_eye: 'slime', infected_core: 'slime',
  stitch: 'stitch', patch: 'patch', muzzle: 'muzzle', nose: 'nose', mouth: 'mouth',
  teeth: 'tooth', slime: 'slime', left_inner_ear: 'rust', right_inner_ear: 'rust',
};
const DELTAS = [['up', -1, 0], ['right', 0, 1], ['down', 1, 0], ['left', 0, -1]];
const DIRS = {
  up: {dr: -1, dc: 0}, right: {dr: 0, dc: 1}, down: {dr: 1, dc: 0}, left: {dr: 0, dc: -1},
};

function rng(seed) {
  let value = seed >>> 0;
  return () => {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

const key = (row, col) => `${row}:${col}`;
function parse(value) {
  const split = value.indexOf(':');
  return [Number(value.slice(0, split)), Number(value.slice(split + 1))];
}
function direction(head, behind) {
  const dr = head[0] - behind[0];
  const dc = head[1] - behind[1];
  if (dr === -1) return 'up';
  if (dr === 1) return 'down';
  if (dc === 1) return 'right';
  return 'left';
}
function normalized(cell, rows, cols) {
  return {
    y: (cell[0] - (rows - 1) / 2) / ((rows - 1) / 2),
    x: (cell[1] - (cols - 1) / 2) / ((cols - 1) / 2),
  };
}
function radial(cell, rows, cols) {
  const {x, y} = normalized(cell, rows, cols);
  return Math.hypot(x, y);
}

function makeMask(rows, cols, expression) {
  const halfRow = (rows - 1) / 2;
  const halfCol = (cols - 1) / 2;
  const mask = new Set();
  const regions = new Map();
  const mouthY = {neutral: .40, evil_grin: .39, gross: .41, angry: .40, maniacal_laugh: .39}[expression];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = (col - halfCol) / halfCol;
      const y = (row - halfRow) / halfRow;

      // Portrait-native authoring. Cells stay square; the silhouette itself is
      // rebuilt on a taller grid instead of being stretched by the SVG.
      const head = (x / .60) ** 2 + ((y - .055) / .66) ** 2 <= 1;
      const leftEar = ((x + .50) / .205) ** 2 + ((y + .525) / .165) ** 2 <= 1;
      const rightEar = ((x - .50) / .205) ** 2 + ((y + .525) / .165) ** 2 <= 1;
      if (!(head || leftEar || rightEar)) continue;
      if (y > .70 && Math.abs(x) > .22) continue;

      let region = 'fur';
      if (leftEar && x < -.36 && y < -.34) region = 'left_ear';
      else if (rightEar && x > .36 && y < -.34) region = 'right_ear';

      const leftInner = ((x + .50) / .102) ** 2 + ((y + .525) / .078) ** 2;
      const rightInner = ((x - .50) / .102) ** 2 + ((y + .525) / .078) ** 2;
      if (leftInner < 1 || rightInner < 1) continue;
      if (leftInner >= 1 && leftInner < 2) region = 'left_inner_ear';
      if (rightInner >= 1 && rightInner < 2) region = 'right_inner_ear';

      const leftEye = ((x + .245) / .142) ** 2 + ((y + .12) / .105) ** 2;
      const rightEye = ((x - .245) / .152) ** 2 + ((y + .12) / .11) ** 2;
      if (leftEye >= .14 && leftEye <= 1.35) region = 'button_eye';
      else if (leftEye < .14) region = 'button_core';
      if (rightEye >= .12 && rightEye <= 1.35) region = 'infected_eye';
      else if (rightEye < .12) region = 'infected_core';
      if (leftEye < .045 || rightEye < .04) continue;

      if (Math.abs(x) < .032 && y > -.63 && y < -.02) region = 'stitch';
      const patch = ((x + .40) / .14) ** 2 + ((y - .10) / .11) ** 2;
      if (patch <= 1 && (row + col) % 7 !== 0) region = 'patch';
      const muzzle = (x / .31) ** 2 + ((y - .16) / .18) ** 2;
      if (muzzle >= .23 && muzzle <= 1.28 && y > -.015) region = 'muzzle';
      const nose = (x / .125) ** 2 + ((y - .035) / .055) ** 2;
      if (nose <= 1.15) region = 'nose';
      if (nose < .14) continue;
      const mouth = (x / .34) ** 2 + ((y - mouthY) / .10) ** 2;
      if (mouth >= .18 && mouth <= 1.35 && y > .26) region = 'mouth';
      if ((expression === 'evil_grin' || expression === 'maniacal_laugh') && mouth < .62 && Math.abs(x) < .30 && y > .30) region = 'teeth';
      if (expression === 'gross' && x > -.01 && x < .20 && y > .24 && y < .68) region = 'slime';
      if (expression === 'angry' && y < -.20) {
        if (x > -.42 && x < -.08 && Math.abs(y - (-.25 - .35 * (x + .25))) < .022) region = 'stitch';
        if (x > .08 && x < .42 && Math.abs(y - (-.25 + .35 * (x - .25))) < .022) region = 'stitch';
      }
      if (((leftEar && x < -.54) || (rightEar && x > .54)) && (row * 3 + col) % 11 < 2) region = 'slime';
      if (expression !== 'neutral' && Math.abs(x) > .46 && y > 0 && y < .46 && (row + col) % 13 === 0) region = 'slime';
      if (Math.abs(x) < .095 && mouth < .10 && y > .32) continue;

      const cellKey = key(row, col);
      mask.add(cellKey);
      regions.set(cellKey, region);
    }
  }
  return {mask, regions};
}

function freeDegree(cellKey, available) {
  const [row, col] = parse(cellKey);
  let count = 0;
  for (const [, dr, dc] of DELTAS) if (available.has(key(row + dr, col + dc))) count += 1;
  return count;
}

function growPath(seedKey, available, regions, target, random) {
  const desired = regions.get(seedKey);
  const pathCells = [parse(seedKey)];
  const used = new Set([seedKey]);
  let previous = null;
  let straight = 0;

  while (pathCells.length < target) {
    const [row, col] = pathCells[pathCells.length - 1];
    const choices = [];
    for (const [name, dr, dc] of DELTAS) {
      const nextKey = key(row + dr, col + dc);
      if (!available.has(nextKey) || used.has(nextKey)) continue;
      let touches = false;
      for (const [, ndr, ndc] of DELTAS) {
        const neighbor = key(row + dr + ndr, col + dc + ndc);
        if (used.has(neighbor) && neighbor !== key(row, col)) {
          touches = true;
          break;
        }
      }
      if (touches) continue;
      const nextRegion = regions.get(nextKey);
      const same = nextRegion === desired ? 0 : (STYLE[nextRegion] === STYLE[desired] ? 1 : 5);
      const turn = previous === null ? 0 : (name === previous ? (straight >= 3 ? 2 : 0) : (straight >= 2 ? 0 : 1));
      choices.push([same, turn, -freeDegree(nextKey, available), random(), name, nextKey]);
    }
    if (!choices.length) break;
    choices.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2] || a[3] - b[3]);
    const [, , , , name, nextKey] = choices[0];
    straight = name === previous ? straight + 1 : 0;
    previous = name;
    used.add(nextKey);
    pathCells.push(parse(nextKey));
  }
  return pathCells;
}

function canExit(cells, exitDirection, occupancy, ownId, rows, cols) {
  const dir = DIRS[exitDirection];
  const [row, col] = cells[0];
  let nextRow = row + dir.dr;
  let nextCol = col + dir.dc;
  while (nextRow >= 0 && nextRow < rows && nextCol >= 0 && nextCol < cols) {
    const blocker = occupancy.get(key(nextRow, nextCol));
    if (blocker && blocker !== ownId) return false;
    nextRow += dir.dr;
    nextCol += dir.dc;
  }
  return true;
}

function orientationOptions(pathCells, rows, cols) {
  const centerRow = (rows - 1) / 2;
  const centerCol = (cols - 1) / 2;
  const forwardDirection = direction(pathCells[0], pathCells[1]);
  const reversed = [...pathCells].reverse();
  const reverseDirection = direction(reversed[0], reversed[1]);
  return [[pathCells, forwardDirection], [reversed, reverseDirection]]
    .map(([cells, exitDirection]) => {
      const head = cells[0];
      const dir = DIRS[exitDirection];
      const outward = ((head[0] - centerRow) / rows) * dir.dr + ((head[1] - centerCol) / cols) * dir.dc;
      return {cells, exitDirection, outward};
    })
    .sort((a, b) => b.outward - a.outward);
}

function verifySolution(pieces, solutionOrder, rows, cols) {
  const byId = new Map(pieces.map(piece => [piece.id, piece]));
  const occupancy = new Map();
  for (const piece of pieces) for (const [row, col] of piece.cells) occupancy.set(key(row, col), piece.id);
  for (const pieceId of solutionOrder) {
    const piece = byId.get(pieceId);
    if (!piece || !canExit(piece.cells, piece.exitDirection, occupancy, piece.id, rows, cols)) return false;
    for (const [row, col] of piece.cells) occupancy.delete(key(row, col));
  }
  return true;
}

function generate(level) {
  const config = CONFIG[level];
  const expression = EXPRESSIONS[level - 1];
  const random = rng(config.seed);
  const {mask, regions} = makeMask(config.rows, config.cols, expression);
  const available = new Set(mask);
  const placedOccupancy = new Map();
  const added = [];

  while (available.size >= 2 && added.length < config.maxPieces) {
    const coverage = (mask.size - available.size) / mask.size;
    if (coverage >= .80 && added.length >= config.target) break;
    const candidates = [...available].sort((a, b) => {
      const radialDifference = radial(parse(a), config.rows, config.cols) - radial(parse(b), config.rows, config.cols);
      return radialDifference || freeDegree(a, available) - freeDegree(b, available) || random() - .5;
    });
    let accepted = null;
    for (const seedKey of candidates.slice(0, Math.min(700, candidates.length))) {
      for (const targetLength of [18, 16, 14, 12, 10, 8, 6, 5, 4, 3, 2]) {
        const pathCells = growPath(seedKey, available, regions, targetLength, random);
        if (pathCells.length < 2) continue;
        for (const option of orientationOptions(pathCells, config.rows, config.cols)) {
          if (!canExit(option.cells, option.exitDirection, placedOccupancy, '__candidate__', config.rows, config.cols)) continue;
          accepted = {seedKey, pathCells, option};
          break;
        }
        if (accepted) break;
      }
      if (accepted) break;
    }
    if (!accepted) break;

    const id = `p${String(added.length + 1).padStart(3, '0')}`;
    const region = regions.get(accepted.seedKey) || 'fur';
    const piece = {
      id,
      region,
      style: STYLE[region] || 'fur',
      cells: accepted.option.cells,
      exitDirection: accepted.option.exitDirection,
      headCell: accepted.option.cells[0],
      tipCell: accepted.option.cells[0],
    };
    for (const cell of accepted.pathCells) {
      const cellKey = key(cell[0], cell[1]);
      available.delete(cellKey);
      placedOccupancy.set(cellKey, id);
    }
    added.push(piece);
  }

  const solutionOrder = [...added].reverse().map(piece => piece.id);
  if (!verifySolution(added, solutionOrder, config.rows, config.cols)) {
    throw new Error(`Level ${level} failed portrait head-ray solver verification`);
  }

  const startingOccupancy = new Map();
  for (const piece of added) for (const [row, col] of piece.cells) startingOccupancy.set(key(row, col), piece.id);
  const startingOpenPieces = added.filter(piece => canExit(piece.cells, piece.exitDirection, startingOccupancy, piece.id, config.rows, config.cols)).length;
  const coverage = (mask.size - available.size) / mask.size;

  return {
    schemaVersion: 12,
    levelVersion: 2,
    compilerVersion: 'toxic-toby-portrait-v2',
    teddy: 'tt01',
    characterName: 'Toxic Toby',
    alternateName: 'Radioactive Ricky',
    level,
    expression,
    // gridSize remains the larger dimension for backward-compatible exit animation.
    gridSize: config.rows,
    gridRows: config.rows,
    gridCols: config.cols,
    cellSize: 24,
    pieceCount: added.length,
    pieces: added,
    solutionOrder,
    strictSequence: false,
    movementRule: 'arrowhead_ray_clear_to_edge',
    decorations: [],
    visualAnchors: ['portrait-native circular ears', 'button eye', 'infected eye', 'forehead seam', 'muzzle and black nose', 'cheek patch', 'expression mouth', 'radioactive slime', 'extended cheeks and chin'],
    quality: {
      coverage: Number(coverage.toFixed(3)),
      verifiedSolvable: true,
      startingOpenPieces,
      startingBlockedPieces: added.length - startingOpenPieces,
      solver: 'reverse_construction_head_ray_portrait_v2',
      geometryMode: 'portrait_native',
      aspectRatio: Number((config.rows / config.cols).toFixed(4)),
    },
    animation: {
      pauseMs: 90,
      baseSlideMs: 420,
      msPerCell: 34,
      minSlideMs: 760,
      maxSlideMs: 1420,
      fadeStart: .78,
      mode: 'head_first_pull_through',
    },
  };
}

const root = process.cwd();
const outputDirectory = path.join(root, 'levels', 'tt01');
await mkdir(outputDirectory, {recursive: true});
const manifest = [];

for (let level = 1; level <= 5; level += 1) {
  const data = generate(level);
  await writeFile(path.join(outputDirectory, `level-${level}.json`), `${JSON.stringify(data)}\n`, 'utf8');
  manifest.push({
    level,
    expression: data.expression,
    gridSize: data.gridSize,
    gridRows: data.gridRows,
    gridCols: data.gridCols,
    pieceCount: data.pieces.length,
    geometryMode: data.quality.geometryMode,
    file: `level-${level}.json`,
    compilerVersion: data.compilerVersion,
    levelVersion: data.levelVersion,
  });
}

await writeFile(
  path.join(outputDirectory, 'compiled-manifest.json'),
  `${JSON.stringify({schemaVersion: 2, teddy: 'tt01', geometryMode: 'portrait_native', levels: manifest}, null, 2)}\n`,
  'utf8',
);

console.log(`Compiled ${manifest.length} portrait-native Toxic Toby levels (${manifest.reduce((sum, item) => sum + item.pieceCount, 0)} paths).`);
