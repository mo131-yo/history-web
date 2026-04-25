import type { AtlasStateInput } from "@/lib/types";
import { ensureAtlasDatabase, ensureYearBaseline, sql } from "./atlas-db-core";
import { slugify, toFeature } from "./atlas-db-types";
import type { AtlasRow } from "./atlas-db-types";

const RETURNING_FRAGMENT = sql`
  RETURNING
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
`;

export async function updateStateGeometry(year: number, slug: string, geometry: GeoJSON.Polygon) {
  await ensureAtlasDatabase();
  await ensureYearBaseline(year);
  const rows = (await sql`
    UPDATE atlas_states
    SET geometry = ST_SetSRID(ST_GeomFromGeoJSON(${JSON.stringify(geometry)}), 4326), updated_at = NOW()
    WHERE year = ${year} AND slug = ${slug}
    ${RETURNING_FRAGMENT}
  `) as AtlasRow[];
  return rows[0] ? toFeature(rows[0]) : null;
}

export async function updateAtlasState(year: number, slug: string, input: Omit<AtlasStateInput, "year">) {
  await ensureAtlasDatabase();
  await ensureYearBaseline(year);
  const rows = (await sql`
    UPDATE atlas_states
    SET
      name = ${input.name},
      leader = ${input.leader},
      capital = ${input.capital},
      color = ${input.color},
      summary = ${input.summary},
      metadata = ${JSON.stringify(input.metadata ?? {})}::jsonb,
      geometry = ST_SetSRID(ST_GeomFromGeoJSON(${JSON.stringify(input.geometry)}), 4326),
      updated_at = NOW()
    WHERE year = ${year} AND slug = ${slug}
    ${RETURNING_FRAGMENT}
  `) as AtlasRow[];
  return rows[0] ? toFeature(rows[0]) : null;
}

export async function createAtlasState(input: AtlasStateInput) {
  await ensureAtlasDatabase();
  await ensureYearBaseline(input.year);
  const slug = await createUniqueSlug(input.year, input.name);
  const rows = (await sql`
    INSERT INTO atlas_states (slug, year, name, leader, capital, color, summary, metadata, geometry)
    VALUES (
      ${slug},
      ${input.year},
      ${input.name},
      ${input.leader},
      ${input.capital},
      ${input.color},
      ${input.summary},
      ${JSON.stringify(input.metadata ?? {})}::jsonb,
      ST_SetSRID(ST_GeomFromGeoJSON(${JSON.stringify(input.geometry)}), 4326)
    )
    ${RETURNING_FRAGMENT}
  `) as AtlasRow[];
  return toFeature(rows[0]);
}

export async function deleteAtlasState(year: number, slug: string) {
  await ensureAtlasDatabase();
  await ensureYearBaseline(year);
  const rows = (await sql`
    DELETE FROM atlas_states
    WHERE year = ${year} AND slug = ${slug}
    RETURNING slug
  `) as Array<{ slug: string }>;
  return rows.length > 0;
}

async function createUniqueSlug(year: number, name: string) {
  const baseSlug = slugify(name) || `state-${year}`;
  let slug = baseSlug;
  let suffix = 1;

  for (;;) {
    const existing = (await sql`
      SELECT slug FROM atlas_states WHERE year = ${year} AND slug = ${slug} LIMIT 1
    `) as Array<{ slug: string }>;
    if (existing.length === 0) return slug;
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
}
