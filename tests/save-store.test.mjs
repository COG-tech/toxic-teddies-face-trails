import assert from 'node:assert/strict';
import test from 'node:test';
import { createSaveStore } from '../src/storage/save-store.js';

function installLocalStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  globalThis.localStorage = {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
  };
}

test('save store migrates legacy completion and writes exact session state', async () => {
  installLocalStorage({
    'toxic-teddies:compiled-patterns-v1': JSON.stringify({completed: {'tt01-l1': true}}),
  });

  let written = null;
  const bridge = {
    async readProgress() {
      return null;
    },
    async writeProgress(value) {
      written = value;
    },
  };
  const content = {compilerVersion: 'toxic-toby-deterministic-v1'};
  const store = await createSaveStore(bridge, content);

  assert.equal(store.getSnapshot().completed['tt01-l1'], true);

  await store.setActiveSession({
    levelKey: 'tt01-l2',
    levelVersion: 1,
    compilerVersion: content.compilerVersion,
    removedPathIds: ['p001', 'p002'],
  });
  await store.flush();

  assert.deepEqual(written.activeSession.removedPathIds, ['p001', 'p002']);
  assert.equal(written.compilerVersion, content.compilerVersion);
});

test('markCompleted clears active session', async () => {
  installLocalStorage();
  let written = null;
  const bridge = {
    async readProgress() {
      return {
        completed: {},
        activeSession: {levelKey: 'tt01-l1', removedPathIds: ['p001']},
      };
    },
    async writeProgress(value) {
      written = value;
    },
  };
  const store = await createSaveStore(bridge, {compilerVersion: 'toxic-toby-deterministic-v1'});
  await store.markCompleted('tt01-l1');
  await store.flush();

  assert.equal(written.completed['tt01-l1'], true);
  assert.equal(written.activeSession, null);
});
