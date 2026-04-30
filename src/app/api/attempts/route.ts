import { auth } from '@clerk/nextjs/server';
import { sql } from '../../../lib/db';

type QuizAnswer = {
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
};

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { error: 'Нэвтэрсэн хэрэглэгч олдсонгүй.' },
        { status: 401 },
      );
    }

    await ensureQuizAttemptTables();

    const rows = (await sql`
      SELECT
        id,
        quiz_id,
        score,
        total_questions,
        passed,
        answers,
        created_at::text
      FROM quiz_attempts
      WHERE clerk_user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 30
    `) as QuizAttemptRow[];

    return Response.json({ attempts: rows.map(toQuizAttemptHistory) });
  } catch (error: any) {
    console.error('Load quiz attempts error:', error);

    return Response.json(
      { error: error.message || 'Quiz history ачаалахад алдаа гарлаа.' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
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
      userName,
      period,
      mode,
      selectedGrade,
      selectedLevel,
      score,
      totalQuestions,
      passed,
      answers = [],
    }: {
      quizId: string;
      userName?: string;
      period?: string;
      mode?: string;
      selectedGrade?: number | null;
      selectedLevel?: number | null;
      score: number;
      totalQuestions: number;
      passed: boolean;
      answers?: QuizAnswer[];
    } = body;

    if (
      !quizId ||
      typeof score !== 'number' ||
      typeof totalQuestions !== 'number'
    ) {
      return Response.json(
        { error: 'quizId, score, totalQuestions шаардлагатай.' },
        { status: 400 },
      );
    }

    await ensureQuizAttemptTables();

    const storedAnswers = {
      userName: typeof userName === 'string' ? userName : null,
      period: typeof period === 'string' ? period : '1162-1300',
      mode: typeof mode === 'string' ? mode : null,
      selectedGrade: typeof selectedGrade === 'number' ? selectedGrade : null,
      selectedLevel: typeof selectedLevel === 'number' ? selectedLevel : null,
      answers,
    };

    await sql`
      INSERT INTO quiz_attempts (
        clerk_user_id,
        quiz_id,
        score,
        total_questions,
        passed,
        answers
      )
      VALUES (
        ${userId},
        ${quizId},
        ${score},
        ${totalQuestions},
        ${passed},
        ${JSON.stringify(storedAnswers)}::jsonb
      )
    `;

    const progress = await sql`
      INSERT INTO quiz_progress (
        clerk_user_id,
        quiz_id,
        best_score,
        last_score,
        total_questions,
        last_total_questions,
        passed,
        completed_count,
        last_completed_at,
        updated_at
      )
      VALUES (
        ${userId},
        ${quizId},
        ${score},
        ${score},
        ${totalQuestions},
        ${totalQuestions},
        ${passed},
        1,
        NOW(),
        NOW()
      )
      ON CONFLICT (clerk_user_id, quiz_id)
      DO UPDATE SET
        best_score = GREATEST(quiz_progress.best_score, EXCLUDED.best_score),
        last_score = EXCLUDED.last_score,
        total_questions = EXCLUDED.total_questions,
        last_total_questions = EXCLUDED.last_total_questions,
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
  } catch (error: any) {
    console.error('Save quiz attempt error:', error);

    return Response.json(
      { error: error.message || 'Quiz хадгалахад алдаа гарлаа.' },
      { status: 500 },
    );
  }
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

  await sql`
    CREATE TABLE IF NOT EXISTS quiz_progress (
      id BIGSERIAL PRIMARY KEY,
      clerk_user_id TEXT NOT NULL,
      quiz_id TEXT NOT NULL,
      best_score INTEGER NOT NULL DEFAULT 0,
      last_score INTEGER NOT NULL DEFAULT 0,
      total_questions INTEGER NOT NULL DEFAULT 0,
      last_total_questions INTEGER NOT NULL DEFAULT 0,
      passed BOOLEAN NOT NULL DEFAULT FALSE,
      completed_count INTEGER NOT NULL DEFAULT 0,
      last_completed_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (clerk_user_id, quiz_id)
    )
  `;

  await sql`ALTER TABLE quiz_progress ADD COLUMN IF NOT EXISTS last_score INTEGER NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE quiz_progress ADD COLUMN IF NOT EXISTS last_total_questions INTEGER NOT NULL DEFAULT 0`;
  await sql`CREATE INDEX IF NOT EXISTS quiz_attempts_user_idx ON quiz_attempts (clerk_user_id, quiz_id, created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS quiz_attempts_rank_idx ON quiz_attempts (quiz_id, score DESC, total_questions ASC, created_at DESC)`;
}

type QuizAttemptRow = {
  id: string | number;
  quiz_id: string;
  score: number;
  total_questions: number;
  passed: boolean;
  answers: {
    userName?: string | null;
    period?: string | null;
    mode?: string | null;
    selectedGrade?: number | null;
    selectedLevel?: number | null;
    answers?: QuizAnswer[];
  } | null;
  created_at: string;
};

function toQuizAttemptHistory(row: QuizAttemptRow) {
  const mode = row.answers?.mode === 'knowledge' ? 'knowledge' : 'grade';
  const selectedGrade =
    typeof row.answers?.selectedGrade === 'number' ? row.answers.selectedGrade : null;
  const selectedLevel =
    typeof row.answers?.selectedLevel === 'number' ? row.answers.selectedLevel : null;

  return {
    id: String(row.id),
    quizId: row.quiz_id,
    mode,
    selectedGrade,
    selectedLevel,
    period: row.answers?.period ?? '1162-1300',
    score: row.score,
    total: row.total_questions,
    passed: row.passed,
    createdAt: row.created_at,
  };
}
