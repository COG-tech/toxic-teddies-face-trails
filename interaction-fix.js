/* Reliable dense-maze interaction v4.
 * Uses a document-level capture listener and screen-space geometry. It does not
 * rely on SVG stroke hit-testing or an overlay rect. Every click inside the
 * board resolves to the nearest active arrow, gives immediate feedback, then
 * calls the real game move handler.
 */
(() => {
  const baseBindEvents = bindEvents;
  let installed = false;
  let pointerHandledAt = 0;
  let activePress = null;
  let longPressTimer = null;

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
      let distance = Infinity;
      for (let index = 1; index < points.length; index += 1) {
        distance = Math.min(distance, distanceToSegment(click, points[index - 1], points[index]));
      }
      if (distance < bestDistance) {
        bestDistance = distance;
        bestPiece = piece;
      }
    }
    return bestDistance <= 28 ? bestPiece : null;
  }

  function releaseStaleLock() {
    if (!state.transitionLock) return;
    const moving = state.pieces.some(piece =>
      piece.element?.classList.contains('rope-exiting') || piece.element?.classList.contains('exiting'),
    );
    if (!moving && state.data && state.active.size) state.transitionLock = false;
  }

  function pulse(piece) {
    piece.element?.classList.add('pressed');
    setTimeout(() => piece.element?.classList.remove('pressed'), 120);
  }

  function nudge(piece) {
    const direction = DIRS[piece.exitDirection] || DIRS.right;
    const element = piece.element;
    if (!element) return;
    const start = performance.now();
    const duration = 380;
    const frame = now => {
      const progress = Math.min(1, (now - start) / duration);
      const wave = Math.sin(progress * Math.PI) * (1 - progress * .35);
      element.setAttribute('transform', `translate(${direction.dx * 18 * wave} ${direction.dy * 18 * wave})`);
      if (progress < 1) requestAnimationFrame(frame);
      else element.removeAttribute('transform');
    };
    requestAnimationFrame(frame);
  }

  function activate(piece) {
    if (!piece || piece.removed) return false;
    releaseStaleLock();
    pulse(piece);
    const blockers = blockersAhead(piece);
    if (blockers.length) {
      setStatus('CLICK RECEIVED · BLOCKED ARROW');
      nudge(piece);
      loseLife(piece, blockers[0]);
      return true;
    }
    setStatus('CLICK RECEIVED · ARROW RELEASED');
    removePiece(piece);
    return true;
  }

  function activateAt(clientX, clientY) {
    return activate(nearestPiece(clientX, clientY));
  }

  function clearPress() {
    if (longPressTimer) clearTimeout(longPressTimer);
    longPressTimer = null;
    activePress = null;
  }

  function installInteractionLayer() {
    if (installed) return;
    installed = true;
    els.board.style.pointerEvents = 'auto';
    els.board.style.touchAction = 'none';

    document.addEventListener('click', event => {
      if (!boardContains(event.clientX, event.clientY)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (performance.now() - pointerHandledAt < 420) return;
      activateAt(event.clientX, event.clientY);
    }, true);

    document.addEventListener('pointerdown', event => {
      if (!boardContains(event.clientX, event.clientY)) return;
      const piece = nearestPiece(event.clientX, event.clientY);
      if (!piece) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      releaseStaleLock();
      activePress = {
        id: piece.id,
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        longPress: false,
      };
      pulse(piece);
      longPressTimer = setTimeout(() => {
        if (!activePress || activePress.id !== piece.id) return;
        activePress.longPress = true;
        previewPiece(piece);
        navigator.vibrate?.(14);
      }, 430);
    }, true);

    document.addEventListener('pointermove', event => {
      if (!activePress || activePress.pointerId !== event.pointerId) return;
      if (Math.hypot(event.clientX - activePress.x, event.clientY - activePress.y) > 18) clearPress();
    }, true);

    document.addEventListener('pointerup', event => {
      if (!activePress || activePress.pointerId !== event.pointerId) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const press = activePress;
      const piece = state.byId.get(press.id);
      clearPress();
      if (piece && !press.longPress && !piece.removed) {
        pointerHandledAt = performance.now();
        activate(piece);
      }
    }, true);

    document.addEventListener('pointercancel', clearPress, true);

    window.__toxicInputTest = (pieceId = state.data?.solutionOrder?.find(id => state.active.has(id))) => {
      const piece = state.byId.get(pieceId);
      const before = state.active.size;
      const accepted = activate(piece);
      return { accepted, pieceId, before, after: state.active.size, status: els.statusText.textContent };
    };
  }

  bindEvents = function reliableBindEvents() {
    baseBindEvents();
    installInteractionLayer();
  };
})();
