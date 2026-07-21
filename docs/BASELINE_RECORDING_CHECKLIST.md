# Baseline Device Recording Checklist

The recordings in this checklist must be captured before the native input system is refactored.

## Required recordings

### Desktop reference

Record one continuous session showing:

1. page load;
2. Toxic Toby home card;
3. Level 1 opening;
4. one successful nearest-path tap;
5. complete head-first path removal;
6. one blocked tap and life loss;
7. hint behavior;
8. reset;
9. back navigation.

Record:

```text
Commit: c3228d70eda6fe25d48fecd0b80ce79bd53019f5
Browser:
Operating system:
Viewport:
Input: mouse or trackpad
Filename/link:
```

### Physical-phone reference

Record one continuous session on a real phone showing:

1. portrait launch;
2. home screen and Teddy cards;
3. Toxic Toby Level 1;
4. tap close to a path rather than exactly on the arrowhead;
5. successful removal;
6. blocked tap;
7. long press;
8. hint;
9. reset;
10. browser background and resume.

Record:

```text
Commit: c3228d70eda6fe25d48fecd0b80ce79bd53019f5
Phone model:
Operating system/version:
Browser:
Screen size:
Filename/link:
```

## Recording rules

- Do not edit gameplay files merely to make the recording easier.
- Keep the status text and toxic-drop indicators visible.
- Include the finger or pointer position where possible.
- Capture at normal speed.
- Do not crop away the board edges.
- Store recordings outside the production asset bundle.
- Add only links or filenames to the GitHub issue; do not commit oversized video files to the repository.

## Completion gate

Issue #1 remains open until both recordings exist and the smoke test result is attached to the issue.
