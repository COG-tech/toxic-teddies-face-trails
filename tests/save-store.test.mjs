import assert from 'node:assert/strict';
import test from 'node:test';
import { createSaveStore } from '../src/storage/save-store.js';

const buildInfo = {
  appVersion: '0.4.0',
  iosBuildNumber: 2,
  contentVersion: 'tt01-launch-2026.07.22.1',
  saveSchemaVersion: 2,
  minimumCompatibleSaveSchemaVersion: 1,
};
const content = {
  compilerVersion: 'toxic-toby-deterministic-v1',
  contentVersion: buildInfo.contentVersion,
};

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
  const store = await createSaveStore(bridge, content, buildInfo);

  assert.equal(store.getSnapshot().completed['tt01-l1'], true);
  assert.equal(store.getSnapshot().schemaVersion, 2);

  await store.setActiveSession({
    levelKey: 'tt01-l2',
    levelVersion: 1,
    compilerVersion: content.compilerVersion,
    removedPathIds: ['p001', 'p002'],
  });
  await store.flush();

  assert.deepEqual(written.activeSession.removedPathIds, ['p001', 'p002']);
  assert.equal(written.activeSession.contentVersion, buildInfo.contentVersion);
  assert.equal(written.compilerVersion, content.compilerVersion);
});

test('schema 1 progress migrates to schema 2 without losing completion', async () => {
  installLocalStorage();
  let written = null;
  const bridge = {
    async readProgress() {
      return {
        schemaVersion: 1,
        appVersion: '0.3.0',
        compilerVersion: content.compilerVersion,
        completed: {'tt01-l1': true},
        activeSession: {
          levelKey: 'tt01-l2',
          levelVersion: 1,
          compilerVersion: content.compilerVersion,
          removedPathIds: ['p010'],
        },
      };
    },
    async writeProgress(value) {
      written = value;
    },
  };

  const store = await createSaveStore(bridge, content, buildInfo);
  await store.flush();
  const snapshot = store.getSnapshot();

  assert.equal(snapshot.schemaVersion, 2);
  assert.equal(snapshot.completed['tt01-l1'], true);
  assert.deepEqual(snapshot.activeSession.removedPathIds, ['p010']);
  assert.equal(snapshot.contentVersion, buildInfo.contentVersion);
  assert.equal(written.schemaVersion, 2);
});

test('markCompleted clears active session', async () => {
  installLocalStorage();
  let written = null;
  const bridge = {
    async readProgress() {
      return {
        schemaVersion: 2,
        contentVersion: buildInfo.contentVersion,
        completed: {},
        activeSession: {levelKey: 'tt01-l1', removedPathIds: ['p001'], contentVersion: buildInfo.contentVersion},
      };
    },
    async writeProgress(value) {
      written = value;
    },
  };
  const store = await createSaveStore(bridge, content, buildInfo);
  await store.markCompleted('tt01-l1');
  await store.flush();

  assert.equal(written.completed['tt01-l1'], true);
  assert.equal(written.activeSession, null);
});

test('feed unlocks and viewed posts survive save normalization', async () => {
  installLocalStorage();
  let written = null;
  const bridge = {
    async readProgress() {
      return {
        schemaVersion: 2,
        contentVersion: buildInfo.contentVersion,
        completed: {
          'tt01-l1': true,
          'tt01-l2': true,
          'tt01-l3': true,
          'tt01-l4': true,
          'tt01-l5': true,
        },
        teddyCompletion: {tt01: true},
        feedUnlocks: {tt01: true},
        viewedFeedPosts: {tt01: ['tt01-post-001', 'tt01-post-001']},
      };
    },
    async writeProgress(value) {
      written = value;
    },
  };

  const store = await createSaveStore(bridge, content, buildInfo);
  assert.equal(store.getSnapshot().feedUnlocks.tt01, true);
  assert.deepEqual(store.getSnapshot().viewedFeedPosts.tt01, ['tt01-post-001']);

  await store.markFeedPostViewed('tt01', 'tt01-post-002');
  await store.flush();

  assert.equal(written.teddyCompletion.tt01, true);
  assert.equal(written.feedUnlocks.tt01, true);
  assert.deepEqual(written.viewedFeedPosts.tt01, ['tt01-post-001', 'tt01-post-002']);
});
