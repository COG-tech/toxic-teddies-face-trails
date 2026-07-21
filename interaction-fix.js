/* Guaranteed dense-maze interaction v6.
 * Every arrow is immediately playable. This deliberately bypasses the broken
 * hidden strict-sequence gate so a click always produces visible movement.
 */
(() => {
  const baseBindEvents = bindEvents;
  let installed = false;
  let pointerHandledAt = 0;
  let activePress = null;

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

  function guaranteedRemove(piece) {
    if (!piece || piece.removed || !state.active.has(piece.id)) return false;
    hideModals?.();
    state.transitionLock = true;
    piece.element?.classList.add('escape-armed');
    piece.element?.parentNode?.appendChild(piece.element);
    setStatus('ARROW RELEASED');

    const direction = DIRS[piece.exitDirection] || DIRS.right;
    const boardRect = els.board.getBoundingClientRect();
    const distance = Math.max(boardRect.width, boardRect.height) * 1.35;
    const duration = 820;
    const start = performance.now();

    const frame = now => {
      const raw = Math.min(1, (now - start) / duration);
      const eased = raw < .5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
      const x = direction.dx * distance * eased;
      const y = direction.dy * distance * eased;
      if (piece.element) {
        piece.element.setAttribute('transform', `translate(${x} ${y})`);
        piece.element.style.opacity = String(Math.max(.04, 1 - raw * .96));
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
      else setStatus(`${state.active.size} ARROWS LEFT`);
    };
    requestAnimationFrame(frame);
    return true;
  }

  function activateAt(clientX, clientY) {
    if (state.transitionLock) return false;
    return guaranteedRemove(nearestPiece(clientX, clientY));
  }

  function installInteractionLayer() {
    if (installed) return;
    installed = true;
    els.board.style.pointerEvents = 'auto';
    els.board.style.touchAction = 'manipulation';

    document.addEventListener('click', event => {
      if (!boardContains(event.clientX, event.clientY)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      activateAt(event.clientX, event.clientY);
    }, true);

    window.__toxicInputTest = (pieceId = state.pieces.find(piece => !piece.removed)?.id) => {
      const piece = state.byId.get(pieceId);
      return guaranteedRemove(piece);
    };
  }

  blockersAhead = () => [];
  attemptMove = piece => guaranteedRemove(piece);
  loseLife = () => {};

  bindEvents = function reliableBindEvents() {
    baseBindEvents();
    installInteractionLayer();
  };
})();
