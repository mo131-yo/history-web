import { neon } from "@neondatabase/serverless";
import { atlasSeedData, atlasSeedYears } from "@/lib/seed-data";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL env хувьсагч тохируулагдаагүй байна.");
}

export const sql = neon(databaseUrl);
export { atlasSeedYears };

let bootstrapPromise: Promise<void> | null = null;

export async function ensureAtlasDatabase() {
  if (bootstrapPromise) return bootstrapPromise;

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
    if (seeded[0]?.count) return;

    for (const state of atlasSeedData) {
      await sql`
        INSERT INTO atlas_states (slug, year, name, leader, capital, color, summary, metadata, geometry)
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

export async function ensureYearBaseline(year: number) {
  const current = (await sql`
    SELECT COUNT(*)::int AS count FROM atlas_states WHERE year = ${year}
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
  if (!sourceYear) return;

  await sql`
    INSERT INTO atlas_states (slug, year, name, leader, capital, color, summary, metadata, geometry)
    SELECT source.slug, ${year}, source.name, source.leader, source.capital, source.color, source.summary, source.metadata, source.geometry
    FROM atlas_states AS source
    WHERE source.year = ${sourceYear}
      AND NOT EXISTS (
        SELECT 1 FROM atlas_states AS cur WHERE cur.year = ${year} AND cur.slug = source.slug
      )
    ON CONFLICT (year, slug) DO NOTHING
  `;
}
