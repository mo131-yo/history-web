"use client";

import { sidebarTheme as T } from "./sidebarTheme";

export function AtlasHeader({
  adminMode,
  collectionCount,
}: {
  adminMode: boolean;
  collectionCount: number | null;
}) {
  return (
    <div className="pointer-events-none relative z-20 flex flex-col gap-3 px-3 pt-3 sm:px-4 lg:flex-row lg:items-start lg:justify-between">
      <div
        className="pointer-events-auto flex w-full items-center gap-3 rounded-xl py-2.5 pl-3 pr-4 lg:w-auto"
        style={{
          background: T.bg,
          border: `1px solid ${T.border}`,
          backdropFilter: "blur(16px)",
          boxShadow: "0 12px 32px rgba(12,96,169,0.10), inset 0 1px 0 rgba(255,255,255,0.85)",
          fontFamily: "var(--font-inter), Arial, sans-serif",
        }}
      >
        <div className="relative flex shrink-0 items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: "rgba(12,96,169,0.08)", border: "1px solid rgba(12,96,169,0.22)" }}>
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle at 40% 35%, rgba(12,96,169,0.16), transparent 70%)",
            }}
          />
          <svg width="20" height="20" viewBox="0 0 20 20">
            <polygon
              points="10,1 12.2,7 18.5,7 13.4,11 15.4,17.5 10,14 4.6,17.5 6.6,11 1.5,7 7.8,7"
              fill={T.amber}
              opacity="0.9"
            />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: T.amber }}>
            Монгол Атлас
          </p>
          <p className="mt-0.5 text-[10px]" style={{ color: T.textMuted }}>
            Түүхэн газрын зураг
          </p>
        </div>
      </div>

      <div className="pointer-events-auto flex w-full flex-wrap items-center justify-start gap-2 lg:w-auto lg:justify-end">
        {adminMode && (
          <div
            className="flex min-h-10 items-center gap-1.5 rounded-xl px-3 py-2 text-[10px] uppercase tracking-widest"
            style={{
              background: T.bg,
              border: "1px solid rgba(12,96,169,0.30)",
              color: T.amber,
              backdropFilter: "blur(16px)",
              boxShadow: "0 10px 28px rgba(12,96,169,0.08)",
              fontFamily: "var(--font-inter), Arial, sans-serif",
              letterSpacing: "0.1em",
            }}
          >
            <svg width="9" height="9" viewBox="0 0 10 10">
              <polygon
                points="5,0 6.2,3.5 10,3.5 7,5.7 8,9.5 5,7.5 2,9.5 3,5.7 0,3.5 3.8,3.5"
                fill={T.amber}
              />
            </svg>
            Хаан · Засах эрхтэй
          </div>
        )}

        {collectionCount !== null && (
          <div
            className="min-h-10 rounded-xl px-3 py-2 text-[10px] uppercase tracking-widest tabular-nums"
            style={{
              background: T.bg,
              border: `1px solid ${T.border}`,
              color: T.textMuted,
              backdropFilter: "blur(16px)",
              boxShadow: "0 10px 28px rgba(12,96,169,0.08)",
              fontFamily: "var(--font-inter), Arial, sans-serif",
            }}
          >
            {collectionCount} улс
          </div>
        )}
      </div>
    </div>
  );
}
