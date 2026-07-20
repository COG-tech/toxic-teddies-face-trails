#!/usr/bin/env python3
"""Validate and compile Toxic Teddies arrow-pattern JSON.

The web app never generates puzzle geometry. Artists/authors edit level JSON cells,
regions, decorations, and candidate exit directions. This compiler verifies that
paths do not overlap or self-intersect, discovers a complete removal order, and
writes normalized runtime JSON plus a manifest.
"""
from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from pathlib import Path

DIRS = {"up": (-1, 0), "right": (0, 1), "down": (1, 0), "left": (0, -1)}

@dataclass
class Piece:
    id: str
    cells: list[tuple[int, int]]
    directions: list[str]
    region: str = "head"
    style: str = "fur"


def extreme(cells: list[tuple[int, int]], direction: str) -> tuple[int, int]:
    if direction == "up":
        return min(cells, key=lambda c: (c[0], c[1]))
    if direction == "down":
        return max(cells, key=lambda c: (c[0], -c[1]))
    if direction == "left":
        return min(cells, key=lambda c: (c[1], c[0]))
    return max(cells, key=lambda c: (c[1], -c[0]))


def validate_piece(piece: Piece, size: int) -> None:
    if len(piece.cells) < 2:
        raise ValueError(f"{piece.id}: path must contain at least two cells")
    seen: set[tuple[int, int]] = set()
    for index, cell in enumerate(piece.cells):
        row, col = cell
        if not (0 <= row < size and 0 <= col < size):
            raise ValueError(f"{piece.id}: cell {cell} is outside {size}x{size}")
        if cell in seen:
            raise ValueError(f"{piece.id}: repeated cell {cell}")
        seen.add(cell)
        if index:
            previous = piece.cells[index - 1]
            if abs(previous[0] - row) + abs(previous[1] - col) != 1:
                raise ValueError(f"{piece.id}: non-orthogonal gap {previous}->{cell}")
    for first, a in enumerate(piece.cells):
        for second in range(first + 2, len(piece.cells)):
            b = piece.cells[second]
            if abs(a[0] - b[0]) + abs(a[1] - b[1]) <= 1:
                raise ValueError(f"{piece.id}: self-touch at {a}/{b}")


def validate_no_shared_cells(pieces: list[Piece]) -> None:
    occupied: dict[tuple[int, int], str] = {}
    for piece in pieces:
        for cell in piece.cells:
            owner = occupied.get(cell)
            if owner:
                raise ValueError(f"shared cell {cell}: {owner} and {piece.id}")
            occupied[cell] = piece.id


def lane_clear(piece: Piece, direction: str, active: set[str], by_id: dict[str, Piece], size: int) -> bool:
    occupied: dict[tuple[int, int], str] = {}
    for piece_id in active:
        for cell in by_id[piece_id].cells:
            occupied[cell] = piece_id
    row, col = extreme(piece.cells, direction)
    dr, dc = DIRS[direction]
    row += dr
    col += dc
    while 0 <= row < size and 0 <= col < size:
        blocker = occupied.get((row, col))
        if blocker and blocker != piece.id:
            return False
        row += dr
        col += dc
    return True


def solve(pieces: list[Piece], size: int) -> list[tuple[str, str]]:
    by_id = {piece.id: piece for piece in pieces}
    active = set(by_id)
    order: list[tuple[str, str]] = []
    memo: set[tuple[str, ...]] = set()

    def search() -> bool:
        if not active:
            return True
        state = tuple(sorted(active))
        if state in memo:
            return False
        memo.add(state)
        candidates: list[tuple[int, str, str]] = []
        for piece_id in sorted(active):
            piece = by_id[piece_id]
            for direction in piece.directions:
                if lane_clear(piece, direction, active, by_id, size):
                    tip = extreme(piece.cells, direction)
                    distance = tip[0] if direction == "up" else size - 1 - tip[0] if direction == "down" else tip[1] if direction == "left" else size - 1 - tip[1]
                    candidates.append((distance, piece_id, direction))
        candidates.sort()
        for _, piece_id, direction in candidates:
            active.remove(piece_id)
            order.append((piece_id, direction))
            if search():
                return True
            order.pop()
            active.add(piece_id)
        return False

    if not search():
        raise ValueError("pattern is permanently locked; no complete solution exists")
    return order


def compile_file(source: Path, output: Path) -> dict:
    data = json.loads(source.read_text(encoding="utf-8"))
    size = int(data["gridSize"])
    pieces = [
        Piece(
            id=item["id"],
            cells=[tuple(cell) for cell in item["cells"]],
            directions=list(item.get("candidateExitDirections") or ([item["exitDirection"]] if item.get("exitDirection") else DIRS)),
            region=item.get("region", "head"),
            style=item.get("style", "fur"),
        )
        for item in data["pieces"]
    ]
    for piece in pieces:
        validate_piece(piece, size)
    validate_no_shared_cells(pieces)
    solution = solve(pieces, size)
    direction_by_id = dict(solution)
    runtime_pieces = []
    for piece in pieces:
        direction = direction_by_id[piece.id]
        runtime_pieces.append({
            "id": piece.id,
            "region": piece.region,
            "style": piece.style,
            "cells": [list(cell) for cell in piece.cells],
            "exitDirection": direction,
            "tipCell": list(extreme(piece.cells, direction)),
        })
    data["schemaVersion"] = 1
    data["pieceCount"] = len(runtime_pieces)
    data["pieces"] = runtime_pieces
    data["solutionOrder"] = [piece_id for piece_id, _ in solution]
    data["solutionMoves"] = [{"id": piece_id, "exitDirection": direction} for piece_id, direction in solution]
    data.setdefault("animation", {"pauseMs": 100, "slideMs": 780, "fadeStart": 0.68})
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(data, indent=2), encoding="utf-8")
    return data


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, default=Path("levels/tt01"))
    parser.add_argument("--output", type=Path, default=Path("levels/tt01"))
    parser.add_argument("--teddy", default="tt01")
    args = parser.parse_args()
    manifest = {"schemaVersion": 1, "teddy": args.teddy, "levels": []}
    for source in sorted(args.source.glob("level-*.json")):
        output = args.output / source.name
        data = compile_file(source, output)
        manifest["levels"].append({
            "level": data["level"],
            "expression": data.get("expression"),
            "pieceCount": data["pieceCount"],
            "file": output.as_posix(),
        })
        print(f"verified {output}: {data['pieceCount']} pieces")
    (args.output / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
