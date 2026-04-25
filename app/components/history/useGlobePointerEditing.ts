"use client";

import { useEffect } from "react";
import type { MutableRefObject } from "react";
import { moveGlobeVertex } from "./useGlobeEditor";
import type { GlobeMapProps } from "./globeTypes";

type PointerEditingOptions = {
  draftRingRef: MutableRefObject<Array<[number, number]>>;
  dragVertexIndexRef: MutableRefObject<number | null>;
  globeRef: MutableRefObject<{
    controls?: () => { enabled: boolean };
    getScreenCoords?: (lat: number, lng: number, altitude: number) => { x: number; y: number } | null;
    renderer?: () => { domElement: HTMLCanvasElement };
    toGlobeCoords?: (x: number, y: number) => { lat: number; lng: number } | null;
  } | null>;
  isDraggingRef: MutableRefObject<boolean>;
  isEditingRef: MutableRefObject<boolean>;
  mounted: boolean;
  onDraftRingChange: GlobeMapProps["onDraftRingChange"];
  onSelectVertex: GlobeMapProps["onSelectVertex"];
  setHoveredVertexIndex: (index: number | null) => void;
  setIsDraggingVertex: (value: boolean) => void;
};

export function useGlobePointerEditing(options: PointerEditingOptions) {
  useEffect(() => {
    if (!options.mounted || !options.globeRef.current) return;
    const globe = options.globeRef.current;
    const canvas = globe.renderer?.().domElement;
    if (!canvas) return;

    const setControlsEnabled = (enabled: boolean) => {
      try {
        const controls = globe.controls?.();
        if (controls) controls.enabled = enabled;
      } catch {}
    };

    const getPointer = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const findNearestVertex = (event: MouseEvent) => {
      let closestIndex: number | null = null;
      let closestDistance = Infinity;
      options.draftRingRef.current.forEach(([lng, lat], index) => {
        const screen = globe.getScreenCoords?.(lat, lng, 0.035);
        if (!screen) return;
        const pointer = getPointer(event);
        const distance = Math.hypot(screen.x - pointer.x, screen.y - pointer.y);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      return closestDistance <= 28 && options.isEditingRef.current ? closestIndex : null;
    };

    const writeVertexAtMouse = (event: MouseEvent) => {
      const index = options.dragVertexIndexRef.current;
      if (index === null) return;
      const pointer = getPointer(event);
      const coords = globe.toGlobeCoords?.(pointer.x, pointer.y);
      if (!coords || !Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) return;
      moveGlobeVertex(coords, index, options.draftRingRef, options.onDraftRingChange);
    };

    const handleMouseDown = (event: MouseEvent) => {
      const index = findNearestVertex(event);
      if (index === null) return;
      event.preventDefault();
      event.stopPropagation();
      options.dragVertexIndexRef.current = index;
      options.isDraggingRef.current = true;
      options.setIsDraggingVertex(true);
      options.onSelectVertex?.(index);
      options.setHoveredVertexIndex(index);
      setControlsEnabled(false);
      canvas.style.cursor = "grabbing";
      writeVertexAtMouse(event);
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (options.dragVertexIndexRef.current === null) {
        canvas.style.cursor = findNearestVertex(event) === null ? "" : "grab";
        return;
      }
      event.preventDefault();
      writeVertexAtMouse(event);
    };

    const stopDragging = () => {
      if (options.dragVertexIndexRef.current === null) return;
      options.dragVertexIndexRef.current = null;
      window.setTimeout(() => void (options.isDraggingRef.current = false), 0);
      options.setIsDraggingVertex(false);
      setControlsEnabled(true);
      canvas.style.cursor = "";
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopDragging);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopDragging);
      setControlsEnabled(true);
    };
  }, [
    options.draftRingRef,
    options.dragVertexIndexRef,
    options.globeRef,
    options.isDraggingRef,
    options.isEditingRef,
    options.mounted,
    options.onDraftRingChange,
    options.onSelectVertex,
    options.setHoveredVertexIndex,
    options.setIsDraggingVertex,
  ]);
}
