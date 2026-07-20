/* Dense Toxic Toby runtime v5.
 * The face is now built from hundreds of playable arrow paths. Facial features
 * are encoded by path regions/styles instead of decorative SVG shapes.
 */
(() => {
  const DISPLAY_EXPRESSIONS = {
    1: 'NEUTRAL',
    2: 'EVIL GRIN',
    3: 'GROSS',
    4: 'ANGRY',
    5: 'MANIACAL LAUGH',
  };
  const FRONTIER = { 1: 4, 2: 3, 3: 2, 4: 2, 5: 1 };
  const baseOpenGame = openGame;
  const baseRenderHome = renderHome;
  const baseSetStatus = setStatus;

  openGame = async function denseOpenGame(_index, level) {
    return baseOpenGame(0, level);
  };

  renderHome = function denseRenderHome() {
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

  let denseLevelPackPromise = null;

  async function loadDenseLevelPack() {
    if (denseLevelPackPromise) return denseLevelPackPromise;
    denseLevelPackPromise = (async () => {
      const response = await fetch('./levels/tt01/dense-levels-v5.txt?v=5', { cache: 'no-store' });
      if (!response.ok) throw new Error('Dense Toxic Toby level pack is missing');
      const base64 = (await response.text()).trim();
      const binary = Uint8Array.from(atob(base64), character => character.charCodeAt(0));
      if (typeof DecompressionStream === 'function') {
        const stream = new Blob([binary]).stream().pipeThrough(new DecompressionStream('gzip'));
        return JSON.parse(await new Response(stream).text());
      }
      throw new Error('This browser cannot decompress the dense level pack');
    })();
    return denseLevelPackPromise;
  }

  fetchLevel = async function denseFetchLevel() {
    const level = Math.max(1, Math.min(5, Number(state.level) || 1));
    const pack = await loadDenseLevelPack();
    const data = structuredClone(pack[String(level)]);
    if (!data) throw new Error(`Dense Toxic Toby level ${level} is missing`);
    data.level = level;
    data.teddy = 'tt01';
    data.characterName = 'Toxic Toby';
    data.strictSequence = true;
    data.allowedFrontier = FRONTIER[level];
    data.animation = {
      ...(data.animation || {}),
      pauseMs: 90,
      baseSlideMs: 420,
      msPerCell: 34,
      minSlideMs: 760,
      maxSlideMs: 1420,
      fadeStart: 0.78,
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

  function headGeometry(head, direction, unit) {
    const dir = DIRS[direction];
    const depth = unit * 0.42;
    const halfWidth = unit * 0.19;
    const base = {
      x: head.x - dir.dx * depth,
      y: head.y - dir.dy * depth,
    };
    const px = -dir.dy;
    const py = dir.dx;
    return {
      base,
      triangle: [
        `M ${head.x} ${head.y}`,
        `L ${base.x + px * halfWidth} ${base.y + py * halfWidth}`,
        `L ${base.x - px * halfWidth} ${base.y - py * halfWidth}`,
        'Z',
      ].join(' '),
    };
  }

  function bodyD(points, direction, unit) {
    if (!points.length) return '';
    if (points.length === 1) return '';
    const geometry = headGeometry(points[0], direction, unit);
    const shaft = [geometry.base, ...points.slice(1)];
    return pathD(shaft);
  }

  function setPieceGeometry(piece, points, direction, unit) {
    if (!points.length) return;
    const geometry = headGeometry(points[0], direction, unit);
    piece._bodyElement?.setAttribute('d', bodyD(points, direction, unit));
    piece._hitElement?.setAttribute('d', pathD(points));
    piece._caretElement?.setAttribute('d', geometry.triangle);
  }

  renderBoard = function denseRenderBoard() {
    const unit = state.data.cellSize || 24;
    const sizePx = state.data.gridSize * unit;
    els.board.setAttribute('viewBox', `0 0 ${sizePx} ${sizePx}`);
    els.previewLayer.setAttribute('viewBox', `0 0 ${sizePx} ${sizePx}`);
    els.pieceLayer.innerHTML = '';
    els.previewLayer.innerHTML = '';

    const playable = createSvg('g', { class: 'dense-piece-layer' });
    els.pieceLayer.append(playable);

    for (const piece of state.pieces) {
      const direction = piece._effectiveDirection || piece.exitDirection;
      const points = pointsForPiece(piece, unit);
      if (points.length < 2) continue;
      const group = createSvg('g', {
        class: `path-piece dense-path style-${piece.style || 'fur'} region-${piece.region || 'fur'}`,
        'data-id': piece.id,
      });
      const body = createSvg('path', { d: bodyD(points, direction, unit), class: 'piece-line dense-rope-body' });
      const caret = createSvg('path', { d: headGeometry(points[0], direction, unit).triangle, class: 'piece-arrow dense-rope-head' });
      const hit = createSvg('path', { d: pathD(points), class: 'piece-hit dense-rope-hit' });
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

  function activeFrontier() {
    const order = state.data?.solutionOrder || [];
    const count = Number(state.data?.allowedFrontier || 1);
    return order.filter(id => state.active.has(id)).slice(0, count);
  }

  blockersAhead = function denseBlockersAhead(piece) {
    if (!state.data?.strictSequence) return [];
    const frontier = activeFrontier();
    if (frontier.includes(piece.id)) return [];
    const blocker = frontier.length ? state.byId.get(frontier[0]) : null;
    return blocker ? [blocker] : [];
  };

  attemptMove = function denseAttemptMove(piece) {
    if (state.transitionLock || piece.removed) return;
    clearPreview();
    const blockers = blockersAhead(piece);
    if (blockers.length) {
      loseLife(piece, blockers[0]);
      return;
    }
    removePiece(piece);
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
    const extensionCount = state.data.gridSize + 6;
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

  removePiece = function denseRemovePiece(piece) {
    state.transitionLock = true;
    piece.element?.parentNode?.appendChild(piece.element);
    const unit = state.data.cellSize || 24;
    const trackData = buildExitTrack(piece, unit);
    const animation = state.data.animation || {};
    const bodyLength = (piece._ropeCells || piece.cells).length;
    const durationMs = Math.max(
      Number(animation.minSlideMs ?? 760),
      Math.min(
        Number(animation.maxSlideMs ?? 1420),
        Number(animation.baseSlideMs ?? 420) + bodyLength * Number(animation.msPerCell ?? 34),
      ),
    );
    piece.element?.classList.add('escape-armed');
    setStatus('Arrowhead released…');

    setTimeout(() => {
      const start = performance.now();
      piece.element?.classList.add('rope-exiting');
      const frame = now => {
        const raw = Math.min(1, (now - start) / durationMs);
        const traveled = ease(raw) * trackData.tailDistance;
        const from = Math.max(0, trackData.headDistance - traveled);
        const to = Math.max(0, trackData.tailDistance - traveled);
        const visible = sliceTrack(trackData.track, trackData.distances, from, to);
        setPieceGeometry(piece, visible, trackData.direction, unit);
        const fadeStart = Number(animation.fadeStart ?? 0.78);
        if (raw > fadeStart && piece.element) {
          piece.element.style.opacity = String(1 - ((raw - fadeStart) / (1 - fadeStart)) * 0.92);
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
        else baseSetStatus(`BRUTAL · ${DISPLAY_EXPRESSIONS[state.level]} · ${state.active.size} ARROWS LEFT`);
      };
      requestAnimationFrame(frame);
    }, Number(animation.pauseMs ?? 90));
  };

  loseLife = function denseLoseLife(piece, blocker) {
    state.lives = Math.max(0, state.lives - 1);
    renderLives();
    piece.element?.classList.add('blocked-bump');
    blocker?.element?.classList.add('blocking');
    piece.element?.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(1.035)', offset: 0.45 },
      { transform: 'scale(1)' },
    ], { duration: 300, easing: 'cubic-bezier(.2,.8,.2,1)' });
    baseSetStatus('LOCKED · another arrow must leave first');
    navigator.vibrate?.([22, 16, 26]);
    setTimeout(() => {
      piece.element?.classList.remove('blocked-bump');
      blocker?.element?.classList.remove('blocking');
    }, 360);
    if (state.lives === 0) setTimeout(() => els.gameOverModal.classList.remove('hidden'), 260);
  };

  setStatus = function denseSetStatus(text) {
    if (text?.toLowerCase().includes('find a clear exit') && state.data?.strictSequence) {
      baseSetStatus(`BRUTAL · ${DISPLAY_EXPRESSIONS[state.level]} · FIND AN UNLOCKED ARROW`);
      return;
    }
    baseSetStatus(text);
  };

  function applyBackdrop() {
    els.boardBackdrop.style.backgroundImage = "url('./assets/backdrops/toxic-toby-expression-sheet.svg')";
    els.boardBackdrop.style.opacity = '.035';
    els.boardBackdrop.style.setProperty('--backdrop-position', ['4% 50%', '27% 50%', '50% 50%', '73% 50%', '96% 50%'][state.level - 1]);
    document.body.classList.add('toxic-parchment-mode', 'dense-toby-mode');
  }

  const baseLoadLevel = loadLevel;
  loadLevel = async function denseLoadLevel() {
    state.teddyIndex = 0;
    await baseLoadLevel();
    applyBackdrop();
    renderBoard();
    updateProgress();
    baseSetStatus(`BRUTAL · ${DISPLAY_EXPRESSIONS[state.level]} · FIND AN UNLOCKED ARROW`);
  };

  setTimeout(() => {
    renderHome();
    if (!els.gameView.classList.contains('hidden')) {
      openGame(0, Math.max(1, Math.min(5, Number(state.level) || 1)));
    }
  }, 0);
})();