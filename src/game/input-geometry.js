export function distanceToSegment(point, start, end) {
  const vx = end.x - start.x;
  const vy = end.y - start.y;
  const lengthSquared = vx * vx + vy * vy;
  if (!lengthSquared) return Math.hypot(point.x - start.x, point.y - start.y);
  const ratio = Math.max(0, Math.min(1,
    ((point.x - start.x) * vx + (point.y - start.y) * vy) / lengthSquared,
  ));
  const x = start.x + ratio * vx;
  const y = start.y + ratio * vy;
  return Math.hypot(point.x - x, point.y - y);
}

export function distanceToPolyline(point, points) {
  if (!Array.isArray(points) || points.length < 2) return Infinity;
  let distance = Infinity;
  for (let index = 1; index < points.length; index += 1) {
    distance = Math.min(distance, distanceToSegment(point, points[index - 1], points[index]));
  }
  return distance;
}

export function chooseNearestPolyline(point, candidates, tolerance) {
  let best = null;
  let bestDistance = Infinity;
  for (const candidate of candidates) {
    const distance = distanceToPolyline(point, candidate.points);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = candidate.value;
    }
  }
  return bestDistance <= tolerance ? {value: best, distance: bestDistance} : null;
}
