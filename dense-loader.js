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
  } catch (error) {
    console.error(error);
    const status = document.getElementById('statusText');
    if (status) status.textContent = 'Toxic Toby mobile build failed to load';
    throw error;
  }
})();
