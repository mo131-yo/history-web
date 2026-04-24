"use client";

import { useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import { appendPointToDraftRing, insertPointIntoNearestSegment } from "@/lib/geometry";
import { moveRingVertex } from "./globeMath";
import type { GlobeMapProps } from "./globeTypes";

type GlobeInstance = {
  controls?: () => { enabled: boolean };
  getScreenCoords?: (lat: number, lng: number, altitude: number) => { x: number; y: number } | null;
  pointOfView: (view: { lat: number; lng: number; altitude: number }, duration?: number) => void;
  renderer?: () => { domElement: HTMLCanvasElement };
  toGlobeCoords?: (x: number, y: number) => { lat: number; lng: number } | null;
};

export function useGlobeEditor({
  addPointMode,
  collection,
  draftRing,
  isCreating,
  isEditing,
  onDraftRingChange,
  onSelectVertex,
  selectedSlug,
  selectedVertexIndex,
}: Pick<
  GlobeMapProps,
  | "addPointMode"
  | "collection"
  | "draftRing"
  | "isCreating"
  | "isEditing"
  | "onDraftRingChange"
  | "onSelectVertex"
  | "selectedSlug"
  | "selectedVertexIndex"
>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeInstance | null>(null);
  const hoveredSlugRef = useRef<string | null>(null);
  const draftRingRef = useRef(draftRing);
  const selectedVertexRef = useRef<number | null>(selectedVertexIndex ?? null);
  const isEditingRef = useRef(isEditing);
  const isCreatingRef = useRef(isCreating);
  const addPointModeRef = useRef(addPointMode);
  const isDraggingRef = useRef(false);
  const dragVertexIndexRef = useRef<number | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoverTick, setHoverTick] = useState(0);
  const [hoveredVertexIndex, setHoveredVertexIndex] = useState<number | null>(null);
  const [isDraggingVertex, setIsDraggingVertex] = useState(false);
  const mounted = typeof window !== "undefined";

  useEffect(() => void (draftRingRef.current = draftRing), [draftRing]);
  useEffect(() => void (selectedVertexRef.current = selectedVertexIndex ?? null), [selectedVertexIndex]);
  useEffect(() => void (isEditingRef.current = isEditing), [isEditing]);
  useEffect(() => void (isCreatingRef.current = isCreating), [isCreating]);
  useEffect(() => void (addPointModeRef.current = addPointMode), [addPointMode]);
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(containerRef.current);
    setDimensions({ width: containerRef.current.offsetWidth, height: containerRef.current.offsetHeight });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isEditing) return;
    const handleKey = (event: KeyboardEvent) => {
      if ((event.key !== "Delete" && event.key !== "Backspace") || selectedVertexRef.current === null) return;
      const ring = draftRingRef.current;
      if (ring.length <= 4) return;
      onDraftRingChange(ring.filter((_, index) => index !== selectedVertexRef.current));
      onSelectVertex?.(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isEditing, onDraftRingChange, onSelectVertex]);

  useEffect(() => {
    if (!globeRef.current || !selectedSlug || !collection) return;
    const feature = collection.features.find((item) => item.properties.slug === selectedSlug);
    if (!feature) return;
    const points = feature.geometry.coordinates[0].slice(0, -1) as [number, number][];
    if (!points.length) return;
    const center = points.reduce((acc, [lng, lat]) => ({ lng: acc.lng + lng / points.length, lat: acc.lat + lat / points.length }), { lng: 0, lat: 0 });
    globeRef.current.pointOfView({ lat: center.lat, lng: center.lng, altitude: 1.2 }, 900);
  }, [collection, selectedSlug]);

  return {
    addPointModeRef,
    containerRef,
    dimensions,
    dragVertexIndexRef,
    draftRingRef,
    globeRef,
    hoveredSlugRef,
    hoveredVertexIndex,
    hoverTick,
    isCreatingRef,
    isDraggingRef,
    isDraggingVertex,
    isEditingRef,
    mounted,
    selectedVertexRef,
    setHoveredVertexIndex,
    setHoverTick,
    setIsDraggingVertex,
  };
}

export function updateGlobeDraftAtPoint(
  point: { lat: number; lng: number },
  options: {
    addPointModeRef: MutableRefObject<boolean>;
    draftRingRef: MutableRefObject<Array<[number, number]>>;
    isCreatingRef: MutableRefObject<boolean>;
    onDraftRingChange: (ring: Array<[number, number]>) => void;
  },
) {
  const nextPoint: [number, number] = [Number(point.lng.toFixed(5)), Number(point.lat.toFixed(5))];
  if (options.isCreatingRef.current) return options.onDraftRingChange(appendPointToDraftRing(options.draftRingRef.current, nextPoint));
  if (options.addPointModeRef.current && options.draftRingRef.current.length >= 4) {
    return options.onDraftRingChange(insertPointIntoNearestSegment(options.draftRingRef.current, nextPoint));
  }
}

export function moveGlobeVertex(
  point: { lat: number; lng: number },
  index: number,
  draftRingRef: MutableRefObject<Array<[number, number]>>,
  onDraftRingChange: (ring: Array<[number, number]>) => void,
) {
  onDraftRingChange(
    moveRingVertex(draftRingRef.current, index, [Number(point.lng.toFixed(5)), Number(point.lat.toFixed(5))]),
  );
}
