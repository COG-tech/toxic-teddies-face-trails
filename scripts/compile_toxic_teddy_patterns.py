#!/usr/bin/env python3
"""Compile dense Toxic Toby arrow-face levels.

The compiler builds the face from playable orthogonal paths. It does not use
flat SVG circles/ellipses for the eyes, nose, muzzle, mouth, patch, seam or
slime. Weak silhouettes are rejected before the packed level file is written.
"""
from __future__ import annotations

import argparse
import base64
import gzip
import json
import random
from collections import Counter, defaultdict
from pathlib import Path

DIRS = {"up": (-1, 0), "right": (0, 1), "down": (1, 0), "left": (0, -1)}
DIRECTION_NAME = {value: key for key, value in DIRS.items()}
EXPRESSIONS = ["neutral", "evil_grin", "gross", "angry", "maniacal_laugh"]
CONFIG = {
    1: (57, 285, 9101),
    2: (59, 320, 9202),
    3: (61, 350, 9303),
    4: (63, 385, 9404),
    5: (65, 420, 9505),
}
REQUIRED_REGIONS = {
    "fur", "left_ear", "right_ear", "button_eye", "infected_eye",
    "stitch", "patch", "muzzle", "nose", "mouth", "slime",
}
STYLE_BY_REGION = {
    "button_eye": "rust", "button_eye_core": "rust",
    "infected_eye": "slime", "infected_eye_core": "slime",
    "stitch": "stitch", "patch": "patch", "mouth": "mouth",
    "teeth": "tooth", "slime": "slime", "nose": "nose",
    "muzzle": "muzzle",
}

Cell = tuple[int, int]


def add(a: Cell, b: Cell) -> Cell:
    return a[0] + b[0], a[1] + b[1]


def manhattan(a: Cell, b: Cell) -> int:
    return abs(a[0] - b[0]) + abs(a[1] - b[1])


def make_mask(size: int, expression: str) -> tuple[set[Cell], dict[Cell, str]]:
    half = (size - 1) / 2
    mask: set[Cell] = set()
    regions: dict[Cell, str] = {}
    mouth_y = {
        "neutral": .43, "evil_grin": .40, "gross": .44,
        "angry": .44, "maniacal_laugh": .42,
    }[expression]

    for row in range(size):
        for col in range(size):
            x = (col - half) / half
            y = (row - half) / half
            head = x * x / .72**2 + (y - .05)**2 / .80**2 <= 1
            left_ear = (x + .63)**2 / .30**2 + (y + .60)**2 / .30**2 <= 1
            right_ear = (x - .63)**2 / .30**2 + (y + .60)**2 / .30**2 <= 1
            if not (head or left_ear or right_ear):
                continue
            if y > .82 and abs(x) > .33:
                continue

            region = "fur"
            if left_ear and x < -.43 and y < -.30:
                region = "left_ear"
            elif right_ear and x > .43 and y < -.30:
                region = "right_ear"

            left_eye = ((x + .28) / .17)**2 + ((y + .14) / .15)**2
            right_eye = ((x - .28) / .18)**2 + ((y + .14) / .16)**2
            if .20 <= left_eye <= 1.40:
                region = "button_eye"
            elif left_eye < .20:
                region = "button_eye_core"
            if .20 <= right_eye <= 1.40:
                region = "infected_eye"
            elif right_eye < .20:
                region = "infected_eye_core"

            muzzle = (x / .40)**2 + ((y - .17) / .24)**2
            if .30 <= muzzle <= 1.35 and y > -.05:
                region = "muzzle"
            nose = (x / .15)**2 + ((y - .04) / .09)**2
            if nose <= 1.20:
                region = "nose"

            mouth = (x / .44)**2 + ((y - mouth_y) / .19)**2
            if .25 <= mouth <= 1.35 and y > .26:
                region = "mouth"
            if expression in {"evil_grin", "maniacal_laugh"} and abs(x) < .38 and mouth < .55 and y > .33:
                region = "teeth"
            if expression == "gross" and x > .04 and .20 < y < .68:
                region = "slime"
            if abs(x) < .045 and -.73 < y < -.02:
                region = "stitch"
            if ((x + .50) / .17)**2 + ((y - .10) / .17)**2 <= 1:
                region = "patch"
            if ((left_ear and x < -.55) or (right_ear and x > .55)) and (row * 5 + col) % 9 in (0, 1):
                region = "slime"

            if left_eye < .055 or right_eye < .05:
                continue
            if (x / .055)**2 + ((y - .04) / .035)**2 <= 1:
                continue
            if abs(x) < .14 and mouth < .14 and y > .38:
                continue

            mask.add((row, col))
            regions[(row, col)] = region
    return mask, regions


def grow_path(seed: Cell, available: set[Cell], regions: dict[Cell, str], target: int, rng: random.Random) -> list[Cell]:
    desired = regions[seed]
    path = [seed]
    used = {seed}
    previous_direction: str | None = None
    while len(path) < target:
        current = path[-1]
        choices = []
        for direction, delta in DIRS.items():
            nxt = add(current, delta)
            if nxt not in available or nxt in used:
                continue
            if any(add(nxt, neighbour) in used and add(nxt, neighbour) != current for neighbour in DIRS.values()):
                continue
            same_region = 0 if regions[nxt] == desired else 3
            turn_preference = 0 if previous_direction and direction != previous_direction else 1
            free_degree = sum(add(nxt, neighbour) in available and add(nxt, neighbour) not in used for neighbour in DIRS.values())
            choices.append((same_region, turn_preference, -free_degree, rng.random(), direction, nxt))
        if not choices:
            break
        choices.sort()
        _, _, _, _, previous_direction, nxt = choices[0]
        path.append(nxt)
        used.add(nxt)
    return path


def compile_level(level: int) -> dict:
    size, target_pieces, seed = CONFIG[level]
    expression = EXPRESSIONS[level - 1]
    rng = random.Random(seed)
    mask, regions = make_mask(size, expression)
    available = set(mask)
    pieces: list[dict] = []
    totals = Counter(regions.values())
    filled = Counter()
    region_targets = {
        key: (.92 if key not in {"fur", "left_ear", "right_ear", "slime"}
              else (.74 if key in {"left_ear", "right_ear"} else .70))
        for key in totals
    }

    while available and len(pieces) < target_pieces:
        groups: dict[str, list[Cell]] = defaultdict(list)
        for cell in available:
            groups[regions[cell]].append(cell)
        priorities = []
        for region, cells in groups.items():
            if not cells:
                continue
            target = region_targets.get(region, .70) * totals[region]
            deficit = max(0.0, target - filled[region])
            priorities.append((-deficit / max(1, totals[region]), -deficit, rng.random(), region))
        priorities.sort()
        desired = priorities[0][3]
        candidates = groups[desired]
        candidates.sort(key=lambda cell: (sum(add(cell, delta) in available for delta in DIRS.values()), rng.random()))
        seed_cell = candidates[0]
        remaining = len(available)
        pieces_left = max(1, target_pieces - len(pieces))
        average = max(3, min(8, round(remaining / pieces_left)))
        target_length = rng.randint(max(3, average - 1), min(8, average + 1))
        path = grow_path(seed_cell, available, regions, target_length, rng)
        if len(path) < 2:
            available.remove(seed_cell)
            continue
        for cell in path:
            available.remove(cell)
        filled.update(regions[cell] for cell in path)
        majority = Counter(regions[cell] for cell in path).most_common(1)[0][0]
        head, behind = path[0], path[1]
        direction = DIRECTION_NAME[(head[0] - behind[0], head[1] - behind[1])]
        pieces.append({
            "id": f"p{len(pieces) + 1:03d}",
            "region": majority,
            "style": STYLE_BY_REGION.get(majority, "fur"),
            "cells": [list(cell) for cell in path],
            "exitDirection": direction,
            "headCell": list(head),
            "tipCell": list(head),
        })

    used = {tuple(cell) for piece in pieces for cell in piece["cells"]}
    used_regions = Counter(regions[cell] for cell in used)
    quality = {
        "maskCells": len(mask),
        "occupiedCells": len(used),
        "coverage": round(len(used) / len(mask), 3),
        "pieceCount": len(pieces),
        "pieceLengthMean": round(sum(len(piece["cells"]) for piece in pieces) / len(pieces), 2),
        "regionCoverage": {
            region: round(used_regions[region] / count, 3)
            for region, count in totals.items() if count >= 4
        },
    }

    data = {
        "schemaVersion": 5,
        "teddy": "tt01",
        "characterName": "Toxic Toby",
        "alternateName": "Radioactive Ricky",
        "level": level,
        "expression": expression,
        "gridSize": size,
        "cellSize": 24,
        "pieceCount": len(pieces),
        "pieces": pieces,
        "solutionOrder": [piece["id"] for piece in pieces],
        "strictSequence": True,
        "allowedFrontier": {1: 4, 2: 3, 3: 2, 4: 2, 5: 1}[level],
        "decorations": [],
        "visualAnchors": [
            "torn circular ears", "button eye", "infected eye", "forehead seam",
            "muzzle and black nose", "cheek patch", "expression mouth", "radioactive slime",
        ],
        "quality": quality,
        "animation": {
            "pauseMs": 90, "baseSlideMs": 420, "msPerCell": 34,
            "minSlideMs": 760, "maxSlideMs": 1420,
            "fadeStart": .78, "mode": "head_first_pull_through",
        },
    }
    audit_level(data)
    return data


def audit_level(data: dict) -> None:
    pieces = data["pieces"]
    size = int(data["gridSize"])
    occupied: dict[Cell, str] = {}
    regions = set()
    for piece in pieces:
        cells = [tuple(cell) for cell in piece["cells"]]
        if not 2 <= len(cells) <= 8:
            raise ValueError(f'{piece["id"]}: length must be 2-8 cells')
        if len(cells) != len(set(cells)):
            raise ValueError(f'{piece["id"]}: repeated cell')
        for index, cell in enumerate(cells):
            if not (0 <= cell[0] < size and 0 <= cell[1] < size):
                raise ValueError(f'{piece["id"]}: outside grid')
            if cell in occupied:
                raise ValueError(f'{piece["id"]}: overlaps {occupied[cell]}')
            occupied[cell] = piece["id"]
            if index and manhattan(cell, cells[index - 1]) != 1:
                raise ValueError(f'{piece["id"]}: non-orthogonal segment')
            for earlier in cells[:max(0, index - 1)]:
                if manhattan(cell, earlier) <= 1:
                    raise ValueError(f'{piece["id"]}: self-touch')
        natural = DIRECTION_NAME[(cells[0][0] - cells[1][0], cells[0][1] - cells[1][1])]
        if natural != piece["exitDirection"]:
            raise ValueError(f'{piece["id"]}: arrowhead does not match endpoint tangent')
        regions.add(piece["region"])

    quality = data["quality"]
    if quality["coverage"] < .90:
        raise ValueError(f'weak silhouette coverage: {quality["coverage"]:.1%}')
    if data["pieceCount"] < CONFIG[data["level"]][1] * .95:
        raise ValueError('insufficient arrow density')
    missing = REQUIRED_REGIONS - regions
    if missing:
        raise ValueError(f'missing playable face regions: {sorted(missing)}')
    weak = {
        region: coverage for region, coverage in quality["regionCoverage"].items()
        if region in REQUIRED_REGIONS and coverage < .85
    }
    if weak:
        raise ValueError(f'weak face-region coverage: {weak}')


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=Path("levels/tt01"))
    parser.add_argument("--verify", type=Path)
    args = parser.parse_args()

    if args.verify:
        audit_level(json.loads(args.verify.read_text(encoding="utf-8")))
        print(f"PASS {args.verify}")
        return

    args.output.mkdir(parents=True, exist_ok=True)
    levels = {str(level): compile_level(level) for level in range(1, 6)}
    for level, data in levels.items():
        (args.output / f"level-{level}.json").write_text(json.dumps(data, indent=2), encoding="utf-8")
        print(f"PASS level {level}: {data['pieceCount']} paths, {data['quality']['coverage']:.1%} coverage")

    packed = gzip.compress(json.dumps(levels, separators=(",", ":")).encode("utf-8"), compresslevel=9)
    (args.output / "dense-levels-v5.txt").write_text(base64.b64encode(packed).decode("ascii"), encoding="ascii")
    manifest = {
        "schemaVersion": 5,
        "teddy": "tt01",
        "levels": [
            {"level": int(level), "expression": data["expression"], "pieceCount": data["pieceCount"], "quality": data["quality"]}
            for level, data in levels.items()
        ],
    }
    (args.output / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
