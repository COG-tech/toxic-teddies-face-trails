/* Full-lane collision interaction v7.
 * Mirrors the uploaded reference solver: a path may leave only when every cell
 * in the moving piece has an unobstructed ray to the board edge in the arrow's
 * direction. Blocked taps cost one toxic drop; clear taps use the rope-pull
 * animation from the reference engine.
 */
(() => {
  const baseBindEvents = bindEvents;
  const baseLoseLife = loseLife;
  let installed = false;

  function boardContains(clientX, clientY) {
    const rect = els.board.getBoundingClientRect();
    return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
  }

  function screenPoint(point) {
    const matrix = els.board.getScreenCTM?.();
    if (!matrix) return null;
    if (typeof DOMPoint === 'function') return new DOMPoint(point.x, point.y).matrixTransform(matrix);
    return {
      x: matrix.a * point.x + matrix.c * point.y + matrix.e,
      y: matrix.b * point.x + matrix.d * point.y + matrix.f,
    };
  }

  function distanceToSegment(point, start, end) {
    const vx = end.x - start.x;
    const vy = end.y - start.y;
    const lengthSquared = vx * vx + vy * vy;
    if (!lengthSquared) return Math.hypot(point.x - start.x, point.y - start.y);
    const projection = Math.max(0, Math.min(1,
      ((point.x - start.x) * vx + (point.y - start.y) * vy) / lengthSquared,
    ));
    const x = start.x + projection * vx;
    const y = start.y + projection * vy;
    return Math.hypot(point.x - x, point.y - y);
  }

  function nearestPiece(clientX, clientY) {
    if (!boardContains(clientX, clientY)) return null;
    const click = { x: clientX, y: clientY };
    let bestPiece = null;
    let bestDistance = Infinity;
    for (const piece of state.pieces) {
      if (piece.removed || !state.active.has(piece.id)) continue;
      const sourcePoints = piece._stationaryPoints;
      if (!sourcePoints || sourcePoints.length < 2) continue;
      const points = sourcePoints.map(screenPoint).filter(Boolean);
      if (points.length < 2) continue;
      for (let index = 1; index < points.length; index += 1) {
        const distance = distanceToSegment(click, points[index - 1], points[index]);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestPiece = piece;
        }
      }
    }
    return bestDistance <= 32 ? bestPiece : null;
  }

  function wholePieceBlockers(piece) {
    if (!piece || piece.removed) return [];
    const direction = DIRS[piece.exitDirection];
    if (!direction) return [];
    const blockers = [];
    const seen = new Set();
    const size = state.data.gridSize;

    for (const [row, col] of piece.cells) {
      let nextRow = row + direction.dr;
      let nextCol = col + direction.dc;
      while (nextRow >= 0 && nextRow < size && nextCol >= 0 && nextCol < size) {
        const blockerId = state.occupancy.get(`${nextRow}:${nextCol}`);
        if (blockerId && blockerId !== piece.id && state.active.has(blockerId) && !seen.has(blockerId)) {
          seen.add(blockerId);
          const blocker = state.byId.get(blockerId);
          if (blocker) blockers.push(blocker);
        }
        nextRow += direction.dr;
        nextCol += direction.dc;
      }
    }
    return blockers;
  }

  blockersAhead = wholePieceBlockers;

  attemptMove = function limitedAttemptMove(piece) {
    if (state.transitionLock || !piece || piece.removed || !state.active.has(piece.id)) return;
    clearPreview();
    const blockers = wholePieceBlockers(piece);
    if (blockers.length) {
      setStatus(`BLOCKED · ${blockers.length} LINE${blockers.length === 1 ? '' : 'S'} IN THE EXIT LANE`);
      baseLoseLife(piece, blockers[0]);
      return;
    }
    setStatus('CLEAR EXIT · ARROW RELEASED');
    removePiece(piece);
  };

  function installInteractionLayer() {
    if (installed) return;
    installed = true;
    els.board.style.pointerEvents = 'auto';
    els.board.style.touchAction = 'manipulation';

    document.addEventListener('click', event => {
      if (!boardContains(event.clientX, event.clientY)) return;
      const piece = nearestPiece(event.clientX, event.clientY);
      if (!piece) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      attemptMove(piece);
    }, true);

    window.__toxicRulesTest = () => {
      const open = [];
      const blocked = [];
      for (const piece of state.pieces) {
        if (piece.removed || !state.active.has(piece.id)) continue;
        const blockers = wholePieceBlockers(piece);
        (blockers.length ? blocked : open).push(piece.id);
      }
      return {
        rule: 'whole_piece_clear_lane_to_edge',
        active: state.active.size,
        openCount: open.length,
        blockedCount: blocked.length,
        open: open.slice(0, 12),
        blocked: blocked.slice(0, 12),
      };
    };
  }

  bindEvents = function reliableBindEvents() {
    baseBindEvents();
    installInteractionLayer();
  };
})();
