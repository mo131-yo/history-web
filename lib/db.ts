import { neon } from "@neondatabase/serverless";
import { atlasSeedData, atlasSeedYears } from "@/lib/seed-data";
import type { AtlasFeatureCollection, AtlasStateFeature, AtlasStateInput } from "@/lib/types";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL env хувьсагч тохируулагдаагүй байна.");
}

const sql = neon(databaseUrl);

let bootstrapPromise: Promise<void> | null = null;

function getCenterFromRing(ring: [number, number][]) {
  const uniquePoints = ring.slice(0, -1);
  const total = uniquePoints.reduce(
    (acc, [lng, lat]) => {
      acc.lng += lng;
      acc.lat += lat;
      return acc;
    },
    { lng: 0, lat: 0 },
  );

  return [
    Number((total.lng / uniquePoints.length).toFixed(4)),
    Number((total.lat / uniquePoints.length).toFixed(4)),
  ] as [number, number];
}

function toFeature(row: AtlasRow): AtlasStateFeature {
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

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function ensureAtlasDatabase() {
  if (bootstrapPromise) {
    return bootstrapPromise;
  }

  bootstrapPromise = (async () => {
    await sql`CREATE EXTENSION IF NOT EXISTS postgis`;
    await sql`
      CREATE TABLE IF NOT EXISTS atlas_states (
        id BIGSERIAL PRIMARY KEY,
        slug TEXT NOT NULL,
        year INTEGER NOT NULL,
        name TEXT NOT NULL,
        leader TEXT NOT NULL,
        capital TEXT NOT NULL,
        color TEXT NOT NULL,
        summary TEXT NOT NULL,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        geometry geometry(Polygon, 4326) NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (year, slug)
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS atlas_states_year_idx ON atlas_states (year)`;
    await sql`CREATE INDEX IF NOT EXISTS atlas_states_slug_idx ON atlas_states (slug)`;
    await sql`CREATE INDEX IF NOT EXISTS atlas_states_geom_idx ON atlas_states USING GIST (geometry)`;

    const seeded = (await sql`SELECT COUNT(*)::int AS count FROM atlas_states`) as Array<{ count: number }>;

    if (seeded[0]?.count) {
      return;
    }

    for (const state of atlasSeedData) {
      await sql`
        INSERT INTO atlas_states (
          slug, year, name, leader, capital, color, summary, metadata, geometry
        )
        VALUES (
          ${state.slug},
          ${state.year},
          ${state.name},
          ${state.leader},
          ${state.capital},
          ${state.color},
          ${state.summary},
          ${JSON.stringify(state.metadata)}::jsonb,
          ST_SetSRID(ST_GeomFromGeoJSON(${JSON.stringify(state.geometry)}), 4326)
        )
        ON CONFLICT (year, slug) DO NOTHING
      `;
    }
  })();

  return bootstrapPromise;
}

export async function listAtlasYears() {
  await ensureAtlasDatabase();
  return atlasSeedYears;
}

type AtlasRow = {
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

export async function getAtlasForYear(year: number): Promise<AtlasFeatureCollection> {
  await ensureAtlasDatabase();

  let rows = (await sql`
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

  if (rows.length === 0) {
    const fallback = (await sql`
      SELECT MAX(year)::int AS year
      FROM atlas_states
      WHERE year <= ${year}
    `) as Array<{ year: number | null }>;

    const fallbackYear = fallback[0]?.year;

    if (fallbackYear) {
      rows = (await sql`
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
        WHERE year = ${fallbackYear}
        ORDER BY name ASC
      `) as AtlasRow[];
    }
  }

  const features: AtlasStateFeature[] = rows.map(toFeature);

  return {
    type: "FeatureCollection",
    year,
    features,
  };
}

async function ensureYearBaseline(year: number) {
  const current = (await sql`
    SELECT COUNT(*)::int AS count
    FROM atlas_states
    WHERE year = ${year}
  `) as Array<{ count: number }>;
  const currentCount = current[0]?.count ?? 0;

  const source = (await sql`
    SELECT year, COUNT(*)::int AS count
    FROM atlas_states
    WHERE year < ${year}
    GROUP BY year
    HAVING COUNT(*)::int > ${currentCount}
    ORDER BY year DESC
    LIMIT 1
  `) as Array<{ year: number; count: number }>;
  const sourceYear = source[0]?.year;

  if (!sourceYear) {
    return;
  }

  await sql`
    INSERT INTO atlas_states (
      slug, year, name, leader, capital, color, summary, metadata, geometry
    )
    SELECT
      source.slug,
      ${year},
      source.name,
      source.leader,
      source.capital,
      source.color,
      source.summary,
      source.metadata,
      source.geometry
    FROM atlas_states AS source
    WHERE source.year = ${sourceYear}
      AND NOT EXISTS (
        SELECT 1
        FROM atlas_states AS cur
        WHERE cur.year = ${year}
          AND cur.slug = source.slug
      )
    ON CONFLICT (year, slug) DO NOTHING
  `;
}

export async function updateStateGeometry(year: number, slug: string, geometry: GeoJSON.Polygon) {
  await ensureAtlasDatabase();
  await ensureYearBaseline(year);

  const rows = (await sql`
    UPDATE atlas_states
    SET
      geometry = ST_SetSRID(ST_GeomFromGeoJSON(${JSON.stringify(geometry)}), 4326),
      updated_at = NOW()
    WHERE year = ${year} AND slug = ${slug}
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
  `) as AtlasRow[];

  const row = rows[0];

  if (!row) {
    return null;
  }

  return toFeature(row);
}

export async function updateAtlasState(
  year: number,
  slug: string,
  input: Omit<AtlasStateInput, "year">,
) {
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
  `) as AtlasRow[];

  const row = rows[0];

  if (!row) {
    return null;
  }

  return toFeature(row);
}

export async function createAtlasState(input: AtlasStateInput) {
  await ensureAtlasDatabase();
  await ensureYearBaseline(input.year);

  const baseSlug = slugify(input.name) || `state-${input.year}`;
  let slug = baseSlug;
  let suffix = 1;

  for (;;) {
    const existing = (await sql`
      SELECT slug
      FROM atlas_states
      WHERE year = ${input.year} AND slug = ${slug}
      LIMIT 1
    `) as Array<{ slug: string }>;

    if (existing.length === 0) {
      break;
    }

    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  const rows = (await sql`
    INSERT INTO atlas_states (
      slug, year, name, leader, capital, color, summary, metadata, geometry
    )
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
