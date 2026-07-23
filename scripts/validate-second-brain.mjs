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
  'docs/second-brain/VISUAL_REFERENCE.md',
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
assert(memory.playable?.teddyIds?.length === 1 && memory.playable.teddyIds[0] === 'tt01', 'Playable Teddy truth must remain tt01 only until content is approved');
assert(memory.playable?.expressionsPerTeddy === 5, 'Every Teddy must retain five expressions');
assert(memory.playable?.targetLevelCount === 60, 'Founding 12 target must remain 60 levels');
assert(memory.activeNextAction?.id, 'Exactly one active next action must be recorded');
assert(memory.activeNextAction?.status, 'The active next action must have a status');
assert(memory.artwork?.finalRevealImagesApproved === false, 'Final reveal images cannot be marked approved without updating the canonical evidence');
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
assert((failures.match(/^## F-\d{3}/gm) || []).length >= 8, 'Failure ledger is incomplete');

const visual = await readFile(path.join(root, 'docs/second-brain/VISUAL_REFERENCE.md'), 'utf8');
assert(visual.includes('composition and readability'), 'Visual reference purpose is missing');
assert(visual.includes('Do not copy from the reference'), 'Visual anti-copy guardrail is missing');
assert(visual.includes('The puzzle is the dominant object'), 'Visual hierarchy requirement is missing');

const protocol = await readFile(path.join(root, 'docs/second-brain/CHANGE_PROTOCOL.md'), 'utf8');
assert(protocol.includes('FAILURE_LEDGER.md'), 'Change protocol must require failure-ledger review');
assert(protocol.includes('VISUAL_REFERENCE.md'), 'Change protocol must require visual-reference review');
assert(protocol.includes('npm run validate:second-brain'), 'Change protocol must require second-brain validation');

console.log(`Second brain verified: ${requiredDocuments.length} canonical files, one active action, locked decisions, failure history, visual reference, and human-gate truth.`);
