"use client";

import { useEffect, useRef } from "react";
import maplibregl, { GeoJSONSource, MapMouseEvent } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { AtlasFeatureCollection } from "@/lib/types";
import { appendPointToDraftRing, insertPointIntoNearestSegment } from "@/lib/geometry";

interface HistoricalMapProps {
  collection: AtlasFeatureCollection | null;
  selectedSlug: string | null;
  onSelectSlug: (slug: string) => void;
  adminMode: boolean;
  isEditing: boolean;
  isCreating: boolean;
  addPointMode: boolean;
  draftRing: Array<[number, number]>;
  onDraftRingChange: (ring: Array<[number, number]>) => void;
}

function normalizeLngLatLike(value: unknown): [number, number] | null {
  if (Array.isArray(value) && value.length >= 2) {
    const lng = Number(value[0]);
    const lat = Number(value[1]);

    if (Number.isFinite(lng) && Number.isFinite(lat)) {
      return [lng, lat];
    }
  }

  if (value && typeof value === "object") {
    const candidate = value as { lng?: unknown; lon?: unknown; lat?: unknown };
    const lng = Number(candidate.lng ?? candidate.lon);
    const lat = Number(candidate.lat);

    if (Number.isFinite(lng) && Number.isFinite(lat)) {
      return [lng, lat];
    }
  }

  return null;
}

function getFeatureCenter(feature: GeoJSON.Feature<GeoJSON.Polygon> | undefined): [number, number] | null {
  const ring = feature?.geometry.coordinates?.[0];

  if (!ring || ring.length === 0) {
    return null;
  }

  const uniquePoints = ring.slice(0, -1);
  const points = uniquePoints.length > 0 ? uniquePoints : ring;

  if (points.length === 0) {
    return null;
  }

  const total = points.reduce(
    (acc, [lng, lat]) => {
      acc.lng += lng;
      acc.lat += lat;
      return acc;
    },
    { lng: 0, lat: 0 },
  );

  return [total.lng / points.length, total.lat / points.length];
}

function getFeatureBounds(feature: GeoJSON.Feature<GeoJSON.Polygon> | undefined): maplibregl.LngLatBoundsLike | null {
  const ring = feature?.geometry.coordinates?.[0];

  if (!ring || ring.length === 0) {
    return null;
  }

  let minLng = Number.POSITIVE_INFINITY;
  let minLat = Number.POSITIVE_INFINITY;
  let maxLng = Number.NEGATIVE_INFINITY;
  let maxLat = Number.NEGATIVE_INFINITY;

  for (const [lng, lat] of ring) {
    minLng = Math.min(minLng, lng);
    minLat = Math.min(minLat, lat);
    maxLng = Math.max(maxLng, lng);
    maxLat = Math.max(maxLat, lat);
  }

  if (![minLng, minLat, maxLng, maxLat].every(Number.isFinite)) {
    return null;
  }

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}

function createDraftPolygon(ring: Array<[number, number]>) {
  const displayRing = ring.length > 0 && ring[0][0] === ring[ring.length - 1]?.[0] && ring[0][1] === ring[ring.length - 1]?.[1]
    ? ring
    : ring.length >= 3
      ? [...ring, ring[0]]
      : ring;

  return {
    type: "FeatureCollection" as const,
    features: displayRing.length >= 4
      ? [
          {
            type: "Feature" as const,
            geometry: {
              type: "Polygon" as const,
              coordinates: [displayRing],
            },
            properties: {},
          },
        ]
      : [],
  };
}

function createVertexCollection(ring: Array<[number, number]>) {
  return {
    type: "FeatureCollection" as const,
    features: ring.map((coordinates, index) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates,
      },
      properties: {
        index,
      },
    })),
  };
}

export default function HistoricalMap({
  collection,
  selectedSlug,
  onSelectSlug,
  adminMode,
  isEditing,
  isCreating,
  addPointMode,
  draftRing,
  onDraftRingChange,
}: HistoricalMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const mapReadyRef = useRef(false);
  const collectionRef = useRef<AtlasFeatureCollection | null>(collection);
  const selectedSlugRef = useRef<string | null>(selectedSlug);
  const hoveredSlugRef = useRef<string | null>(null);
  const adminModeRef = useRef(adminMode);
  const isEditingRef = useRef(isEditing);
  const isCreatingRef = useRef(isCreating);
  const addPointModeRef = useRef(addPointMode);
  const draftRingRef = useRef(draftRing);
  const dragIndexRef = useRef<number | null>(null);
  const focusPaddingRef = useRef({ top: 80, right: 360, bottom: 100, left: 80 });

  useEffect(() => {
    collectionRef.current = collection;
    selectedSlugRef.current = selectedSlug;
    adminModeRef.current = adminMode;
    isEditingRef.current = isEditing;
    isCreatingRef.current = isCreating;
    addPointModeRef.current = addPointMode;
    draftRingRef.current = draftRing;
  }, [addPointMode, adminMode, collection, draftRing, isCreating, isEditing, selectedSlug]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: [86, 34],
      zoom: 2.15,
      pitch: 0,
      attributionControl: false,
      renderWorldCopies: true,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "bottom-right");

    map.on("load", () => {
      mapReadyRef.current = true;
      const interactiveStateLayers = ["states-fill", "states-labels"];

      map.addSource("atlas-states", {
        type: "geojson",
        data: collectionRef.current ?? { type: "FeatureCollection", features: [] },
      });

      map.addSource("draft-polygon", {
        type: "geojson",
        data: createDraftPolygon([]),
      });

      map.addSource("draft-vertices", {
        type: "geojson",
        data: createVertexCollection([]),
      });

      map.addLayer({
        id: "states-fill",
        type: "fill",
        source: "atlas-states",
        paint: {
          "fill-color": ["coalesce", ["get", "color"], "#c9a45d"],
          "fill-opacity": ["case", ["==", ["get", "slug"], selectedSlugRef.current ?? ""], 0.42, 0.2],
        },
      });

      map.addLayer({
        id: "states-outline",
        type: "line",
        source: "atlas-states",
        paint: {
          "line-color": "#0f172a",
          "line-width": 1.2,
          "line-opacity": 0.95,
        },
      });

      map.addLayer({
        id: "states-labels",
        type: "symbol",
        source: "atlas-states",
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["Open Sans Semibold"],
          "text-size": [
            "interpolate",
            ["linear"],
            ["zoom"],
            2,
            10,
            4,
            12,
            6,
            15,
          ],
          "text-letter-spacing": 0.04,
          "text-max-width": 10,
          "text-allow-overlap": false,
          "symbol-placement": "point",
        },
        paint: {
          "text-color": "#e7e5e4",
          "text-halo-color": "rgba(2, 6, 23, 0.92)",
          "text-halo-width": 1.6,
          "text-halo-blur": 0.4,
        },
      });

      map.addLayer({
        id: "states-selected-outline",
        type: "line",
        source: "atlas-states",
        filter: ["==", ["get", "slug"], ""],
        paint: {
          "line-color": "#f59e0b",
          "line-width": 3.5,
          "line-opacity": 1,
        },
      });

      map.addLayer({
        id: "draft-fill",
        type: "fill",
        source: "draft-polygon",
        paint: {
          "fill-color": "#38bdf8",
          "fill-opacity": 0.12,
        },
      });

      map.addLayer({
        id: "draft-outline",
        type: "line",
        source: "draft-polygon",
        paint: {
          "line-color": "#38bdf8",
          "line-width": 3,
          "line-dasharray": [1, 1],
        },
      });

      map.addLayer({
        id: "draft-vertices",
        type: "circle",
        source: "draft-vertices",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 2, 5, 7, 8],
          "circle-color": "#f8fafc",
          "circle-stroke-color": "#0ea5e9",
          "circle-stroke-width": 3,
        },
      });

      map.addLayer({
        id: "states-hover-outline",
        type: "line",
        source: "atlas-states",
        filter: ["==", ["get", "slug"], ""],
        paint: {
          "line-color": "#38bdf8",
          "line-width": 2.5,
          "line-opacity": 0.95,
        },
      });

      if (selectedSlugRef.current) {
        map.setFilter("states-selected-outline", ["==", ["get", "slug"], selectedSlugRef.current]);
      }

      map.on("click", interactiveStateLayers, (event) => {
        if (isCreatingRef.current) {
          return;
        }

        const slug = event.features?.[0]?.properties?.slug;
        const feature = event.features?.[0] as GeoJSON.Feature<GeoJSON.Polygon> | undefined;
        const center =
          normalizeLngLatLike(event.features?.[0]?.properties?.center) ||
          getFeatureCenter(feature);
        const bounds = getFeatureBounds(feature);

        if (slug) {
          onSelectSlug(slug);
        }

        if (bounds) {
          map.fitBounds(bounds, {
            padding: focusPaddingRef.current,
            maxZoom: 4.2,
            duration: 900,
            essential: true,
          });
        } else if (center) {
          map.flyTo({
            center,
            zoom: Math.max(Math.min(map.getZoom() + 0.4, 4), 3.2),
            speed: 0.8,
            curve: 1.2,
            essential: true,
          });
        } else if (event.lngLat) {
          map.flyTo({
            center: [event.lngLat.lng, event.lngLat.lat],
            zoom: Math.max(map.getZoom(), 4.6),
            speed: 0.8,
            curve: 1.2,
            essential: true,
          });
        }
      });

      map.on("mousemove", interactiveStateLayers, (event) => {
        if (isCreatingRef.current) {
          return;
        }

        const slug = event.features?.[0]?.properties?.slug;

        if (!slug || slug === hoveredSlugRef.current) {
          return;
        }

        hoveredSlugRef.current = slug;
        map.setFilter("states-hover-outline", ["==", ["get", "slug"], slug]);
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseenter", interactiveStateLayers, () => {
        if (isCreatingRef.current) {
          return;
        }

        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", interactiveStateLayers, () => {
        hoveredSlugRef.current = null;
        map.setFilter("states-hover-outline", ["==", ["get", "slug"], ""]);
        map.getCanvas().style.cursor = "";
      });

      map.on("mousedown", "draft-vertices", (event) => {
        if (!isEditingRef.current) {
          return;
        }

        map.getCanvas().style.cursor = "grabbing";
        map.dragPan.disable();
        dragIndexRef.current = Number(event.features?.[0]?.properties?.index ?? -1);
      });

      map.on("dblclick", "draft-vertices", (event) => {
        if (!isEditingRef.current) {
          return;
        }

        event.preventDefault();

        const ring = draftRingRef.current;
        const index = Number(event.features?.[0]?.properties?.index ?? -1);

        if (index <= 0 || index >= ring.length - 1 || ring.length <= 4) {
          return;
        }

        const nextRing = [...ring];
        nextRing.splice(index, 1);
        onDraftRingChange(nextRing);
      });

      map.on("mousemove", (event) => {
        if (dragIndexRef.current === null) {
          return;
        }

        const index = dragIndexRef.current;
        const ring = [...draftRingRef.current];
        const coordinates: [number, number] = [
          Number(event.lngLat.lng.toFixed(5)),
          Number(event.lngLat.lat.toFixed(5)),
        ];

        if (index === 0 || index === ring.length - 1) {
          ring[0] = coordinates;
          ring[ring.length - 1] = coordinates;
        } else {
          ring[index] = coordinates;
        }

        onDraftRingChange(ring);
      });

      const stopDragging = () => {
        if (dragIndexRef.current === null) {
          return;
        }

        dragIndexRef.current = null;
        map.dragPan.enable();
        map.getCanvas().style.cursor = "";
      };

      map.on("mouseup", stopDragging);
      map.on("mouseleave", stopDragging);

      map.on("click", (event: MapMouseEvent) => {
        if (!isEditingRef.current) {
          return;
        }

        if (isCreatingRef.current) {
          const nextRing = appendPointToDraftRing(draftRingRef.current, [
            Number(event.lngLat.lng.toFixed(5)),
            Number(event.lngLat.lat.toFixed(5)),
          ]);

          onDraftRingChange(nextRing);
          return;
        }

        if (!addPointModeRef.current || draftRingRef.current.length < 4) {
          return;
        }

        const nextRing = insertPointIntoNearestSegment(draftRingRef.current, [
          Number(event.lngLat.lng.toFixed(5)),
          Number(event.lngLat.lat.toFixed(5)),
        ]);

        onDraftRingChange(nextRing);
      });
    });

    mapRef.current = map;

    const resizeObserver =
      typeof ResizeObserver !== "undefined" && containerRef.current
        ? new ResizeObserver(() => {
            map.resize();
          })
        : null;

    resizeObserver?.observe(containerRef.current);

    return () => {
      mapReadyRef.current = false;
      resizeObserver?.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, [onDraftRingChange, onSelectSlug]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReadyRef.current || !map.isStyleLoaded()) {
      return;
    }

    const statesSource = map.getSource("atlas-states") as GeoJSONSource | undefined;

    if (!statesSource) {
      return;
    }

    statesSource.setData(collection ?? { type: "FeatureCollection", features: [] });

    if (selectedSlug) {
      const selectedFeature = collection?.features.find((feature) => feature.properties.slug === selectedSlug);
      const center =
        normalizeLngLatLike(selectedFeature?.properties.center) ||
        getFeatureCenter(selectedFeature);
      const bounds = getFeatureBounds(selectedFeature);

      if (bounds) {
        map.fitBounds(bounds, {
          padding: focusPaddingRef.current,
          maxZoom: 4,
          duration: 700,
          essential: true,
        });
      } else if (center) {
        map.flyTo({
          center,
          zoom: Math.max(Math.min(map.getZoom(), 3.8), 3),
          speed: 0.7,
        });
      }
    }
  }, [collection, focusPaddingRef, selectedSlug]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !mapReadyRef.current || !map.isStyleLoaded() || !map.getLayer("states-selected-outline")) {
      return;
    }

    map.setFilter("states-selected-outline", ["==", ["get", "slug"], selectedSlug ?? ""]);
  }, [selectedSlug]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !mapReadyRef.current || !map.isStyleLoaded()) {
      return;
    }

    const draftSource = map.getSource("draft-polygon") as GeoJSONSource | undefined;
    const verticesSource = map.getSource("draft-vertices") as GeoJSONSource | undefined;

    draftSource?.setData(isEditing ? createDraftPolygon(draftRing) : createDraftPolygon([]));
    verticesSource?.setData(isEditing ? createVertexCollection(draftRing) : createVertexCollection([]));
  }, [draftRing, isEditing]);

  return (
    <div className="relative h-full min-h-[420px] lg:min-h-0 bg-[radial-gradient(circle_at_30%_20%,rgba(125,211,252,0.2),transparent_26%),radial-gradient(circle_at_80%_0%,rgba(250,204,21,0.16),transparent_22%),#dbeafe]">
      <div ref={containerRef} className="h-full w-full" />

      <div className="pointer-events-none absolute bottom-4 left-4 rounded-2xl border border-white/50 bg-white/75 px-4 py-3 text-xs text-slate-700 shadow-lg backdrop-blur">
        {isEditing
          ? isCreating
            ? "Create mode: map дээр дарж шинэ оройнууд нэм. 3+ цэг бол polygon болно, дараа нь Save хий."
            : "Edit mode: цэгийг чирж зөө, double-click хийж устга, Add point горимоор шинэ орой нэм."
          : "Polygon сонгоод тухайн улсын хил, түүх, AI тайлбарыг хар."}
      </div>
    </div>
  );
}
