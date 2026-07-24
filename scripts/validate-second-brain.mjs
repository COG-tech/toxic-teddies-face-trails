import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const requiredDocuments = [
  'SECOND_BRAIN.md',
  'docs/second-brain/STATUS.md',
  'docs/second-brain/NEXT_ACTION.md',
  'docs/second-brain/LOCKED_DECISIONS.md',
  'docs/second-brain/FAILURE_LEDGER.md',
  'docs/second-brain/TEST_MATRIX.md',
  'docs/second-brain/DESIGN_SYSTEM.md',
  'docs/second-brain/VISUAL_REFERENCE.md',
  'docs/second-brain/BRAND_ASSET_PIPELINE.md',
  'docs/second-brain/CHANGE_PROTOCOL.md',
  'docs/second-brain/project-memory.json',
  '.github/pull_request_template.md',
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const relative of requiredDocuments) {
  await access(path.join(root, relative));
}

const memoryPath = path.join(root, 'docs/second-brain/project-memory.json');
const memory = JSON.parse(await readFile(memoryPath, 'utf8'));
assert(memory.schemaVersion === 1, 'Second-brain schemaVersion must be 1');
assert(memory.repository === 'COG-tech/toxic-teddies-face-trails', 'Second-brain repository is incorrect');
assert(memory.product?.brandPromise === 'The face is the puzzle.', 'Brand promise is missing or changed');
assert(memory.product?.bundleId === 'com.cogtech.toxicteddies', 'Bundle ID is missing or changed');
assert(memory.designSystem?.version === '1.0.0', 'Design-system version must be recorded as 1.0.0');
assert(memory.designSystem?.primaryColors?.toxicGreen === '#8DBB13', 'Canonical Toxic Green is missing or changed');
assert(memory.designSystem?.primaryColors?.slimeGreen === '#B7E24B', 'Canonical Slime Green is missing or changed');
assert(memory.designSystem?.neutralColors?.grime900 === '#0F0C08', 'Canonical Grime 900 is missing or changed');
assert(memory.designSystem?.typography?.display === 'Toxic Head custom', 'Canonical display typography is missing or changed');
assert(memory.designSystem?.typography?.body === 'Inter system', 'Canonical body typography is missing or changed');
assert(JSON.stringify(memory.designSystem?.spacingScale) === JSON.stringify([4, 8, 12, 16, 24, 32, 64]), 'Canonical spacing scale changed');
assert(memory.designSystem?.gridColumns === 12, 'Canonical grid must remain twelve columns');
assert(Array.isArray(memory.designSystem?.accessibilityStandards) && memory.designSystem.accessibilityStandards.includes('WCAG 2.1 AA'), 'Design-system accessibility standard is missing');
assert(memory.playable?.teddyIds?.length === 1 && memory.playable.teddyIds[0] === 'tt01', 'Playable Teddy truth must remain tt01 only until content is approved');
assert(memory.playable?.expressionsPerTeddy === 5, 'Every Teddy must retain five expressions');
assert(memory.playable?.targetLevelCount === 60, 'Founding 12 target must remain 60 levels');
assert(memory.activeNextAction?.id, 'Exactly one active next action must be recorded');
assert(memory.activeNextAction?.status, 'The active next action must have a status');
assert(typeof memory.artwork?.finalRevealImagesApproved === 'boolean', 'Artwork approval must be recorded explicitly as true or false');
assert(Array.isArray(memory.artwork?.expectedFiles) && memory.artwork.expectedFiles.length === 5, 'Exactly five Toxic Toby reveal-image slots must be recorded');
assert(Array.isArray(memory.lockedSystems) && memory.lockedSystems.length >= 8, 'Locked systems are incomplete');
assert(Array.isArray(memory.humanGatesPending) && memory.humanGatesPending.length > 0, 'Human gates must not disappear without evidence');

const expectedExpressions = ['neutral', 'evil_grin', 'gross', 'angry', 'maniacal_laugh'];
assert(JSON.stringify(memory.playable.expressionOrder) === JSON.stringify(expectedExpressions), 'Expression order changed');

const nextAction = await readFile(path.join(root, 'docs/second-brain/NEXT_ACTION.md'), 'utf8');
const actionHeadings = [...nextAction.matchAll(/^## Action$/gm)];
assert(actionHeadings.length === 1, 'NEXT_ACTION.md must contain exactly one canonical Action section');
assert(/Status:\s*\*\*ACTIVE/i.test(nextAction), 'NEXT_ACTION.md must identify the active action');

const decisions = await readFile(path.join(root, 'docs/second-brain/LOCKED_DECISIONS.md'), 'utf8');
assert((decisions.match(/^## D-\d{3}/gm) || []).length >= 12, 'Locked decision register is incomplete');

const failures = await readFile(path.join(root, 'docs/second-brain/FAILURE_LEDGER.md'), 'utf8');
assert((failures.match(/^## F-\d{3}/gm) || []).length >= 9, 'Failure ledger is incomplete');

const designSystem = await readFile(path.join(root, 'docs/second-brain/DESIGN_SYSTEM.md'), 'utf8');
assert(designSystem.includes('Version 1.0.0'), 'Human-readable design-system version is missing');
assert(designSystem.includes('#8DBB13'), 'Human-readable Toxic Green token is missing');
assert(designSystem.includes('Toxic Head — custom'), 'Human-readable display typography is missing');
assert(designSystem.includes('WCAG 2.1 AA'), 'Human-readable accessibility standard is missing');
assert(designSystem.includes('What this design system does not define'), 'Design-system scope boundary is missing');

const runtimeTokens = await readFile(path.join(root, 'src/design-system/tokens.css'), 'utf8');
for (const [token, value] of Object.entries({
  '--tt-toxic-green': '#8DBB13',
  '--tt-slime-green': '#B7E24B',
  '--tt-rust-orange': '#A84F18',
  '--tt-mold-olive': '#6F762C',
  '--tt-patch-purple': '#8F456D',
  '--tt-parchment-100': '#F3E4BD',
  '--tt-parchment-300': '#D8BF8A',
  '--tt-brown-700': '#382D1F',
  '--tt-ink-900': '#1D160F',
  '--tt-grime-900': '#0F0C08',
})) {
  assert(runtimeTokens.includes(`${token}: ${value}`), `Runtime token ${token} must remain ${value}`);
}

const runtimeIndex = await readFile(path.join(root, 'index.html'), 'utf8');
assert(runtimeIndex.includes('dark-theme-overrides.css'), 'Final runtime dark-theme layer is missing');
assert(runtimeIndex.indexOf('dark-theme-overrides.css') > runtimeIndex.indexOf('completion-feed.css'), 'Dark-theme overrides must load after component styles');

const visual = await readFile(path.join(root, 'docs/second-brain/VISUAL_REFERENCE.md'), 'utf8');
assert(visual.includes('composition and readability'), 'Visual reference purpose is missing');
assert(visual.includes('Do not copy from the reference'), 'Visual anti-copy guardrail is missing');
assert(visual.includes('The puzzle is the dominant object'), 'Visual hierarchy requirement is missing');

const brandAssets = await readFile(path.join(root, 'docs/second-brain/BRAND_ASSET_PIPELINE.md'), 'utf8');
assert(brandAssets.includes('public/assets/branding/loading/toxic-teddies-loading.webp'), 'Canonical loading-artwork path is missing');
assert(brandAssets.includes('must never wait for a JavaScript import'), 'Direct first-paint image rule is missing');
assert(brandAssets.includes('64,450'), 'Approved loading-artwork byte length is missing');
assert(brandAssets.includes('a0a6a06e34b538027b755427d0a24026b988d69705468dff1bf075e2286198ed'), 'Approved loading-artwork checksum is missing');
assert(brandAssets.includes('minimum full-motion presentation of 1,800 ms'), 'Visible loading-bar duration rule is missing');

const protocol = await readFile(path.join(root, 'docs/second-brain/CHANGE_PROTOCOL.md'), 'utf8');
assert(protocol.includes('FAILURE_LEDGER.md'), 'Change protocol must require failure-ledger review');
assert(protocol.includes('DESIGN_SYSTEM.md'), 'Change protocol must require design-system review');
assert(protocol.includes('VISUAL_REFERENCE.md'), 'Change protocol must require visual-reference review');
assert(protocol.includes('npm run validate:second-brain'), 'Change protocol must require second-brain validation');

console.log(`Second brain verified: ${requiredDocuments.length} canonical files, one active action, locked decisions, failure history, design-system memory, runtime palette alignment, visual reference, brand-asset pipeline, and human-gate truth.`);
