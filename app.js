import { TEDDIES, LEVELS_PER_TEDDY, TOTAL_LEVELS, DIFFICULTIES } from './characters.js';

const STORAGE_KEY = 'toxic-teddies-arrow-escape:v1';
const DIRS = {
  up:    { dr: -1, dc: 0, angle: -90, dx: 0, dy: -1, label: 'up' },
  right: { dr: 0, dc: 1, angle: 0, dx: 1, dy: 0, label: 'right' },
  down:  { dr: 1, dc: 0, angle: 90, dx: 0, dy: 1, label: 'down' },
  left:  { dr: 0, dc: -1, angle: 180, dx: -1, dy: 0, label: 'left' }
};

const els = Object.fromEntries([
  'backButton','soundButton','collectionCounter','homeView','gameView','teddyGrid','levelKicker','characterName','alternateName','lives','clearProgress','percentProgress','instructionCard','instructionIcon','instructionTitle','instructionText','puzzleFrame','boardStage','faceShell','arrowGrid','mistakeFlash','resetButton','hintButton','levelStripTitle','difficultyBadge','levelButtons','portraitTitle','miniPortrait','featureCopy','completionModal','completionTitle','completionTagline','revealHost','completionCopy','closeModal','replayButton','nextButton','gameOverModal','tryAgainButton'
].map(id => [id, document.getElementById(id)]));

const state = {
  teddyIndex: 0,
  level: 1,
  puzzle: null,
  lives: 3,
  sound: true,
  transitionLock: false,
  pressTimer: null,
  longPressTriggered: false,
  previewTimer: null,
  save: loadSave()
};

function loadSave() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? { completed: {} }; }
  catch { return { completed: {} }; }
}
function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.save));
  updateCollectionCounter();
}
function levelKey(teddyId, level) { return `${teddyId}-l${level}`; }
function completed(teddyId, level) { return Boolean(state.save.completed?.[levelKey(teddyId, level)]); }
function unlocked(teddyId, level) { return level === 1 || completed(teddyId, level - 1); }
function currentTeddy() { return TEDDIES[state.teddyIndex]; }
function difficulty() { return DIFFICULTIES[state.level - 1]; }
function cellKey(row, col) { return `${row}:${col}`; }

function boot() {
  bindStaticEvents();
  renderHome();
  updateCollectionCounter();

  const params = new URLSearchParams(location.search);
  const teddyId = params.get('teddy');
  const level = Number(params.get('level'));
  const index = TEDDIES.findIndex(teddy => teddy.id === teddyId);
  if (index >= 0) openGame(index, Number.isInteger(level) && level >= 1 && level <= LEVELS_PER_TEDDY ? level : 1);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

function bindStaticEvents() {
  els.backButton.addEventListener('click', showHome);
  els.soundButton.addEventListener('click', () => {
    state.sound = !state.sound;
    els.soundButton.textContent = state.sound ? '🔊' : '🔇';
  });
  els.resetButton.addEventListener('click', resetGame);
  els.hintButton.addEventListener('click', showHint);
  els.closeModal.addEventListener('click', () => els.completionModal.classList.add('hidden'));
  els.replayButton.addEventListener('click', () => {
    els.completionModal.classList.add('hidden');
    resetGame();
  });
  els.nextButton.addEventListener('click', goNext);
  els.tryAgainButton.addEventListener('click', () => {
    els.gameOverModal.classList.add('hidden');
    resetGame();
  });
  window.addEventListener('blur', clearPressTimer);
}

function renderHome() {
  els.teddyGrid.innerHTML = '';
  TEDDIES.forEach((teddy, index) => {
    const done = Array.from({ length: LEVELS_PER_TEDDY }, (_, i) => completed(teddy.id, i + 1)).filter(Boolean).length;
    const button = document.createElement('button');
    button.className = 'teddy-card';
    button.type = 'button';
    button.innerHTML = `
      <div class="teddy-card-art">${renderPortrait(teddy, false)}</div>
      <div class="teddy-card-copy">
        <h3>${teddy.primary}</h3>
        <p>${teddy.alternate}</p>
        <div class="card-progress"><span>Face puzzles</span><strong>${done}/5</strong></div>
        <div class="progress-line"><span style="width:${done * 20}%"></span></div>
      </div>`;
    button.addEventListener('click', () => {
      let target = 1;
      for (let level = 1; level <= LEVELS_PER_TEDDY; level += 1) {
        if (unlocked(teddy.id, level)) target = level;
      }
      openGame(index, target);
    });
    els.teddyGrid.append(button);
  });
}

function showHome() {
  clearPressTimer();
  clearPreview();
  els.homeView.classList.remove('hidden');
  els.gameView.classList.add('hidden');
  els.backButton.classList.add('hidden');
  history.replaceState({}, '', location.pathname);
  renderHome();
}

function openGame(teddyIndex, level) {
  state.teddyIndex = teddyIndex;
  state.level = level;
  els.homeView.classList.add('hidden');
  els.gameView.classList.remove('hidden');
  els.backButton.classList.remove('hidden');

  const url = new URL(location.href);
  url.searchParams.set('teddy', currentTeddy().id);
  url.searchParams.set('level', String(level));
  history.replaceState({}, '', url);

  buildLevel();
}

function buildLevel() {
  const teddy = currentTeddy();
  const diff = difficulty();
  state.lives = diff.lives;
  state.transitionLock = false;
  state.puzzle = generatePuzzle(teddy, state.teddyIndex, state.level);

  els.levelKicker.textContent = `PUZZLE ${state.level} OF 5 · ${diff.name}`;
  els.characterName.textContent = teddy.primary;
  els.alternateName.textContent = `also known as ${teddy.alternate}`;
  els.levelStripTitle.textContent = `${teddy.short}'s five faces`;
  els.difficultyBadge.textContent = diff.name;
  els.portraitTitle.textContent = teddy.primary;
  els.featureCopy.textContent = featureDescription(teddy.feature);
  els.miniPortrait.innerHTML = renderPortrait(teddy, false);

  els.faceShell.style.borderColor = `${teddy.palette[1]}33`;
  els.faceShell.style.background = `${teddy.palette[0]}12`;
  renderBoard();
  renderLevelButtons();
  renderLives();
  updateProgress();
  updateInstruction('Choose an open arrow', 'Look from the arrow tip to the edge. Long-press any arrow to preview its lane.', false);
}

function resetGame() {
  clearPressTimer();
  clearPreview();
  els.gameOverModal.classList.add('hidden');
  state.transitionLock = false;
  buildLevel();
}

function renderLevelButtons() {
  const teddy = currentTeddy();
  els.levelButtons.innerHTML = '';
  for (let level = 1; level <= LEVELS_PER_TEDDY; level += 1) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'level-button';
    button.textContent = level;
    if (level === state.level) button.classList.add('active');
    if (completed(teddy.id, level)) button.classList.add('complete');
    if (!unlocked(teddy.id, level)) {
      button.classList.add('locked');
      button.disabled = true;
    }
    button.addEventListener('click', () => openGame(state.teddyIndex, level));
    els.levelButtons.append(button);
  }
}

function renderBoard() {
  const teddy = currentTeddy();
  const { size, cells } = state.puzzle;
  els.arrowGrid.innerHTML = '';
  els.arrowGrid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  els.arrowGrid.style.gridTemplateRows = `repeat(${size}, 1fr)`;
  els.arrowGrid.style.setProperty('--tile-fur', teddy.palette[0]);
  els.arrowGrid.style.setProperty('--accent', teddy.accent);

  cells.forEach(cell => {
    const dir = DIRS[cell.dir];
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `arrow-tile ${cell.featureClass}`;
    button.style.gridRow = String(cell.row + 1);
    button.style.gridColumn = String(cell.col + 1);
    button.style.setProperty('--rotation', `${dir.angle}deg`);
    button.style.setProperty('--dx', String(dir.dx));
    button.style.setProperty('--dy', String(dir.dy));
    button.setAttribute('role', 'gridcell');
    button.setAttribute('aria-label', `${cell.featureLabel} arrow pointing ${dir.label}`);
    button.addEventListener('pointerdown', event => beginLongPress(event, cell));
    button.addEventListener('pointerup', endLongPress);
    button.addEventListener('pointercancel', endLongPress);
    button.addEventListener('pointerleave', cancelLongPress);
    button.addEventListener('contextmenu', event => event.preventDefault());
    button.addEventListener('click', event => {
      event.preventDefault();
      if (state.longPressTriggered) {
        state.longPressTriggered = false;
        return;
      }
      attemptMove(cell);
    });
    cell.element = button;
    els.arrowGrid.append(button);
  });
}

function beginLongPress(event, cell) {
  if (state.transitionLock || cell.removed) return;
  clearPressTimer();
  state.longPressTriggered = false;
  state.pressTimer = window.setTimeout(() => {
    state.longPressTriggered = true;
    previewTrajectory(cell);
    navigator.vibrate?.(22);
  }, 460);
  event.currentTarget.setPointerCapture?.(event.pointerId);
}

function endLongPress() {
  clearPressTimer();
}
function cancelLongPress() {
  clearPressTimer();
}
function clearPressTimer() {
  if (state.pressTimer) window.clearTimeout(state.pressTimer);
  state.pressTimer = null;
}

function previewTrajectory(cell) {
  clearPreview();
  if (!state.puzzle.active.has(cell.key)) return;

  const blockers = blockersAhead(cell);
  cell.element?.classList.add('inspecting');
  blockers.forEach((blocker, index) => blocker.element?.classList.add(index === 0 ? 'trajectory-blocker' : 'trajectory'));
  drawTrajectoryLine(cell, blockers.length > 0);

  if (blockers.length) {
    updateInstruction('Blocked lane', `${blockers.length} Teddy arrow${blockers.length === 1 ? '' : 's'} must leave this lane first.`, false);
  } else {
    updateInstruction('Open lane', 'This arrow can slide safely to the perimeter.', false);
  }

  state.previewTimer = window.setTimeout(clearPreview, 1400);
}

function drawTrajectoryLine(cell, blocked) {
  const size = state.puzzle.size;
  const dir = DIRS[cell.dir];
  const line = document.createElement('div');
  line.className = `trajectory-line${blocked ? ' blocked' : ''}`;
  const cx = ((cell.col + 0.5) / size) * 92 + 4;
  const cy = ((cell.row + 0.5) / size) * 92 + 4;
  line.style.left = `${cx}%`;
  line.style.top = `${cy}%`;

  if (dir.dc !== 0) {
    const length = dir.dc > 0 ? 100 - cx : cx;
    line.style.width = `${length}%`;
    line.style.height = '4px';
    line.style.transform = dir.dc > 0 ? 'translateY(-50%)' : 'translate(-100%, -50%)';
  } else {
    const length = dir.dr > 0 ? 100 - cy : cy;
    line.style.height = `${length}%`;
    line.style.width = '4px';
    line.style.transform = dir.dr > 0 ? 'translateX(-50%)' : 'translate(-50%, -100%)';
  }
  els.boardStage.append(line);
}

function clearPreview() {
  if (state.previewTimer) window.clearTimeout(state.previewTimer);
  state.previewTimer = null;
  els.boardStage.querySelectorAll('.trajectory-line').forEach(line => line.remove());
  state.puzzle?.cells.forEach(cell => cell.element?.classList.remove('inspecting', 'trajectory', 'trajectory-blocker'));
}

function attemptMove(cell) {
  if (state.transitionLock || !state.puzzle.active.has(cell.key)) return;
  clearPreview();
  const blockers = blockersAhead(cell);

  if (blockers.length) {
    loseLife(cell, blockers[0]);
    return;
  }

  state.transitionLock = true;
  cell.element.classList.add('exiting');
  playTone(430 + Math.min(280, state.puzzle.cleared * 4), .09);
  updateInstruction('Lane cleared', 'That removal may have freed another arrow. Look again before choosing.', false);

  window.setTimeout(() => {
    cell.removed = true;
    cell.element.classList.add('removed');
    state.puzzle.active.delete(cell.key);
    state.puzzle.cleared += 1;
    state.transitionLock = false;
    updateProgress();

    if (state.puzzle.active.size === 0) completeLevel();
  }, 310);
}

function loseLife(cell, blocker) {
  state.lives = Math.max(0, state.lives - 1);
  renderLives();
  cell.element.classList.remove('blocked-bump');
  blocker.element?.classList.add('trajectory-blocker');
  void cell.element.offsetWidth;
  cell.element.classList.add('blocked-bump');
  flashMistake();
  playTone(115, .14);
  updateInstruction('That arrow is blocked', 'Follow its direction and clear the first Teddy arrow in the lane before trying again.', true);

  window.setTimeout(() => blocker.element?.classList.remove('trajectory-blocker'), 650);
  if (state.lives === 0) {
    window.setTimeout(() => els.gameOverModal.classList.remove('hidden'), 360);
  }
}

function blockersAhead(cell) {
  return rayKeys(cell, state.puzzle.size)
    .map(key => state.puzzle.active.get(key))
    .filter(Boolean);
}

function showHint() {
  if (state.transitionLock || !state.puzzle) return;
  clearPreview();
  const open = [...state.puzzle.active.values()].filter(cell => blockersAhead(cell).length === 0);
  if (!open.length) return;
  const rng = mulberry32(hashString(`${currentTeddy().id}:${state.level}:${state.puzzle.cleared}:hint`));
  const cell = open[Math.floor(rng() * open.length)];
  cell.element.classList.add('hinting');
  updateInstruction('Open arrow highlighted', 'This lane reaches the perimeter without another arrow in the way.', false);
  window.setTimeout(() => cell.element?.classList.remove('hinting'), 2400);
}

function completeLevel() {
  const teddy = currentTeddy();
  state.save.completed[levelKey(teddy.id, state.level)] = {
    completedAt: new Date().toISOString(),
    livesRemaining: state.lives,
    tileCount: state.puzzle.cells.length
  };
  persist();
  renderLevelButtons();
  playVictory();

  els.completionTitle.textContent = `${teddy.primary} · Puzzle ${state.level}`;
  els.completionTagline.textContent = teddy.tagline;
  els.revealHost.innerHTML = renderPortrait(teddy, true);
  els.completionCopy.textContent = state.level === LEVELS_PER_TEDDY
    ? `${teddy.primary}'s complete five-puzzle face set is cleared. ${teddy.lore}`
    : `Puzzle ${state.level + 1} is now unlocked. ${teddy.lore}`;
  els.nextButton.textContent = state.level === LEVELS_PER_TEDDY ? 'Choose another Teddy' : `Play puzzle ${state.level + 1}`;
  window.setTimeout(() => els.completionModal.classList.remove('hidden'), 320);
}

function goNext() {
  els.completionModal.classList.add('hidden');
  if (state.level < LEVELS_PER_TEDDY) openGame(state.teddyIndex, state.level + 1);
  else showHome();
}

function renderLives() {
  els.lives.innerHTML = '';
  for (let index = 0; index < difficulty().lives; index += 1) {
    const drop = document.createElement('span');
    drop.className = `toxic-drop${index >= state.lives ? ' lost' : ''}`;
    drop.textContent = '💧';
    drop.setAttribute('aria-hidden', 'true');
    els.lives.append(drop);
  }
  els.lives.setAttribute('aria-label', `${state.lives} toxic drops remaining`);
}

function updateProgress() {
  const total = state.puzzle?.cells.length ?? 0;
  const cleared = state.puzzle?.cleared ?? 0;
  const percent = total ? Math.round((cleared / total) * 100) : 0;
  els.clearProgress.textContent = `${cleared} / ${total} cleared`;
  els.percentProgress.textContent = `${percent}%`;
}

function updateCollectionCounter() {
  const count = Object.keys(state.save.completed ?? {}).length;
  els.collectionCounter.textContent = `${count} / ${TOTAL_LEVELS}`;
}

function updateInstruction(title, text, error) {
  els.instructionTitle.textContent = title;
  els.instructionText.textContent = text;
  els.instructionIcon.textContent = error ? '⚠' : '☝';
  els.instructionCard.classList.toggle('error', error);
}

function flashMistake() {
  els.mistakeFlash.classList.remove('active');
  void els.mistakeFlash.offsetWidth;
  els.mistakeFlash.classList.add('active');
  window.setTimeout(() => els.mistakeFlash.classList.remove('active'), 400);
  navigator.vibrate?.([38, 24, 48]);
}

function generatePuzzle(teddy, teddyIndex, level) {
  const diff = DIFFICULTIES[level - 1];
  const seed = hashString(`${teddy.id}:${level}:arrow-face-v2`);
  const rng = mulberry32(seed);
  const cells = buildFaceCells(diff.size, teddy, teddyIndex, rng);
  const fullKeys = new Set(cells.map(cell => cell.key));
  const remaining = new Map(cells.map(cell => [cell.key, cell]));
  const directions = new Map();
  const solution = [];

  while (remaining.size) {
    const candidates = [];
    for (const cell of remaining.values()) {
      for (const dirName of Object.keys(DIRS)) {
        const ray = rayKeys({ ...cell, dir: dirName }, diff.size);
        if (ray.some(key => remaining.has(key))) continue;
        const removedAhead = ray.filter(key => fullKeys.has(key) && !remaining.has(key)).length;
        candidates.push({ cell, dirName, removedAhead });
      }
    }

    if (!candidates.length) throw new Error('Could not generate a solvable arrow board.');
    const dependent = candidates.filter(candidate => candidate.removedAhead > 0);
    const useDependency = dependent.length > 0 && solution.length > 0 && rng() < diff.dependency;
    const pool = useDependency ? dependent : candidates;

    let chosen;
    if (useDependency && rng() < diff.dependency) {
      const maxDependency = Math.max(...pool.map(candidate => candidate.removedAhead));
      const strongest = pool.filter(candidate => candidate.removedAhead >= Math.max(1, maxDependency - 1));
      chosen = strongest[Math.floor(rng() * strongest.length)];
    } else {
      chosen = pool[Math.floor(rng() * pool.length)];
    }

    directions.set(chosen.cell.key, chosen.dirName);
    solution.push(chosen.cell.key);
    remaining.delete(chosen.cell.key);
  }

  cells.forEach(cell => {
    cell.dir = directions.get(cell.key);
    cell.removed = false;
    cell.element = null;
  });

  return {
    size: diff.size,
    cells,
    active: new Map(cells.map(cell => [cell.key, cell])),
    solution,
    cleared: 0
  };
}

function buildFaceCells(size, teddy, teddyIndex, rng) {
  const cells = [];
  const half = (size - 1) / 2;
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const x = (col - half) / half;
      const y = (row - half) / half;
      const head = (x * x) / (0.79 * 0.79) + ((y + 0.01) * (y + 0.01)) / (0.83 * 0.83) <= 1;
      const leftEar = ((x + 0.68) ** 2) / (0.29 ** 2) + ((y + 0.68) ** 2) / (0.29 ** 2) <= 1;
      const rightEar = ((x - 0.68) ** 2) / (0.29 ** 2) + ((y + 0.68) ** 2) / (0.29 ** 2) <= 1;
      if (!(head || leftEar || rightEar)) continue;

      const feature = classifyFaceFeature(x, y, teddy.feature, row, col, teddyIndex, rng);
      cells.push({
        key: cellKey(row, col),
        row,
        col,
        x,
        y,
        featureClass: feature.className,
        featureLabel: feature.label
      });
    }
  }
  return cells;
}

function classifyFaceFeature(x, y, feature, row, col, teddyIndex, rng) {
  const leftEye = Math.hypot(x + 0.29, y + 0.2) < 0.16;
  const rightEye = Math.hypot(x - 0.29, y + 0.2) < 0.16;
  const nose = Math.abs(x) < 0.13 && y > -0.02 && y < 0.18;
  const mouth = Math.abs(x) < 0.34 && y > 0.25 && y < 0.43;
  const centerScar = Math.abs(x) < 0.075 && y < -0.28;

  if (leftEye) return { className: 'feature-button', label: 'button-eye' };
  if (rightEye) return { className: 'feature-eye', label: 'infected-eye' };
  if (nose) return { className: 'feature-nose', label: 'nose' };
  if (mouth) return { className: 'feature-mouth', label: 'mouth' };
  if (centerScar) return { className: 'feature-scar', label: 'stitched scar' };

  const patterned = mutationCell(feature, x, y, row, col, teddyIndex);
  if (patterned || rng() < 0.035) return { className: 'feature-accent', label: `${feature} mutation` };
  return { className: 'feature-fur', label: 'fur' };
}

function mutationCell(feature, x, y, row, col, teddyIndex) {
  const noise = ((row * 31 + col * 17 + teddyIndex * 13) % 19) / 19;
  switch (feature) {
    case 'radiation': return Math.hypot(x, y + 0.48) < 0.16 || (noise > .84 && y > -.1);
    case 'mold': return noise > .73 && (x < -.1 || y > .05);
    case 'trash': return y < -.58 || (noise > .82 && y > .1);
    case 'sludge': return y > .55 || (x > .48 && y > .05);
    case 'battery': return Math.abs(x) > .52 && y > -.15 && y < .46;
    case 'maggot': return noise > .79;
    case 'burger': return y > .46 || (y > .08 && y < .18 && Math.abs(x) < .52);
    case 'rust': return noise > .7;
    case 'acid': return Math.abs(x - y * .52) < .11 || (x > .48 && y > .1);
    case 'mask': return Math.abs(x) < .48 && y > -.28 && y < .32;
    case 'patchwork': return (row + col) % 4 === 0;
    case 'plague': return Math.abs(x) < .11 && y > -.05 && y < .46;
    default: return false;
  }
}

function rayKeys(cell, size) {
  const dir = DIRS[cell.dir];
  const keys = [];
  let row = cell.row + dir.dr;
  let col = cell.col + dir.dc;
  while (row >= 0 && row < size && col >= 0 && col < size) {
    keys.push(cellKey(row, col));
    row += dir.dr;
    col += dir.dc;
  }
  return keys;
}

function renderPortrait(teddy, celebrate) {
  const [fur, dark, accent, light] = teddy.palette;
  const mutation = portraitMutation(teddy.feature, accent, light, dark);
  return `<svg viewBox="0 0 520 520" role="img" aria-label="${teddy.primary} Toxic Teddy portrait">
    <rect width="520" height="520" rx="32" fill="#f4ead4"/>
    <circle cx="132" cy="142" r="82" fill="${fur}" stroke="${dark}" stroke-width="15"/>
    <circle cx="388" cy="142" r="82" fill="${fur}" stroke="${dark}" stroke-width="15"/>
    <circle cx="260" cy="270" r="190" fill="${fur}" stroke="${dark}" stroke-width="18"/>
    <path d="M260 85 C245 135 272 170 253 220 C240 254 258 284 260 320" fill="none" stroke="${dark}" stroke-width="9" stroke-dasharray="14 9"/>
    <circle cx="190" cy="245" r="48" fill="#27221c" stroke="${dark}" stroke-width="9"/>
    <path d="M166 221 214 269M214 221 166 269" stroke="#8e877a" stroke-width="9"/>
    <ellipse cx="330" cy="245" rx="47" ry="53" fill="${light}" stroke="${dark}" stroke-width="10"/>
    <circle cx="340" cy="257" r="13" fill="#1c1813"/><circle cx="323" cy="230" r="7" fill="#fff"/>
    <ellipse cx="260" cy="342" rx="100" ry="70" fill="#b78555" stroke="${dark}" stroke-width="11"/>
    <ellipse cx="260" cy="318" rx="46" ry="32" fill="#201b16"/>
    <path d="M198 365 Q260 430 322 365 Q260 401 198 365" fill="#4d241a" stroke="${dark}" stroke-width="9"/>
    <path d="M218 373 236 397 254 378 272 399 294 374" fill="#f0e1bd"/>
    ${mutation}
    ${celebrate ? `<g fill="${accent}"><circle cx="72" cy="80" r="8"/><circle cx="452" cy="92" r="10"/><circle cx="440" cy="420" r="7"/><path d="M85 390l18 38 40 5-30 27 8 40-36-20-36 20 8-40-30-27 40-5Z"/></g>` : ''}
  </svg>`;
}

function portraitMutation(feature, accent, light, dark) {
  const map = {
    radiation: `<circle cx="260" cy="440" r="37" fill="${accent}" opacity=".92"/><circle cx="260" cy="440" r="10" fill="${dark}"/><path d="M260 403l-13 27h26ZM228 459l29-8-15 28ZM292 459l-29-8 15 28Z" fill="${dark}"/>`,
    mold: `<g fill="${accent}" stroke="${dark}" stroke-width="4"><circle cx="120" cy="120" r="19"/><circle cx="142" cy="99" r="12"/><circle cx="384" cy="166" r="16"/><circle cx="155" cy="365" r="13"/></g>`,
    trash: `<path d="M80 78h360l-38 68H118Z" fill="#70736d" stroke="#2f302b" stroke-width="11"/><path d="M190 55h140l24 26H166Z" fill="#858880" stroke="#2f302b" stroke-width="9"/>`,
    sludge: `<path d="M82 402 Q126 375 154 420 T226 420 T300 420 T374 420 T438 402 L430 498H90Z" fill="${accent}" opacity=".82"/>`,
    battery: `<g fill="${accent}" stroke="${dark}" stroke-width="7"><rect x="70" y="310" width="60" height="112" rx="10"/><rect x="390" y="310" width="60" height="112" rx="10"/></g><path d="M247 385l-18 48 27-8-14 46 52-68-29 9 16-27Z" fill="${light}" stroke="${dark}" stroke-width="6"/>`,
    maggot: `<g fill="${light}" stroke="${dark}" stroke-width="4"><path d="M130 140q35-30 58 7q-26 25-58-7"/><path d="M364 360q38-27 57 10q-29 23-57-10"/></g>`,
    burger: `<g stroke="${dark}" stroke-width="7"><path d="M170 400q90-65 180 0Z" fill="#d79a43"/><rect x="166" y="400" width="188" height="34" rx="12" fill="#5f321d"/><path d="M174 434h172l-20 26H194Z" fill="#edcc4e"/></g>`,
    rust: `<g fill="${accent}" stroke="${dark}" stroke-width="6"><path d="M100 330l62-18 17 61-62 19Z"/><path d="M350 390l65-12 12 60-64 14Z"/></g>`,
    acid: `<path d="M104 300q35 35 17 82q-17 45 18 78" fill="none" stroke="${accent}" stroke-width="18"/><circle cx="400" cy="398" r="18" fill="${accent}"/>`,
    mask: `<path d="M165 265q95-82 190 0l-28 128q-67 42-134 0Z" fill="#566058" stroke="${dark}" stroke-width="11"/><circle cx="210" cy="290" r="31" fill="${light}" stroke="${dark}" stroke-width="8"/><circle cx="310" cy="290" r="31" fill="${light}" stroke="${dark}" stroke-width="8"/><circle cx="260" cy="370" r="27" fill="#252b27"/>`,
    patchwork: `<path d="M92 326l72-20 20 70-74 20Z" fill="#c85d76" stroke="${dark}" stroke-width="7"/><path d="M348 378l70-14 14 66-72 15Z" fill="#65a19c" stroke="${dark}" stroke-width="7"/>`,
    plague: `<path d="M220 305q45-38 90 0l74 38-76 22q-54 28-88-60Z" fill="#30332a" stroke="${dark}" stroke-width="10"/><circle cx="242" cy="300" r="23" fill="${light}"/><circle cx="302" cy="300" r="23" fill="${light}"/>`
  };
  return map[feature] ?? '';
}

function featureDescription(feature) {
  const descriptions = {
    radiation: 'Radioactive arrows glow through Toby’s stitched forehead and toxic cheeks.',
    mold: 'Mold clusters spread across Molly’s ears, eye socket, and infected fur.',
    trash: 'Trash-lid brow pieces and grimy facial arrows form Danny’s alley-born portrait.',
    sludge: 'Heavy green arrows pool around Sam’s jaw and melting lower face.',
    battery: 'Charged yellow arrows frame Barry’s face like leaking battery cells.',
    maggot: 'Pale infestation arrows crawl through Mitch’s torn plush features.',
    burger: 'Greasy orange facial bands make Burger Bear look permanently overstuffed.',
    rust: 'Corroded orange patches break up Randy’s metal-filled Teddy face.',
    acid: 'Bright acid trails cut diagonally through Andy’s dissolving portrait.',
    mask: 'Dark respirator tiles turn Max’s face into a sealed gas-mask puzzle.',
    patchwork: 'Mismatched colored arrows stitch Pat’s borrowed face together.',
    plague: 'A dark central beak shape gives Plague Bear his unmistakable silhouette.'
  };
  return descriptions[feature] ?? 'Every arrow is part of the Toxic Teddy face.';
}

function playTone(frequency, duration) {
  if (!state.sound) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(.035, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + duration);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + duration);
  oscillator.addEventListener('ended', () => context.close());
}
function playVictory() {
  [330, 440, 554, 660].forEach((frequency, index) => window.setTimeout(() => playTone(frequency, .16), index * 105));
}

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
function mulberry32(seed) {
  return function random() {
    let value = seed += 0x6D2B79F5;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

boot();
