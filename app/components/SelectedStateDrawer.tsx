"use client";

import { Crown, Loader2, MapPin, Scroll, Sparkles, Swords, X } from "lucide-react";
import type { AtlasStateFeature } from "@/lib/types";
import { SelectedStateMarkdown } from "./atlas/SelectedStateMarkdown";
import { selectedStateTheme as T } from "./atlas/selectedStateTheme";
import { useStateInsight } from "./atlas/useStateInsight";

function Divider() {
  return (
    <div className="my-2.5 flex items-center gap-2">
      <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${T.border})` }} />
      <div className="h-1 w-1 rounded-full" style={{ background: T.amberDim, opacity: 0.5 }} />
      <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${T.border}, transparent)` }} />
    </div>
  );
}

export default function SelectedStateDrawer({
  year,
  feature,
  onClose,
}: {
  year: number;
  feature: AtlasStateFeature | null;
  onClose: () => void;
}) {
  const { insight, insightLoading, insightError, isCached } = useStateInsight(year, feature);

  if (!feature) {
    return (
      <div className="hidden h-full items-center justify-center rounded-2xl md:flex" style={{ background: T.bg, border: `1px solid ${T.border}`, backdropFilter: "blur(16px)" }}>
        <div className="px-8 text-center">
          <Scroll className="mx-auto mb-3 opacity-15" size={28} style={{ color: T.amber }} />
          <p className="text-xs uppercase tracking-widest" style={{ color: T.textMuted, fontFamily: "Georgia, serif" }}>
            Нутаг дэвсгэр сонгоно уу
          </p>
        </div>
      </div>
    );
  }

  const color = feature.properties.color ?? "#f59e0b";

  return (
    <div className="hidden h-full md:block">
      <div className="flex h-full flex-col overflow-hidden rounded-2xl" style={{ background: T.bg, border: `1px solid ${T.border}`, boxShadow: "0 0 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)", backdropFilter: "blur(16px)", fontFamily: "'Georgia', 'Times New Roman', serif" }}>
        <div className="h-0.5 shrink-0" style={{ background: `linear-gradient(90deg, transparent 0%, ${color} 35%, ${T.amber} 50%, ${color} 65%, transparent 100%)` }} />
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-1 flex items-start justify-between gap-3">
            <div>
              <p className="mb-2 text-[8px] uppercase tracking-[0.5em]" style={{ color: T.textMuted }}>Сонгосон нутаг</p>
              <h3 className="text-lg font-bold leading-tight" style={{ color: T.amber, textShadow: `0 0 12px ${color}33` }}>{feature.properties.name}</h3>
              {feature.properties.metadata?.periodName && (
                <p className="mt-0.5 text-xs italic" style={{ color: T.textSub }}>«{String(feature.properties.metadata.periodName)}»</p>
              )}
            </div>
            <button type="button" onClick={onClose} className="shrink-0 rounded-md p-1.5 transition-opacity hover:opacity-60" style={{ border: `1px solid ${T.border}`, color: T.textMuted }}>
              <X className="size-3.5" />
            </button>
          </div>

          <Divider />

          <div className="mb-3 grid gap-1.5">
            {[
              { Icon: Crown, label: "Удирдагч", value: feature.properties.leader },
              { Icon: MapPin, label: "Нийслэл", value: feature.properties.capital },
              { Icon: Swords, label: "Он", value: `${year} он` },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 rounded-lg px-3 py-2" style={{ background: "rgba(15,23,42,0.5)", border: `1px solid ${T.border}` }}>
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md" style={{ background: T.amberGlow, border: `1px solid ${T.amber}22` }}>
                  <Icon className="size-3" style={{ color: T.amberDim }} />
                </div>
                <span className="w-14 shrink-0 text-[9px] uppercase tracking-[0.2em]" style={{ color: T.textMuted }}>{label}</span>
                <span className="truncate text-xs font-medium" style={{ color: T.text }}>{value}</span>
              </div>
            ))}
          </div>

          <Divider />

          <div className="mb-3 rounded-lg px-4 py-3" style={{ background: "rgba(15,23,42,0.4)", border: `1px solid ${T.border}`, borderLeft: `3px solid ${color}66` }}>
            <p className="mb-2 text-[9px] uppercase tracking-[0.3em]" style={{ color: T.textMuted }}>Товч түүх</p>
            <p className="text-xs leading-relaxed" style={{ color: T.text }}>{feature.properties.summary}</p>
          </div>

          <div className="rounded-lg px-4 py-3" style={{ background: "rgba(15,23,42,0.3)", border: `1px solid ${T.border}` }}>
            <div className="mb-2.5 flex items-center gap-2">
              <Sparkles className="size-3" style={{ color: T.amberDim }} />
              <p className="text-[9px] uppercase tracking-[0.3em]" style={{ color: T.textMuted }}>Түүхч тайлбар</p>
              {isCached && !insightLoading && (
                <span className="ml-auto rounded px-1.5 py-0.5 text-[7px] uppercase tracking-widest" style={{ border: `1px solid ${T.border}`, color: T.textMuted }}>
                  cached
                </span>
              )}
            </div>

            {insightLoading ? (
              <div className="flex items-center gap-2 py-3" style={{ color: T.textSub }}>
                <Loader2 className="size-3 animate-spin" />
                <span className="text-xs">Тайлбар бичигдэж байна…</span>
              </div>
            ) : insightError ? (
              <p className="py-2 text-xs" style={{ color: "#f87171" }}>{insightError}</p>
            ) : (
              <SelectedStateMarkdown text={insight} />
            )}
          </div>

          <p className="mt-3 text-right text-[8px]" style={{ color: T.textMuted }}>
            {new Date(feature.properties.updatedAt).toLocaleDateString("mn-MN")}
          </p>
        </div>
      </div>
    </div>
  );
}
