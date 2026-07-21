/* Reliable pointer interaction for the dense SVG maze.
 * Captures taps at board level so narrow SVG strokes and browser SVG quirks
 * cannot swallow clicks. Existing per-piece handlers are bypassed to avoid
 * double moves.
 */
(() => {
  const baseBindEvents = bindEvents;
  let installed = false;
  let activePress = null;
  let longPressTimer = null;

  function pieceFromEvent(event) {
    let node = event.target;
    while (node && node !== els.board) {
      const id = node.getAttribute?.('data-id');
      if (id) return state.byId.get(id) || null;
      node = node.parentNode;
    }
    return null;
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

    els.board.addEventListener('pointerdown', event => {
      const piece = pieceFromEvent(event);
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
      els.board.setPointerCapture?.(event.pointerId);
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
      const distance = Math.hypot(event.clientX - activePress.x, event.clientY - activePress.y);
      if (distance > 14) {
        const piece = state.byId.get(activePress.id);
        piece?.element?.classList.remove('pressed');
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
      const piece = activePress ? state.byId.get(activePress.id) : null;
      piece?.element?.classList.remove('pressed');
      clearPress();
    }, true);

    els.board.addEventListener('click', event => {
      if (pieceFromEvent(event)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);
  }

  bindEvents = function reliableBindEvents() {
    baseBindEvents();
    installInteractionLayer();
  };
})();
