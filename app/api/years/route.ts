// app/api/years/route.ts
import { sql } from '@/app/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const rows = await sql`
      SELECT year, label, is_active
      FROM map_years
      WHERE is_active = true
      ORDER BY year ASC
    `;
    return NextResponse.json(rows);
  } catch (err) {
    console.error('GET /api/years error:', err);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { year, label } = await req.json();
    const y = parseInt(year);
    if (isNaN(y) || y < 1 || y > 9999) {
      return NextResponse.json({ error: 'Invalid year' }, { status: 400 });
    }

    const rows = await sql`
      INSERT INTO map_years (year, label)
      VALUES (${y}, ${label || `${y} он`})
      ON CONFLICT (year) DO UPDATE
        SET label = EXCLUDED.label, is_active = true
      RETURNING *
    `;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    console.error('POST /api/years error:', err);
    return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
  }
}