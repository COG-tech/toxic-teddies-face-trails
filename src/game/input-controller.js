function distanceToSegment(point, start, end) {
  const vx = end.x - start.x;
  const vy = end.y - start.y;
  const lengthSquared = vx * vx + vy * vy;
  if (!lengthSquared) return Math.hypot(point.x - start.x, point.y - start.y);
  const ratio = Math.max(0, Math.min(1,
    ((point.x - start.x) * vx + (point.y - start.y) * vy) / lengthSquared,
  ));
  const x = start.x + ratio * vx;
  const y = start.y + ratio * vy;
  return Math.hypot(point.x - x, point.y - y);
}

function toScreenPoint(board, point) {
  const matrix = board.getScreenCTM?.();
  if (!matrix) return null;
  if (typeof DOMPoint === 'function') {
    return new DOMPoint(point.x, point.y).matrixTransform(matrix);
  }
  return {
    x: matrix.a * point.x + matrix.c * point.y + matrix.e,
    y: matrix.b * point.x + matrix.d * point.y + matrix.f,
  };
}

export function createInputController({
  board,
  getPieces,
  getActive,
  onSelect,
  getHitTolerance = () => 32,
  tapMovementThreshold = 12,
  tapDurationLimit = 500,
}) {
  if (!board) throw new Error('Input controller requires the puzzle board');

  const activePointers = new Map();
  let suppressClicksUntil = 0;
  let enabled = true;

  function boardContains(clientX, clientY) {
    const rect = board.getBoundingClientRect();
    return clientX >= rect.left && clientX <= rect.right
      && clientY >= rect.top && clientY <= rect.bottom;
  }

  function nearestPiece(clientX, clientY) {
    if (!boardContains(clientX, clientY)) return null;
    const click = {x: clientX, y: clientY};
    const active = getActive();
    let bestPiece = null;
    let bestDistance = Infinity;

    for (const piece of getPieces()) {
      if (piece.removed || !active.has(piece.id)) continue;
      const sourcePoints = piece._stationaryPoints;
      if (!sourcePoints || sourcePoints.length < 2) continue;
      const points = sourcePoints.map(point => toScreenPoint(board, point)).filter(Boolean);
      for (let index = 1; index < points.length; index += 1) {
        const distance = distanceToSegment(click, points[index - 1], points[index]);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestPiece = piece;
        }
      }
    }

    return bestDistance <= getHitTolerance() ? bestPiece : null;
  }

  function onPointerDown(event) {
    if (!enabled || event.button > 0) return;
    activePointers.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
      time: performance.now(),
      pointerType: event.pointerType,
    });
  }

  function onPointerCancel(event) {
    activePointers.delete(event.pointerId);
  }

  function onPointerUp(event) {
    if (!enabled) return;
    const start = activePointers.get(event.pointerId);
    activePointers.delete(event.pointerId);
    if (!start || activePointers.size) return;

    const distance = Math.hypot(event.clientX - start.x, event.clientY - start.y);
    const duration = performance.now() - start.time;
    if (distance > tapMovementThreshold || duration > tapDurationLimit) return;

    const piece = nearestPiece(event.clientX, event.clientY);
    if (!piece) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    suppressClicksUntil = performance.now() + 450;
    onSelect(piece, event);
  }

  function onClickCapture(event) {
    if (performance.now() > suppressClicksUntil) return;
    if (!boardContains(event.clientX, event.clientY)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  document.addEventListener('pointerdown', onPointerDown, true);
  document.addEventListener('pointerup', onPointerUp, true);
  document.addEventListener('pointercancel', onPointerCancel, true);
  document.addEventListener('click', onClickCapture, true);

  return Object.freeze({
    nearestPiece,
    setEnabled(value) {
      enabled = Boolean(value);
      if (!enabled) activePointers.clear();
    },
    refresh() {
      activePointers.clear();
    },
    destroy() {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('pointerup', onPointerUp, true);
      document.removeEventListener('pointercancel', onPointerCancel, true);
      document.removeEventListener('click', onClickCapture, true);
      activePointers.clear();
    },
  });
}
