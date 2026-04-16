"use client";
import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from "react";
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

  useImperativeHandle(ref, () => ({
    flyToLocation: (center, zoom = 4) => {
      map.current?.flyTo({ center, zoom, speed: 0.8, curve: 1.4, essential: true });
    },
    highlightFeature: (name: string) => {
      if (!isReady.current) return;
      map.current?.setFilter("borders-highlight", ["all", ["==", ["geometry-type"], "Polygon"], ["==", ["get", "name"], name]]);
    },
    startQuiz: () => {
      console.log("Quiz started for year:", year);
    }
  }));

  const loadData = useCallback((m: maplibregl.Map, currentYear: number, alternate: boolean) => {
    const src = m.getSource("historical-data") as maplibregl.GeoJSONSource;
    if (!src) return;

    const dataPath = alternate && currentYear === 1206 
      ? `/data/${currentYear}_alternate.json` 
      : `/data/${currentYear}.json`;

    fetch(dataPath)
      .then((r) => r.json())
      .then((data) => {
        src.setData(data);
      })
      .catch((err) => {
        console.error("Дата ачаалахад алдаа гарлаа:", err);
        src.setData({ type: "FeatureCollection", features: [] });
      });
  }, []);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json",
      center: [105, 45],
      zoom: 3.5,
      attributionControl: false,
    });

    map.current.on("load", () => {
      const m = map.current!;

      // Ганц эх сурвалж (Source) ашиглана
      m.addSource("historical-data", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      // 1. Улсуудын хил (Polygons)
      m.addLayer({
        id: "borders-fill",
        type: "fill",
        source: "historical-data",
        filter: ["==", ["geometry-type"], "Polygon"],
        paint: {
          "fill-color": ["coalesce", ["get", "color"], "#C5A059"],
          "fill-opacity": 0.3,
        },
      });

      m.addLayer({
        id: "borders-line",
        type: "line",
        source: "historical-data",
        filter: ["==", ["geometry-type"], "Polygon"],
        paint: {
          "line-color": ["coalesce", ["get", "color"], "#ffffff"],
          "line-width": 1,
          "line-opacity": 0.5,
        },
      });

      // 2. Цэгүүд (Points - Нийслэл, Аймгууд)
      m.addLayer({
        id: "historical-points",
        type: "circle",
        source: "historical-data",
        filter: ["==", ["geometry-type"], "Point"],
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 4, 10, 8],
          "circle-color": ["coalesce", ["get", "color"], "#FFD700"],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      // 3. Бичвэр (Labels)
      m.addLayer({
        id: "points-labels",
        type: "symbol",
        source: "historical-data",
        layout: {
          "text-field": ["get", "name"],
          "text-size": 12,
          "text-offset": [0, 1.2],
          "text-anchor": "top",
        },
        paint: {
          "text-color": "#ffffff",
          "text-halo-color": "#000000",
          "text-halo-width": 1,
        },
      });

      // 4. Тодруулагч (Highlight Layer)
      m.addLayer({
        id: "borders-highlight",
        type: "line",
        source: "historical-data",
        filter: ["all", ["==", ["geometry-type"], "Polygon"], ["==", ["get", "name"], ""]],
        paint: {
          "line-color": "#FFD700",
          "line-width": 3,
        },
      });

      // Click Event - Polygon болон Point аль алин дээр ажиллана
      const interactiveLayers = ["borders-fill", "historical-points"];
      m.on("click", interactiveLayers, (e) => {
        if (e.features && e.features.length > 0) {
          const clickedFeature = e.features[0];
          onSelectFeature(clickedFeature);

          const name = clickedFeature.properties?.name;
          if (clickedFeature.geometry.type === "Polygon") {
            m.setFilter("borders-highlight", ["all", ["==", ["geometry-type"], "Polygon"], ["==", ["get", "name"], name]]);
          }

          m.flyTo({ center: e.lngLat, zoom: 4.5, speed: 0.8 });
        }
      });

      // Cursor change
      interactiveLayers.forEach(layer => {
        m.on("mouseenter", layer, () => m.getCanvas().style.cursor = "pointer");
        m.on("mouseleave", layer, () => m.getCanvas().style.cursor = "");
      });

      isReady.current = true;
      loadData(m, year, isWhatIf);
    });

    return () => map.current?.remove();
  }, []);

  useEffect(() => {
    if (isReady.current && map.current) {
      loadData(map.current, year, isWhatIf);
      // Он солигдоход тодруулгыг арилгана
      map.current.setFilter("borders-highlight", ["all", ["==", ["geometry-type"], "Polygon"], ["==", ["get", "name"], ""]]);
    }
  }, [year, isWhatIf, loadData]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0a0a0a]">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
});

HistoricalMap.displayName = "HistoricalMap";
export default HistoricalMap;