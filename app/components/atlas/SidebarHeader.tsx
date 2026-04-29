"use client";

import { ChevronLeft, ChevronRight, Compass } from "lucide-react";
import { sidebarTheme as T } from "./sidebarTheme";

export function SidebarHeader({
  collapsed,
  onToggleCollapsed,
}: {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  return (
    <div className="shrink-0 px-3 py-3" style={{ borderBottom: `1px solid ${T.border}` }}>
      <div className={`flex items-center ${collapsed ? "flex-col justify-center gap-2" : "justify-between gap-3"}`}>
        <div className={`flex min-w-0 items-center ${collapsed ? "justify-center" : "gap-3"}`}>
          <div
            className={`flex shrink-0 items-center justify-center rounded-lg ${collapsed ? "h-10 w-10" : "h-10 w-10"}`}
            style={{
              background: "rgba(245,158,11,0.12)",
              border: `1px solid ${T.amber}33`,
              color: T.amber,
            }}
          >
            <Compass className="size-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold leading-tight" style={{ color: T.amber }}>
                Монгол Атлас
              </p>
              <p className="mt-0.5 truncate text-[9px] uppercase tracking-[0.25em]" style={{ color: T.textMuted }}>
                Navigation
              </p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-200 hover:scale-105"
          style={{
            background: "rgba(245,158,11,0.18)",
            border: `1px solid ${T.amber}66`,
            color: T.amber,
            boxShadow: "0 0 12px rgba(245,158,11,0.14), 0 4px 12px rgba(0,0,0,0.28)",
          }}
          title={collapsed ? "Sidebar нээх" : "Sidebar хураах"}
        >
          {collapsed ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
        </button>
      </div>
    </div>
  );
}
