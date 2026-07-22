/* Manifest-driven, precompiled production level source. */
(() => {
  const clone = value => (
    typeof structuredClone === 'function'
      ? structuredClone(value)
      : JSON.parse(JSON.stringify(value))
  );

  fetchLevel = async function manifestFetchLevel() {
    const selected = teddy();
    const entry = window.ToxicContent?.getLevel(selected.id, state.level);
    if (!entry || entry.status !== 'playable') {
      throw new Error(`${selected.primary} level ${state.level} is not available`);
    }

    const response = await fetch(entry.src, {cache: 'no-store'});
    if (!response.ok) {
      throw new Error(`Compiled level file failed to load: ${entry.src}`);
    }

    const data = clone(await response.json());
    data.level = entry.level;
    data.teddy = entry.teddy_id;
    data.characterName = selected.primary;
    data.levelVersion = entry.version;
    data.compilerVersion = window.ToxicContent?.compilerVersion || data.compilerVersion || 'unknown';
    data.strictSequence = false;
    data.allowedFrontier = 0;
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
})();
