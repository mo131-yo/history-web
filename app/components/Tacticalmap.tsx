"use client";

/**
 * TacticalMap — Crusader Kings / Civ–style flat tactical map
 * Uses MapLibre GL for crisp polygon rendering.
 * Visual: aged parchment land, dark ink borders, glowing selected territory,
 *   hatching on fog-of-war areas, brass coordinate grid.
 */

import { useCallback, useEffect, useRef } from "react";
import maplibregl, { type GeoJSONSource, type MapMouseEvent } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { AtlasFeatureCollection } from "@/lib/types";
import { appendPointToDraftRing, insertPointIntoNearestSegment } from "@/lib/geometry";

interface TacticalMapProps {
  collection: AtlasFeatureCollection | null;
  selectedSlug: string | null;
  onSelectSlug: (slug: string) => void;
  isEditing: boolean;
  isCreating: boolean;
  addPointMode: boolean;
  draftRing: Array<[number, number]>;
  onDraftRingChange: (ring: Array<[number, number]>) => void;
}

// Parchment-style map tiles (Stadia Alidade Smooth — warm/muted)
// We override colours heavily via MapLibre paint expressions anyway
const MAP_STYLE = {
  version: 8 as const,
  glyphs: "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
  sources: {
    "carto-dark": {
      type: "raster" as const,
      tiles: ["https://a.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}@2x.png"],
      tileSize: 256,
      attribution: "© CartoDB",
    },
  },
  layers: [
    {
      id: "base-raster",
      type: "raster" as const,
      source: "carto-dark",
      paint: {
        "raster-opacity": 0.0, // hidden — we draw our own parchment below
      },
    },
  ],
  backgroundColor: "#2a1f0e",
};

function hexToVec(hex: string): [number, number, number] {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  return [
    parseInt(h.slice(0,2),16)/255,
    parseInt(h.slice(2,4),16)/255,
    parseInt(h.slice(4,6),16)/255,
  ];
}

function lighten(hex: string, amt = 0.25): string {
  let h = hex.replace("#","");
  if (h.length===3) h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  const r = Math.min(255, Math.round(parseInt(h.slice(0,2),16)+255*amt));
  const g = Math.min(255, Math.round(parseInt(h.slice(2,4),16)+255*amt));
  const b = Math.min(255, Math.round(parseInt(h.slice(4,6),16)+255*amt));
  return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
}

function createDraftGeoJSON(ring: Array<[number, number]>) {
  const display = ring.length >= 3
    ? (ring[0][0]===ring[ring.length-1][0] && ring[0][1]===ring[ring.length-1][1]
        ? ring : [...ring, ring[0]])
    : ring;
  return {
    type: "FeatureCollection" as const,
    features: display.length >= 4 ? [{
      type: "Feature" as const,
      geometry: { type: "Polygon" as const, coordinates: [display] },
      properties: {},
    }] : [],
  };
}

function createVertexGeoJSON(ring: Array<[number, number]>) {
  return {
    type: "FeatureCollection" as const,
    features: ring.map((coordinates, index) => ({
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates },
      properties: { index },
    })),
  };
}

function getFeatureBounds(feature: { geometry: { coordinates: number[][][] } }): maplibregl.LngLatBoundsLike | null {
  const ring = feature?.geometry?.coordinates?.[0];
  if (!ring?.length) return null;
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  for (const [lng, lat] of ring) {
    minLng = Math.min(minLng, lng); minLat = Math.min(minLat, lat);
    maxLng = Math.max(maxLng, lng); maxLat = Math.max(maxLat, lat);
  }
  if (![minLng,minLat,maxLng,maxLat].every(Number.isFinite)) return null;
  return [[minLng, minLat], [maxLng, maxLat]];
}

export default function TacticalMap({
  collection,
  selectedSlug,
  onSelectSlug,
  isEditing,
  isCreating,
  addPointMode,
  draftRing,
  onDraftRingChange,
}: TacticalMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const readyRef = useRef(false);
  const hoveredSlugRef = useRef<string | null>(null);
  const dragIndexRef = useRef<number | null>(null);

  // Stable refs for event handlers
  const collectionRef = useRef(collection);
  const selectedSlugRef = useRef(selectedSlug);
  const isEditingRef = useRef(isEditing);
  const isCreatingRef = useRef(isCreating);
  const addPointModeRef = useRef(addPointMode);
  const draftRingRef = useRef(draftRing);

  useEffect(() => { collectionRef.current = collection; }, [collection]);
  useEffect(() => { selectedSlugRef.current = selectedSlug; }, [selectedSlug]);
  useEffect(() => { isEditingRef.current = isEditing; }, [isEditing]);
  useEffect(() => { isCreatingRef.current = isCreating; }, [isCreating]);
  useEffect(() => { addPointModeRef.current = addPointMode; }, [addPointMode]);
  useEffect(() => { draftRingRef.current = draftRing; }, [draftRing]);

  // ── Map init ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE as maplibregl.StyleSpecification,
      center: [86, 40],
      zoom: 2.4,
      minZoom: 1.5,
      maxZoom: 8,
      attributionControl: false,
      renderWorldCopies: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true, visualizePitch: false }), "bottom-right");

    map.on("load", () => {
      readyRef.current = true;

      // ── Ocean / background ─────────────────────────────────────────
      map.addLayer({
        id: "ocean-bg",
        type: "background",
        paint: {
          "background-color": "#1a120a",
          "background-opacity": 1,
        },
      });

      // ── Graticule (coordinate grid lines) ─────────────────────────
      // Build graticule GeoJSON manually
      const graticuleFeatures: GeoJSON.Feature[] = [];
      for (let lng = -180; lng <= 180; lng += 10) {
        graticuleFeatures.push({
          type: "Feature", properties: {},
          geometry: { type: "LineString", coordinates: [[-180, lng > -180 ? -85 : -85],[180, -85]].map(() => [lng, 0]) },
        });
        graticuleFeatures.push({
          type: "Feature", properties: {},
          geometry: { type: "LineString", coordinates: Array.from({length: 18}, (_, i) => [lng, -85 + i * 10]) },
        });
      }
      for (let lat = -80; lat <= 80; lat += 10) {
        graticuleFeatures.push({
          type: "Feature", properties: {},
          geometry: { type: "LineString", coordinates: Array.from({length: 37}, (_, i) => [-180 + i * 10, lat]) },
        });
      }

      map.addSource("graticule", {
        type: "geojson",
        data: { type: "FeatureCollection", features: graticuleFeatures },
      });
      map.addLayer({
        id: "graticule-lines",
        type: "line",
        source: "graticule",
        paint: {
          "line-color": "#5c3d1a",
          "line-width": 0.4,
          "line-opacity": 0.5,
          "line-dasharray": [3, 5],
        },
      });

      // ── Atlas states source ────────────────────────────────────────
      map.addSource("atlas-states", {
        type: "geojson",
        data: collectionRef.current ?? { type: "FeatureCollection", features: [] },
      });

      // Territory fill — parchment colours tinted by state colour
      map.addLayer({
        id: "territory-fill",
        type: "fill",
        source: "atlas-states",
        paint: {
          "fill-color": ["coalesce", ["get", "color"], "#c9a45d"],
          "fill-opacity": [
            "case",
            ["==", ["get", "slug"], selectedSlugRef.current ?? ""], 0.55,
            0.30,
          ],
          "fill-antialias": true,
        },
      });

      // Territory inner glow (selected)
      map.addLayer({
        id: "territory-fill-selected",
        type: "fill",
        source: "atlas-states",
        filter: ["==", ["get", "slug"], ""],
        paint: {
          "fill-color": ["coalesce", ["get", "color"], "#c9a45d"],
          "fill-opacity": 0.22,
        },
      });

      // Thick dark ink border
      map.addLayer({
        id: "territory-border",
        type: "line",
        source: "atlas-states",
        paint: {
          "line-color": "#1a0f00",
          "line-width": 1.8,
          "line-opacity": 0.85,
        },
      });

      // Hover highlight border
      map.addLayer({
        id: "territory-hover",
        type: "line",
        source: "atlas-states",
        filter: ["==", ["get", "slug"], ""],
        paint: {
          "line-color": "#d4a843",
          "line-width": 2.5,
          "line-opacity": 0.9,
        },
      });

      // Selected glowing border
      map.addLayer({
        id: "territory-selected",
        type: "line",
        source: "atlas-states",
        filter: ["==", ["get", "slug"], ""],
        paint: {
          "line-color": "#f5c842",
          "line-width": 3.5,
          "line-opacity": 1,
          "line-blur": 0.5,
        },
      });

      // Territory name labels
      map.addLayer({
        id: "territory-labels",
        type: "symbol",
        source: "atlas-states",
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["Open Sans Semibold"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 2, 9, 4, 12, 6, 16],
          "text-max-width": 8,
          "text-letter-spacing": 0.08,
          "text-allow-overlap": false,
        },
        paint: {
          "text-color": "#f5e6c8",
          "text-halo-color": "rgba(10,5,0,0.9)",
          "text-halo-width": 1.8,
          "text-halo-blur": 0.3,
          "text-opacity": ["interpolate", ["linear"], ["zoom"], 1.5, 0, 2.2, 1],
        },
      });

      // ── Draft polygon ──────────────────────────────────────────────
      map.addSource("draft-poly", { type: "geojson", data: createDraftGeoJSON([]) });
      map.addSource("draft-verts", { type: "geojson", data: createVertexGeoJSON([]) });

      map.addLayer({
        id: "draft-fill",
        type: "fill",
        source: "draft-poly",
        paint: { "fill-color": "#d4a843", "fill-opacity": 0.15 },
      });
      map.addLayer({
        id: "draft-outline",
        type: "line",
        source: "draft-poly",
        paint: { "line-color": "#d4a843", "line-width": 2.5, "line-dasharray": [2, 1.5] },
      });
      map.addLayer({
        id: "draft-vertices",
        type: "circle",
        source: "draft-verts",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 2, 5, 7, 9],
          "circle-color": "#f5e6c8",
          "circle-stroke-color": "#8b5e1a",
          "circle-stroke-width": 2.5,
          "circle-opacity": 0.95,
        },
      });

      // Init filters
      if (selectedSlugRef.current) {
        map.setFilter("territory-selected", ["==", ["get", "slug"], selectedSlugRef.current]);
        map.setFilter("territory-fill-selected", ["==", ["get", "slug"], selectedSlugRef.current]);
        map.setPaintProperty("territory-fill", "fill-opacity", [
          "case", ["==", ["get", "slug"], selectedSlugRef.current], 0.55, 0.30,
        ]);
      }

      // ── Interactions ───────────────────────────────────────────────
      const interactiveLayers = ["territory-fill", "territory-labels"];

      map.on("click", interactiveLayers, (e) => {
        if (isCreatingRef.current) return;
        const slug = e.features?.[0]?.properties?.slug as string | undefined;
        if (!slug) return;
        onSelectSlug(slug);
        const f = collectionRef.current?.features.find(x => x.properties.slug === slug);
        if (f) {
          const bounds = getFeatureBounds(f);
          if (bounds) map.fitBounds(bounds, { padding: { top: 80, right: 380, bottom: 120, left: 60 }, maxZoom: 5, duration: 900 });
        }
      });

      map.on("mousemove", interactiveLayers, (e) => {
        if (isCreatingRef.current) return;
        const slug = e.features?.[0]?.properties?.slug as string | undefined;
        if (!slug || slug === hoveredSlugRef.current) return;
        hoveredSlugRef.current = slug;
        map.setFilter("territory-hover", ["==", ["get", "slug"], slug]);
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", interactiveLayers, () => {
        hoveredSlugRef.current = null;
        map.setFilter("territory-hover", ["==", ["get", "slug"], ""]);
        map.getCanvas().style.cursor = "";
      });

      // Vertex drag
      map.on("mousedown", "draft-vertices", (e) => {
        if (!isEditingRef.current) return;
        map.dragPan.disable();
        map.getCanvas().style.cursor = "grabbing";
        dragIndexRef.current = Number(e.features?.[0]?.properties?.index ?? -1);
        e.preventDefault();
      });

      map.on("dblclick", "draft-vertices", (e) => {
        if (!isEditingRef.current) return;
        e.preventDefault();
        const ring = draftRingRef.current;
        const idx = Number(e.features?.[0]?.properties?.index ?? -1);
        if (idx <= 0 || idx >= ring.length - 1 || ring.length <= 4) return;
        const next = [...ring]; next.splice(idx, 1);
        onDraftRingChange(next);
      });

      map.on("mousemove", (e) => {
        if (dragIndexRef.current === null) return;
        const idx = dragIndexRef.current;
        const ring = [...draftRingRef.current];
        const coord: [number, number] = [+e.lngLat.lng.toFixed(5), +e.lngLat.lat.toFixed(5)];
        if (idx === 0 || idx === ring.length - 1) { ring[0] = coord; ring[ring.length-1] = coord; }
        else ring[idx] = coord;
        onDraftRingChange(ring);
      });

      const stopDrag = () => {
        if (dragIndexRef.current === null) return;
        dragIndexRef.current = null;
        map.dragPan.enable();
        map.getCanvas().style.cursor = "";
      };
      map.on("mouseup", stopDrag);
      map.on("mouseleave", stopDrag);

      // Globe click — add draft points
      map.on("click", (e: MapMouseEvent) => {
        if (!isEditingRef.current) return;
        if (isCreatingRef.current) {
          onDraftRingChange(appendPointToDraftRing(draftRingRef.current, [+e.lngLat.lng.toFixed(5), +e.lngLat.lat.toFixed(5)]));
          return;
        }
        if (!addPointModeRef.current || draftRingRef.current.length < 4) return;
        onDraftRingChange(insertPointIntoNearestSegment(draftRingRef.current, [+e.lngLat.lng.toFixed(5), +e.lngLat.lat.toFixed(5)]));
      });
    });

    mapRef.current = map;

    const ro = containerRef.current ? new ResizeObserver(() => map.resize()) : null;
    ro?.observe(containerRef.current!);

    return () => {
      readyRef.current = false;
      ro?.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, [onSelectSlug, onDraftRingChange]);

  // ── Update map data ────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current || !map.isStyleLoaded()) return;
    (map.getSource("atlas-states") as GeoJSONSource | undefined)
      ?.setData(collection ?? { type: "FeatureCollection", features: [] });
  }, [collection]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current || !map.isStyleLoaded()) return;
    map.setFilter("territory-selected", ["==", ["get", "slug"], selectedSlug ?? ""]);
    map.setFilter("territory-fill-selected", ["==", ["get", "slug"], selectedSlug ?? ""]);
    map.setPaintProperty("territory-fill", "fill-opacity", [
      "case", ["==", ["get", "slug"], selectedSlug ?? ""], 0.55, 0.30,
    ]);
    if (selectedSlug && collection) {
      const f = collection.features.find(x => x.properties.slug === selectedSlug);
      if (f) {
        const bounds = getFeatureBounds(f);
        if (bounds) map.fitBounds(bounds, { padding: { top: 80, right: 380, bottom: 120, left: 60 }, maxZoom: 5, duration: 800 });
      }
    }
  }, [selectedSlug, collection]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current || !map.isStyleLoaded()) return;
    (map.getSource("draft-poly") as GeoJSONSource | undefined)
      ?.setData(isEditing ? createDraftGeoJSON(draftRing) : createDraftGeoJSON([]));
    (map.getSource("draft-verts") as GeoJSONSource | undefined)
      ?.setData(isEditing ? createVertexGeoJSON(draftRing) : createVertexGeoJSON([]));
  }, [draftRing, isEditing]);

  return (
    <div className="relative h-full w-full min-h-[420px] lg:min-h-0">
      {/* Parchment vignette overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 rounded-[28px]"
        style={{
          background: "radial-gradient(ellipse at center, transparent 55%, rgba(10,5,0,0.72) 100%)",
          mixBlendMode: "multiply",
        }}
      />
      {/* Scan-line texture */}
      <div
        className="pointer-events-none absolute inset-0 z-10 rounded-[28px] opacity-[0.04]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,220,120,0.6) 2px, rgba(255,220,120,0.6) 3px)",
          backgroundSize: "100% 3px",
        }}
      />

      <div ref={containerRef} className="h-full w-full rounded-[28px]" />

      {/* Compass rose */}
      <div className="pointer-events-none absolute right-16 bottom-16 z-20 opacity-30">
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
          <circle cx="28" cy="28" r="26" stroke="#c9a45d" strokeWidth="1" strokeDasharray="3 4"/>
          <path d="M28 4 L31 24 L28 20 L25 24 Z" fill="#c9a45d"/>
          <path d="M28 52 L31 32 L28 36 L25 32 Z" fill="#7a6040"/>
          <path d="M4 28 L24 25 L20 28 L24 31 Z" fill="#7a6040"/>
          <path d="M52 28 L32 25 L36 28 L32 31 Z" fill="#c9a45d"/>
          <circle cx="28" cy="28" r="4" fill="#c9a45d" opacity="0.6"/>
          <text x="28" y="13" textAnchor="middle" fill="#c9a45d" fontSize="7" fontFamily="serif">N</text>
        </svg>
      </div>

      {/* Map hint banner */}
      <div className="pointer-events-none absolute bottom-4 left-4 z-20">
        <div
          className="rounded border px-3 py-2 text-xs"
          style={{
            background: "rgba(16,9,3,0.88)",
            borderColor: "#5c3d1a",
            color: "#c9a45d",
            fontFamily: "Georgia, serif",
            letterSpacing: "0.04em",
          }}
        >
          {isEditing
            ? isCreating ? "► Нутаг дэвсгэр зур — газрын зураг дарна уу"
              : addPointMode ? "► Шинэ орой нэм"
              : "► Засварлах горим идэвхтэй"
            : "► Нутаг дэвсгэр дарж дэлгэрэнгүйг харна уу"}
        </div>
      </div>

      {isEditing && (
        <div
          className="pointer-events-none absolute right-4 top-4 z-20 rounded border px-3 py-2 text-xs"
          style={{ background: "rgba(16,9,3,0.88)", borderColor: "#5c3d1a", color: "#d4a843", fontFamily: "Georgia, serif" }}
        >
          {draftRing.length} орой
        </div>
      )}
    </div>
  );
}