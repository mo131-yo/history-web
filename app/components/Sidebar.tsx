"use client";

import { Search } from "lucide-react";
import type { AtlasStateFeature } from "@/lib/types";

interface SidebarProps {
  year: number;
  features: AtlasStateFeature[];
  selectedFeature: AtlasStateFeature | null;
  onSelectSlug: (slug: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

export function Sidebar({
  year,
  features,
  selectedFeature,
  onSelectSlug,
  search,
  onSearchChange,
}: SidebarProps) {
  return (
    <aside className="flex min-h-screen flex-col overflow-y-auto border-r border-white/10 bg-[linear-gradient(180deg,rgba(10,14,24,0.96),rgba(6,10,18,0.98))] px-5 py-5 backdrop-blur-xl lg:h-screen lg:min-h-0">
      <div className="shrink-0 rounded-[28px] border border-amber-200/10 bg-amber-50/[0.03] p-5">
        <p className="text-[10px] uppercase tracking-[0.35em] text-amber-200/60">Atlas</p>
        <h2 className="mt-2 font-[family:var(--font-cinzel-decorative)] text-3xl text-amber-100">{year}</h2>
      </div>

      <label className="mt-5 flex shrink-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
        <Search className="size-4 text-slate-400" />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Улс, хаан, нийслэл хайх"
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
        />
      </label>

      <div className="mt-5 grid shrink-0 gap-3 pr-1">
        {features.map((feature) => {
          const selected = feature.properties.slug === selectedFeature?.properties.slug;

          return (
            <button
              key={`${feature.properties.year}-${feature.properties.slug}`}
              type="button"
              onClick={() => onSelectSlug(feature.properties.slug)}
              className={`rounded-[24px] border px-4 py-4 text-left transition ${
                selected
                  ? "border-amber-300/60 bg-amber-300/10 shadow-[0_10px_30px_rgba(245,158,11,0.12)]"
                  : "border-white/8 bg-white/[0.03] hover:border-amber-500/30 hover:bg-white/[0.06]"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-[family:var(--font-cinzel)] text-lg font-semibold text-stone-200">
                    {feature.properties.name}
                  </p>
                  <p className="mt-1 text-xs text-stone-400">{feature.properties.leader}</p>
                </div>
                <span
                  className="h-4 w-4 rounded-full border border-white/40"
                  style={{ backgroundColor: feature.properties.color }}
                />
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-stone-500">{feature.properties.capital}</p>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
