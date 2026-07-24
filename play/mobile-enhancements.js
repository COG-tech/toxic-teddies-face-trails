/* Native-mobile integration layer. Runs after the preserved puzzle runtime and
 * before boot(), so it can wrap existing functions without changing maze art.
 */
(() => {
  const saveStore = window.ToxicSaveStore;
  const content = window.ToxicContent;
  const progression = window.ToxicProgression;
  const analytics = window.ToxicAnalytics;
  let loadingLevel = false;
  let advancingCompletion = false;
  let pendingCompletion = null;

  if (!progression) throw new Error('Toxic Teddies progression rules are unavailable');
  if (saveStore) state.save = saveStore.getSnapshot();
  if (!state.save.completed) state.save.completed = {};
  if (!state.save.teddyCompletion) state.save.teddyCompletion = {};
  if (!state.save.feedUnlocks) state.save.feedUnlocks = {};
  if (!state.save.viewedFeedPosts) state.save.viewedFeedPosts = {};

  const baseBoot = boot;
  const baseBindEvents = bindEvents;
  const baseRenderHome = renderHome;
  const baseLoadLevel = loadLevel;
  const baseUpdateProgress = updateProgress;
  const baseResetLevel = resetLevel;
  const baseShowHome = showHome;
  const baseSetStatus = setStatus;
  const basePersist = persist;
  const baseRemovePiece = removePiece;

  const feedView = document.getElementById('feedView');
  const feedButton = document.getElementById('feedButton');
  const feedUnreadBadge = document.getElementById('feedUnreadBadge');
  const feedUnreadSummary = document.getElementById('feedUnreadSummary');
  const feedPosts = document.getElementById('feedPosts');
  const feedTitle = document.getElementById('feedTitle');
  const feedDisplayName = document.getElementById('feedDisplayName');
  const feedHandle = document.getElementById('feedHandle');
  const feedBio = document.getElementById('feedBio');
  const feedProgress = document.getElementById('feedProgress');
  const feedAvatar = document.getElementById('feedAvatar');
  const completionArt = document.getElementById('completionArt');
  const completionArtLabel = document.getElementById('completionArtLabel');
  const completionEyebrow = document.getElementById('completionEyebrow');
  const completionBackButton = document.getElementById('completionBackButton');

  function currentLevelEntry() {
    return content?.getLevel(teddy().id, state.level) || null;
  }

  function currentSessionKey() {
    return levelKey(teddy().id, state.level);
  }

  function expressionLabel(expressionId = state.data?.expression) {
    return content?.getExpression(expressionId)?.label
      || String(expressionId || 'Expression').replaceAll('_', ' ');
  }

  function removedPathIds() {
    return state.pieces.filter(piece => piece.removed || !state.active.has(piece.id)).map(piece => piece.id);
  }

  function feedPostIds(teddyId) {
    return content?.getFeed(teddyId)?.posts?.map(post => post.id) || [];
  }

  function feedUnreadCount(teddyId) {
    return progression.unreadFeedPostCount(state.save, teddyId, feedPostIds(teddyId));
  }

  function canOpenFeed(teddyId) {
    return progression.canOpenFeed(state.save, teddyId, LEVELS_PER_TEDDY);
  }

  function completionRoute(teddyId, level) {
    return progression.completionDestinationForContent({
      teddyId,
      level,
      total: LEVELS_PER_TEDDY,
      levels: content?.levels || [],
      feedAvailable: Boolean(content?.getFeed(teddyId)),
    });
  }

  function setCompletionBusy(busy) {
    advancingCompletion = busy;
    els.nextButton.disabled = busy;
    els.nextButton.setAttribute('aria-busy', String(busy));
  }

  function clearPendingCompletion() {
    pendingCompletion = null;
    setCompletionBusy(false);
  }

  function saveSnapshot(nextSave = state.save) {
    state.save = nextSave;
    saveStore?.replace(state.save);
  }

  async function persistCurrentSession() {
    if (!saveStore || loadingLevel || !state.data) return;
    if (!state.active.size || completed(teddy().id, state.level)) {
      state.save.activeSession = null;
      await saveStore.replace(state.save);
      return;
    }
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

  function applyCompletionReveal() {
    const expressionId = state.data?.expression;
    const reveal = content?.getReveal(teddy().id, expressionId);
    const label = expressionLabel(expressionId);
    if (!completionArt) return;

    completionArt.dataset.expression = expressionId || 'neutral';
    completionArt.classList.toggle('completion-art-placeholder', !reveal?.image_src);
    completionArt.style.backgroundImage = reveal?.image_src ? `url('${reveal.image_src}')` : 'none';
    completionArt.setAttribute(
      'aria-label',
      reveal?.image_src ? `${teddy().primary} ${label} completed artwork` : `${teddy().primary} ${label} artwork placeholder`,
    );
    if (completionArtLabel) {
      completionArtLabel.textContent = reveal?.image_src
        ? `${teddy().primary} — ${label}`
        : `${label} artwork slot ready for your final image`;
    }
  }

  function updateAccessibleMoves() {
    window.ToxicAccessibility?.update?.(state, {blockersAhead, attemptMove});
  }

  function updateFeedAccess() {
    const teddyId = 'tt01';
    const unlocked = canOpenFeed(teddyId);
    feedButton?.classList.toggle('hidden', !unlocked);
    if (!unlocked) return;
    const unread = feedUnreadCount(teddyId);
    if (feedUnreadBadge) {
      feedUnreadBadge.hidden = unread === 0;
      feedUnreadBadge.textContent = String(unread);
    }
  }

  function hideAllPrimaryViews() {
    els.homeView.classList.add('hidden');
    els.gameView.classList.add('hidden');
    feedView?.classList.add('hidden');
  }

  function updateFeedUnreadUi(teddyId) {
    const unread = feedUnreadCount(teddyId);
    if (feedUnreadSummary) feedUnreadSummary.textContent = unread ? `${unread} unread` : 'All posts viewed';
    if (feedUnreadBadge) {
      feedUnreadBadge.hidden = unread === 0;
      feedUnreadBadge.textContent = String(unread);
    }
  }

  function createFeedPost(teddyId, feed, post) {
    const viewed = new Set(state.save.viewedFeedPosts?.[teddyId] || []).has(post.id);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `feed-post${viewed ? ' viewed' : ''}`;
    button.dataset.postId = post.id;
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML = `
      <span class="feed-post-header">
        <span><strong>${feed.display_name}</strong> <span class="feed-post-handle">${feed.handle}</span></span>
        <span>${post.posted_label}</span>
      </span>
      <span class="feed-post-body">${post.text}</span>
      <span class="feed-post-footer"><span>${post.reaction}</span><span>Tap to reveal reply</span></span>
      <span class="feed-post-reply">
        <strong>${post.reply?.author || ''}</strong>
        <span class="feed-post-handle">${post.reply?.handle || ''}</span><br />
        ${post.reply?.text || ''}
      </span>
    `;
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      button.classList.toggle('expanded', !expanded);
      if (expanded) return;
      state.save = progression.markFeedPostViewed(state.save, teddyId, post.id);
      button.classList.add('viewed');
      saveStore?.replace(state.save);
      updateFeedUnreadUi(teddyId);
      analytics?.track('feed_post_view', {
        teddy_id: teddyId,
        post_id: post.id,
      }).catch(console.error);
    });
    return button;
  }

  async function openFeed(teddyId = 'tt01') {
    if (!canOpenFeed(teddyId)) {
      showHome();
      window.ToxicAccessibility?.announce?.('Complete all five Toxic Toby expressions to unlock the private feed.');
      return false;
    }
    const feed = content?.getFeed(teddyId);
    const character = content?.getCharacter(teddyId);
    if (!feed || !character) return false;

    hideModals();
    hideAllPrimaryViews();
    feedView?.classList.remove('hidden');
    feedTitle.textContent = character.primary;
    feedDisplayName.textContent = feed.display_name;
    feedHandle.textContent = feed.handle;
    feedBio.textContent = feed.bio;
    feedProgress.textContent = `${progression.completedExpressionCount(state.save, teddyId)} / ${LEVELS_PER_TEDDY} expressions cleared`;
    feedAvatar?.classList.add('feed-avatar-placeholder');
    if (feedPosts) {
      feedPosts.innerHTML = '';
      for (const post of feed.posts) feedPosts.append(createFeedPost(teddyId, feed, post));
    }
    updateFeedUnreadUi(teddyId);

    const url = new URL(location.href);
    url.search = '';
    url.searchParams.set('feed', teddyId);
    history.replaceState({}, '', url);
    window.ToxicAccessibility?.announce?.(`${character.primary} private feed opened.`);
    await analytics?.track('feed_open', {
      teddy_id: teddyId,
      completed_expressions: progression.completedExpressionCount(state.save, teddyId),
    }).catch(console.error);
    return true;
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
    updateFeedAccess();
  };

  updateCollectionCounter = function honestCollectionCounter() {
    const playable = content?.playableCount() || 5;
    const completedCount = progression.completedExpressionCount(state.save, 'tt01', LEVELS_PER_TEDDY);
    els.collectionCounter.textContent = `${completedCount} / ${playable}`;
    els.collectionCounter.title = `${playable} playable now · 60-level Founding 12 roadmap`;
  };

  openGame = async function manifestOpenGame(index, requestedLevel, options = {}) {
    const item = TEDDIES[index];
    if (!item || !Number.isInteger(requestedLevel)) {
      window.ToxicAccessibility?.announce?.('That expression could not be opened.');
      return false;
    }

    const requestedIsUnlocked = unlocked(item.id, requestedLevel);
    const level = requestedIsUnlocked
      ? requestedLevel
      : options.requireExact
        ? null
        : latestUnlocked(item);
    if (!level || !content?.isPlayable(item.id, level)) {
      const message = options.requireExact
        ? `${item.primary} expression ${requestedLevel} is not ready to open.`
        : `${item.primary} is coming soon.`;
      window.ToxicAccessibility?.announce?.(message);
      return false;
    }

    state.teddyIndex = index;
    state.level = level;
    feedView?.classList.add('hidden');
    els.homeView.classList.add('hidden');
    els.gameView.classList.remove('hidden');
    const url = new URL(location.href);
    url.search = '';
    url.searchParams.set('teddy', teddy().id);
    url.searchParams.set('level', String(level));
    history.replaceState({}, '', url);

    const loaded = await loadLevel();
    if (!loaded) {
      window.ToxicAccessibility?.announce?.(`${item.primary} expression ${level} failed to load.`);
      return false;
    }
    return state.level === level && Number(state.data?.level) === level;
  };

  loadLevel = async function nativeLoadLevel() {
    loadingLevel = true;
    const expectedTeddyId = teddy().id;
    const expectedLevel = state.level;
    try {
      await baseLoadLevel();
      const loaded = (
        state.data?.teddy === expectedTeddyId
        && Number(state.data?.level) === expectedLevel
        && state.transitionLock === false
      );
      if (!loaded) return false;
      applySavedSession();
      applyBackdrop();
      updateProgress();
      updateAccessibleMoves();
      window.__toxicInputController?.refresh?.();
      return true;
    } finally {
      loadingLevel = false;
    }
  };

  updateProgress = function nativeUpdateProgress() {
    baseUpdateProgress();
    updateAccessibleMoves();
    persistCurrentSession();
  };

  resetLevel = function nativeResetLevel() {
    clearPendingCompletion();
    state.save.activeSession = null;
    saveStore?.replace(state.save);
    return baseResetLevel();
  };

  showHome = function nativeShowHome() {
    clearPendingCompletion();
    if (!els.gameView.classList.contains('hidden')) persistCurrentSession();
    feedView?.classList.add('hidden');
    return baseShowHome();
  };

  completeLevel = function nativeCompleteLevel() {
    const teddyId = teddy().id;
    const currentLevel = state.level;
    const wasFeedUnlocked = canOpenFeed(teddyId);
    state.save = progression.completeExpression(state.save, teddyId, currentLevel, LEVELS_PER_TEDDY);
    persist();
    renderLevelButtons();

    const label = expressionLabel();
    const completedCount = progression.completedExpressionCount(state.save, teddyId, LEVELS_PER_TEDDY);
    const finalExpression = currentLevel === LEVELS_PER_TEDDY;
    applyCompletionReveal();

    try {
      pendingCompletion = {
        ...completionRoute(teddyId, currentLevel),
        teddyIndex: state.teddyIndex,
        expressionId: state.data?.expression,
      };
    } catch (error) {
      console.error(error);
      pendingCompletion = null;
    }

    window.__toxicCurrentLevelSummary = {
      title: 'Toxic Teddies: Arrow Escape',
      text: finalExpression
        ? `I completed all five ${teddy().primary} expressions and unlocked the private Toxic Feed.`
        : `I cleared ${teddy().primary}'s ${label} face. The face is the puzzle.`,
    };
    window.ToxicNative?.hapticComplete?.();

    if (completionEyebrow) completionEyebrow.textContent = finalExpression ? 'TEDDY COMPLETED' : 'EXPRESSION CLEARED';
    els.completionTitle.textContent = finalExpression
      ? `${teddy().primary.toUpperCase()} COMPLETED`
      : `${teddy().primary} — ${label}`;
    els.completionCopy.textContent = pendingCompletion
      ? finalExpression
        ? `${completedCount} / ${LEVELS_PER_TEDDY} expressions cleared. Private feed unlocked.`
        : `${label} cleared. Expression ${currentLevel + 1} is now unlocked.`
      : 'The next destination is unavailable in this build. Your completion is saved.';
    els.nextButton.textContent = finalExpression ? `Enter ${teddy().primary}'s Feed` : 'Next Expression';
    els.nextButton.disabled = !pendingCompletion;
    els.nextButton.setAttribute('aria-busy', 'false');
    completionBackButton?.classList.toggle('hidden', !finalExpression);
    els.completionModal.classList.remove('hidden');
    setTimeout(() => (pendingCompletion ? els.nextButton : completionBackButton)?.focus(), 0);

    window.ToxicAccessibility?.announce?.(
      pendingCompletion
        ? finalExpression
          ? `${teddy().primary} completed. Private feed unlocked.`
          : `${label} expression cleared. The next expression is unlocked.`
        : 'Completion saved, but the next destination is unavailable.',
    );

    if (finalExpression && !wasFeedUnlocked) {
      analytics?.track('feed_unlock', {
        teddy_id: teddyId,
        completed_expressions: completedCount,
        unlock_source: 'five_expressions',
      }).catch(console.error);
    }
  };

  goNext = async function completionGoNext() {
    if (advancingCompletion) return false;

    let destination = pendingCompletion;
    if (!destination) {
      try {
        destination = {
          ...completionRoute(teddy().id, state.level),
          teddyIndex: state.teddyIndex,
          expressionId: state.data?.expression,
        };
      } catch (error) {
        console.error(error);
        window.ToxicAccessibility?.announce?.('The next expression is unavailable. Your completion is saved.');
        return false;
      }
    }

    if (!completed(destination.teddyId, destination.sourceLevel)) {
      window.ToxicAccessibility?.announce?.('Completion must be saved before advancing.');
      return false;
    }

    setCompletionBusy(true);
    try {
      if (destination.type === 'expression') {
        const loaded = await openGame(destination.teddyIndex, destination.level, {requireExact: true});
        if (!loaded || state.level !== destination.level || Number(state.data?.level) !== destination.level) {
          throw new Error(`Expression ${destination.level} did not load`);
        }
        hideModals();
        pendingCompletion = null;
        return true;
      }

      const opened = await openFeed(destination.teddyId);
      if (!opened) throw new Error(`${destination.teddyId} feed did not open`);
      pendingCompletion = null;
      return true;
    } catch (error) {
      console.error(error);
      els.completionCopy.textContent = destination.type === 'expression'
        ? `Expression ${destination.level} is unlocked, but it did not load. Tap Retry Next Expression.`
        : 'The private feed is unlocked, but it did not open. Tap Retry Feed.';
      els.nextButton.textContent = destination.type === 'expression' ? 'Retry Next Expression' : 'Retry Feed';
      window.ToxicAccessibility?.announce?.('The next screen did not load. Your completion is saved. Try again.');
      return false;
    } finally {
      setCompletionBusy(false);
    }
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

  bindEvents = function completionBindEvents() {
    baseBindEvents();
    completionBackButton?.addEventListener('click', showHome);
    document.getElementById('feedBackButton')?.addEventListener('click', showHome);
    feedButton?.addEventListener('click', () => openFeed('tt01'));
  };

  boot = function completionBoot() {
    baseBoot();
    const feedId = new URLSearchParams(location.search).get('feed');
    if (feedId) queueMicrotask(() => openFeed(feedId));
  };

  window.__toxicPersistCurrentSession = persistCurrentSession;
  window.__toxicOpenFeed = openFeed;
  window.__toxicCompletionTest = () => ({
    teddyId: teddy().id,
    level: state.level,
    completedExpressions: progression.completedExpressionCount(state.save, teddy().id, LEVELS_PER_TEDDY),
    feedUnlocked: canOpenFeed(teddy().id),
    next: pendingCompletion || completionRoute(teddy().id, state.level),
    advancing: advancingCompletion,
  });
})();
