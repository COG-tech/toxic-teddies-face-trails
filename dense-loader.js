const INITIAL_ROUTE_READY_TIMEOUT_MS = 10_000;

function initialRouteReady() {
  const params = new URLSearchParams(location.search);
  const wantsGame = Boolean(params.get('teddy'));

  if (!wantsGame) {
    const homeView = document.getElementById('homeView');
    const teddyGrid = document.getElementById('teddyGrid');
    return Boolean(
      homeView
      && !homeView.classList.contains('hidden')
      && teddyGrid?.children?.length,
    );
  }

  const gameView = document.getElementById('gameView');
  const pieceLayer = document.getElementById('pieceLayer');
  const renderedPathCount = pieceLayer?.querySelectorAll?.('.path-piece, .dense-path')?.length || 0;

  return Boolean(
    gameView
    && !gameView.classList.contains('hidden')
    && renderedPathCount > 0
    && gameView.dataset.gameplayBackdropStatus === 'loaded'
    && gameView.dataset.puzzleFitStatus === 'fitted'
  );
}

function waitForInitialRouteReady() {
  const startedAt = performance.now();

  return new Promise((resolve, reject) => {
    const check = () => {
      if (initialRouteReady()) {
        resolve();
        return;
      }

      if (performance.now() - startedAt >= INITIAL_ROUTE_READY_TIMEOUT_MS) {
        reject(new Error('Initial Toxic Teddies route did not finish rendering before startup handoff'));
        return;
      }

      requestAnimationFrame(check);
    };

    requestAnimationFrame(check);
  });
}

window.__toxicBootPromise = (async () => {
  try {
    const responses = await Promise.all([
      fetch('./compiled-app.js?v=35', {cache: 'no-store'}),
      fetch('./hard-mode-v3.js?v=35', {cache: 'no-store'}),
      fetch('./compiled-level-source.js?v=35', {cache: 'no-store'}),
      fetch('./interaction-fix.js?v=35', {cache: 'no-store'}),
      fetch('./mobile-enhancements.js?v=35', {cache: 'no-store'}),
      fetch('./analytics-enhancements.js?v=35', {cache: 'no-store'}),
    ]);

    if (responses.some(response => !response.ok)) {
      throw new Error('Toxic Toby runtime files failed to load');
    }

    const [baseSource, denseSource, levelSource, interactionSource, mobileSource, analyticsSource] = await Promise.all(
      responses.map(response => response.text()),
    );

    const baseWithoutBoot = baseSource.replace(/\bboot\(\);\s*$/, '');
    (0, eval)([
      baseWithoutBoot,
      denseSource,
      levelSource,
      interactionSource,
      mobileSource,
      analyticsSource,
      'boot();',
    ].join('\n'));

    // Keep the approved intro over the app until the requested screen, its
    // backdrop, and its measured puzzle fit are all genuinely ready.
    await waitForInitialRouteReady();
  } catch (error) {
    console.error(error);
    const status = document.getElementById('statusText');
    if (status) status.textContent = 'Toxic Toby mobile build failed to load';
    throw error;
  }
})();
