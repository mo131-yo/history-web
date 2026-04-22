"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Loader2, MapPinned, Sparkles, X } from "lucide-react";
import type { AtlasStateFeature } from "@/lib/types";

interface SelectedStateDrawerProps {
  year: number;
  feature: AtlasStateFeature | null;
  onClose: () => void;
}

export default function SelectedStateDrawer({
  year,
  feature,
  onClose,
}: SelectedStateDrawerProps) {
  const [insight, setInsight] = useState("");
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState("");

  useEffect(() => {
    if (!feature) {
      return;
    }

    let active = true;
    const state = feature.properties;

    async function loadInsight() {
      setInsightLoading(true);
      setInsightError("");

      try {
        const response = await fetch("/api/atlas/insight", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            year,
            state: {
              name: state.name,
              leader: state.leader,
              capital: state.capital,
              summary: state.summary,
              metadata: state.metadata,
            },
          }),
        });

        if (!response.ok) {
          throw new Error("insight-failed");
        }

        const data = await response.json();

        if (active) {
          setInsight(data.text ?? "");
        }
      } catch {
        if (active) {
          setInsightError("AI тайлбар ачаалагдсангүй.");
        }
      } finally {
        if (active) {
          setInsightLoading(false);
        }
      }
    }

    void loadInsight();

    return () => {
      active = false;
    };
  }, [feature, year]);

  if (!feature) {
    return null;
  }

  return (
    <div className="hidden h-full md:block">
      <div className="flex h-full flex-col rounded-[28px] border border-amber-500/20 bg-slate-950/92 p-5 text-stone-200 shadow-[0_25px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-amber-500/70">Selected State</p>
            <h3 className="mt-2 font-[family:var(--font-cinzel)] text-2xl font-semibold text-stone-100">
              {feature.properties.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-stone-300 transition hover:bg-white/10"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-stone-400">
          <MapPinned className="size-4 text-amber-500" />
          <span>{feature.properties.capital}</span>
        </div>

        <div className="mt-4 grid gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-stone-300">
          <p><span className="text-stone-500">Удирдагч:</span> {feature.properties.leader}</p>
          <p><span className="text-stone-500">Нийслэл:</span> {feature.properties.capital}</p>
          <p><span className="text-stone-500">Сүүлд шинэчлэгдсэн:</span> {new Date(feature.properties.updatedAt).toLocaleString()}</p>
        </div>

        <div className="mt-4 rounded-2xl border border-amber-500/15 bg-amber-500/[0.05] p-4">
          <p className="text-sm leading-7 text-stone-200">{feature.properties.summary}</p>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto rounded-2xl border border-amber-500/15 bg-amber-500/[0.04] p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-amber-500" />
            <p className="text-[10px] uppercase tracking-[0.3em] text-amber-500/80">Хүүрнэгч</p>
          </div>

          {insightLoading ? (
            <div className="mt-4 flex items-center gap-2 text-sm text-stone-300">
              <Loader2 className="size-4 animate-spin" />
              AI тайлбар үүсгэж байна...
            </div>
          ) : insightError ? (
            <p className="mt-4 text-sm text-red-300">{insightError}</p>
          ) : (
            <div className="prose prose-invert mt-4 max-w-none prose-p:my-2 prose-li:my-1 prose-strong:text-amber-300">
              <ReactMarkdown>{insight}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
