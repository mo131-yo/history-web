"use client";

import type { MutableRefObject } from "react";
import maplibregl, { MapMouseEvent } from "maplibre-gl";
import { appendPointToDraftRing, insertPointIntoNearestSegment } from "@/lib/geometry";
import { createDraftPolygon, createVertexCollection, safeSetData } from "./historicalMapGeo";

export function bindHistoricalWindowStop(map: maplibregl.Map, dragIndexRef: MutableRefObject<number | null>) {
  const stopDragging = () => {
    if (dragIndexRef.current === null) return;
    dragIndexRef.current = null;
    map.dragPan.enable();
    map.doubleClickZoom.enable();
    map.getCanvas().style.cursor = "";
  };
  map.on("mouseup", stopDragging);
  map.on("mouseleave", stopDragging);
  window.addEventListener("mouseup", stopDragging);
  return stopDragging;
}

export function bindHistoricalEditing(
  map: maplibregl.Map,
  dragIndexRef: MutableRefObject<number | null>,
  draftRingRef: MutableRefObject<Array<[number, number]>>,
  isEditingRef: MutableRefObject<boolean>,
  isCreatingRef: MutableRefObject<boolean>,
  addPointModeRef: MutableRefObject<boolean>,
  onDraftRingChange: (ring: Array<[number, number]>) => void,
) {
  map.on("mousedown", "draft-vertices", (event) => {
    if (!isEditingRef.current) return;
    event.preventDefault();
    event.originalEvent.preventDefault();
    event.originalEvent.stopPropagation();
    const index = Number(event.features?.[0]?.properties?.index ?? -1);
    if (!Number.isFinite(index) || index < 0) return;
    map.getCanvas().style.cursor = "grabbing";
    map.dragPan.disable();
    map.doubleClickZoom.disable();
    dragIndexRef.current = index;
  });

  map.on("mouseenter", "draft-vertices", () => !isEditingRef.current || dragIndexRef.current !== null ? null : (map.getCanvas().style.cursor = "grab"));
  map.on("mouseleave", "draft-vertices", () => dragIndexRef.current !== null ? null : (map.getCanvas().style.cursor = ""));

  map.on("dblclick", "draft-vertices", (event) => {
    if (!isEditingRef.current) return;
    event.preventDefault();
    const ring = draftRingRef.current;
    const index = Number(event.features?.[0]?.properties?.index ?? -1);
    if (index <= 0 || index >= ring.length - 1 || ring.length <= 4) return;
    const nextRing = [...ring];
    nextRing.splice(index, 1);
    onDraftRingChange(nextRing);
  });

  map.on("mousemove", (event) => {
    if (dragIndexRef.current === null) return;
    const ring = [...draftRingRef.current];
    const coordinates: [number, number] = [Number(event.lngLat.lng.toFixed(5)), Number(event.lngLat.lat.toFixed(5))];
    if (dragIndexRef.current === 0 || dragIndexRef.current === ring.length - 1) {
      ring[0] = coordinates;
      ring[ring.length - 1] = coordinates;
    } else ring[dragIndexRef.current] = coordinates;
    safeSetData(map, "draft-polygon", createDraftPolygon(ring));
    safeSetData(map, "draft-vertices", createVertexCollection(ring));
    onDraftRingChange(ring);
  });

  map.on("click", (event: MapMouseEvent) => {
    if (!isEditingRef.current) return;
    const point: [number, number] = [Number(event.lngLat.lng.toFixed(5)), Number(event.lngLat.lat.toFixed(5))];
    if (isCreatingRef.current) return onDraftRingChange(appendPointToDraftRing(draftRingRef.current, point));
    if (addPointModeRef.current && draftRingRef.current.length >= 4) {
      return onDraftRingChange(insertPointIntoNearestSegment(draftRingRef.current, point));
    }
  });
}
