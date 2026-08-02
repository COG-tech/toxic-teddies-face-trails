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
let lastMetrics = null;

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

function fitPuzzle() {
  fitFrame = 0;
  const layer = puzzleLayer();
  const pathCount = layer?.querySelectorAll?.('.dense-path, .path-piece')?.length || 0;
  const bounds = visualBounds(layer);

  if (!pathCount || !finiteBox(bounds)) {
    gameView?.setAttribute('data-puzzle-fit-status', 'waiting');
    if (retryCount < MAX_RETRIES) {
      retryCount += 1;
      fitFrame = requestAnimationFrame(fitPuzzle);
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

  board.setAttribute('viewBox', viewBox);
  board.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  preview?.setAttribute('viewBox', viewBox);
  preview?.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  const widthFill = bounds.width / squareSize;
  const heightFill = bounds.height / squareSize;
  lastMetrics = Object.freeze({
    pathCount,
    viewBox,
    widthFill,
    heightFill,
    targetVisualFill: TARGET_VISUAL_FILL,
    bounds: Object.freeze({
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
    }),
  });

  if (gameView) {
    gameView.dataset.puzzleFitStatus = 'fitted';
    gameView.dataset.puzzleViewBox = viewBox;
    gameView.dataset.puzzleWidthFill = widthFill.toFixed(4);
    gameView.dataset.puzzleHeightFill = heightFill.toFixed(4);
  }

  return lastMetrics;
}

function scheduleFit() {
  if (fitFrame) cancelAnimationFrame(fitFrame);
  retryCount = 0;
  fitFrame = requestAnimationFrame(() => requestAnimationFrame(fitPuzzle));
}

if (board && boardShell) {
  new MutationObserver(scheduleFit).observe(board, {
    childList: true,
    subtree: true,
  });

  if ('ResizeObserver' in window) {
    new ResizeObserver(scheduleFit).observe(boardShell);
  }

  window.addEventListener('resize', scheduleFit, {passive: true});
  window.addEventListener('orientationchange', scheduleFit, {passive: true});
  window.addEventListener('pageshow', scheduleFit, {passive: true});
  scheduleFit();
}

window.ToxicPuzzleFit = Object.freeze({
  refit: scheduleFit,
  getMetrics: () => lastMetrics,
  targetVisualFill: TARGET_VISUAL_FILL,
});
