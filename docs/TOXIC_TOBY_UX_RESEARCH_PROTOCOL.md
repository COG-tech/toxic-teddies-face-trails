# Toxic Toby Mobile UX Research Protocol

Status: execution-ready
Study type: mixed-method moderated usability and recognition study
Primary devices: installed iOS and Android builds
Sample: 12 participants

## Research objectives

1. Determine whether first-time players understand that a clear arrowhead lane permits removal.
2. Measure touch-selection reliability and distinguish game-rule failures from missed taps.
3. Determine whether blocked feedback is understandable and perceived as fair.
4. Test whether the arrow geometry itself reads as Toxic Toby and communicates the intended expression.
5. Measure difficulty progression across the five Toxic Toby expressions.
6. Verify exact save recovery after force close and relaunch.

## Research questions

- Can a new player make a valid removal without verbal instruction?
- How quickly does the player discover the arrowhead-lane rule?
- Are missed taps rare enough that difficulty comes from reasoning rather than touch precision?
- Can the player identify why a blocked trail cannot leave?
- Is Toxic Toby recognizable without the backdrop?
- Does each expression feel harder than the prior expression without becoming arbitrary?
- Does the restored board match the participant's remembered state after relaunch?

## Hypotheses and success thresholds

| Hypothesis | Measure | Target |
|---|---|---:|
| Players understand the first action quickly | First valid removal within 15 seconds | 80%+ |
| Valid touch input is dependable | Valid intended taps producing the expected response | 98%+ |
| Arrow-only geometry communicates identity | Correct Toxic Toby recognition without backdrop | 80%+ |
| Blocked feedback explains the rule | Correct explanation after one blocked attempt | 80%+ |
| Native save recovery is dependable | Exact board recovery after relaunch | 98%+ |
| Difficulty progression is controlled | Median completion time increases without a severe abandonment spike | Directional |

## Participant sample

Recruit 12 participants:

- 6 iOS users and 6 Android users;
- balanced across frequent puzzle players and casual/non-puzzle players;
- at least 4 participants aged 35 or older to cover the nostalgia audience;
- at least 3 participants who regularly use larger text, reduced motion, screen readers or touch accommodations where recruitment allows;
- no participant who has previously tested the current build.

Avoid recruiting only developers, close project collaborators or expert puzzle players.

## Screening criteria

Include participants who:

- use a smartphone at least five days per week;
- are comfortable installing a TestFlight or Google Play testing build;
- can complete a 35–45 minute moderated session;
- consent to screen/audio recording or, when recording is declined, detailed observation notes.

Exclude participants who:

- have worked directly on Toxic Teddies;
- have already learned the current blocking rule;
- cannot safely use the test device setup.

## Ethics and privacy

Before the session:

- provide a plain-language consent form;
- explain that participation is voluntary and can stop at any time;
- state what is recorded and how long recordings are retained;
- assign a participant code rather than storing names in event exports;
- do not collect raw continuous touch coordinates;
- do not collect email, account ID, advertising ID or contact information inside the app analytics queue;
- store consent records separately from research data;
- redact notifications and personal information visible during screen recording.

The app's research logger records approved event names and aggregate timing/state metadata only. Data remains local until deliberately exported by the moderator.

## Study design

Use a within-subject sequence for first-use, blocking, difficulty and recovery. Use a counterbalanced between-subject recognition comparison.

### Recognition conditions

Assign participants alternately:

- Group A: arrow-only first, then neutral parchment, then backdrop.
- Group B: backdrop first, then arrow-only, then neutral parchment.

This reduces order effects while allowing every participant to experience all three conditions.

## Session structure

### 1. Introduction and consent — 5 minutes

- confirm consent;
- explain that the product is being tested, not the participant;
- request think-aloud commentary;
- do not explain the arrowhead-lane rule.

### 2. First-use task — 5 minutes

Prompt:

> Open Toxic Toby and begin the first expression. Do what you think the game is asking you to do.

Observe:

- time to first board interaction;
- time to first valid removal;
- missed taps;
- blocked selections;
- whether instructions or hint are opened;
- participant explanation of the rule.

Do not assist for the first 60 seconds unless the participant is distressed or unable to continue.

### 3. Blocked-state comprehension — 5 minutes

Use a known blocked path or ask the participant to select one naturally.

Ask:

- What happened?
- Why do you think that trail did not leave?
- What would you do next?
- Did the game feel broken, unfair or understandable?

Score comprehension:

- 0: cannot explain;
- 1: notices failure but gives incorrect reason;
- 2: identifies another trail as the blocker;
- 3: identifies the visible arrowhead lane and first blocker.

Pass threshold: score 2 or 3.

### 4. Recognition test — 5 minutes

Show the assigned condition order without names.

Ask:

- What object or character does this shape resemble?
- What facial expression does it appear to have?
- Which visual features led you to that answer?

Record exact answers before giving any prompt or multiple-choice options.

### 5. Five-expression difficulty test — 12–18 minutes

Ask the participant to play all five expressions or until the study stopping rule is reached.

For each expression record:

- start and completion time;
- path selections;
- successful removals;
- blocked attempts;
- missed taps;
- hints;
- restarts;
- completion or abandonment;
- self-rated difficulty from 1–7;
- confidence in the next move from 1–7 at three checkpoints.

Stopping rule:

- stop a level after 6 minutes without meaningful progress or at participant request;
- record the reason rather than forcing completion.

### 6. Save and relaunch recovery — 5 minutes

- remove at least five paths from an unfinished level;
- ask the participant to note what remains;
- force-close the app;
- relaunch;
- compare restored removed-path IDs and visible board state;
- ask whether the restored state matches expectations.

### 7. Debrief — 5 minutes

Ask:

- What was the most confusing moment?
- What felt satisfying?
- What felt unfair?
- Did the face feel like part of the puzzle or merely a background?
- Which expression was most memorable?
- What would make you continue playing tomorrow?

## Moderator safeguards

- use the same neutral prompts across participants;
- do not praise correct answers during tasks;
- avoid leading questions such as “Did you see the blocker?”;
- record interventions and assistance;
- do not change device settings mid-task unless testing an accessibility condition;
- reset the app to the approved starting state before every session.

## Data collection

For every participant retain:

- participant code;
- platform and device model;
- app build ID and content version;
- moderator notes;
- task outcome scores;
- locally exported analytics JSON;
- recording filename when consented;
- accessibility settings used;
- observed defects with reproduction steps.

## Quantitative analysis

Calculate:

- proportion achieving first valid removal within 15 seconds with Wilson 95% confidence interval;
- valid-tap response rate;
- missed-tap rate per 100 board taps;
- blocked-state comprehension pass rate;
- arrow-only recognition rate;
- exact recovery success rate;
- median and interquartile range for completion time by expression;
- median blocked attempts and hints by expression;
- completion/abandonment by platform and puzzle-experience segment.

With 12 participants, treat statistical comparisons as directional rather than definitive. Do not claim population-level significance from this sample.

## Qualitative analysis

Use structured thematic analysis:

1. Two reviewers independently code confusion, feedback, recognition, fairness, touch and motivation observations.
2. Reconcile code disagreements through discussion.
3. Group findings into themes.
4. Link every finding to at least two evidence items or mark it as a single-participant observation.
5. Separate usability defects from preference statements.

## Severity framework

- Critical: blocks completion, corrupts progress or creates unsafe/inaccessible behavior.
- High: repeatedly causes failure or misunderstanding for multiple participants.
- Medium: slows progress or reduces confidence but has a workaround.
- Low: cosmetic, wording or isolated preference issue.

## Recommendation format

Every recommendation must include:

- evidence;
- affected segment and frequency;
- severity;
- proposed design action;
- expected metric change;
- owner;
- validation method;
- decision: implement, experiment, monitor or reject.

## Deliverables

- participant-level task ledger;
- analytics export folder using participant codes;
- quantitative summary;
- thematic findings report;
- highlight clips or timestamp list;
- prioritized action register;
- go/no-go recommendation for store testing and Moldy Molly production.

## Go/no-go rule

Do not scale to the remaining Teddies when:

- valid-tap response is below 98%;
- exact recovery fails on any unexplained case;
- a majority perceives blocked feedback as broken;
- arrow-only Toxic Toby recognition is below 80%;
- a critical accessibility or progress defect remains open.
