"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Medal, RefreshCw, Trophy } from "lucide-react";
import { T } from "./constants";

type LeaderboardScore = {
  userId: string;
  userName: string;
  year: number;
  score: number;
  total: number;
  createdAt: string;
};

export function QuizLeaderboardPage({
  version,
  onStartQuiz,
}: {
  version: number;
  onStartQuiz: () => void;
}) {
  const [scores, setScores] = useState<LeaderboardScore[]>([]);
  const [status, setStatus] = useState<"loading" | "idle" | "error">("loading");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");

    fetch("/api/quiz/leaderboard", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Leaderboard failed");
        return response.json() as Promise<{ scores?: LeaderboardScore[] }>;
      })
      .then((data) => {
        setScores(data.scores ?? []);
        setStatus("idle");
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setScores([]);
        setStatus("error");
      });

    return () => controller.abort();
  }, [reloadKey, version]);

  const bestScore = useMemo(() => scores[0], [scores]);

  return (
    <div className="relative flex h-full min-h-screen flex-col overflow-y-auto px-4 py-5 sm:px-6 lg:min-h-0 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5">
        <div
          className="rounded-xl px-5 py-5"
          style={{
            background: "rgba(8,5,2,0.90)",
            border: `1px solid ${T.border}`,
            boxShadow: "0 8px 42px rgba(0,0,0,0.45)",
          }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
                style={{ background: "rgba(201,164,93,0.14)", border: "1px solid rgba(201,164,93,0.38)" }}
              >
                <Trophy className="size-5" style={{ color: T.amber }} />
              </div>
              <div>
                <h1 className="text-xl font-bold leading-tight sm:text-2xl" style={{ color: T.amber }}>
                  Quiz Leaderboard
                </h1>
                <p className="mt-1 text-xs" style={{ color: T.textMuted }}>
                  Бүх хэрэглэгчийн сорилын оноо
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setReloadKey((value) => value + 1)}
                className="flex h-10 items-center gap-2 rounded-lg px-3 text-xs font-semibold uppercase tracking-widest"
                style={{ background: "rgba(15,23,42,0.5)", border: `1px solid ${T.border}`, color: T.textSub }}
              >
                <RefreshCw className="size-4" />
                Refresh
              </button>
              <button
                type="button"
                onClick={onStartQuiz}
                className="h-10 rounded-lg px-4 text-xs font-semibold uppercase tracking-widest"
                style={{ background: T.amber, color: "#080502" }}
              >
                Шалгалт өгөх
              </button>
            </div>
          </div>

          {bestScore && (
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Stat label="Тэргүүлэгч" value={bestScore.userName} />
              <Stat label="Шилдэг оноо" value={`${bestScore.score}/${bestScore.total}`} />
            </div>
          )}
        </div>

        <div
          className="min-h-105 overflow-hidden rounded-xl"
          style={{ background: "rgba(8,5,2,0.82)", border: `1px solid ${T.border}` }}
        >
          {status === "loading" && (
            <div className="flex min-h-105 flex-col items-center justify-center gap-4">
              <Loader2 className="size-8 animate-spin" style={{ color: T.amber }} />
              <p className="text-xs uppercase tracking-[0.22em]" style={{ color: T.textMuted }}>
                Leaderboard ачаалж байна
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="flex min-h-105 items-center justify-center px-6 text-center">
              <p className="text-sm" style={{ color: "#f08080" }}>
                Leaderboard ачаалахад алдаа гарлаа.
              </p>
            </div>
          )}

          {status === "idle" && scores.length === 0 && (
            <div className="flex min-h-105 flex-col items-center justify-center gap-3 px-6 text-center">
              <Medal className="size-10" style={{ color: T.textMuted }} />
              <p className="text-sm" style={{ color: T.text }}>
                Одоогоор оноо алга.
              </p>
              <p className="max-w-sm text-xs leading-5" style={{ color: T.textMuted }}>
                Эхний quiz-ээ өгсний дараа таны оноо энд бүх хэрэглэгчидтэй хамт харагдана.
              </p>
            </div>
          )}

          {status === "idle" && scores.length > 0 && (
            <div className="divide-y" style={{ borderColor: T.border }}>
              <div
                className="grid grid-cols-[56px_1fr_90px_80px] gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] sm:grid-cols-[72px_1fr_110px_100px]"
                style={{ color: T.textMuted, borderBottom: `1px solid ${T.border}` }}
              >
                <span>Rank</span>
                <span>User</span>
                <span>Year</span>
                <span className="text-right">Score</span>
              </div>
              {scores.map((entry, index) => (
                <div
                  key={`${entry.userId}-${entry.createdAt}-${index}`}
                  className="grid grid-cols-[56px_1fr_90px_80px] items-center gap-3 px-4 py-4 sm:grid-cols-[72px_1fr_110px_100px]"
                  style={{ background: index < 3 ? "rgba(201,164,93,0.08)" : "transparent", borderBottom: `1px solid ${T.border}` }}
                >
                  <span className="text-sm font-bold tabular-nums" style={{ color: index < 3 ? T.amber : T.textMuted }}>
                    #{index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold" style={{ color: T.text }}>
                      {entry.userName}
                    </span>
                    <span className="mt-0.5 block truncate text-[10px]" style={{ color: T.textMuted }}>
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </span>
                  </span>
                  <span className="text-xs tabular-nums" style={{ color: T.textSub }}>
                    {entry.year} он
                  </span>
                  <span className="text-right text-sm font-bold tabular-nums" style={{ color: T.amber }}>
                    {entry.score}/{entry.total}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg px-4 py-3" style={{ background: "rgba(15,23,42,0.42)", border: `1px solid ${T.border}` }}>
      <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: T.textMuted }}>{label}</p>
      <p className="mt-1 truncate text-sm font-bold" style={{ color: T.text }}>{value}</p>
    </div>
  );
}
