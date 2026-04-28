import { z } from "zod";
import { sql } from "@/lib/atlas-db-core";
import { atlasApiErrorResponse } from "../../atlas/atlasApiErrors";

const scoreSchema = z.object({
  userId: z.string().trim().min(1).max(120).default("guest"),
  userName: z.string().trim().min(1).max(120).default("Зочин"),
  year: z.number().int().min(1100).max(1400),
  score: z.number().int().min(0),
  total: z.number().int().min(1).max(50),
});

export async function GET() {
  try {
    await ensureQuizScoresTable();

    const rows = (await sql`
      SELECT user_id, user_name, year, score, total, created_at::text
      FROM quiz_scores
      ORDER BY score DESC, total ASC, created_at DESC
      LIMIT 25
    `) as QuizScoreRow[];

    return Response.json({ scores: rows.map(toLeaderboardScore) });
  } catch (err) {
    console.error("[quiz/leaderboard GET]", err);
    return atlasApiErrorResponse(err, "Leaderboard ачаалахад серверийн алдаа гарлаа.");
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null);
    const parsed = scoreSchema.safeParse(payload);
    if (!parsed.success) {
      return Response.json({ error: "Онооны өгөгдөл буруу байна.", details: parsed.error.flatten() }, { status: 400 });
    }

    await ensureQuizScoresTable();

    const rows = (await sql`
      INSERT INTO quiz_scores (user_id, user_name, year, score, total)
      VALUES (${parsed.data.userId}, ${parsed.data.userName}, ${parsed.data.year}, ${parsed.data.score}, ${parsed.data.total})
      RETURNING user_id, user_name, year, score, total, created_at::text
    `) as QuizScoreRow[];

    return Response.json({ score: toLeaderboardScore(rows[0]) }, { status: 201 });
  } catch (err) {
    console.error("[quiz/leaderboard POST]", err);
    return atlasApiErrorResponse(err, "Оноо хадгалахад серверийн алдаа гарлаа.");
  }
}

async function ensureQuizScoresTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS quiz_scores (
      id BIGSERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      year INTEGER NOT NULL,
      score INTEGER NOT NULL,
      total INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS quiz_scores_rank_idx ON quiz_scores (score DESC, total ASC, created_at DESC)`;
}

type QuizScoreRow = {
  user_id: string;
  user_name: string;
  year: number;
  score: number;
  total: number;
  created_at: string;
};

function toLeaderboardScore(row: QuizScoreRow) {
  return {
    userId: row.user_id,
    userName: row.user_name,
    year: row.year,
    score: row.score,
    total: row.total,
    createdAt: row.created_at,
  };
}
