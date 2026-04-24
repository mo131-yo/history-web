"use client";

import { MAP_OPTIONS, T } from "./constants";
import type { MapMode } from "./types";

export function MapLoader({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center" style={{ background: "#06040200" }}>
      <div className="flex flex-col items-center gap-5">
        <div className="relative h-14 w-14">
          <div
            className="absolute inset-0 animate-spin rounded-full"
            style={{
              border: "1.5px solid transparent",
              borderTopColor: "#c9a45d",
              borderRightColor: "rgba(201,164,93,0.3)",
              animationDuration: "1.4s",
            }}
          />
          <div
            className="absolute inset-2.5 animate-spin rounded-full"
            style={{
              border: "1.5px solid transparent",
              borderTopColor: "#8b6c35",
              animationDirection: "reverse",
              animationDuration: "2.1s",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-1.5 w-1.5 rounded-full" style={{ background: "#c9a45d", opacity: 0.7 }} />
          </div>
        </div>
        <p className="text-[9px] uppercase tracking-[0.45em]" style={{ color: "#5c4020", fontFamily: "Georgia, serif" }}>
          {label} ачаалж байна
        </p>
      </div>
    </div>
  );
}

export function MapSwitcher({
  current,
  onChange,
}: {
  current: MapMode;
  onChange: (m: MapMode) => void;
}) {
  return (
    <div
      className="pointer-events-auto flex items-center gap-0.5 rounded-xl p-1"
      style={{
        background: "rgba(8,5,2,0.92)",
        border: `1px solid ${T.border}`,
        backdropFilter: "blur(16px)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      {MAP_OPTIONS.map(({ mode, mn, icon }) => {
        const active = mode === current;

        return (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            className="relative flex items-center gap-1.5 rounded-lg px-3 py-2 transition-all duration-200"
            style={{
              background: active
                ? "linear-gradient(135deg, rgba(201,164,93,0.18) 0%, rgba(139,108,53,0.08) 100%)"
                : "transparent",
              border: `1px solid ${active ? "rgba(201,164,93,0.4)" : "transparent"}`,
              color: active ? T.amberBright : T.textMuted,
              fontSize: "10px",
              fontFamily: "Georgia, serif",
              letterSpacing: "0.07em",
              cursor: "pointer",
              boxShadow: active
                ? "0 0 12px rgba(201,164,93,0.15), inset 0 1px 0 rgba(255,255,255,0.05)"
                : "none",
              whiteSpace: "nowrap",
            }}
            title={mode}
          >
            <span style={{ fontSize: "12px", lineHeight: 1 }}>{icon}</span>
            <span className="hidden uppercase tracking-widest sm:inline">{mn}</span>
            {active && (
              <span
                className="absolute bottom-0.5 left-1/2 -translate-x-1/2 rounded-full"
                style={{ width: 18, height: 1.5, background: T.amber, opacity: 0.6 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
