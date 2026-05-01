<div
          className="px-5 py-5 rounded-xl"
          style={{
            background: T.bg,
            border: `1px solid ${T.border}`,
            boxShadow: "0 12px 34px rgba(12,96,169,0.08)",
          }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-lg h-11 w-11 shrink-0"
                style={{ background: "rgba(12,96,169,0.08)", border: "1px solid rgba(12,96,169,0.24)" }}
              >
                <Trophy className="size-5" style={{ color: T.amber }} />
              </div>
              <div>
                <h1 className="text-xl font-bold leading-tight sm:text-2xl" style={{
  background: 'transparent',
  border: 'none',
  boxShadow: 'none',
  padding: 0
}}>
                  Quiz Leaderboard
                </h1>
                <p className="mt-1 text-xs" style={{ color: T.textMuted }}>
                  Бүх хэрэглэгчийн quiz онооны жагсаалт
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setReloadKey((v) => v + 1)}
                className="flex items-center h-10 gap-2 px-3 text-xs font-semibold tracking-widest uppercase rounded-lg"
                style={{ background: "rgba(12,96,169,0.05)", border: `1px solid ${T.border}`, color: T.textMuted }}
              >
                <RefreshCw className="size-4" />
                Refresh
              </button>
              <button
                type="button"
                onClick={onStartQuiz}
                className="h-10 px-4 text-xs font-semibold tracking-widest uppercase rounded-lg"
                style={{ background: T.amber, color: "#080502" }}
              >
                Шалгалт өгөх
              </button>
            </div>
          </div>

          {bestScore && (
            <div className="grid gap-3 mt-5 sm:grid-cols-3">
              <Stat label="Тэргүүлэгч" value={bestScore.userName} />
              <Stat label={activeCategory.statLabel} value={`${bestScore.score}/${bestScore.total}`} />
              <Stat label="Нийт тоглогч" value={String(scores.length)} />
            </div>
          )}
        </div>

        <div
          className="overflow-hidden rounded-xl"
          style={{ background: T.bg, border: `1px solid ${T.border}` }}
        >
          <div
            className="px-5 py-4"
            style={{ borderBottom: `1px solid ${T.border}` }}
          >
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: T.amber }}>
                Онооны самбар
              </p>
              <p className="text-xs" style={{ color: T.textMuted }}>
                {activeCategory.subtitle}
              </p>
            </div>

            <div className="grid gap-2 mt-4 md:grid-cols-3">
              {CATEGORIES.map((item) => {
                const active = category === item.id;
                const Icon = item.Icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategory(item.id)}
                    className="px-3 py-3 text-left transition rounded-lg hover:opacity-85"
                    style={{
                      background: active ? "rgba(12,96,169,0.10)" : "rgba(12,96,169,0.04)",
                      border: `1px solid ${active ? "rgba(12,96,169,0.35)" : T.border}`,
                      color: active ? T.amber : T.text,
                    }}
                  >
                    <span className="flex items-center gap-2 text-xs font-bold">
                      <Icon className="size-3.5" />
                      {item.label}
                    </span>
                    <span className="mt-1 block text-[10px]" style={{ color: T.textMuted }}>
                      {item.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {status === "loading" && (
            <div className="flex min-h-[420px] flex-col items-center justify-center gap-4">
              <Loader2 className="size-8 animate-spin" style={{ color: T.amber }} />
              <p className="text-xs uppercase tracking-[0.22em]" style={{ color: T.textMuted }}>
                Leaderboard ачаалж байна
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="flex min-h-[420px] items-center justify-center px-6 text-center">
              <p className="text-sm" style={{ color: "#f08080" }}>
                Leaderboard ачаалахад алдаа гарлаа.
              </p>
            </div>
          )}

          {status === "idle" && scores.length === 0 && (
            <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 px-6 text-center">
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
            <div>
              <div className="px-5 pt-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: T.amber }}>
                  {activeCategory.label}
                </p>
                <p className="mt-1 text-xs" style={{ color: T.textMuted }}>
                  {activeCategory.subtitle}
                </p>
              </div>

              <OlympicPodium scores={scores.slice(0, 3)} category={category} />

              {remainingScores.length > 0 && (
                <>
                  <div
                    className="grid grid-cols-[56px_1fr_90px_80px] gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] sm:grid-cols-[72px_1fr_110px_100px]"
                    style={{
                      color: T.textMuted,
                      borderTop: `1px solid ${T.border}`,
                      borderBottom: `1px solid ${T.border}`,
                    }}
                  >
                    <span>Rank</span>
                    <span>User</span>
                    <span>{activeCategory.tableMeta}</span>
                    <span className="text-right">Score</span>
                  </div>

                  {remainingScores.map((entry, index) => {
                    const rank = index + 4;
                    return (
                      <div
                        key={`${entry.userId}-${entry.createdAt}-${rank}`}
                        className="grid grid-cols-[56px_1fr_90px_80px] items-center gap-3 px-4 py-4 transition-colors hover:bg-white/5 sm:grid-cols-[72px_1fr_110px_100px]"
                        style={{
  background: '#ffffff',
  borderRadius: 12,
  marginBottom: 8,
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
}}
                      >
                        <span
                          className="text-sm font-bold tabular-nums"
                          style={{ color: T.textMuted }}
                        >
                          #{rank}
                        </span>
                        <span className="min-w-0">
                          <span
                            className="block text-sm font-semibold truncate"
                            style={{ color: T.text }}
                          >
                            {entry.userName}
                          </span>
                          <span
                            className="mt-0.5 block truncate text-[10px]"
                            style={{ color: T.textMuted }}
                          >
                            {new Date(entry.createdAt).toLocaleDateString()}
                          </span>
                        </span>
                        <span className="text-xs tabular-nums" style={{ color: T.textSub }}>
                          {formatLeaderboardMeta(entry, category)}
                        </span>
                        <span
                          className="text-sm font-bold text-right tabular-nums"
                          style={{ color: T.amber }}
                        >
                          {entry.score}/{entry.total}
                        </span>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>

        <div
          className="overflow-hidden rounded-xl"
          style={{ background: T.bg, border: `1px solid ${T.border}` }}
        >
          <div
            className="flex items-center justify-between gap-3 px-5 py-4"
            style={{ borderBottom: `1px solid ${T.border}` }}
          >
            <div className="flex items-center gap-2">
              <Clock3 className="size-4" style={{ color: T.amber }} />
              <div>
                <h2 className="text-sm font-bold" style={{ color: T.text }}>
                  Миний quiz history
                </h2>
                <p className="text-[10px]" style={{ color: T.textMuted }}>
                  Сүүлд өгсөн quiz-үүд болон DB-д хадгалсан оноо
                </p>
              </div>
            </div>
          </div>

          {historyStatus === "loading" && (
            <div className="flex items-center gap-2 px-5 py-5 text-xs" style={{ color: T.textSub }}>
              <Loader2 className="size-3 animate-spin" />
              History ачаалж байна
            </div>
          )}

          {historyStatus === "login" && (
            <p className="px-5 py-5 text-xs" style={{ color: T.textMuted }}>
              Нэвтэрсний дараа өөрийн quiz history энд харагдана.
            </p>
          )}

          {historyStatus === "error" && (
            <p className="px-5 py-5 text-xs" style={{ color: "#f08080" }}>
              Quiz history ачаалахад алдаа гарлаа.
            </p>
          )}

          {historyStatus === "idle" && attempts.length === 0 && (
            <p className="px-5 py-5 text-xs" style={{ color: T.textMuted }}>
              Одоогоор хадгалсан quiz history алга.
            </p>
          )}

          {historyStatus === "idle" && attempts.length > 0 && (
            <div className="divide-y" style={{ borderColor: T.border }}>
              {attempts.slice(0, 10).map((attempt) => (
                <div
                  key={attempt.id}
                  className="grid grid-cols-[1fr_72px_86px] items-center gap-3 px-5 py-3"
                  style={{ borderTop: `1px solid ${T.border}` }}
                >
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold truncate" style={{ color: T.text }}>
                      {attempt.mode === "knowledge"
                        ? "Танин мэдэхүйн quiz"
                        : `Level ${attempt.selectedLevel ?? attempt.selectedGrade ?? "-"}`}
                    </span>
                    <span className="mt-0.5 block truncate text-[10px]" style={{ color: T.textMuted }}>
                      {new Date(attempt.createdAt).toLocaleString()}
                    </span>
                  </span>
                  <span className="text-xs" style={{ color: attempt.passed ? "#86efac" : T.textMuted }}>
                    {attempt.passed ? "Давсан" : "Дутуу"}
                  </span>
                  <span className="text-sm font-bold text-right tabular-nums" style={{ color: T.amber }}>
                    {attempt.score}/{attempt.total}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>