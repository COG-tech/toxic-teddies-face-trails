import characterManifest from './character-manifest.json';
import expressionManifest from './expression-manifest.json';
import levelManifest from './level-manifest.json';
import backdropManifest from './backdrop-manifest.json';

export function createContentRegistry() {
  const characters = characterManifest.characters.map(character => Object.freeze({...character}));
  const expressions = expressionManifest.expressions.map(expression => Object.freeze({...expression}));
  const levels = levelManifest.levels.map(level => Object.freeze({...level}));
  const backdrops = backdropManifest.backdrops.map(backdrop => Object.freeze({...backdrop}));

  const characterById = new Map(characters.map(character => [character.id, character]));
  const expressionById = new Map(expressions.map(expression => [expression.id, expression]));
  const levelByKey = new Map(levels.map(level => [`${level.teddy_id}:${level.level}`, level]));
  const backdropByKey = new Map(backdrops.map(backdrop => [`${backdrop.teddy_id}:${backdrop.expression_id}`, backdrop]));

  return Object.freeze({
    characters,
    expressions,
    levels,
    backdrops,
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
