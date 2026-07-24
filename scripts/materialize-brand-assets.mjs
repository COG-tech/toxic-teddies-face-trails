import {createHash} from 'node:crypto';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';

const sourcePaths = Array.from({length: 5}, (_, index) =>
  resolve(`src/generated/loading-image-approved-part-${String(index + 1).padStart(2, '0')}.txt`),
);
const outputPath = resolve('public/assets/branding/loading/toxic-teddies-loading.webp');
const expectedByteLength = 64_450;
const expectedSha256 = 'a0a6a06e34b538027b755427d0a24026b988d69705468dff1bf075e2286198ed';

const encodedParts = await Promise.all(sourcePaths.map(path => readFile(path, 'utf8')));
const encodedArtwork = encodedParts.map(part => part.trim()).join('');
const bytes = Buffer.from(encodedArtwork, 'base64');
const actualSha256 = createHash('sha256').update(bytes).digest('hex');

if (bytes.length !== expectedByteLength) {
  throw new Error(`Approved loading artwork byte length mismatch: expected ${expectedByteLength}, received ${bytes.length}`);
}
if (actualSha256 !== expectedSha256) {
  throw new Error(`Approved loading artwork SHA-256 mismatch: expected ${expectedSha256}, received ${actualSha256}`);
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
