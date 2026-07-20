/* Toxic Teddies hard-mode visual and difficulty patch.
 * Uses the Arrow Escape 1.0.6 rules: path[0] is the head, the caret tip sits
 * exactly on that endpoint, and the body is pulled through head-first.
 */
(() => {
  const HARD_SOURCE_LEVEL = { 1: 3, 2: 4, 3: 5, 4: 4, 5: 5 };
  const DISPLAY_EXPRESSIONS = {
    1: 'NEUTRAL',
    2: 'EVIL GRIN',
    3: 'GROSS',
    4: 'ANGRY',
    5: 'MANIACAL LAUGH',
  };

  const baseOpenGame = openGame;
  const baseRenderHome = renderHome;

  openGame = async function hardOpenGame(index, level) {
    return baseOpenGame(0, level);
  };

  renderHome = function hardRenderHome() {
    baseRenderHome();
    [...els.teddyGrid.children].forEach((card, index) => {
      if (index === 0) {
        card.classList.add('playable-teddy');
        return;
      }
      card.classList.add('coming-soon-teddy');
      card.setAttribute('aria-label', `${TEDDIES[index].primary} coming soon`);
      const strong = card.querySelector('strong');
      if (strong) strong.textContent = 'SOON';
    });
  };

  fetchLevel = async function hardFetchLevel() {
    const requestedLevel = Math.max(1, Math.min(5, Number(state.level) || 1));
    const sourceLevel = HARD_SOURCE_LEVEL[requestedLevel];
    const response = await fetch(`./levels/tt01/level-${sourceLevel}.json?v=hard-v3`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Hard compiled level ${sourceLevel} is missing`);
    const data = await response.json();
    data.level = requestedLevel;
    data.sourceLevel = sourceLevel;
    data.teddy = 'tt01';
    data.characterName = 'Toxic Toby';
    data.expression = DISPLAY_EXPRESSIONS[requestedLevel].toLowerCase().replaceAll(' ', '_');
    data.difficulty = {
      mode: 'hard',
      sourceLevel,
      minimumPieces: requestedLevel === 1 ? 40 : requestedLevel === 2 ? 48 : 46,
    };
    data.animation = {
      ...(data.animation || {}),
      pauseMs: 90,
      baseSlideMs: 410,
      msPerCell: 34,
      minSlideMs: 720,
      maxSlideMs: 1250,
      fadeStart: 0.76,
      mode: 'head_first_pull_through',
    };
    return data;
  };

  function pointsForPiece(piece, unit) {
    const cells = piece._ropeCells || piece.cells;
    return cells.map(([row, col]) => ({ x: col * unit + unit / 2, y: row * unit + unit / 2 }));
  }

  function pathD(points) {
    if (!points.length) return '';
    return `M ${points[0].x} ${points[0].y}` + points.slice(1).map(point => ` L ${point.x} ${point.y}`).join('');
  }

  function attachedCaretD(head, direction, unit) {
    const dir = DIRS[direction];
    const tip = head;
    const headDepth = unit * 0.34;
    const halfWidth = unit * 0.22;
    const base = {
      x: tip.x - dir.dx * headDepth,
      y: tip.y - dir.dy * headDepth,
    };
    const perpendicularX = -dir.dy;
    const perpendicularY = dir.dx;
    return [
      `M ${base.x + perpendicularX * halfWidth} ${base.y + perpendicularY * halfWidth}`,
      `L ${tip.x} ${tip.y}`,
      `L ${base.x - perpendicularX * halfWidth} ${base.y - perpendicularY * halfWidth}`,
    ].join(' ');
  }

  renderBoard = function hardRenderBoard() {
    const unit = state.data.cellSize || 36;
    const sizePx = state.data.gridSize * unit;
    els.board.setAttribute('viewBox', `0 0 ${sizePx} ${sizePx}`);
    els.previewLayer.setAttribute('viewBox', `0 0 ${sizePx} ${sizePx}`);
    els.pieceLayer.innerHTML = '';
    els.previewLayer.innerHTML = '';

    const decorationLayer = createSvg('g', { class: 'compiled-decoration-layer', 'pointer-events': 'none' });
    renderDecorations(decorationLayer, unit);
    els.pieceLayer.append(decorationLayer);

    const playable = createSvg('g', { class: 'hard-piece-layer' });
    els.pieceLayer.append(playable);

    for (const piece of state.pieces) {
      const direction = piece._effectiveDirection || piece.exitDirection;
      const points = pointsForPiece(piece, unit);
      if (!points.length) continue;
      const group = createSvg('g', {
        class: `path-piece hard-path style-${piece.style || 'fur'}`,
        'data-id': piece.id,
      });
      const body = createSvg('path', { d: pathD(points), class: 'piece-line hard-rope-body' });
      const caret = createSvg('path', { d: attachedCaretD(points[0], direction, unit), class: 'piece-arrow hard-rope-caret' });
      const hit = createSvg('path', { d: pathD(points), class: 'piece-hit hard-rope-hit' });
      group.append(body, caret, hit);
      group.addEventListener('pointerdown', event => beginLongPress(event, piece));
      group.addEventListener('pointerup', endLongPress);
      group.addEventListener('pointercancel', endLongPress);
      group.addEventListener('pointerleave', cancelLongPress);
      group.addEventListener('click', event => {
        event.preventDefault();
        if (state.longPressTriggered) {
          state.longPressTriggered = false;
          return;
        }
        attemptMove(piece);
      });
      piece.element = group;
      piece._bodyElement = body;
      piece._caretElement = caret;
      piece._hitElement = hit;
      piece._stationaryPoints = points;
      playable.append(group);
    }
  };

  function cumulativeDistances(points) {
    const distances = [0];
    for (let index = 1; index < points.length; index += 1) {
      distances.push(distances[index - 1] + Math.hypot(
        points[index].x - points[index - 1].x,
        points[index].y - points[index - 1].y,
      ));
    }
    return distances;
  }

  function interpolate(points, distances, distance) {
    if (distance <= 0) return { ...points[0] };
    const last = distances.length - 1;
    if (distance >= distances[last]) return { ...points[last] };
    let low = 0;
    let high = last;
    while (low + 1 < high) {
      const middle = (low + high) >> 1;
      if (distances[middle] <= distance) low = middle;
      else high = middle;
    }
    const span = distances[high] - distances[low] || 1;
    const ratio = (distance - distances[low]) / span;
    return {
      x: points[low].x + (points[high].x - points[low].x) * ratio,
      y: points[low].y + (points[high].y - points[low].y) * ratio,
    };
  }

  function sliceTrack(points, distances, from, to) {
    if (from >= to) return [interpolate(points, distances, from)];
    const result = [interpolate(points, distances, from)];
    for (let index = 0; index < distances.length; index += 1) {
      if (distances[index] > from && distances[index] < to) result.push(points[index]);
    }
    result.push(interpolate(points, distances, to));
    return result;
  }

  function buildExitTrack(piece, unit) {
    const body = pointsForPiece(piece, unit);
    const direction = piece._effectiveDirection || piece.exitDirection;
    const dir = DIRS[direction];
    const head = body[0];
    const extensionCount = state.data.gridSize + 5;
    const track = [];
    for (let step = extensionCount; step >= 1; step -= 1) {
      track.push({ x: head.x + dir.dx * step * unit, y: head.y + dir.dy * step * unit });
    }
    track.push(...body);
    const distances = cumulativeDistances(track);
    return {
      track,
      distances,
      headDistance: distances[extensionCount],
      tailDistance: distances[track.length - 1],
      direction,
    };
  }

  function ease(value) {
    return value < 0.5
      ? 4 * value * value * value
      : 1 - Math.pow(-2 * value + 2, 3) / 2;
  }

  removePiece = function hardRemovePiece(piece) {
    state.transitionLock = true;
    const unit = state.data.cellSize || 36;
    const trackData = buildExitTrack(piece, unit);
    const animation = state.data.animation || {};
    const pauseMs = Number(animation.pauseMs ?? 90);
    const bodyLength = (piece._ropeCells || piece.cells).length;
    const durationMs = Math.max(
      Number(animation.minSlideMs ?? 720),
      Math.min(
        Number(animation.maxSlideMs ?? 1250),
        Number(animation.baseSlideMs ?? 410) + bodyLength * Number(animation.msPerCell ?? 34),
      ),
    );
    piece.element?.classList.add('escape-armed');
    setStatus('Arrowhead released…');

    setTimeout(() => {
      const start = performance.now();
      piece.element?.classList.add('rope-exiting');
      setStatus('The head is pulling the path out');
      const frame = now => {
        const raw = Math.min(1, (now - start) / durationMs);
        const traveled = ease(raw) * trackData.tailDistance;
        const from = Math.max(0, trackData.headDistance - traveled);
        const to = Math.max(0, trackData.tailDistance - traveled);
        const visible = sliceTrack(trackData.track, trackData.distances, from, to);
        piece._bodyElement?.setAttribute('d', pathD(visible));
        piece._hitElement?.setAttribute('d', pathD(visible));
        if (visible.length) piece._caretElement?.setAttribute('d', attachedCaretD(visible[0], trackData.direction, unit));
        const fadeStart = Number(animation.fadeStart ?? 0.76);
        if (raw > fadeStart && piece.element) {
          piece.element.style.opacity = String(1 - ((raw - fadeStart) / (1 - fadeStart)) * 0.90);
        }
        if (raw < 1) {
          requestAnimationFrame(frame);
          return;
        }
        piece.removed = true;
        piece.element?.classList.add('removed');
        state.active.delete(piece.id);
        state.transitionLock = false;
        updateProgress();
        if (!state.active.size) completeLevel();
      };
      requestAnimationFrame(frame);
    }, pauseMs);
  };

  const baseSetStatus = setStatus;
  setStatus = function hardSetStatus(text) {
    if (text.includes('find a clear exit') && state.data?.difficulty?.mode === 'hard') {
      baseSetStatus(`HARD · ${DISPLAY_EXPRESSIONS[state.level]} · FIND A CLEAR EXIT`);
      return;
    }
    baseSetStatus(text);
  };

  function applyBackdrop() {
    if (!state.data) return;
    els.boardBackdrop.style.backgroundImage = "url('./assets/backdrops/toxic-toby-expression-sheet.svg')";
    els.boardBackdrop.style.opacity = '.105';
    els.boardBackdrop.style.setProperty('--backdrop-position', ['4% 50%', '27% 50%', '50% 50%', '73% 50%', '96% 50%'][state.level - 1]);
    document.body.classList.add('toxic-parchment-mode');
  }

  const baseLoadLevel = loadLevel;
  loadLevel = async function hardLoadLevel() {
    state.teddyIndex = 0;
    await baseLoadLevel();
    applyBackdrop();
    renderBoard();
    updateProgress();
    baseSetStatus(`HARD · ${DISPLAY_EXPRESSIONS[state.level]} · FIND A CLEAR EXIT`);
  };

  setTimeout(() => {
    renderHome();
    if (!els.gameView.classList.contains('hidden')) {
      openGame(0, Math.max(1, Math.min(5, Number(state.level) || 1)));
    }
  }, 0);
})();
