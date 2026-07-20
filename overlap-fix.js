// Strict non-overlap rules applied before boot.
const __originalGrowPath = growPath;

growPath = function strictGrowPath(seed, desired, unassigned, mask, size, rng) {
  const path = [seed];
  unassigned.delete(key(seed.row, seed.col));

  while (path.length < desired) {
    const current = path[path.length - 1];
    const previous = path.length > 1 ? path[path.length - 2] : null;
    const options = neighbors(current, mask, unassigned).filter(candidate => {
      // A path may touch only its immediately previous cell. This prevents
      // loops, doubled-back sections and self-overlapping arrowheads.
      for (let index = 0; index < path.length - 1; index += 1) {
        const existing = path[index];
        const manhattan = Math.abs(existing.row - candidate.row) + Math.abs(existing.col - candidate.col);
        if (manhattan <= 1) return false;
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

      let turnBonus = 0;
      if (previous) {
        const firstVector = [current.row - previous.row, current.col - previous.col];
        const secondVector = [candidate.row - current.row, candidate.col - current.col];
        if (firstVector[0] !== secondVector[0] || firstVector[1] !== secondVector[1]) turnBonus = -0.34;
      }

      const edge = Math.min(candidate.row, candidate.col, size - 1 - candidate.row, size - 1 - candidate.col);
      return {
        cell: candidate,
        score: futureDegree + isolatedNeighbors * 5 + turnBonus + edge * 0.018 + rng() * 0.28
      };
    });

    scored.sort((a, b) => a.score - b.score);
    const chosen = scored[0].cell;
    path.push(chosen);
    unassigned.delete(key(chosen.row, chosen.col));
  }

  return path;
};

function __orientation(a, b, c) {
  const value = (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
  if (Math.abs(value) < 1e-8) return 0;
  return value > 0 ? 1 : 2;
}

function __onSegment(a, b, c) {
  return b.x <= Math.max(a.x, c.x) + 1e-8 && b.x + 1e-8 >= Math.min(a.x, c.x)
    && b.y <= Math.max(a.y, c.y) + 1e-8 && b.y + 1e-8 >= Math.min(a.y, c.y);
}

function __segmentsIntersect(first, second) {
  const a = first.a;
  const b = first.b;
  const c = second.a;
  const d = second.b;
  const o1 = __orientation(a, b, c);
  const o2 = __orientation(a, b, d);
  const o3 = __orientation(c, d, a);
  const o4 = __orientation(c, d, b);

  if (o1 !== o2 && o3 !== o4) return true;
  if (o1 === 0 && __onSegment(a, c, b)) return true;
  if (o2 === 0 && __onSegment(a, d, b)) return true;
  if (o3 === 0 && __onSegment(c, a, d)) return true;
  if (o4 === 0 && __onSegment(c, b, d)) return true;
  return false;
}

function __samePoint(a, b) {
  return Math.abs(a.x - b.x) < 1e-8 && Math.abs(a.y - b.y) < 1e-8;
}

function __buildSegments(piece, pieceIndex) {
  const segments = [];
  for (let index = 1; index < piece.cells.length; index += 1) {
    const previous = piece.cells[index - 1];
    const current = piece.cells[index];
    segments.push({
      pieceIndex,
      segmentIndex: index - 1,
      kind: 'path',
      a: { x: previous.col, y: previous.row },
      b: { x: current.col, y: current.row }
    });
  }

  const tip = extremeCell(piece.cells, piece.dir);
  const direction = DIRS[piece.dir];
  segments.push({
    pieceIndex,
    segmentIndex: piece.cells.length,
    kind: 'arrow',
    a: { x: tip.col, y: tip.row },
    b: { x: tip.col + direction.dc * 0.28, y: tip.row + direction.dr * 0.28 }
  });
  return segments;
}

function __hasNoOverlaps(pieces) {
  const occupied = new Set();
  for (const piece of pieces) {
    for (const cell of piece.cells) {
      const value = key(cell.row, cell.col);
      if (occupied.has(value)) return false;
      occupied.add(value);
    }
  }

  const segments = pieces.flatMap((piece, index) => __buildSegments(piece, index));
  for (let firstIndex = 0; firstIndex < segments.length; firstIndex += 1) {
    const first = segments[firstIndex];
    for (let secondIndex = firstIndex + 1; secondIndex < segments.length; secondIndex += 1) {
      const second = segments[secondIndex];

      if (first.pieceIndex === second.pieceIndex) {
        const adjacentPathSegments = first.kind === 'path' && second.kind === 'path'
          && Math.abs(first.segmentIndex - second.segmentIndex) === 1;
        const connectedArrow = (first.kind === 'arrow' || second.kind === 'arrow')
          && (__samePoint(first.a, second.a) || __samePoint(first.a, second.b)
            || __samePoint(first.b, second.a) || __samePoint(first.b, second.b));
        if (adjacentPathSegments || connectedArrow) continue;
      }

      if (__segmentsIntersect(first, second)) return false;
    }
  }
  return true;
}

generateVerifiedPuzzle = function generateStrictVerifiedPuzzle(teddy, level, config) {
  const baseSeed = hashString(`${teddy.id}:${level}:woven-v6-no-overlap`);

  for (let attempt = 0; attempt < 240; attempt += 1) {
    const rng = mulberry32(baseSeed + attempt * 2027);
    const mask = makeTeddyMask(config.size);
    const pieces = partitionMask(mask, config, rng);
    const solution = assignSolvableDirections(pieces, config.size, rng);
    if (!solution) continue;

    solution.forEach(({ pieceIndex, dir }) => {
      pieces[pieceIndex].dir = dir;
    });

    if (!__hasNoOverlaps(pieces)) continue;
    return makePuzzle(config.size, mask, pieces, solution.map(item => pieces[item.pieceIndex].id));
  }

  // The fallback uses separated horizontal runs and therefore cannot cross.
  return buildFallbackPuzzle(config.size);
};
