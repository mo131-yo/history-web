import type { AtlasFeatureCollection } from "@/lib/types";
import { atlasSeedYears, ensureAtlasDatabase, sql } from "./atlas-db-core";
import type { AtlasRow } from "./atlas-db-types";
import { toFeature } from "./atlas-db-types";

export async function listAtlasYears() {
  await ensureAtlasDatabase();
  return atlasSeedYears;
}

export async function getAtlasForYear(year: number): Promise<AtlasFeatureCollection> {
  await ensureAtlasDatabase();
  let rows = await selectAtlasRowsForYear(year);

  if (rows.length === 0) {
    const fallback = (await sql`
      SELECT MAX(year)::int AS year
      FROM atlas_states
      WHERE year <= ${year}
    `) as Array<{ year: number | null }>;
    const fallbackYear = fallback[0]?.year;
    if (fallbackYear) rows = await selectAtlasRowsForYear(fallbackYear);
  }

  return {
    type: "FeatureCollection",
    year,
    features: rows.map(toFeature),
  };
}

async function selectAtlasRowsForYear(year: number) {
  return (await sql`
    SELECT
      slug,
      year,
      name,
      leader,
      capital,
      color,
      summary,
      metadata,
      ST_AsGeoJSON(geometry)::json AS geometry,
      updated_at::text
    FROM atlas_states
    WHERE year = ${year}
    ORDER BY name ASC
  `) as AtlasRow[];
}
