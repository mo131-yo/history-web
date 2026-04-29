"use client";

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
        background: "rgba(8,5,2,0.9)",
        border: "1px solid rgba(201,164,93,0.18)",
        backdropFilter: "blur(14px)",
        boxShadow: "0 12px 32px rgba(0,0,0,0.38)",
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
                ? "rgba(201,164,93,0.16)"
                : "rgba(255,255,255,0.03)",
              border: `1px solid ${
                active ? "rgba(201,164,93,0.42)" : "rgba(255,255,255,0.08)"
              }`,
              color: active ? "#f3d9a4" : "#8f7b59",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
