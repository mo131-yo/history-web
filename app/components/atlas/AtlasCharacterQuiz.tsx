"use client";

import { RPG_QUESTIONS, T } from "./constants";
import type { RoleScore } from "./types";

export function AtlasCharacterQuiz({
  step,
  onChoose,
}: {
  step: number;
  onChoose: (scores: RoleScore) => void;
}) {
  const question = RPG_QUESTIONS[step];

  return (
    <div className="p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <span className="text-[10px] uppercase tracking-[0.25em]" style={{ color: T.textMuted }}>
          Асуулт {step + 1} / {RPG_QUESTIONS.length}
        </span>
        <div className="h-2 w-40 overflow-hidden rounded-full" style={{ background: "#1a1208" }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${((step + 1) / RPG_QUESTIONS.length) * 100}%`,
              background: `linear-gradient(90deg, ${T.amberDim}, ${T.amberBright})`,
            }}
          />
        </div>
      </div>

      <h3 className="mb-5 text-xl font-bold leading-snug" style={{ color: T.text }}>
        {question.question}
      </h3>

      <div className="grid gap-3">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onChoose(option.scores)}
            className="rounded-xl px-4 py-4 text-left transition-all hover:scale-[1.01]"
            style={{
              background: "linear-gradient(135deg, rgba(201,164,93,0.08), rgba(255,255,255,0.025))",
              border: `1px solid ${T.borderMid}`,
              color: T.text,
              fontFamily: "Georgia, serif",
            }}
          >
            <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px]" style={{ background: "rgba(201,164,93,0.14)", color: T.amberBright, border: "1px solid rgba(201,164,93,0.25)" }}>
              {idx + 1}
            </span>
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
