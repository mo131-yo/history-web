// "use client";

// import { useCallback, useEffect, useRef, useState } from "react";
// import dynamic from "next/dynamic";
// import type { AtlasFeatureCollection } from "@/lib/types";
// import { appendPointToDraftRing, insertPointIntoNearestSegment } from "@/lib/geometry";

// const Globe = dynamic(() => import("react-globe.gl").then((mod) => mod.default), {
//   ssr: false,
//   loading: () => (
//     <div className="flex h-full w-full items-center justify-center" style={{ background: "#020617" }}>
//       <div className="flex flex-col items-center gap-5">
//         <div className="relative h-20 w-20">
//           <div
//             className="absolute inset-0 rounded-full animate-spin"
//             style={{ border: "2px solid transparent", borderTopColor: "#f59e0b", borderRightColor: "#f59e0b44" }}
//           />
//           <div
//             className="absolute inset-3 rounded-full animate-spin"
//             style={{ border: "2px solid transparent", borderTopColor: "#d97706", animationDirection: "reverse", animationDuration: "1.4s" }}
//           />
//           <div className="absolute inset-6 rounded-full animate-pulse" style={{ background: "radial-gradient(circle, #f59e0b22, transparent)" }} />
//         </div>
//         <p className="text-[10px] uppercase tracking-[0.5em]" style={{ color: "#57534e", fontFamily: "Georgia, serif" }}>
//           Дэлхийн зураг ачаалж байна
//         </p>
//       </div>
//     </div>
//   ),
// }) as any;

// // ── Types ────────────────────────────────────────────────────────────────────
// type GlobePolygon = {
//   type: "Feature";
//   geometry: { type: "Polygon"; coordinates: number[][][] };
//   properties: { slug: string; name: string; color: string };
// };
// type GlobePoint = { lat: number; lng: number; index: number };

// interface GlobeMapProps {
//   collection: AtlasFeatureCollection | null;
//   selectedSlug: string | null;
//   onSelectSlug: (slug: string) => void;
//   isEditing: boolean;
//   isCreating: boolean;
//   addPointMode: boolean;
//   draftRing: Array<[number, number]>;
//   onDraftRingChange: (ring: Array<[number, number]>) => void;
// }

// // ── Helpers ──────────────────────────────────────────────────────────────────
// function hexToRgba(hex: string, alpha: number): string {
//   let h = hex.replace("#", "");
//   if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
//   if (h.length !== 6) return `rgba(201,164,93,${alpha})`;
//   const r = parseInt(h.substring(0, 2), 16);
//   const g = parseInt(h.substring(2, 4), 16);
//   const b = parseInt(h.substring(4, 6), 16);
//   return `rgba(${r},${g},${b},${alpha})`;
// }

// function lighten(hex: string, amt: number): string {
//   let h = hex.replace("#", "");
//   if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
//   const r = Math.min(255, Math.round(parseInt(h.slice(0,2), 16) + 255 * amt));
//   const g = Math.min(255, Math.round(parseInt(h.slice(2,4), 16) + 255 * amt));
//   const b = Math.min(255, Math.round(parseInt(h.slice(4,6), 16) + 255 * amt));
//   return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
// }

// function ringToCoords(ring: Array<[number, number]>): number[][][] {
//   if (ring.length < 3) return [ring.map(([lng, lat]) => [lng, lat])];
//   const closed =
//     ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1]
//       ? ring
//       : [...ring, ring[0]];
//   return [closed.map(([lng, lat]) => [lng, lat])];
// }

// // ── Component ────────────────────────────────────────────────────────────────
// export default function GlobeMap({
//   collection,
//   selectedSlug,
//   onSelectSlug,
//   isEditing,
//   isCreating,
//   addPointMode,
//   draftRing,
//   onDraftRingChange,
// }: GlobeMapProps) {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const globeRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
//   const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
//   const [mounted, setMounted] = useState(false);

//   // ── Interaction state (React state for proper re-render) ──────────────────
//   const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

//   // Stable refs for event handlers that shouldn't cause re-mounts
//   const isCreatingRef = useRef(isCreating);
//   const isEditingRef = useRef(isEditing);
//   const addPointModeRef = useRef(addPointMode);
//   const draftRingRef = useRef(draftRing);

//   useEffect(() => { isCreatingRef.current = isCreating; }, [isCreating]);
//   useEffect(() => { isEditingRef.current = isEditing; }, [isEditing]);
//   useEffect(() => { addPointModeRef.current = addPointMode; }, [addPointMode]);
//   useEffect(() => { draftRingRef.current = draftRing; }, [draftRing]);

//   useEffect(() => { setMounted(true); }, []);

//   // Responsive sizing
//   useEffect(() => {
//     if (!containerRef.current) return;
//     const ro = new ResizeObserver((entries) => {
//       const e = entries[0];
//       if (e) setDimensions({ width: e.contentRect.width, height: e.contentRect.height });
//     });
//     ro.observe(containerRef.current);
//     // Initial size
//     setDimensions({ width: containerRef.current.offsetWidth, height: containerRef.current.offsetHeight });
//     return () => ro.disconnect();
//   }, []);

//   // Fly to selected state centroid
//   useEffect(() => {
//     if (!globeRef.current || !selectedSlug || !collection) return;
//     const feature = collection.features.find((f) => f.properties.slug === selectedSlug);
//     if (!feature) return;
//     const ring = feature.geometry.coordinates[0] as [number, number][];
//     const pts = ring.length > 1 ? ring.slice(0, -1) : ring;
//     if (!pts.length) return;
//     const c = pts.reduce(
//       (a, [lng, lat]) => ({ lng: a.lng + lng / pts.length, lat: a.lat + lat / pts.length }),
//       { lng: 0, lat: 0 },
//     );
//     globeRef.current.pointOfView({ lat: c.lat, lng: c.lng, altitude: 1.4 }, 800);
//   }, [selectedSlug, collection]);

//   // ── Build polygon data ────────────────────────────────────────────────────
//   // NOTE: these depend on selectedSlug + hoveredSlug so they re-compute on interaction
//   // This is intentional — it's what makes hover/select work correctly
//   const polygonData: GlobePolygon[] = collection
//     ? collection.features.map((f) => ({
//         type: "Feature" as const,
//         geometry: f.geometry,
//         properties: {
//           slug: f.properties.slug,
//           name: f.properties.name,
//           color: f.properties.color ?? "#c9a45d",
//         },
//       }))
//     : [];

//   const draftPolygons: GlobePolygon[] =
//     isEditing && draftRing.length >= 3
//       ? [
//           {
//             type: "Feature" as const,
//             geometry: { type: "Polygon" as const, coordinates: ringToCoords(draftRing) },
//             properties: { slug: "__draft__", name: "Draft", color: "#f59e0b" },
//           },
//         ]
//       : [];

//   const allPolygons = [...polygonData, ...draftPolygons];

//   const vertexPoints: GlobePoint[] = isEditing
//     ? draftRing.map(([lng, lat], index) => ({ lat, lng, index }))
//     : [];

//   // ── Color accessors — use React state values directly ────────────────────
//   // These are recreated each render so they always have fresh selectedSlug/hoveredSlug
//   const getCapColor = useCallback(
//     (d: object) => {
//       const { slug, color } = (d as GlobePolygon).properties;
//       if (slug === "__draft__") return "rgba(245,158,11,0.25)";
//       if (slug === selectedSlug) return hexToRgba(lighten(color, 0.15), 0.72);
//       if (slug === hoveredSlug) return hexToRgba(lighten(color, 0.08), 0.55);
//       return hexToRgba(color, 0.38);
//     },
//     [selectedSlug, hoveredSlug],
//   );

//   const getSideColor = useCallback(
//     (d: object) => {
//       const { slug, color } = (d as GlobePolygon).properties;
//       if (slug === "__draft__") return "rgba(245,158,11,0.6)";
//       if (slug === selectedSlug) return hexToRgba(color, 0.9);
//       if (slug === hoveredSlug) return hexToRgba(color, 0.7);
//       return hexToRgba(color, 0.5);
//     },
//     [selectedSlug, hoveredSlug],
//   );

//   const getStrokeColor = useCallback(
//     (d: object) => {
//       const { slug } = (d as GlobePolygon).properties;
//       if (slug === "__draft__") return "#f59e0b";
//       if (slug === selectedSlug) return "#fbbf24";
//       if (slug === hoveredSlug) return "#e2e8f0";
//       return "rgba(15,23,42,0.6)";
//     },
//     [selectedSlug, hoveredSlug],
//   );

//   const getAltitude = useCallback(
//     (d: object) => {
//       const { slug } = (d as GlobePolygon).properties;
//       if (slug === "__draft__") return 0.018;
//       if (slug === selectedSlug) return 0.012;
//       if (slug === hoveredSlug) return 0.007;
//       return 0.002;
//     },
//     [selectedSlug, hoveredSlug],
//   );

//   const getStrokeWidth = useCallback(
//     (d: object) => {
//       const { slug } = (d as GlobePolygon).properties;
//       if (slug === selectedSlug) return 1.5;
//       if (slug === hoveredSlug) return 0.8;
//       return 0.3;
//     },
//     [selectedSlug, hoveredSlug],
//   );

//   // ── Event handlers (stable — use refs for mutable state) ─────────────────
//   const handlePolygonClick = useCallback(
//     (polygon: object) => {
//       if (isCreatingRef.current) return;
//       const { slug } = (polygon as GlobePolygon).properties;
//       if (slug && slug !== "__draft__") onSelectSlug(slug);
//     },
//     [onSelectSlug],
//   );

//   const handlePolygonHover = useCallback((polygon: object | null) => {
//     if (isCreatingRef.current) return;
//     const p = polygon as GlobePolygon | null;
//     const slug = p?.properties?.slug && p.properties.slug !== "__draft__" ? p.properties.slug : null;
//     setHoveredSlug(slug);
//   }, []);

//   const handleGlobeClick = useCallback(
//     ({ lat, lng }: { lat: number; lng: number }) => {
//       if (!isEditingRef.current) return;
//       const pt: [number, number] = [Number(lng.toFixed(5)), Number(lat.toFixed(5))];
//       if (isCreatingRef.current) {
//         onDraftRingChange(appendPointToDraftRing(draftRingRef.current, pt));
//         return;
//       }
//       if (addPointModeRef.current && draftRingRef.current.length >= 4) {
//         onDraftRingChange(insertPointIntoNearestSegment(draftRingRef.current, pt));
//       }
//     },
//     [onDraftRingChange],
//   );

//   if (!mounted) {
//     return (
//       <div
//         ref={containerRef}
//         className="h-full w-full"
//         style={{ background: "#020617" }}
//       />
//     );
//   }

//   return (
//     <div
//       ref={containerRef}
//       className="relative h-full w-full"
//       style={{ background: "radial-gradient(ellipse at center, #0f172a 0%, #020617 70%)" }}
//     >
//       {/* Starfield texture overlay */}
//       <div
//         className="pointer-events-none absolute inset-0 z-10 opacity-40"
//         style={{
//           backgroundImage:
//             "radial-gradient(1px 1px at 10% 15%, #e2e8f044, transparent), radial-gradient(1px 1px at 80% 25%, #f8fafc33, transparent), radial-gradient(1px 1px at 40% 80%, #e2e8f022, transparent), radial-gradient(1px 1px at 60% 60%, #cbd5e144, transparent)",
//         }}
//       />

//       <Globe
//         ref={globeRef}
//         width={dimensions.width}
//         height={dimensions.height}

//         // ── Globe visuals ────────────────────────────────────────────────
//         globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
//         bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
//         backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
//         atmosphereColor="#6366f1"
//         atmosphereAltitude={0.18}
//         showGraticules
//         // ─────────────────────────────────────────────────────────────────

//         // ── Polygons ─────────────────────────────────────────────────────
//         polygonsData={allPolygons}
//         polygonCapColor={getCapColor}
//         polygonSideColor={getSideColor}
//         polygonStrokeColor={getStrokeColor}
//         polygonAltitude={getAltitude}
//         polygonStrokeWidth={getStrokeWidth}
//         polygonLabel={(d: object) => {
//           const { slug, name, color } = (d as GlobePolygon).properties;
//           if (slug === "__draft__") return "";
//           const isSelected = slug === selectedSlug;
//           return `
//             <div style="
//               background: rgba(2,6,23,0.95);
//               border: 1px solid ${isSelected ? "#f59e0b" : color + "88"};
//               border-radius: 8px;
//               padding: 7px 13px;
//               font-family: Georgia, serif;
//               color: #e7e5e0;
//               font-size: 12px;
//               letter-spacing: 0.06em;
//               box-shadow: 0 4px 20px rgba(0,0,0,0.8), ${isSelected ? `0 0 0 1px #f59e0b44` : ""};
//               backdrop-filter: blur(8px);
//             ">
//               <span style="color: ${isSelected ? "#f59e0b" : color}; font-weight: 700; font-size: 13px;">${name}</span>
//             </div>
//           `;
//         }}
//         onPolygonClick={handlePolygonClick}
//         onPolygonHover={handlePolygonHover}
//         // ─────────────────────────────────────────────────────────────────

//         // ── Vertex points (edit mode) ─────────────────────────────────────
//         pointsData={vertexPoints}
//         pointColor={() => "#f8fafc"}
//         pointAltitude={() => 0.028}
//         pointRadius={() => 0.35}
//         pointLabel={(d: object) => {
//           const p = d as GlobePoint;
//           return `<div style="background: rgba(2,6,23,0.9); border-radius: 6px; padding: 3px 7px; color: #94a3b8; font-size: 10px;">#${p.index + 1}</div>`;
//         }}
//         // ─────────────────────────────────────────────────────────────────

//         onGlobeClick={handleGlobeClick}
//         enablePointerInteraction={true}
//       />

//       {/* ── Edit mode hint ──────────────────────────────────────────────── */}
//       {isEditing && (
//         <div
//           className="pointer-events-none absolute right-4 top-4 z-20 rounded-lg px-3 py-2 text-xs"
//           style={{
//             background: "rgba(2,6,23,0.9)",
//             border: "1px solid #1e40af44",
//             color: "#93c5fd",
//             backdropFilter: "blur(8px)",
//           }}
//         >
//           {draftRing.length} орой
//         </div>
//       )}

//       {/* ── Selected state quick info badge ────────────────────────────── */}
//       {selectedSlug && !isEditing && (() => {
//         const feat = collection?.features.find((f) => f.properties.slug === selectedSlug);
//         if (!feat) return null;
//         const color = feat.properties.color ?? "#f59e0b";
//         return (
//           <div
//             className="pointer-events-none absolute bottom-32 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 rounded-xl px-4 py-2.5"
//             style={{
//               background: "rgba(2,6,23,0.92)",
//               border: `1px solid ${color}55`,
//               boxShadow: `0 0 20px ${color}22`,
//               backdropFilter: "blur(12px)",
//             }}
//           >
//             <div
//               className="h-3 w-3 rounded-full shrink-0"
//               style={{ background: color, boxShadow: `0 0 8px ${color}` }}
//             />
//             <span
//               className="text-sm font-bold"
//               style={{ color: "#e7e5e0", fontFamily: "Georgia, serif" }}
//             >
//               {feat.properties.name}
//             </span>
//             <span className="text-xs" style={{ color: "#78716c" }}>
//               {feat.properties.capital}
//             </span>
//           </div>
//         );
//       })()}
//     </div>
//   );
// }



"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import type { AtlasFeatureCollection } from "@/lib/types";
import { appendPointToDraftRing, insertPointIntoNearestSegment } from "@/lib/geometry";

const Globe = dynamic(() => import("react-globe.gl").then((mod) => mod.default), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center" style={{ background: "#020617" }}>
      <div className="flex flex-col items-center gap-5">
        <div className="relative h-20 w-20">
          <div
            className="absolute inset-0 rounded-full animate-spin"
            style={{ border: "2px solid transparent", borderTopColor: "#f59e0b", borderRightColor: "#f59e0b44" }}
          />
          <div
            className="absolute inset-3 rounded-full animate-spin"
            style={{ border: "2px solid transparent", borderTopColor: "#d97706", animationDirection: "reverse", animationDuration: "1.4s" }}
          />
          <div className="absolute inset-6 rounded-full animate-pulse" style={{ background: "radial-gradient(circle, #f59e0b22, transparent)" }} />
        </div>
        <p className="text-[10px] uppercase tracking-[0.5em]" style={{ color: "#57534e", fontFamily: "Georgia, serif" }}>
          Дэлхийн зураг ачаалж байна
        </p>
      </div>
    </div>
  ),
}) as any;

// ── Types ────────────────────────────────────────────────────────────────────
type GlobePolygon = {
  type: "Feature";
  geometry: { type: "Polygon"; coordinates: number[][][] };
  properties: {
    slug: string;
    name: string;
    color: string;
    capital?: string;
    leader?: string;
  };
};
type GlobePoint = { lat: number; lng: number; index: number };
type GlobeLabel = {
  lat: number;
  lng: number;
  text: string;
  color: string;
  slug: string;
  isCapital?: boolean;
};

interface GlobeMapProps {
  collection: AtlasFeatureCollection | null;
  selectedSlug: string | null;
  onSelectSlug: (slug: string) => void;
  isEditing: boolean;
  isCreating: boolean;
  addPointMode: boolean;
  draftRing: Array<[number, number]>;
  onDraftRingChange: (ring: Array<[number, number]>) => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function hexToRgba(hex: string, alpha: number): string {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  if (h.length !== 6) return `rgba(201,164,93,${alpha})`;
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function lighten(hex: string, amt: number): string {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const r = Math.min(255, Math.round(parseInt(h.slice(0, 2), 16) + 255 * amt));
  const g = Math.min(255, Math.round(parseInt(h.slice(2, 4), 16) + 255 * amt));
  const b = Math.min(255, Math.round(parseInt(h.slice(4, 6), 16) + 255 * amt));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function ringToCoords(ring: Array<[number, number]>): number[][][] {
  if (ring.length < 3) return [ring.map(([lng, lat]) => [lng, lat])];
  const closed =
    ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1]
      ? ring
      : [...ring, ring[0]];
  return [closed.map(([lng, lat]) => [lng, lat])];
}

/** Compute centroid of a polygon ring */
function computeCentroid(coords: number[][]): { lat: number; lng: number } {
  const pts = coords.length > 1 &&
    coords[0][0] === coords[coords.length - 1][0] &&
    coords[0][1] === coords[coords.length - 1][1]
    ? coords.slice(0, -1)
    : coords;
  if (!pts.length) return { lat: 0, lng: 0 };
  const sum = pts.reduce(
    (acc, [lng, lat]) => ({ lng: acc.lng + lng, lat: acc.lat + lat }),
    { lng: 0, lat: 0 },
  );
  return { lat: sum.lat / pts.length, lng: sum.lng / pts.length };
}

// ── Component ────────────────────────────────────────────────────────────────
export default function GlobeMap({
  collection,
  selectedSlug,
  onSelectSlug,
  isEditing,
  isCreating,
  addPointMode,
  draftRing,
  onDraftRingChange,
}: GlobeMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [mounted, setMounted] = useState(false);

  // ── Hover state tracked via ref to avoid re-renders that kill interaction ──
  const hoveredSlugRef = useRef<string | null>(null);
  // We use a counter to force re-render only when hover actually changes
  const [hoverTick, setHoverTick] = useState(0);

  // Stable refs for event handlers
  const isCreatingRef = useRef(isCreating);
  const isEditingRef = useRef(isEditing);
  const addPointModeRef = useRef(addPointMode);
  const draftRingRef = useRef(draftRing);

  useEffect(() => { isCreatingRef.current = isCreating; }, [isCreating]);
  useEffect(() => { isEditingRef.current = isEditing; }, [isEditing]);
  useEffect(() => { addPointModeRef.current = addPointMode; }, [addPointMode]);
  useEffect(() => { draftRingRef.current = draftRing; }, [draftRing]);

  useEffect(() => { setMounted(true); }, []);

  // Responsive sizing
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const e = entries[0];
      if (e) setDimensions({ width: e.contentRect.width, height: e.contentRect.height });
    });
    ro.observe(containerRef.current);
    setDimensions({ width: containerRef.current.offsetWidth, height: containerRef.current.offsetHeight });
    return () => ro.disconnect();
  }, []);

  // Fly to selected state centroid
  useEffect(() => {
    if (!globeRef.current || !selectedSlug || !collection) return;
    const feature = collection.features.find((f) => f.properties.slug === selectedSlug);
    if (!feature) return;
    const ring = feature.geometry.coordinates[0] as [number, number][];
    const pts = ring.length > 1 ? ring.slice(0, -1) : ring;
    if (!pts.length) return;
    const c = pts.reduce(
      (a, [lng, lat]) => ({ lng: a.lng + lng / pts.length, lat: a.lat + lat / pts.length }),
      { lng: 0, lat: 0 },
    );
    globeRef.current.pointOfView({ lat: c.lat, lng: c.lng, altitude: 1.4 }, 800);
  }, [selectedSlug, collection]);

  // ── Build polygon data (memoized — only changes when collection/draftRing changes) ──
  const polygonData: GlobePolygon[] = useMemo(() => {
    if (!collection) return [];
    return collection.features.map((f) => ({
      type: "Feature" as const,
      geometry: f.geometry,
      properties: {
        slug: f.properties.slug,
        name: f.properties.name,
        color: f.properties.color ?? "#c9a45d",
        capital: f.properties.capital,
        leader: f.properties.leader,
      },
    }));
  }, [collection]);

  const draftPolygons: GlobePolygon[] = useMemo(() => {
    if (!isEditing || draftRing.length < 3) return [];
    return [
      {
        type: "Feature" as const,
        geometry: { type: "Polygon" as const, coordinates: ringToCoords(draftRing) },
        properties: { slug: "__draft__", name: "Draft", color: "#f59e0b" },
      },
    ];
  }, [isEditing, draftRing]);

  const allPolygons = useMemo(
    () => [...polygonData, ...draftPolygons],
    [polygonData, draftPolygons],
  );

  // ── Labels data: country names at centroids ───────────────────────────────
  const labelsData: GlobeLabel[] = useMemo(() => {
    if (!collection) return [];
    return collection.features.map((f) => {
      const centroid = computeCentroid(f.geometry.coordinates[0] as number[][]);
      return {
        lat: centroid.lat,
        lng: centroid.lng,
        text: f.properties.name,
        color: f.properties.color ?? "#c9a45d",
        slug: f.properties.slug,
      };
    });
  }, [collection]);

  const vertexPoints: GlobePoint[] = useMemo(
    () => (isEditing ? draftRing.map(([lng, lat], index) => ({ lat, lng, index })) : []),
    [isEditing, draftRing],
  );

  // ── Color accessors ──────────────────────────────────────────────────────
  // KEY FIX: Read hoveredSlugRef.current inside the accessor function
  // so we don't need hoveredSlug in the dependency array.
  // The hoverTick dependency forces re-creation when hover changes.

  const getCapColor = useCallback(
    (d: object) => {
      const { slug, color } = (d as GlobePolygon).properties;
      if (slug === "__draft__") return "rgba(245,158,11,0.25)";
      const hovered = hoveredSlugRef.current;
      if (slug === selectedSlug) return hexToRgba(lighten(color, 0.15), 0.72);
      if (slug === hovered) return hexToRgba(lighten(color, 0.08), 0.55);
      return hexToRgba(color, 0.38);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedSlug, hoverTick],
  );

  const getSideColor = useCallback(
    (d: object) => {
      const { slug, color } = (d as GlobePolygon).properties;
      if (slug === "__draft__") return "rgba(245,158,11,0.6)";
      const hovered = hoveredSlugRef.current;
      if (slug === selectedSlug) return hexToRgba(color, 0.9);
      if (slug === hovered) return hexToRgba(color, 0.7);
      return hexToRgba(color, 0.5);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedSlug, hoverTick],
  );

  const getStrokeColor = useCallback(
    (d: object) => {
      const { slug } = (d as GlobePolygon).properties;
      if (slug === "__draft__") return "#f59e0b";
      const hovered = hoveredSlugRef.current;
      if (slug === selectedSlug) return "#fbbf24";
      if (slug === hovered) return "#e2e8f0";
      return "rgba(15,23,42,0.6)";
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedSlug, hoverTick],
  );

  const getAltitude = useCallback(
    (d: object) => {
      const { slug } = (d as GlobePolygon).properties;
      if (slug === "__draft__") return 0.018;
      const hovered = hoveredSlugRef.current;
      if (slug === selectedSlug) return 0.012;
      if (slug === hovered) return 0.007;
      return 0.002;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedSlug, hoverTick],
  );

  const getStrokeWidth = useCallback(
    (d: object) => {
      const { slug } = (d as GlobePolygon).properties;
      const hovered = hoveredSlugRef.current;
      if (slug === selectedSlug) return 1.5;
      if (slug === hovered) return 0.8;
      return 0.3;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedSlug, hoverTick],
  );

  // ── Event handlers ────────────────────────────────────────────────────────
  const handlePolygonClick = useCallback(
    (polygon: object) => {
      if (isCreatingRef.current) return;
      const { slug } = (polygon as GlobePolygon).properties;
      if (slug && slug !== "__draft__") onSelectSlug(slug);
    },
    [onSelectSlug],
  );

  // KEY FIX: Use ref + tick pattern to avoid feedback loop
  const handlePolygonHover = useCallback((polygon: object | null) => {
    if (isCreatingRef.current) return;
    const p = polygon as GlobePolygon | null;
    const slug = p?.properties?.slug && p.properties.slug !== "__draft__" ? p.properties.slug : null;
    if (hoveredSlugRef.current !== slug) {
      hoveredSlugRef.current = slug;
      setHoverTick((t) => t + 1);
    }
  }, []);

  const handleGlobeClick = useCallback(
    ({ lat, lng }: { lat: number; lng: number }) => {
      if (!isEditingRef.current) return;
      const pt: [number, number] = [Number(lng.toFixed(5)), Number(lat.toFixed(5))];
      if (isCreatingRef.current) {
        onDraftRingChange(appendPointToDraftRing(draftRingRef.current, pt));
        return;
      }
      if (addPointModeRef.current && draftRingRef.current.length >= 4) {
        onDraftRingChange(insertPointIntoNearestSegment(draftRingRef.current, pt));
      }
    },
    [onDraftRingChange],
  );

  // ── Label accessors ────────────────────────────────────────────────────────
  const getLabelText = useCallback((d: object) => (d as GlobeLabel).text, []);
  const getLabelColor = useCallback(
    (d: object) => {
      const label = d as GlobeLabel;
      const hovered = hoveredSlugRef.current;
      if (label.slug === selectedSlug) return "#fbbf24";
      if (label.slug === hovered) return "#e2e8f0";
      return label.color;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedSlug, hoverTick],
  );
  const getLabelSize = useCallback(
    (d: object) => {
      const label = d as GlobeLabel;
      if (label.slug === selectedSlug) return 1.2;
      return 0.7;
    },
    [selectedSlug],
  );
  const getLabelDotRadius = useCallback(() => 0.3, []);
  const getLabelAltitude = useCallback(
    (d: object) => {
      const label = d as GlobeLabel;
      if (label.slug === selectedSlug) return 0.015;
      return 0.005;
    },
    [selectedSlug],
  );
  const getLabelResolution = useCallback(() => 3, []);

  if (!mounted) {
    return (
      <div
        ref={containerRef}
        className="h-full w-full"
        style={{ background: "#020617" }}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full"
      style={{ background: "radial-gradient(ellipse at center, #0f172a 0%, #020617 70%)" }}
    >
      {/* Starfield texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 10% 15%, #e2e8f044, transparent), radial-gradient(1px 1px at 80% 25%, #f8fafc33, transparent), radial-gradient(1px 1px at 40% 80%, #e2e8f022, transparent), radial-gradient(1px 1px at 60% 60%, #cbd5e144, transparent)",
        }}
      />

      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}

        // ── Globe visuals ────────────────────────────────────────────────
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        atmosphereColor="#6366f1"
        atmosphereAltitude={0.18}
        showGraticules

        // ── Polygons ─────────────────────────────────────────────────────
        polygonsData={allPolygons}
        polygonCapColor={getCapColor}
        polygonSideColor={getSideColor}
        polygonStrokeColor={getStrokeColor}
        polygonAltitude={getAltitude}
        polygonStrokeWidth={getStrokeWidth}
        polygonsTransitionDuration={0}
        polygonLabel={(d: object) => {
          const { slug, name, color } = (d as GlobePolygon).properties;
          if (slug === "__draft__") return "";
          const isSelected = slug === selectedSlug;
          return `
            <div style="
              background: rgba(2,6,23,0.95);
              border: 1px solid ${isSelected ? "#f59e0b" : color + "88"};
              border-radius: 8px;
              padding: 7px 13px;
              font-family: Georgia, serif;
              color: #e7e5e0;
              font-size: 12px;
              letter-spacing: 0.06em;
              box-shadow: 0 4px 20px rgba(0,0,0,0.8)${isSelected ? `, 0 0 0 1px #f59e0b44` : ""};
              backdrop-filter: blur(8px);
            ">
              <span style="color: ${isSelected ? "#f59e0b" : color}; font-weight: 700; font-size: 13px;">${name}</span>
            </div>
          `;
        }}
        onPolygonClick={handlePolygonClick}
        onPolygonHover={handlePolygonHover}

        // ── Country name labels (visible when zoomed) ─────────────────────
        labelsData={labelsData}
        labelText={getLabelText}
        labelColor={getLabelColor}
        labelSize={getLabelSize}
        labelDotRadius={getLabelDotRadius}
        labelAltitude={getLabelAltitude}
        labelResolution={getLabelResolution}
        labelsTransitionDuration={0}
        labelTypeFace={{
          // Use a built-in JSON typeface — or omit for default
        }}
        labelDotOrientation={() => "bottom" as const}

        // ── Vertex points (edit mode) ─────────────────────────────────────
        pointsData={vertexPoints}
        pointColor={() => "#f8fafc"}
        pointAltitude={() => 0.028}
        pointRadius={() => 0.35}
        pointLabel={(d: object) => {
          const p = d as GlobePoint;
          return `<div style="background: rgba(2,6,23,0.9); border-radius: 6px; padding: 3px 7px; color: #94a3b8; font-size: 10px;">#${p.index + 1}</div>`;
        }}

        onGlobeClick={handleGlobeClick}
        enablePointerInteraction={true}
      />

      {/* ── Edit mode hint ──────────────────────────────────────────────── */}
      {isEditing && (
        <div
          className="pointer-events-none absolute right-4 top-4 z-20 rounded-lg px-3 py-2 text-xs"
          style={{
            background: "rgba(2,6,23,0.9)",
            border: "1px solid #1e40af44",
            color: "#93c5fd",
            backdropFilter: "blur(8px)",
          }}
        >
          {draftRing.length} орой
        </div>
      )}

      {/* ── Selected state quick info badge ────────────────────────────── */}
      {selectedSlug && !isEditing && (() => {
        const feat = collection?.features.find((f) => f.properties.slug === selectedSlug);
        if (!feat) return null;
        const color = feat.properties.color ?? "#f59e0b";
        return (
          <div
            className="pointer-events-none absolute bottom-32 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 rounded-xl px-4 py-2.5"
            style={{
              background: "rgba(2,6,23,0.92)",
              border: `1px solid ${color}55`,
              boxShadow: `0 0 20px ${color}22`,
              backdropFilter: "blur(12px)",
            }}
          >
            <div
              className="h-3 w-3 rounded-full shrink-0"
              style={{ background: color, boxShadow: `0 0 8px ${color}` }}
            />
            <span
              className="text-sm font-bold"
              style={{ color: "#e7e5e0", fontFamily: "Georgia, serif" }}
            >
              {feat.properties.name}
            </span>
            <span className="text-xs" style={{ color: "#78716c" }}>
              {feat.properties.capital}
            </span>
          </div>
        );
      })()}
    </div>
  );
}   