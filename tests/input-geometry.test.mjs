import assert from 'node:assert/strict';
import test from 'node:test';
import {
  chooseNearestPolyline,
  distanceToPolyline,
  distanceToSegment,
} from '../src/game/input-geometry.js';

test('distanceToSegment measures perpendicular distance', () => {
  assert.equal(distanceToSegment({x: 5, y: 3}, {x: 0, y: 0}, {x: 10, y: 0}), 3);
});

test('distanceToSegment clamps before and after a segment', () => {
  assert.equal(distanceToSegment({x: -3, y: 4}, {x: 0, y: 0}, {x: 10, y: 0}), 5);
  assert.equal(distanceToSegment({x: 13, y: 4}, {x: 0, y: 0}, {x: 10, y: 0}), 5);
});

test('distanceToPolyline uses the closest segment', () => {
  const points = [{x: 0, y: 0}, {x: 10, y: 0}, {x: 10, y: 10}];
  assert.equal(distanceToPolyline({x: 12, y: 7}, points), 2);
});

test('chooseNearestPolyline selects the intended close path', () => {
  const result = chooseNearestPolyline(
    {x: 5, y: 4},
    [
      {value: 'upper', points: [{x: 0, y: 0}, {x: 10, y: 0}]},
      {value: 'lower', points: [{x: 0, y: 10}, {x: 10, y: 10}]},
    ],
    8,
  );
  assert.equal(result.value, 'upper');
  assert.equal(result.distance, 4);
});

test('chooseNearestPolyline rejects paths outside tolerance', () => {
  const result = chooseNearestPolyline(
    {x: 100, y: 100},
    [{value: 'path', points: [{x: 0, y: 0}, {x: 10, y: 0}]}],
    32,
  );
  assert.equal(result, null);
});
