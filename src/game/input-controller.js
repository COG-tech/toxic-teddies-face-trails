import { chooseNearestPolyline } from './input-geometry.js';

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
  onMiss = () => {},
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
    const active = getActive();
    const candidates = [];

    for (const piece of getPieces()) {
      if (piece.removed || !active.has(piece.id)) continue;
      const sourcePoints = piece._stationaryPoints;
      if (!sourcePoints || sourcePoints.length < 2) continue;
      const points = sourcePoints.map(point => toScreenPoint(board, point)).filter(Boolean);
      if (points.length < 2) continue;
      candidates.push({value: piece, points});
    }

    return chooseNearestPolyline(
      {x: clientX, y: clientY},
      candidates,
      getHitTolerance(),
    )?.value || null;
  }

  function onPointerDown(event) {
    if (!enabled || event.button > 0) return;
    activePointers.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
      time: performance.now(),
      pointerType: event.pointerType || 'unknown',
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
    if (!boardContains(event.clientX, event.clientY)) return;

    const piece = nearestPiece(event.clientX, event.clientY);
    event.preventDefault();
    event.stopImmediatePropagation();
    suppressClicksUntil = performance.now() + 450;

    const metadata = {
      inputType: start.pointerType,
      responseMs: Math.round(duration),
    };
    if (!piece) {
      onMiss(metadata);
      return;
    }
    onSelect(piece, event, metadata);
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
