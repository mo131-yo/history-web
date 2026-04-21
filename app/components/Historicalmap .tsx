"use client";
// components/HistoricalMap.tsx — DB API-аас өгөгдөл татна

import React, { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export interface MapHandle {
  flyToLocation: (center: [number, number], zoom?: number) => void;
  highlightFeature: (name: string) => void;
  startQuiz: () => void;
}

interface Props {
  year: number;
  isWhatIf: boolean;
  onSelectFeature: (feature: any) => void;
}

const HistoricalMap = forwardRef<MapHandle, Props>(({ year, isWhatIf, onSelectFeature }, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const isReady = useRef(false);
  const animationRef = useRef<number | null>(null);

  useImperativeHandle(ref, () => ({
    flyToLocation: (center, zoom = 4) => {
      map.current?.flyTo({ center, zoom, speed: 0.8, curve: 1.4, essential: true });
    },
    highlightFeature: (name: string) => {
      if (!isReady.current) return;
      map.current?.setFilter("borders-highlight", [
        "all", ["==", ["geometry-type"], "Polygon"], ["==", ["get", "name"], name],
      ]);
    },
    startQuiz: () => console.log("Quiz started for year:", year),
  }));

  const loadData = useCallback((m: maplibregl.Map, currentYear: number, alternate: boolean) => {
    const src = m.getSource("historical-borders") as maplibregl.GeoJSONSource;
    if (!src) return;
    const url = `/api/map/${currentYear}${alternate ? "?whatif=1" : ""}`;
    fetch(url)
      .then(r => r.json())
      .then(data => src.setData(data))
      .catch(err => {
        console.error("DB data load error:", err);
        src.setData({ type: "FeatureCollection", features: [] });
      });
  }, []);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json",
      center: [105, 45],
      zoom: 3,
      attributionControl: false,
    });

    map.current.on("load", () => {
      const m = map.current!;
      if ((m as any).setProjection) (m as any).setProjection({ type: "globe" });

      m.addSource("historical-borders", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      m.addLayer({
        id: "borders-fill", type: "fill", source: "historical-borders",
        filter: ["==", ["geometry-type"], "Polygon"],
        paint: { "fill-color": ["coalesce", ["get", "color"], "#C5A059"], "fill-opacity": 0.35 },
      });
      m.addLayer({
        id: "borders-line", type: "line", source: "historical-borders",
        filter: ["==", ["geometry-type"], "Polygon"],
        paint: { "line-color": ["coalesce", ["get", "color"], "#ffffff"], "line-width": 0.8, "line-opacity": 0.4 },
      });
      m.addLayer({
        id: "borders-highlight", type: "line", source: "historical-borders",
        filter: ["all", ["==", ["geometry-type"], "Polygon"], ["==", ["get", "name"], ""]],
        paint: { "line-color": "#C5A059", "line-width": 3, "line-opacity": 0.8 },
      });
      m.addLayer({
        id: "attack-lines", type: "line", source: "historical-borders",
        filter: ["==", ["geometry-type"], "LineString"],
        paint: { "line-color": ["coalesce", ["get", "color"], "#ff3300"], "line-width": 3 },
      });

      m.on("click", "borders-fill", (e) => {
        if (e.features && e.features.length > 0) {
          const f = e.features[0];
          onSelectFeature(f);
          m.setFilter("borders-highlight", ["all", ["==", ["geometry-type"], "Polygon"], ["==", ["get", "name"], f.properties?.name]]);
          m.flyTo({ center: e.lngLat, zoom: 4.5, speed: 0.8 });
        }
      });
      m.on("mouseenter", "borders-fill", () => { m.getCanvas().style.cursor = "pointer"; });
      m.on("mouseleave", "borders-fill", () => { m.getCanvas().style.cursor = ""; });

      isReady.current = true;
      loadData(m, year, isWhatIf);

      const rotate = () => {
        if (!m.isStyleLoaded()) return;
        const c = m.getCenter(); c.lng += 0.01; m.setCenter(c);
        animationRef.current = requestAnimationFrame(rotate);
      };
      rotate();
      setTimeout(() => { if (animationRef.current) cancelAnimationFrame(animationRef.current); }, 1500);
    });

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (isReady.current && map.current) {
      loadData(map.current, year, isWhatIf);
      map.current.setFilter("borders-highlight", [
        "all", ["==", ["geometry-type"], "Polygon"], ["==", ["get", "name"], ""],
      ]);
    }
  }, [year, isWhatIf, loadData]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0a0a0a]">
      <div ref={mapContainer} className="w-full h-full" />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-5"
        style={{ background: "radial-gradient(circle, #C5A059 0%, transparent 80%)", filter: "blur(80px)" }}
      />
    </div>
  );
});

HistoricalMap.displayName = "HistoricalMap";
export default HistoricalMap;