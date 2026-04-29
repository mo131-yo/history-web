import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { sql } from "@/lib/atlas-db-core";
import { updateStateGeometry } from "@/lib/db";
import { normalizeClosedRing } from "@/lib/geometry";
import { atlasApiErrorResponse } from "../atlasApiErrors";

const pointSchema = z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]);
const coordinatesSchema = z.array(pointSchema).min(4);

const feedbackSchema = z.object({
  slug: z.string().trim().min(1).max(120),
  year: z.number().int().min(1100).max(1400),
  stateName: z.string().trim().min(1).max(180),
  userName: z.string().trim().min(1).max(120).default("Зочин"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(2).max(700),
  proposedCoordinates: coordinatesSchema.optional(),
});

const reviewSchema = z.object({
  id: z.string().trim().min(1),
  action: z.enum(["approve", "reject"]),
});

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    const isAdmin = !!userId;
    await ensureAtlasFeedbackTable();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status")?.trim();
    const slug = searchParams.get("slug")?.trim();
    const year = Number(searchParams.get("year"));

    if (status === "pending") {
      if (!isAdmin) return Response.json({ error: "Admin эрх шаардлагатай." }, { status: 401 });

      const rows = (await sql`
        SELECT id::text, slug, year, state_name, user_name, rating, comment, proposed_geometry, status, created_at::text
        FROM atlas_state_feedback
        WHERE status = 'pending'
        ORDER BY created_at DESC
        LIMIT 50
      `) as FeedbackRow[];

      return Response.json({
        count: rows.length,
        feedback: rows.map((row) => toFeedback(row, true)),
      });
    }

    if (!slug || !Number.isInteger(year)) {
      return Response.json({ error: "Feedback унших өгөгдөл дутуу байна." }, { status: 400 });
    }

    const rows = (await sql`
      SELECT id::text, slug, year, state_name, user_name, rating, comment, proposed_geometry, status, created_at::text
      FROM atlas_state_feedback
      WHERE slug = ${slug}
        AND year = ${year}
        AND (${isAdmin} OR status IN ('visible', 'approved'))
      ORDER BY created_at DESC
      LIMIT 20
    `) as FeedbackRow[];

    return Response.json({ feedback: rows.map((row) => toFeedback(row, isAdmin)) });
  } catch (error) {
    console.error("[atlas/feedback GET]", error);
    return atlasApiErrorResponse(error, "Feedback ачаалахад алдаа гарлаа.");
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null);
    const parsed = feedbackSchema.safeParse(payload);
    if (!parsed.success) {
      return Response.json(
        { error: "Feedback өгөгдөл буруу байна.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { userId } = await auth();
    await ensureAtlasFeedbackTable();
    const proposedGeometry = parsed.data.proposedCoordinates
      ? toPolygonGeometry(parsed.data.proposedCoordinates)
      : null;
    const isGuestFeedback = !userId;

    const rows = (await sql`
      INSERT INTO atlas_state_feedback (
        clerk_user_id,
        slug,
        year,
        state_name,
        user_name,
        rating,
        comment,
        proposed_geometry,
        status
      )
      VALUES (
        ${userId ?? null},
        ${parsed.data.slug},
        ${parsed.data.year},
        ${parsed.data.stateName},
        ${parsed.data.userName},
        ${parsed.data.rating},
        ${parsed.data.comment},
        ${proposedGeometry ? JSON.stringify(proposedGeometry) : null}::jsonb,
        ${proposedGeometry || isGuestFeedback ? "pending" : "visible"}
      )
      RETURNING id::text, slug, year, state_name, user_name, rating, comment, proposed_geometry, status, created_at::text
    `) as FeedbackRow[];

    return Response.json({ feedback: toFeedback(rows[0], !!userId) }, { status: 201 });
  } catch (error) {
    console.error("[atlas/feedback POST]", error);
    return atlasApiErrorResponse(error, "Feedback хадгалахад алдаа гарлаа.");
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: "Admin эрх шаардлагатай." }, { status: 401 });

    const payload = await request.json().catch(() => null);
    const parsed = reviewSchema.safeParse(payload);
    if (!parsed.success) {
      return Response.json({ error: "Review өгөгдөл буруу байна." }, { status: 400 });
    }

    await ensureAtlasFeedbackTable();

    const rows = (await sql`
      SELECT id::text, slug, year, state_name, user_name, rating, comment, proposed_geometry, status, created_at::text
      FROM atlas_state_feedback
      WHERE id = ${parsed.data.id}
      LIMIT 1
    `) as FeedbackRow[];
    const feedback = rows[0];

    if (!feedback) return Response.json({ error: "Feedback олдсонгүй." }, { status: 404 });
    if (feedback.status !== "pending") {
      return Response.json({ error: "Шалгах feedback алга байна." }, { status: 400 });
    }

    if (parsed.data.action === "approve") {
      if (!feedback.proposed_geometry) {
        await sql`
          UPDATE atlas_state_feedback
          SET status = 'visible', reviewed_by = ${userId}, reviewed_at = NOW()
          WHERE id = ${parsed.data.id}
        `;

        return Response.json({ ok: true, status: "visible" });
      }

      const geometry = normalizePolygon(feedback.proposed_geometry);
      const feature = await updateStateGeometry(feedback.year, feedback.slug, geometry);
      if (!feature) return Response.json({ error: "Улсын бичлэг олдсонгүй." }, { status: 404 });

      await sql`
        UPDATE atlas_state_feedback
        SET status = 'approved', reviewed_by = ${userId}, reviewed_at = NOW()
        WHERE id = ${parsed.data.id}
      `;

      return Response.json({ ok: true, status: "approved", feature });
    }

    await sql`
      UPDATE atlas_state_feedback
      SET status = 'rejected', reviewed_by = ${userId}, reviewed_at = NOW()
      WHERE id = ${parsed.data.id}
    `;

    return Response.json({ ok: true, status: "rejected" });
  } catch (error) {
    console.error("[atlas/feedback PATCH]", error);
    return atlasApiErrorResponse(error, "Feedback шалгахад алдаа гарлаа.");
  }
}

async function ensureAtlasFeedbackTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS atlas_state_feedback (
      id BIGSERIAL PRIMARY KEY,
      clerk_user_id TEXT,
      slug TEXT NOT NULL,
      year INTEGER NOT NULL,
      state_name TEXT NOT NULL,
      user_name TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT NOT NULL,
      proposed_geometry JSONB,
      status TEXT NOT NULL DEFAULT 'visible',
      reviewed_by TEXT,
      reviewed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE atlas_state_feedback ADD COLUMN IF NOT EXISTS proposed_geometry JSONB`;
  await sql`ALTER TABLE atlas_state_feedback ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'visible'`;
  await sql`ALTER TABLE atlas_state_feedback ADD COLUMN IF NOT EXISTS reviewed_by TEXT`;
  await sql`ALTER TABLE atlas_state_feedback ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ`;
  await sql`CREATE INDEX IF NOT EXISTS atlas_state_feedback_state_idx ON atlas_state_feedback (slug, year, created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS atlas_state_feedback_status_idx ON atlas_state_feedback (status, created_at DESC)`;
}

type FeedbackRow = {
  id: string;
  slug: string;
  year: number;
  state_name: string;
  user_name: string;
  rating: number;
  comment: string;
  proposed_geometry?: GeoJSON.Polygon | null;
  status: string;
  created_at: string;
};

function toFeedback(row: FeedbackRow, includeProposedGeometry: boolean) {
  return {
    id: row.id,
    slug: row.slug,
    year: row.year,
    stateName: row.state_name,
    userName: row.user_name,
    rating: row.rating,
    comment: row.comment,
    status: row.status,
    proposedGeometry: includeProposedGeometry ? row.proposed_geometry : undefined,
    createdAt: row.created_at,
  };
}

function toPolygonGeometry(coordinates: Array<[number, number]>): GeoJSON.Polygon {
  const ring = normalizeClosedRing(coordinates);
  if (ring.length < 4) throw new Error("Invalid proposed geometry");
  return {
    type: "Polygon",
    coordinates: [ring],
  };
}

function normalizePolygon(value: GeoJSON.Polygon): GeoJSON.Polygon {
  if (value?.type !== "Polygon" || !Array.isArray(value.coordinates?.[0])) {
    throw new Error("Invalid stored proposed geometry");
  }
  return toPolygonGeometry(value.coordinates[0] as Array<[number, number]>);
}
