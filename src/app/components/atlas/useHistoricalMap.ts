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
type MapLibrePopup = InstanceType<typeof maplibregl.Popup>;

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
  syncFeedbackPreview,
  syncFeedbackReviewHighlight,
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
    feedbackPreviewRing,
    feedbackReviewSlug,
    onDraftRingChange,
  }: HistoricalMapProps,
  view?: HistoricalMapView
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const mapReadyRef = useRef(false);

  const collectionRef = useRef(collection);
  const selectedSlugRef = useRef(selectedSlug);
  const feedbackReviewSlugRef = useRef(feedbackReviewSlug);
  const selectedEventSlugRef = useRef(selectedEventSlug);
  const onSelectEventRef = useRef(onSelectEvent);
  const hoveredSlugRef = useRef<string | null>(null);
  const handledFocusRequestIdRef = useRef<number | null>(null);

  const isEditingRef = useRef(isEditing);
  const isCreatingRef = useRef(isCreating);
  const addPointModeRef = useRef(addPointMode);
  const draftRingRef = useRef(draftRing);
  const feedbackPreviewRingRef = useRef<Array<[number, number]>>(
    feedbackPreviewRing ?? [],
  );
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
    feedbackReviewSlugRef.current = feedbackReviewSlug ?? null;
    selectedEventSlugRef.current = selectedEventSlug;
    onSelectEventRef.current = onSelectEvent;
    isEditingRef.current = isEditing;
    isCreatingRef.current = isCreating;
    addPointModeRef.current = addPointMode;
    draftRingRef.current = draftRing;
    feedbackPreviewRingRef.current = feedbackPreviewRing ?? [];
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
    let selectedBattlePopup: MapLibrePopup | null = null;
    let hoverBattlePopup: MapLibrePopup | null = null;

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
      syncFeedbackPreview(
        map,
        true,
        feedbackPreviewRingRef.current,
      );
      syncFeedbackReviewHighlight(
        map,
        true,
        feedbackReviewSlugRef.current,
      );

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

      map.on("click", ["states-fill", "states-labels"], (event: any) => {
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

      map.on("click", "battle-markers", (event: any) => {
        event.originalEvent?.stopPropagation?.();
        if (isCreatingRef.current || isEditingRef.current) return;

        const feature = event.features?.[0] as
          | GeoJSON.Feature<GeoJSON.Point>
          | undefined;
        if (!feature?.properties) return;

        selectedBattlePopup?.remove();
        hoverBattlePopup?.remove();

        selectedBattlePopup = new maplibregl.Popup({
          closeButton: true,
          closeOnClick: true,
          className: "mongol-atlas-battle-popup-shell",
          maxWidth: "380px",
          offset: 18,
        })
          .setLngLat(event.lngLat)
          .setHTML(renderBattlePopup(feature.properties))
          .addTo(map);
      });

      map.on("mousemove", ["states-fill", "states-labels"], (event: any) => {
        if (isCreatingRef.current || isEditingRef.current) return;

        const reviewSlug = feedbackReviewSlugRef.current;
        if (reviewSlug) {
          hoveredSlugRef.current = reviewSlug;
          map.setFilter("states-hover-outline", [
            "==",
            ["get", "slug"],
            reviewSlug,
          ]);
          map.getCanvas().style.cursor = "pointer";
          return;
        }

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

      map.on("mouseenter", ["states-fill", "states-labels"], () => {
        if (!isCreatingRef.current && !isEditingRef.current) {
          map.getCanvas().style.cursor = "pointer";
        }
      });

      map.on("mouseenter", "battle-events", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseenter", "battle-markers", (event: any) => {
        map.getCanvas().style.cursor = "pointer";
        const feature = event.features?.[0] as
          | GeoJSON.Feature<GeoJSON.Point>
          | undefined;
        const name = feature?.properties?.name;
        if (typeof name !== "string") return;

        hoverBattlePopup?.remove();
        hoverBattlePopup = new maplibregl.Popup({
          closeButton: false,
          closeOnClick: false,
          className: "mongol-atlas-battle-hover-shell",
          offset: 14,
          maxWidth: "260px",
        })
          .setLngLat(event.lngLat)
          .setHTML(renderBattleHoverPopup(name))
          .addTo(map);
      });

      map.on("mouseleave", ["states-fill", "states-labels"], () => {
        const reviewSlug = feedbackReviewSlugRef.current ?? "";
        hoveredSlugRef.current = reviewSlug || null;

        map.setFilter("states-hover-outline", [
          "==",
          ["get", "slug"],
          reviewSlug,
        ]);

        map.getCanvas().style.cursor = "";
      });

      map.on("mouseleave", "battle-events", () => {
        map.getCanvas().style.cursor = "";
      });

      map.on("mouseleave", "battle-markers", () => {
        map.getCanvas().style.cursor = "";
        hoverBattlePopup?.remove();
        hoverBattlePopup = null;
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

      selectedBattlePopup?.remove();
      hoverBattlePopup?.remove();
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
    syncFeedbackPreview(mapRef.current, mapReadyRef.current, feedbackPreviewRing);
  }, [feedbackPreviewRing]);

  useEffect(() => {
    syncFeedbackReviewHighlight(
      mapRef.current,
      mapReadyRef.current,
      feedbackReviewSlug,
    );
  }, [feedbackReviewSlug]);

  useEffect(() => {
    syncLayerVisibility(
      mapRef.current,
      mapReadyRef.current,
      layerVisibility,
      view?.mode !== "globe",
    );
  }, [layerVisibility, view?.mode]);

  return containerRef;
}

function renderBattlePopup(properties: GeoJSON.GeoJsonProperties) {
  const name = readTextProperty(properties, "name", "Тулалдаан");
  const year = readTextProperty(properties, "year", "");
  const locationName = readTextProperty(properties, "locationName", "Ойролцоо байршил");
  const result = readTextProperty(properties, "result", "Үр дүн тодорхойгүй");
  const summary = readTextProperty(properties, "summary", "");
  const sides = readSidesProperty(properties?.sides);

  return `
    <style>
      .mongol-atlas-battle-popup-shell .maplibregl-popup-content {
        padding: 0;
        overflow: hidden;
        border: 1px solid rgba(239, 68, 68, 0.35);
        border-radius: 18px;
        background: transparent;
        box-shadow: 0 20px 55px rgba(15, 23, 42, 0.28);
        animation: battlePopupIn 180ms ease-out both;
      }

      .mongol-atlas-battle-popup-shell .maplibregl-popup-close-button {
        top: 10px;
        right: 10px;
        width: 26px;
        height: 26px;
        border-radius: 999px;
        color: #7f1d1d;
        background: rgba(255, 255, 255, 0.74);
        font-size: 18px;
        line-height: 24px;
      }

      .mongol-atlas-battle-popup-shell .maplibregl-popup-tip {
        border-top-color: rgba(255, 247, 237, 0.98);
        border-bottom-color: rgba(255, 247, 237, 0.98);
      }

      .mongol-atlas-battle-hover-shell .maplibregl-popup-content {
        padding: 0;
        overflow: hidden;
        border: 1px solid rgba(239, 68, 68, 0.34);
        border-radius: 16px;
        background: transparent;
        box-shadow: 0 18px 48px rgba(127, 29, 29, 0.24);
        animation: battlePopupIn 150ms ease-out both;
      }

      .mongol-atlas-battle-hover-shell .maplibregl-popup-tip {
        border-top-color: rgba(255, 247, 237, 0.98);
        border-bottom-color: rgba(255, 247, 237, 0.98);
      }

      @keyframes battlePopupIn {
        from { opacity: 0; transform: translateY(8px) scale(0.96); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
    </style>
    <div style="position:relative;font-family:var(--font-inter),Arial,sans-serif;color:#111827;line-height:1.45;background:linear-gradient(135deg,#fff7ed 0%,#ffffff 58%,#fee2e2 100%);">
      <div style="position:absolute;inset:0;background:radial-gradient(circle at top left,rgba(239,68,68,0.18),transparent 40%);pointer-events:none;"></div>
      <div style="position:relative;padding:16px 18px 15px 18px;">
        <div style="display:flex;align-items:flex-start;gap:12px;padding-right:24px;">
          <div style="display:flex;height:42px;width:42px;flex:none;align-items:center;justify-content:center;border-radius:14px;background:#fee2e2;border:1px solid rgba(239,68,68,0.34);box-shadow:inset 0 1px 0 rgba(255,255,255,0.85);font-size:22px;">⚔</div>
          <div style="min-width:0;">
            <div style="display:inline-flex;align-items:center;border-radius:999px;background:#7f1d1d;color:#fff7ed;padding:3px 9px;font-size:11px;font-weight:900;letter-spacing:0.12em;">${escapeHtml(year)} ОН</div>
            <div style="margin-top:7px;font-size:17px;font-weight:900;color:#111827;">${escapeHtml(name)}</div>
            <div style="margin-top:5px;font-size:12px;font-weight:700;color:#7f1d1d;">${escapeHtml(locationName)}</div>
          </div>
        </div>
        <div style="margin-top:13px;display:grid;gap:8px;">
          <div style="border-radius:12px;border:1px solid rgba(248,113,113,0.26);background:rgba(255,255,255,0.72);padding:9px 10px;">
            <div style="font-size:10px;font-weight:900;letter-spacing:0.12em;color:#b91c1c;text-transform:uppercase;">Талууд</div>
            <div style="margin-top:3px;font-size:12px;font-weight:700;color:#1f2937;">${escapeHtml(sides)}</div>
          </div>
          <div style="border-radius:12px;border:1px solid rgba(245,158,11,0.34);background:rgba(255,251,235,0.8);padding:9px 10px;">
            <div style="font-size:10px;font-weight:900;letter-spacing:0.12em;color:#92400e;text-transform:uppercase;">Үр дүн</div>
            <div style="margin-top:3px;font-size:12px;font-weight:800;color:#111827;">${escapeHtml(result)}</div>
          </div>
        </div>
        <div style="margin-top:12px;border-top:1px solid rgba(127,29,29,0.12);padding-top:10px;font-size:12px;color:#374151;">${escapeHtml(summary)}</div>
      </div>
    </div>
  `;
}

function renderBattleHoverPopup(name: string) {
  return `
    <style>
      .mongol-atlas-battle-hover-shell .maplibregl-popup-content {
        padding: 0;
        overflow: hidden;
        border: 1px solid rgba(239, 68, 68, 0.34);
        border-radius: 16px;
        background: transparent;
        box-shadow: 0 18px 48px rgba(127, 29, 29, 0.24);
      }

      .mongol-atlas-battle-hover-shell .maplibregl-popup-tip {
        border-top-color: rgba(255, 247, 237, 0.98);
        border-bottom-color: rgba(255, 247, 237, 0.98);
      }
    </style>
    <div style="position:relative;display:flex;align-items:center;gap:11px;min-width:260px;padding:14px 16px;font-family:var(--font-inter),Arial,sans-serif;background:linear-gradient(135deg,#fff7ed 0%,#ffffff 58%,#fee2e2 100%);color:#111827;">
      <div style="position:absolute;inset:0;background:radial-gradient(circle at top left,rgba(239,68,68,0.18),transparent 42%);pointer-events:none;"></div>
      <span style="position:relative;display:flex;height:36px;width:36px;flex:none;align-items:center;justify-content:center;border-radius:12px;background:#fee2e2;border:1px solid rgba(239,68,68,0.34);font-size:18px;color:#7f1d1d;">⚔</span>
      <span style="position:relative;font-size:14px;font-weight:900;white-space:nowrap;letter-spacing:0.01em;color:#111827;">${escapeHtml(name)}</span>
    </div>
  `;
}

function readTextProperty(
  properties: GeoJSON.GeoJsonProperties,
  key: string,
  fallback: string,
) {
  const value = properties?.[key];
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

function readSidesProperty(value: unknown) {
  if (Array.isArray(value)) return value.map(String).join(" ба ");
  if (typeof value !== "string") return "";

  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed)) return parsed.map(String).join(" ба ");
  } catch {
    // MapLibre may expose array properties as a plain string in some builds.
  }

  return value;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
