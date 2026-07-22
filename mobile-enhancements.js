/* Native-mobile integration layer. Runs after the preserved puzzle runtime and
 * before boot(), so it can wrap existing functions without changing maze art.
 */
(() => {
  const saveStore = window.ToxicSaveStore;
  const content = window.ToxicContent;
  let loadingLevel = false;

  if (saveStore) state.save = saveStore.getSnapshot();
  if (!state.save.completed) state.save.completed = {};

  const baseRenderHome = renderHome;
  const baseLoadLevel = loadLevel;
  const baseUpdateProgress = updateProgress;
  const baseCompleteLevel = completeLevel;
  const baseResetLevel = resetLevel;
  const baseShowHome = showHome;
  const baseSetStatus = setStatus;
  const basePersist = persist;
  const baseRemovePiece = removePiece;

  function currentLevelEntry() {
    return content?.getLevel(teddy().id, state.level) || null;
  }

  function currentSessionKey() {
    return levelKey(teddy().id, state.level);
  }

  function removedPathIds() {
    return state.pieces.filter(piece => piece.removed || !state.active.has(piece.id)).map(piece => piece.id);
  }

  async function persistCurrentSession() {
    if (!saveStore || loadingLevel || !state.data) return;
    state.save.activeSession = {
      levelKey: currentSessionKey(),
      teddyId: teddy().id,
      level: state.level,
      expressionId: state.data.expression,
      levelVersion: state.data.levelVersion || currentLevelEntry()?.version || 1,
      compilerVersion: state.data.compilerVersion || content?.compilerVersion || 'unknown',
      contentVersion: content?.contentVersion || window.ToxicBuildInfo?.contentVersion || 'unknown',
      removedPathIds: removedPathIds(),
      updatedAt: new Date().toISOString(),
    };
    await saveStore.replace(state.save);
  }

  function applySavedSession() {
    const session = state.save.activeSession;
    if (!session || session.levelKey !== currentSessionKey()) return;
    const entry = currentLevelEntry();
    const versionMatches = Number(session.levelVersion || 1) === Number(entry?.version || 1);
    const compilerMatches = !session.compilerVersion
      || session.compilerVersion === (state.data.compilerVersion || content?.compilerVersion);
    const contentMatches = !session.contentVersion
      || session.contentVersion === (content?.contentVersion || window.ToxicBuildInfo?.contentVersion);
    if (!versionMatches || !compilerMatches || !contentMatches) {
      state.save.activeSession = null;
      saveStore?.replace(state.save);
      window.ToxicAccessibility?.announce?.('The puzzle was updated, so this expression restarted safely.');
      return;
    }

    const removed = new Set(session.removedPathIds || []);
    for (const piece of state.pieces) {
      if (!removed.has(piece.id)) continue;
      piece.removed = true;
      state.active.delete(piece.id);
      piece.element?.classList.add('removed');
    }
  }

  function applyBackdrop() {
    const backdrop = content?.getBackdrop(teddy().id, state.data?.expression);
    if (!backdrop) {
      els.boardBackdrop.style.backgroundImage = 'none';
      els.boardBackdrop.style.opacity = '0';
      return;
    }
    els.boardBackdrop.style.backgroundImage = `url('${backdrop.src}')`;
    els.boardBackdrop.style.backgroundPosition = '50% 50%';
    els.boardBackdrop.style.backgroundSize = 'cover';
    els.boardBackdrop.style.opacity = String(backdrop.opacity ?? 0.055);
    els.boardBackdrop.style.setProperty('--backdrop-contrast', String(backdrop.contrast ?? 0.9));
    els.boardBackdrop.style.setProperty('--backdrop-saturation', String(backdrop.saturation ?? 0.62));
    els.boardBackdrop.style.setProperty('--backdrop-blur', `${backdrop.blur_px ?? 0}px`);
  }

  function updateAccessibleMoves() {
    window.ToxicAccessibility?.update?.(state, {blockersAhead, attemptMove});
  }

  persist = function nativePersist() {
    basePersist();
    saveStore?.replace(state.save);
  };

  renderHome = function manifestRenderHome() {
    baseRenderHome();
    const cards = [...els.teddyGrid.children];
    cards.forEach((card, index) => {
      const item = TEDDIES[index];
      const playable = content?.isPlayable(item.id, 1) ?? index === 0;
      card.disabled = !playable;
      card.setAttribute('aria-disabled', String(!playable));
      if (!playable) {
        card.classList.add('coming-soon-teddy');
        const strong = card.querySelector('strong');
        if (strong) strong.textContent = 'COMING SOON';
      }
    });
  };

  updateCollectionCounter = function honestCollectionCounter() {
    const playable = content?.playableCount() || 5;
    const completedCount = Object.keys(state.save.completed || {})
      .filter(key => key.startsWith('tt01-l'))
      .length;
    els.collectionCounter.textContent = `${completedCount} / ${playable}`;
    els.collectionCounter.title = `${playable} playable now · 60-level Founding 12 roadmap`;
  };

  openGame = async function manifestOpenGame(index, level) {
    const item = TEDDIES[index];
    if (!item || !content?.isPlayable(item.id, level)) {
      window.ToxicAccessibility?.announce?.(`${item?.primary || 'This Teddy'} is coming soon.`);
      return;
    }
    state.teddyIndex = index;
    state.level = level;
    els.homeView.classList.add('hidden');
    els.gameView.classList.remove('hidden');
    const url = new URL(location.href);
    url.searchParams.set('teddy', teddy().id);
    url.searchParams.set('level', String(level));
    history.replaceState({}, '', url);
    await loadLevel();
  };

  loadLevel = async function nativeLoadLevel() {
    loadingLevel = true;
    await baseLoadLevel();
    applySavedSession();
    applyBackdrop();
    loadingLevel = false;
    updateProgress();
    updateAccessibleMoves();
    window.__toxicInputController?.refresh?.();
  };

  updateProgress = function nativeUpdateProgress() {
    baseUpdateProgress();
    updateAccessibleMoves();
    persistCurrentSession();
  };

  resetLevel = function nativeResetLevel() {
    state.save.activeSession = null;
    saveStore?.replace(state.save);
    return baseResetLevel();
  };

  showHome = function nativeShowHome() {
    persistCurrentSession();
    return baseShowHome();
  };

  completeLevel = function nativeCompleteLevel() {
    state.save.activeSession = null;
    const expression = String(state.data?.expression || '').replaceAll('_', ' ');
    window.__toxicCurrentLevelSummary = {
      title: 'Toxic Teddies: Arrow Escape',
      text: `I cleared Toxic Toby's ${expression} face. The face is the puzzle.`,
    };
    window.ToxicNative?.hapticComplete?.();
    window.ToxicAccessibility?.announce?.(`${expression} expression cleared.`);
    baseCompleteLevel();
    saveStore?.replace(state.save);
  };

  setStatus = function accessibleStatus(text) {
    baseSetStatus(text);
    window.ToxicAccessibility?.announce?.(text);
  };

  renderLives = function disabledLives() {
    state.lives = 3;
    els.lives.innerHTML = '';
    els.lives.hidden = true;
    els.lives.setAttribute('aria-hidden', 'true');
  };

  removePiece = function accessibleRemoval(piece) {
    if (!document.documentElement.classList.contains('reduced-motion')) {
      baseRemovePiece(piece);
      return;
    }
    state.transitionLock = true;
    piece.element?.classList.add('rope-exiting');
    piece.element?.animate([
      {opacity: 1},
      {opacity: 0},
    ], {duration: 220, easing: 'ease-out'}).finished.finally(() => {
      piece.removed = true;
      piece.element?.classList.add('removed');
      state.active.delete(piece.id);
      state.transitionLock = false;
      updateProgress();
      if (!state.active.size) completeLevel();
    });
  };

  window.__toxicPersistCurrentSession = persistCurrentSession;
})();
