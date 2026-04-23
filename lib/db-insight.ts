// import { neon } from "@neondatabase/serverless";

// const databaseUrl = process.env.DATABASE_URL;
// if (!databaseUrl) throw new Error("DATABASE_URL env хувьсагч тохируулагдаагүй байна.");

// const sql = neon(databaseUrl);

// let insightTableReady = false;

// async function ensureInsightTable() {
//   if (insightTableReady) return;
//   await sql`
//     CREATE TABLE IF NOT EXISTS atlas_insights (
//       id        BIGSERIAL PRIMARY KEY,
//       slug      TEXT    NOT NULL,
//       year      INTEGER NOT NULL,
//       text      TEXT    NOT NULL,
//       created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
//       UNIQUE (slug, year)
//     )
//   `;
//   await sql`CREATE INDEX IF NOT EXISTS atlas_insights_slug_year_idx ON atlas_insights (slug, year)`;
//   insightTableReady = true;
// }

// export async function getCachedInsight(
//   slug: string,
//   year: number,
// ): Promise<string | null> {
//   await ensureInsightTable();
//   const rows = (await sql`
//     SELECT text FROM atlas_insights
//     WHERE slug = ${slug} AND year = ${year}
//     LIMIT 1
//   `) as Array<{ text: string }>;
//   return rows[0]?.text ?? null;
// }

// export async function saveInsight(
//   slug: string,
//   year: number,
//   text: string,
// ): Promise<void> {
//   await ensureInsightTable();
//   await sql`
//     INSERT INTO atlas_insights (slug, year, text)
//     VALUES (${slug}, ${year}, ${text})
//     ON CONFLICT (slug, year)
//     DO UPDATE SET text = EXCLUDED.text, created_at = NOW()
//   `;
// }



import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL env хувьсагч тохируулагдаагүй байна.");

const sql = neon(databaseUrl);

/**
 * Хүснэгт байхгүй бол үүсгэнэ.
 * Serverless environment-д function дуудалт бүрт шинэ instance үүсэх тул
 * in-memory flag ашиглахгүй — IF NOT EXISTS тул давтан дуудах аюулгүй.
 */
async function ensureInsightTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS atlas_insights (
      id         BIGSERIAL    PRIMARY KEY,
      slug       TEXT         NOT NULL,
      year       INTEGER      NOT NULL,
      text       TEXT         NOT NULL,
      created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      UNIQUE (slug, year)
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS atlas_insights_slug_year_idx
    ON atlas_insights (slug, year)
  `;
}

/** DB-ээс cached insight уншина. Байхгүй бол null буцаана. */
export async function getCachedInsight(
  slug: string,
  year: number,
): Promise<string | null> {
  await ensureInsightTable();
  const rows = (await sql`
    SELECT text FROM atlas_insights
    WHERE slug = ${slug} AND year = ${year}
    LIMIT 1
  `) as Array<{ text: string }>;
  return rows[0]?.text ?? null;
}

/**
 * AI-ийн хариуг DB-д хадгална.
 * DO NOTHING — аль хэдийн байвал анхны generate-г хэвээр үлдээнэ, дарж бичихгүй.
 */
export async function saveInsight(
  slug: string,
  year: number,
  text: string,
): Promise<void> {
  await ensureInsightTable();
  await sql`
    INSERT INTO atlas_insights (slug, year, text)
    VALUES (${slug}, ${year}, ${text})
    ON CONFLICT (slug, year) DO NOTHING
  `;
}