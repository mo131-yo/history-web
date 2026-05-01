"use client";

import React from "react";
import { LeaderboardScore, LeaderboardCategory } from "./QuizLeaderboardPage";
import { CrownIcon } from "./CrownIcon";
import { MedalIcon } from "./Medalicon";

type PodiumConfig = {
  dataIdx: number;
  order: number;
  pedHeight: number;
  label: string;
  glowColor: string;
  gradient: string;
  borderColor: string;
  textColor: string;
};

const PODIUM_CONFIGS: PodiumConfig[] = [
  {
    dataIdx: 1,
    order: 1,
    pedHeight: 100,
    label: "Мөнгөн хүрээ",
    glowColor: "shadow-[0_0_30px_rgba(148,163,184,0.3)]",
    gradient: "from-slate-200 via-slate-300 to-slate-400",
    borderColor: "border-slate-300/50",
    textColor: "text-slate-600",
  },
  {
    dataIdx: 0,
    order: 2,
    pedHeight: 150,
    label: "Алтан цом",
    glowColor: "shadow-[0_0_50px_rgba(234,179,8,0.4)]",
    gradient: "from-amber-200 via-yellow-400 to-yellow-600",
    borderColor: "border-yellow-300/50",
    textColor: "text-amber-700",
  },
  {
    dataIdx: 2,
    order: 3,
    pedHeight: 80,
    label: "Хүрэл медаль",
    glowColor: "shadow-[0_0_30px_rgba(180,83,9,0.2)]",
    gradient: "from-orange-200 via-orange-400 to-orange-700",
    borderColor: "border-orange-300/50",
    textColor: "text-orange-800",
  },
];

export function OlympicPodium({ 
  scores, 
  category 
}: { 
  scores: LeaderboardScore[], 
  category: LeaderboardCategory 
}) {
  return (
    <div className="flex items-end justify-center gap-3 md:gap-8 px-4 pt-20 pb-6 min-h-[400px] w-full">
      {PODIUM_CONFIGS.map((cfg) => {
        const entry = scores[cfg.dataIdx];
        if (!entry) return null;

        const isFirst = cfg.dataIdx === 0;

        return (
          <div 
            key={entry.userId || cfg.dataIdx}
            className="flex flex-col items-center duration-1000 ease-out animate-in fade-in slide-in-from-bottom-8"
            style={{ order: cfg.order, flex: 1, maxWidth: '180px' }}
          >
            {/* Avatar Section */}
            <div className="relative mb-6">
              {isFirst && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 animate-bounce duration-[2000ms]">
                  <CrownIcon size={48} className="drop-shadow-[0_0_15px_rgba(234,179,8,1)] fill-yellow-500" />
                </div>
              )}
              
              <div className={`absolute inset-0 rounded-full blur-2xl opacity-60 ${cfg.glowColor} animate-pulse`} />

              {/* Profile Wrapper - Энэ нь Badge-ийг гадна талд нь байрлуулах боломжийг олгоно */}
              <div className="relative">
                {/* Аватар */}
                <div className={`relative w-20 h-20 md:w-24 md:h-24 rounded-3xl border-4 flex items-center justify-center text-2xl font-black shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-300 overflow-hidden bg-white/90 backdrop-blur-sm
                  ${isFirst ? 'border-yellow-400' : 'border-white/50'}`}>
                  <span className="text-transparent bg-gradient-to-br from-slate-700 to-slate-900 bg-clip-text">
                    {entry.userName?.substring(0, 2).toUpperCase()}
                  </span>
                </div>

                {/* Ranking Badge - Гадна талд, баруун доод буланд */}
                <div className={`absolute -bottom-3 -right-3 w-10 h-10 rounded-2xl flex items-center justify-center text-sm text-white font-black shadow-2xl z-30
                  ${isFirst 
                    ? 'bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 border-2 border-white' 
                    : 'bg-slate-800 border-2 border-white/20'}`}>
                  #{cfg.dataIdx + 1}
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="z-10 w-full p-2 mb-4 text-center border shadow-sm bg-white/40 backdrop-blur-md rounded-2xl border-white/20">
              <p className="text-xs font-bold text-[#1e293b] truncate uppercase tracking-tight">
                {entry.userName}
              </p>
              <div className="flex items-center justify-center gap-1">
                <p className={`text-xl font-black tracking-tighter ${isFirst ? 'text-amber-600' : 'text-[#0047cc]'}`}>
                  {entry.score.toLocaleString()}
                </p>
                <span className="text-[9px] font-black opacity-50 uppercase">оноо</span>
              </div>
            </div>

            {/* Podium Pillar */}
            <div 
              className={`w-full rounded-t-[32px] shadow-2xl relative overflow-hidden border-t-2 ${cfg.borderColor} flex flex-col items-center pt-6`}
              style={{ 
                height: cfg.pedHeight, 
                background: `linear-gradient(to bottom, white 0%, transparent 100%), linear-gradient(to bottom, var(--tw-gradient-from), var(--tw-gradient-to))` 
              }}
            >
              <div className={`absolute inset-x-0 top-0 h-full bg-gradient-to-b ${cfg.gradient} opacity-90`} />
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-8 h-1 mb-3 rounded-full bg-white/30" />
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${cfg.textColor}`}>
                  {cfg.label}
                </span>
              </div>
              <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] animate-[shimmer_3s_infinite]" />
            </div>
          </div>
        );
      })}

      <style jsx>{`
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
}
