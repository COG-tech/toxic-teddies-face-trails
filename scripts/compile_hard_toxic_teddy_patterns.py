#!/usr/bin/env python3
"""Hard-mode compiler and verifier for Toxic Teddies arrow puzzles.

Wraps compile_toxic_teddy_patterns.py and adds difficulty tests derived from the
Arrow Escape 1.0.6 design: path[0] is the attached head, layouts are generated
in reverse, every level is solved again, and sparse/easy boards are rejected.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

HERE = Path(__file__).resolve().parent
BASE_COMPILER = HERE / "compile_toxic_teddy_patterns.py"
DIRS = {"up": (-1, 0), "right": (0, 1), "down": (1, 0), "left": (0, -1)}


@dataclass(frozen=True)
class Profile:
    minimum_pieces: int
    maximum_initial_open: int
    minimum_blocked_ratio: float
    minimum_mask_fill: float
    minimum_turn_ratio: float
    minimum_regions: int
    minimum_mean_length: float


PROFILES = {
    1: Profile(40, 7, 0.80, 0.28, 0.10, 6, 4.0),
    2: Profile(48, 6, 0.84, 0.32, 0.12, 7, 3.8),
    3: Profile(56, 5, 0.87, 0.36, 0.14, 8, 3.6),
    4: Profile(64, 4, 0.90, 0.40, 0.16, 8, 3.4),
    5: Profile(72, 4, 0.92, 0.44, 0.18, 8, 3.2),
}


def load_base_module():
    if not BASE_COMPILER.exists():
        raise FileNotFoundError(BASE_COMPILER)
    spec = importlib.util.spec_from_file_location("toxic_base_compiler", BASE_COMPILER)
    if spec is None or spec.loader is None:
        raise RuntimeError("could not load base compiler")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def endpoint_is_attached(piece: dict[str, Any]) -> bool:
    cells = piece["cells"]
    if len(cells) < 2:
        return False
    head = tuple(cells[0])
    second = tuple(cells[1])
    return DIRS.get(piece["exitDirection"]) == (head[0] - second[0], head[1] - second[1])


def turn_ratio(pieces: list[dict[str, Any]]) -> float:
    turns = 0
    segments = 0
    for piece in pieces:
        cells = [tuple(cell) for cell in piece["cells"]]
        segments += max(0, len(cells) - 1)
        for index in range(2, len(cells)):
            first = (cells[index - 1][0] - cells[index - 2][0], cells[index - 1][1] - cells[index - 2][1])
            second = (cells[index][0] - cells[index - 1][0], cells[index][1] - cells[index - 1][1])
            if first != second:
                turns += 1
    return turns / segments if segments else 0.0


def lane_clear(piece: dict[str, Any], active: set[str], occupancy: dict[tuple[int, int], str], size: int) -> bool:
    row, col = piece["cells"][0]
    dr, dc = DIRS[piece["exitDirection"]]
    row += dr
    col += dc
    while 0 <= row < size and 0 <= col < size:
        owner = occupancy.get((row, col))
        if owner and owner != piece["id"] and owner in active:
            return False
        row += dr
        col += dc
    return True


def simulate_choice_counts(data: dict[str, Any]) -> list[int]:
    pieces = data["pieces"]
    by_id = {piece["id"]: piece for piece in pieces}
    active = set(by_id)
    occupancy = {tuple(cell): piece["id"] for piece in pieces for cell in piece["cells"]}
    counts: list[int] = []
    for expected in data["solutionOrder"]:
        open_ids = [piece_id for piece_id in active if lane_clear(by_id[piece_id], active, occupancy, int(data["gridSize"]))]
        counts.append(len(open_ids))
        if expected not in open_ids:
            raise ValueError(f"stored solution invalid at {expected}; open={open_ids}")
        active.remove(expected)
    return counts


def bounding_fill(pieces: list[dict[str, Any]]) -> float:
    cells = [tuple(cell) for piece in pieces for cell in piece["cells"]]
    if not cells:
        return 0.0
    rows = [cell[0] for cell in cells]
    cols = [cell[1] for cell in cells]
    area = (max(rows) - min(rows) + 1) * (max(cols) - min(cols) + 1)
    return len(set(cells)) / max(area, 1)


def difficulty_report(data: dict[str, Any]) -> dict[str, Any]:
    level = max(1, min(5, int(data.get("level", 1))))
    profile = PROFILES[level]
    pieces = data["pieces"]
    lengths = [len(piece["cells"]) for piece in pieces]
    counts = simulate_choice_counts(data)
    initial_open = counts[0] if counts else 0
    initial_blocked_ratio = 1.0 - initial_open / max(len(pieces), 1)
    mean_blocked_ratio = sum(
        1.0 - count / remaining
        for count, remaining in zip(counts, range(len(pieces), 0, -1))
    ) / max(len(counts), 1)
    tight_states = sum(count <= 3 for count in counts)
    occupied = {tuple(cell) for piece in pieces for cell in piece["cells"]}
    base = load_base_module()
    mask_size = len(base.toxic_toby_mask(int(data["gridSize"]))) if data.get("teddy") == "tt01" else len(occupied)
    regions = {piece.get("region", "head") for piece in pieces}
    attached = sum(endpoint_is_attached(piece) for piece in pieces)
    report = {
        "mode": "hard",
        "profileLevel": level,
        "pieceCount": len(pieces),
        "initialOpenMoves": initial_open,
        "initialBlockedRatio": round(initial_blocked_ratio, 4),
        "meanBlockedRatio": round(mean_blocked_ratio, 4),
        "tightDecisionStates": tight_states,
        "tightDecisionRatio": round(tight_states / max(len(counts), 1), 4),
        "maskFillRatio": round(len(occupied) / max(mask_size, 1), 4),
        "boundingFillRatio": round(bounding_fill(pieces), 4),
        "turnRatio": round(turn_ratio(pieces), 4),
        "meanLength": round(sum(lengths) / max(len(lengths), 1), 3),
        "regionCount": len(regions),
        "attachedArrowheads": attached,
        "warnings": [],
    }
    warnings = report["warnings"]
    if len(pieces) < profile.minimum_pieces:
        warnings.append(f"needs at least {profile.minimum_pieces} pieces")
    if initial_open > profile.maximum_initial_open:
        warnings.append(f"too many immediate exits: {initial_open}>{profile.maximum_initial_open}")
    if initial_blocked_ratio < profile.minimum_blocked_ratio:
        warnings.append("not enough blocked choices at start")
    if report["maskFillRatio"] < profile.minimum_mask_fill:
        warnings.append("Teddy silhouette is too sparse")
    if report["turnRatio"] < profile.minimum_turn_ratio:
        warnings.append("paths are too straight/stripe-heavy")
    if report["regionCount"] < profile.minimum_regions:
        warnings.append("not enough facial regions are represented")
    if report["meanLength"] < profile.minimum_mean_length:
        warnings.append("too many tiny fragments")
    if attached != len(pieces):
        warnings.append(f"{len(pieces)-attached} arrowheads are detached or point away from their body")
    report["score"] = max(0, min(100, 100 - len(warnings) * 14))
    return report


def compile_hard(source: Path, output: Path, strict: bool) -> dict[str, Any]:
    base = load_base_module()
    data = base.compile_file(source, output, strict_quality=False)
    data["animation"] = {
        "pauseMs": 90,
        "baseSlideMs": 410,
        "msPerCell": 34,
        "minSlideMs": 720,
        "maxSlideMs": 1250,
        "fadeStart": 0.76,
        "mode": "head_first_pull_through",
    }
    data["difficulty"] = difficulty_report(data)
    if strict and data["difficulty"]["warnings"]:
        raise ValueError("; ".join(data["difficulty"]["warnings"]))
    output.write_text(json.dumps(data, indent=2), encoding="utf-8")
    return data


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, default=Path("levels/tt01"))
    parser.add_argument("--output", type=Path, default=Path("levels/tt01"))
    parser.add_argument("--strict", action="store_true")
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    manifest = {"schemaVersion": 3, "mode": "hard", "levels": []}
    for source in sorted(args.source.glob("level-*.json")):
        output = args.output / source.name
        data = compile_hard(source, output, args.strict)
        manifest["levels"].append({
            "level": data["level"],
            "pieceCount": data["pieceCount"],
            "difficulty": data["difficulty"],
            "file": output.as_posix(),
        })
        print(f"{output}: score={data['difficulty']['score']} warnings={len(data['difficulty']['warnings'])}")
    (args.output / "hard-manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
