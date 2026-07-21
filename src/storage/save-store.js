const LEGACY_STORAGE_KEY = 'toxic-teddies:compiled-patterns-v1';
const SCHEMA_VERSION = 1;

function clone(value) {
  return typeof structuredClone === 'function'
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}

function emptyState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    appVersion: '0.3.0',
    compilerVersion: 'dense-pack-v6',
    completed: {},
    activeSession: null,
    updatedAt: new Date(0).toISOString(),
  };
}

function normalize(input) {
  const base = emptyState();
  if (!input || typeof input !== 'object') return base;
  return {
    ...base,
    ...input,
    schemaVersion: SCHEMA_VERSION,
    completed: input.completed && typeof input.completed === 'object' ? input.completed : {},
    activeSession: input.activeSession && typeof input.activeSession === 'object' ? input.activeSession : null,
  };
}

function readLegacyCompletion() {
  try {
    const parsed = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY));
    return parsed?.completed && typeof parsed.completed === 'object' ? parsed.completed : {};
  } catch {
    return {};
  }
}

export async function createSaveStore(bridge, content) {
  let state = normalize(await bridge.readProgress());
  let writeChain = Promise.resolve();

  if (!Object.keys(state.completed).length) {
    state.completed = readLegacyCompletion();
  }
  state.compilerVersion = content.compilerVersion || state.compilerVersion;

  function queueWrite() {
    state.updatedAt = new Date().toISOString();
    const payload = clone(state);
    writeChain = writeChain
      .catch(() => {})
      .then(() => bridge.writeProgress(payload));
    return writeChain;
  }

  return Object.freeze({
    getSnapshot() {
      return clone(state);
    },
    replace(nextState) {
      state = normalize({...state, ...clone(nextState)});
      return queueWrite();
    },
    setActiveSession(session) {
      state.activeSession = session ? clone(session) : null;
      return queueWrite();
    },
    clearActiveSession() {
      state.activeSession = null;
      return queueWrite();
    },
    markCompleted(levelKey) {
      state.completed[levelKey] = true;
      state.activeSession = null;
      return queueWrite();
    },
    async flush() {
      await writeChain;
    },
  });
}
