"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useHistoricalMap } from "./atlas/useHistoricalMap";
import type { HistoricalMapProps } from "./atlas/historicalMapTypes";

export default function HistoricalMap(props: HistoricalMapProps) {
  const containerRef = useHistoricalMap(props, {
    center: [86, 34],
    zoom: 2.15,
    pitch: 0,
  });
  const { isEditing, isCreating } = props;

  return (
    <div className="relative h-full min-h-105 bg-[radial-gradient(circle_at_30%_20%,rgba(125,211,252,0.2),transparent_26%),radial-gradient(circle_at_80%_0%,rgba(250,204,21,0.16),transparent_22%),#dbeafe] lg:min-h-0">
      <div ref={containerRef} className="h-full w-full" />
      <div className="pointer-events-none absolute bottom-4 left-4 rounded-2xl border border-white/50 bg-white/75 px-4 py-3 text-xs text-slate-700 shadow-lg backdrop-blur">
        {isEditing
          ? isCreating
            ? "Create mode: map дээр дарж шинэ оройнууд нэм. 3+ цэг бол polygon болно, дараа нь Save хий."
            : "Edit mode: цэгийг чирж зөө, double-click хийж устга, Add point горимоор шинэ орой нэм."
          : "Polygon сонгоод тухайн улсын хил, түүх, AI тайлбарыг хар."}
      </div>
    </div>
  );
}
