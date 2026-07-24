import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {
  canOpenFeed,
  completeExpression,
  completedExpressionCount,
  completionDestinationForContent,
  completionSequenceForContent,
  isTeddyComplete,
  markFeedPostViewed,
  nextCompletionDestination,
  unreadFeedPostCount,
} from '../src/game/progression.js';

const levelManifest = JSON.parse(await readFile(new URL('../src/content/level-manifest.json', import.meta.url), 'utf8'));
const feedManifest = JSON.parse(await readFile(new URL('../src/content/feed-manifest.json', import.meta.url), 'utf8'));

function emptySave() {
  return {
    completed: {},
    teddyCompletion: {},
    feedUnlocks: {},
    viewedFeedPosts: {},
    activeSession: {levelKey: 'tt01-l1', removedPathIds: ['p001']},
  };
}

function contentOptions(overrides = {}) {
  return {
    teddyId: 'tt01',
    levels: levelManifest.levels,
    feedAvailable: feedManifest.feeds.some(feed => feed.teddy_id === 'tt01'),
    ...overrides,
  };
}

test('every Toxic Toby expression has one validated completion destination', () => {
  const sequence = completionSequenceForContent(contentOptions());
  assert.deepEqual(sequence.map(destination => ({
    type: destination.type,
    sourceLevel: destination.sourceLevel,
    level: destination.level,
  })), [
    {type: 'expression', sourceLevel: 1, level: 2},
    {type: 'expression', sourceLevel: 2, level: 3},
    {type: 'expression', sourceLevel: 3, level: 4},
    {type: 'expression', sourceLevel: 4, level: 5},
    {type: 'feed', sourceLevel: 5, level: undefined},
  ]);
});

test('finishing expressions advances through the complete 1 to 5 chain', () => {
  let save = emptySave();

  for (let level = 1; level <= 5; level += 1) {
    save = completeExpression(save, 'tt01', level);
    assert.equal(save.completed[`tt01-l${level}`], true);
    const destination = completionDestinationForContent(contentOptions({level}));
    if (level < 5) {
      assert.equal(destination.type, 'expression');
      assert.equal(destination.level, level + 1);
      assert.equal(canOpenFeed(save, 'tt01'), false);
    } else {
      assert.equal(destination.type, 'feed');
      assert.equal(canOpenFeed(save, 'tt01'), true);
    }
  }
});

test('finishing expression 1 advances to expression 2', () => {
  const save = completeExpression(emptySave(), 'tt01', 1);
  assert.equal(save.completed['tt01-l1'], true);
  assert.deepEqual(nextCompletionDestination(1), {type: 'expression', level: 2});
  assert.equal(canOpenFeed(save, 'tt01'), false);
});

test('finishing expression 2 advances to expression 3', () => {
  const destination = completionDestinationForContent(contentOptions({level: 2}));
  assert.equal(destination.type, 'expression');
  assert.equal(destination.level, 3);
  assert.equal(destination.levelId, 'tt01_gross');
});

test('finishing expression 3 advances to expression 4', () => {
  const destination = completionDestinationForContent(contentOptions({level: 3}));
  assert.equal(destination.type, 'expression');
  assert.equal(destination.level, 4);
  assert.equal(destination.levelId, 'tt01_angry');
});

test('finishing expression 4 advances to expression 5', () => {
  const destination = completionDestinationForContent(contentOptions({level: 4}));
  assert.equal(destination.type, 'expression');
  assert.equal(destination.level, 5);
  assert.equal(destination.levelId, 'tt01_maniacal_laugh');
});

test('a missing playable expression is rejected before navigation', () => {
  const levelsWithoutGross = levelManifest.levels.filter(level => level.level !== 3);
  assert.throws(
    () => completionDestinationForContent(contentOptions({level: 2, levels: levelsWithoutGross})),
    /Playable expression 3 is missing/,
  );
});

test('a missing final feed is rejected before navigation', () => {
  assert.throws(
    () => completionDestinationForContent(contentOptions({level: 5, feedAvailable: false})),
    /Completion feed is missing/,
  );
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
