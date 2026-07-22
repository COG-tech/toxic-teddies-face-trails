/* Research analytics integration. This file runs inside the preserved game
 * runtime scope and records only approved event names and aggregate metadata.
 */
(() => {
  const analytics = window.ToxicAnalytics;
  if (!analytics) return;

  function context(extra = {}) {
    return {
      teddy_id: teddy()?.id,
      expression_id: state.data?.expression,
      level: state.level,
      compiler_version: state.data?.compilerVersion,
      level_version: state.data?.levelVersion,
      remaining_paths: state.active?.size,
      total_paths: state.pieces?.length,
      ...extra,
    };
  }

  const baseLoadLevel = loadLevel;
  loadLevel = async function analyticsLoadLevel() {
    const started = performance.now();
    await baseLoadLevel();
    await analytics.track('level_load', context({elapsed_ms: Math.round(performance.now() - started)}));
    const restored = state.save?.activeSession?.levelKey === levelKey(teddy().id, state.level)
      ? Number(state.save.activeSession.removedPathIds?.length || 0)
      : 0;
    if (restored > 0) {
      await analytics.track('progress_restored', context({
        restored_paths: restored,
        restore_source: 'native_save',
      }));
    }
  };

  const baseCompleteLevel = completeLevel;
  completeLevel = function analyticsCompleteLevel() {
    analytics.track('level_complete', context({remaining_paths: 0}));
    return baseCompleteLevel();
  };

  const baseResetLevel = resetLevel;
  resetLevel = function analyticsResetLevel() {
    analytics.track('level_restart', context({reason: 'player_restart'}));
    return baseResetLevel();
  };

  const baseShowHint = showHint;
  showHint = function analyticsHint() {
    analytics.track('hint_used', context());
    return baseShowHint();
  };

  document.getElementById('nextButton')?.addEventListener('click', () => {
    analytics.track('next_expression', context());
  }, true);

  document.getElementById('howToButton')?.addEventListener('click', () => {
    analytics.track('tutorial_open');
  }, true);

  document.getElementById('closeHowToButton')?.addEventListener('click', () => {
    analytics.track('tutorial_complete');
  }, true);

  document.getElementById('shareButton')?.addEventListener('click', () => {
    analytics.track('result_shared', context());
  }, true);

  window.addEventListener('toxic-settings-changed', event => {
    analytics.track('settings_changed', {
      setting: event.detail?.name || 'unknown',
      enabled: Boolean(event.detail?.value),
    });
  });
})();
