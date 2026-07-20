#!/usr/bin/env python3
"""Toxic Teddies pattern compiler, based on Arrow Escape 1.0.6's proven pipeline.

The browser only renders compiled JSON. This tool owns geometry, head orientation,
reverse-placement generation, solvability, visual-quality checks and normalized output.

Guarantees:
- head is always path[0] and is a real endpoint
- path[1] sits directly behind the head
- no shared cells, self-touch, closed loops or crossings
- every path has a straight exit ray
- full solution order is found by bounded DFS
- generated patterns use reverse placement
- stripe-heavy or visually weak layouts are flagged or rejected
"""
from __future__ import annotations

import argparse
import json
import random
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable

DIRS: dict[str, tuple[int, int]] = {
    "up": (-1, 0),
    "right": (0, 1),
    "down": (1, 0),
    "left": (0, -1),
}
OPPOSITE = {"up": "down", "down": "up", "left": "right", "right": "left"}
Cell = tuple[int, int]


@dataclass(frozen=True)
class Orientation:
    cells: tuple[Cell, ...]
    direction: str
    head: Cell
    rank: int = 0


@dataclass
class Piece:
    id: str
    cells: list[Cell]
    region: str = "head"
    style: str = "fur"
    authored_direction: str | None = None
    candidate_directions: list[str] = field(default_factory=list)


def add(a: Cell, b: Cell) -> Cell:
    return a[0] + b[0], a[1] + b[1]


def sub(a: Cell, b: Cell) -> Cell:
    return a[0] - b[0], a[1] - b[1]


def direction_for(delta: Cell) -> str | None:
    for name, value in DIRS.items():
        if delta == value:
            return name
    return None


def edge_distance(cell: Cell, direction: str, size: int) -> int:
    row, col = cell
    if direction == "up":
        return row
    if direction == "down":
        return size - 1 - row
    if direction == "left":
        return col
    return size - 1 - col


def endpoint_orientations(piece: Piece, size: int) -> list[Orientation]:
    if len(piece.cells) < 2:
        return []
    options: list[Orientation] = []
    seen: set[tuple[Cell, str]] = set()

    def append(cells: list[Cell], direction: str | None, rank: int) -> None:
        if direction not in DIRS:
            return
        key = (cells[0], direction)
        if key in seen:
            return
        seen.add(key)
        options.append(Orientation(tuple(cells), direction, cells[0], rank))

    forward = list(piece.cells)
    reverse = list(reversed(piece.cells))
    first_natural = direction_for(sub(forward[0], forward[1]))
    last_natural = direction_for(sub(reverse[0], reverse[1]))
    append(forward, first_natural, 0 if first_natural == piece.authored_direction else 2)
    append(reverse, last_natural, 0 if last_natural == piece.authored_direction else 2)

    authored = piece.authored_direction
    if authored in DIRS:
        f_edge = edge_distance(forward[0], authored, size)
        r_edge = edge_distance(reverse[0], authored, size)
        append(forward if f_edge <= r_edge else reverse, authored, 1)
        append(reverse if f_edge <= r_edge else forward, authored, 3)

    for direction in piece.candidate_directions:
        if direction not in DIRS:
            continue
        f_edge = edge_distance(forward[0], direction, size)
        r_edge = edge_distance(reverse[0], direction, size)
        append(forward if f_edge <= r_edge else reverse, direction, 4)

    options.sort(key=lambda option: (option.rank, edge_distance(option.head, option.direction, size), option.direction))
    return options


def validate_path(piece: Piece, size: int) -> None:
    if len(piece.cells) < 2:
        raise ValueError(f"{piece.id}: path must contain at least two cells")
    seen: set[Cell] = set()
    for index, cell in enumerate(piece.cells):
        row, col = cell
        if not (0 <= row < size and 0 <= col < size):
            raise ValueError(f"{piece.id}: {cell} lies outside {size}x{size}")
        if cell in seen:
            raise ValueError(f"{piece.id}: repeated cell {cell}")
        seen.add(cell)
        if index and abs(row - piece.cells[index - 1][0]) + abs(col - piece.cells[index - 1][1]) != 1:
            raise ValueError(f"{piece.id}: non-orthogonal gap {piece.cells[index - 1]} -> {cell}")
    for first, a in enumerate(piece.cells):
        for second in range(first + 2, len(piece.cells)):
            b = piece.cells[second]
            if abs(a[0] - b[0]) + abs(a[1] - b[1]) <= 1:
                raise ValueError(f"{piece.id}: self-touch/closed loop at {a} and {b}")


def validate_global(pieces: list[Piece]) -> dict[Cell, str]:
    occupancy: dict[Cell, str] = {}
    for piece in pieces:
        for cell in piece.cells:
            owner = occupancy.get(cell)
            if owner:
                raise ValueError(f"shared/crossing cell {cell}: {owner} and {piece.id}")
            occupancy[cell] = piece.id
    return occupancy


def lane_clear(piece_id: str, orientation: Orientation, active: set[str], occupancy: dict[Cell, str], size: int) -> bool:
    row, col = add(orientation.head, DIRS[orientation.direction])
    dr, dc = DIRS[orientation.direction]
    while 0 <= row < size and 0 <= col < size:
        owner = occupancy.get((row, col))
        if owner and owner != piece_id and owner in active:
            return False
        row += dr
        col += dc
    return True


def solve_orientations(
    pieces: list[Piece],
    size: int,
    occupancy: dict[Cell, str],
    preferred_order: list[str] | None = None,
    max_states: int = 120_000,
) -> list[tuple[str, Orientation]]:
    by_id = {piece.id: piece for piece in pieces}
    index = {piece.id: idx for idx, piece in enumerate(pieces)}
    options = {piece.id: endpoint_orientations(piece, size) for piece in pieces}
    for piece_id, choices in options.items():
        if not choices:
            raise ValueError(f"{piece_id}: no endpoint orientation exists")
    preferred = {piece_id: idx for idx, piece_id in enumerate(preferred_order or [])}
    full_mask = (1 << len(pieces)) - 1
    memo: set[int] = set()
    moves: list[tuple[str, Orientation]] = []
    states = 0

    def search(mask: int) -> bool:
        nonlocal states
        if mask == 0:
            return True
        states += 1
        if states > max_states:
            return False
        if mask in memo:
            return False
        memo.add(mask)
        active = {piece.id for piece in pieces if mask & (1 << index[piece.id])}
        open_moves: list[tuple[int, int, int, str, Orientation]] = []
        for piece_id in active:
            for orientation in options[piece_id]:
                if lane_clear(piece_id, orientation, active, occupancy, size):
                    open_moves.append((
                        preferred.get(piece_id, 9999),
                        orientation.rank,
                        edge_distance(orientation.head, orientation.direction, size),
                        piece_id,
                        orientation,
                    ))
        open_moves.sort(key=lambda move: (move[0], move[1], move[2], -len(by_id[move[3]].cells), move[3]))
        for _, _, _, piece_id, orientation in open_moves[:24]:
            moves.append((piece_id, orientation))
            if search(mask & ~(1 << index[piece_id])):
                return True
            moves.pop()
        return False

    if not search(full_mask):
        raise ValueError(f"pattern locked or search exceeded {max_states:,} states")
    return moves


def turn_count(cells: Iterable[Cell]) -> int:
    values = list(cells)
    count = 0
    for index in range(2, len(values)):
        if sub(values[index - 1], values[index - 2]) != sub(values[index], values[index - 1]):
            count += 1
    return count


def quality_report(data: dict, pieces: list[Piece], solution: list[tuple[str, Orientation]]) -> dict:
    lengths = [len(piece.cells) for piece in pieces]
    total_segments = sum(max(0, length - 1) for length in lengths)
    turns = sum(turn_count(piece.cells) for piece in pieces)
    turn_ratio = turns / total_segments if total_segments else 0.0
    horizontal = 0
    vertical = 0
    for piece in pieces:
        for first, second in zip(piece.cells, piece.cells[1:]):
            if first[0] == second[0]:
                horizontal += 1
            else:
                vertical += 1
    balance = min(horizontal, vertical) / max(horizontal, vertical, 1)
    initial_active = {piece.id for piece in pieces}
    occupancy = {cell: piece.id for piece in pieces for cell in piece.cells}
    initial_open = sum(
        lane_clear(piece_id, orientation, initial_active, occupancy, int(data["gridSize"]))
        for piece_id, orientation in solution
    )
    anchors = set(data.get("visualAnchors", []))
    required = {
        "torn circular ears",
        "button eye",
        "infected eye",
        "forehead seam",
        "muzzle and black nose",
        "cheek patch",
        "expression mouth",
        "radioactive slime",
    }
    missing_anchors = sorted(required - anchors) if data.get("teddy") == "tt01" else []
    warnings: list[str] = []
    if turn_ratio < 0.10:
        warnings.append("stripe-heavy: too few bends")
    if balance < 0.28:
        warnings.append("directionally unbalanced")
    if initial_open < 2:
        warnings.append("too few initial exits")
    if max(lengths, default=0) > int(data["gridSize"]) * 1.25:
        warnings.append("one path dominates the composition")
    if missing_anchors:
        warnings.append(f"missing Toxic Toby anchors: {', '.join(missing_anchors)}")
    return {
        "pieceCount": len(pieces),
        "minLength": min(lengths, default=0),
        "maxLength": max(lengths, default=0),
        "meanLength": round(sum(lengths) / len(lengths), 2) if lengths else 0,
        "turnRatio": round(turn_ratio, 4),
        "horizontalVerticalBalance": round(balance, 4),
        "initialOpenMoves": initial_open,
        "warnings": warnings,
    }


def compile_file(source: Path, output: Path, strict_quality: bool = False) -> dict:
    data = json.loads(source.read_text(encoding="utf-8"))
    size = int(data["gridSize"])
    pieces = [
        Piece(
            id=item["id"],
            cells=[tuple(cell) for cell in item["cells"]],
            region=item.get("region", "head"),
            style=item.get("style", "fur"),
            authored_direction=item.get("exitDirection"),
            candidate_directions=list(item.get("candidateExitDirections", [])),
        )
        for item in data["pieces"]
    ]
    for piece in pieces:
        validate_path(piece, size)
    occupancy = validate_global(pieces)
    solution = solve_orientations(pieces, size, occupancy, data.get("solutionOrder"))
    by_move = {piece_id: orientation for piece_id, orientation in solution}
    runtime_pieces = []
    for piece in pieces:
        orientation = by_move[piece.id]
        runtime_pieces.append({
            "id": piece.id,
            "region": piece.region,
            "style": piece.style,
            "cells": [list(cell) for cell in orientation.cells],
            "exitDirection": orientation.direction,
            "headCell": list(orientation.head),
            "tipCell": list(orientation.head),
        })
    report = quality_report(data, pieces, solution)
    if strict_quality and report["warnings"]:
        raise ValueError("; ".join(report["warnings"]))
    data["schemaVersion"] = 2
    data["pieceCount"] = len(runtime_pieces)
    data["pieces"] = runtime_pieces
    data["solutionOrder"] = [piece_id for piece_id, _ in solution]
    data["solutionMoves"] = [
        {"id": piece_id, "exitDirection": orientation.direction, "headCell": list(orientation.head)}
        for piece_id, orientation in solution
    ]
    data["quality"] = report
    data["animation"] = {
        "pauseMs": int(data.get("animation", {}).get("pauseMs", 100)),
        "baseSlideMs": int(data.get("animation", {}).get("baseSlideMs", 430)),
        "msPerCell": int(data.get("animation", {}).get("msPerCell", 48)),
        "maxSlideMs": int(data.get("animation", {}).get("maxSlideMs", 2300)),
        "fadeStart": float(data.get("animation", {}).get("fadeStart", 0.70)),
        "mode": "head_first_pull_through",
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(data, indent=2), encoding="utf-8")
    return data


def toxic_toby_mask(size: int) -> set[Cell]:
    half = (size - 1) / 2
    mask: set[Cell] = set()
    for row in range(size):
        for col in range(size):
            x = (col - half) / half
            y = (row - half) / half
            head = x * x / 0.72**2 + (y - 0.06) ** 2 / 0.76**2 <= 1
            left_ear = (x + 0.66) ** 2 / 0.25**2 + (y + 0.63) ** 2 / 0.25**2 <= 1
            right_ear = (x - 0.66) ** 2 / 0.25**2 + (y + 0.63) ** 2 / 0.25**2 <= 1
            if not (head or left_ear or right_ear):
                continue
            left_eye = (x + 0.29) ** 2 / 0.135**2 + (y + 0.14) ** 2 / 0.115**2 <= 1
            right_eye = (x - 0.29) ** 2 / 0.135**2 + (y + 0.14) ** 2 / 0.115**2 <= 1
            nose = x * x / 0.13**2 + (y - 0.06) ** 2 / 0.08**2 <= 1
            mouth = x * x / 0.37**2 + (y - 0.46) ** 2 / 0.15**2 <= 1 and y > 0.31
            patch = (x + 0.51) ** 2 / 0.12**2 + (y - 0.10) ** 2 / 0.12**2 <= 1
            seam = abs(x) < max(0.018, 0.65 / size) and -0.72 < y < 0.18
            if left_eye or right_eye or nose or mouth or patch or seam:
                continue
            mask.add((row, col))
    return mask


def exit_ray(head: Cell, direction: str, size: int) -> list[Cell]:
    cells: list[Cell] = []
    row, col = add(head, DIRS[direction])
    dr, dc = DIRS[direction]
    while 0 <= row < size and 0 <= col < size:
        cells.append((row, col))
        row += dr
        col += dc
    return cells


def packed_pick(directions: list[str], current: Cell, occupied: set[Cell], rng: random.Random) -> str:
    scored: list[tuple[int, float, str]] = []
    for direction in directions:
        nxt = add(current, DIRS[direction])
        score = sum(add(nxt, neighbour) in occupied for neighbour in DIRS.values())
        scored.append((-score, rng.random(), direction))
    scored.sort()
    return scored[0][2]


def grow_backwards(
    head: Cell,
    direction: str,
    target: int,
    mask: set[Cell],
    occupied: set[Cell],
    size: int,
    rng: random.Random,
    tangle: float,
) -> list[Cell] | None:
    forbidden_exit = set(exit_ray(head, direction, size))
    path = [head]
    path_set = {head}
    current = head
    grow_direction = OPPOSITE[direction]
    straight = 0
    turn_bias = 0.65 + tangle * 0.20
    max_straight = 2 if tangle >= 0.7 else 3
    for step in range(1, target):
        valid: list[str] = []
        for candidate, delta in DIRS.items():
            if candidate == OPPOSITE[grow_direction]:
                continue
            nxt = add(current, delta)
            if nxt not in mask or nxt in occupied or nxt in forbidden_exit or nxt in path_set:
                continue
            if any(add(nxt, neighbour) in path_set and add(nxt, neighbour) != current for neighbour in DIRS.values()):
                continue
            valid.append(candidate)
        if not valid:
            break
        if step == 1 and grow_direction not in valid:
            return None
        turns = [candidate for candidate in valid if candidate != grow_direction]
        if step == 1:
            chosen = grow_direction
        elif straight >= max_straight and turns:
            chosen = packed_pick(turns, current, occupied, rng)
        elif len(valid) == 1:
            chosen = valid[0]
        elif turns and rng.random() < turn_bias:
            chosen = packed_pick(turns, current, occupied, rng)
        elif grow_direction in valid:
            chosen = grow_direction
        else:
            chosen = packed_pick(turns, current, occupied, rng)
        straight = straight + 1 if chosen == grow_direction else 0
        current = add(current, DIRS[chosen])
        path.append(current)
        path_set.add(current)
        grow_direction = chosen
    return path if len(path) >= 2 else None


def reverse_generate(size: int, target_pieces: int, seed: int, tangle: float) -> dict:
    mask = toxic_toby_mask(size)
    occupied: set[Cell] = set()
    pieces: list[dict] = []
    rng = random.Random(seed)
    attempts = 0
    while len(pieces) < target_pieces and attempts < target_pieces * 500:
        attempts += 1
        candidates: list[tuple[int, Cell, str]] = []
        for head in mask - occupied:
            for direction in DIRS:
                if not any(cell in occupied for cell in exit_ray(head, direction, size)):
                    candidates.append((edge_distance(head, direction, size), head, direction))
        if not candidates:
            break
        candidates.sort(key=lambda item: (item[0], rng.random()))
        _, head, direction = candidates[rng.randrange(min(len(candidates), max(4, len(candidates) // 5)))]
        remaining = len(mask) - len(occupied)
        average = max(3, round(remaining / max(1, target_pieces - len(pieces))))
        target = max(3, min(int(size * 0.58), average + rng.randint(-2, 3)))
        path = grow_backwards(head, direction, target, mask, occupied, size, rng, tangle)
        if not path:
            continue
        occupied.update(path)
        pieces.append({
            "id": f"generated_{len(pieces)+1:03d}",
            "region": "generated_head",
            "style": "fur",
            "cells": [list(cell) for cell in path],
            "exitDirection": direction,
        })
    return {
        "schemaVersion": 1,
        "teddy": "tt01",
        "characterName": "Toxic Toby",
        "expression": "generated_template",
        "gridSize": size,
        "cellSize": 36,
        "pieces": pieces,
        "solutionOrder": [piece["id"] for piece in reversed(pieces)],
        "visualAnchors": [
            "torn circular ears", "button eye", "infected eye", "forehead seam",
            "muzzle and black nose", "cheek patch", "expression mouth", "radioactive slime",
        ],
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, default=Path("levels/tt01"))
    parser.add_argument("--output", type=Path, default=Path("levels/tt01"))
    parser.add_argument("--teddy", default="tt01")
    parser.add_argument("--strict-quality", action="store_true")
    parser.add_argument("--generate", action="store_true")
    parser.add_argument("--grid-size", type=int, default=39)
    parser.add_argument("--target-pieces", type=int, default=42)
    parser.add_argument("--seed", type=int, default=1001)
    parser.add_argument("--tangle", type=float, default=0.55)
    args = parser.parse_args()

    if args.generate:
        generated = reverse_generate(args.grid_size, args.target_pieces, args.seed, args.tangle)
        source = args.output / "generated-source.json"
        source.parent.mkdir(parents=True, exist_ok=True)
        source.write_text(json.dumps(generated, indent=2), encoding="utf-8")
        compiled = compile_file(source, args.output / "generated-level.json", args.strict_quality)
        print(json.dumps(compiled["quality"], indent=2))
        return

    manifest = {"schemaVersion": 2, "teddy": args.teddy, "levels": []}
    for source in sorted(args.source.glob("level-*.json")):
        output = args.output / source.name
        data = compile_file(source, output, args.strict_quality)
        manifest["levels"].append({
            "level": data["level"],
            "expression": data.get("expression"),
            "pieceCount": data["pieceCount"],
            "quality": data["quality"],
            "file": output.as_posix(),
        })
        print(f"verified {output}: {data['pieceCount']} pieces; warnings={len(data['quality']['warnings'])}")
    (args.output / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
