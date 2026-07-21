import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const sourcePath = path.join(root, 'levels', 'tt01', 'dense-levels-v6.txt');
const outputDirectory = path.join(root, 'levels', 'tt01');
const expressions = ['neutral', 'evil_grin', 'gross', 'angry', 'maniacal_laugh'];

const base64 = (await readFile(sourcePath, 'utf8')).trim();
if (!base64) throw new Error('Dense Toxic Toby level pack is empty');
if (typeof DecompressionStream !== 'function') {
  throw new Error('Node 22 DecompressionStream support is required');
}

const bytes = Uint8Array.from(Buffer.from(base64, 'base64'));
const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
const decoded = await new Response(stream).text();
const pack = JSON.parse(decoded);
await mkdir(outputDirectory, {recursive: true});

const manifest = [];
for (let level = 1; level <= 5; level += 1) {
  const source = pack[String(level)];
  if (!source) throw new Error(`Dense Toxic Toby level ${level} is missing from the pack`);
  const data = {
    ...source,
    schemaVersion: 11,
    levelVersion: 1,
    compilerVersion: 'dense-pack-v6',
    teddy: 'tt01',
    characterName: 'Toxic Toby',
    alternateName: 'Radioactive Ricky',
    level,
    expression: expressions[level - 1],
    strictSequence: false,
    movementRule: 'arrowhead_ray_clear_to_edge',
    decorations: [],
    animation: {
      ...(source.animation || {}),
      pauseMs: 90,
      baseSlideMs: 420,
      msPerCell: 34,
      minSlideMs: 760,
      maxSlideMs: 1420,
      fadeStart: 0.78,
      mode: 'head_first_pull_through',
    },
  };
  const outputPath = path.join(outputDirectory, `level-${level}.json`);
  await writeFile(outputPath, `${JSON.stringify(data)}\n`, 'utf8');
  manifest.push({
    level,
    expression: data.expression,
    gridSize: data.gridSize,
    pieceCount: data.pieces.length,
    file: `level-${level}.json`,
    compilerVersion: data.compilerVersion,
    levelVersion: data.levelVersion,
  });
}

await writeFile(
  path.join(outputDirectory, 'compiled-manifest.json'),
  `${JSON.stringify({schemaVersion: 1, teddy: 'tt01', levels: manifest}, null, 2)}\n`,
  'utf8',
);

console.log(`Extracted ${manifest.length} precompiled Toxic Toby levels.`);
