/* Arrow Escape production rule engine.
 * Path selection is owned by the extracted mobile input controller. Blocking is
 * calculated only from visible active geometry. Blocked taps never consume a
 * hidden life or force an unexplained sequence.
 */
(() => {
  const baseBindEvents = bindEvents;
  let installed = false;

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
    return state.pieces.filter(piece => (
      !piece.removed
      && state.active.has(piece.id)
      && arrowheadBlockers(piece).length === 0
    ));
  }

  function showBlockedFeedback(piece, blocker) {
    piece.element?.classList.add('blocked-bump', 'inspecting');
    blocker?.element?.classList.add('blocking');
    setStatus('That trail is still trapped.');
    window.ToxicNative?.hapticBlocked?.();
    window.ToxicAccessibility?.announce?.('Path blocked by another active trail.');
    setTimeout(() => {
      piece.element?.classList.remove('blocked-bump', 'inspecting');
      blocker?.element?.classList.remove('blocking');
    }, 620);
  }

  function checkDeadlockAfterMove() {
    if (!state.active.size || state.transitionLock) return;
    if (openPieces().length) return;
    setStatus('No arrowhead currently has a clear exit.');
    window.ToxicAccessibility?.announce?.('No arrowhead currently has a clear exit.');
  }

  blockersAhead = arrowheadBlockers;

  attemptMove = function productionAttemptMove(piece) {
    if (state.transitionLock || !piece || piece.removed || !state.active.has(piece.id)) return;
    clearPreview();
    const blockers = arrowheadBlockers(piece);
    if (blockers.length) {
      showBlockedFeedback(piece, blockers[0]);
      window.ToxicAccessibility?.update?.(state, {blockersAhead, attemptMove});
      return;
    }

    piece.element?.classList.add('pressed');
    setTimeout(() => piece.element?.classList.remove('pressed'), 130);
    setStatus('Clear exit. Arrow released.');
    window.ToxicNative?.hapticValid?.();
    removePiece(piece);
    const animation = state.data?.animation || {};
    const delay = Number(animation.pauseMs || 90)
      + Number(animation.maxSlideMs || animation.slideMs || 1500)
      + 180;
    setTimeout(checkDeadlockAfterMove, delay);
  };

  function installInteractionLayer() {
    if (installed) return;
    installed = true;
    els.board.style.pointerEvents = 'auto';
    els.board.style.touchAction = 'none';

    const factory = window.ToxicInputControllerFactory;
    if (typeof factory !== 'function') {
      throw new Error('Toxic Teddies mobile input controller is unavailable');
    }

    window.__toxicInputController = factory({
      board: els.board,
      getPieces: () => state.pieces,
      getActive: () => state.active,
      onSelect: piece => attemptMove(piece),
      getHitTolerance: () => (
        document.documentElement.classList.contains('touch-assistance') ? 40 : 32
      ),
      tapMovementThreshold: 12,
      tapDurationLimit: 500,
    });

    window.addEventListener('resize', () => window.__toxicInputController?.refresh?.());
    window.addEventListener('orientationchange', () => window.__toxicInputController?.refresh?.());

    window.__toxicRulesTest = () => {
      const open = [];
      const blocked = [];
      for (const piece of state.pieces) {
        if (piece.removed || !state.active.has(piece.id)) continue;
        const blockers = arrowheadBlockers(piece);
        (blockers.length ? blocked : open).push({
          id: piece.id,
          blockers: blockers.map(item => item.id),
        });
      }
      return {
        rule: 'arrowhead_ray_clear_to_edge',
        active: state.active.size,
        openCount: open.length,
        blockedCount: blocked.length,
        open: open.slice(0, 12),
        blocked: blocked.slice(0, 12),
        livesEnabled: false,
      };
    };
  }

  bindEvents = function productionBindEvents() {
    baseBindEvents();
    installInteractionLayer();
  };
})();
