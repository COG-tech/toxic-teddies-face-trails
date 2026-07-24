const DEFAULT_EXPRESSIONS_PER_TEDDY = 5;

function clone(value) {
  return typeof structuredClone === 'function'
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}

export function expressionKey(teddyId, level) {
  return `${teddyId}-l${level}`;
}

export function completedExpressionCount(save, teddyId, total = DEFAULT_EXPRESSIONS_PER_TEDDY) {
  let count = 0;
  for (let level = 1; level <= total; level += 1) {
    if (save?.completed?.[expressionKey(teddyId, level)]) count += 1;
  }
  return count;
}

export function isTeddyComplete(save, teddyId, total = DEFAULT_EXPRESSIONS_PER_TEDDY) {
  return completedExpressionCount(save, teddyId, total) === total;
}

export function canOpenFeed(save, teddyId, total = DEFAULT_EXPRESSIONS_PER_TEDDY) {
  return Boolean(save?.feedUnlocks?.[teddyId]) || isTeddyComplete(save, teddyId, total);
}

export function completeExpression(save, teddyId, level, total = DEFAULT_EXPRESSIONS_PER_TEDDY) {
  if (!teddyId) throw new Error('A Teddy ID is required');
  if (!Number.isInteger(level) || level < 1 || level > total) {
    throw new Error(`Expression level must be between 1 and ${total}`);
  }

  const next = clone(save || {});
  next.completed = {...(next.completed || {}), [expressionKey(teddyId, level)]: true};
  next.teddyCompletion = {...(next.teddyCompletion || {})};
  next.feedUnlocks = {...(next.feedUnlocks || {})};
  next.viewedFeedPosts = {...(next.viewedFeedPosts || {})};
  next.activeSession = null;

  const completedCount = completedExpressionCount(next, teddyId, total);
  if (completedCount === total) {
    next.teddyCompletion[teddyId] = true;
    next.feedUnlocks[teddyId] = true;
  }

  return next;
}

export function nextCompletionDestination(level, total = DEFAULT_EXPRESSIONS_PER_TEDDY) {
  if (!Number.isInteger(level) || level < 1 || level > total) {
    throw new Error(`Expression level must be between 1 and ${total}`);
  }
  return level < total
    ? {type: 'expression', level: level + 1}
    : {type: 'feed'};
}

export function completionDestinationForContent({
  teddyId,
  level,
  total = DEFAULT_EXPRESSIONS_PER_TEDDY,
  levels = [],
  feedAvailable = false,
} = {}) {
  if (!teddyId) throw new Error('A Teddy ID is required');
  const destination = nextCompletionDestination(level, total);

  if (destination.type === 'expression') {
    const entry = levels.find(candidate => (
      candidate?.teddy_id === teddyId
      && Number(candidate?.level) === destination.level
      && candidate?.status === 'playable'
    ));
    if (!entry) {
      throw new Error(`Playable expression ${destination.level} is missing for ${teddyId}`);
    }
    return Object.freeze({
      type: 'expression',
      teddyId,
      sourceLevel: level,
      level: destination.level,
      levelId: entry.id,
    });
  }

  if (!feedAvailable) {
    throw new Error(`Completion feed is missing for ${teddyId}`);
  }
  return Object.freeze({
    type: 'feed',
    teddyId,
    sourceLevel: level,
  });
}

export function completionSequenceForContent({
  teddyId,
  total = DEFAULT_EXPRESSIONS_PER_TEDDY,
  levels = [],
  feedAvailable = false,
} = {}) {
  return Array.from({length: total}, (_, index) => completionDestinationForContent({
    teddyId,
    level: index + 1,
    total,
    levels,
    feedAvailable,
  }));
}

export function markFeedPostViewed(save, teddyId, postId) {
  if (!teddyId || !postId) return clone(save || {});
  const next = clone(save || {});
  const existing = new Set(next.viewedFeedPosts?.[teddyId] || []);
  existing.add(postId);
  next.viewedFeedPosts = {
    ...(next.viewedFeedPosts || {}),
    [teddyId]: [...existing],
  };
  return next;
}

export function unreadFeedPostCount(save, teddyId, postIds = []) {
  const viewed = new Set(save?.viewedFeedPosts?.[teddyId] || []);
  return postIds.filter(postId => !viewed.has(postId)).length;
}
