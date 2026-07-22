import { access, cp, copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
await mkdir(dist, {recursive: true});

const files = [
  'compiled-app.js',
  'hard-mode-v3.js',
  'compiled-level-source.js',
  'interaction-fix.js',
  'mobile-enhancements.js',
  'analytics-enhancements.js',
  'sw.js',
  'manifest.webmanifest',
  '.nojekyll',
];

for (const file of files) {
  const source = path.join(root, file);
  try {
    await access(source);
    await copyFile(source, path.join(dist, file));
  } catch (error) {
    if (file !== '.nojekyll') throw error;
  }
}

await cp(path.join(root, 'levels'), path.join(dist, 'levels'), {recursive: true, force: true});
await cp(path.join(root, 'assets'), path.join(dist, 'assets'), {recursive: true, force: true});

console.log('Copied precompiled game runtime and bundled content into dist/.');
