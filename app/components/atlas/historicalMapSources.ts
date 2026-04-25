import type maplibregl from "maplibre-gl";
import {
  createDraftPolygon,
  createVertexCollection,
} from "./historicalMapGeo";

export function addHistoricalMapSources(map: maplibregl.Map, collection: GeoJSON.FeatureCollection) {
  map.addSource("atlas-states", { type: "geojson", data: collection });
  map.addSource("draft-polygon", { type: "geojson", data: createDraftPolygon([]) });
  map.addSource("draft-vertices", { type: "geojson", data: createVertexCollection([]) });
}

export function addHistoricalMapLayers(map: maplibregl.Map, selectedSlug: string | null) {
  map.addLayer({
    id: "states-fill",
    type: "fill",
    source: "atlas-states",
    paint: {
      "fill-color": ["coalesce", ["get", "color"], "#c9a45d"],
      "fill-opacity": ["case", ["==", ["get", "slug"], selectedSlug ?? ""], 0.42, 0.2],
    },
  });

  map.addLayer({
    id: "states-outline",
    type: "line",
    source: "atlas-states",
    paint: { "line-color": "#0f172a", "line-width": 1.2, "line-opacity": 0.95 },
  });

  map.addLayer({
    id: "states-labels",
    type: "symbol",
    source: "atlas-states",
    layout: {
      "text-field": ["get", "name"],
      "text-font": ["Open Sans Semibold"],
      "text-size": ["interpolate", ["linear"], ["zoom"], 2, 10, 4, 12, 6, 15],
      "text-letter-spacing": 0.04,
      "text-max-width": 10,
      "text-allow-overlap": false,
      "symbol-placement": "point",
    },
    paint: {
      "text-color": "#1e293b",
      "text-halo-color": "rgba(255,255,255,0.85)",
      "text-halo-width": 1.6,
      "text-halo-blur": 0.4,
    },
  });

  map.addLayer({
    id: "states-selected-outline",
    type: "line",
    source: "atlas-states",
    filter: ["==", ["get", "slug"], selectedSlug ?? ""],
    paint: { "line-color": "#f59e0b", "line-width": 3.5, "line-opacity": 1 },
  });

  map.addLayer({
    id: "draft-fill",
    type: "fill",
    source: "draft-polygon",
    paint: { "fill-color": "#38bdf8", "fill-opacity": 0.12 },
  });
  map.addLayer({
    id: "draft-outline",
    type: "line",
    source: "draft-polygon",
    paint: { "line-color": "#38bdf8", "line-width": 3, "line-dasharray": [1, 1] },
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
    paint: { "line-color": "#38bdf8", "line-width": 2.5, "line-opacity": 0.95 },
  });
  map.moveLayer("draft-vertices");
}
