/* Reliable dense-maze interaction v2.
 * A transparent board-wide interaction surface captures every pointer event.
 * The selected arrow is found geometrically, so SVG stroke hit-testing cannot
 * make the board unclickable in Chrome, Edge, mobile Safari, or cached builds.
 */
(() => {
  const baseBindEvents = bindEvents;
  const baseRenderBoard = renderBoard;
  let installed = false;
  let activePress = null;
  let longPressTimer = null;

  function svgPointFromEvent(event) {
    const rect = els.board.getBoundingClientRect();
    const viewBox = els.board.viewBox.baseVal;
    if (!rect.width || !rect.height || !viewBox.width || !viewBox.height) return null;
    const scale = Math.min(rect.width / viewBox.width, rect.height / viewBox.height);
    const renderedWidth = viewBox.width * scale;
    const renderedHeight = viewBox.height * scale;
    const offsetX = (rect.width - renderedWidth) / 2;
    const offsetY = (rect.height - renderedHeight) / 2;
    return {
      x: viewBox.x + (event.clientX - rect.left - offsetX) / scale,
      y: viewBox.y + (event.clientY - rect.top - offsetY) / scale,
      tolerance: 18 / scale,
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
        if (distance <= bestDistance) break;
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

  function installInteractionLayer() {
    if (installed) return;
    installed = true;
    els.board.style.pointerEvents = 'auto';
    els.board.style.touchAction = 'none';

    els.board.addEventListener('pointerdown', event => {
      const piece = nearestPiece(event);
      if (!piece || piece.removed || state.transitionLock) return;
      event.preventDefault();
      event.stopImmediatePropagation();
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
      if (piece && !press.longPress && !piece.removed) attemptMove(piece);
    }, true);

    els.board.addEventListener('pointercancel', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (activePress) state.byId.get(activePress.id)?.element?.classList.remove('pressed');
      clearPress();
    }, true);

    els.board.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
    }, true);
  }

  bindEvents = function reliableBindEvents() {
    baseBindEvents();
    installInteractionLayer();
  };
})();
