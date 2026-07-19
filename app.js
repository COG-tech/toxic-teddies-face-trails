const STORAGE_KEY = "toxic-teddies-face-trails:v2";
const TOTAL_FOUNDING_TEDDIES = 12;

const els = {
  mapHost: document.querySelector("#mapHost"),
  loadingState: document.querySelector("#loadingState"),
  loadingText: document.querySelector("#loadingText"),
  lives: document.querySelector("#lives"),
  trailList: document.querySelector("#trailList"),
  segmentProgress: document.querySelector("#segmentProgress"),
  percentProgress: document.querySelector("#percentProgress"),
  instructionCard: document.querySelector("#instructionCard"),
  instructionTitle: document.querySelector("#instructionTitle"),
  instructionText: document.querySelector("#instructionText"),
  puzzleFrame: document.querySelector("#puzzleFrame"),
  mistakeFlash: document.querySelector("#mistakeFlash"),
  resetButton: document.querySelector("#resetButton"),
  hintButton: document.querySelector("#hintButton"),
  startButton: document.querySelector("#startButton"),
  completionModal: document.querySelector("#completionModal"),
  gameOverModal: document.querySelector("#gameOverModal"),
  revealHost: document.querySelector("#revealHost"),
  closeCompletion: document.querySelector("#closeCompletion"),
  replayButton: document.querySelector("#replayButton"),
  collectButton: document.querySelector("#collectButton"),
  tryAgainButton: document.querySelector("#tryAgainButton"),
  collectionButton: document.querySelector("#collectionButton"),
  collectionCount: document.querySelector("#collectionCount"),
  lockedPortrait: document.querySelector("#lockedPortrait"),
  soundButton: document.querySelector("#soundButton"),
  levelSelect: document.querySelector("#levelSelect"),
  levelKicker: document.querySelector("#levelKicker"),
  missionTitle: document.querySelector("#missionTitle"),
  alternateName: document.querySelector("#alternateName"),
  faceRuleText: document.querySelector("#faceRuleText"),
  routeTitle: document.querySelector("#routeTitle"),
  difficultyBadge: document.querySelector("#difficultyBadge"),
  rewardTitle: document.querySelector("#rewardTitle"),
  rewardText: document.querySelector("#rewardText"),
  completionTitle: document.querySelector("#completionTitle"),
  completionTagline: document.querySelector("#completionTagline"),
  loreCopy: document.querySelector("#loreCopy"),
  gameOverTitle: document.querySelector("#gameOverTitle")
};

const state = {
  levels: [],
  levelCharacters: new Map(),
  currentLevel: null,
  character: null,
  config: null,
  svg: null,
  segments: [],
  activeIndex: 0,
  lives: 3,
  tracing: false,
  pointerId: null,
  lastSampleIndex: 0,
  activeProgress: 0,
  started: false,
  completed: false,
  sound: true,
  save: loadSave()
};

function loadSave() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? { unlocked: [], completed: {}, lastLevelId: null };
  } catch {
    return { unlocked: [], completed: {}, lastLevelId: null };
  }
}

function persistSave() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.save));
  updateCollectionUI();
}

async function boot() {
  bindStaticEvents();
  try {
    const catalog = await fetchJson("./data/levels.json");
    state.levels = catalog.levels
      .filter((level) => level.status === "playable")
      .sort((a, b) => a.order - b.order);
    if (!state.levels.length) throw new Error("No playable level exists.");

    const characters = await Promise.all(
      state.levels.map(async (level) => [level.id, await fetchJson(level.characterPath)])
    );
    state.levelCharacters = new Map(characters);
    renderLevelSelector();

    const requestedId = new URLSearchParams(window.location.search).get("level");
    const initialId = state.levels.some((level) => level.id === requestedId)
      ? requestedId
      : state.levels.some((level) => level.id === state.save.lastLevelId)
        ? state.save.lastLevelId
        : state.levels[0].id;

    await loadLevel(initialId);
  } catch (error) {
    showLoadError(error);
  }
}

function bindStaticEvents() {
  els.mapHost.addEventListener("pointerdown", handlePointerDown);
  els.mapHost.addEventListener("pointermove", handlePointerMove);
  els.mapHost.addEventListener("pointerup", handlePointerUp);
  els.mapHost.addEventListener("pointercancel", handlePointerCancel);
  els.mapHost.addEventListener("lostpointercapture", handleLostPointerCapture);

  els.levelSelect.addEventListener("change", async (event) => {
    await loadLevel(event.target.value);
  });
  els.resetButton.addEventListener("click", () => resetGame({ restoreLives: true }));
  els.hintButton.addEventListener("click", showHint);
  els.startButton.addEventListener("click", startTracing);
  els.replayButton.addEventListener("click", () => {
    els.completionModal.hidden = true;
    resetGame({ restoreLives: true });
    startTracing();
  });
  els.collectButton.addEventListener("click", collectCharacter);
  els.closeCompletion.addEventListener("click", () => { els.completionModal.hidden = true; });
  els.tryAgainButton.addEventListener("click", () => {
    els.gameOverModal.hidden = true;
    resetGame({ restoreLives: true });
    startTracing();
  });
  els.soundButton.addEventListener("click", () => {
    state.sound = !state.sound;
    els.soundButton.textContent = state.sound ? "🔊" : "🔇";
    els.soundButton.setAttribute("aria-label", state.sound ? "Mute sound" : "Enable sound");
  });
  els.collectionButton.addEventListener("click", () => {
    document.querySelector(".reward-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

async function loadLevel(levelId) {
  const level = state.levels.find((candidate) => candidate.id === levelId);
  if (!level) throw new Error(`Unknown level: ${levelId}`);

  stopPointerCapture();
  state.started = false;
  state.completed = false;
  state.currentLevel = level;
  state.character = state.levelCharacters.get(level.id) ?? await fetchJson(level.characterPath);
  state.config = null;
  state.svg = null;
  state.segments = [];
  state.activeIndex = 0;
  state.activeProgress = 0;
  state.lives = state.character.lives ?? 3;

  els.completionModal.hidden = true;
  els.gameOverModal.hidden = true;
  els.loadingState.hidden = false;
  els.loadingText.textContent = `Growing ${state.character.primaryName}…`;
  els.mapHost.innerHTML = "";
  els.revealHost.innerHTML = "";
  els.startButton.disabled = true;
  els.startButton.textContent = "Loading face map";
  els.levelSelect.value = level.id;

  try {
    const [config, mapText, revealText] = await Promise.all([
      fetchJson(state.character.mapDataFile),
      fetchText(state.character.mapFile),
      fetchText(state.character.revealFile)
    ]);

    state.config = config;
    els.mapHost.innerHTML = mapText;
    els.revealHost.innerHTML = revealText;
    state.svg = els.mapHost.querySelector("svg");
    if (!state.svg) throw new Error("The face map SVG could not be loaded.");

    prepareSegments();
    renderCharacterUI();
    resetGame({ restoreLives: true });
    updateCollectionUI();

    state.save.lastLevelId = level.id;
    persistSave();
    updateLevelUrl(level.id);

    els.loadingState.hidden = true;
    els.startButton.disabled = false;
    els.startButton.textContent = "Start tracing";
  } catch (error) {
    showLoadError(error);
  }
}

function renderLevelSelector() {
  els.levelSelect.innerHTML = "";
  for (const level of state.levels) {
    const character = state.levelCharacters.get(level.id);
    const option = document.createElement("option");
    option.value = level.id;
    option.textContent = `${String(level.order).padStart(2, "0")} · ${character?.primaryName ?? level.id}`;
    els.levelSelect.append(option);
  }
}

function renderCharacterUI() {
  const character = state.character;
  const levelNumber = String(state.currentLevel.order).padStart(2, "0");
  const firstName = character.primaryName.split(" ")[0];
  const difficulty = String(character.difficulty ?? "easy").toUpperCase();

  document.title = `${character.primaryName} · Toxic Teddies Face Trails`;
  els.levelKicker.textContent = `LEVEL ${levelNumber} · ${difficulty}`;
  els.missionTitle.textContent = character.primaryName;
  els.alternateName.textContent = `also known as ${character.alternateName}`;
  els.mapHost.setAttribute("aria-label", `${character.primaryName} face tracing map`);
  els.faceRuleText.textContent = `Every trail follows ${character.primaryName}’s ears, eyes, damage, mouth, and mutation. This is not a maze placed over a picture.`;
  els.routeTitle.textContent = `${firstName}’s mutations`;
  els.difficultyBadge.textContent = difficulty;
  els.rewardTitle.textContent = `Reveal ${character.primaryName}`;
  els.rewardText.textContent = "Finish every face trail to unlock the full-color collection portrait.";
  els.lockedPortrait.setAttribute("aria-label", `Locked ${character.primaryName} portrait`);
  els.completionTitle.textContent = character.primaryName;
  els.completionTagline.textContent = character.tagline;
  els.loreCopy.textContent = character.lore;
  els.gameOverTitle.textContent = `${firstName} escaped your finger.`;
  els.collectButton.textContent = state.save.unlocked?.includes(character.id) ? "Collected ✓" : "Add to collection";
  els.collectButton.disabled = state.save.unlocked?.includes(character.id);
}

function prepareSegments() {
  state.segments = state.config.segments
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((config) => {
      const path = state.svg.querySelector(`[data-segment-id="${selectorEscape(config.id)}"]`);
      if (!path) throw new Error(`Missing SVG path for segment: ${config.id}`);

      const totalLength = path.getTotalLength();
      const sampleCount = state.config.sampleCount ?? 360;
      const samples = Array.from({ length: sampleCount + 1 }, (_, index) => {
        const distanceAlongPath = (index / sampleCount) * totalLength;
        const point = path.getPointAtLength(distanceAlongPath);
        return { x: point.x, y: point.y, distanceAlongPath };
      });

      const progressPath = path.cloneNode(true);
      progressPath.removeAttribute("data-segment-id");
      progressPath.classList.add("trace-progress");
      progressPath.style.stroke = "#b6f23b";
      progressPath.style.strokeWidth = "21";
      progressPath.style.filter = "drop-shadow(0 0 8px rgba(155, 218, 39, .7))";
      progressPath.style.pointerEvents = "none";
      progressPath.style.strokeDasharray = `${totalLength}`;
      progressPath.style.strokeDashoffset = `${totalLength}`;
      path.parentNode.insertBefore(progressPath, path.nextSibling);
      path.style.cursor = "crosshair";

      return { ...config, path, progressPath, totalLength, samples, complete: false };
    });
}

function startTracing() {
  if (!state.svg || state.completed) return;
  state.started = true;
  els.startButton.textContent = "Tracing active";
  els.startButton.disabled = true;
  announceCurrentSegment();
  pulseStartMarker();
}

function handlePointerDown(event) {
  if (!state.started || state.completed || state.tracing || !state.svg) return;
  const segment = currentSegment();
  if (!segment) return;

  const point = clientToSvg(event.clientX, event.clientY);
  const startSampleIndex = segment.direction === "reverse" ? segment.samples.length - 1 : 0;
  const startPoint = segment.samples[startSampleIndex];

  if (distance(point, startPoint) > (state.config.startRadius ?? 40)) {
    failAttempt("Wrong starting point", `Begin at the glowing marker for ${segment.label}.`);
    return;
  }

  state.tracing = true;
  state.pointerId = event.pointerId;
  state.lastSampleIndex = startSampleIndex;
  state.activeProgress = 0;
  els.mapHost.setPointerCapture(event.pointerId);
  updateInstruction("Keep tracing", `Stay inside ${segment.label.toLowerCase()} and follow the arrow.`, false);
  event.preventDefault();
}

function handlePointerMove(event) {
  if (!state.tracing || event.pointerId !== state.pointerId) return;
  const segment = currentSegment();
  const point = clientToSvg(event.clientX, event.clientY);
  const nearest = findNearestSample(segment, point);

  if (nearest.distance > segment.tolerance) {
    failAttempt("You left the Teddy’s face", `The trail is only ${segment.tolerance} units wide.`, true);
    return;
  }

  const allowance = state.config.backtrackAllowance ?? 7;
  const isForward = segment.direction !== "reverse";
  const movedWrongWay = isForward
    ? nearest.index < state.lastSampleIndex - allowance
    : nearest.index > state.lastSampleIndex + allowance;

  if (movedWrongWay) {
    failAttempt("Wrong direction", "Follow the arrows through the mutation.", true);
    return;
  }

  state.lastSampleIndex = isForward
    ? Math.max(state.lastSampleIndex, nearest.index)
    : Math.min(state.lastSampleIndex, nearest.index);

  const denominator = segment.samples.length - 1;
  state.activeProgress = isForward
    ? state.lastSampleIndex / denominator
    : 1 - state.lastSampleIndex / denominator;

  paintProgress(segment, state.activeProgress);
  updateProgressUI();
  event.preventDefault();
}

function handlePointerUp(event) {
  if (!state.tracing || event.pointerId !== state.pointerId) return;
  releasePointer(event.pointerId);
  if (state.activeProgress >= 0.965) completeCurrentSegment();
  else failAttempt("Trail interrupted", "Finish the entire mutation before lifting your finger.");
}

function handlePointerCancel(event) {
  if (state.tracing && event.pointerId === state.pointerId) {
    releasePointer(event.pointerId);
    failAttempt("Trail interrupted", "Keep your finger on the face until the segment is finished.");
  }
}

function handleLostPointerCapture() {
  if (state.tracing) {
    state.tracing = false;
    state.pointerId = null;
  }
}

function stopPointerCapture() {
  if (state.pointerId !== null) releasePointer(state.pointerId);
}

function releasePointer(pointerId) {
  if (els.mapHost.hasPointerCapture?.(pointerId)) els.mapHost.releasePointerCapture(pointerId);
  state.tracing = false;
  state.pointerId = null;
}

function completeCurrentSegment() {
  const segment = currentSegment();
  segment.complete = true;
  paintProgress(segment, 1);
  state.activeProgress = 0;
  state.activeIndex += 1;
  playTone(620, 0.08);
  renderTrailList();
  updateProgressUI();

  if (state.activeIndex >= state.segments.length) {
    completeLevel();
    return;
  }

  activateSegment(state.activeIndex);
  announceCurrentSegment();
  pulseStartMarker();
}

function completeLevel() {
  state.completed = true;
  state.started = false;
  state.save.completed[state.character.id] = {
    completedAt: new Date().toISOString(),
    livesRemaining: state.lives
  };
  persistSave();
  playVictory();
  updateInstruction("Face map complete", `${state.character.primaryName} is ready for the collection.`, false);
  setTimeout(() => { els.completionModal.hidden = false; }, 420);
}

function collectCharacter() {
  const unlocked = new Set(state.save.unlocked ?? []);
  unlocked.add(state.character.id);
  state.save.unlocked = [...unlocked];
  persistSave();
  els.collectButton.textContent = "Collected ✓";
  els.collectButton.disabled = true;
  setTimeout(() => { els.completionModal.hidden = true; }, 650);
}

function failAttempt(title, message, pointerAlreadyActive = false) {
  if (pointerAlreadyActive && state.pointerId !== null) releasePointer(state.pointerId);
  const segment = currentSegment();
  if (segment && !segment.complete) paintProgress(segment, 0);
  state.activeProgress = 0;
  state.lives = Math.max(0, state.lives - 1);
  renderLives();
  updateProgressUI();
  updateInstruction(title, message, true);
  flashMistake();
  playTone(115, 0.16);

  if (state.lives === 0) {
    state.started = false;
    setTimeout(() => { els.gameOverModal.hidden = false; }, 430);
  } else {
    pulseStartMarker();
  }
}

function resetGame({ restoreLives }) {
  stopPointerCapture();
  state.segments.forEach((segment) => {
    segment.complete = false;
    paintProgress(segment, 0);
  });
  state.activeIndex = 0;
  state.activeProgress = 0;
  state.completed = false;
  state.started = false;
  if (restoreLives) state.lives = state.character?.lives ?? 3;
  renderLives();
  renderTrailList();
  updateProgressUI();
  activateSegment(0);
  updateInstruction("Start at the glowing marker", `Follow each arrow without leaving ${state.character?.primaryName ?? "the Teddy"}’s face.`, false);
  els.startButton.disabled = false;
  els.startButton.textContent = "Start tracing";
}

function activateSegment(index) {
  state.segments.forEach((segment, segmentIndex) => {
    segment.path.style.opacity = segmentIndex === index ? "1" : segment.complete ? "0.38" : "0.58";
    segment.path.style.strokeWidth = segmentIndex === index ? "21" : "18";
  });

  state.svg?.querySelectorAll("[data-start-for]").forEach((marker) => {
    const active = marker.getAttribute("data-start-for") === state.segments[index]?.id;
    marker.setAttribute("r", active ? "15" : "10");
    marker.setAttribute("fill", active ? "#d8ff5b" : "#b6c77e");
    marker.setAttribute("opacity", active ? "1" : "0.55");
    marker.style.filter = active ? "url(#glow)" : "none";
  });
}

function currentSegment() {
  return state.segments[state.activeIndex] ?? null;
}

function paintProgress(segment, progress) {
  const bounded = Math.max(0, Math.min(1, progress));
  segment.progressPath.style.strokeDashoffset = `${segment.totalLength * (1 - bounded)}`;
}

function findNearestSample(segment, point) {
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let index = 0; index < segment.samples.length; index += 1) {
    const sampleDistance = distance(point, segment.samples[index]);
    if (sampleDistance < bestDistance) {
      bestDistance = sampleDistance;
      bestIndex = index;
    }
  }
  return { index: bestIndex, distance: bestDistance };
}

function clientToSvg(clientX, clientY) {
  const matrix = state.svg?.getScreenCTM();
  if (!matrix) return { x: 0, y: 0 };
  const point = new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse());
  return { x: point.x, y: point.y };
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function renderLives() {
  els.lives.innerHTML = "";
  const maximum = state.character?.lives ?? 3;
  for (let index = 0; index < maximum; index += 1) {
    const drop = document.createElement("span");
    drop.className = `toxic-drop${index >= state.lives ? " lost" : ""}`;
    drop.textContent = "💧";
    drop.setAttribute("aria-hidden", "true");
    els.lives.append(drop);
  }
  els.lives.setAttribute("aria-label", `${state.lives} toxic drops remaining`);
}

function renderTrailList() {
  els.trailList.innerHTML = "";
  state.segments.forEach((segment, index) => {
    const item = document.createElement("li");
    item.textContent = segment.label;
    if (segment.complete) item.classList.add("complete");
    else if (index === state.activeIndex) item.classList.add("active");
    els.trailList.append(item);
  });
}

function updateProgressUI() {
  const completedCount = state.segments.filter((segment) => segment.complete).length;
  const fractional = completedCount + (state.completed ? 0 : state.activeProgress);
  const percent = state.segments.length ? Math.round((fractional / state.segments.length) * 100) : 0;
  els.segmentProgress.textContent = `${completedCount} / ${state.segments.length} trails`;
  els.percentProgress.textContent = `${percent}%`;
}

function updateCollectionUI() {
  const unlockedCount = new Set(state.save.unlocked ?? []).size;
  els.collectionCount.textContent = `${unlockedCount} / ${TOTAL_FOUNDING_TEDDIES}`;
  els.lockedPortrait.classList.remove("unlocked");
  els.lockedPortrait.textContent = "?";

  if (state.character && state.save.unlocked?.includes(state.character.id)) {
    els.lockedPortrait.classList.add("unlocked");
    fetch(state.character.revealFile)
      .then((response) => response.text())
      .then((svg) => { els.lockedPortrait.innerHTML = svg; })
      .catch(() => { els.lockedPortrait.textContent = "✓"; });
  }
}

function announceCurrentSegment() {
  const segment = currentSegment();
  if (!segment) return;
  updateInstruction(`Trace ${segment.label}`, `Trail ${state.activeIndex + 1} of ${state.segments.length}. Start at the glowing marker.`, false);
}

function updateInstruction(title, message, isError) {
  els.instructionTitle.textContent = title;
  els.instructionText.textContent = message;
  els.instructionCard.classList.toggle("error", isError);
  els.instructionCard.querySelector(".instruction-icon").textContent = isError ? "⚠" : "☝";
}

function pulseStartMarker() {
  const segment = currentSegment();
  if (!segment || !state.svg) return;
  const marker = state.svg.querySelector(`[data-start-for="${selectorEscape(segment.id)}"]`);
  if (!marker?.animate) return;
  marker.animate(
    [
      { transform: "scale(1)", transformOrigin: "center", opacity: 1 },
      { transform: "scale(1.45)", transformOrigin: "center", opacity: 0.58 },
      { transform: "scale(1)", transformOrigin: "center", opacity: 1 }
    ],
    { duration: 900, iterations: 2 }
  );
}

function showHint() {
  const segment = currentSegment();
  if (!segment) return;
  segment.path.animate(
    [{ stroke: "#413822" }, { stroke: "#d8ff5b" }, { stroke: "#413822" }],
    { duration: 750, iterations: 2 }
  );
  pulseStartMarker();
  updateInstruction(`Hint: ${segment.label}`, "Begin at the glowing dot and move in the same direction as the closest arrow.", false);
}

function flashMistake() {
  els.mistakeFlash.classList.remove("active");
  els.puzzleFrame.classList.remove("shake");
  void els.mistakeFlash.offsetWidth;
  els.mistakeFlash.classList.add("active");
  els.puzzleFrame.classList.add("shake");
  setTimeout(() => {
    els.mistakeFlash.classList.remove("active");
    els.puzzleFrame.classList.remove("shake");
  }, 430);
  if (navigator.vibrate) navigator.vibrate([45, 30, 60]);
}

function playTone(frequency, seconds) {
  if (!state.sound) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "sawtooth";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.045, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + seconds);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + seconds);
  oscillator.addEventListener("ended", () => context.close());
}

function playVictory() {
  [330, 440, 660].forEach((frequency, index) => {
    setTimeout(() => playTone(frequency, 0.18), index * 130);
  });
}

function updateLevelUrl(levelId) {
  const url = new URL(window.location.href);
  url.searchParams.set("level", levelId);
  window.history.replaceState({}, "", url);
}

function showLoadError(error) {
  console.error(error);
  els.loadingState.hidden = false;
  els.loadingState.innerHTML = `<p>⚠ ${escapeHtml(error.message)}</p>`;
  els.startButton.disabled = true;
  els.startButton.textContent = "Level unavailable";
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load ${url}`);
  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load ${url}`);
  return response.text();
}

function selectorEscape(value) {
  if (window.CSS?.escape) return CSS.escape(value);
  return String(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[character]);
}

boot();
