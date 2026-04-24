"use client";

import { ChevronRight, Landmark, X } from "lucide-react";

export function FeatureDetailsHeader({
  color,
  name,
  capital,
  leader,
  onClose,
}: {
  color: string;
  name?: string;
  capital?: string;
  leader?: string;
  onClose: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
        <button onClick={onClose} className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/40 transition-colors hover:text-[#C5A059]">
          <ChevronRight size={14} className="rotate-180" />
          Буцах
        </button>
        <button onClick={onClose} className="rounded-full p-2 text-white/30 transition-colors hover:bg-white/5 hover:text-white" aria-label="Close details">
          <X size={18} />
        </button>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/3 p-6">
        <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-br from-[#C5A059]/20 via-transparent to-transparent" />
        <div className="absolute -right-4 -top-4 opacity-5"><Landmark size={96} /></div>
        <div className="relative space-y-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">Сонгосон улс</p>
            <h2 className="mt-2 font-serif text-3xl font-bold leading-tight" style={{ color }}>{name}</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[9px] uppercase tracking-tighter text-white/30">Нийслэл</p>
              <p className="text-xs font-bold text-white/80">{capital || "Нүүдлийн өргөө"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] uppercase tracking-tighter text-white/30">Удирдагч</p>
              <p className="text-xs font-bold text-white/80">{leader || "Хаан"}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
