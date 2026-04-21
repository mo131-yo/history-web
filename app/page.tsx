"use client";
// app/admin/page.tsx
// SSR-safe: maplibre-gl нь зөвхөн useEffect дотор dynamic import-оор ачаалагдана

import React, { useState, useEffect, useRef, useCallback } from "react";
import { RefreshCw, Globe, Eye } from "lucide-react";
import AIFeatureGenerator, { AIGeneratedFeature } from "./components/AIFeatureGenerator";
import CoordEditor, { FeatureForEdit } from "./components/CoordEditor";
import FeatureCard, { AdminFeature } from "./components/FeatureCard";
import YearManager from "./components/YearManager";

// maplibre CSS — зөвхөн нэг удаа inject хийнэ
function injectMaplibreCSS() {
  if (document.querySelector('link[data-maplibre]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css";
  link.setAttribute("data-maplibre", "1");
  document.head.appendChild(link);
}

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json";

// ─── Coordinates safe parse ───────────────────────────────────────────────
function safeParseCoords(raw: any): number[][] {
  if (!raw) return [];
  if (typeof raw === "string") {
    try { const p = JSON.parse(raw); return Array.isArray(p) ? p : []; }
    catch { return []; }
  }
  return Array.isArray(raw) ? raw : [];
}

// ─── GeoJSON → AdminFeature[] ─────────────────────────────────────────────
function geoJsonToAdminFeatures(data: any, year: number, isAlternate: boolean): AdminFeature[] {
  if (!data?.features) return [];
  return data.features.map((f: any) => {
    const geomType = f.geometry?.type;
    let coordinates: number[][] = [];
    if (geomType === "Polygon") {
      const ring = safeParseCoords(f.geometry.coordinates?.[0]);
      coordinates =
        ring.length > 1 && ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1]
          ? ring.slice(0, -1)
          : ring;
    } else if (geomType === "LineString") {
      coordinates = safeParseCoords(f.geometry.coordinates);
    } else if (geomType === "Point") {
      const pt = f.geometry.coordinates;
      coordinates = Array.isArray(pt[0]) ? pt : [pt];
    }
    return {
      id: f.id ?? f.properties?.id,
      year,
      is_alternate: isAlternate,
      name: f.properties?.name || "Нэргүй",
      feature_type: f.properties?.feature_type || "polygon",
      color: f.properties?.color || "#C5A059",
      properties: Object.fromEntries(
        Object.entries(f.properties || {}).filter(([k]) => !["id", "name", "color", "feature_type"].includes(k))
      ),
      coordinates,
    };
  });
}

// ─── Preview Map Hook (SSR-safe) ──────────────────────────────────────────
function usePreviewMap(containerRef: React.RefObject<HTMLDivElement>) {
  const mapRef = useRef<any>(null);
  const readyRef = useRef(false);
  const pendingRef = useRef<AdminFeature[] | null>(null);
  const mlRef = useRef<any>(null);

  const applyFeatures = useCallback((features: AdminFeature[], m: any) => {
    const src = m.getSource("pv");
    if (!src) return;
    const geoFeatures = features
      .filter((f) => f.coordinates && f.coordinates.length >= 3)
      .map((f) => {
        let ring = [...f.coordinates];
        if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) {
          ring = [...ring, ring[0]];
        }
        return {
          type: "Feature" as const,
          properties: { color: f.color, name: f.name },
          geometry: { type: "Polygon" as const, coordinates: [ring] },
        };
      });
    src.setData({ type: "FeatureCollection", features: geoFeatures });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    import("maplibre-gl").then((maplibregl) => {
      injectMaplibreCSS();
      mlRef.current = maplibregl;

      if (!container.isConnected || mapRef.current) return;

      const m = new maplibregl.Map({
        container,
        style: MAP_STYLE,
        center: [95, 45],
        zoom: 2,
        attributionControl: false,
      });
      mapRef.current = m;

      m.on("load", () => {
        m.addSource("pv", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
        m.addLayer({
          id: "pv-fill", type: "fill", source: "pv",
          paint: { "fill-color": ["coalesce", ["get", "color"], "#C5A059"], "fill-opacity": 0.4 },
        });
        m.addLayer({
          id: "pv-line", type: "line", source: "pv",
          paint: { "line-color": ["coalesce", ["get", "color"], "#ffffff"], "line-width": 1.5, "line-opacity": 0.85 },
        });

        readyRef.current = true;

        if (pendingRef.current !== null) {
          applyFeatures(pendingRef.current, m);
          pendingRef.current = null;
        }
      });

      m.on("error", (e: any) => console.error("Preview map error:", e.error?.message));
    }).catch((err) => console.error("maplibre-gl import failed:", err));

    return () => {
      readyRef.current = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateFeatures = useCallback((features: AdminFeature[]) => {
    if (!readyRef.current || !mapRef.current) {
      pendingRef.current = features;
      return;
    }
    applyFeatures(features, mapRef.current);
  }, [applyFeatures]);

  return { updateFeatures };
}

// ─── Main Admin Page ──────────────────────────────────────────────────────
export default function AdminPage() {
  const [year, setYear] = useState(1206);
  const [alternate, setAlternate] = useState(false);
  const [features, setFeatures] = useState<AdminFeature[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingFeature, setEditingFeature] = useState<FeatureForEdit | null>(null);
  const [tab, setTab] = useState<"features" | "years">("features");
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [previewReady, setPreviewReady] = useState(false);

 const previewRef = useRef<HTMLDivElement>(null);

// previewRef-ийг хүчээр RefObject<HTMLDivElement> болгох
const { updateFeatures } = usePreviewMap(previewRef as React.RefObject<HTMLDivElement>);

  useEffect(() => {
    updateFeatures(features);
  }, [features, updateFeatures]);

  const fetchYears = useCallback(async () => {
    try {
      const res = await fetch("/api/years");
      if (!res.ok) return;
      const data: { year: number }[] = await res.json();
      const years = data.map((y) => y.year).sort((a, b) => a - b);
      setAvailableYears(years);
    } catch {
      setAvailableYears([1206, 1227, 1260]);
    }
  }, []);

  useEffect(() => { fetchYears(); }, []); // eslint-disable-line

  const fetchFeatures = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/features?year=${year}&alternate=${alternate}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setFeatures(geoJsonToAdminFeatures(data, year, alternate));
    } catch (err) {
      console.error("fetchFeatures error:", err);
      setFeatures([]);
    } finally {
      setLoading(false);
    }
  }, [year, alternate]);

  useEffect(() => { fetchFeatures(); }, [fetchFeatures]);

  const handleApproveAI = async (generated: AIGeneratedFeature) => {
    const res = await fetch("/api/features", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        year, is_alternate: alternate, name: generated.name,
        feature_type: generated.feature_type, properties: generated.properties,
        coordinates: generated.coordinates, color: generated.color,
      }),
    });
    if (!res.ok) throw new Error("Save failed");
    await fetchFeatures();
  };

  const handleCoordSave = async (id: number, coords: number[][]) => {
    const res = await fetch(`/api/features/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coordinates: coords }),
    });
    if (!res.ok) throw new Error("Save failed");
    setFeatures((prev) => prev.map((f) => (f.id === id ? { ...f, coordinates: coords } : f)));
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Энэ feature-ийг устгах уу?")) return;
    const res = await fetch(`/api/features/${id}`, { method: "DELETE" });
    if (res.ok) setFeatures((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#080A12] text-slate-200" style={{ fontFamily: "system-ui, sans-serif" }}>
      {editingFeature && (
        <CoordEditor feature={editingFeature} onSave={handleCoordSave} onClose={() => setEditingFeature(null)} />
      )}

      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C5A059] to-[#8B6914] flex items-center justify-center text-black font-black text-sm select-none">А</div>
        <div>
          <h1 className="text-white font-bold text-base leading-none">Газрын зураг Admin</h1>
          <p className="text-white/25 text-xs mt-0.5">Neon PostgreSQL • Feature Manager</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-white/40 cursor-pointer select-none">
            <input type="checkbox" checked={alternate} onChange={(e) => setAlternate(e.target.checked)} className="rounded" />
            What-if
          </label>
          <button onClick={fetchFeatures} disabled={loading} className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white transition-colors">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      <div className="flex" style={{ height: "calc(100vh - 65px)" }}>
        {/* Left Panel */}
        <div className="w-[400px] flex-shrink-0 border-r border-white/10 flex flex-col overflow-hidden">
          <div className="flex border-b border-white/10 flex-shrink-0">
            {(["features", "years"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${tab === t ? "text-[#C5A059] border-b-2 border-[#C5A059]" : "text-white/30 hover:text-white/60"}`}>
                {t === "features" ? "🗺️ Features" : "📅 Онууд"}
              </button>
            ))}
          </div>

          {tab === "features" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Year selector */}
              <div className="px-4 py-3 border-b border-white/5 flex-shrink-0 flex items-center gap-2">
                <Globe size={13} className="text-white/30" />
                <span className="text-white/40 text-xs">Он:</span>
                <select value={year} onChange={(e) => setYear(Number(e.target.value))}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-[#C5A059]/50">
                  {(availableYears.length > 0 ? availableYears : [year]).map((y) => (
                    <option key={y} value={y}>{y} он</option>
                  ))}
                </select>
                <span className="text-white/20 text-[10px] tabular-nums">{features.length}f</span>
              </div>

              {/* AI Generator */}
              <div className="px-4 py-4 border-b border-white/5 flex-shrink-0">
                <p className="text-xs font-semibold text-white/50 mb-3">🤖 AI-аар feature үүсгэх</p>
                <AIFeatureGenerator year={year} isAlternate={alternate} onApprove={handleApproveAI} />
              </div>

              {/* Feature list */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
                {loading ? (
                  <div className="flex items-center justify-center py-10 text-white/20 text-sm gap-2">
                    <RefreshCw size={14} className="animate-spin" /> Ачаалж байна...
                  </div>
                ) : features.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="text-5xl mb-3 opacity-10">🗺️</div>
                    <p className="text-white/20 text-sm">{year} оны feature байхгүй</p>
                    <p className="text-white/10 text-xs mt-1">AI-аар нэмэх эсвэл он солих</p>
                  </div>
                ) : (
                  features.map((f) => (
                    <FeatureCard
                      key={f.id}
                      feature={f}
                      onDelete={() => handleDelete(f.id)}
                      onEditCoords={() => setEditingFeature({ id: f.id, name: f.name, color: f.color, coordinates: f.coordinates, feature_type: f.feature_type })}
                      onUpdated={(updated: AdminFeature) => setFeatures((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {tab === "years" && (
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <YearManager currentYear={year} onSelectYear={(y: number) => { setYear(y); setTab("features"); fetchYears(); }} />
            </div>
          )}
        </div>

        {/* Preview Map */}
        <div className="flex-1 relative overflow-hidden bg-[#080a12]">
          <div ref={previewRef} className="absolute inset-0" />

          <div className="absolute top-4 left-4 z-10 bg-[#080A12]/80 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2.5 pointer-events-none">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Eye size={12} />
              Preview — <span className="text-white/70 font-semibold">{year} он</span>
              {alternate && <span className="text-yellow-400/60 text-[10px] ml-1">what-if</span>}
              <span className="text-white/20">•</span>
              <span>{features.length} feature</span>
            </div>
          </div>

          <div className="absolute bottom-5 left-4 z-10 bg-[#080A12]/75 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 pointer-events-none">
            <p className="text-white/25 text-[11px] leading-5">
              ≡ товч → координат editor<br />
              🟡 Алт цэг = эхлэл · Чирж өөрчил<br />
              2× дарж устгах · + цэг нэмэх<br />
              <span className="text-emerald-400/50">✓ Хадгалахад DB шинэчлэгдэнэ</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}