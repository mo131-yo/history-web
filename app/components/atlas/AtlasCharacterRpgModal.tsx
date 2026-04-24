"use client";

import { useState } from "react";
import { T } from "./constants";
import { AtlasCharacterQuiz } from "./AtlasCharacterQuiz";
import { AtlasCharacterResult } from "./AtlasCharacterResult";
import {
  applyRoleScores,
  buildSavedCharacter,
  createBaseScores,
  isFinalQuestion,
  persistCharacterResult,
  resolveBestRole,
} from "./characterRpgLogic";
import type { SavedCharacterResult, RoleScore } from "./types";

export function AtlasCharacterRpgModal({
  userName,
  isGuest,
  onClose,
  onResult,
}: {
  userName: string;
  isGuest: boolean;
  onClose: () => void;
  onResult: (result: SavedCharacterResult) => void;
}) {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState(createBaseScores);
  const [result, setResult] = useState<ReturnType<typeof resolveBestRole> | null>(null);

  function choose(optionScores: RoleScore) {
    const nextScores = applyRoleScores(scores, optionScores);
    setScores(nextScores);

    if (isFinalQuestion(step)) {
      const bestRole = resolveBestRole(nextScores);
      const saved: SavedCharacterResult = buildSavedCharacter(userName, isGuest, bestRole);
      persistCharacterResult(saved);
      setResult(bestRole);
      onResult(saved);
      return;
    }

    setStep((s) => s + 1);
  }

  function restart() {
    setScores(createBaseScores());
    setStep(0);
    setResult(null);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "radial-gradient(circle at 50% 20%, rgba(201,164,93,0.18), transparent 35%), rgba(0,0,0,0.76)",
        backdropFilter: "blur(8px)",
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-[620px] overflow-hidden rounded-2xl"
        style={{
          background: "rgba(8,5,2,0.97)",
          border: "1px solid rgba(201,164,93,0.35)",
          boxShadow: "0 30px 90px rgba(0,0,0,0.75)",
          fontFamily: "Georgia, serif",
        }}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
          <div>
            <div className="text-[10px] uppercase tracking-[0.35em]" style={{ color: T.textMuted }}>
              {isGuest ? "Зочин тоглогч" : userName} · 1162–1300
            </div>
            <h2 className="mt-1 text-lg font-bold" style={{ color: T.amberBright }}>
              Чи Их Монголын үед хэн байх байсан бэ?
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-lg"
            style={{
              border: `1px solid ${T.borderMid}`,
              background: "rgba(255,255,255,0.03)",
              color: T.textSub,
            }}
          >
            ✕
          </button>
        </div>

        {!result ? <AtlasCharacterQuiz step={step} onChoose={choose} /> : <AtlasCharacterResult result={result} userName={userName} onClose={onClose} onRestart={restart} />}
      </div>
    </div>
  );
}
