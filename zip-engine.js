/*
 * Arrow Escape 1.0.6 mechanics adapted for the Toxic Teddies web runtime:
 * - every path is normalized head-first
 * - endpoint/direction assignments are solved before rendering
 * - successful arrows are pulled through their exit track like a rope
 * - the caret is drawn at the live head instead of using an SVG marker
 */
(() => {
  const originalLoadLevel = loadLevel;

  function directionFromVector(dr, dc) {
    if (dr === -1 && dc === 0) return 'up';
    if (dr === 1 && dc === 0) return 'down';
    if (dr === 0 && dc === -1) return 'left';
    if (dr === 0 && dc === 1) return 'right';
    return null;
  }

  function edgeDistance(cell, direction, size) {
    if (direction === 'up') return cell[0];
    if (direction === 'down') return size - 1 - cell[0];
    if (direction === 'left') return cell[1];
    return size - 1 - cell[1];
  }

  function candidateKey(candidate) {
    return `${candidate.head[0]}:${candidate.head[1]}:${candidate.direction}`;
  }

  function buildCandidates(piece) {
    const cells = piece.cells;
    if (!cells || cells.length < 2) return [];
    const size = state.data.gridSize;
    const candidates = [];
    const add = (ordered, direction, rank) => {
      if (!direction) return;
      const head = ordered[0];
      const key = `${head[0]}:${head[1]}:${direction}`;
      if (candidates.some(candidate => candidate.key === key)) return;
      candidates.push({ key, ordered, head, direction, rank, edge: edgeDistance(head, direction, size) });
    };

    const first = cells[0];
    const second = cells[1];
    const last = cells[cells.length - 1];
    const beforeLast = cells[cells.length - 2];
    const firstNatural = directionFromVector(first[0] - second[0], first[1] - second[1]);
    const lastNatural = directionFromVector(last[0] - beforeLast[0], last[1] - beforeLast[1]);

    add(cells.slice(), firstNatural, firstNatural === piece.exitDirection ? 0 : 2);
    add(cells.slice().reverse(), lastNatural, lastNatural === piece.exitDirection ? 0 : 2);

    const authorDirection = piece.exitDirection;
    if (authorDirection) {
      const firstEdge = edgeDistance(first, authorDirection, size);
      const lastEdge = edgeDistance(last, authorDirection, size);
      add(firstEdge <= lastEdge ? cells.slice() : cells.slice().reverse(), authorDirection, 1);
      add(firstEdge > lastEdge ? cells.slice() : cells.slice().reverse(), authorDirection, 3);
    }

    candidates.sort((a, b) => a.rank - b.rank || a.edge - b.edge || candidateKey(a).localeCompare(candidateKey(b)));
    return candidates;
  }

  function laneClearCandidate(piece, candidate, active) {
    const dir = DIRS[candidate.direction];
    let row = candidate.head[0] + dir.dr;
    let col = candidate.head[1] + dir.dc;
    while (row >= 0 && row < state.data.gridSize && col >= 0 && col < state.data.gridSize) {
      const owner = state.occupancy.get(`${row}:${col}`);
      if (owner && owner !== piece.id && active.has(owner)) return false;
      row += dir.dr;
      col += dir.dc;
    }
    return true;
  }

  function solveEndpointAssignments() {
    const pieces = state.pieces;
    const originalOrder = new Map((state.data.solutionOrder || []).map((id, index) => [id, index]));
    const candidatesById = new Map(pieces.map(piece => [piece.id, buildCandidates(piece)]));
    const idToIndex = new Map(pieces.map((piece, index) => [piece.id, index]));
    const fullMask = (1n << BigInt(pieces.length)) - 1n;
    const memo = new Set();
    const moves = [];
    let statesVisited = 0;
    const maxStates = 80000;

    function activeFromMask(mask) {
      const active = new Set();
      for (let index = 0; index < pieces.length; index += 1) {
        if (mask & (1n << BigInt(index))) active.add(pieces[index].id);
      }
      return active;
    }

    function search(mask) {
      if (mask === 0n) return true;
      if (statesVisited++ > maxStates) return false;
      const signature = mask.toString();
      if (memo.has(signature)) return false;
      memo.add(signature);
      const active = activeFromMask(mask);
      const open = [];

      for (const piece of pieces) {
        const index = idToIndex.get(piece.id);
        if (!(mask & (1n << BigInt(index)))) continue;
        const candidates = candidatesById.get(piece.id) || [];
        for (const candidate of candidates) {
          if (laneClearCandidate(piece, candidate, active)) {
            open.push({
              piece,
              index,
              candidate,
              solutionRank: originalOrder.has(piece.id) ? originalOrder.get(piece.id) : 9999,
            });
          }
        }
      }

      open.sort((a, b) =>
        a.solutionRank - b.solutionRank ||
        a.candidate.rank - b.candidate.rank ||
        a.candidate.edge - b.candidate.edge ||
        b.piece.cells.length - a.piece.cells.length
      );

      const frontier = open.slice(0, Math.min(open.length, 18));
      for (const move of frontier) {
        moves.push(move);
        const nextMask = mask & ~(1n << BigInt(move.index));
        if (search(nextMask)) return true;
        moves.pop();
      }
      return false;
    }

    const solved = search(fullMask);
    const assignments = new Map();
    if (solved) {
      for (const move of moves) assignments.set(move.piece.id, move.candidate);
      state.data.solutionOrder = moves.map(move => move.piece.id);
    }

    for (const piece of pieces) {
      const candidate = assignments.get(piece.id) || buildCandidates(piece)[0];
      if (!candidate) continue;
      piece._ropeCells = candidate.ordered;
      piece._headCell = candidate.head;
      piece._effectiveDirection = candidate.direction;
      piece.exitDirection = candidate.direction;
    }
  }

  function prepareCurrentBoard() {
    if (!state.data || !state.pieces.length) return false;
    const key = `${state.data.teddy || teddy().id}:${state.data.level || state.level}:${state.pieces.length}`;
    if (state._zipPreparedKey === key) return true;
    solveEndpointAssignments();
    state._zipPreparedKey = key;
    renderBoard();
    updateProgress();
    return true;
  }

  loadLevel = async function zipLoadLevel() {
    state._zipPreparedKey = null;
    await originalLoadLevel();
    prepareCurrentBoard();
  };

  function centersForPiece(piece, unit) {
    const cells = piece._ropeCells || piece.cells;
    return cells.map(([row, col]) => ({ x: col * unit + unit / 2, y: row * unit + unit / 2 }));
  }

  function pointsToPath(points) {
    if (!points.length) return '';
    return `M ${points[0].x} ${points[0].y}` + points.slice(1).map(point => ` L ${point.x} ${point.y}`).join('');
  }

  function caretPath(head, direction, unit) {
    const dir = DIRS[direction];
    const tip = { x: head.x + dir.dx * unit * 0.31, y: head.y + dir.dy * unit * 0.31 };
    const depth = unit * 0.25;
    const halfWidth = unit * 0.17;
    const base = { x: tip.x - dir.dx * depth, y: tip.y - dir.dy * depth };
    const px = -dir.dy;
    const py = dir.dx;
    return `M ${base.x + px * halfWidth} ${base.y + py * halfWidth} L ${tip.x} ${tip.y} L ${base.x - px * halfWidth} ${base.y - py * halfWidth}`;
  }

  renderBoard = function zipRenderBoard() {
    const unit = state.data.cellSize || 36;
    const sizePx = state.data.gridSize * unit;
    els.board.setAttribute('viewBox', `0 0 ${sizePx} ${sizePx}`);
    els.previewLayer.setAttribute('viewBox', `0 0 ${sizePx} ${sizePx}`);
    els.pieceLayer.innerHTML = '';
    els.previewLayer.innerHTML = '';

    const decorationLayer = createSvg('g', { class: 'compiled-decoration-layer', 'pointer-events': 'none' });
    renderDecorations(decorationLayer, unit);
    els.pieceLayer.append(decorationLayer);
    const playable = createSvg('g', { class: 'zip-piece-layer' });
    els.pieceLayer.append(playable);

    for (const piece of state.pieces) {
      const group = createSvg('g', { class: `path-piece zip-path style-${piece.style || 'fur'}`, 'data-id': piece.id });
      const points = centersForPiece(piece, unit);
      const body = createSvg('path', { d: pointsToPath(points), class: 'piece-line rope-body' });
      const caret = createSvg('path', { d: caretPath(points[0], piece._effectiveDirection || piece.exitDirection, unit), class: 'piece-arrow rope-caret' });
      const hit = createSvg('path', { d: pointsToPath(points), class: 'piece-hit rope-hit' });
      group.append(body, caret, hit);
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
      piece._bodyElement = body;
      piece._caretElement = caret;
      piece._hitElement = hit;
      piece._stationaryPoints = points;
      playable.append(group);
    }
  };

  blockersAhead = function zipBlockersAhead(piece) {
    const blockers = [];
    const seen = new Set();
    const direction = piece._effectiveDirection || piece.exitDirection;
    const dir = DIRS[direction];
    const head = piece._headCell || (piece._ropeCells || piece.cells)[0];
    let row = head[0] + dir.dr;
    let col = head[1] + dir.dc;
    while (row >= 0 && row < state.data.gridSize && col >= 0 && col < state.data.gridSize) {
      const owner = state.occupancy.get(`${row}:${col}`);
      if (owner && owner !== piece.id && state.active.has(owner) && !seen.has(owner)) {
        seen.add(owner);
        blockers.push(state.byId.get(owner));
      }
      row += dir.dr;
      col += dir.dc;
    }
    return blockers;
  };

  drawPreviewRay = function zipDrawPreviewRay(piece, blocked) {
    const unit = state.data.cellSize || 36;
    const direction = piece._effectiveDirection || piece.exitDirection;
    const dir = DIRS[direction];
    const headCell = piece._headCell || (piece._ropeCells || piece.cells)[0];
    const x1 = headCell[1] * unit + unit / 2;
    const y1 = headCell[0] * unit + unit / 2;
    const x2 = dir.dc > 0 ? state.data.gridSize * unit + unit : dir.dc < 0 ? -unit : x1;
    const y2 = dir.dr > 0 ? state.data.gridSize * unit + unit : dir.dr < 0 ? -unit : y1;
    els.previewLayer.append(createSvg('line', { x1, y1, x2, y2, class: `preview-ray${blocked ? ' blocked' : ''}` }));
  };

  function cumulativeDistances(points) {
    const distances = [0];
    for (let index = 1; index < points.length; index += 1) {
      const dx = points[index].x - points[index - 1].x;
      const dy = points[index].y - points[index - 1].y;
      distances.push(distances[index - 1] + Math.hypot(dx, dy));
    }
    return distances;
  }

  function interpolate(points, distances, distance) {
    if (distance <= 0) return { ...points[0] };
    const last = distances.length - 1;
    if (distance >= distances[last]) return { ...points[last] };
    let low = 0;
    let high = last;
    while (low + 1 < high) {
      const middle = (low + high) >> 1;
      if (distances[middle] <= distance) low = middle;
      else high = middle;
    }
    const span = distances[high] - distances[low] || 1;
    const ratio = (distance - distances[low]) / span;
    return {
      x: points[low].x + (points[high].x - points[low].x) * ratio,
      y: points[low].y + (points[high].y - points[low].y) * ratio,
    };
  }

  function sliceTrack(points, distances, from, to) {
    if (from >= to) return [interpolate(points, distances, from)];
    const result = [interpolate(points, distances, from)];
    for (let index = 0; index < distances.length; index += 1) {
      if (distances[index] > from && distances[index] < to) result.push(points[index]);
    }
    result.push(interpolate(points, distances, to));
    return result;
  }

  function buildExitTrack(piece, unit) {
    const body = centersForPiece(piece, unit);
    const direction = piece._effectiveDirection || piece.exitDirection;
    const dir = DIRS[direction];
    const head = body[0];
    const extensionCount = state.data.gridSize + 4;
    const track = [];
    for (let step = extensionCount; step >= 1; step -= 1) {
      track.push({ x: head.x + dir.dx * step * unit, y: head.y + dir.dy * step * unit });
    }
    track.push(...body);
    const distances = cumulativeDistances(track);
    return {
      track,
      distances,
      headDistance: distances[extensionCount],
      tailDistance: distances[track.length - 1],
      direction,
    };
  }

  function easeInOutCubic(value) {
    return value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
  }

  removePiece = function zipRemovePiece(piece) {
    state.transitionLock = true;
    const unit = state.data.cellSize || 36;
    const trackData = buildExitTrack(piece, unit);
    const animation = state.data.animation || {};
    const pauseMs = Number(animation.pauseMs ?? 100);
    const bodyLength = (piece._ropeCells || piece.cells).length;
    const durationMs = Math.max(760, Math.min(2300, Number(animation.baseSlideMs ?? 430) + bodyLength * Number(animation.msPerCell ?? 48)));
    piece.element?.classList.add('escape-armed');
    setStatus('Arrowhead released…');

    setTimeout(() => {
      const start = performance.now();
      piece.element?.classList.add('rope-exiting');
      setStatus('The head is pulling the path out');

      const frame = now => {
        const raw = Math.min(1, (now - start) / durationMs);
        const progress = easeInOutCubic(raw);
        const traveled = progress * trackData.tailDistance;
        const from = Math.max(0, trackData.headDistance - traveled);
        const to = Math.max(0, trackData.tailDistance - traveled);
        const visible = sliceTrack(trackData.track, trackData.distances, from, to);
        piece._bodyElement?.setAttribute('d', pointsToPath(visible));
        piece._hitElement?.setAttribute('d', pointsToPath(visible));
        if (visible.length) {
          piece._caretElement?.setAttribute('d', caretPath(visible[0], trackData.direction, unit));
        }
        const fadeStart = Number(animation.fadeStart ?? 0.70);
        if (raw > fadeStart && piece.element) {
          piece.element.style.opacity = String(1 - ((raw - fadeStart) / (1 - fadeStart)) * 0.88);
        }
        if (raw < 1) {
          requestAnimationFrame(frame);
          return;
        }
        piece.removed = true;
        piece.element?.classList.add('removed');
        state.active.delete(piece.id);
        state.transitionLock = false;
        updateProgress();
        if (!state.active.size) completeLevel();
      };
      requestAnimationFrame(frame);
    }, pauseMs);
  };

  let prepareAttempts = 0;
  const prepareTimer = setInterval(() => {
    prepareAttempts += 1;
    if (prepareCurrentBoard() || prepareAttempts > 120) clearInterval(prepareTimer);
  }, 50);

  loseLife = function zipLoseLife(piece, blocker) {
    state.lives = Math.max(0, state.lives - 1);
    renderLives();
    const unit = state.data.cellSize || 36;
    const direction = piece._effectiveDirection || piece.exitDirection;
    const dir = DIRS[direction];
    piece.element?.classList.add('blocked-bump');
    blocker.element?.classList.add('blocking');
    piece.element?.animate([
      { transform: 'translate(0,0)' },
      { transform: `translate(${dir.dx * unit * 0.20}px,${dir.dy * unit * 0.20}px)`, offset: 0.45 },
      { transform: 'translate(0,0)' },
    ], { duration: 330, easing: 'cubic-bezier(.2,.8,.2,1)' });
    setStatus('Blocked · the head bounced back');
    navigator.vibrate?.([25, 18, 30]);
    setTimeout(() => {
      piece.element?.classList.remove('blocked-bump');
      blocker.element?.classList.remove('blocking');
    }, 380);
    if (state.lives === 0) setTimeout(() => els.gameOverModal.classList.remove('hidden'), 260);
  };
})();
