// Clean woven-path generator and animation rules applied before boot.
Object.assign(LEVELS[0], { size: 19, targetPieces: 12, minLength: 8, maxLength: 30 });
Object.assign(LEVELS[1], { size: 23, targetPieces: 18, minLength: 7, maxLength: 26 });
Object.assign(LEVELS[2], { size: 27, targetPieces: 26, minLength: 6, maxLength: 22 });
Object.assign(LEVELS[3], { size: 31, targetPieces: 36, minLength: 5, maxLength: 19 });
Object.assign(LEVELS[4], { size: 35, targetPieces: 48, minLength: 4, maxLength: 17 });

function __directionFromDelta(dr, dc) {
  if (dr === -1 && dc === 0) return 'up';
  if (dr === 1 && dc === 0) return 'down';
  if (dr === 0 && dc === -1) return 'left';
  if (dr === 0 && dc === 1) return 'right';
  return null;
}

function __endpointOptions(piece) {
  if (piece.cells.length === 1) return DIR_NAMES.map(dir => ({ dir, reverse: false }));
  const first = piece.cells[0];
  const second = piece.cells[1];
  const last = piece.cells[piece.cells.length - 1];
  const beforeLast = piece.cells[piece.cells.length - 2];
  const firstDir = __directionFromDelta(first.row - second.row, first.col - second.col);
  const lastDir = __directionFromDelta(last.row - beforeLast.row, last.col - beforeLast.col);
  const options = [];
  if (firstDir) options.push({ dir: firstDir, reverse: true });
  if (lastDir) options.push({ dir: lastDir, reverse: false });
  return options;
}

growPath = function cleanGrowPath(seed, desired, unassigned, mask, size, rng) {
  const path = [seed];
  unassigned.delete(key(seed.row, seed.col));
  let straightRun = 0;

  while (path.length < desired) {
    const current = path[path.length - 1];
    const previous = path.length > 1 ? path[path.length - 2] : null;
    const previousPrevious = path.length > 2 ? path[path.length - 3] : null;

    const options = neighbors(current, mask, unassigned).filter(candidate => {
      for (let index = 0; index < path.length - 1; index += 1) {
        const existing = path[index];
        const distance = Math.abs(existing.row - candidate.row) + Math.abs(existing.col - candidate.col);
        if (distance <= 1) return false;
      }
      return true;
    });

    if (!options.length) break;

    const scored = options.map(candidate => {
      const futureDegree = neighbors(candidate, mask, unassigned).length;
      let isolatedNeighbors = 0;
      for (const adjacent of neighbors(candidate, mask, unassigned)) {
        const remaining = neighbors(adjacent, mask, unassigned)
          .filter(other => other.row !== candidate.row || other.col !== candidate.col);
        if (!remaining.length) isolatedNeighbors += 1;
      }

      let shapeScore = 0;
      if (previous) {
        const incoming = [current.row - previous.row, current.col - previous.col];
        const outgoing = [candidate.row - current.row, candidate.col - current.col];
        const turns = incoming[0] !== outgoing[0] || incoming[1] !== outgoing[1];
        shapeScore += turns ? (straightRun >= 4 ? -0.45 : 1.45) : -1.35;
      }
      if (previousPrevious) {
        const a = [previous.row - previousPrevious.row, previous.col - previousPrevious.col];
        const b = [current.row - previous.row, current.col - previous.col];
        const c = [candidate.row - current.row, candidate.col - current.col];
        if ((a[0] !== b[0] || a[1] !== b[1]) && (b[0] !== c[0] || b[1] !== c[1])) shapeScore += 3.1;
      }

      const edge = Math.min(candidate.row, candidate.col, size - 1 - candidate.row, size - 1 - candidate.col);
      return {
        cell: candidate,
        score: futureDegree + isolatedNeighbors * 5.5 + shapeScore + edge * 0.012 + rng() * 0.22
      };
    });

    scored.sort((a, b) => a.score - b.score);
    const chosen = scored[0].cell;

    if (previous) {
      const incoming = [current.row - previous.row, current.col - previous.col];
      const outgoing = [chosen.row - current.row, chosen.col - current.col];
      straightRun = incoming[0] === outgoing[0] && incoming[1] === outgoing[1] ? straightRun + 1 : 0;
    }

    path.push(chosen);
    unassigned.delete(key(chosen.row, chosen.col));
  }

  return path;
};

assignSolvableDirections = function assignEndpointDirections(pieces, size, rng) {
  const occupancy = new Map();
  pieces.forEach((piece, index) => piece.cells.forEach(cell => occupancy.set(key(cell.row, cell.col), index)));
  const active = new Set(pieces.map((_, index) => index));
  const solution = [];

  while (active.size) {
    const candidates = [];
    for (const pieceIndex of active) {
      const piece = pieces[pieceIndex];
      for (const option of __endpointOptions(piece)) {
        if (!canExitStatic(piece, pieceIndex, option.dir, size, occupancy, active)) continue;
        const tip = option.reverse ? piece.cells[0] : piece.cells[piece.cells.length - 1];
        const edgeDistance = option.dir === 'up' ? tip.row
          : option.dir === 'down' ? size - 1 - tip.row
            : option.dir === 'left' ? tip.col
              : size - 1 - tip.col;
        candidates.push({ pieceIndex, dir: option.dir, reverse: option.reverse, edgeDistance });
      }
    }

    if (!candidates.length) return null;
    candidates.sort((a, b) => a.edgeDistance - b.edgeDistance || a.pieceIndex - b.pieceIndex);
    const pool = candidates.slice(0, Math.max(1, Math.ceil(candidates.length * 0.22)));
    const chosen = pool[Math.floor(rng() * pool.length)];
    solution.push(chosen);
    active.delete(chosen.pieceIndex);
  }

  return solution;
};

function __hasCleanGeometry(pieces) {
  const occupied = new Set();
  for (const piece of pieces) {
    if (piece.cells.length < 2) return false;
    for (const cell of piece.cells) {
      const value = key(cell.row, cell.col);
      if (occupied.has(value)) return false;
      occupied.add(value);
    }

    const endpoint = piece.cells[piece.cells.length - 1];
    const before = piece.cells[piece.cells.length - 2];
    const expected = __directionFromDelta(endpoint.row - before.row, endpoint.col - before.col);
    if (expected !== piece.dir) return false;

    for (let first = 0; first < piece.cells.length; first += 1) {
      for (let second = first + 2; second < piece.cells.length; second += 1) {
        const a = piece.cells[first];
        const b = piece.cells[second];
        if (Math.abs(a.row - b.row) + Math.abs(a.col - b.col) <= 1) return false;
      }
    }
  }
  return true;
}

generateVerifiedPuzzle = function generateCleanVerifiedPuzzle(teddy, level, config) {
  const baseSeed = hashString(`${teddy.id}:${level}:clean-woven-v7`);

  for (let attempt = 0; attempt < 500; attempt += 1) {
    const rng = mulberry32(baseSeed + attempt * 2027);
    const mask = makeTeddyMask(config.size);
    const pieces = partitionMask(mask, config, rng);
    if (pieces.length > config.targetPieces * 1.65) continue;

    const solution = assignSolvableDirections(pieces, config.size, rng);
    if (!solution) continue;

    solution.forEach(({ pieceIndex, dir, reverse }) => {
      if (reverse) pieces[pieceIndex].cells.reverse();
      pieces[pieceIndex].dir = dir;
    });

    if (!__hasCleanGeometry(pieces)) continue;
    return makePuzzle(config.size, mask, pieces, solution.map(item => pieces[item.pieceIndex].id));
  }

  return buildCleanFallback(config.size);
};

function buildCleanFallback(size) {
  const mask = makeTeddyMask(size);
  const pieces = [];
  let id = 1;

  for (let row = 0; row < size; row += 2) {
    const run = [];
    for (let col = 0; col < size; col += 1) {
      if (mask.has(key(row, col))) run.push({ row, col });
    }
    for (let start = 0; start < run.length; start += 10) {
      const cells = run.slice(start, start + 10);
      if (cells.length < 2) continue;
      const reverse = pieces.length % 2 === 1;
      if (reverse) cells.reverse();
      pieces.push({ id: `fallback-${id++}`, cells, dir: reverse ? 'left' : 'right', removed: false, element: null });
    }
  }
  return makePuzzle(size, mask, pieces, pieces.map(piece => piece.id));
}

renderBoard = function renderCleanBoard() {
  const sizePx = state.puzzle.size * CELL;
  els.board.setAttribute('viewBox', `0 0 ${sizePx} ${sizePx}`);
  els.previewLayer.setAttribute('viewBox', `0 0 ${sizePx} ${sizePx}`);
  els.pieceLayer.innerHTML = '';
  els.previewLayer.innerHTML = '';
  els.pieceLayer.append(createDefs());

  state.puzzle.pieces.forEach(piece => {
    const group = document.createElementNS(NS, 'g');
    group.classList.add('path-piece');
    group.dataset.id = piece.id;

    const points = piece.cells
      .map(cell => `${cell.col * CELL + CELL / 2},${cell.row * CELL + CELL / 2}`)
      .join(' ');

    const line = document.createElementNS(NS, 'polyline');
    line.setAttribute('points', points);
    line.setAttribute('class', 'piece-line');
    line.setAttribute('marker-end', 'url(#pieceArrow)');

    const hit = document.createElementNS(NS, 'polyline');
    hit.setAttribute('points', points);
    hit.setAttribute('class', 'piece-hit');

    group.append(line, hit);
    group.addEventListener('pointerdown', event => beginLongPress(event, piece));
    group.addEventListener('pointerup', endLongPress);
    group.addEventListener('pointercancel', endLongPress);
    group.addEventListener('pointerleave', cancelLongPress);
    group.addEventListener('click', event => {
      event.preventDefault();
      if (state.longPressTriggered) {
        state.longPressTriggered = false;
        return;
      }
      attemptMove(piece);
    });

    piece.element = group;
    els.pieceLayer.append(group);
  });
};

removePiece = function removePieceSlowly(piece) {
  state.transitionLock = true;
  const dir = DIRS[piece.dir];
  const distance = state.puzzle.size * CELL * 1.18;
  piece.element?.style.setProperty('--exit-x', `${dir.dx * distance}px`);
  piece.element?.style.setProperty('--exit-y', `${dir.dy * distance}px`);
  piece.element?.classList.add('exiting');
  setStatus('Line escaping · watch the lane open');

  setTimeout(() => {
    piece.removed = true;
    piece.element?.classList.add('removed');
    state.puzzle.active.delete(piece.id);
    state.puzzle.cleared += 1;
    state.transitionLock = false;
    updateProgress();
    if (!state.puzzle.active.size) completeLevel();
  }, 860);
};
