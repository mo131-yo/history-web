// app/api/admin/features/[id]/route.ts
// GET    → feature + coordinates буцаана
// PUT    → feature + coordinates шинэчилнэ (mouse drag-аар зассан)
// DELETE → feature устгана

import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

function checkAdminAuth(req: NextRequest) {
  return req.headers.get("x-admin-key") === process.env.ADMIN_SECRET_KEY;
}

// ---------- GET ----------
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkAdminAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = parseInt(params.id);
  const [feature] = await sql`SELECT * FROM map_features WHERE id = ${id}`;
  if (!feature) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const coords = await sql`
    SELECT ring_index, point_index, lng, lat
    FROM map_coordinates
    WHERE feature_id = ${id}
    ORDER BY ring_index, point_index
  `;

  const battles = await sql`SELECT * FROM battles WHERE feature_id = ${id}`;

  // rings болгон хувиргана
  const rings: Record<number, [number, number][]> = {};
  for (const c of coords) {
    if (!rings[c.ring_index]) rings[c.ring_index] = [];
    rings[c.ring_index][c.point_index] = [c.lng, c.lat];
  }

  return NextResponse.json({ ...feature, rings, battles });
}

// ---------- PUT: feature мэдээлэл + координат шинэчлэх ----------
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkAdminAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = parseInt(params.id);
  const body = await req.json();

  const {
    name, type, leader, capital, founded, population,
    era, description, major_events, color, is_whatif,
    coordinates, // optional: шинэ координатууд
  } = body;

  // Feature шинэчлэх
  await sql`
    UPDATE map_features SET
      name         = COALESCE(${name}, name),
      type         = COALESCE(${type}, type),
      leader       = COALESCE(${leader}, leader),
      capital      = COALESCE(${capital}, capital),
      founded      = COALESCE(${founded}, founded),
      population   = COALESCE(${population}, population),
      era          = COALESCE(${era}, era),
      description  = COALESCE(${description}, description),
      major_events = COALESCE(${major_events}, major_events),
      color        = COALESCE(${color}, color),
      is_whatif    = COALESCE(${is_whatif}, is_whatif)
    WHERE id = ${id}
  `;

  // Координат шинэчлэх (байгаагыг устгаад дахин оруулна)
  if (coordinates !== undefined) {
    await sql`DELETE FROM map_coordinates WHERE feature_id = ${id}`;

    const rings: [number, number][][] =
      coordinates.length > 0 && Array.isArray(coordinates[0][0])
        ? coordinates
        : [coordinates];

    for (let ri = 0; ri < rings.length; ri++) {
      const ring = rings[ri];
      for (let pi = 0; pi < ring.length; pi++) {
        const [lng, lat] = ring[pi];
        await sql`
          INSERT INTO map_coordinates (feature_id, ring_index, point_index, lng, lat)
          VALUES (${id}, ${ri}, ${pi}, ${lng}, ${lat})
        `;
      }
    }
  }

  return NextResponse.json({ success: true });
}

// ---------- DELETE ----------
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkAdminAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = parseInt(params.id);
  // CASCADE-аар координат, battles автоматаар устана
  await sql`DELETE FROM map_features WHERE id = ${id}`;

  return NextResponse.json({ success: true });
}