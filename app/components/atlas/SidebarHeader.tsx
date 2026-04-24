"use client";

import { Globe } from "lucide-react";
import { sidebarTheme as T } from "./sidebarTheme";

export function SidebarHeader({ year }: { year: number }) {
  return (
    <div className="shrink-0 px-5 py-5" style={{ borderBottom: `1px solid ${T.border}` }}>
      <div className="mb-5 flex items-center gap-3">
        <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${T.amber}66)` }} />
        <svg width="16" height="16" viewBox="0 0 16 16">
          <polygon points="8,1 9.5,5.5 14.5,5.5 10.3,8.8 11.8,13.5 8,10.8 4.2,13.5 5.7,8.8 1.5,5.5 6.5,5.5" fill={T.amber} opacity="0.8" />
        </svg>
        <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${T.amber}66, transparent)` }} />
      </div>

      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="mb-1 text-[8px] uppercase tracking-[0.6em]" style={{ color: T.textMuted }}>Монгол Атлас</p>
          <h2 className="text-4xl font-bold leading-none" style={{ color: T.amber, textShadow: `0 0 30px ${T.amberGlow}, 0 0 60px ${T.amberGlow}` }}>{year}</h2>
          <p className="mt-1 text-[9px] uppercase tracking-[0.4em]" style={{ color: T.textMuted }}>он · Дундад Зуун</p>
        </div>
        <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: T.amberGlow, border: `1px solid ${T.amber}33` }}>
          <Globe className="size-5" style={{ color: T.amberDim }} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className="h-px flex-1" style={{ background: T.border }} />
        <div className="h-1.5 w-1.5 rounded-full" style={{ background: T.amberDim, opacity: 0.5 }} />
        <div className="h-px flex-1" style={{ background: T.border }} />
      </div>
    </div>
  );
}
