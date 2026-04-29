// "use client";

// import { useEffect, useRef } from "react";
// import { applyGlobeScene, clearGlobeScene } from "./globeScene";
// import { addHistoricalMapLayers, addHistoricalMapSources } from "./historicalMapSources";
// import { getFeatureBounds, getFeatureCenter, normalizeLngLatLike } from "./historicalMapGeo";
// import { syncCollection, syncDraft, syncSelection } from "./historicalMapSync";
// import { MAPTILER_DEFAULT_CENTER, MAPTILER_DEFAULT_ZOOM, MAPTILER_HYBRID_STYLE } from "./maptiler";
// import type { HistoricalMapFocusPadding, HistoricalMapProps, HistoricalMapView } from "./historicalMapTypes";
// import maplibregl, { type GeoJSONSource } from "maplibre-gl";
// import { bindHistoricalEditing, bindHistoricalWindowStop } from "./historicalMapInteractions";


// export function useHistoricalMap({
//   collection,
//   selectedSlug,
//   onSelectSlug, 
//   isEditing,
//   isCreating,
//   addPointMode,
//   draftRing,
//   onDraftRingChange,
// }: HistoricalMapProps, view?: HistoricalMapView) {
//   const containerRef = useRef<HTMLDivElement | null>(null);
//   const mapRef = useRef<maplibregl.Map | null>(null);
//   const mapReadyRef = useRef(false);
//   const collectionRef = useRef(collection);
//   const selectedSlugRef = useRef(selectedSlug);
//   const hoveredSlugRef = useRef<string | null>(null);
//   const isEditingRef = useRef(isEditing);
//   const isCreatingRef = useRef(isCreating);
//   const addPointModeRef = useRef(addPointMode);
//   const draftRingRef = useRef(draftRing);
//   const dragIndexRef = useRef<number | null>(null);
//   const focusPaddingRef = useRef<HistoricalMapFocusPadding>({
//     top: 80,
//     right: 360,
//     bottom: 100,
//     left: 80,
//   });
//   const viewCenterLng = view?.center?.[0];
//   const viewCenterLat = view?.center?.[1];

//   useEffect(() => {
//     collectionRef.current = collection;
//     selectedSlugRef.current = selectedSlug;
//     isEditingRef.current = isEditing;
//     isCreatingRef.current = isCreating;
//     addPointModeRef.current = addPointMode;
//     draftRingRef.current = draftRing;
//   });

//   useEffect(() => {
//     if (!containerRef.current || mapRef.current) return;
//     const globeMode = view?.mode === "globe";
//     const map = new maplibregl.Map({
//       container: containerRef.current,
//       style: MAPTILER_HYBRID_STYLE,
//       center: view?.center ?? MAPTILER_DEFAULT_CENTER,
//       zoom: view?.zoom ?? MAPTILER_DEFAULT_ZOOM,
//       pitch: view?.pitch ?? 0,
//       bearing: view?.bearing ?? 0,
//       maxPitch: view?.maxPitch ?? 85,
//       attributionControl: false,
//       renderWorldCopies: !globeMode,
//     });
//     map.addControl(
//       new maplibregl.NavigationControl({ visualizePitch: globeMode }),
//       "bottom-right"
//     );
//     let stopDraggingFromWindow: (() => void) | null = null;

//     map.on("load", () => {
//       mapReadyRef.current = true;
//       if (globeMode) {
//         applyGlobeScene(map, view.projection === "vertical-perspective" ? "vertical-perspective" : "globe");
//         map.jumpTo({
//           center: view?.center ?? MAPTILER_DEFAULT_CENTER,
//           zoom: view?.zoom ?? MAPTILER_DEFAULT_ZOOM,
//           pitch: view?.pitch ?? 0,
//           bearing: view?.bearing ?? 0,
//         });
//         map.resize();
//       } else {
//         map.setProjection({ type: "mercator" });
//       }
//       addHistoricalMapSources(map, collectionRef.current ?? { type: "FeatureCollection", features: [] });
//       addHistoricalMapLayers(map, selectedSlugRef.current);
//       if (collectionRef.current) {
//         (map.getSource("atlas-states") as GeoJSONSource).setData(collectionRef.current);
//       }

//       map.on("click", ["states-fill", "states-labels"], (event: any) => {
//         if (isCreatingRef.current) return;
//         const slug = event.features?.[0]?.properties?.slug;
//         const feature = event.features?.[0] as GeoJSON.Feature<GeoJSON.Polygon> | undefined;
//         const center = normalizeLngLatLike(event.features?.[0]?.properties?.center) || getFeatureCenter(feature);
//         const bounds = getFeatureBounds(feature);
//         if (slug) onSelectSlug(slug);
//         if (bounds) map.fitBounds(bounds, { padding: focusPaddingRef.current, maxZoom: 4.2, duration: 900, essential: true });
//         else if (center) map.flyTo({ center, zoom: Math.max(Math.min(map.getZoom() + 0.4, 4), 3.2), speed: 0.8, curve: 1.2, essential: true });
//       });

//       map.on("mousemove", ["states-fill", "states-labels"], (event: any) => {
//         if (isCreatingRef.current) return;
//         const slug = event.features?.[0]?.properties?.slug;
//         if (!slug || slug === hoveredSlugRef.current) return;
//         hoveredSlugRef.current = slug;
//         map.setFilter("states-hover-outline", ["==", ["get", "slug"], slug]);
//         map.getCanvas().style.cursor = "pointer";
//       });
//       map.on("mouseenter", ["states-fill", "states-labels"], () => !isCreatingRef.current && (map.getCanvas().style.cursor = "pointer"));
//       map.on("mouseleave", ["states-fill", "states-labels"], () => {
//         hoveredSlugRef.current = null;
//         map.setFilter("states-hover-outline", ["==", ["get", "slug"], ""]);
//         map.getCanvas().style.cursor = "";
//       });

//       bindHistoricalEditing(map, dragIndexRef, draftRingRef, isEditingRef, isCreatingRef, addPointModeRef, onDraftRingChange);
//       stopDraggingFromWindow = bindHistoricalWindowStop(map, dragIndexRef);
//     });

//     mapRef.current = map;
//     const resizeObserver = typeof ResizeObserver !== "undefined" && containerRef.current ? new ResizeObserver(() => map.resize()) : null;
//     resizeObserver?.observe(containerRef.current);
//     return () => {
//       mapReadyRef.current = false;
//       resizeObserver?.disconnect();
//       if (stopDraggingFromWindow) window.removeEventListener("mouseup", stopDraggingFromWindow);
//       if (globeMode) {
//         try {
//           clearGlobeScene(map);
//         } catch {}
//       }
//       map.remove();
//       mapRef.current = null;
//     };
//   }, [onDraftRingChange, onSelectSlug, view?.bearing, viewCenterLat, viewCenterLng, view?.maxPitch, view?.mode, view?.pitch, view?.projection, view?.zoom]);

//   useEffect(() => syncCollection(mapRef.current, mapReadyRef.current, collection, selectedSlug, focusPaddingRef.current), [collection, selectedSlug]);
//   useEffect(() => syncSelection(mapRef.current, mapReadyRef.current, selectedSlug), [selectedSlug]);
//   useEffect(() => syncDraft(mapRef.current, mapReadyRef.current, draftRing, isEditing), [draftRing, isEditing]);
//   return containerRef;
// }




"use client";

import { useEffect, useRef } from "react";
import maplibregl, { type GeoJSONSource } from "maplibre-gl";

type MapLibreMap = InstanceType<typeof maplibregl.Map>;

import { applyGlobeScene, clearGlobeScene } from "./globeScene";
import {
  addHistoricalMapLayers,
  addHistoricalMapSources,
} from "./historicalMapSources";
import {
  getFeatureBounds,
  getFeatureCenter,
  normalizeLngLatLike,
} from "./historicalMapGeo";
import {
  syncBattleEvents,
  syncCollection,
  syncDraft,
  syncLayerVisibility,
  syncSelection,
  syncSelectedFeatureFocus,
} from "./historicalMapSync";
import {
  MAPTILER_DEFAULT_CENTER,
  MAPTILER_DEFAULT_ZOOM,
  MAPTILER_HYBRID_STYLE,
} from "./maptiler";
import type {
  HistoricalMapFocusPadding,
  HistoricalMapProps,
  HistoricalMapView,
} from "./historicalMapTypes";
import {
  bindHistoricalEditing,
  bindHistoricalWindowStop,
} from "./historicalMapInteractions";

export function useHistoricalMap(
  {
    collection,
    selectedSlug,
    focusRequest,
    battleEvents,
    selectedEventSlug,
    layerVisibility,
    onSelectSlug,
    onSelectEvent,
    isEditing,
    isCreating,
    addPointMode,
    draftRing,
    onDraftRingChange,
  }: HistoricalMapProps,
  view?: HistoricalMapView
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const mapReadyRef = useRef(false);

  const collectionRef = useRef(collection);
  const selectedSlugRef = useRef(selectedSlug);
  const selectedEventSlugRef = useRef(selectedEventSlug);
  const onSelectEventRef = useRef(onSelectEvent);
  const hoveredSlugRef = useRef<string | null>(null);
  const handledFocusRequestIdRef = useRef<number | null>(null);

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
    selectedEventSlugRef.current = selectedEventSlug;
    onSelectEventRef.current = onSelectEvent;
    isEditingRef.current = isEditing;
    isCreatingRef.current = isCreating;
    addPointModeRef.current = addPointMode;
    draftRingRef.current = draftRing;
  });

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const globeMode = view?.mode === "globe";

    // const map = new maplibregl.Map({
    //   container: containerRef.current,
    //   style: MAPTILER_HYBRID_STYLE,
    //   center: view?.center ?? MAPTILER_DEFAULT_CENTER,
    //   zoom: view?.zoom ?? MAPTILER_DEFAULT_ZOOM,
    //   pitch: view?.pitch ?? 0,
    //   bearing: view?.bearing ?? 0,
    //   maxPitch: view?.maxPitch ?? 85,
    //   attributionControl: false,
    //   renderWorldCopies: !globeMode,
    // }) as MapLibreMap;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAPTILER_HYBRID_STYLE,
      center: view?.center ?? MAPTILER_DEFAULT_CENTER,
      zoom: view?.zoom ?? MAPTILER_DEFAULT_ZOOM,
      pitch: view?.pitch ?? 0,
      bearing: view?.bearing ?? 0,
      maxPitch: view?.maxPitch ?? 85,
      attributionControl: false,
      renderWorldCopies: !globeMode,
    }) as MapLibreMap;

    map.addControl(
      new maplibregl.NavigationControl({ visualizePitch: globeMode }),
      "bottom-right"
    );

    let stopDraggingFromWindow: (() => void) | null = null;

    map.on("load", () => {
      mapReadyRef.current = true;

      if (globeMode) {
        applyGlobeScene(
          map,
          view?.projection === "vertical-perspective"
            ? "vertical-perspective"
            : "globe"
        );

        map.jumpTo({
          center: view?.center ?? MAPTILER_DEFAULT_CENTER,
          zoom: view?.zoom ?? MAPTILER_DEFAULT_ZOOM,
          pitch: view?.pitch ?? 0,
          bearing: view?.bearing ?? 0,
        });

        map.resize();
      } else {
        map.setProjection({ type: "mercator" });
      }

      addHistoricalMapSources(
        map,
        collectionRef.current ?? {
          type: "FeatureCollection",
          features: [],
        }
      );

      addHistoricalMapLayers(map, selectedSlugRef.current);

      if (collectionRef.current) {
        const source = map.getSource("atlas-states") as
          | GeoJSONSource
          | undefined;

        source?.setData(collectionRef.current);
      }

      const battleEventsSource = map.getSource("battle-events") as
        | GeoJSONSource
        | undefined;
      battleEventsSource?.setData(
        battleEvents ?? {
          type: "FeatureCollection",
          year: 0,
          features: [],
        }
      );

      map.on("click", ["states-fill", "states-labels", "state-flags"], (event: any) => {
        if (isCreatingRef.current || isEditingRef.current) return;

        const slug = event.features?.[0]?.properties?.slug;

        const selectedFeature = collectionRef.current?.features.find(
          (feature) => feature.properties.slug === slug
        ) as GeoJSON.Feature<GeoJSON.Polygon> | undefined;

        const feature =
          selectedFeature ??
          (event.features?.[0] as GeoJSON.Feature<GeoJSON.Polygon> | undefined);

        const center =
          normalizeLngLatLike(selectedFeature?.properties?.center) ||
          normalizeLngLatLike(event.features?.[0]?.geometry?.coordinates) ||
          getFeatureCenter(feature);

        const bounds = getFeatureBounds(feature);

        if (slug) {
          onSelectSlug(slug);
        }

        if (bounds) {
          map.fitBounds(bounds, {
            padding: focusPaddingRef.current,
            maxZoom: 2.8,
            duration: 900,
            essential: true,
          });
        } else if (center) {
          map.flyTo({
            center,
            zoom: Math.max(Math.min(map.getZoom() + 0.25, 2.8), 2.2),
            speed: 0.8,
            curve: 1.2,
            essential: true,
          });
        }
      });

      map.on("click", "battle-events", (event: any) => {
        const slug = event.features?.[0]?.properties?.slug;
        if (typeof slug === "string") {
          onSelectEventRef.current(
            slug === selectedEventSlugRef.current ? null : slug
          );
        }
      });

      map.on("mousemove", ["states-fill", "states-labels", "state-flags"], (event: any) => {
        if (isCreatingRef.current || isEditingRef.current) return;

        const slug = event.features?.[0]?.properties?.slug;

        if (!slug || slug === hoveredSlugRef.current) return;

        hoveredSlugRef.current = slug;

        map.setFilter("states-hover-outline", [
          "==",
          ["get", "slug"],
          slug,
        ]);

        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseenter", ["states-fill", "states-labels", "state-flags"], () => {
        if (!isCreatingRef.current && !isEditingRef.current) {
          map.getCanvas().style.cursor = "pointer";
        }
      });

      map.on("mouseenter", "battle-events", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", ["states-fill", "states-labels", "state-flags"], () => {
        hoveredSlugRef.current = null;

        map.setFilter("states-hover-outline", [
          "==",
          ["get", "slug"],
          "",
        ]);

        map.getCanvas().style.cursor = "";
      });

      map.on("mouseleave", "battle-events", () => {
        map.getCanvas().style.cursor = "";
      });

      bindHistoricalEditing(
        map,
        dragIndexRef,
        draftRingRef,
        isEditingRef,
        isCreatingRef,
        addPointModeRef,
        onDraftRingChange
      );

      stopDraggingFromWindow = bindHistoricalWindowStop(map, dragIndexRef);
    });

    mapRef.current = map;

    const resizeMap = () => map.resize();
    const resizeFrame = window.requestAnimationFrame(resizeMap);
    const resizeTimer = window.setTimeout(resizeMap, 250);
    window.addEventListener("resize", resizeMap);

    const resizeObserver =
      typeof ResizeObserver !== "undefined" && containerRef.current
        ? new ResizeObserver(() => map.resize())
        : null;

    resizeObserver?.observe(containerRef.current);

    return () => {
      mapReadyRef.current = false;

      resizeObserver?.disconnect();
      window.cancelAnimationFrame(resizeFrame);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", resizeMap);

      if (stopDraggingFromWindow) {
        window.removeEventListener("mouseup", stopDraggingFromWindow);
      }

      if (globeMode) {
        try {
          clearGlobeScene(map);
        } catch {
          // ignore cleanup errors
        }
      }

      map.remove();
      mapRef.current = null;
    };
  }, [
    onDraftRingChange,
    onSelectSlug,
    view?.bearing,
    viewCenterLat,
    viewCenterLng,
    view?.maxPitch,
    view?.mode,
    view?.pitch,
    view?.projection,
    view?.zoom,
  ]);

  useEffect(() => {
    syncCollection(
      mapRef.current,
      mapReadyRef.current,
      collection
    );
  }, [collection]);

  useEffect(() => {
    syncBattleEvents(mapRef.current, mapReadyRef.current, battleEvents);
  }, [battleEvents]);

  useEffect(() => {
    if (!focusRequest || handledFocusRequestIdRef.current === focusRequest.id) {
      return;
    }

    const focused = syncSelectedFeatureFocus(
      mapRef.current,
      mapReadyRef.current,
      collection,
      focusRequest,
      focusPaddingRef.current
    );

    if (focused) {
      handledFocusRequestIdRef.current = focusRequest.id;
    }
  }, [collection, focusRequest?.id, focusRequest?.slug]);

  useEffect(() => {
    syncSelection(mapRef.current, mapReadyRef.current, selectedSlug);
  }, [selectedSlug]);

  useEffect(() => {
    syncDraft(mapRef.current, mapReadyRef.current, draftRing, isEditing);
  }, [draftRing, isEditing]);

  useEffect(() => {
    syncLayerVisibility(mapRef.current, mapReadyRef.current, layerVisibility);
  }, [layerVisibility]);

  return containerRef;
}
