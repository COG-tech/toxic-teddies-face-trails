/* Arrow Escape rule engine v8.
 * The uploaded reference checks the arrowhead only: start at path[0], raycast
 * in the arrow direction, and block the move when that ray touches any active
 * arrow body. Blocked taps cost one of three toxic drops.
 */
(() => {
  const baseBindEvents = bindEvents;
  const baseLoseLife = loseLife;
  const baseRemovePiece = removePiece;
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

  function arrowheadBlockers(piece) {
    if (!piece || piece.removed || !state.active.has(piece.id)) return [];
    const direction = DIRS[piece.exitDirection];
    if (!direction) return [];
    const head = piece.cells[0];
    let row = head[0] + direction.dr;
    let col = head[1] + direction.dc;
    const size = state.data.gridSize;
    const blockers = [];
    const seen = new Set();

    while (row >= 0 && row < size && col >= 0 && col < size) {
      const blockerId = state.occupancy.get(`${row}:${col}`);
      if (blockerId && blockerId !== piece.id && state.active.has(blockerId) && !seen.has(blockerId)) {
        seen.add(blockerId);
        const blocker = state.byId.get(blockerId);
        if (blocker) blockers.push(blocker);
      }
      row += direction.dr;
      col += direction.dc;
    }
    return blockers;
  }

  function openPieces() {
    return state.pieces.filter(piece =>
      !piece.removed && state.active.has(piece.id) && arrowheadBlockers(piece).length === 0,
    );
  }

  function checkDeadlockAfterMove() {
    if (!state.active.size || state.transitionLock) return;
    const open = openPieces();
    if (open.length) return;
    setStatus('DEADLOCK · NO ARROWHEAD HAS A CLEAR EXIT');
    setTimeout(() => els.gameOverModal.classList.remove('hidden'), 240);
  }

  blockersAhead = arrowheadBlockers;

  attemptMove = function referenceAttemptMove(piece) {
    if (state.transitionLock || !piece || piece.removed || !state.active.has(piece.id)) return;
    clearPreview();
    const blockers = arrowheadBlockers(piece);
    if (blockers.length) {
      setStatus('BLOCKED · CLEAR THE FIRST LINE IN THIS ARROWHEAD LANE');
      baseLoseLife(piece, blockers[0]);
      return;
    }
    setStatus('CLEAR EXIT · ARROW RELEASED');
    baseRemovePiece(piece);
    const animation = state.data?.animation || {};
    const delay = Number(animation.pauseMs || 90) + Number(animation.maxSlideMs || animation.slideMs || 1500) + 160;
    setTimeout(checkDeadlockAfterMove, delay);
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
        const blockers = arrowheadBlockers(piece);
        (blockers.length ? blocked : open).push({id:piece.id,blockers:blockers.map(item=>item.id)});
      }
      return {
        rule: 'arrowhead_ray_clear_to_edge',
        active: state.active.size,
        openCount: open.length,
        blockedCount: blocked.length,
        open: open.slice(0, 12),
        blocked: blocked.slice(0, 12),
        lives: state.lives,
      };
    };
  }

  bindEvents = function referenceBindEvents() {
    baseBindEvents();
    installInteractionLayer();
  };
})();