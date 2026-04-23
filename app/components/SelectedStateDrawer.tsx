"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Loader2, X, Scroll, Sparkles, MapPin, Swords, Crown } from "lucide-react";
import type { AtlasStateFeature } from "@/lib/types";

const T = {
  bg: "rgba(2,6,23,0.96)",
  border: "#1e293b",
  borderHover: "#334155",
  amber: "#f59e0b",
  amberDim: "#d97706",
  amberGlow: "#f59e0b15",
  text: "#e7e5e0",
  textSub: "#a8a29e",
  textMuted: "#57534e",
};

interface SelectedStateDrawerProps {
  year: number;
  feature: AtlasStateFeature | null;
  onClose: () => void;
}

function Divider() {
  return (
    <div className="flex items-center gap-2 my-2.5">
      <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${T.border})` }} />
      <div className="h-1 w-1 rounded-full" style={{ background: T.amberDim, opacity: 0.5 }} />
      <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${T.border}, transparent)` }} />
    </div>
  );
}

export default function SelectedStateDrawer({
  year,
  feature,
  onClose,
}: SelectedStateDrawerProps) {
  const [insight, setInsight] = useState("");
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState("");
  const [isCached, setIsCached] = useState(false);

  useEffect(() => {
    if (!feature) return;
    let active = true;
    const state = feature.properties;

    async function loadInsight() {
      setInsightLoading(true);
      setInsightError("");
      setInsight("");
      setIsCached(false);
      try {
        const res = await fetch("/api/atlas/insight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            year,
            slug: state.slug,
            state: {
              name: state.name,
              leader: state.leader,
              capital: state.capital,
              summary: state.summary,
              metadata: state.metadata,
            },
          }),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (active) {
          setInsight(data.text ?? "");
          setIsCached(data.cached === true);
        }
      } catch {
        if (active) setInsightError("Тайлбар ачаалагдсангүй.");
      } finally {
        if (active) setInsightLoading(false);
      }
    }
    void loadInsight();
    return () => { active = false; };
  }, [feature, year]);


  if (!feature) {
    return (
      <div
        className="hidden h-full md:flex items-center justify-center rounded-2xl"
        style={{
          background: T.bg,
          border: `1px solid ${T.border}`,
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="text-center px-8">
          <Scroll
            className="mx-auto mb-3 opacity-15"
            size={28}
            style={{ color: T.amber }}
          />
          <p
            className="text-xs uppercase tracking-widest"
            style={{ color: T.textMuted, fontFamily: "Georgia, serif" }}
          >
            Нутаг дэвсгэр сонгоно уу
          </p>
        </div>
      </div>
    );
  }

  const color = feature.properties.color ?? "#f59e0b";

  return (
    <div className="hidden h-full md:block">
      <div
        className="flex h-full flex-col rounded-2xl overflow-hidden"
        style={{
          background: T.bg,
          border: `1px solid ${T.border}`,
          boxShadow: `0 0 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)`,
          backdropFilter: "blur(16px)",
          fontFamily: "'Georgia', 'Times New Roman', serif",
        }}
      >
        <div
          className="h-0.5 shrink-0"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${color} 35%, ${T.amber} 50%, ${color} 65%, transparent 100%)`,
          }}
        />

        <div className="flex-1 overflow-y-auto px-5 py-4">

          <div className="flex items-start justify-between gap-3 mb-1">
            <div>
              <p className="text-[8px] uppercase tracking-[0.5em] mb-2" style={{ color: T.textMuted }}>
                Сонгосон нутаг
              </p>
              <h3
                className="text-lg font-bold leading-tight"
                style={{ color: T.amber, textShadow: `0 0 12px ${color}33` }}
              >
                {feature.properties.name}
              </h3>
              {feature.properties.metadata?.periodName && (
                <p className="mt-0.5 text-xs italic" style={{ color: T.textSub }}>
                  «{String(feature.properties.metadata.periodName)}»
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-md p-1.5 transition-opacity hover:opacity-60"
              style={{ border: `1px solid ${T.border}`, color: T.textMuted }}
            >
              <X className="size-3.5" />
            </button>
          </div>

          <Divider />


          <div className="grid gap-1.5 mb-3">
            {[
              { Icon: Crown, label: "Удирдагч", value: feature.properties.leader },
              { Icon: MapPin, label: "Нийслэл", value: feature.properties.capital },
              { Icon: Swords, label: "Он", value: `${year} он` },
            ].map(({ Icon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-lg px-3 py-2"
                style={{
                  background: "rgba(15,23,42,0.5)",
                  border: `1px solid ${T.border}`,
                }}
              >
                <div
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                  style={{ background: T.amberGlow, border: `1px solid ${T.amber}22` }}
                >
                  <Icon className="size-3" style={{ color: T.amberDim }} />
                </div>
                <span
                  className="text-[9px] uppercase tracking-[0.2em] w-14 shrink-0"
                  style={{ color: T.textMuted }}
                >
                  {label}
                </span>
                <span
                  className="text-xs font-medium truncate"
                  style={{ color: T.text }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>

          <Divider />


          <div
            className="rounded-lg px-4 py-3 mb-3"
            style={{
              background: "rgba(15,23,42,0.4)",
              border: `1px solid ${T.border}`,
              borderLeft: `3px solid ${color}66`,
            }}
          >
            <p
              className="text-[9px] uppercase tracking-[0.3em] mb-2"
              style={{ color: T.textMuted }}
            >
              Товч түүх
            </p>
            <p className="text-xs leading-relaxed" style={{ color: T.text }}>
              {feature.properties.summary}
            </p>
          </div>


          <div
            className="rounded-lg px-4 py-3"
            style={{
              background: "rgba(15,23,42,0.3)",
              border: `1px solid ${T.border}`,
            }}
          >
            <div className="flex items-center gap-2 mb-2.5">
              <Sparkles className="size-3" style={{ color: T.amberDim }} />
              <p
                className="text-[9px] uppercase tracking-[0.3em]"
                style={{ color: T.textMuted }}
              >
                Түүхч тайлбар
              </p>
              {isCached && !insightLoading && (
                <span
                  className="ml-auto text-[7px] uppercase tracking-widest px-1.5 py-0.5 rounded"
                  style={{ border: `1px solid ${T.border}`, color: T.textMuted }}
                >
                  cached
                </span>
              )}
            </div>

            {insightLoading ? (
              <div
                className="flex items-center gap-2 py-3"
                style={{ color: T.textSub }}
              >
                <Loader2 className="size-3 animate-spin" />
                <span className="text-xs">Тайлбар бичигдэж байна…</span>
              </div>
            ) : insightError ? (
              <p className="text-xs py-2" style={{ color: "#f87171" }}>
                {insightError}
              </p>
            ) : (
              <div className="text-xs leading-relaxed" style={{ color: T.text }}>
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 style={{ color: T.amber, fontSize: "0.85rem", fontWeight: "bold", marginBottom: "6px" }}>
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 style={{ color: T.amberDim, fontSize: "0.78rem", fontWeight: "bold", marginBottom: "4px", marginTop: "10px" }}>
                        {children}
                      </h2>
                    ),
                    strong: ({ children }) => (
                      <strong style={{ color: T.amberDim }}>{children}</strong>
                    ),
                    p: ({ children }) => (
                      <p style={{ marginBottom: "6px", color: T.text }}>{children}</p>
                    ),
                    li: ({ children }) => (
                      <li style={{ marginBottom: "2px", color: T.text, listStyleType: "disc", marginLeft: "12px" }}>
                        {children}
                      </li>
                    ),
                    ul: ({ children }) => (
                      <ul style={{ marginBottom: "6px" }}>{children}</ul>
                    ),
                  }}
                >
                  {insight}
                </ReactMarkdown>
              </div>
            )}
          </div>


          <p className="mt-3 text-[8px] text-right" style={{ color: T.textMuted }}>
            {new Date(feature.properties.updatedAt).toLocaleDateString("mn-MN")}
          </p>
        </div>
      </div>
    </div>
  );
}