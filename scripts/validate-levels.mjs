import { readFile, access } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = async (path) => JSON.parse(await readFile(resolve(root, path), "utf8"));
const levels = await readJson("data/levels.json");

if (!Array.isArray(levels.levels) || levels.levels.length === 0) {
  throw new Error("data/levels.json must contain at least one level.");
}

for (const level of levels.levels) {
  const characterPath = level.characterPath.replace(/^\.\//, "");
  const character = await readJson(characterPath);
  const mapDataPath = character.mapDataFile.replace(/^\.\//, "");
  const mapData = await readJson(mapDataPath);

  if (!character.id || character.id !== level.id) {
    throw new Error(`Character ID mismatch for ${level.id}.`);
  }
  if (!Array.isArray(mapData.segments) || mapData.segments.length === 0) {
    throw new Error(`${mapDataPath} has no segments.`);
  }

  const ids = new Set();
  for (const segment of mapData.segments) {
    if (!segment.id || ids.has(segment.id)) {
      throw new Error(`Duplicate or missing segment ID in ${mapDataPath}.`);
    }
    ids.add(segment.id);
    if (!(segment.tolerance > 0)) {
      throw new Error(`Invalid tolerance for ${segment.id}.`);
    }
  }

  for (const file of [character.mapFile, character.revealFile]) {
    await access(resolve(root, file.replace(/^\.\//, "")));
  }
}

console.log(`Validated ${levels.levels.length} playable level(s).`);
