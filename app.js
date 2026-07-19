import { TEDDIES, LEVELS_PER_TEDDY, TOTAL_LEVELS } from './characters.js';

const STORAGE_KEY = 'toxic-teddies-arrow-escape:toxic-face-v2';
const DIRS = {
  up: { dr: -1, dc: 0, dx: 0, dy: -1 },
  right: { dr: 0, dc: 1, dx: 1, dy: 0 },
  down: { dr: 1, dc: 0, dx: 0, dy: 1 },
  left: { dr: 0, dc: -1, dx: -1, dy: 0 }
};
const LEVELS = [
  { name: 'EASY', cols: 15, rows: 15, min: 3, max: 6 },
  { name: 'GROSS', cols: 17, rows: 17, min: 3, max: 7 },
  { name: 'TOXIC', cols: 19, rows: 19, min: 3, max: 8 },
  { name: 'VILE', cols: 21, rows: 21, min: 3, max: 9 },
  { name: 'LEGENDARY', cols: 23, rows: 23, min: 3, max: 10 }
];

const els = Object.fromEntries([
  'homeView','gameView','teddyGrid','collectionCounter','backButton','levelTitle','characterName','lives','clearProgress','percentProgress','board','boardBackdrop','pieceLayer','previewLayer','statusText','resetButton','hintButton','levelButtons','completionModal','completionTitle','completionCopy','replayButton','nextButton','gameOverModal','tryAgainButton'
].map(id => [id, document.getElementById(id)]));

const state = {
  teddyIndex: 0,
  level: 1,
  puzzle: null,
  lives: 3,
  transitionLock: false,
  pressTimer: null,
  longPressTriggered: false,
  previewTimer: null,
  save: loadSave()
};

function loadSave() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { completed: {} }; }
  catch { return { completed: {} }; }
}
function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.save));
  updateCollectionCounter();
}
function levelKey(teddyId, level) { return `${teddyId}-l${level}`; }
function completed(teddyId, level) { return Boolean(state.save.completed[levelKey(teddyId, level)]); }
function unlocked(teddyId, level) { return level === 1 || completed(teddyId, level - 1); }
function currentTeddy() { return TEDDIES[state.teddyIndex]; }
function currentLevel() { return LEVELS[state.level - 1]; }
function cellKey(row, col) { return `${row}:${col}`; }

function boot() {
  bindEvents();
  renderHome();
  updateCollectionCounter();
  const params = new URLSearchParams(location.search);
  const teddyId = params.get('teddy');
  const level = Number(params.get('level'));
  const index = TEDDIES.findIndex(t => t.id === teddyId);
  if (index >= 0) openGame(index, Number.isInteger(level) && level >= 1 && level <= LEVELS_PER_TEDDY ? level : 1);
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
}

function bindEvents() {
  els.backButton.addEventListener('click', showHome);
  els.resetButton.addEventListener('click', resetLevel);
  els.hintButton.addEventListener('click', showHint);
  els.replayButton.addEventListener('click', () => { hideModals(); resetLevel(); });
  els.nextButton.addEventListener('click', goNext);
  els.tryAgainButton.addEventListener('click', () => { hideModals(); resetLevel(); });
  window.addEventListener('blur', clearPressTimer);
}

function renderHome() {
  els.teddyGrid.innerHTML = '';
  TEDDIES.forEach((teddy, index) => {
    const done = Array.from({ length: LEVELS_PER_TEDDY }, (_, i) => completed(teddy.id, i + 1)).filter(Boolean).length;
    const card = document.createElement('button');
    card.className = 'teddy-card';
    card.type = 'button';
    card.style.setProperty('--card-accent', teddy.accent);
    card.innerHTML = `
      <div class="teddy-card-art"><span class="mini-button-eye"></span><span class="mini-eye"></span><span class="mini-grin">▥</span></div>
      <div><h3>${teddy.primary}</h3><p>${teddy.alternate}</p><strong>${done}/5</strong></div>`;
    card.addEventListener('click', () => openGame(index, latestUnlocked(teddy)));
    els.teddyGrid.append(card);
  });
}

function latestUnlocked(teddy) {
  let target = 1;
  for (let level = 1; level <= LEVELS_PER_TEDDY; level += 1) if (unlocked(teddy.id, level)) target = level;
  return target;
}

function showHome() {
  clearPreview();
  clearPressTimer();
  els.gameView.classList.add('hidden');
  els.homeView.classList.remove('hidden');
  document.body.classList.remove('game-active');
  history.replaceState({}, '', location.pathname);
  renderHome();
}

function openGame(teddyIndex, level) {
  state.teddyIndex = teddyIndex;
  state.level = level;
  els.homeView.classList.add('hidden');
  els.gameView.classList.remove('hidden');
  document.body.classList.add('game-active');
  const url = new URL(location.href);
  url.searchParams.set('teddy', currentTeddy().id);
  url.searchParams.set('level', String(level));
  history.replaceState({}, '', url);
  buildLevel();
}

function buildLevel() {
  const teddy = currentTeddy();
  const cfg = currentLevel();
  state.lives = 3;
  state.transitionLock = false;
  state.puzzle = generateSolvablePuzzle(teddy, state.level, cfg);
  els.levelTitle.textContent = `Level ${state.level}`;
  els.characterName.textContent = teddy.primary;
  document.documentElement.style.setProperty('--active-accent', teddy.accent);
  els.boardBackdrop.style.backgroundImage = "url('./assets/backdrops/toxic-toby-expression-sheet.svg')";
  els.board.style.setProperty('--cols', cfg.cols);
  els.board.style.setProperty('--rows', cfg.rows);
  els.board.setAttribute('viewBox', `0 0 ${cfg.cols * 50} ${cfg.rows * 50}`);
  renderPieces();
  renderLives();
  renderLevelButtons();
  updateProgress();
  setStatus(`${cfg.name} · clear the open arrow paths`);
}

function resetLevel() {
  clearPreview();
  clearPressTimer();
  hideModals();
  buildLevel();
}

function renderLevelButtons() {
  els.levelButtons.innerHTML = '';
  const teddy = currentTeddy();
  for (let level = 1; level <= LEVELS_PER_TEDDY; level += 1) {
    const button = document.createElement('button');
    button.textContent = level;
    button.className = 'level-chip';
    if (level === state.level) button.classList.add('active');
    if (completed(teddy.id, level)) button.classList.add('done');
    if (!unlocked(teddy.id, level)) button.disabled = true;
    button.addEventListener('click', () => openGame(state.teddyIndex, level));
    els.levelButtons.append(button);
  }
}

function renderLives() {
  els.lives.innerHTML = '';
  for (let i = 0; i < 3; i += 1) {
    const drop = document.createElement('span');
    drop.className = `life-drop${i >= state.lives ? ' lost' : ''}`;
    els.lives.append(drop);
  }
}

function renderPieces() {
  els.pieceLayer.innerHTML = '';
  const cfg = currentLevel();
  const teddy = currentTeddy();
  const ns = 'http://www.w3.org/2000/svg';
  const defs = document.createElementNS(ns, 'defs');
  defs.innerHTML = `
    <filter id="toxicGlow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <marker id="pieceArrowToxic" viewBox="0 0 16 16" refX="13" refY="8" markerWidth="8" markerHeight="8" orient="auto" markerUnits="strokeWidth"><path d="M1 1L14 8L1 15" fill="none" stroke="#b7ec2e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></marker><marker id="pieceArrowStitch" viewBox="0 0 16 16" refX="13" refY="8" markerWidth="8" markerHeight="8" orient="auto" markerUnits="strokeWidth"><path d="M1 1L14 8L1 15" fill="none" stroke="#9b5427" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></marker><marker id="pieceArrowRust" viewBox="0 0 16 16" refX="13" refY="8" markerWidth="8" markerHeight="8" orient="auto" markerUnits="strokeWidth"><path d="M1 1L14 8L1 15" fill="none" stroke="#d17a36" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></marker>`;
  els.pieceLayer.append(defs);
  els.pieceLayer.append(renderFaceFeatures(cfg, teddy, ns));

  state.puzzle.pieces.forEach(piece => {
    const group = document.createElementNS(ns, 'g');
    group.classList.add('path-piece', `piece-${piece.variant}`);
    group.dataset.id = piece.id;
    const points = piece.cells.map(({ row, col }) => `${col * 50 + 25},${row * 50 + 25}`).join(' ');
    const visible = document.createElementNS(ns, 'polyline');
    visible.setAttribute('points', points);
    visible.setAttribute('class', 'piece-line');
    visible.setAttribute('marker-end', `url(#pieceArrow${piece.variant === 'stitch' ? 'Stitch' : piece.variant === 'rust' ? 'Rust' : 'Toxic'})`);
    const hit = document.createElementNS(ns, 'polyline');
    hit.setAttribute('points', points);
    hit.setAttribute('class', 'piece-hit');
    group.append(visible, hit);
    group.addEventListener('pointerdown', event => beginLongPress(event, piece));
    group.addEventListener('pointerup', endLongPress);
    group.addEventListener('pointercancel', endLongPress);
    group.addEventListener('pointerleave', cancelLongPress);
    group.addEventListener('click', event => {
      event.preventDefault();
      if (state.longPressTriggered) { state.longPressTriggered = false; return; }
      attemptMove(piece);
    });
    piece.element = group;
    els.pieceLayer.append(group);
  });
  els.previewLayer.setAttribute('viewBox', `0 0 ${cfg.cols * 50} ${cfg.rows * 50}`);
}

function renderFaceFeatures(cfg, teddy, ns) {
  const width = cfg.cols * 50;
  const height = cfg.rows * 50;
  const cx = width / 2;
  const eyeY = height * .43;
  const eyeOffset = width * .21;
  const eyeR = width * .105;
  const group = document.createElementNS(ns, 'g');
  group.setAttribute('class', 'face-features');
  group.setAttribute('pointer-events', 'none');
  const accent = teddy.accent;
  group.innerHTML = `
    <g class="center-stitches">
      <path d="M${cx} ${height*.08}V${height*.48}" />
      ${Array.from({length:8},(_,i)=>{const y=height*(.12+i*.045);return `<path d="M${cx-width*.035} ${y}H${cx+width*.035}"/>`;}).join('')}
    </g>
    <g class="button-eye">
      <circle cx="${cx-eyeOffset}" cy="${eyeY}" r="${eyeR}" />
      <path d="M${cx-eyeOffset-eyeR*.38} ${eyeY-eyeR*.38}L${cx-eyeOffset+eyeR*.38} ${eyeY+eyeR*.38}M${cx-eyeOffset+eyeR*.38} ${eyeY-eyeR*.38}L${cx-eyeOffset-eyeR*.38} ${eyeY+eyeR*.38}" />
    </g>
    <g class="infected-eye">
      <circle class="eye-white" cx="${cx+eyeOffset}" cy="${eyeY}" r="${eyeR}" />
      <circle class="iris" cx="${cx+eyeOffset}" cy="${eyeY}" r="${eyeR*.48}" fill="${accent}" />
      <circle class="pupil" cx="${cx+eyeOffset}" cy="${eyeY}" r="${eyeR*.18}" />
      <path class="eye-drip" d="M${cx+eyeOffset-eyeR*.52} ${eyeY+eyeR*.72}Q${cx+eyeOffset-eyeR*.42} ${eyeY+eyeR*1.22} ${cx+eyeOffset-eyeR*.28} ${eyeY+eyeR*.72}M${cx+eyeOffset+eyeR*.2} ${eyeY+eyeR*.78}Q${cx+eyeOffset+eyeR*.34} ${eyeY+eyeR*1.35} ${cx+eyeOffset+eyeR*.48} ${eyeY+eyeR*.76}" />
    </g>
    <g class="nose-feature">
      <ellipse cx="${cx}" cy="${height*.60}" rx="${width*.095}" ry="${height*.055}" />
      <path d="M${cx-width*.035} ${height*.595}Q${cx} ${height*.62} ${cx+width*.035} ${height*.595}" />
    </g>
    <g class="mouth-feature">
      <path class="mouth-bg" d="M${cx-width*.32} ${height*.70}Q${cx} ${height*.86} ${cx+width*.32} ${height*.70}Q${cx} ${height*.79} ${cx-width*.32} ${height*.70}Z" />
      ${Array.from({length:9},(_,i)=>{const x=cx-width*.27+i*width*.0675;const y=height*(i%2? .735:.72);return `<rect x="${x}" y="${y}" width="${width*.052}" height="${height*.07}" rx="${width*.008}"/>`;}).join('')}
    </g>
    <g class="cheek-patch">
      <path d="M${width*.09} ${height*.63}L${width*.22} ${height*.58}L${width*.25} ${height*.72}L${width*.12} ${height*.77}Z" />
      ${Array.from({length:5},(_,i)=>`<path d="M${width*(.105+i*.026)} ${height*.62}L${width*(.125+i*.026)} ${height*.75}"/>`).join('')}
    </g>`;
  return group;
}

function beginLongPress(event, piece) {
  if (state.transitionLock || piece.removed) return;
  clearPressTimer();
  state.longPressTriggered = false;
  state.pressTimer = window.setTimeout(() => {
    state.longPressTriggered = true;
    previewPiece(piece);
    navigator.vibrate?.(20);
  }, 450);
  event.currentTarget.setPointerCapture?.(event.pointerId);
}
function endLongPress() { clearPressTimer(); }
function cancelLongPress() { clearPressTimer(); }
function clearPressTimer() {
  if (state.pressTimer) clearTimeout(state.pressTimer);
  state.pressTimer = null;
}

function previewPiece(piece) {
  clearPreview();
  const blockers = blockersAhead(piece);
  piece.element.classList.add('inspecting');
  if (blockers[0]) blockers[0].element.classList.add('blocking');
  drawPreviewRay(piece, blockers.length > 0);
  setStatus(blockers.length ? 'Blocked — clear the first path in this lane' : 'Open lane — this path can leave now');
  state.previewTimer = setTimeout(clearPreview, 1500);
}

function drawPreviewRay(piece, blocked) {
  const ns = 'http://www.w3.org/2000/svg';
  const cfg = currentLevel();
  const lead = piece.cells[piece.cells.length - 1];
  const dir = DIRS[piece.dir];
  const x1 = lead.col * 50 + 25;
  const y1 = lead.row * 50 + 25;
  const x2 = dir.dc > 0 ? cfg.cols * 50 : dir.dc < 0 ? 0 : x1;
  const y2 = dir.dr > 0 ? cfg.rows * 50 : dir.dr < 0 ? 0 : y1;
  const line = document.createElementNS(ns, 'line');
  line.setAttribute('x1', x1); line.setAttribute('y1', y1);
  line.setAttribute('x2', x2); line.setAttribute('y2', y2);
  line.setAttribute('class', `preview-ray${blocked ? ' blocked' : ''}`);
  els.previewLayer.append(line);
}

function clearPreview() {
  if (state.previewTimer) clearTimeout(state.previewTimer);
  state.previewTimer = null;
  els.previewLayer.innerHTML = '';
  state.puzzle?.pieces.forEach(piece => piece.element?.classList.remove('inspecting', 'blocking', 'hinting'));
}

function attemptMove(piece) {
  if (state.transitionLock || piece.removed || !state.puzzle.active.has(piece.id)) return;
  clearPreview();
  const blockers = blockersAhead(piece);
  if (blockers.length) { loseLife(piece, blockers[0]); return; }
  removePiece(piece);
}

function removePiece(piece) {
  state.transitionLock = true;
  const dir = DIRS[piece.dir];
  piece.element.style.setProperty('--exit-x', `${dir.dx * 130}%`);
  piece.element.style.setProperty('--exit-y', `${dir.dy * 130}%`);
  piece.element.classList.add('exiting');
  setStatus('Lane cleared');
  setTimeout(() => {
    piece.removed = true;
    piece.element.classList.add('removed');
    state.puzzle.active.delete(piece.id);
    state.puzzle.cleared += 1;
    state.transitionLock = false;
    updateProgress();
    if (state.puzzle.active.size === 0) completeLevel();
  }, 300);
}

function loseLife(piece, blocker) {
  state.lives = Math.max(0, state.lives - 1);
  renderLives();
  piece.element.classList.remove('blocked-bump');
  blocker.element.classList.add('blocking');
  void piece.element.getBoundingClientRect();
  piece.element.classList.add('blocked-bump');
  setStatus('Blocked path — one toxic drop lost');
  navigator.vibrate?.([35, 25, 45]);
  setTimeout(() => blocker.element?.classList.remove('blocking'), 650);
  if (state.lives === 0) setTimeout(() => els.gameOverModal.classList.remove('hidden'), 350);
}

function blockersAhead(piece) {
  const cfg = currentLevel();
  const dir = DIRS[piece.dir];
  const blockers = [];
  const seen = new Set();
  for (const cell of piece.cells) {
    let row = cell.row + dir.dr;
    let col = cell.col + dir.dc;
    while (row >= 0 && row < cfg.rows && col >= 0 && col < cfg.cols) {
      const occupantId = state.puzzle.occupancy.get(cellKey(row, col));
      if (occupantId && occupantId !== piece.id && state.puzzle.active.has(occupantId) && !seen.has(occupantId)) {
        seen.add(occupantId);
        blockers.push(state.puzzle.byId.get(occupantId));
        break;
      }
      row += dir.dr;
      col += dir.dc;
    }
  }
  return blockers;
}

function showHint() {
  clearPreview();
  const open = [...state.puzzle.active.values()].filter(piece => blockersAhead(piece).length === 0);
  if (!open.length) return;
  const rng = mulberry32(hashString(`${currentTeddy().id}:${state.level}:${state.puzzle.cleared}:hint`));
  const piece = open[Math.floor(rng() * open.length)];
  piece.element.classList.add('hinting');
  drawPreviewRay(piece, false);
  setStatus('This path has an open lane');
  state.previewTimer = setTimeout(clearPreview, 1800);
}

function updateProgress() {
  const total = state.puzzle.pieces.length;
  const cleared = state.puzzle.cleared;
  els.clearProgress.textContent = `${cleared} / ${total}`;
  els.percentProgress.textContent = `${Math.round((cleared / total) * 100)}%`;
}
function updateCollectionCounter() {
  els.collectionCounter.textContent = `${Object.keys(state.save.completed).length} / ${TOTAL_LEVELS}`;
}
function setStatus(text) { els.statusText.textContent = text; }

function completeLevel() {
  const teddy = currentTeddy();
  state.save.completed[levelKey(teddy.id, state.level)] = { completedAt: new Date().toISOString(), lives: state.lives };
  persist();
  renderLevelButtons();
  els.completionTitle.textContent = `${teddy.primary} · Level ${state.level}`;
  els.completionCopy.textContent = state.level === 5 ? `${teddy.primary}'s five-level face set is cleared.` : `Level ${state.level + 1} is unlocked.`;
  els.nextButton.textContent = state.level === 5 ? 'Choose another Teddy' : `Play level ${state.level + 1}`;
  setTimeout(() => els.completionModal.classList.remove('hidden'), 320);
}
function goNext() {
  hideModals();
  if (state.level < 5) openGame(state.teddyIndex, state.level + 1);
  else showHome();
}
function hideModals() {
  els.completionModal.classList.add('hidden');
  els.gameOverModal.classList.add('hidden');
}

function generateSolvablePuzzle(teddy, level, cfg) {
  for (let attempt = 0; attempt < 140; attempt += 1) {
    const rng = mulberry32(hashString(`${teddy.id}:${level}:toxic-face:${attempt}`));
    const pieces = buildPieces(cfg, rng, teddy);
    const solved = assignDirections(pieces, cfg, rng);
    if (solved && pieces.length >= 20) return makePuzzle(pieces);
  }
  const fallback = buildFallbackPieces(cfg, teddy);
  assignDirections(fallback, cfg, mulberry32(99));
  return makePuzzle(fallback);
}

function makePuzzle(pieces) {
  const occupancy = new Map();
  const byId = new Map();
  pieces.forEach(piece => {
    byId.set(piece.id, piece);
    piece.cells.forEach(cell => occupancy.set(cellKey(cell.row, cell.col), piece.id));
    piece.removed = false;
    piece.element = null;
  });
  return { pieces, occupancy, byId, active: new Map(pieces.map(piece => [piece.id, piece])), cleared: 0 };
}

function buildPieces(cfg, rng, teddy) {
  const mask = buildTeddyMask(cfg);
  const used = new Set();
  const pieces = [];
  let id = 0;
  const add = (cells, variant = 'toxic') => {
    const clean = cells.filter(cell => mask.has(cellKey(cell.row, cell.col)) && !used.has(cellKey(cell.row, cell.col)));
    if (clean.length < 2 || clean.length !== cells.length) return false;
    clean.forEach(cell => used.add(cellKey(cell.row, cell.col)));
    pieces.push({ id: `p${id++}`, cells: clean, variant });
    return true;
  };

  const cx = Math.floor(cfg.cols / 2);
  const earY = Math.floor(cfg.rows * .18);
  const earOffset = Math.floor(cfg.cols * .34);
  const eyeY = Math.floor(cfg.rows * .43);
  const eyeOffset = Math.floor(cfg.cols * .21);

  add(rectRing(cx - earOffset, earY, Math.max(2, Math.floor(cfg.cols * .12))), 'toxic');
  add(rectRing(cx + earOffset, earY, Math.max(2, Math.floor(cfg.cols * .12))), 'stitch');
  add(rectRing(cx - eyeOffset, eyeY, Math.max(2, Math.floor(cfg.cols * .10))), 'toxic');
  add(rectRing(cx + eyeOffset, eyeY, Math.max(2, Math.floor(cfg.cols * .10))), 'toxic');

  const seam = [];
  for (let row = Math.floor(cfg.rows * .08); row <= Math.floor(cfg.rows * .50); row += 1) seam.push({ row, col: cx });
  splitRun(seam, 3, 5, rng).forEach(chunk => add(chunk, 'stitch'));

  const brows = [
    lineCells(Math.floor(cfg.rows*.31), Math.floor(cfg.cols*.22), Math.floor(cfg.cols*.43), true),
    lineCells(Math.floor(cfg.rows*.31), Math.floor(cfg.cols*.57), Math.floor(cfg.cols*.78), true)
  ];
  brows.forEach(cells => splitRun(cells, 3, 6, rng).forEach(chunk => add(chunk, 'toxic')));

  for (let row = 0; row < cfg.rows; row += 1) {
    if (row % 3 === 2) continue;
    let col = 0;
    while (col < cfg.cols) {
      while (col < cfg.cols && (!mask.has(cellKey(row, col)) || used.has(cellKey(row, col)))) col += 1;
      const run = [];
      while (col < cfg.cols && mask.has(cellKey(row, col)) && !used.has(cellKey(row, col))) { run.push({ row, col }); col += 1; }
      splitRun(run, cfg.min, cfg.max, rng).forEach(chunk => add(chunk, variantFor(chunk, cfg, teddy)));
    }
  }

  for (let col = 0; col < cfg.cols; col += 1) {
    let row = 0;
    while (row < cfg.rows) {
      while (row < cfg.rows && (!mask.has(cellKey(row, col)) || used.has(cellKey(row, col)))) row += 1;
      const run = [];
      while (row < cfg.rows && mask.has(cellKey(row, col)) && !used.has(cellKey(row, col))) { run.push({ row, col }); row += 1; }
      splitRun(run, cfg.min, cfg.max, rng).forEach(chunk => add(chunk, variantFor(chunk, cfg, teddy)));
    }
  }
  return pieces;
}

function lineCells(row, start, end, horizontal) {
  const cells = [];
  if (horizontal) for (let col = start; col <= end; col += 1) cells.push({ row, col });
  else for (let r = start; r <= end; r += 1) cells.push({ row: r, col: row });
  return cells;
}

function rectRing(centerX, centerY, radius) {
  const cells = [];
  for (let x = centerX - radius; x <= centerX + radius; x += 1) cells.push({ row: centerY - radius, col: x });
  for (let y = centerY - radius + 1; y <= centerY + radius; y += 1) cells.push({ row: y, col: centerX + radius });
  for (let x = centerX + radius - 1; x >= centerX - radius; x -= 1) cells.push({ row: centerY + radius, col: x });
  for (let y = centerY + radius - 1; y > centerY - radius; y -= 1) cells.push({ row: y, col: centerX - radius });
  return cells;
}

function variantFor(cells, cfg, teddy) {
  const avgCol = cells.reduce((sum, c) => sum + c.col, 0) / cells.length;
  const avgRow = cells.reduce((sum, c) => sum + c.row, 0) / cells.length;
  const center = Math.abs(avgCol - cfg.cols / 2) < 1.2;
  const earBand = avgRow < cfg.rows * .30 && (avgCol < cfg.cols * .28 || avgCol > cfg.cols * .72);
  const featureBand = teddy.feature === 'rust' || teddy.feature === 'trash' || teddy.feature === 'patchwork';
  if (center || earBand) return 'stitch';
  if (featureBand && (Math.floor(avgRow + avgCol) % 5 === 0)) return 'rust';
  return 'toxic';
}

function splitRun(run, min, max, rng) {
  const chunks = [];
  let index = 0;
  while (run.length - index >= min) {
    const remaining = run.length - index;
    let length = Math.min(max, Math.max(min, Math.floor(min + rng() * (max - min + 1))));
    if (remaining - length === 1) length -= 1;
    if (length < min) break;
    chunks.push(run.slice(index, index + length));
    index += length;
  }
  return chunks;
}

function buildTeddyMask(cfg) {
  const mask = new Set();
  for (let row = 0; row < cfg.rows; row += 1) {
    for (let col = 0; col < cfg.cols; col += 1) {
      const x = (col / (cfg.cols - 1)) * 2 - 1;
      const y = (row / (cfg.rows - 1)) * 2 - 1;
      const head = ellipse(x, y, 0, .02, .79, .82);
      const leftEar = ellipse(x, y, -.67, -.68, .31, .31);
      const rightEar = ellipse(x, y, .67, -.68, .31, .31);
      const silhouette = head || leftEar || rightEar;
      if (!silhouette) continue;
      const leftEyeHole = ellipse(x, y, -.23, -.13, .13, .13);
      const rightEyeHole = ellipse(x, y, .23, -.13, .13, .13);
      const noseHole = ellipse(x, y, 0, .20, .13, .09);
      const mouthHole = ellipse(x, y, 0, .50, .40, .15);
      const innerEarHole = ellipse(x, y, -.67, -.68, .13, .13) || ellipse(x, y, .67, -.68, .13, .13);
      if (leftEyeHole || rightEyeHole || noseHole || mouthHole || innerEarHole) continue;
      mask.add(cellKey(row, col));
    }
  }
  return mask;
}
function ellipse(x, y, cx, cy, rx, ry) { return ((x - cx) ** 2) / (rx ** 2) + ((y - cy) ** 2) / (ry ** 2) <= 1; }

function assignDirections(pieces, cfg, rng) {
  const occupancy = new Map();
  pieces.forEach(piece => piece.cells.forEach(cell => occupancy.set(cellKey(cell.row, cell.col), piece.id)));
  const active = new Set(pieces.map(piece => piece.id));
  const byId = new Map(pieces.map(piece => [piece.id, piece]));
  let safety = pieces.length * 7;
  while (active.size && safety-- > 0) {
    const candidates = [];
    for (const id of active) {
      const piece = byId.get(id);
      endpointOptions(piece).forEach(option => {
        if (canExitStatic(piece, option.dir, cfg, occupancy, active)) candidates.push({ piece, ...option });
      });
    }
    if (!candidates.length) return false;
    const edgeBiased = candidates.sort((a, b) => edgeScore(b.piece, b.dir, cfg) - edgeScore(a.piece, a.dir, cfg));
    const pool = edgeBiased.slice(0, Math.max(1, Math.ceil(edgeBiased.length * .48)));
    const choice = pool[Math.floor(rng() * pool.length)];
    if (choice.reverse) choice.piece.cells.reverse();
    choice.piece.dir = choice.dir;
    active.delete(choice.piece.id);
  }
  return active.size === 0;
}

function endpointOptions(piece) {
  if (piece.cells.length < 2) return [];
  const first = piece.cells[0], second = piece.cells[1];
  const beforeLast = piece.cells[piece.cells.length - 2], last = piece.cells[piece.cells.length - 1];
  const startDir = directionFrom(second, first);
  const endDir = directionFrom(beforeLast, last);
  const options = [];
  if (startDir) options.push({ dir: startDir, reverse: true });
  if (endDir) options.push({ dir: endDir, reverse: false });
  return options;
}
function directionFrom(a, b) {
  const dr = b.row - a.row, dc = b.col - a.col;
  if (dr === -1 && dc === 0) return 'up';
  if (dr === 1 && dc === 0) return 'down';
  if (dr === 0 && dc === -1) return 'left';
  if (dr === 0 && dc === 1) return 'right';
  return null;
}
function canExitStatic(piece, dirName, cfg, occupancy, active) {
  const dir = DIRS[dirName];
  for (const cell of piece.cells) {
    let row = cell.row + dir.dr, col = cell.col + dir.dc;
    while (row >= 0 && row < cfg.rows && col >= 0 && col < cfg.cols) {
      const occupant = occupancy.get(cellKey(row, col));
      if (occupant && occupant !== piece.id && active.has(occupant)) return false;
      row += dir.dr; col += dir.dc;
    }
  }
  return true;
}
function edgeScore(piece, dirName, cfg) {
  const lead = dirName === 'left' || dirName === 'up' ? piece.cells[0] : piece.cells[piece.cells.length - 1];
  if (dirName === 'left') return cfg.cols - lead.col;
  if (dirName === 'right') return lead.col;
  if (dirName === 'up') return cfg.rows - lead.row;
  return lead.row;
}

function buildFallbackPieces(cfg, teddy) {
  const mask = buildTeddyMask(cfg);
  const pieces = [];
  let id = 0;
  for (let row = 0; row < cfg.rows; row += 1) {
    let run = [];
    for (let col = 0; col < cfg.cols; col += 1) {
      if (mask.has(cellKey(row, col))) run.push({ row, col });
      else {
        if (run.length >= 2) {
          const cells = run;
          pieces.push({ id: `f${id++}`, cells, variant: variantFor(cells, cfg, teddy) });
        }
        run = [];
      }
    }
    if (run.length >= 2) {
      const cells = run;
      pieces.push({ id: `f${id++}`, cells, variant: variantFor(cells, cfg, teddy) });
    }
  }
  return pieces;
}

function hashString(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) { hash ^= value.charCodeAt(i); hash = Math.imul(hash, 16777619); }
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