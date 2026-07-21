export function createAccessibilityController() {
  let latestState = null;
  let latestApi = null;

  function announce(message) {
    const region = document.getElementById('appStatus');
    if (!region || !message) return;
    region.textContent = '';
    requestAnimationFrame(() => {
      region.textContent = message;
    });
  }

  function closeMoves() {
    const modal = document.getElementById('accessibleMovesModal');
    modal?.classList.add('hidden');
    document.getElementById('accessibleMovesButton')?.focus();
  }

  function renderMoves() {
    const list = document.getElementById('accessibleMovesList');
    if (!list || !latestState || !latestApi) return;
    list.innerHTML = '';

    const open = latestState.pieces.filter(piece => (
      !piece.removed
      && latestState.active.has(piece.id)
      && latestApi.blockersAhead(piece).length === 0
    ));

    const summary = document.getElementById('accessibleMovesSummary');
    if (summary) summary.textContent = `${open.length} open arrow trails available.`;

    for (const piece of open.slice(0, 20)) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'accessible-move-button';
      const region = String(piece.region || piece.style || 'face').replaceAll('_', ' ');
      button.textContent = `${region} trail, exits ${piece.exitDirection}`;
      button.addEventListener('click', () => {
        closeMoves();
        latestApi.attemptMove(piece);
      });
      list.append(button);
    }

    if (!open.length) {
      const message = document.createElement('p');
      message.textContent = 'No arrowhead currently has a clear exit.';
      list.append(message);
    }
  }

  function openMoves() {
    renderMoves();
    const modal = document.getElementById('accessibleMovesModal');
    modal?.classList.remove('hidden');
    modal?.querySelector('button')?.focus();
  }

  function install() {
    document.getElementById('accessibleMovesButton')?.addEventListener('click', openMoves);
    document.getElementById('closeAccessibleMovesButton')?.addEventListener('click', closeMoves);
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      const modal = document.getElementById('accessibleMovesModal');
      if (modal && !modal.classList.contains('hidden')) closeMoves();
    });
  }

  return Object.freeze({
    install,
    announce,
    update(state, api) {
      latestState = state;
      latestApi = api;
      const board = document.getElementById('board');
      if (board && state?.data) {
        const expression = String(state.data.expression || '').replaceAll('_', ' ');
        board.setAttribute(
          'aria-label',
          `${state.data.characterName || 'Toxic Toby'}, ${expression}. ${state.active.size} arrow trails remaining.`,
        );
      }
      if (!document.getElementById('accessibleMovesModal')?.classList.contains('hidden')) renderMoves();
    },
    openMoves,
    closeMoves,
  });
}
