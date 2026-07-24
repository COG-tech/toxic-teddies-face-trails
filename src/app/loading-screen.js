const FULL_MOTION_MINIMUM_VISIBLE_MS = 1800;
const REDUCED_MOTION_MINIMUM_VISIBLE_MS = 700;
const startedAt = performance.now();
const splash = document.getElementById('bootSplash');
const image = document.getElementById('bootSplashImage');
const status = document.getElementById('bootSplashStatus');
const fill = document.getElementById('bootSplashFill');
const shell = document.querySelector('.app-shell');
const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
const minimumVisibleMs = reducedMotion ? REDUCED_MOTION_MINIMUM_VISIBLE_MS : FULL_MOTION_MINIMUM_VISIBLE_MS;
const requestFrame = window.requestAnimationFrame?.bind(window)
  ?? (callback => window.setTimeout(() => callback(performance.now()), 16));
const cancelFrame = window.cancelAnimationFrame?.bind(window) ?? window.clearTimeout.bind(window);

let targetProgress = 0.08;
let displayedProgress = 0;
let lastFrameAt = startedAt;
let progressFrame = 0;
let stopped = false;

if (image) {
  image.addEventListener('load', () => splash?.classList.add('boot-splash-art-ready'), {once: true});
  image.addEventListener('error', () => {
    splash?.classList.add('boot-splash-art-error');
    if (status) status.textContent = 'Loading artwork unavailable. Preparing the game…';
  }, {once: true});
  if (image.complete && image.naturalWidth > 0) splash?.classList.add('boot-splash-art-ready');
}

function paintProgress(value) {
  if (!fill) return;
  const safeValue = Math.max(0, Math.min(1, value));
  fill.style.setProperty('--boot-progress', safeValue.toFixed(4));
  fill.dataset.progress = String(Math.round(safeValue * 100));
}

function animateProgress(now) {
  if (stopped) return;

  const elapsed = Math.max(0, Math.min(100, now - lastFrameAt));
  lastFrameAt = now;

  if (reducedMotion) {
    displayedProgress = targetProgress;
  } else if (displayedProgress < targetProgress) {
    const progressPerMs = 1 / FULL_MOTION_MINIMUM_VISIBLE_MS;
    displayedProgress = Math.min(targetProgress, displayedProgress + (elapsed * progressPerMs));
  }

  paintProgress(displayedProgress);
  progressFrame = requestFrame(animateProgress);
}

function setStage(message, progress = 0) {
  if (status && message) status.textContent = message;
  const safeProgress = Math.max(0, Math.min(1, Number(progress) || 0));
  targetProgress = Math.max(targetProgress, safeProgress);
  if (reducedMotion) paintProgress(targetProgress);
}

function waitForVisibleCompletion() {
  return new Promise(resolve => {
    const check = () => {
      const elapsed = performance.now() - startedAt;
      if (elapsed >= minimumVisibleMs && displayedProgress >= 0.995) {
        resolve();
        return;
      }
      window.setTimeout(check, 16);
    };
    check();
  });
}

async function hide() {
  if (!splash || splash.classList.contains('boot-splash-hidden')) return;
  setStage('Ready', 1);
  await waitForVisibleCompletion();
  splash.classList.add('boot-splash-leaving');
  await new Promise(resolve => setTimeout(resolve, 260));
  stopped = true;
  cancelFrame(progressFrame);
  splash.classList.add('boot-splash-hidden');
  splash.setAttribute('aria-hidden', 'true');
  shell?.removeAttribute('inert');
  shell?.removeAttribute('aria-hidden');
  document.body.classList.remove('boot-loading');
}

function fail() {
  stopped = true;
  cancelFrame(progressFrame);
  splash?.classList.add('boot-splash-hidden');
  splash?.setAttribute('aria-hidden', 'true');
  shell?.removeAttribute('inert');
  shell?.removeAttribute('aria-hidden');
  document.body.classList.remove('boot-loading');
}

window.ToxicLoadingScreen = Object.freeze({setStage, hide, fail});
paintProgress(0);
progressFrame = requestFrame(animateProgress);
setStage('Preparing the contamination…', 0.08);
