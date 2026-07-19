const BACKDROP_POSITIONS = ['0% 50%', '25% 50%', '50% 50%', '75% 50%', '100% 50%'];

function ensureBackdrop() {
  const stage = document.querySelector('#boardStage');
  if (!stage) return null;
  let backdrop = stage.querySelector('.board-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'board-backdrop';
    stage.prepend(backdrop);
  }
  return backdrop;
}

function syncBackdrop() {
  const backdrop = ensureBackdrop();
  if (!backdrop) return;
  const params = new URLSearchParams(location.search);
  const level = Math.max(1, Math.min(5, Number(params.get('level')) || 1));
  backdrop.style.setProperty('--backdrop-position', BACKDROP_POSITIONS[level - 1]);
}

const observer = new MutationObserver(() => syncBackdrop());

document.addEventListener('DOMContentLoaded', () => {
  syncBackdrop();
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener('popstate', syncBackdrop);
});
