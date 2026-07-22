export class UnsupportedSaveSchemaError extends Error {
  constructor(found, supported) {
    super(`Save schema ${found} is newer than supported schema ${supported}`);
    this.name = 'UnsupportedSaveSchemaError';
    this.found = found;
    this.supported = supported;
  }
}

function clone(value) {
  return typeof structuredClone === 'function'
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}

function migrateV1ToV2(state, buildInfo) {
  return {
    ...state,
    schemaVersion: 2,
    appVersion: buildInfo.appVersion,
    appBuild: buildInfo.iosBuildNumber,
    contentVersion: buildInfo.contentVersion,
    migrationHistory: [
      ...(Array.isArray(state.migrationHistory) ? state.migrationHistory : []),
      {from: 1, to: 2, appVersion: buildInfo.appVersion},
    ],
    activeSession: state.activeSession
      ? {
          ...state.activeSession,
          contentVersion: state.activeSession.contentVersion || buildInfo.contentVersion,
        }
      : null,
  };
}

export function migrateSave(input, buildInfo) {
  if (!input || typeof input !== 'object') return {state: null, migrated: false, fromVersion: null};
  let state = clone(input);
  let version = Number(state.schemaVersion || 1);
  const fromVersion = version;

  if (version > buildInfo.saveSchemaVersion) {
    throw new UnsupportedSaveSchemaError(version, buildInfo.saveSchemaVersion);
  }
  if (version < buildInfo.minimumCompatibleSaveSchemaVersion) {
    return {state: null, migrated: false, fromVersion: version, incompatible: true};
  }

  while (version < buildInfo.saveSchemaVersion) {
    if (version === 1) state = migrateV1ToV2(state, buildInfo);
    else throw new Error(`No migration path from save schema ${version}`);
    version = Number(state.schemaVersion);
  }

  return {
    state,
    migrated: version !== fromVersion,
    fromVersion,
    incompatible: false,
  };
}
