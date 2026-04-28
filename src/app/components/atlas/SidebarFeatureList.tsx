"use client";

import type { AtlasStateFeature } from "@/lib/types";
import { sidebarTheme as T } from "./sidebarTheme";

export function SidebarFeatureList({
  features,
  selectedFeature,
  onSelectSlug,
}: {
  features: AtlasStateFeature[];
  selectedFeature: AtlasStateFeature | null;
  onSelectSlug: (slug: string) => void;
}) {
  return (
    <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-3 pb-2">
      {features.length === 0 && (
        <div className="mt-4 rounded-lg px-4 py-8 text-center text-xs" style={{ border: `1px solid ${T.border}`, color: T.textMuted }}>
          Энэ онд нутаг дэвсгэр олдсонгүй
        </div>
      )}

      {features.map((feature) => {
        const selected = feature.properties.slug === selectedFeature?.properties.slug;
        const color = feature.properties.color ?? "#f59e0b";

        return (
          <button
            key={`${feature.properties.year}-${feature.properties.slug}`}
            type="button"
            onClick={() => onSelectSlug(feature.properties.slug)}
            className="group relative w-full overflow-hidden rounded-lg text-left transition-all duration-150"
            style={{
              background: selected ? "linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0.05) 100%)" : "rgba(15,23,42,0.4)",
              border: selected ? `1px solid ${T.amber}44` : `1px solid ${T.border}`,
              boxShadow: selected ? "0 0 20px rgba(245,158,11,0.08), inset 0 1px 0 rgba(255,255,255,0.03)" : "none",
              padding: "10px 12px",
            }}
          >
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100" style={{ background: "rgba(245,158,11,0.04)" }} />
            <div className="absolute bottom-2 left-0 top-2 w-0.75 rounded-full" style={{ background: color, opacity: selected ? 1 : 0.45 }} />
            <div className="pl-3.5">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold leading-tight" style={{ color: selected ? T.amber : T.text }}>{feature.properties.name}</p>
                <div className="h-3.5 w-3.5 shrink-0 rounded-sm" style={{ background: color, boxShadow: selected ? `0 0 6px ${color}88` : "none", clipPath: "polygon(20% 0%, 80% 0%, 100% 20%, 100% 75%, 50% 100%, 0% 75%, 0% 20%)" }} />
              </div>
              <p className="mt-0.5 truncate text-[10px]" style={{ color: selected ? T.textSub : T.textMuted }}>{feature.properties.leader}</p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <div className="h-px flex-1" style={{ background: selected ? `${T.amber}30` : T.border }} />
                <p className="text-[8px] uppercase tracking-[0.2em]" style={{ color: T.textMuted }}>{feature.properties.capital}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
