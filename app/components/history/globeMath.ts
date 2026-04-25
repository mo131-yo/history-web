import type { GlobeLabel, GlobePoint, GlobePolygon } from "./globeTypes";

export function hexToRgba(hex: string, alpha: number): string {
  let value = hex.replace("#", "");
  if (value.length === 3) value = value[0] + value[0] + value[1] + value[1] + value[2] + value[2];
  if (value.length !== 6) return `rgba(201,164,93,${alpha})`;
  const r = parseInt(value.substring(0, 2), 16);
  const g = parseInt(value.substring(2, 4), 16);
  const b = parseInt(value.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function lighten(hex: string, amount: number): string {
  let value = hex.replace("#", "");
  if (value.length === 3) value = value[0] + value[0] + value[1] + value[1] + value[2] + value[2];
  const r = Math.min(255, Math.round(parseInt(value.slice(0, 2), 16) + 255 * amount));
  const g = Math.min(255, Math.round(parseInt(value.slice(2, 4), 16) + 255 * amount));
  const b = Math.min(255, Math.round(parseInt(value.slice(4, 6), 16) + 255 * amount));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export function ringToCoords(ring: Array<[number, number]>): number[][][] {
  if (ring.length < 3) return [ring.map(([lng, lat]) => [lng, lat])];
  const closed = ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1] ? ring : [...ring, ring[0]];
  return [closed.map(([lng, lat]) => [lng, lat])];
}

export function computeCentroid(coords: number[][]): { lat: number; lng: number } {
  const points = coords.length > 1 && coords[0][0] === coords[coords.length - 1][0] && coords[0][1] === coords[coords.length - 1][1] ? coords.slice(0, -1) : coords;
  if (!points.length) return { lat: 0, lng: 0 };
  const sum = points.reduce((acc, [lng, lat]) => ({ lng: acc.lng + lng, lat: acc.lat + lat }), { lng: 0, lat: 0 });
  return { lat: sum.lat / points.length, lng: sum.lng / points.length };
}

export function moveRingVertex(ring: Array<[number, number]>, index: number, coordinates: [number, number]) {
  const nextRing = [...ring];
  if (!nextRing[index]) return nextRing;
  const isClosed = nextRing.length > 1 && nextRing[0][0] === nextRing[nextRing.length - 1][0] && nextRing[0][1] === nextRing[nextRing.length - 1][1];
  if (isClosed && (index === 0 || index === nextRing.length - 1)) {
    nextRing[0] = coordinates;
    nextRing[nextRing.length - 1] = coordinates;
  } else nextRing[index] = coordinates;
  return nextRing;
}

export function getPointColor(data: object) {
  const point = data as GlobePoint;
  if (point.isSelected) return "#f59e0b";
  if (point.isHovered) return "#ffffff";
  return "#e8d8b8";
}

export function getPointRadius(data: object) {
  const point = data as GlobePoint;
  if (point.isSelected) return 0.5;
  if (point.isHovered) return 0.45;
  return 0.28;
}

export function getPointAltitude(data: object) {
  const point = data as GlobePoint;
  if (point.isSelected) return 0.06;
  if (point.isHovered) return 0.05;
  return 0.035;
}

export function getLabelText(data: object) {
  return (data as GlobeLabel).text;
}

export function getPolygonSlug(data: object | null) {
  const polygon = data as GlobePolygon | null;
  return polygon?.properties?.slug && polygon.properties.slug !== "__draft__" ? polygon.properties.slug : null;
}
