'use client';

import { useState, useEffect } from 'react';
import { sidebarTheme as T } from './sidebarTheme';
import { AtlasCharacterQuiz } from './AtlasCharacterQuiz';
import { AtlasCharacterResult } from './AtlasCharacterResult';
import { X, Sparkles, ShieldCheck } from 'lucide-react';
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
  const [result, setResult] = useState<ReturnType<typeof resolveBestRole> | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  if (!isMounted) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
   
      <div 
        className="absolute inset-0 transition-opacity duration-500 bg-slate-900/40 backdrop-blur-md"
        onClick={onClose}
      />


      <div
        className="relative w-full max-w-[680px] overflow-hidden rounded-[32px] bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] animate-in fade-in zoom-in-95 duration-300"
        style={{
          fontFamily: 'var(--font-inter), Arial, sans-serif',
        }}
      >

        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-amber-400 to-red-500" />

      
        <div className="relative px-8 pt-10 pb-6 border-b border-slate-50 bg-gradient-to-b from-slate-50/50 to-transparent">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100/50">
                  <Sparkles size={12} className="text-blue-600" />
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">
                    {isGuest ? 'Зочин тоглогч' : userName}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                  1162–1300 Oн
                </span>
              </div>
              
              <h2 className="text-2xl font-black leading-tight sm:text-3xl text-slate-800">
                Их Монгол Улсад <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-500">
                   чи хэн байх байсан бэ?
                </span>
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-2 transition-all rounded-2xl bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 active:scale-90"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>
          
          
          {!result && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-100">
              <div 
                className="h-full transition-all duration-500 ease-out bg-blue-600"
                style={{ width: `${((step + 1) / 10) * 100}%` }} 
              />
            </div>
          )}
        </div>

      
        <div className="relative p-8 min-h-[400px] max-h-[70vh] overflow-y-auto custom-scrollbar">
          {!result ? (
            <div className="duration-500 animate-in slide-in-from-bottom-4">
              <AtlasCharacterQuiz step={step} onChoose={choose} />
            </div>
          ) : (
            <div className="duration-700 animate-in zoom-in-95">
              <AtlasCharacterResult
                result={result}
                userName={userName}
                onClose={onClose}
                onRestart={restart}
              />
            </div>
          )}
        </div>

       
        <div className="flex items-center justify-between px-8 py-4 bg-slate-50/80">
          <div className="flex items-center gap-2 grayscale opacity-40">
             <ShieldCheck size={16} className="text-slate-600" />
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Mongol • Atlas</span>
          </div>
        
        </div>
      </div>
    </div>
  );
}