import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const checkOnly = process.argv.includes('--check');
const config = JSON.parse(await readFile(path.join(root, 'app-version.json'), 'utf8');

const required = [
  ['appVersion', value => /^\d+\.\d+\.\d+$/.test(value)],
  ['iosBuildNumber', value => Number.isInteger(value) && value > 0],
  ['androidVersionCode', value => Number.isInteger(value) && value > 0],
  ['contentVersion', value => typeof value === 'string' && value.length > 0],
  ['saveSchemaVersion', value => Number.isInteger(value) && value > 0],
  ['minimumCompatibleSaveSchemaVersion', value => Number.isInteger(value) && value > 0],
];
for (const [key, validate] of required) {
  if (!validate(config[key])) throw new Error(`Invalid app-version.json field: ${key}`);
}
if (config.minimumCompatibleSaveSchemaVersion > config.saveSchemaVersion) {
  throw new Error('minimumCompatibleSaveSchemaVersion cannot exceed saveSchemaVersion');
}

const buildId = `${config.appVersion}+${config.iosBuildNumber}.${config.contentVersion}`;
const generated = {
  schemaVersion: config.schemaVersion,
  appVersion: config.appVersion,
  iosBuildNumber: config.iosBuildNumber,
  androidVersionCode: config.androidVersionCode,
  contentVersion: config.contentVersion,
  saveSchemaVersion: config.saveSchemaVersion,
  minimumCompatibleSaveSchemaVersion: config.minimumCompatibleSaveSchemaVersion,
  buildId,
};

async function replaceJson(file, mutator) {
  const filePath = path.join(root, file);
  const current = JSON.parse(await readFile(filePath, 'utf8'));
  const next = mutator(current);
  const serialized = `${JSON.stringify(next, null, 2)}\n`;
  const existing = await readFile(filePath, 'utf8');
  if (existing === serialized) return false;
  if (checkOnly) throw new Error(`${file} is not synchronized with app-version.json`);
  await writeFile(filePath, serialized, 'utf8');
  return true;
}

async function replaceText(file, transform) {
  const filePath = path.join(root, file);
  const existing = await readFile(filePath, 'utf8');
  const next = transform(existing);
  if (next === existing) return false;
  if (checkOnly) throw new Error(`${file} is not synchronized with app-version.json`);
  await writeFile(filePath, next, 'utf8');
  return true;
}

const changed = [];
if (await replaceJson('package.json', value => ({...value, version: config.appVersion}))) changed.push('package.json');
if (await replaceJson('package-lock.json', value => ({
  ...value,
  version: config.appVersion,
  packages: {
    ...value.packages,
    '': {
      ...value.packages?.[''],
      version: config.appVersion,
    },
  },
}))) changed.push('package-lock.json');
if (await replaceJson('src/content/level-manifest.json', value => ({...value, content_version: config.contentVersion}))) changed.push('src/content/level-manifest.json');

const generatedPath = path.join(root, 'src', 'generated', 'build-info.json');
await mkdir(path.dirname(generatedPath), {recursive: true});
let generatedExisting = '';
try { generatedExisting = await readFile(generatedPath, 'utf8'); } catch {}
const generatedSerialized = `${JSON.stringify(generated, null, 2)}\n`;
if (generatedExisting !== generatedSerialized) {
  if (checkOnly) throw new Error('src/generated/build-info.json is not synchronized with app-version.json');
  await writeFile(generatedPath, generatedSerialized, 'utf8');
  changed.push('src/generated/build-info.json');
}

if (await replaceText('index.html', value => value.replace(
  /(<meta name="toxic-teddies-build" content=")[^"]+(" \/>)/,
  `$1${buildId}$2`,
))) changed.push('index.html');

if (await replaceText('android/app/build.gradle', value => value
  .replace(/versionCode\s+\d+/, `versionCode ${config.androidVersionCode}`)
  .replace(/versionName\s+"[^"]+"/, `versionName "${config.appVersion}"`))) {
  changed.push('android/app/build.gradle');
}

if (await replaceText('ios/App/App.xcodeproj/project.pbxproj', value => value
  .replace(/CURRENT_PROJECT_VERSION = \d+;/g, `CURRENT_PROJECT_VERSION = ${config.iosBuildNumber};`)
  .replace(/MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${config.appVersion};`))) {
  changed.push('ios/App/App.xcodeproj/project.pbxproj');
}

if (checkOnly) {
  console.log(`Version synchronization verified: ${buildId}`);
} else {
  console.log(changed.length ? `Synchronized ${changed.join(', ')}` : `Versions already synchronized: ${buildId}`);
}
