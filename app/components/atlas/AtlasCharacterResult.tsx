"use client";

import { T } from "./constants";
import type { CharacterRole } from "./types";

export function AtlasCharacterResult({
  result,
  userName,
  onClose,
  onRestart,
}: {
  result: CharacterRole;
  userName: string;
  onClose: () => void;
  onRestart: () => void;
}) {
  return (
    <div className="p-6 text-center">
      <div className="mb-3 text-6xl">{result.icon}</div>
      <div className="text-[10px] uppercase tracking-[0.35em]" style={{ color: T.textMuted }}>
        {userName}-ийн дүр
      </div>
      <h3 className="mt-2 text-3xl font-bold" style={{ color: T.amberBright }}>
        {result.name}
      </h3>
      <div className="mt-1 text-sm" style={{ color: T.textSub }}>
        {result.subtitle}
      </div>
      <p className="mx-auto mt-5 max-w-[480px] text-sm leading-7" style={{ color: T.text }}>
        {result.description}
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {result.strengths.map((strength) => (
          <span key={strength} className="rounded-full px-3 py-1 text-xs" style={{ background: "rgba(201,164,93,0.12)", border: "1px solid rgba(201,164,93,0.25)", color: T.amberBright }}>
            {strength}
          </span>
        ))}
      </div>
      <div className="mt-7 grid grid-cols-2 gap-3">
        <button type="button" onClick={onRestart} className="rounded-xl px-4 py-3 text-sm font-bold" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${T.borderMid}`, color: T.text }}>
          Дахин тоглох
        </button>
        <button type="button" onClick={onClose} className="rounded-xl px-4 py-3 text-sm font-bold" style={{ background: `linear-gradient(135deg, ${T.amber}, ${T.amberDim})`, color: "#120b03", border: "none" }}>
          Атлас руу буцах
        </button>
      </div>
    </div>
  );
}
