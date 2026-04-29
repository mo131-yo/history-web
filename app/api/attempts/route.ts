import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/atlas-db-core';
import { atlasApiErrorResponse } from '../atlas/atlasApiErrors';

type QuizAnswer = {
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
};

export async function POST(req: Request) {
  try {
    await ensureQuizAttemptTables();

    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { error: 'Нэвтэрсэн хэрэглэгч олдсонгүй.' },
        { status: 401 },
      );
    }

    const body = await req.json();

    const {
      quizId,
      userName = 'Зочин',
      year = null,
      score,
      totalQuestions,
      passed,
      answers = [],
    }: {
      quizId: string;
      userName?: string;
      year?: number | null;
      score: number;
      totalQuestions: number;
      passed: boolean;
      answers?: QuizAnswer[];
    } = body;

    if (
      !quizId ||
      typeof score !== 'number' ||
      typeof totalQuestions !== 'number' ||
      typeof passed !== 'boolean'
    ) {
      return Response.json(
        { error: 'quizId, score, totalQuestions шаардлагатай.' },
        { status: 400 },
      );
    }

    await sql`
      INSERT INTO quiz_attempts (
        clerk_user_id,
        user_name,
        quiz_id,
        year,
        score,
        total_questions,
        passed,
        answers
      )
      VALUES (
        ${userId},
        ${userName},
        ${quizId},
        ${year},
        ${score},
        ${totalQuestions},
        ${passed},
        ${JSON.stringify(answers)}::jsonb
      )
    `;

    const progress = await sql`
      INSERT INTO quiz_progress (
        clerk_user_id,
        user_name,
        quiz_id,
        year,
        best_score,
        total_questions,
        passed,
        completed_count,
        last_completed_at,
        updated_at
      )
      VALUES (
        ${userId},
        ${userName},
        ${quizId},
        ${year},
        ${score},
        ${totalQuestions},
        ${passed},
        1,
        NOW(),
        NOW()
      )
      ON CONFLICT (clerk_user_id, quiz_id)
      DO UPDATE SET
        user_name = EXCLUDED.user_name,
        year = EXCLUDED.year,
        best_score = GREATEST(quiz_progress.best_score, EXCLUDED.best_score),
        total_questions = EXCLUDED.total_questions,
        passed = quiz_progress.passed OR EXCLUDED.passed,
        completed_count = quiz_progress.completed_count + 1,
        last_completed_at = NOW(),
        updated_at = NOW()
      RETURNING *
    `;

    return Response.json({
      ok: true,
      progress: progress[0],
    });
  } catch (error) {
    console.error('Save quiz attempt error:', error);

    return atlasApiErrorResponse(error, 'Quiz хадгалахад алдаа гарлаа.');
  }
}

export async function GET() {
  try {
    await ensureQuizAttemptTables();

    const rows = (await sql`
      SELECT
        clerk_user_id,
        user_name,
        quiz_id,
        year,
        best_score,
        total_questions,
        completed_count,
        last_completed_at::text
      FROM quiz_progress
      ORDER BY best_score DESC, total_questions ASC, completed_count DESC, last_completed_at DESC
      LIMIT 25
    `) as QuizProgressRow[];

    return Response.json({ scores: rows.map(toLeaderboardScore) });
  } catch (error) {
    console.error('Quiz attempts leaderboard error:', error);
    return atlasApiErrorResponse(error, 'Leaderboard ачаалахад серверийн алдаа гарлаа.');
  }
}

async function ensureQuizAttemptTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id BIGSERIAL PRIMARY KEY,
      clerk_user_id TEXT NOT NULL,
      user_name TEXT NOT NULL DEFAULT 'Зочин',
      quiz_id TEXT NOT NULL,
      year INTEGER,
      score INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      passed BOOLEAN NOT NULL,
      answers JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS quiz_progress (
      id BIGSERIAL PRIMARY KEY,
      clerk_user_id TEXT NOT NULL,
      user_name TEXT NOT NULL DEFAULT 'Зочин',
      quiz_id TEXT NOT NULL,
      year INTEGER,
      best_score INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      passed BOOLEAN NOT NULL,
      completed_count INTEGER NOT NULL DEFAULT 0,
      last_completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (clerk_user_id, quiz_id)
    )
  `;

  await sql`ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS user_name TEXT NOT NULL DEFAULT 'Зочин'`;
  await sql`ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS year INTEGER`;
  await sql`ALTER TABLE quiz_progress ADD COLUMN IF NOT EXISTS user_name TEXT NOT NULL DEFAULT 'Зочин'`;
  await sql`ALTER TABLE quiz_progress ADD COLUMN IF NOT EXISTS year INTEGER`;
  await sql`CREATE INDEX IF NOT EXISTS quiz_progress_leaderboard_idx ON quiz_progress (best_score DESC, total_questions ASC, completed_count DESC, last_completed_at DESC)`;
}

type QuizProgressRow = {
  clerk_user_id: string;
  user_name: string;
  quiz_id: string;
  year: number | null;
  best_score: number;
  total_questions: number;
  completed_count: number;
  last_completed_at: string;
};

function toLeaderboardScore(row: QuizProgressRow) {
  return {
    userId: row.clerk_user_id,
    userName: row.user_name || row.clerk_user_id,
    quizId: row.quiz_id,
    year: row.year,
    score: row.best_score,
    total: row.total_questions,
    completedCount: row.completed_count,
    createdAt: row.last_completed_at,
  };
}
