// Final visual cleanup: allow tiny edge arrows without forcing fallback and keep every arrow attached to its line.
__hasCleanGeometry = function hasCleanGeometryIncludingTinyPieces(pieces) {
  const occupied = new Set();
  for (const piece of pieces) {
    if (!piece.cells.length) return false;
    for (const cell of piece.cells) {
      const value = key(cell.row, cell.col);
      if (occupied.has(value)) return false;
      occupied.add(value);
    }

    if (piece.cells.length > 1) {
      const endpoint = piece.cells[piece.cells.length - 1];
      const before = piece.cells[piece.cells.length - 2];
      const expected = __directionFromDelta(endpoint.row - before.row, endpoint.col - before.col);
      if (expected !== piece.dir) return false;

      for (let first = 0; first < piece.cells.length; first += 1) {
        for (let second = first + 2; second < piece.cells.length; second += 1) {
          const a = piece.cells[first];
          const b = piece.cells[second];
          if (Math.abs(a.row - b.row) + Math.abs(a.col - b.col) <= 1) return false;
        }
      }
    }
  }
  return true;
};

createDefs = function createCleanDefs() {
  const defs = document.createElementNS(NS, 'defs');
  defs.innerHTML = `
    <marker id="pieceArrow" viewBox="0 0 12 12" refX="10.4" refY="6" markerWidth="4.6" markerHeight="4.6" orient="auto" markerUnits="strokeWidth">
      <path d="M1 1.4L10.2 6L1 10.6" fill="none" stroke="#6e5438" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>`;
  return defs;
};

renderBoard = function renderCleanBoardWithTinyPieces() {
  const sizePx = state.puzzle.size * CELL;
  els.board.setAttribute('viewBox', `0 0 ${sizePx} ${sizePx}`);
  els.previewLayer.setAttribute('viewBox', `0 0 ${sizePx} ${sizePx}`);
  els.pieceLayer.innerHTML = '';
  els.previewLayer.innerHTML = '';
  els.pieceLayer.append(createDefs());

  state.puzzle.pieces.forEach(piece => {
    const group = document.createElementNS(NS, 'g');
    group.classList.add('path-piece');
    group.dataset.id = piece.id;

    let pointList = piece.cells;
    if (piece.cells.length === 1) {
      const cell = piece.cells[0];
      const direction = DIRS[piece.dir];
      pointList = [
        { row: cell.row - direction.dr * 0.30, col: cell.col - direction.dc * 0.30 },
        { row: cell.row + direction.dr * 0.30, col: cell.col + direction.dc * 0.30 }
      ];
    }

    const points = pointList
      .map(cell => `${cell.col * CELL + CELL / 2},${cell.row * CELL + CELL / 2}`)
      .join(' ');

    const line = document.createElementNS(NS, 'polyline');
    line.setAttribute('points', points);
    line.setAttribute('class', 'piece-line');
    line.setAttribute('marker-end', 'url(#pieceArrow)');

    const hit = document.createElementNS(NS, 'polyline');
    hit.setAttribute('points', points);
    hit.setAttribute('class', 'piece-hit');

    group.append(line, hit);
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
    els.pieceLayer.append(group);
  });
};
