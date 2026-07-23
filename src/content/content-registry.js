import characterManifest from './character-manifest.json';
import expressionManifest from './expression-manifest.json';
import levelManifest from './level-manifest.json';
import backdropManifest from './backdrop-manifest.json';
import revealManifest from './reveal-manifest.json';
import feedManifest from './feed-manifest.json';

export function createContentRegistry() {
  const characters = characterManifest.characters.map(character => Object.freeze({...character}));
  const expressions = expressionManifest.expressions.map(expression => Object.freeze({...expression}));
  const levels = levelManifest.levels.map(level => Object.freeze({...level}));
  const backdrops = backdropManifest.backdrops.map(backdrop => Object.freeze({...backdrop}));
  const reveals = revealManifest.reveals.map(reveal => Object.freeze({...reveal}));
  const feeds = feedManifest.feeds.map(feed => Object.freeze({
    ...feed,
    posts: feed.posts.map(post => Object.freeze({
      ...post,
      reply: post.reply ? Object.freeze({...post.reply}) : null,
    })),
  }));

  const characterById = new Map(characters.map(character => [character.id, character]));
  const expressionById = new Map(expressions.map(expression => [expression.id, expression]));
  const levelByKey = new Map(levels.map(level => [`${level.teddy_id}:${level.level}`, level]));
  const backdropByKey = new Map(backdrops.map(backdrop => [`${backdrop.teddy_id}:${backdrop.expression_id}`, backdrop]));
  const revealByKey = new Map(reveals.map(reveal => [`${reveal.teddy_id}:${reveal.expression_id}`, reveal]));
  const feedByTeddyId = new Map(feeds.map(feed => [feed.teddy_id, feed]));

  return Object.freeze({
    characters,
    expressions,
    levels,
    backdrops,
    reveals,
    feeds,
    compilerVersion: levelManifest.compiler_version,
    contentVersion: levelManifest.content_version,
    getCharacter(id) {
      return characterById.get(id) || null;
    },
    getExpression(id) {
      return expressionById.get(id) || null;
    },
    getLevel(teddyId, level) {
      return levelByKey.get(`${teddyId}:${level}`) || null;
    },
    getBackdrop(teddyId, expressionId) {
      return backdropByKey.get(`${teddyId}:${expressionId}`) || null;
    },
    getReveal(teddyId, expressionId) {
      return revealByKey.get(`${teddyId}:${expressionId}`) || null;
    },
    getFeed(teddyId) {
      return feedByTeddyId.get(teddyId) || null;
    },
    isPlayable(teddyId, level = 1) {
      const character = characterById.get(teddyId);
      const entry = levelByKey.get(`${teddyId}:${level}`);
      return character?.status === 'playable' && entry?.status === 'playable';
    },
    playableCount() {
      return levels.filter(level => level.status === 'playable').length;
    },
  });
}
