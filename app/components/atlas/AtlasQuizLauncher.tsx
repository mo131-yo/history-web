"use client";

import { T } from "./constants";

export function AtlasQuizLauncher({
  enabled,
  hasCharacter,
  onOpen,
}: {
  enabled: boolean;
  hasCharacter: boolean;
  onOpen: () => void;
}) {
  return (
    <div
      className={`pointer-events-auto absolute left-4 z-20 w-[280px] rounded-2xl p-4 ${hasCharacter ? "top-[15.5rem]" : "top-24"}`}
      style={{
        background:
          "linear-gradient(145deg, rgba(8,5,2,0.93), rgba(22,14,6,0.90))",
        border: "1px solid rgba(201,164,93,0.3)",
        backdropFilter: "blur(16px)",
        boxShadow: "0 14px 42px rgba(0,0,0,0.46)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
          style={{
            background:
              "radial-gradient(circle at 35% 30%, rgba(240,192,96,0.22), rgba(201,164,93,0.08) 60%, transparent 100%)",
            border: "1px solid rgba(201,164,93,0.2)",
            color: T.amberBright,
            fontSize: 20,
          }}
        >
          🧠
        </div>
        <div className="min-w-0 flex-1">
          <div
            className="text-[9px] uppercase tracking-[0.32em]"
            style={{ color: T.textMuted }}
          >
            Түүхэн сорил
          </div>
          <div
            className="mt-1 text-base font-bold leading-tight"
            style={{ color: T.amberBright }}
          >
            Газрын зурагтай интерактив quiz
          </div>
          <p className="mt-1.5 text-xs leading-5" style={{ color: T.textSub }}>
            Тухайн оны улсууд, газар зүй, түүхэн холбоосоор шууд сорил өгнө.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpen}
        disabled={!enabled}
        className="mt-4 w-full rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-[0.18em] disabled:cursor-not-allowed disabled:opacity-45"
        style={{
          background:
            "linear-gradient(135deg, rgba(201,164,93,0.22), rgba(139,108,53,0.1))",
          border: "1px solid rgba(201,164,93,0.34)",
          color: T.amberBright,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        Сорил эхлүүлэх
      </button>
    </div>
  );
}
