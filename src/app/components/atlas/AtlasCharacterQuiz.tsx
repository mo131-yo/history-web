'use client';

import { RPG_QUESTIONS } from './constants';
import { sidebarTheme as T } from './sidebarTheme';
import { RoleId, RoleScore } from './types';
import { ChevronRight } from 'lucide-react';

export function AtlasCharacterQuiz({
  step,
  onChoose,
}: {
  step: number;
  onChoose: (scores: RoleScore) => void;
}) {
  const question = RPG_QUESTIONS[step];

  return (
    <div className="py-2">
   
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md">
              АСУУЛТ {step + 1}
            </span>
            <span className="text-[11px] font-bold text-slate-300 uppercase">
              / {RPG_QUESTIONS.length}
            </span>
          </div>

         
          <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-500 ease-out shadow-[0_0_8px_rgba(59,130,246,0.5)]"
              style={{ width: `${((step + 1) / RPG_QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>

        <h3 className="text-xl font-black leading-tight tracking-tight sm:text-2xl text-slate-800">
          {question.question}
        </h3>
      </div>

     
      <div className="grid gap-3.5">
        {question.options.map(
          (
            option: { scores: Partial<Record<RoleId, number>>; label: any },
            idx: number,
          ) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChoose(option.scores as RoleScore)}
              className="group relative w-full overflow-hidden rounded-[20px] p-0.5 transition-all duration-300 active:scale-[0.98] border border-slate-200 hover:border-blue-300 "
            >
          
              <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-blue-500 to-indigo-500 group-hover:opacity-100" />

              <div className="relative flex items-center bg-white p-4 sm:p-5 rounded-[18px] transition-colors group-hover:bg-blue-50/50">
        
                <div className="flex items-center justify-center flex-shrink-0 text-xs font-black transition-all border size-8 rounded-xl bg-slate-50 border-slate-100 text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-400 group-hover:shadow-lg group-hover:shadow-blue-200">
                  {idx + 1}
                </div>

            
                <span className="ml-4 flex-1 text-left text-[14px] font-bold text-slate-600 leading-relaxed group-hover:text-slate-900 transition-colors">
                  {option.label}
                </span>

                <div className="ml-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                  <ChevronRight size={18} className="text-blue-500" />
                </div>
              </div>
            </button>
          ),
        )}
      </div>

     
      <div className="absolute -bottom-20 -right-20 size-64 bg-blue-100 rounded-full blur-[80px] opacity-50 pointer-events-none" />
    </div>
  );
}
