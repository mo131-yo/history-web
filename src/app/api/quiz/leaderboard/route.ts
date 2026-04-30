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

const categorySchema = z.enum(["grade", "knowledge", "all"]).default("grade");

export async function GET(request: Request) {
  try {
    await ensureQuizAttemptTables();

    const { searchParams } = new URL(request.url);
    const category = categorySchema.parse(searchParams.get("category") ?? "grade");
    const rows =
      category === "all"
        ? await loadAllQuizLeaderboard()
        : await loadModeLeaderboard(category);

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

async function ensureQuizAttemptTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id BIGSERIAL PRIMARY KEY,
      clerk_user_id TEXT NOT NULL,
      quiz_id TEXT NOT NULL,
      score INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      passed BOOLEAN NOT NULL DEFAULT FALSE,
      answers JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS quiz_attempts_user_idx ON quiz_attempts (clerk_user_id, quiz_id, created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS quiz_attempts_rank_idx ON quiz_attempts (quiz_id, score DESC, total_questions ASC, created_at DESC)`;
}

async function loadModeLeaderboard(category: "grade" | "knowledge") {
  return (await sql`
    WITH base AS (
      SELECT
        clerk_user_id,
        COALESCE(NULLIF(answers->>'userName', ''), 'Зочин') AS user_name,
        quiz_id,
        score,
        total_questions AS total,
        answers->>'mode' AS mode,
        NULLIF(answers->>'selectedGrade', '')::integer AS selected_grade,
        NULLIF(answers->>'selectedLevel', '')::integer AS selected_level,
        created_at,
        COUNT(*) OVER (PARTITION BY clerk_user_id) AS attempts_count,
        FIRST_VALUE(score) OVER (
          PARTITION BY clerk_user_id
          ORDER BY created_at DESC
        ) AS last_score,
        FIRST_VALUE(total_questions) OVER (
          PARTITION BY clerk_user_id
          ORDER BY created_at DESC
        ) AS last_total
      FROM quiz_attempts
      WHERE
        CASE
          WHEN ${category} = 'knowledge'
            THEN quiz_id = 'history-knowledge' OR answers->>'mode' = 'knowledge'
          ELSE quiz_id LIKE 'history-level-%' OR quiz_id LIKE 'history-grade-%' OR answers->>'mode' = 'grade'
        END
    ),
    ranked AS (
      SELECT
        *,
        ROW_NUMBER() OVER (
          PARTITION BY clerk_user_id
          ORDER BY score DESC, total ASC, created_at DESC
        ) AS rank_in_user
      FROM base
    )
    SELECT
      clerk_user_id AS user_id,
      user_name,
      0 AS year,
      score,
      total,
      last_score,
      last_total,
      attempts_count,
      selected_grade,
      selected_level,
      quiz_id,
      created_at::text
    FROM ranked
    WHERE rank_in_user = 1
    ORDER BY score DESC, total ASC, created_at DESC
    LIMIT 25
  `) as QuizScoreRow[];
}

async function loadAllQuizLeaderboard() {
  return (await sql`
    WITH user_attempts AS (
      SELECT
        clerk_user_id,
        COALESCE(NULLIF(answers->>'userName', ''), 'Зочин') AS user_name,
        score,
        total_questions,
        NULLIF(answers->>'selectedGrade', '')::integer AS selected_grade,
        NULLIF(answers->>'selectedLevel', '')::integer AS selected_level,
        quiz_id,
        created_at,
        FIRST_VALUE(score) OVER (
          PARTITION BY clerk_user_id
          ORDER BY created_at DESC
        ) AS last_score,
        FIRST_VALUE(total_questions) OVER (
          PARTITION BY clerk_user_id
          ORDER BY created_at DESC
        ) AS last_total,
        FIRST_VALUE(quiz_id) OVER (
          PARTITION BY clerk_user_id
          ORDER BY created_at DESC
        ) AS last_quiz_id,
        FIRST_VALUE(NULLIF(answers->>'selectedGrade', '')::integer) OVER (
          PARTITION BY clerk_user_id
          ORDER BY created_at DESC
        ) AS last_selected_grade,
        FIRST_VALUE(NULLIF(answers->>'selectedLevel', '')::integer) OVER (
          PARTITION BY clerk_user_id
          ORDER BY created_at DESC
        ) AS last_selected_level
      FROM quiz_attempts
    )
    SELECT
      clerk_user_id AS user_id,
      (ARRAY_AGG(user_name ORDER BY created_at DESC))[1] AS user_name,
      0 AS year,
      SUM(score)::integer AS score,
      SUM(total_questions)::integer AS total,
      MAX(last_score)::integer AS last_score,
      MAX(last_total)::integer AS last_total,
      COUNT(*)::integer AS attempts_count,
      MAX(last_selected_grade)::integer AS selected_grade,
      MAX(last_selected_level)::integer AS selected_level,
      (ARRAY_AGG(last_quiz_id ORDER BY created_at DESC))[1] AS quiz_id,
      MAX(created_at)::text AS created_at
    FROM user_attempts
    GROUP BY clerk_user_id
    ORDER BY SUM(score) DESC, SUM(total_questions) ASC, MAX(created_at) DESC
    LIMIT 25
  `) as QuizScoreRow[];
}

type QuizScoreRow = {
  user_id: string;
  user_name: string;
  year: number;
  score: number;
  total: number;
  last_score?: number | null;
  last_total?: number | null;
  attempts_count?: number | null;
  selected_grade?: number | null;
  selected_level?: number | null;
  quiz_id?: string | null;
  created_at: string;
};

function toLeaderboardScore(row: QuizScoreRow) {
  return {
    userId: row.user_id,
    userName: row.user_name,
    year: row.year,
    score: row.score,
    total: row.total,
    lastScore: row.last_score ?? row.score,
    lastTotal: row.last_total ?? row.total,
    attemptsCount: row.attempts_count ?? 1,
    selectedGrade: row.selected_grade ?? null,
    selectedLevel: row.selected_level ?? null,
    quizId: row.quiz_id ?? null,
    createdAt: row.created_at,
  };
}
