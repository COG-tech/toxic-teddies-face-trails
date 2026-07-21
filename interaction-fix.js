/* Reliable dense-maze interaction v3.
 * Desktop clicks are now the primary activation path. Pointer events remain for
 * touch and long-press. Arrow selection uses board-space geometry instead of
 * fragile SVG stroke hit testing.
 */
(() => {
  const baseBindEvents = bindEvents;
  const baseRenderBoard = renderBoard;
  let installed = false;
  let activePress = null;
  let longPressTimer = null;
  let pointerHandledAt = 0;

  function svgPointFromEvent(event) {
    const rect = els.board.getBoundingClientRect();
    const viewBox = els.board.viewBox.baseVal;
    if (!rect.width || !rect.height || !viewBox.width || !viewBox.height) return null;
    const scale = Math.min(rect.width / viewBox.width, rect.height / viewBox.height);
    const offsetX = (rect.width - viewBox.width * scale) / 2;
    const offsetY = (rect.height - viewBox.height * scale) / 2;
    return {
      x: viewBox.x + (event.clientX - rect.left - offsetX) / scale,
      y: viewBox.y + (event.clientY - rect.top - offsetY) / scale,
      tolerance: 24 / scale,
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

  function nearestPiece(event) {
    const point = svgPointFromEvent(event);
    if (!point) return null;
    let bestPiece = null;
    let bestDistance = Infinity;
    for (const piece of state.pieces) {
      if (piece.removed || !state.active.has(piece.id)) continue;
      const points = piece._stationaryPoints;
      if (!points || points.length < 2) continue;
      let distance = Infinity;
      for (let index = 1; index < points.length; index += 1) {
        distance = Math.min(distance, distanceToSegment(point, points[index - 1], points[index]));
      }
      if (distance < bestDistance) {
        bestDistance = distance;
        bestPiece = piece;
      }
    }
    return bestDistance <= point.tolerance ? bestPiece : null;
  }

  function addInteractionSurface() {
    els.board.querySelector('.interaction-surface')?.remove();
    const viewBox = els.board.viewBox.baseVal;
    const surface = createSvg('rect', {
      class: 'interaction-surface',
      x: viewBox.x,
      y: viewBox.y,
      width: viewBox.width,
      height: viewBox.height,
      fill: 'rgba(0,0,0,0.001)',
      'pointer-events': 'all',
    });
    els.board.append(surface);
  }

  renderBoard = function interactiveRenderBoard() {
    baseRenderBoard();
    addInteractionSurface();
  };

  function clearPress() {
    if (longPressTimer) clearTimeout(longPressTimer);
    longPressTimer = null;
    activePress = null;
  }

  function releaseStaleLock() {
    if (!state.transitionLock) return;
    const moving = state.pieces.some(piece => piece.element?.classList.contains('rope-exiting'));
    if (!moving && state.data && state.active.size) state.transitionLock = false;
  }

  function activate(piece) {
    if (!piece || piece.removed) return;
    releaseStaleLock();
    attemptMove(piece);
  }

  const baseLoseLife = loseLife;
  loseLife = function visibleBlockedMove(piece, blocker) {
    baseLoseLife(piece, blocker);
    const direction = DIRS[piece.exitDirection] || DIRS.right;
    piece.element?.animate([
      { transform: 'translate(0,0)' },
      { transform: `translate(${direction.dx * 16}px,${direction.dy * 16}px)`, offset: .42 },
      { transform: `translate(${direction.dx * 10}px,${direction.dy * 10}px)`, offset: .62 },
      { transform: 'translate(0,0)' },
    ], { duration: 430, easing: 'cubic-bezier(.2,.8,.2,1)' });
  };

  function installInteractionLayer() {
    if (installed) return;
    installed = true;
    els.board.style.pointerEvents = 'auto';
    els.board.style.touchAction = 'none';

    els.board.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (performance.now() - pointerHandledAt < 450) return;
      activate(nearestPiece(event));
    }, true);

    els.board.addEventListener('pointerdown', event => {
      const piece = nearestPiece(event);
      if (!piece || piece.removed) return;
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
      try { els.board.setPointerCapture?.(event.pointerId); } catch (_) {}
      piece.element?.classList.add('pressed');
      longPressTimer = setTimeout(() => {
        if (!activePress || activePress.id !== piece.id) return;
        activePress.longPress = true;
        previewPiece(piece);
        navigator.vibrate?.(14);
      }, 420);
    }, true);

    els.board.addEventListener('pointermove', event => {
      if (!activePress || activePress.pointerId !== event.pointerId) return;
      if (Math.hypot(event.clientX - activePress.x, event.clientY - activePress.y) > 18) {
        state.byId.get(activePress.id)?.element?.classList.remove('pressed');
        clearPress();
      }
    }, true);

    els.board.addEventListener('pointerup', event => {
      if (!activePress || activePress.pointerId !== event.pointerId) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const press = activePress;
      const piece = state.byId.get(press.id);
      piece?.element?.classList.remove('pressed');
      if (longPressTimer) clearTimeout(longPressTimer);
      longPressTimer = null;
      activePress = null;
      try { els.board.releasePointerCapture?.(event.pointerId); } catch (_) {}
      if (piece && !press.longPress && !piece.removed) {
        pointerHandledAt = performance.now();
        activate(piece);
      }
    }, true);

    els.board.addEventListener('pointercancel', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (activePress) state.byId.get(activePress.id)?.element?.classList.remove('pressed');
      clearPress();
    }, true);
  }

  bindEvents = function reliableBindEvents() {
    baseBindEvents();
    installInteractionLayer();
  };
})();
