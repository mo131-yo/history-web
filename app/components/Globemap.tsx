"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import type { AtlasFeatureCollection } from "@/lib/types";
import { appendPointToDraftRing, insertPointIntoNearestSegment } from "@/lib/geometry";

const Globe = dynamic(() => import("react-globe.gl").then((mod) => mod.default), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center" style={{ background: "#0c0a06" }}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full" style={{ border: "1.5px solid rgba(201,164,93,0.15)", animation: "spin 3s linear infinite" }} />
          <div className="absolute inset-0 rounded-full" style={{ border: "1.5px solid transparent", borderTopColor: "#c9a45d", animation: "spin 1.8s linear infinite" }} />
        </div>
        <p style={{ color: "#5c3d1a", fontSize: 10, letterSpacing: "0.35em", textTransform: "uppercase", fontFamily: "Georgia, serif" }}>
          Дэлхийн зураг ачаалж байна
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  ),
}) as any;

type GlobePolygon = {
  type: "Feature";
  geometry: { type: "Polygon"; coordinates: number[][][] };
  properties: { slug: string; name: string; color: string; capital?: string; leader?: string };
};
type GlobePoint = { lat: number; lng: number; index: number; isSelected: boolean; isHovered: boolean };
type GlobeLabel = { lat: number; lng: number; text: string; color: string; slug: string };

interface GlobeMapProps {
  collection: AtlasFeatureCollection | null;
  selectedSlug: string | null;
  onSelectSlug: (slug: string) => void;
  isEditing: boolean;
  isCreating: boolean;
  addPointMode: boolean;
  draftRing: Array<[number, number]>;
  onDraftRingChange: (ring: Array<[number, number]>) => void;
  selectedVertexIndex?: number | null;
  onSelectVertex?: (index: number | null) => void;
}

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

function computeCentroid(coords: number[][]): { lat: number; lng: number } {
  const pts =
    coords.length > 1 &&
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

function moveRingVertex(
  ring: Array<[number, number]>,
  index: number,
  coordinates: [number, number],
) {
  const nextRing = [...ring];
  if (!nextRing[index]) return nextRing;

  const isClosed =
    nextRing.length > 1 &&
    nextRing[0][0] === nextRing[nextRing.length - 1][0] &&
    nextRing[0][1] === nextRing[nextRing.length - 1][1];

  if (isClosed && (index === 0 || index === nextRing.length - 1)) {
    nextRing[0] = coordinates;
    nextRing[nextRing.length - 1] = coordinates;
  } else {
    nextRing[index] = coordinates;
  }

  return nextRing;
}

export default function GlobeMap({
  collection,
  selectedSlug,
  onSelectSlug,
  isEditing,
  isCreating,
  addPointMode,
  draftRing,
  onDraftRingChange,
  selectedVertexIndex = null,
  onSelectVertex,
}: GlobeMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [mounted, setMounted] = useState(false);
  const [hoveredVertexIndex, setHoveredVertexIndex] = useState<number | null>(null);
  const [isDraggingVertex, setIsDraggingVertex] = useState(false);

  const hoveredSlugRef = useRef<string | null>(null);
  const [hoverTick, setHoverTick] = useState(0);

  const isCreatingRef = useRef(isCreating);
  const isEditingRef = useRef(isEditing);
  const addPointModeRef = useRef(addPointMode);
  const draftRingRef = useRef(draftRing);
  const selectedVertexRef = useRef(selectedVertexIndex);
  const isDraggingRef = useRef(false);
  const dragVertexIndexRef = useRef<number | null>(null);

  useEffect(() => { isCreatingRef.current = isCreating; }, [isCreating]);
  useEffect(() => { isEditingRef.current = isEditing; }, [isEditing]);
  useEffect(() => { addPointModeRef.current = addPointMode; }, [addPointMode]);
  useEffect(() => { draftRingRef.current = draftRing; }, [draftRing]);
  useEffect(() => { selectedVertexRef.current = selectedVertexIndex; }, [selectedVertexIndex]);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || !globeRef.current) return;

    const globe = globeRef.current;
    const canvas = globe.renderer?.().domElement as HTMLCanvasElement | undefined;
    if (!canvas) return;

    const setControlsEnabled = (enabled: boolean) => {
      try {
        const controls = globe.controls?.();
        if (controls) controls.enabled = enabled;
      } catch {
      }
    };

    const getPointer = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const findNearestVertex = (event: MouseEvent) => {
      const ring = draftRingRef.current;
      if (!isEditingRef.current || ring.length === 0) return null;

      const pointer = getPointer(event);
      let closestIndex: number | null = null;
      let closestDistance = Infinity;

      ring.forEach(([lng, lat], index) => {
        const screen = globe.getScreenCoords?.(lat, lng, 0.035);
        if (!screen) return;
        const distance = Math.hypot(screen.x - pointer.x, screen.y - pointer.y);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      return closestDistance <= 28 ? closestIndex : null;
    };

    const writeVertexAtMouse = (event: MouseEvent) => {
      const index = dragVertexIndexRef.current;
      if (index === null) return;

      const { x, y } = getPointer(event);
      const coords = globe.toGlobeCoords?.(x, y);
      if (!coords || !Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) return;

      onDraftRingChange(
        moveRingVertex(draftRingRef.current, index, [
          Number(coords.lng.toFixed(5)),
          Number(coords.lat.toFixed(5)),
        ]),
      );
    };

    const handleMouseDown = (event: MouseEvent) => {
      const index = findNearestVertex(event);
      if (index === null) return;

      event.preventDefault();
      event.stopPropagation();
      dragVertexIndexRef.current = index;
      isDraggingRef.current = true;
      setIsDraggingVertex(true);
      onSelectVertex?.(index);
      setHoveredVertexIndex(index);
      setControlsEnabled(false);
      canvas.style.cursor = "grabbing";
      writeVertexAtMouse(event);
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (dragVertexIndexRef.current === null) {
        const index = findNearestVertex(event);
        canvas.style.cursor = index === null ? "" : "grab";
        return;
      }

      event.preventDefault();
      writeVertexAtMouse(event);
    };

    const handleWindowMouseMove = (event: MouseEvent) => {
      if (dragVertexIndexRef.current === null) return;
      event.preventDefault();
      writeVertexAtMouse(event);
    };

    const stopDragging = () => {
      if (dragVertexIndexRef.current === null) return;
      dragVertexIndexRef.current = null;
      window.setTimeout(() => {
        isDraggingRef.current = false;
      }, 0);
      setIsDraggingVertex(false);
      setControlsEnabled(true);
      canvas.style.cursor = "";
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", stopDragging);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", stopDragging);
      setControlsEnabled(true);
    };
  }, [mounted, onDraftRingChange, onSelectVertex]);

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

  useEffect(() => {
    if (!isEditing) return;
    const handleKey = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedVertexRef.current !== null) {
        const idx = selectedVertexRef.current;
        const ring = draftRingRef.current;
        if (ring.length <= 4) return; 
        const next = ring.filter((_, i) => i !== idx);
        onDraftRingChange(next);
        onSelectVertex?.(null);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isEditing, onDraftRingChange, onSelectVertex]);


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
    globeRef.current.pointOfView({ lat: c.lat, lng: c.lng, altitude: 1.2 }, 900);
  }, [selectedSlug, collection]);

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
    return [{
      type: "Feature" as const,
      geometry: { type: "Polygon" as const, coordinates: ringToCoords(draftRing) },
      properties: { slug: "__draft__", name: "Draft", color: "#d4a843" },
    }];
  }, [isEditing, draftRing]);

  const allPolygons = useMemo(
    () => [...polygonData, ...draftPolygons],
    [polygonData, draftPolygons],
  );

  const labelsData: GlobeLabel[] = useMemo(() => {
    if (!collection) return [];
    return collection.features.map((f) => {
      const centroid = computeCentroid(f.geometry.coordinates[0] as number[][]);
      return { lat: centroid.lat, lng: centroid.lng, text: f.properties.name, color: f.properties.color ?? "#c9a45d", slug: f.properties.slug };
    });
  }, [collection]);

  const vertexPoints: GlobePoint[] = useMemo(
    () =>
      isEditing
        ? draftRing.map(([lng, lat], index) => ({
            lat,
            lng,
            index,
            isSelected: index === selectedVertexIndex,
            isHovered: index === hoveredVertexIndex,
          }))
        : [],
    [isEditing, draftRing, selectedVertexIndex, hoveredVertexIndex],
  );

  const getCapColor = useCallback(
    (d: object) => {
      const { slug, color } = (d as GlobePolygon).properties;
      if (slug === "__draft__") return "rgba(212,168,67,0.22)";
      const hovered = hoveredSlugRef.current;
      if (slug === selectedSlug) return hexToRgba(lighten(color, 0.1), 0.68);
      if (slug === hovered) return hexToRgba(lighten(color, 0.05), 0.52);
      return hexToRgba(color, 0.35);
    },
    [selectedSlug, hoverTick],
  );

  const getSideColor = useCallback(
    (d: object) => {
      const { slug, color } = (d as GlobePolygon).properties;
      if (slug === "__draft__") return "rgba(212,168,67,0.55)";
      const hovered = hoveredSlugRef.current;
      if (slug === selectedSlug) return hexToRgba(color, 0.85);
      if (slug === hovered) return hexToRgba(color, 0.65);
      return hexToRgba(color, 0.45);
    },
    [selectedSlug, hoverTick],
  );

  const getStrokeColor = useCallback(
    (d: object) => {
      const { slug, color } = (d as GlobePolygon).properties;
      if (slug === "__draft__") return "#d4a843";
      const hovered = hoveredSlugRef.current;
      if (slug === selectedSlug) return lighten(color, 0.3);
      if (slug === hovered) return lighten(color, 0.15);
      return "rgba(20,12,0,0.55)";
    },
    [selectedSlug, hoverTick],
  );

  const getAltitude = useCallback(
    (d: object) => {
      const { slug } = (d as GlobePolygon).properties;
      if (slug === "__draft__") return 0.02;
      const hovered = hoveredSlugRef.current;
      if (slug === selectedSlug) return 0.014;
      if (slug === hovered) return 0.008;
      return 0.003;
    },
    [selectedSlug, hoverTick],
  );

  const getStrokeWidth = useCallback(
    (d: object) => {
      const { slug } = (d as GlobePolygon).properties;
      const hovered = hoveredSlugRef.current;
      if (slug === selectedSlug) return 1.8;
      if (slug === hovered) return 1.0;
      return 0.35;
    },
    [selectedSlug, hoverTick],
  );

  const handlePolygonClick = useCallback(
    (polygon: object) => {
      if (isCreatingRef.current) return;
      const { slug } = (polygon as GlobePolygon).properties;
      if (slug && slug !== "__draft__") onSelectSlug(slug);
    },
    [onSelectSlug],
  );

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
      if (isDraggingRef.current) return;
      if (!isEditingRef.current) return;

      const pt: [number, number] = [Number(lng.toFixed(5)), Number(lat.toFixed(5))];
      if (isCreatingRef.current) {
        onDraftRingChange(appendPointToDraftRing(draftRingRef.current, pt));
        return;
      }
      if (addPointModeRef.current && draftRingRef.current.length >= 4) {
        onDraftRingChange(insertPointIntoNearestSegment(draftRingRef.current, pt));
        return;
      }
      if (selectedVertexRef.current !== null) {
        onSelectVertex?.(null);
      }
    },
    [onDraftRingChange, onSelectVertex],
  );

  const handlePointClick = useCallback(
    (point: object) => {
      if (!isEditingRef.current) return;
      const p = point as GlobePoint;
      if (selectedVertexRef.current === p.index) {
        onSelectVertex?.(null);
      } else {
        onSelectVertex?.(p.index);
      }
    },
    [onSelectVertex],
  );

  const handlePointHover = useCallback((point: object | null) => {
    const p = point as GlobePoint | null;
    setHoveredVertexIndex(p ? p.index : null);
  }, []);

  const handlePointDragStart = useCallback(() => {
    isDraggingRef.current = true;
    setIsDraggingVertex(true);
    if (globeRef.current) {
      globeRef.current.controls().enabled = false;
    }
  }, []);

  const handlePointDrag = useCallback(
    (point: object, { lat, lng }: { lat: number; lng: number }) => {
      const p = point as GlobePoint;
      onDraftRingChange(
        moveRingVertex(draftRingRef.current, p.index, [
          Number(lng.toFixed(5)),
          Number(lat.toFixed(5)),
        ]),
      );
    },
    [onDraftRingChange],
  );

  const handlePointDragEnd = useCallback(() => {
    window.setTimeout(() => {
      isDraggingRef.current = false;
    }, 0);
    setIsDraggingVertex(false);
    if (globeRef.current) {
      globeRef.current.controls().enabled = true;
    }
  }, []);

  const getPointColor = useCallback(
    (d: object) => {
      const p = d as GlobePoint;
      if (p.isSelected) return "#f59e0b"; 
      if (p.isHovered) return "#ffffff";      
      return "#e8d8b8";                      
    },
    [],
  );

  const getPointRadius = useCallback(
    (d: object) => {
      const p = d as GlobePoint;
      if (p.isSelected) return 0.5;
      if (p.isHovered) return 0.45;
      return 0.28;
    },
    [],
  );

  const getPointAltitude = useCallback(
    (d: object) => {
      const p = d as GlobePoint;
      if (p.isSelected) return 0.06;
      if (p.isHovered) return 0.05;
      return 0.035;
    },
    [],
  );

  const getLabelText = useCallback((d: object) => (d as GlobeLabel).text, []);
  const getLabelColor = useCallback(
    (d: object) => {
      const label = d as GlobeLabel;
      const hovered = hoveredSlugRef.current;
      if (label.slug === selectedSlug) return "#f5e6c8";
      if (label.slug === hovered) return lighten(label.color, 0.2);
      return lighten(label.color, 0.05);
    },
    [selectedSlug, hoverTick],
  );
  const getLabelSize = useCallback(
    (d: object) => ((d as GlobeLabel).slug === selectedSlug ? 1.1 : 0.65),
    [selectedSlug],
  );
  const getLabelDotRadius = useCallback(() => 0.25, []);
  const getLabelAltitude = useCallback(
    (d: object) => ((d as GlobeLabel).slug === selectedSlug ? 0.018 : 0.006),
    [selectedSlug],
  );
  const getLabelResolution = useCallback(() => 3, []);

  if (!mounted) {
    return <div ref={containerRef} className="h-full w-full" style={{ background: "#0c0a06" }} />;
  }

  const selectedVertex = selectedVertexIndex !== null ? draftRing[selectedVertexIndex] : null;

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 40%, #1a1206 0%, #0c0a06 50%, #060402 100%)" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 12% 18%, rgba(245,230,200,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 85% 12%, rgba(245,230,200,0.35) 0%, transparent 100%),
            radial-gradient(1px 1px at 55% 88%, rgba(245,230,200,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 28% 72%, rgba(245,230,200,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 72% 45%, rgba(245,230,200,0.45) 0%, transparent 100%),
            radial-gradient(1px 1px at 40% 30%, rgba(245,230,200,0.25) 0%, transparent 100%),
            radial-gradient(1px 1px at 90% 70%, rgba(245,230,200,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 18% 55%, rgba(245,230,200,0.35) 0%, transparent 100%)
          `,
        }}
      />

      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl="https://unpkg.com/three-globe@2.31.1/example/img/earth-day.jpg"
        bumpImageUrl="https://unpkg.com/three-globe@2.31.1/example/img/earth-topology.png"
        backgroundImageUrl={null as any}
        backgroundColor="rgba(0,0,0,0)"
        atmosphereColor="#b4823c"
        atmosphereAltitude={0.15}
        showGraticules={true}
        graticuleColor="rgba(100,65,20,0.25)"
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
          return `<div style="background:rgba(10,6,2,0.93);border:1px solid ${isSelected ? "#c9a45d" : hexToRgba(color, 0.4)};border-radius:6px;padding:6px 11px;font-family:Georgia,serif;color:#e8d8b8;font-size:12px;letter-spacing:0.05em;box-shadow:0 4px 16px rgba(0,0,0,0.7);white-space:nowrap;"><span style="color:${isSelected ? "#d4a843" : lighten(color, 0.15)};font-weight:600;font-size:12px;">${name}</span></div>`;
        }}
        onPolygonClick={handlePolygonClick}
        onPolygonHover={handlePolygonHover}
        labelsData={labelsData}
        labelText={getLabelText}
        labelColor={getLabelColor}
        labelSize={getLabelSize}
        labelDotRadius={getLabelDotRadius}
        labelAltitude={getLabelAltitude}
        labelResolution={getLabelResolution}
        labelsTransitionDuration={0}
        labelDotOrientation={() => "bottom" as const}
        pointsData={vertexPoints}
        pointColor={getPointColor}
        pointAltitude={getPointAltitude}
        pointRadius={getPointRadius}
        pointsMerge={false}
        pointsTransitionDuration={0}
        pointLabel={(d: object) => {
          const p = d as GlobePoint;
          const isSelected = p.isSelected;
          return `<div style="background:rgba(10,6,2,0.92);border:1px solid ${isSelected ? "rgba(245,158,11,0.6)" : "rgba(201,164,93,0.3)"};border-radius:5px;padding:3px 8px;color:${isSelected ? "#f59e0b" : "#c9a45d"};font-size:10px;font-family:Georgia,serif;white-space:nowrap;">
            цэг #${p.index + 1}${isSelected ? " · сонгогдсон" : ""}
          </div>`;
        }}
        onPointClick={handlePointClick}
        onPointHover={handlePointHover}
        onPointDrag={handlePointDrag}
        onPointDragStart={handlePointDragStart}
        onPointDragEnd={handlePointDragEnd}
        onGlobeClick={handleGlobeClick}
        enablePointerInteraction={true}
      />

      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 42%, rgba(6,4,2,0.55) 70%, rgba(6,4,2,0.9) 100%)" }}
      />

      {isEditing && (
        <div
          className="pointer-events-none absolute left-4 top-4 z-20 flex flex-col gap-2"
          style={{ maxWidth: 220 }}
        >
          <div
            className="rounded-lg px-3 py-2 text-xs flex items-center gap-2"
            style={{
              background: "rgba(10,6,2,0.92)",
              border: "1px solid rgba(90,60,20,0.5)",
              color: "#c9a45d",
              fontFamily: "Georgia, serif",
              backdropFilter: "blur(4px)",
            }}
          >
            <span style={{ fontSize: 10, opacity: 0.7 }}>◆</span>
            <span>{draftRing.length} орой</span>
            {selectedVertexIndex !== null && (
              <span style={{ color: "#f59e0b", marginLeft: 4 }}>· #{selectedVertexIndex + 1} сонгосон</span>
            )}
          </div>

          {selectedVertex && (
            <div
              className="rounded-lg px-3 py-2 text-xs"
              style={{
                background: "rgba(10,6,2,0.92)",
                border: "1px solid rgba(245,158,11,0.3)",
                color: "#e8d8b8",
                fontFamily: "Georgia, serif",
                backdropFilter: "blur(4px)",
                fontSize: 10,
                lineHeight: 1.8,
              }}
            >
              <div style={{ color: "#f59e0b", marginBottom: 2, fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase" }}>
                #{selectedVertexIndex! + 1} цэг
              </div>
              <div>Урт: {selectedVertex[0].toFixed(4)}°</div>
              <div>Өрг: {selectedVertex[1].toFixed(4)}°</div>
              <div style={{ marginTop: 4, color: "#5c4020", fontSize: 9 }}>
                Чирж байршлыг өөрчил · Delete устгах
              </div>
            </div>
          )}

          {!selectedVertex && (
            <div
              className="rounded-lg px-3 py-1.5 text-xs"
              style={{
                background: "rgba(10,6,2,0.85)",
                border: "1px solid rgba(90,60,20,0.3)",
                color: "#5c4020",
                fontFamily: "Georgia, serif",
                backdropFilter: "blur(4px)",
                fontSize: 9,
                letterSpacing: "0.05em",
              }}
            >
              {isCreating
                ? "Газрын зураг дарж цэг нэм"
                : addPointMode
                ? "Дарж шинэ цэг оруул"
                : "Цэг дарж сонго · чир"}
            </div>
          )}
        </div>
      )}

      {isDraggingVertex && (
        <div
          className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.1)" }}
        >
          <div
            className="rounded-lg px-4 py-2 text-xs"
            style={{
              background: "rgba(10,6,2,0.92)",
              border: "1px solid rgba(245,158,11,0.4)",
              color: "#f59e0b",
              fontFamily: "Georgia, serif",
              fontSize: 11,
            }}
          >
            ⟳ Цэгийн байрлалыг өөрчилж байна…
          </div>
        </div>
      )}

      {selectedSlug && !isEditing && (() => {
        const feat = collection?.features.find((f) => f.properties.slug === selectedSlug);
        if (!feat) return null;
        const color = feat.properties.color ?? "#c9a45d";
        return (
          <div
            className="pointer-events-none absolute bottom-8 left-1/2 z-20 flex items-center gap-3 -translate-x-1/2"
            style={{
              background: "rgba(10,6,2,0.9)",
              border: `1px solid ${hexToRgba(color, 0.35)}`,
              borderRadius: 10,
              padding: "8px 18px",
              backdropFilter: "blur(8px)",
              boxShadow: "0 2px 20px rgba(0,0,0,0.6)",
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0, boxShadow: `0 0 6px ${hexToRgba(color, 0.7)}` }} />
            <span style={{ color: "#f0e0c0", fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.04em" }}>
              {feat.properties.name}
            </span>
            {feat.properties.capital && (
              <span style={{ color: "#7a5c2a", fontSize: 11, fontFamily: "Georgia, serif" }}>
                {feat.properties.capital}
              </span>
            )}
          </div>
        );
      })()}
    </div>
  );
}
