// app/api/admin/features/route.ts
// POST   → шинэ feature + координат үүсгэнэ
// GET    → бүх feature жагсаална (admin)

import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// ---------- Admin auth шалгах ----------
function checkAdminAuth(req: NextRequest) {
  const key = req.headers.get("x-admin-key");
  return key === process.env.ADMIN_SECRET_KEY;
}

// ---------- GET: бүх feature жагсаал ----------
export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const year = req.nextUrl.searchParams.get("year");
  const whereYear = year ? sql`WHERE f.year = ${parseInt(year)}` : sql``;

  const features = await sql`
    SELECT f.id, f.year, f.name, f.type, f.leader, f.capital, f.color,
           f.description, f.is_whatif, f.created_at,
           COUNT(c.id) AS coord_count
    FROM map_features f
    LEFT JOIN map_coordinates c ON c.feature_id = f.id
    ${whereYear}
    GROUP BY f.id
    ORDER BY f.year, f.id
  `;

  return NextResponse.json(features);
}

// ---------- POST: шинэ feature үүсгэ ----------
export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    year, name, type = "territory", leader, capital, founded,
    population, era, description, major_events, color = "#C5A059",
    is_whatif = false, coordinates = [], battles = []
  } = body;

  if (!year || !name) {
    return NextResponse.json({ error: "year and name required" }, { status: 400 });
  }

  // year мөр байгаа эсэх шалга, байхгүй бол үүсгэ
  await sql`
    INSERT INTO map_years (year, label)
    VALUES (${year}, ${`${year} он`})
    ON CONFLICT (year) DO NOTHING
  `;

  // Feature оруул
  const [feature] = await sql`
    INSERT INTO map_features
      (year, name, type, leader, capital, founded, population, era, description, major_events, color, is_whatif)
    VALUES
      (${year}, ${name}, ${type}, ${leader}, ${capital}, ${founded},
       ${population}, ${era}, ${description}, ${major_events}, ${color}, ${is_whatif})
    RETURNING *
  `;

  // Координатууд оруул (coordinates = [[lng,lat], ...] эсвэл [[[lng,lat],...]] - rings)
  if (coordinates.length > 0) {
    // Polygon rings дэмжинэ: [[ring0pts], [ring1pts]] эсвэл ганц ring [pts]
    const rings: [number, number][][] =
      Array.isArray(coordinates[0][0]) ? coordinates : [coordinates];

    for (let ri = 0; ri < rings.length; ri++) {
      const ring = rings[ri];
      for (let pi = 0; pi < ring.length; pi++) {
        const [lng, lat] = ring[pi];
        await sql`
          INSERT INTO map_coordinates (feature_id, ring_index, point_index, lng, lat)
          VALUES (${feature.id}, ${ri}, ${pi}, ${lng}, ${lat})
        `;
      }
    }
  }

  // Battles оруул
  for (const b of battles) {
    await sql`
      INSERT INTO battles (feature_id, year, name, opponent)
      VALUES (${feature.id}, ${b.year}, ${b.name}, ${b.opponent})
    `;
  }

  return NextResponse.json({ success: true, feature }, { status: 201 });
}