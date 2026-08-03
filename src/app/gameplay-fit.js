const TARGET_VISUAL_FILL = 0.94;
const SAFE_FRAME_FILL = 0.97;
const EXTRA_BOUNDS_RATIO = 0.015;
const MAX_RETRIES = 24;

const gameView = document.getElementById('gameView');
const board = document.getElementById('board');
const preview = document.getElementById('previewLayer');
const boardShell = document.querySelector('.board-shell');

let fitFrame = 0;
let retryCount = 0;
let lockedFit = null;

function visualBounds(element) {
  if (!element?.getBBox) return null;

  try {
    return element.getBBox({fill: true, stroke: true, markers: true});
  } catch {
    try {
      return element.getBBox();
    } catch {
      return null;
    }
  }
}

function puzzleLayer() {
  return board?.querySelector('.dense-piece-layer')
    || board?.querySelector('.compiled-piece-layer')
    || board?.querySelector('#pieceLayer')
    || document.querySelector('.dense-piece-layer');
}

function finiteBox(box) {
  return box
    && Number.isFinite(box.x)
    && Number.isFinite(box.y)
    && Number.isFinite(box.width)
    && Number.isFinite(box.height)
    && box.width > 0
    && box.height > 0;
}

function applyLockedFit() {
  if (!lockedFit || !board) return null;

  board.setAttribute('viewBox', lockedFit.viewBox);
  board.setAttribute('preserveAspectRatio', 'none');
  preview?.setAttribute('viewBox', lockedFit.viewBox);
  preview?.setAttribute('preserveAspectRatio', 'none');

  if (gameView) {
    gameView.dataset.puzzleFitStatus = 'fitted';
    gameView.dataset.puzzleViewBox = lockedFit.viewBox;
    gameView.dataset.puzzleWidthFill = lockedFit.widthFill.toFixed(4);
    gameView.dataset.puzzleHeightFill = lockedFit.heightFill.toFixed(4);
    gameView.dataset.puzzleInitialPathCount = String(lockedFit.initialPathCount);
    gameView.dataset.puzzleScaleLocked = 'true';
  }

  return lockedFit;
}

function captureFullPuzzleFit() {
  fitFrame = 0;
  const layer = puzzleLayer();
  const pathCount = layer?.querySelectorAll?.('.dense-path, .path-piece')?.length || 0;
  const bounds = visualBounds(layer);

  if (!pathCount || !finiteBox(bounds)) {
    gameView?.setAttribute('data-puzzle-fit-status', 'waiting');
    if (retryCount < MAX_RETRIES) {
      retryCount += 1;
      fitFrame = requestAnimationFrame(captureFullPuzzleFit);
    }
    return null;
  }

  retryCount = 0;
  const largestDimension = Math.max(bounds.width, bounds.height);
  const safety = largestDimension * EXTRA_BOUNDS_RATIO;
  const paddedWidth = bounds.width + (safety * 2);
  const paddedHeight = bounds.height + (safety * 2);
  const squareSize = Math.max(paddedWidth, paddedHeight) / SAFE_FRAME_FILL;
  const centerX = bounds.x + (bounds.width / 2);
  const centerY = bounds.y + (bounds.height / 2);
  const viewBoxX = centerX - (squareSize / 2);
  const viewBoxY = centerY - (squareSize / 2);
  const viewBox = `${viewBoxX.toFixed(4)} ${viewBoxY.toFixed(4)} ${squareSize.toFixed(4)} ${squareSize.toFixed(4)}`;

  lockedFit = Object.freeze({
    initialPathCount: pathCount,
    viewBox,
    widthFill: bounds.width / squareSize,
    heightFill: bounds.height / squareSize,
    targetVisualFill: TARGET_VISUAL_FILL,
    bounds: Object.freeze({
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
    }),
  });

  return applyLockedFit();
}

function scheduleInitialFit() {
  if (fitFrame) cancelAnimationFrame(fitFrame);
  retryCount = 0;
  fitFrame = requestAnimationFrame(() => requestAnimationFrame(captureFullPuzzleFit));
}

function resetForNewPuzzle() {
  lockedFit = null;
  if (gameView) {
    gameView.dataset.puzzleFitStatus = 'waiting';
    gameView.dataset.puzzleScaleLocked = 'false';
  }
  scheduleInitialFit();
}

function reapplyFit() {
  if (lockedFit) {
    requestAnimationFrame(applyLockedFit);
    return;
  }
  scheduleInitialFit();
}

if (board && boardShell) {
  // The compiled renderer resets the board viewBox once per newly rendered
  // expression. Observe only that reset. Do not observe path removals, because
  // normal gameplay must never recalculate the face from the shrinking set of
  // remaining arrows.
  new MutationObserver(() => {
    const currentViewBox = board.getAttribute('viewBox');
    if (lockedFit && currentViewBox === lockedFit.viewBox) return;
    resetForNewPuzzle();
  }).observe(board, {
    attributes: true,
    attributeFilter: ['viewBox'],
  });

  if ('ResizeObserver' in window) {
    new ResizeObserver(reapplyFit).observe(boardShell);
  }

  window.addEventListener('resize', reapplyFit, {passive: true});
  window.addEventListener('orientationchange', reapplyFit, {passive: true});
  window.addEventListener('pageshow', reapplyFit, {passive: true});
  scheduleInitialFit();
}

window.ToxicPuzzleFit = Object.freeze({
  refit: resetForNewPuzzle,
  reapply: reapplyFit,
  getMetrics: () => lockedFit,
  targetVisualFill: TARGET_VISUAL_FILL,
});
