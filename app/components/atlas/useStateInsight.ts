"use client";

import { useEffect, useState } from "react";
import type { AtlasStateFeature } from "@/lib/types";

export function useStateInsight(year: number, feature: AtlasStateFeature | null) {
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
    return () => {
      active = false;
    };
  }, [feature, year]);

  return { insight, insightLoading, insightError, isCached };
}
