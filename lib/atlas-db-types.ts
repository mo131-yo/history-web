import type { AtlasStateFeature } from "@/lib/types";

export type AtlasRow = {
  slug: string;
  year: number;
  name: string;
  leader: string;
  capital: string;
  color: string;
  summary: string;
  metadata: Record<string, unknown>;
  geometry: GeoJSON.Polygon;
  updated_at: string;
};

export function getCenterFromRing(ring: [number, number][]) {
  const uniquePoints = ring.slice(0, -1);
  const total = uniquePoints.reduce(
    (acc, [lng, lat]) => ({ lng: acc.lng + lng, lat: acc.lat + lat }),
    { lng: 0, lat: 0 },
  );

  return [
    Number((total.lng / uniquePoints.length).toFixed(4)),
    Number((total.lat / uniquePoints.length).toFixed(4)),
  ] as [number, number];
}

export function toFeature(row: AtlasRow): AtlasStateFeature {
  const ring = row.geometry.coordinates[0] as [number, number][];

  return {
    type: "Feature",
    geometry: row.geometry,
    properties: {
      slug: row.slug,
      year: row.year,
      name: row.name,
      leader: row.leader,
      capital: row.capital,
      color: row.color,
      summary: row.summary,
      metadata: row.metadata ?? {},
      center: getCenterFromRing(ring),
      updatedAt: row.updated_at,
    },
  };
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
