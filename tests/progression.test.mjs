import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canOpenFeed,
  completeExpression,
  completedExpressionCount,
  isTeddyComplete,
  markFeedPostViewed,
  nextCompletionDestination,
  unreadFeedPostCount,
} from '../src/game/progression.js';

function emptySave() {
  return {
    completed: {},
    teddyCompletion: {},
    feedUnlocks: {},
    viewedFeedPosts: {},
    activeSession: {levelKey: 'tt01-l1', removedPathIds: ['p001']},
  };
}

test('finishing expression 1 advances to expression 2', () => {
  const save = completeExpression(emptySave(), 'tt01', 1);
  assert.equal(save.completed['tt01-l1'], true);
  assert.deepEqual(nextCompletionDestination(1), {type: 'expression', level: 2});
  assert.equal(canOpenFeed(save, 'tt01'), false);
});

test('finishing expression 4 advances to expression 5', () => {
  assert.deepEqual(nextCompletionDestination(4), {type: 'expression', level: 5});
});

test('finishing all five expressions unlocks the private feed', () => {
  let save = emptySave();
  for (let level = 1; level <= 5; level += 1) save = completeExpression(save, 'tt01', level);

  assert.equal(completedExpressionCount(save, 'tt01'), 5);
  assert.equal(isTeddyComplete(save, 'tt01'), true);
  assert.equal(save.teddyCompletion.tt01, true);
  assert.equal(save.feedUnlocks.tt01, true);
  assert.equal(canOpenFeed(save, 'tt01'), true);
  assert.equal(save.activeSession, null);
  assert.deepEqual(nextCompletionDestination(5), {type: 'feed'});
});

test('replaying a completed expression does not erase completion or feed access', () => {
  let save = emptySave();
  for (let level = 1; level <= 5; level += 1) save = completeExpression(save, 'tt01', level);
  const replayed = completeExpression(save, 'tt01', 1);

  assert.equal(completedExpressionCount(replayed, 'tt01'), 5);
  assert.equal(replayed.feedUnlocks.tt01, true);
});

test('restart state alone cannot unlock the private feed', () => {
  const save = emptySave();
  save.activeSession = null;
  assert.equal(completedExpressionCount(save, 'tt01'), 0);
  assert.equal(canOpenFeed(save, 'tt01'), false);
});

test('a locked feed URL cannot bypass the completion requirement', () => {
  const save = completeExpression(emptySave(), 'tt01', 1);
  assert.equal(canOpenFeed(save, 'tt01'), false);
});

test('viewed feed posts are unique and unread count survives repeated views', () => {
  const ids = ['tt01-post-001', 'tt01-post-002', 'tt01-post-003'];
  let save = markFeedPostViewed(emptySave(), 'tt01', ids[0]);
  save = markFeedPostViewed(save, 'tt01', ids[0]);
  save = markFeedPostViewed(save, 'tt01', ids[1]);

  assert.deepEqual(save.viewedFeedPosts.tt01, [ids[0], ids[1]]);
  assert.equal(unreadFeedPostCount(save, 'tt01', ids), 1);
});
