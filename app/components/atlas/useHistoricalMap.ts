"use client";

import { useEffect, useRef } from "react";
import maplibregl, { GeoJSONSource } from "maplibre-gl";
import { applyGlobeScene, clearGlobeScene } from "./globeScene";
import { addHistoricalMapLayers, addHistoricalMapSources } from "./historicalMapSources";
import { getFeatureBounds, getFeatureCenter, normalizeLngLatLike } from "./historicalMapGeo";
import { bindHistoricalEditing, bindHistoricalWindowStop } from "./historicalMapInteractions";
import { syncCollection, syncDraft, syncSelection } from "./historicalMapSync";
import { MAPTILER_DEFAULT_CENTER, MAPTILER_DEFAULT_ZOOM, MAPTILER_HYBRID_STYLE } from "./maptiler";
import type { HistoricalMapFocusPadding, HistoricalMapProps, HistoricalMapView } from "./historicalMapTypes";

export function useHistoricalMap({
  collection,
  selectedSlug,
  onSelectSlug,
  isEditing,
  isCreating,
  addPointMode,
  draftRing,
  onDraftRingChange,
}: HistoricalMapProps, view?: HistoricalMapView) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const mapReadyRef = useRef(false);
  const collectionRef = useRef(collection);
  const selectedSlugRef = useRef(selectedSlug);
  const hoveredSlugRef = useRef<string | null>(null);
  const isEditingRef = useRef(isEditing);
  const isCreatingRef = useRef(isCreating);
  const addPointModeRef = useRef(addPointMode);
  const draftRingRef = useRef(draftRing);
  const dragIndexRef = useRef<number | null>(null);
  const focusPaddingRef = useRef<HistoricalMapFocusPadding>({
    top: 80,
    right: 360,
    bottom: 100,
    left: 80,
  });
  const viewCenterLng = view?.center?.[0];
  const viewCenterLat = view?.center?.[1];

  useEffect(() => {
    collectionRef.current = collection;
    selectedSlugRef.current = selectedSlug;
    isEditingRef.current = isEditing;
    isCreatingRef.current = isCreating;
    addPointModeRef.current = addPointMode;
    draftRingRef.current = draftRing;
  });

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAPTILER_HYBRID_STYLE,
      center: view?.center ?? MAPTILER_DEFAULT_CENTER,
      zoom: view?.zoom ?? MAPTILER_DEFAULT_ZOOM,
      pitch: view?.pitch ?? 0,
      bearing: view?.bearing ?? 0,
      maxPitch: view?.maxPitch ?? 85,
      attributionControl: false,
      renderWorldCopies: true,
    });
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "bottom-right");
    let stopDraggingFromWindow: (() => void) | null = null;

    map.on("load", () => {
      mapReadyRef.current = true;
      if (view?.mode === "globe") applyGlobeScene(map);
      addHistoricalMapSources(map, collectionRef.current ?? { type: "FeatureCollection", features: [] });
      addHistoricalMapLayers(map, selectedSlugRef.current);
      if (collectionRef.current) {
        (map.getSource("atlas-states") as GeoJSONSource).setData(collectionRef.current);
      }

      map.on("click", ["states-fill", "states-labels"], (event) => {
        if (isCreatingRef.current) return;
        const slug = event.features?.[0]?.properties?.slug;
        const feature = event.features?.[0] as GeoJSON.Feature<GeoJSON.Polygon> | undefined;
        const center = normalizeLngLatLike(event.features?.[0]?.properties?.center) || getFeatureCenter(feature);
        const bounds = getFeatureBounds(feature);
        if (slug) onSelectSlug(slug);
        if (bounds) map.fitBounds(bounds, { padding: focusPaddingRef.current, maxZoom: 4.2, duration: 900, essential: true });
        else if (center) map.flyTo({ center, zoom: Math.max(Math.min(map.getZoom() + 0.4, 4), 3.2), speed: 0.8, curve: 1.2, essential: true });
      });

      map.on("mousemove", ["states-fill", "states-labels"], (event) => {
        if (isCreatingRef.current) return;
        const slug = event.features?.[0]?.properties?.slug;
        if (!slug || slug === hoveredSlugRef.current) return;
        hoveredSlugRef.current = slug;
        map.setFilter("states-hover-outline", ["==", ["get", "slug"], slug]);
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseenter", ["states-fill", "states-labels"], () => !isCreatingRef.current && (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", ["states-fill", "states-labels"], () => {
        hoveredSlugRef.current = null;
        map.setFilter("states-hover-outline", ["==", ["get", "slug"], ""]);
        map.getCanvas().style.cursor = "";
      });

      bindHistoricalEditing(map, dragIndexRef, draftRingRef, isEditingRef, isCreatingRef, addPointModeRef, onDraftRingChange);
      stopDraggingFromWindow = bindHistoricalWindowStop(map, dragIndexRef);
    });

    mapRef.current = map;
    const resizeObserver = typeof ResizeObserver !== "undefined" && containerRef.current ? new ResizeObserver(() => map.resize()) : null;
    resizeObserver?.observe(containerRef.current);
    return () => {
      mapReadyRef.current = false;
      resizeObserver?.disconnect();
      if (stopDraggingFromWindow) window.removeEventListener("mouseup", stopDraggingFromWindow);
      if (view?.mode === "globe") {
        try {
          clearGlobeScene(map);
        } catch {}
      }
      map.remove();
      mapRef.current = null;
    };
  }, [onDraftRingChange, onSelectSlug, view?.bearing, viewCenterLat, viewCenterLng, view?.maxPitch, view?.mode, view?.pitch, view?.zoom]);

  useEffect(() => syncCollection(mapRef.current, mapReadyRef.current, collection, selectedSlug, focusPaddingRef.current), [collection, selectedSlug]);
  useEffect(() => syncSelection(mapRef.current, mapReadyRef.current, selectedSlug), [selectedSlug]);
  useEffect(() => syncDraft(mapRef.current, mapReadyRef.current, draftRing, isEditing), [draftRing, isEditing]);
  return containerRef;
}
