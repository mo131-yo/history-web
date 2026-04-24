"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useHistoricalMap } from "./atlas/useHistoricalMap";
import type { HistoricalMapProps } from "./atlas/historicalMapTypes";

const GLOBE_VIEW = {
  center: [0, 26] as [number, number],
  zoom: 1.28,
  pitch: 68,
  bearing: -16,
  maxPitch: 85,
  mode: "globe" as const,
};

export default function GlobeMap(props: HistoricalMapProps) {
  // Previous react-globe.gl implementation has been retired in favor of MapTiler Hybrid + globe terrain.
  const containerRef = useHistoricalMap(props, GLOBE_VIEW);
  const { isEditing, isCreating } = props;

  return (
    <div className="relative h-full w-full overflow-hidden bg-[radial-gradient(circle_at_50%_18%,rgba(201,164,93,0.16),transparent_24%),radial-gradient(circle_at_15%_20%,rgba(70,120,180,0.18),transparent_28%),#050608]">
      <div ref={containerRef} className="absolute inset-x-0 -top-10 bottom-0" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(5,6,8,0.42)_72%,rgba(5,6,8,0.88)_100%)]" />
      <div className="pointer-events-none absolute bottom-4 left-4 rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-xs text-stone-200 shadow-lg backdrop-blur lg:bottom-8">
        {isEditing
          ? isCreating
            ? "Create mode: 3D globe дээр дарж шинэ оройнууд нэм."
            : "Edit mode: 3D globe дээр цэгийг чирж зөөж хилээ зас."
          : "3D globe view: улс сонгоод хил, өндөршил, газарзүйг илүү амьд харагдуулж хар."}
      </div>
    </div>
  );
}
