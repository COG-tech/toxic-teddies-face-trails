import { readFile, access } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const absolute = (path) => resolve(root, path.replace(/^\.\//, ""));
const readJson = async (path) => JSON.parse(await readFile(absolute(path), "utf8"));
const readText = async (path) => readFile(absolute(path), "utf8");
const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const catalog = await readJson("data/levels.json");
if (!Array.isArray(catalog.levels) || catalog.levels.length === 0) {
  throw new Error("data/levels.json must contain at least one level.");
}

const levelIds = new Set();
const levelOrders = new Set();
const loaded = [];

for (const level of catalog.levels) {
  if (!level.id || levelIds.has(level.id)) {
    throw new Error(`Duplicate or missing level ID: ${level.id ?? "unknown"}.`);
  }
  if (!Number.isInteger(level.order) || level.order < 1 || levelOrders.has(level.order)) {
    throw new Error(`Duplicate or invalid order for ${level.id}.`);
  }
  if (!level.characterPath) {
    throw new Error(`Missing characterPath for ${level.id}.`);
  }

  levelIds.add(level.id);
  levelOrders.add(level.order);

  const character = await readJson(level.characterPath);
  loaded.push({ level, character });
}

for (const { level, character } of loaded) {
  if (!character.id || character.id !== level.id) {
    throw new Error(`Character ID mismatch for ${level.id}.`);
  }
  for (const field of ["primaryName", "alternateName", "mapFile", "mapDataFile", "revealFile", "tagline", "lore"]) {
    if (!character[field]) throw new Error(`${level.id} is missing character field: ${field}.`);
  }
  if (!(character.lives > 0)) {
    throw new Error(`${level.id} must provide at least one life.`);
  }
  if (character.nextLevelId && !levelIds.has(character.nextLevelId)) {
    throw new Error(`${level.id} points to unknown nextLevelId ${character.nextLevelId}.`);
  }

  const mapData = await readJson(character.mapDataFile);
  if (!Array.isArray(mapData.segments) || mapData.segments.length === 0) {
    throw new Error(`${character.mapDataFile} has no segments.`);
  }
  if (!mapData.viewBox || !(mapData.sampleCount > 0) || !(mapData.startRadius > 0)) {
    throw new Error(`${character.mapDataFile} is missing valid map settings.`);
  }

  const segmentIds = new Set();
  const segmentOrders = new Set();
  for (const segment of mapData.segments) {
    if (!segment.id || segmentIds.has(segment.id)) {
      throw new Error(`Duplicate or missing segment ID in ${character.mapDataFile}.`);
    }
    if (!Number.isInteger(segment.order) || segment.order < 1 || segmentOrders.has(segment.order)) {
      throw new Error(`Duplicate or invalid segment order for ${segment.id}.`);
    }
    if (!segment.label || !(segment.tolerance > 0)) {
      throw new Error(`Invalid label or tolerance for ${segment.id}.`);
    }
    if (!['forward', 'reverse'].includes(segment.direction)) {
      throw new Error(`Invalid direction for ${segment.id}.`);
    }
    segmentIds.add(segment.id);
    segmentOrders.add(segment.order);
  }

  const ordered = [...segmentOrders].sort((a, b) => a - b);
  ordered.forEach((order, index) => {
    if (order !== index + 1) throw new Error(`${character.mapDataFile} segment orders must be consecutive.`);
  });

  await access(absolute(character.mapFile));
  await access(absolute(character.revealFile));
  const [mapSvg, revealSvg] = await Promise.all([
    readText(character.mapFile),
    readText(character.revealFile)
  ]);

  if (!/<svg\b/i.test(mapSvg) || !/<svg\b/i.test(revealSvg)) {
    throw new Error(`${level.id} contains an invalid SVG asset.`);
  }

  for (const segment of mapData.segments) {
    const id = escapeRegExp(segment.id);
    const pathPattern = new RegExp(`data-segment-id=["']${id}["']`);
    const startPattern = new RegExp(`data-start-for=["']${id}["']`);
    if (!pathPattern.test(mapSvg)) {
      throw new Error(`${character.mapFile} is missing path ${segment.id}.`);
    }
    if (!startPattern.test(mapSvg)) {
      throw new Error(`${character.mapFile} is missing start marker ${segment.id}.`);
    }
  }
}

console.log(`Validated ${catalog.levels.length} playable level(s), their metadata, SVG trails, markers, and reveals.`);
