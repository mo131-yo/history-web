import { createAtlasState, getAtlasForYear } from "@/lib/db";
import { normalizeClosedRing } from "@/lib/geometry";
import { bodySchema, querySchema } from "./atlasStatesSchemas";

export async function handleAtlasStatesGet(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({ year: searchParams.get("year") });
  if (!parsed.success) {
    return Response.json({ error: "Зөв year параметр дамжуулна уу.", details: parsed.error.flatten() }, { status: 400 });
  }
  return Response.json(await getAtlasForYear(parsed.data.year));
}

export async function handleAtlasStatesPost(request: Request) {
  const payload = await request.json().catch(() => null);
  if (!payload) return Response.json({ error: "JSON body буруу байна." }, { status: 400 });

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    console.error("[atlas/states POST validation]", { payload, issues: parsed.error.issues, flattened: parsed.error.flatten() });
    return Response.json({ error: "Шинэ улсын мэдээлэл дутуу эсвэл буруу байна.", details: parsed.error.flatten() }, { status: 400 });
  }

  const ring = normalizeClosedRing(parsed.data.coordinates);
  const uniquePoints = new Set(ring.map(([lng, lat]) => `${lng.toFixed(6)},${lat.toFixed(6)}`));
  if (ring.length < 4 || uniquePoints.size < 3) {
    return Response.json({ error: "Polygon дор хаяж 3 өөр оройтой байна." }, { status: 400 });
  }

  const feature = await createAtlasState({
    year: parsed.data.year,
    name: parsed.data.name,
    leader: parsed.data.leader || "Тодорхойгүй",
    capital: parsed.data.capital || "Тодорхойгүй",
    color: parsed.data.color || "#c9a45d",
    summary: parsed.data.summary,
    metadata: parsed.data.metadata,
    geometry: { type: "Polygon", coordinates: [ring] },
  });

  return Response.json({ feature, collection: await getAtlasForYear(parsed.data.year) }, { status: 201 });
}
