const MINIMUM_VISIBLE_MS = 700;
const startedAt = performance.now();
const splash = document.getElementById('bootSplash');
const image = document.getElementById('bootSplashImage');
const status = document.getElementById('bootSplashStatus');
const fill = document.getElementById('bootSplashFill');
const shell = document.querySelector('.app-shell');

if (image) {
  image.addEventListener('load', () => splash?.classList.add('boot-splash-art-ready'), {once: true});
  image.addEventListener('error', () => {
    splash?.classList.add('boot-splash-art-error');
    if (status) status.textContent = 'Loading artwork unavailable. Preparing the game…';
  }, {once: true});
  if (image.complete && image.naturalWidth > 0) splash?.classList.add('boot-splash-art-ready');
}

function setStage(message, progress = 0) {
  if (status && message) status.textContent = message;
  if (fill) {
    const safeProgress = Math.max(0, Math.min(1, Number(progress) || 0));
    fill.style.setProperty('--boot-progress', String(safeProgress));
  }
}

async function hide() {
  if (!splash || splash.classList.contains('boot-splash-hidden')) return;
  const elapsed = performance.now() - startedAt;
  if (elapsed < MINIMUM_VISIBLE_MS) {
    await new Promise(resolve => setTimeout(resolve, MINIMUM_VISIBLE_MS - elapsed));
  }
  setStage('Ready', 1);
  splash.classList.add('boot-splash-leaving');
  await new Promise(resolve => setTimeout(resolve, 260));
  splash.classList.add('boot-splash-hidden');
  splash.setAttribute('aria-hidden', 'true');
  shell?.removeAttribute('inert');
  shell?.removeAttribute('aria-hidden');
  document.body.classList.remove('boot-loading');
}

function fail() {
  splash?.classList.add('boot-splash-hidden');
  splash?.setAttribute('aria-hidden', 'true');
  shell?.removeAttribute('inert');
  shell?.removeAttribute('aria-hidden');
  document.body.classList.remove('boot-loading');
}

window.ToxicLoadingScreen = Object.freeze({setStage, hide, fail});
setStage('Preparing the contamination…', 0.08);
