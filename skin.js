const BACKDROP_POSITIONS = ['4% 50%', '27% 50%', '50% 50%', '73% 50%', '96% 50%'];

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

function currentLevel() {
  const params = new URLSearchParams(location.search);
  return Math.max(1, Math.min(5, Number(params.get('level')) || 1));
}

function syncSkin() {
  const gameView = document.querySelector('#gameView');
  const active = Boolean(gameView && !gameView.classList.contains('hidden'));
  document.body.classList.toggle('game-active', active);

  const level = currentLevel();
  const backdrop = ensureBackdrop();
  if (backdrop) backdrop.style.setProperty('--backdrop-position', BACKDROP_POSITIONS[level - 1]);

  const topbar = document.querySelector('.topbar');
  const teddyName = document.querySelector('#characterName')?.textContent?.trim() || 'Toxic Teddy';
  const difficulty = document.querySelector('#difficultyBadge')?.textContent?.trim() || '';
  if (topbar) {
    topbar.dataset.levelTitle = `Level ${level}`;
    topbar.dataset.teddyName = teddyName;
  }

  const puzzleCard = document.querySelector('.puzzle-card');
  if (puzzleCard) puzzleCard.dataset.difficultyLabel = difficulty ? `${difficulty} · clear every arrow` : 'Clear every arrow';
}

let syncing = false;
function scheduleSync() {
  if (syncing) return;
  syncing = true;
  requestAnimationFrame(() => {
    syncing = false;
    syncSkin();
  });
}

const observer = new MutationObserver(scheduleSync);

document.addEventListener('DOMContentLoaded', () => {
  syncSkin();
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['class']
  });
  window.addEventListener('popstate', scheduleSync);
  window.addEventListener('resize', scheduleSync);
});
