"use client";

import type { MutableRefObject } from "react";
import { updateGlobeDraftAtPoint } from "./useGlobeEditor";
import type { GlobeMapProps, GlobePoint } from "./globeTypes";

export function handlePointDragStart(
  globeRef: MutableRefObject<{ controls?: () => { enabled: boolean } } | null>,
  isDraggingRef: MutableRefObject<boolean>,
  setIsDraggingVertex: (value: boolean) => void,
) {
  isDraggingRef.current = true;
  setIsDraggingVertex(true);
  const controls = globeRef.current?.controls?.();
  if (controls) controls.enabled = false;
}

export function handlePointDragEnd(
  globeRef: MutableRefObject<{ controls?: () => { enabled: boolean } } | null>,
  isDraggingRef: MutableRefObject<boolean>,
  setIsDraggingVertex: (value: boolean) => void,
) {
  window.setTimeout(() => void (isDraggingRef.current = false), 0);
  setIsDraggingVertex(false);
  const controls = globeRef.current?.controls?.();
  if (controls) controls.enabled = true;
}

export function handleGlobeClick(
  coords: { lat: number; lng: number },
  isDragging: boolean,
  isEditing: boolean,
  addPointModeRef: MutableRefObject<boolean>,
  draftRingRef: MutableRefObject<Array<[number, number]>>,
  isCreatingRef: MutableRefObject<boolean>,
  onDraftRingChange: (ring: Array<[number, number]>) => void,
  onSelectVertex: GlobeMapProps["onSelectVertex"],
  selectedVertexIndex: number | null,
) {
  if (isDragging || !isEditing) return;
  updateGlobeDraftAtPoint(coords, { addPointModeRef, draftRingRef, isCreatingRef, onDraftRingChange });
  if (!isCreatingRef.current && !addPointModeRef.current && selectedVertexIndex !== null) onSelectVertex?.(null);
}

export function toggleSelectedPoint(
  data: object,
  selectedVertexIndex: number | null,
  onSelectVertex: GlobeMapProps["onSelectVertex"],
) {
  const point = data as GlobePoint;
  onSelectVertex?.(selectedVertexIndex === point.index ? null : point.index);
}
