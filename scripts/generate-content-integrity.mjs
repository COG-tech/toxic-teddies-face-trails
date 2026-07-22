import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const buildInfo = JSON.parse(await readFile(path.join(root, 'src/generated/build-info.json'), 'utf8'));

const requiredFiles = [
  'compiled-app.js',
  'hard-mode-v3.js',
  'compiled-level-source.js',
  'interaction-fix.js',
  'mobile-enhancements.js',
  'analytics-enhancements.js',
  'levels/tt01/level-1.json',
  'levels/tt01/level-2.json',
  'levels/tt01/level-3.json',
  'levels/tt01/level-4.json',
  'levels/tt01/level-5.json',
  'assets/backdrops/toxic-toby-expression-sheet.svg',
  'assets/backdrops/tt01/neutral.svg',
  'assets/backdrops/tt01/evil-grin.svg',
  'assets/backdrops/tt01/gross.svg',
  'assets/backdrops/tt01/angry.svg',
  'assets/backdrops/tt01/maniacal-laugh.svg',
];

const files = [];
for (const relativePath of requiredFiles) {
  const bytes = await readFile(path.join(root, relativePath));
  files.push({
    path: `./${relativePath.replaceAll(path.sep, '/')}`,
    bytes: bytes.byteLength,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  });
}

const manifest = {
  schemaVersion: 1,
  appVersion: buildInfo.appVersion,
  contentVersion: buildInfo.contentVersion,
  buildId: buildInfo.buildId,
  files,
};

await mkdir(path.join(root, 'src/generated'), {recursive: true});
await writeFile(
  path.join(root, 'src/generated/content-integrity.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8',
);
console.log(`Generated integrity manifest for ${files.length} bundled files.`);
