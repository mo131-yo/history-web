import maplibregl, { GeoJSONSource } from "maplibre-gl";

export function normalizeLngLatLike(value: unknown): [number, number] | null {
  if (Array.isArray(value) && value.length >= 2) {
    const lng = Number(value[0]);
    const lat = Number(value[1]);
    if (Number.isFinite(lng) && Number.isFinite(lat)) return [lng, lat];
  }

  if (value && typeof value === "object") {
    const candidate = value as { lng?: unknown; lon?: unknown; lat?: unknown };
    const lng = Number(candidate.lng ?? candidate.lon);
    const lat = Number(candidate.lat);
    if (Number.isFinite(lng) && Number.isFinite(lat)) return [lng, lat];
  }

  return null;
}

export function getFeatureCenter(
  feature: GeoJSON.Feature<GeoJSON.Polygon> | undefined,
): [number, number] | null {
  const ring = feature?.geometry.coordinates?.[0];
  if (!ring || ring.length === 0) return null;
  const uniquePoints = ring.slice(0, -1);
  const points = uniquePoints.length > 0 ? uniquePoints : ring;
  if (points.length === 0) return null;

  const total = points.reduce(
    (acc, [lng, lat]) => ({ lng: acc.lng + lng, lat: acc.lat + lat }),
    { lng: 0, lat: 0 },
  );

  return [total.lng / points.length, total.lat / points.length];
}

export function getFeatureBounds(
  feature: GeoJSON.Feature<GeoJSON.Polygon> | undefined,
): maplibregl.LngLatBoundsLike | null {
  const ring = feature?.geometry.coordinates?.[0];
  if (!ring || ring.length === 0) return null;

  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  for (const [lng, lat] of ring) {
    minLng = Math.min(minLng, lng);
    minLat = Math.min(minLat, lat);
    maxLng = Math.max(maxLng, lng);
    maxLat = Math.max(maxLat, lat);
  }

  if (![minLng, minLat, maxLng, maxLat].every(Number.isFinite)) return null;
  return [[minLng, minLat], [maxLng, maxLat]];
}

export function createDraftPolygon(ring: Array<[number, number]>) {
  const displayRing =
    ring.length > 0 &&
    ring[0][0] === ring[ring.length - 1]?.[0] &&
    ring[0][1] === ring[ring.length - 1]?.[1]
      ? ring
      : ring.length >= 3
        ? [...ring, ring[0]]
        : ring;

  return {
    type: "FeatureCollection" as const,
    features:
      displayRing.length >= 4
        ? [
            {
              type: "Feature" as const,
              geometry: { type: "Polygon" as const, coordinates: [displayRing] },
              properties: {},
            },
          ]
        : [],
  };
}

export function createVertexCollection(ring: Array<[number, number]>) {
  return {
    type: "FeatureCollection" as const,
    features: ring.map((coordinates, index) => ({
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates },
      properties: { index },
    })),
  };
}

export function safeSetData(
  map: maplibregl.Map,
  sourceId: string,
  data: GeoJSON.FeatureCollection,
) {
  const source = map.getSource(sourceId) as GeoJSONSource | undefined;
  source?.setData(data);
}
