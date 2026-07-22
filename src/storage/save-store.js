import { migrateSave, UnsupportedSaveSchemaError } from './save-migrations.js';

const LEGACY_STORAGE_KEY = 'toxic-teddies:compiled-patterns-v1';

function clone(value) {
  return typeof structuredClone === 'function'
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}

function emptyState(buildInfo, content) {
  return {
    schemaVersion: buildInfo.saveSchemaVersion,
    appVersion: buildInfo.appVersion,
    appBuild: buildInfo.iosBuildNumber,
    contentVersion: buildInfo.contentVersion,
    compilerVersion: content.compilerVersion,
    completed: {},
    activeSession: null,
    migrationHistory: [],
    lastSuccessfulLaunch: null,
    updatedAt: new Date(0).toISOString(),
  };
}

function normalize(input, buildInfo, content) {
  const base = emptyState(buildInfo, content);
  if (!input || typeof input !== 'object') return base;
  return {
    ...base,
    ...input,
    schemaVersion: buildInfo.saveSchemaVersion,
    appVersion: buildInfo.appVersion,
    appBuild: buildInfo.iosBuildNumber,
    contentVersion: buildInfo.contentVersion,
    compilerVersion: content.compilerVersion,
    completed: input.completed && typeof input.completed === 'object' ? input.completed : {},
    activeSession: input.activeSession && typeof input.activeSession === 'object' ? input.activeSession : null,
    migrationHistory: Array.isArray(input.migrationHistory) ? input.migrationHistory : [],
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

export async function createSaveStore(bridge, content, buildInfo) {
  const raw = await bridge.readProgress();
  let migration;
  try {
    migration = migrateSave(raw, buildInfo);
  } catch (error) {
    if (error instanceof UnsupportedSaveSchemaError) throw error;
    console.warn('Save migration failed; starting from a safe state', error);
    migration = {state: null, migrated: false, incompatible: true};
  }

  let state = normalize(migration.state, buildInfo, content);
  let writeChain = Promise.resolve();

  if (!Object.keys(state.completed).length) state.completed = readLegacyCompletion();
  if (state.activeSession?.contentVersion !== buildInfo.contentVersion) state.activeSession = null;

  function queueWrite() {
    state.updatedAt = new Date().toISOString();
    const payload = clone(state);
    writeChain = writeChain
      .catch(error => console.error('Previous progress write failed', error))
      .then(() => bridge.writeProgress(payload));
    return writeChain;
  }

  if (migration.migrated || migration.incompatible) await queueWrite();

  return Object.freeze({
    getSnapshot() {
      return clone(state);
    },
    replace(nextState) {
      state = normalize({...state, ...clone(nextState)}, buildInfo, content);
      return queueWrite();
    },
    setActiveSession(session) {
      state.activeSession = session
        ? {
            ...clone(session),
            contentVersion: buildInfo.contentVersion,
          }
        : null;
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
    markSuccessfulLaunch() {
      state.lastSuccessfulLaunch = {
        appVersion: buildInfo.appVersion,
        appBuild: buildInfo.iosBuildNumber,
        contentVersion: buildInfo.contentVersion,
        at: new Date().toISOString(),
      };
      return queueWrite();
    },
    async flush() {
      await writeChain;
    },
  });
}
