import { execFileSync } from 'node:child_process';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const reportPath = path.join(root, 'store', 'reports', 'store-readiness.json');
const failures = [];
const warnings = [];
const checks = [];

async function text(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

async function json(relativePath) {
  return JSON.parse(await text(relativePath));
}

async function exists(relativePath) {
  try {
    await stat(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

function check(name, condition, detail) {
  checks.push({name, passed: Boolean(condition), detail});
  if (!condition) failures.push(`${name}: ${detail}`);
}

function warn(name, condition, detail) {
  if (!condition) warnings.push(`${name}: ${detail}`);
}

function maxLength(name, value, maximum) {
  check(name, typeof value === 'string' && value.length <= maximum, `${value?.length ?? 0}/${maximum} characters`);
}

const version = await json('app-version.json');
const metadata = await json('store/metadata/en-US.json');
const declarations = await json('store/declarations/privacy-and-content.json');
const packageJson = await json('package.json');
const capacitor = await text('capacitor.config.ts');
const androidGradle = await text('android/app/build.gradle');
const androidVariables = await text('android/variables.gradle');
const androidManifest = await text('android/app/src/main/AndroidManifest.xml');
const iosProject = await text('ios/App/App.xcodeproj/project.pbxproj');
const iosInfo = await text('ios/App/App/Info.plist');
const privacyManifest = await text('ios/App/App/PrivacyInfo.xcprivacy');

check('Application ID is locked', capacitor.includes("appId: 'com.cogtech.toxicteddies'")
  && androidGradle.includes('applicationId "com.cogtech.toxicteddies"')
  && iosProject.includes('PRODUCT_BUNDLE_IDENTIFIER = com.cogtech.toxicteddies;'), 'Expected com.cogtech.toxicteddies on Capacitor, Android and iOS.');
check('Native app uses bundled content', !/server\s*:\s*\{[^}]*url\s*:/s.test(capacitor), 'capacitor.config.ts must not define a remote server.url.');
check('Package version synchronized', packageJson.version === version.appVersion, `${packageJson.version} must equal ${version.appVersion}.`);
check('Android version synchronized', androidGradle.includes(`versionCode ${version.androidVersionCode}`)
  && androidGradle.includes(`versionName "${version.appVersion}"`), 'Android versionCode/versionName must match app-version.json.');
check('iOS version synchronized', iosProject.includes(`CURRENT_PROJECT_VERSION = ${version.iosBuildNumber};`)
  && iosProject.includes(`MARKETING_VERSION = ${version.appVersion};`), 'Xcode build and marketing versions must match app-version.json.');
check('Google Play target API', /targetSdkVersion\s*=\s*36/.test(androidVariables), 'The store build must target Android API 36.');
check('Android release bundle configuration', androidGradle.includes("TOXIC_ANDROID_KEYSTORE_PATH")
  && androidGradle.includes('signingConfigs') && androidGradle.includes('release {'), 'Release signing must use environment variables and support an unsigned CI bundle.');
check('No unnecessary Android sensitive permissions', !/(ACCESS_FINE_LOCATION|ACCESS_COARSE_LOCATION|CAMERA|RECORD_AUDIO|READ_CONTACTS|AD_ID)/.test(androidManifest), 'Sensitive permissions are not allowed in this release.');
check('iOS privacy manifest exists', privacyManifest.includes('<key>NSPrivacyTracking</key>')
  && privacyManifest.includes('<false/>')
  && privacyManifest.includes('<key>NSPrivacyCollectedDataTypes</key>'), 'PrivacyInfo.xcprivacy must declare tracking and collection status.');
check('iOS privacy manifest is bundled', iosProject.includes('PrivacyInfo.xcprivacy in Resources'), 'Run npm run prepare:build so the privacy manifest is added to the App target.');
check('iOS export compliance declared', iosInfo.includes('<key>ITSAppUsesNonExemptEncryption</key>')
  && /<key>ITSAppUsesNonExemptEncryption<\/key>\s*<false\/>/.test(iosInfo), 'Info.plist must declare no non-exempt encryption.');
check('Privacy policy source exists', await exists('privacy.html'), 'privacy.html is required.');
check('Support page source exists', await exists('support.html'), 'support.html is required.');
check('App icon catalog exists', await exists('ios/App/App/Assets.xcassets/AppIcon.appiconset/Contents.json'), 'iOS AppIcon asset catalog is required.');
check('Android launcher resources exist', await exists('android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml'), 'Android adaptive launcher icon resources are required.');

maxLength('Shared app name', metadata.shared.appName, 30);
maxLength('Apple subtitle', metadata.apple.subtitle, 30);
maxLength('Apple promotional text', metadata.apple.promotionalText, 170);
maxLength('Apple keywords', metadata.apple.keywords, 100);
maxLength('Apple description', metadata.apple.description, 4000);
maxLength('Google short description', metadata.google.shortDescription, 80);
maxLength('Google full description', metadata.google.fullDescription, 4000);

for (const [field, value] of Object.entries({
  privacyPolicyUrl: metadata.shared.privacyPolicyUrl,
  supportUrl: metadata.shared.supportUrl,
  marketingUrl: metadata.shared.marketingUrl,
})) {
  check(`${field} uses HTTPS`, typeof value === 'string' && value.startsWith('https://'), `${field} must be a public HTTPS URL.`);
}

check('Privacy declaration rejects tracking', declarations.privacy.tracking === false
  && declarations.privacy.networkAnalytics === false
  && declarations.privacy.personalDataTransmittedOffDevice === false, 'Store declaration must match the current local-only implementation.');
check('No ads or purchases declared', declarations.privacy.ads === false
  && declarations.privacy.inAppPurchases === false, 'Current release has no ads or purchases.');
check('Research privacy limits declared', declarations.privacy.localResearchLogging.enabledByDefault === false
  && declarations.privacy.localResearchLogging.rawTouchCoordinates === false
  && declarations.privacy.localResearchLogging.personalIdentifiers === false, 'Research logging must remain opt-in, local, and coordinate-free.');

const disallowedDependencies = Object.keys({...packageJson.dependencies, ...packageJson.devDependencies})
  .filter(name => /(firebase|admob|facebook|appsflyer|adjust|segment|mixpanel|amplitude)/i.test(name));
check('No undeclared network analytics or ad SDK', disallowedDependencies.length === 0, `Unexpected packages: ${disallowedDependencies.join(', ') || 'none'}.`);

let trackedFiles = [];
try {
  trackedFiles = execFileSync('git', ['ls-files'], {cwd: root, encoding: 'utf8'}).trim().split('\n').filter(Boolean);
} catch {
  warn('Secret scan', false, 'git ls-files was unavailable; run the validation inside a Git checkout.');
}
const secretPatterns = [
  /(^|\/).*\.jks$/i,
  /(^|\/).*\.keystore$/i,
  /(^|\/).*\.p12$/i,
  /(^|\/).*\.mobileprovision$/i,
  /(^|\/)AuthKey_.*\.p8$/i,
  /(^|\/)ExportOptions\.plist$/i,
  /(^|\/)keystore\.properties$/i,
];
const trackedSecrets = trackedFiles.filter(file => secretPatterns.some(pattern => pattern.test(file)));
check('No signing secrets tracked', trackedSecrets.length === 0, `Tracked secret-like files: ${trackedSecrets.join(', ') || 'none'}.`);

warn('Store artwork approval', false, 'Repository checks confirm icon resources exist, but final icon, feature graphic, and screenshots still require visual approval.');
warn('Store accounts and signing', false, 'Apple Developer, App Store Connect, Play Console, certificates, provisioning profiles, and upload keys require account-holder action.');
warn('Physical internal builds', false, 'TestFlight and Google Play internal installs must be completed on real devices.');

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  appVersion: version.appVersion,
  iosBuildNumber: version.iosBuildNumber,
  androidVersionCode: version.androidVersionCode,
  bundleId: 'com.cogtech.toxicteddies',
  passed: failures.length === 0,
  checks,
  failures,
  warnings,
};
await mkdir(path.dirname(reportPath), {recursive: true});
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

if (failures.length) {
  console.error(`Store readiness failed with ${failures.length} error(s):`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`Store readiness passed ${checks.length} checks for ${version.appVersion} (${version.iosBuildNumber}/${version.androidVersionCode}).`);
warnings.forEach(message => console.warn(`WARNING: ${message}`));
