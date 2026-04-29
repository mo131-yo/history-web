"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import type { HistoricalMapProps } from "./atlas/historicalMapTypes";
import { useHistoricalMap } from "./atlas/useHistoricalMap";

export default function HistoricalMap(props: HistoricalMapProps) {
  const containerRef = useHistoricalMap(props, {
    center: [72, 36],
    zoom: 1.75,
    pitch: 0,
  });

  return (
    <div className="absolute inset-0 bg-[#07111f]">
      <div ref={containerRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
