"use client";
// components/admin/CoordEditor.tsx
// SSR-safe: maplibre-gl нь зөвхөн useEffect дотор dynamic import-оор ачаалагдана

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Save, X, RefreshCw, Plus, MousePointer, Move } from "lucide-react";

export interface FeatureForEdit {
  id: number;
  name: string;
  color: string;
  coordinates: number[][];
  feature_type: "polygon" | "line" | "point";
}

interface Props {
  feature: FeatureForEdit;
  onSave: (id: number, coords: number[][]) => Promise<void>;
  onClose: () => void;
}

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json";

function getBounds(coords: number[][]): [[number, number], [number, number]] {
  const lngs = coords.map((c) => c[0]);
  const lats = coords.map((c) => c[1]);
  const pad = 2;
  return [
    [Math.min(...lngs) - pad, Math.min(...lats) - pad],
    [Math.max(...lngs) + pad, Math.max(...lats) + pad],
  ];
}

export default function CoordEditor({ feature, onSave, onClose }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  // maplibre types — any ашиглана учир нь SSR-д import хийхгүй
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const coordsRef = useRef<number[][]>(feature.coordinates.map((c) => [...c]));
  const [coords, setCoords] = useState<number[][]>(
    feature.coordinates.map((c) => [...c])
  );
  const [saving, setSaving] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const addModeRef = useRef(false);
  const mapReadyRef = useRef(false);
  // maplibre module ref — dynamic import хийгдсэний дараа байна
  const mlRef = useRef<any>(null);

  useEffect(() => {
    addModeRef.current = addMode;
  }, [addMode]);

  const refreshGeoJSON = useCallback((c: number[][], m: any) => {
    const src = m.getSource("coord-poly");
    if (!src) return;

    if (feature.feature_type === "polygon" && c.length >= 3) {
      let ring = [...c];
      if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) {
        ring = [...ring, [...ring[0]]];
      }
      src.setData({
        type: "FeatureCollection",
        features: [{ type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [ring] } }],
      });
    } else if (feature.feature_type === "line" && c.length >= 2) {
      src.setData({
        type: "FeatureCollection",
        features: [{ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: c } }],
      });
    }
  }, [feature.feature_type]);

  const buildMarkers = useCallback((c: number[][], m: any, maplibregl: any) => {
    markersRef.current.forEach((mk) => mk.remove());
    markersRef.current = [];

    c.forEach((coord, i) => {
      const isFirst = i === 0;
      const el = document.createElement("div");
      el.style.cssText = `
        width:${isFirst ? 18 : 13}px;
        height:${isFirst ? 18 : 13}px;
        border-radius:50%;
        background:${isFirst ? "#FFD700" : feature.color};
        border:${isFirst ? "3px" : "2px"} solid rgba(255,255,255,0.9);
        cursor:grab;
        box-shadow:0 2px 10px rgba(0,0,0,0.6);
        transition:transform 0.12s;
        position:relative;
      `;
      el.title = `Цэг ${i + 1}${isFirst ? " (эхлэл)" : ""}`;
      el.onmouseenter = () => { el.style.transform = "scale(1.55)"; };
      el.onmouseleave = () => { el.style.transform = "scale(1)"; };

      const mk = new maplibregl.Marker({ element: el, draggable: true })
        .setLngLat(coord as [number, number])
        .addTo(m);

      mk.on("drag", () => {
        const ll = mk.getLngLat();
        coordsRef.current = coordsRef.current.map((x, idx) =>
          idx === i ? [ll.lng, ll.lat] : x
        );
        refreshGeoJSON(coordsRef.current, m);
      });

      mk.on("dragend", () => {
        const ll = mk.getLngLat();
        coordsRef.current = coordsRef.current.map((x, idx) =>
          idx === i ? [parseFloat(ll.lng.toFixed(5)), parseFloat(ll.lat.toFixed(5))] : x
        );
        refreshGeoJSON(coordsRef.current, m);
        setCoords([...coordsRef.current]);
      });

      el.addEventListener("dblclick", (e) => {
        e.stopPropagation();
        if (coordsRef.current.length <= 3) { alert("Хамгийн багадаа 3 цэг байх ёстой"); return; }
        const updated = coordsRef.current.filter((_, idx) => idx !== i);
        coordsRef.current = updated;
        setCoords([...updated]);
        buildMarkers(updated, m, maplibregl);
        refreshGeoJSON(updated, m);
      });

      markersRef.current.push(mk);
    });
  }, [feature.color, refreshGeoJSON]);

  // Map init — dynamic import ашиглан SSR-ийг тойрно
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const container = mapContainer.current;
    const initCoords = coordsRef.current;

    // maplibre-gl-г зөвхөн browser-т dynamic import хийнэ
    import("maplibre-gl").then((maplibregl) => {
      // CSS
      if (!document.querySelector('link[href*="maplibre-gl"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css";
        document.head.appendChild(link);
      }

      mlRef.current = maplibregl;

      // Container хаагдсан эсэхийг шалгана
      if (!container.isConnected) return;

      const m = new maplibregl.Map({
        container,
        style: MAP_STYLE,
        center: [
          initCoords.reduce((s, c) => s + c[0], 0) / initCoords.length,
          initCoords.reduce((s, c) => s + c[1], 0) / initCoords.length,
        ],
        zoom: 3,
        attributionControl: false,
      });
      mapRef.current = m;

      m.on("load", () => {
        setMapLoaded(true);

        // Polygon-г бүрэн харуулахаар fitBounds
        m.fitBounds(getBounds(initCoords), { padding: 80, duration: 600, maxZoom: 7 });

        // Polygon ring
        let initRing = [...initCoords];
        if (
          feature.feature_type === "polygon" &&
          initRing.length >= 3 &&
          (initRing[0][0] !== initRing[initRing.length - 1][0] ||
            initRing[0][1] !== initRing[initRing.length - 1][1])
        ) {
          initRing = [...initRing, [...initRing[0]]];
        }

        m.addSource("coord-poly", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [{
              type: "Feature", properties: {},
              geometry:
                feature.feature_type === "polygon"
                  ? { type: "Polygon", coordinates: [initRing] }
                  : { type: "LineString", coordinates: initCoords },
            }],
          },
        });

        if (feature.feature_type === "polygon") {
          m.addLayer({ id: "coord-fill", type: "fill", source: "coord-poly",
            paint: { "fill-color": feature.color, "fill-opacity": 0.18 } });
        }
        m.addLayer({ id: "coord-outline", type: "line", source: "coord-poly",
          paint: { "line-color": feature.color, "line-width": 2.5, "line-opacity": 0.9 } });

        mapReadyRef.current = true;
        buildMarkers(coordsRef.current, m, maplibregl);

        m.on("click", (e: any) => {
          if (!addModeRef.current) return;
          const newCoord = [parseFloat(e.lngLat.lng.toFixed(5)), parseFloat(e.lngLat.lat.toFixed(5))];
          const updated = [...coordsRef.current, newCoord];
          coordsRef.current = updated;
          setCoords([...updated]);
          buildMarkers(updated, m, maplibregl);
          refreshGeoJSON(updated, m);
          setAddMode(false);
        });
      });

      m.on("error", (e: any) => {
        console.error("Map style error:", e.error);
        setMapError("Газрын зурагт холбогдоход алдаа гарлаа. Интернэт холболтоо шалгана уу.");
      });
    }).catch((err) => {
      console.error("maplibre-gl import error:", err);
      setMapError("maplibre-gl ачаалахад алдаа гарлаа.");
    });

    return () => {
      mapReadyRef.current = false;
      markersRef.current.forEach((mk) => mk.remove());
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReset = () => {
    if (!confirm("Анхны координат руу буцах уу?")) return;
    const orig = feature.coordinates.map((c) => [...c]);
    coordsRef.current = orig;
    setCoords([...orig]);
    if (mapRef.current && mapReadyRef.current && mlRef.current) {
      buildMarkers(orig, mapRef.current, mlRef.current);
      refreshGeoJSON(orig, mapRef.current);
      mapRef.current.fitBounds(getBounds(orig), { padding: 80, duration: 400, maxZoom: 7 });
    }
  };

  const handleFit = () => {
    if (mapRef.current && coordsRef.current.length >= 2) {
      mapRef.current.fitBounds(getBounds(coordsRef.current), { padding: 80, duration: 400, maxZoom: 7 });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(feature.id, coordsRef.current);
      onClose();
    } catch {
      alert("Хадгалахад алдаа гарлаа.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="bg-[#0d0f1a] border border-white/10 rounded-2xl w-full max-w-5xl flex flex-col shadow-2xl overflow-hidden"
        style={{ height: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-white/8 bg-[#080a12] flex-shrink-0">
          <div className="w-3 h-3 rounded-full ring-2 ring-white/20 flex-shrink-0" style={{ background: feature.color }} />
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm leading-none truncate">{feature.name}</p>
            <p className="text-white/25 text-[10px] mt-0.5">
              <span className="text-yellow-400/60">●</span> Алт = эхний цэг &nbsp;·&nbsp; Чирж өөрчил &nbsp;·&nbsp; 2× товш = устгах
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={handleFit} className="px-2.5 py-1.5 rounded-lg text-[11px] bg-white/5 border border-white/10 text-white/40 hover:text-white/80 hover:bg-white/8 transition-all flex items-center gap-1">
              <Move size={11} /> Fit
            </button>
            <button onClick={handleReset} className="px-2.5 py-1.5 rounded-lg text-[11px] bg-white/5 border border-white/10 text-white/40 hover:text-white/80 hover:bg-white/8 transition-all flex items-center gap-1">
              <RefreshCw size={11} /> Reset
            </button>
            <button
              onClick={() => setAddMode((v) => !v)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all flex items-center gap-1 ${
                addMode ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-300" : "bg-white/5 border-white/10 text-white/50 hover:bg-white/8"
              }`}
            >
              <Plus size={11} />
              {addMode ? "Map дарна уу..." : "+ Цэг"}
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-white/25 hover:text-white/70 hover:bg-white/8">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Map area */}
        <div className="flex-1 relative overflow-hidden bg-[#0a0c14]">
          <div ref={mapContainer} className="absolute inset-0" />

          {/* Loading state */}
          {!mapLoaded && !mapError && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="flex items-center gap-2 text-white/30 text-xs">
                <RefreshCw size={13} className="animate-spin" />
                Газрын зураг ачаалж байна...
              </div>
            </div>
          )}

          {/* Error state */}
          {mapError && (
            <div className="absolute inset-0 flex items-center justify-center z-10 p-8">
              <div className="bg-red-950/80 border border-red-500/30 rounded-xl px-6 py-4 text-red-300 text-sm text-center max-w-sm">
                <p className="font-semibold mb-1">Газрын зураг ачаалагдсангүй</p>
                <p className="text-red-400/70 text-xs">{mapError}</p>
              </div>
            </div>
          )}

          {addMode && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none bg-emerald-600/90 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
              <MousePointer size={12} /> Map дээр дарж цэг нэмнэ
            </div>
          )}

          <div className="absolute top-3 right-3 z-10 pointer-events-none bg-black/55 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-white/40">
            <span className="text-white/70 font-bold tabular-nums">{coords.length}</span> цэг
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-white/8 px-5 py-3 flex items-center gap-3 bg-[#080a12]">
          <span className="text-white/20 text-[11px] flex-1 tabular-nums">id:{feature.id} · {feature.feature_type}</span>
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-white/10 text-white/35 text-sm hover:bg-white/5">Цуцлах</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-[#C5A059] text-black font-bold text-sm hover:bg-[#d4b06a] disabled:opacity-40 flex items-center gap-2"
          >
            {saving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
            Хадгалах
          </button>
        </div>
      </div>
    </div>
  );
}