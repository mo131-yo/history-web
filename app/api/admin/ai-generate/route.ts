// app/api/admin/ai-generate/route.ts
// POST → Claude API-г fetch-ээр дуудаж газарзүйн өгөгдөл үүсгэж DB-д хадгална
// @anthropic-ai/sdk ШААРДЛАГАГҮЙ — шууд fetch ашиглана

import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

function checkAdminAuth(req: NextRequest) {
  return req.headers.get("x-admin-key") === process.env.ADMIN_SECRET_KEY;
}

export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { year, prompt, is_whatif = false } = await req.json();

  if (!year) {
    return NextResponse.json({ error: "year required" }, { status: 400 });
  }

  const systemPrompt = `Та түүхийн газарзүйн мэргэжилтэн. 
Зааврыг дагаж ЗӨВХӨН JSON массив буцаа. Markdown, тайлбар, нэмэлт текст бүү нэм. Зөвхөн [ ... ] JSON array.
JSON format:
[
  {
    "name": "улсын нэр монголоор",
    "type": "territory",
    "leader": "удирдагч",
    "capital": "нийслэл",
    "era": "үе",
    "description": "тайлбар монголоор",
    "color": "#hex",
    "coordinates": [[lng,lat], [lng,lat], ...],
    "battles": [{"year": 1206, "name": "тулаан", "opponent": "дайсан"}]
  }
]
coordinates нь Polygon-ий гаднах ring-ийн цэгүүд. Эхний болон сүүлийн цэг ижил байх ёстой.
Longitude: -180-аас 180, Latitude: -90-аас 90.`;

  const userMsg = prompt
    ? `${year} онд ${prompt} өгөгдөл үүсгэ`
    : `${year} онд дэлхийн гол ${is_whatif ? "альтернатив" : ""} улс гүрнүүдийн газарзүйн өгөгдөл үүсгэ. Монгол, Ази, Европын гол гүрнүүдийг оруул. 5-8 улс.`;

  try {
    // ── Claude API шууд fetch-ээр ────────────────────────────────
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: "user", content: userMsg }],
      }),
    });

    if (!claudeRes.ok) {
      const errText = await claudeRes.text();
      throw new Error(`Claude API алдаа: ${claudeRes.status} — ${errText}`);
    }

    const claudeData = await claudeRes.json();

    const rawText: string = claudeData.content
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text as string)
      .join("");

    // Markdown code fence хасна, зөвхөн [...] авна
    const clean = rawText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    const arrayStart = clean.indexOf("[");
    const arrayEnd = clean.lastIndexOf("]");
    if (arrayStart === -1 || arrayEnd === -1) {
      throw new Error(`JSON array олдсонгүй. Хариу: ${clean.slice(0, 300)}`);
    }
    const featureList = JSON.parse(clean.slice(arrayStart, arrayEnd + 1));

    if (!Array.isArray(featureList)) {
      throw new Error("Parse хийсэн өгөгдөл array биш байна");
    }

    // ── DB-д хадгална ────────────────────────────────────────────
    await sql`
      INSERT INTO map_years (year, label, is_whatif)
      VALUES (${year}, ${`${year} он`}, ${is_whatif})
      ON CONFLICT (year) DO NOTHING
    `;

    const savedFeatures: { id: number; name: string }[] = [];

    for (const item of featureList) {
      const {
        name,
        type = "territory",
        leader = null,
        capital = null,
        founded = null,
        population = null,
        era = null,
        description = null,
        major_events = null,
        color = "#C5A059",
        coordinates = [],
        battles = [],
      } = item;

      if (!name) continue;

      const [feature] = await sql`
        INSERT INTO map_features
          (year, name, type, leader, capital, founded, population,
           era, description, major_events, color, is_whatif)
        VALUES
          (${year}, ${name}, ${type}, ${leader}, ${capital}, ${founded},
           ${population}, ${era}, ${description}, ${major_events}, ${color}, ${is_whatif})
        RETURNING id, name
      `;

      // Coordinates: ганц ring [[lng,lat],...] эсвэл олон ring [[[lng,lat],...]]
      const rings: [number, number][][] =
        coordinates.length > 0 && Array.isArray(coordinates[0][0])
          ? coordinates
          : [coordinates];

      for (let ri = 0; ri < rings.length; ri++) {
        for (let pi = 0; pi < rings[ri].length; pi++) {
          const [lng, lat] = rings[ri][pi];
          await sql`
            INSERT INTO map_coordinates (feature_id, ring_index, point_index, lng, lat)
            VALUES (${feature.id}, ${ri}, ${pi}, ${lng}, ${lat})
          `;
        }
      }

      for (const b of battles) {
        await sql`
          INSERT INTO battles (feature_id, year, name, opponent)
          VALUES (${feature.id}, ${b.year ?? year}, ${b.name}, ${b.opponent})
        `;
      }

      savedFeatures.push({ id: feature.id, name: feature.name });
    }

    return NextResponse.json({
      success: true,
      count: savedFeatures.length,
      features: savedFeatures,
    });
  } catch (err: any) {
    console.error("AI generate error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 