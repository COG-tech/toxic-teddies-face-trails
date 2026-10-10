import assert from 'node:assert/strict';
import test from 'node:test';
import {runtime, remove, settle, waitFor} from './helpers/runtime.mjs';

// These tests execute the production game and DOM handlers, with simulated
// animations and bounds. They do not prove rendered mobile fit or real taps.
test('five real level solutions advance via Next through 1 → 2 → 3 → 4 → 5 → feed and survive reload', async () => {
  const app = await runtime();
  try {
    for (let level = 1; level <= 5; level += 1) {
      assert.equal(app.game.state.level, level);
      assert.equal(app.game.state.data.level, level);
      const order = [...app.game.state.data.solutionOrder];
      for (const id of order) {
        assert.equal(app.game.blockersAhead(app.game.state.byId.get(id)).length, 0);
        await remove(app, id);
      }
      assert.equal(app.game.state.active.size, 0);
      assert.equal(app.game.state.save.completed[`tt01-l${level}`], true);
      assert.equal(app.window.document.getElementById('completionModal').classList.contains('hidden'), false);
      const next = app.window.document.getElementById('nextButton');
      next.click();
      next.click(); // A repeated tap must not skip a destination.
      await waitFor(() => level < 5 ? app.game.state.data.level === level + 1 && !app.window.__toxicCompletionTest().advancing : !app.window.document.getElementById('feedView').classList.contains('hidden'));
      if (level < 5) assert.equal(app.game.state.level, level + 1);
    }
    assert.equal(app.window.document.getElementById('feedView').classList.contains('hidden'), false);
    app.window.document.querySelector('.feed-post').click();
    const saved = await app.getSaved();
    assert.equal(Object.keys(saved.completed).length, 5);
    assert.equal(saved.feedUnlocks.tt01, true);
    assert.equal(saved.viewedFeedPosts.tt01.length, 1);
    const restored = await runtime({save: saved, route: '?feed=tt01'});
    try {
      assert.equal(restored.window.document.getElementById('feedView').classList.contains('hidden'), false);
      assert.equal(restored.window.document.querySelector('.feed-post').classList.contains('viewed'), true);
    } finally {restored.close();}
  } finally {app.close();}
});

test('blocked move is harmless; ten valid removals preserve fit across resize, rotation and reload', async () => {
  const app = await runtime();
  try {
    const board = app.window.document.getElementById('board');
    const original = board.getAttribute('viewBox');
    const total = app.game.state.active.size;
    const blocked = app.game.state.pieces.find(p => app.game.blockersAhead(p).length);
    assert.ok(blocked);
    await remove(app, blocked.id);
    assert.equal(app.game.state.active.size, total);
    assert.match(app.window.document.getElementById('statusText').textContent, /trapped/);
    const removed = [...app.game.state.data.solutionOrder].slice(0, 10);
    for (const id of removed) await remove(app, id);
    assert.equal(app.game.state.active.size, total - 10);
    for (const name of ['resize', 'orientationchange', 'pageshow']) {
      app.window.dispatchEvent(new app.window.Event(name));
      await settle();
      assert.equal(board.getAttribute('viewBox'), original);
      assert.equal(board.getAttribute('preserveAspectRatio'), 'xMidYMid meet');
    }
    const saved = await app.getSaved();
    assert.deepEqual([...saved.activeSession.removedPathIds].sort(), removed.sort());
    const restored = await runtime({save: saved, route: '?teddy=tt01&level=1'});
    try {
      assert.equal(restored.game.state.active.size, total - 10);
      assert.equal(restored.window.document.getElementById('board').getAttribute('viewBox'), original);
    } finally {restored.close();}
  } finally {app.close();}
});

test('failed 2 → 3 load retains completion and Retry opens exactly expression 3', async () => {
  const app = await runtime();
  try {
    for (let level = 1; level <= 2; level += 1) {
      for (const id of [...app.game.state.data.solutionOrder]) await remove(app, id);
      if (level === 1) assert.equal(await app.game.goNext(), true);
    }
    app.setFailedLevel(3);
    const expectedErrors = [];
    app.window.console.error = error => expectedErrors.push(String(error));
    assert.equal(await app.game.goNext(), false);
    assert.ok(expectedErrors.length > 0);
    assert.equal(app.game.state.save.completed['tt01-l2'], true);
    assert.match(app.window.document.getElementById('nextButton').textContent, /Retry/);
    app.setFailedLevel(null);
    assert.equal(await app.game.goNext(), true);
    assert.equal(app.game.state.data.level, 3);
  } finally {app.close();}
});

test('locked routes and eleven Coming Soon cards cannot unlock content', async () => {
  const app = await runtime({route: '?teddy=tt01&level=5'});
  try {
    assert.equal(app.game.state.level, 1);
    assert.equal(await app.window.__toxicOpenFeed('tt01'), false);
    assert.equal(app.game.state.save.feedUnlocks.tt01, undefined);
    assert.equal(await app.game.openGame(1, 1), false);
    assert.equal(app.window.document.querySelectorAll('.coming-soon-teddy:disabled').length, 11);
  } finally {app.close();}
});

test('v53 unfinished sessions restart safely while completion and viewed feed posts survive', async () => {
  const first = await runtime();
  const saved = first.store.getSnapshot();
  first.close();
  saved.completed = {'tt01-l1': true};
  saved.feedUnlocks = {tt01: true};
  saved.viewedFeedPosts = {tt01: ['tt01-post-001']};
  saved.activeSession = {levelKey: 'tt01-l2', levelVersion: 2, compilerVersion: 'toxic-toby-portrait-v2', contentVersion: 'tt01-portrait-2026.08.03.1', removedPathIds: ['p001']};
  const app = await runtime({save: saved, route: '?teddy=tt01&level=2'});
  try {
    assert.equal(app.game.state.active.size, app.game.state.pieces.length);
    assert.equal(app.game.state.save.completed['tt01-l1'], true);
    assert.equal(app.game.state.save.feedUnlocks.tt01, true);
    assert.deepEqual(app.game.state.save.viewedFeedPosts.tt01, ['tt01-post-001']);
  } finally {app.close();}
});
