'use client';

import { useState } from 'react';
import { sidebarTheme as T } from './sidebarTheme';
import { AtlasCharacterQuiz } from './AtlasCharacterQuiz';
import { AtlasCharacterResult } from './AtlasCharacterResult';
import {
  applyRoleScores,
  buildSavedCharacter,
  createBaseScores,
  isFinalQuestion,
  persistCharacterResult,
  resolveBestRole,
} from './characterRpgLogic';
import { RoleScore, SavedCharacterResult } from './types';

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
  const [result, setResult] = useState<ReturnType<
    typeof resolveBestRole
  > | null>(null);

  function choose(optionScores: RoleScore) {
    const nextScores = applyRoleScores(scores, optionScores);
    setScores(nextScores);

    if (isFinalQuestion(step)) {
      const bestRole = resolveBestRole(nextScores);
      const saved: SavedCharacterResult = buildSavedCharacter(
        userName,
        isGuest,
        bestRole,
      );
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
        background:
          'radial-gradient(circle at 50% 20%, rgba(12,96,169,0.14), transparent 35%), rgba(252,252,252,0.82)',
        backdropFilter: 'blur(8px)',
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-[620px] overflow-hidden rounded-2xl"
        style={{
          background: T.bg,
          border: `1px solid ${T.border}`,
          boxShadow: '0 30px 80px rgba(12,96,169,0.16)',
          fontFamily: 'var(--font-inter), Arial, sans-serif',
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: `1px solid ${T.border}` }}
        >
          <div>
            <div
              className="text-[10px] uppercase tracking-[0.35em]"
              style={{ color: T.textMuted }}
            >
              {isGuest ? 'Зочин тоглогч' : userName} · 1162–1300
            </div>
            <h2
              className="mt-1 text-lg font-bold"
              style={{ color: T.amber }}
            >
              Чи Их Монголын үед хэн байх байсан бэ?
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg h-9 w-9"
            style={{
              border: `1px solid ${T.border}`,
              background: 'rgba(12,96,169,0.05)',
              color: T.textSub,
            }}
          >
            ✕
          </button>
        </div>

        {!result ? (
          <AtlasCharacterQuiz step={step} onChoose={choose} />
        ) : (
          <AtlasCharacterResult
            result={result}
            userName={userName}
            onClose={onClose}
            onRestart={restart}
          />
        )}
      </div>
    </div>
  );
}
