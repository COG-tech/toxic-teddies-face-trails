import { createHash } from 'node:crypto';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const verifyNativeCopies = process.argv.includes('--native');
const buildInfo = JSON.parse(await readFile(path.join(root, 'src/generated/build-info.json'), 'utf8'));
const integrity = JSON.parse(await readFile(path.join(root, 'src/generated/content-integrity.json'), 'utf8'));
const capacitorConfig = await readFile(path.join(root, 'capacitor.config.ts'), 'utf8');
const androidGradle = await readFile(path.join(root, 'android/app/build.gradle'), 'utf8');
const iosProject = await readFile(path.join(root, 'ios/App/App.xcodeproj/project.pbxproj'), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(!/\burl\s*:/.test(capacitorConfig), 'Capacitor production config must not contain server.url');
assert(capacitorConfig.includes("webDir: 'dist'"), 'Capacitor webDir must be dist');
assert(androidGradle.includes(`versionCode ${buildInfo.androidVersionCode}`), 'Android versionCode is out of sync');
assert(androidGradle.includes(`versionName "${buildInfo.appVersion}"`), 'Android versionName is out of sync');
assert(iosProject.includes(`CURRENT_PROJECT_VERSION = ${buildInfo.iosBuildNumber};`), 'iOS build number is out of sync');
assert(iosProject.includes(`MARKETING_VERSION = ${buildInfo.appVersion};`), 'iOS marketing version is out of sync');
assert(integrity.appVersion === buildInfo.appVersion, 'Integrity app version mismatch');
assert(integrity.contentVersion === buildInfo.contentVersion, 'Integrity content version mismatch');
assert(Array.isArray(integrity.files) && integrity.files.length > 0, 'Integrity manifest has no bundled files');

async function verifyDirectory(directory, label) {
  await access(path.join(directory, 'index.html'));
  for (const entry of integrity.files) {
    const relative = entry.path.replace(/^\.\//, '');
    const bytes = await readFile(path.join(directory, relative));
    assert(bytes.byteLength === entry.bytes, `${label} ${relative}: byte count mismatch`);
    const digest = createHash('sha256').update(bytes).digest('hex');
    assert(digest === entry.sha256, `${label} ${relative}: SHA-256 mismatch`);
  }
}

await verifyDirectory(path.join(root, 'dist'), 'dist');

if (verifyNativeCopies) {
  await verifyDirectory(path.join(root, 'android/app/src/main/assets/public'), 'android');
  await verifyDirectory(path.join(root, 'ios/App/App/public'), 'ios');
}

console.log(`Offline bundle verified: ${integrity.files.length} files, build ${buildInfo.buildId}${verifyNativeCopies ? ', native copies included' : ''}.`);
