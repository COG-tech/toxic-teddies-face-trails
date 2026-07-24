import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import loadingArtwork from '../src/generated/loading-image-part-a.js';

const outputPath = resolve('public/assets/branding/loading/toxic-teddies-loading.webp');
const bytes = Buffer.from(loadingArtwork, 'base64');

if (bytes.length < 20_000) {
  throw new Error(`Approved loading artwork is unexpectedly small: ${bytes.length} bytes`);
}
if (bytes.subarray(0, 4).toString('ascii') !== 'RIFF' || bytes.subarray(8, 12).toString('ascii') !== 'WEBP') {
  throw new Error('Approved loading artwork is not a valid WebP payload');
}

await mkdir(dirname(outputPath), {recursive: true});
const existing = await readFile(outputPath).catch(() => null);
if (!existing || !existing.equals(bytes)) {
  await writeFile(outputPath, bytes);
  console.log(`Materialized approved loading artwork at ${outputPath}`);
} else {
  console.log(`Approved loading artwork already current at ${outputPath}`);
}
