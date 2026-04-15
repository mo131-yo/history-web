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

interface Props {
  year: number;
}

const HistoricalMap = forwardRef((props: Props, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const isReady = useRef(false);
  const animationRef = useRef<number | null>(null);

  useImperativeHandle(ref, () => ({
    flyToLocation: (center: [number, number], zoom = 4) => {
      map.current?.flyTo({
        center,
        zoom,
        speed: 0.8,
        curve: 1.4,
        essential: true,
      });
    },

    highlightFeature: (name: string) => {
      if (!isReady.current) return;
      map.current?.setFilter("borders-highlight", [
        "==",
        ["get", "name"],
        name,
      ]);
    },
  }));

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json",
      center: [45, 15],
      zoom: 2.5, 
      attributionControl: false,
    } as any);

    map.current.on("load", () => {
      const m = map.current as any;

      if (typeof m.setProjection === "function") {
        m.setProjection({ type: "globe" });
      }

      if (typeof m.setFog === "function") {
        m.setFog({
          color: "#0b1621",
          "high-color": "#010509",
          "space-color": "#000000",
          "star-intensity": 0.8,
          "horizon-blend": 0.05,
        });
      }

      m.addSource("historical-borders", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      }); 

      m.addLayer({
        id: "borders-fill",
        type: "fill",
        source: "historical-borders",
        paint: {
          "fill-color": ["coalesce", ["get", "color"], "#C5A059"],
          "fill-opacity": 0.4,
        },
      });

      m.addLayer({
        id: "borders-line",
        type: "line",
        source: "historical-borders",
        paint: {
          "line-color": "rgba(255,255,255,0.2)",
          "line-width": 0.5,
        },
      });

      m.addLayer({
        id: "borders-highlight",
        type: "fill",
        source: "historical-borders",
        paint: {
          "fill-color": ["coalesce", ["get", "color"], "#C5A059"],
          "fill-opacity": 0.8,
        },
        filter: ["==", ["get", "name"], ""],
      });

      isReady.current = true;
      loadData(m, props.year);

      const rotate = () => {
        const center = m.getCenter();
        center.lng += 0.1;
        m.setCenter(center);
        animationRef.current = requestAnimationFrame(rotate);
      };
      rotate();

      setTimeout(() => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        m.flyTo({
          center: [105, 45],
          zoom: 3.8,
          speed: 0.5,
          curve: 1.5,
          essential: true
        });
        
        m.setFilter("borders-highlight", ["==", ["get", "name"], "Их Монгол Улс"]);
      }, 3000);
    });

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      map.current?.remove();
    };
  }, []);

  const loadData = useCallback((m: maplibregl.Map, year: number) => {
    const src = m.getSource("historical-borders") as maplibregl.GeoJSONSource;
    if (!src) return;

    fetch(`/data/${year}.json`)
      .then((r) => r.json())
      .then((data) => src.setData(data))
      .catch(() => src.setData({ type: "FeatureCollection", features: [] }));
  }, []);

  useEffect(() => {
    if (isReady.current && map.current) {
      loadData(map.current, props.year);
    }
  }, [props.year, loadData]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      <div ref={mapContainer} className="w-full h-full" />
      
      <div 
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] opacity-20"
        style={{ 
          background: "radial-gradient(circle, #245cdf 0%, transparent 70%)",
          filter: "blur(80px)"
        }} 
      />
    </div>
  );
});

HistoricalMap.displayName = "HistoricalMap";
export default HistoricalMap;