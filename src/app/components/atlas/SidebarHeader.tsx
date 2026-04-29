"use client";

import { ChevronRight, Globe } from "lucide-react";
import { sidebarTheme as T } from "./sidebarTheme";

export function SidebarHeader({
  year,
  collapsed,
  onToggleCollapsed,
}: {
  year: number;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  return (
    <div className="px-4 py-4 shrink-0 sm:px-5 sm:py-5" style={{background: T.bg, borderBottom: `1px solid ${T.border}` }}>
      <div className={`flex gap-3 ${collapsed ? "items-center justify-center lg:flex-col" : "items-start justify-between"}`}>
        {!collapsed && (
          <div>
            <p className="mb-1 text-[7px] uppercase tracking-[0.45em] sm:text-[8px] sm:tracking-[0.6em]" style={{ color: T.text }}>Монгол Атлас</p>
            <h2 className="text-3xl font-bold leading-none sm:text-4xl" style={{ color: T.amber, textShadow: `0 0 30px ${T.amberGlow}, 0 0 60px ${T.amberGlow}` }}>{year}</h2>
            <p className="mt-1 text-[8px] uppercase tracking-[0.28em] sm:text-[9px] sm:tracking-[0.4em]" style={{ color: T.text }}>он · Дундад Зуун</p>
          </div>
        )}
        {collapsed && (
          <div className="text-center lg:block">
            <p className="text-[7px] uppercase tracking-[0.35em]" style={{ color: T.textMuted }}>Атлас</p>
            <h2 className="mt-2 text-2xl font-bold leading-none" style={{ color: T.amber, textShadow: `0 0 20px ${T.amberGlow}` }}>{year}</h2>
          </div>
        )}
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="flex items-center justify-center mt-1 transition-all duration-200 rounded-lg h-9 w-9 shrink-0 hover:scale-105 sm:h-10 sm:w-10"
          style={{ background: T.bg, border: `1px solid ${T.amber}33` }}
          title={collapsed ? "Sidebar нээх" : "Sidebar хураах"}
        >
          <div className="relative flex items-center justify-center ">
            <Globe className="size-4 sm:size-5" style={{ color: T.amber }} />
            <ChevronRight
              className="absolute transition-transform duration-300 -right-3 size-3"
              style={{
                color: T.amber,
                transform: collapsed ? "rotate(0deg)" : "rotate(180deg)",
              }}
            />
          </div>
        </button>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <div className="flex-1 h-px" style={{ background: T.border }} />
        <div className="h-1.5 w-1.5 rounded-full" style={{ background: T.amber, opacity: 0.5 }} />
        <div className="flex-1 h-px" style={{ background: T.border }} />
      </div>
    </div>
  );
}
