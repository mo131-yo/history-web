"use client";

import { T } from "./constants";
import type { SavedCharacterResult } from "./types";

export function AtlasCharacterSummary({
  result,
  onOpen,
}: {
  result: SavedCharacterResult;
  onOpen: () => void;
}) {
  return (
    <div
      className="pointer-events-auto absolute left-4 top-24 z-20 max-w-[320px] rounded-2xl p-4"
      style={{
        background: "rgba(8,5,2,0.90)",
        border: "1px solid rgba(201,164,93,0.32)",
        backdropFilter: "blur(16px)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
      }}
    >
      <div className="text-[9px] uppercase tracking-[0.32em]" style={{ color: T.textMuted }}>
        {result.isGuest ? "Зочны дүр" : "Миний дүр"}
      </div>
      <div className="mt-2 flex items-center gap-3">
        <div className="text-4xl">{result.icon}</div>
        <div>
          <div className="text-lg font-bold" style={{ color: T.amberBright }}>
            {result.roleName}
          </div>
          <div className="text-xs" style={{ color: T.textSub }}>
            {result.playerName}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="mt-4 w-full rounded-xl px-3 py-2 text-xs font-bold"
        style={{
          background: "rgba(201,164,93,0.12)",
          border: "1px solid rgba(201,164,93,0.25)",
          color: T.amberBright,
        }}
      >
        Дахин тоглож дүрээ солих
      </button>
    </div>
  );
}
