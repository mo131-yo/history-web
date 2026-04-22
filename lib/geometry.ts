export function normalizeClosedRing(points: Array<[number, number]>) {
  const ring = points.map(([lng, lat]) => [Number(lng.toFixed(5)), Number(lat.toFixed(5))] as [number, number]);

  if (ring.length < 3) {
    return ring;
  }

  const [firstLng, firstLat] = ring[0];
  const [lastLng, lastLat] = ring[ring.length - 1];

  if (firstLng !== lastLng || firstLat !== lastLat) {
    ring.push([firstLng, firstLat]);
  }

  return ring;
}

export function ensureEditableRing(points: Array<[number, number]>) {
  const ring = normalizeClosedRing(points);
  return ring.length >= 4 ? ring : [];
}

export function appendPointToDraftRing(
  ring: Array<[number, number]>,
  candidate: [number, number],
) {
  const cleaned = ring.length > 1 && isSamePoint(ring[0], ring[ring.length - 1]) ? ring.slice(0, -1) : [...ring];
  cleaned.push(candidate);

  if (cleaned.length >= 3) {
    return normalizeClosedRing(cleaned);
  }

  return cleaned;
}

export function insertPointIntoNearestSegment(
  ring: Array<[number, number]>,
  candidate: [number, number],
) {
  if (ring.length < 4) {
    return normalizeClosedRing([...ring, candidate]);
  }

  let nearestIndex = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (let index = 0; index < ring.length - 1; index += 1) {
    const [ax, ay] = ring[index];
    const [bx, by] = ring[index + 1];
    const distance = pointToSegmentDistance(candidate, [ax, ay], [bx, by]);

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  }

  const next = [...ring];
  next.splice(nearestIndex + 1, 0, candidate);

  return normalizeClosedRing(next.slice(0, -1));
}

function pointToSegmentDistance(
  point: [number, number],
  start: [number, number],
  end: [number, number],
) {
  const [px, py] = point;
  const [x1, y1] = start;
  const [x2, y2] = end;
  const dx = x2 - x1;
  const dy = y2 - y1;

  if (dx === 0 && dy === 0) {
    return Math.hypot(px - x1, py - y1);
  }

  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
  const projectionX = x1 + t * dx;
  const projectionY = y1 + t * dy;

  return Math.hypot(px - projectionX, py - projectionY);
}

function isSamePoint(a: [number, number], b: [number, number]) {
  return a[0] === b[0] && a[1] === b[1];
}
