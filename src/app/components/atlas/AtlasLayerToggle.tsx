"use client";

import { sidebarTheme as T } from "./sidebarTheme";
import type { AtlasLayerVisibility } from "./types";

const LAYERS: Array<{
  key: keyof AtlasLayerVisibility;
  label: string;
}> = [
  { key: "states", label: "States" },
  { key: "labels", label: "Labels" },
  { key: "capitals", label: "Capitals" },
  { key: "battles", label: "Battles / Campaigns" },
];

export function AtlasLayerToggle({
  value,
  onChange,
}: {
  value: AtlasLayerVisibility;
  onChange: (key: keyof AtlasLayerVisibility, next: boolean) => void;
}) {
  return (
    <div
      className="pointer-events-auto absolute left-4 top-16 z-20 flex flex-wrap gap-2 rounded-xl px-3 py-2"
      style={{
        background: T.bg,
        border: `1px solid ${T.border}`,
        backdropFilter: "blur(14px)",
        boxShadow: "0 12px 32px rgba(12,96,169,0.12), inset 0 1px 0 rgba(255,255,255,0.85)",
        fontFamily: "var(--font-inter), Arial, sans-serif",
      }}
    >
      {LAYERS.map(({ key, label }) => {
        const active = value[key];
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key, !active)}
            className="rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] transition"
            style={{
              background: active
                ? "rgba(12,96,169,0.10)"
                : "rgba(12,96,169,0.03)",
              border: `1px solid ${
                active ? "rgba(12,96,169,0.34)" : T.border
              }`,
              color: active ? T.amber : T.textMuted,
            }}
          >
            {label}
          </button>
        );
      })}
      <div
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em]"
        style={{
          background: "rgba(12,96,169,0.06)",
          border: "1px solid rgba(12,96,169,0.22)",
          color: T.amber,
        }}
      >
        <span aria-hidden="true">⚔</span>
        <span>Battle / conflict</span>
      </div>
    </div>
  );
}
