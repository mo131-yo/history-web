import { ensureAtlasDatabase, sql } from "@/lib/atlas-db-core";
import type { AtlasRow } from "@/lib/atlas-db-types";
import { toFeature } from "@/lib/atlas-db-types";
import { atlasApiErrorResponse } from "../atlasApiErrors";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() ?? "";

    if (query.length < 2) return Response.json({ results: [] });

    await ensureAtlasDatabase();

    const rows = (await sql`
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
      WHERE year BETWEEN 1162 AND 1300
      ORDER BY year ASC, name ASC
    `) as AtlasRow[];

    const normalizedQueries = normalizeSearchVariants(query);
    const results = rows
      .filter((row) => {
        const haystackVariants = normalizeSearchVariants([row.name, row.leader, row.capital, row.summary].join(" "));
        return normalizedQueries.some((normalizedQuery) =>
          haystackVariants.some((haystack) => haystack.includes(normalizedQuery)),
        );
      })
      .slice(0, 20);

    return Response.json({ results: results.map(toFeature) });
  } catch (err) {
    console.error("[atlas/search GET]", err);
    return atlasApiErrorResponse(err, "Улсын хайлт хийхэд серверийн алдаа гарлаа.");
  }
}

const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "yo",
  ж: "j",
  з: "z",
  и: "i",
  й: "i",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  ө: "u",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ү: "u",
  ф: "f",
  х: "kh",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sh",
  ъ: "",
  ы: "ii",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

function normalizeSearchText(value: string) {
  const lower = value.toLowerCase();
  const transliterated = Array.from(lower, (char) => CYRILLIC_TO_LATIN[char] ?? char).join("");

  return transliterated
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\buls\b/g, "ulus")
    .replace(/\buul\b/g, "ul")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSearchVariants(value: string) {
  const normalized = normalizeSearchText(value);
  const variants = new Set([normalized, normalized.replace(/kh/g, "h")]);
  return Array.from(variants).filter(Boolean);
}
