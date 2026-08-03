(() => {
  const gameView = document.getElementById('gameView');
  const boardBackdrop = document.getElementById('boardBackdrop');
  if (!gameView || !boardBackdrop) return;

  let requestVersion = 0;
  let syncQueued = false;

  function extractUrl(backgroundImage) {
    const value = String(backgroundImage || '').trim();
    if (!value || value === 'none') return null;
    const match = value.match(/^url\((['"]?)(.*?)\1\)$/i);
    return match?.[2] || null;
  }

  function clearBackdrop(status = 'empty') {
    requestVersion += 1;
    gameView.classList.remove('has-gameplay-backdrop');
    gameView.style.removeProperty('background-image');
    gameView.style.removeProperty('background-position');
    gameView.style.removeProperty('background-size');
    gameView.style.removeProperty('background-repeat');
    gameView.dataset.gameplayBackdropStatus = status;
    delete gameView.dataset.gameplayBackdropUrl;
  }

  function applyLoadedBackdrop(absoluteUrl, version) {
    if (version !== requestVersion) return;
    gameView.style.backgroundImage = `url(${JSON.stringify(absoluteUrl)})`;

    // Preserve the artwork's aspect ratio while deliberately cropping away
    // more of the decorative side machinery and oversized lower frame.
    gameView.style.backgroundPosition = '50% 42%';
    gameView.style.backgroundSize = 'auto 122%';
    gameView.style.backgroundRepeat = 'no-repeat';

    gameView.classList.add('has-gameplay-backdrop');
    gameView.dataset.gameplayBackdropStatus = 'loaded';
    gameView.dataset.gameplayBackdropUrl = absoluteUrl;
    gameView.dataset.gameplayBackdropCrop = '122%-at-42%';
  }

  function syncGameplayBackdrop() {
    const source = boardBackdrop.dataset.gameplayBackdropSrc
      || extractUrl(boardBackdrop.style.backgroundImage);

    if (!source) {
      clearBackdrop();
      return;
    }

    let absoluteUrl;
    try {
      absoluteUrl = new URL(source, document.baseURI).href;
    } catch (error) {
      console.error('Invalid gameplay backdrop URL', source, error);
      clearBackdrop('invalid-url');
      return;
    }

    const version = ++requestVersion;
    gameView.classList.remove('has-gameplay-backdrop');
    gameView.style.removeProperty('background-image');
    gameView.dataset.gameplayBackdropStatus = 'loading';
    gameView.dataset.gameplayBackdropUrl = absoluteUrl;

    const image = new Image();
    image.decoding = 'async';
    let settled = false;

    const succeed = () => {
      if (settled) return;
      settled = true;
      applyLoadedBackdrop(absoluteUrl, version);
    };

    const fail = () => {
      if (settled || version !== requestVersion) return;
      settled = true;
      console.error('Gameplay backdrop failed to load', absoluteUrl);
      clearBackdrop('load-error');
    };

    image.addEventListener('load', succeed, {once: true});
    image.addEventListener('error', fail, {once: true});
    image.src = absoluteUrl;
    if (image.complete && image.naturalWidth > 0) queueMicrotask(succeed);
  }

  function queueSync() {
    if (syncQueued) return;
    syncQueued = true;
    queueMicrotask(() => {
      syncQueued = false;
      syncGameplayBackdrop();
    });
  }

  new MutationObserver(queueSync).observe(boardBackdrop, {
    attributes: true,
    attributeFilter: ['style', 'data-gameplay-backdrop-src'],
  });

  queueSync();
})();
