# Change Protocol

Every code, content, visual, progression, release, or roadmap change must follow this protocol.

## 1. Establish the baseline

- Read `SECOND_BRAIN.md` and every file in `docs/second-brain/`.
- Fetch the latest `main` commit before creating a branch.
- Confirm the current browser/native build and current active next action.
- Identify whether the request changes code, visuals, content, progression, saves, analytics, accessibility, release packaging, or project scope.

## 2. Check for conflicts and repeats

- Search `FAILURE_LEDGER.md` for the symptom and proposed approach.
- Search `LOCKED_DECISIONS.md` for rules affected by the change.
- Search merged pull requests and current files before adding a second implementation.
- Prefer fixing the canonical implementation over layering another patch or duplicate source of truth.

## 3. Define the change before editing

Record:

- problem observed;
- exact expected behavior;
- files/systems likely affected;
- locked decisions that must remain intact;
- failure-ledger entries relevant to the work;
- automated evidence required;
- human/device/artwork evidence still required;
- rollback plan.

## 4. Protect stable systems

The following are high-risk and require dedicated regression coverage:

- pointer/tap selection;
- blocker detection;
- head-first removal;
- deterministic solver data;
- save migrations and exact restore;
- expression progression;
- feed unlock routes;
- browser publication;
- native offline bundling;
- content-integrity manifests;
- accessibility controls.

Do not rewrite these systems to solve an unrelated visual or copy problem.

## 5. Visual-change rule

For any change affecting the board, level composition, background, character silhouette, reveal, or interface layout:

- compare against `VISUAL_REFERENCE.md`;
- preserve the original Toxic Teddies 2D art direction;
- provide before/after screenshots at phone size;
- verify the face remains the first visual focus;
- verify controls do not cover important face areas or exit lanes;
- verify high contrast and touch-assistance behavior;
- obtain owner approval before treating final character art as approved.

## 6. Build and test

At minimum:

```text
npm run validate:second-brain
npm run check
npm run build
```

Run native and store workflows whenever native projects, versions, manifests, offline files, signing, or release configuration are affected.

## 7. Audit the result

Before merge, independently answer:

- Does it solve the reported problem?
- Did it break anything already working?
- Does it create a duplicate path, tracker, manifest, handler, or source of truth?
- Does it contradict a locked decision?
- Are automated and human gates clearly separated?
- Does the published browser build contain the change?
- Is the second brain updated to reflect the new truth?

## 8. Pull-request evidence

Every pull request must state:

- baseline commit;
- problem and reproduction;
- root cause;
- changed files/systems;
- locked decisions preserved;
- failure-ledger entries consulted;
- automated tests passed;
- human gates pending;
- visual comparison when applicable;
- rollback method;
- next action after merge.

## 9. Merge rule

Do not merge when:

- required automated tests fail;
- the PR duplicates a working implementation;
- final art is being substituted without approval;
- a direct route bypasses progression;
- browser publication is stale;
- second-brain records are inaccurate;
- physical or store work is falsely described as complete.

## 10. After merge

- Confirm the merge SHA.
- Confirm the published build is generated from the merged change.
- Update `STATUS.md`, `TEST_MATRIX.md`, `FAILURE_LEDGER.md`, and `NEXT_ACTION.md` as needed.
- Record any newly discovered problem before starting another feature.
