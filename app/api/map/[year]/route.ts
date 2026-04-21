// app/api/map/[year]/route.ts
// GET /api/map/1206          → жил дэх бүх feature-ийг GeoJSON болгон буцаана
// GET /api/map/1206?whatif=1 → alternate history

import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(
  req: NextRequest,
  { params }: { params: { year: string } }
) {
  const year = parseInt(params.year);
  const whatif = req.nextUrl.searchParams.get("whatif") === "1";

  if (isNaN(year)) {
    return NextResponse.json({ error: "Invalid year" }, { status: 400 });
  }

  try {
    // Тухайн жилийн бүх feature татна
    const features = await sql`
      SELECT f.*,
        COALESCE(
          json_agg(
            json_build_object('year', b.year, 'name', b.name, 'opponent', b.opponent)
          ) FILTER (WHERE b.id IS NOT NULL),
          '[]'
        ) AS battles
      FROM map_features f
      LEFT JOIN battles b ON b.feature_id = f.id
      WHERE f.year = ${year}
        AND f.is_whatif = ${whatif}
      GROUP BY f.id
      ORDER BY f.id
    `;

    if (features.length === 0) {
      return NextResponse.json(
        { type: "FeatureCollection", features: [] },
        { headers: { "Cache-Control": "s-maxage=60" } }
      );
    }

    // Coordinate татна (бүх feature-ийн нэгэн зэрэг)
    const featureIds = features.map((f: any) => f.id);
    const coords = await sql`
      SELECT feature_id, ring_index, point_index, lng, lat
      FROM map_coordinates
      WHERE feature_id = ANY(${featureIds})
      ORDER BY feature_id, ring_index, point_index
    `;

    // Координатуудыг feature-ээр бүлэглэнэ
    const coordMap: Record<number, Record<number, [number, number][]>> = {};
    for (const c of coords) {
      if (!coordMap[c.feature_id]) coordMap[c.feature_id] = {};
      if (!coordMap[c.feature_id][c.ring_index]) coordMap[c.feature_id][c.ring_index] = [];
      coordMap[c.feature_id][c.ring_index][c.point_index] = [c.lng, c.lat];
    }

    // GeoJSON Feature Collection байгуулна
    const geoFeatures = features.map((f: any) => {
      const rings = coordMap[f.id] || {};
      const ringKeys = Object.keys(rings)
        .map(Number)
        .sort((a, b) => a - b);

      // LineString эсвэл Polygon шийдэнэ
      let geometry: any;
      if (f.type === "attack-line" || f.type === "battle-line") {
        geometry = {
          type: "LineString",
          coordinates: (rings[0] || []),
        };
      } else if (f.type === "city") {
        const pts = rings[0] || [];
        geometry = {
          type: "Point",
          coordinates: pts[0] || [0, 0],
        };
      } else {
        geometry = {
          type: "Polygon",
          coordinates: ringKeys.map((k) => rings[k]),
        };
      }

      const { id, year: yr, is_whatif, created_at, updated_at, ...props } = f;

      return {
        type: "Feature",
        properties: { ...props },
        geometry,
      };
    });

    return NextResponse.json(
      { type: "FeatureCollection", features: geoFeatures },
      {
        headers: {
          "Cache-Control": "s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (err: any) {
    console.error("DB error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}