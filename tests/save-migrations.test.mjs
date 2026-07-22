import assert from 'node:assert/strict';
import test from 'node:test';
import { migrateSave, UnsupportedSaveSchemaError } from '../src/storage/save-migrations.js';

const buildInfo = {
  appVersion: '0.4.0',
  iosBuildNumber: 2,
  contentVersion: 'tt01-launch-2026.07.22.1',
  saveSchemaVersion: 2,
  minimumCompatibleSaveSchemaVersion: 1,
};

test('migrateSave upgrades schema 1 and preserves progress', () => {
  const result = migrateSave({
    schemaVersion: 1,
    completed: {'tt01-l1': true},
    activeSession: {levelKey: 'tt01-l2', removedPathIds: ['p003']},
  }, buildInfo);

  assert.equal(result.migrated, true);
  assert.equal(result.state.schemaVersion, 2);
  assert.equal(result.state.completed['tt01-l1'], true);
  assert.deepEqual(result.state.activeSession.removedPathIds, ['p003']);
  assert.equal(result.state.activeSession.contentVersion, buildInfo.contentVersion);
});

test('migrateSave refuses a future schema without modifying it', () => {
  assert.throws(
    () => migrateSave({schemaVersion: 99, completed: {'tt01-l1': true}}, buildInfo),
    error => error instanceof UnsupportedSaveSchemaError && error.found === 99,
  );
});
