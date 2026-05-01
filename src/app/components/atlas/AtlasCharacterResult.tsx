'use client';

import { sidebarTheme as T } from './sidebarTheme';
import { CharacterRole } from './types';
import { RefreshCcw, Map as MapIcon, Share2, Award } from 'lucide-react';

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
    <div className="relative flex flex-col items-center py-4 text-center">
    
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-blue-500/20 blur-[40px] rounded-full animate-pulse" />
        <div className="relative flex items-center justify-center w-28 h-28 text-7xl bg-white border-4 border-blue-50 shadow-2xl rounded-[32px] transform -rotate-3 hover:rotate-0 transition-transform duration-500">
          {result.icon}
        </div>
        <div className="absolute p-2 text-white border-2 border-white shadow-lg -bottom-2 -right-2 bg-amber-400 rounded-xl">
          <Award size={20} />
        </div>
      </div>

    
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            {userName}-ийн түүхэн дүр
          </span>
        </div>

        <h3 className="text-4xl font-black tracking-tight text-slate-900">
          {result.name}
        </h3>

        <p className="text-sm font-bold tracking-tighter text-blue-600 uppercase">
          {result.subtitle}
        </p>
      </div>

  
      <div className="relative mt-8 p-6 bg-slate-50/50 rounded-3xl border border-slate-100 max-w-[540px]">
        <p className="text-sm font-medium leading-7 text-slate-600">
          {result.description}
        </p>
      </div>

      
      <div className="mt-8 w-full max-w-[480px]">
        <div className="flex flex-wrap justify-center gap-2">
          {result.strengths.map((strength) => (
            <div
              key={strength}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 bg-white border border-slate-200 shadow-sm transition-all hover:border-blue-300 hover:translate-y-[-2px]"
            >
              <div className="size-1.5 rounded-full bg-blue-500" />
              <span className="text-xs font-bold text-slate-700">
                {strength}
              </span>
            </div>
          ))}
        </div>
      </div>

 
      <div className="grid w-full grid-cols-1 gap-4 mt-10 sm:grid-cols-2">
        <button
          type="button"
          onClick={onRestart}
          className="flex items-center justify-center gap-2 px-6 py-4 text-sm font-black transition-all border rounded-2xl text-slate-600 bg-slate-100 border-slate-200 hover:bg-slate-200 hover:text-slate-900 active:scale-95"
        >
          <RefreshCcw size={16} />
          ДАХИН ТОГЛОХ
        </button>

        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-black text-white bg-blue-600 shadow-[0_10px_25px_-5px_rgba(37,99,235,0.4)] hover:bg-blue-700 hover:shadow-none transition-all active:scale-95"
        >
          <MapIcon size={16} />
          АТЛАС РУУ БУЦАХ
        </button>
      </div>

  
    </div>
  );
}
