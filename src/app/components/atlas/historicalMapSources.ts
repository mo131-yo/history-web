// import maplibregl from "maplibre-gl";

// type MapLibreMap = InstanceType<typeof maplibregl.Map>;
// import { createDraftPolygon, createVertexCollection } from "./historicalMapGeo";

// export function addHistoricalMapSources(
//   map: maplibregl.Map,
//   collection: GeoJSON.FeatureCollection,
// ) {
//   if (!map.getSource("atlas-states")) {
//     map.addSource("atlas-states", {
//       type: "geojson",
//       data: collection,
//     });
//   }

//   if (!map.getSource("draft-polygon")) {
//     map.addSource("draft-polygon", {
//       type: "geojson",
//       data: createDraftPolygon([]),
//     });
//   }

//   if (!map.getSource("draft-vertices")) {
//     map.addSource("draft-vertices", {
//       type: "geojson",
//       data: createVertexCollection([]),
//     });
//   }
// }

// export function addHistoricalMapLayers(
//   map: maplibregl.Map,
//   selectedSlug: string | null,
// ) {
//   if (!map.getLayer("states-fill")) {
//     map.addLayer({
//       id: "states-fill",
//       type: "fill",
//       source: "atlas-states",
//       paint: {
//         "fill-color": ["coalesce", ["get", "color"], "#c9a45d"],
//         "fill-opacity": [
//           "case",
//           ["==", ["get", "slug"], selectedSlug ?? ""],
//           0.42,
//           0.2,
//         ],
//       },
//     });
//   }

//   if (!map.getLayer("states-outline")) {
//     map.addLayer({
//       id: "states-outline",
//       type: "line",
//       source: "atlas-states",
//       paint: {
//         "line-color": "#0f172a",
//         "line-width": 1.2,
//         "line-opacity": 0.95,
//       },
//     });
//   }

//   if (!map.getLayer("states-labels")) {
//     map.addLayer({
//       id: "states-labels",
//       type: "symbol",
//       source: "atlas-states",
//       layout: {
//         "text-field": ["get", "name"],
//         "text-font": ["Open Sans Bold"],
//         "text-size": [
//           "interpolate",
//           ["linear"],
//           ["zoom"],
//           2,
//           11,
//           4,
//           13.5,
//           6,
//           17,
//         ],
//         "text-letter-spacing": 0.03,
//         "text-max-width": 11,
//         "text-allow-overlap": true,
//         "symbol-placement": "point",
//       },
//       paint: {
//         "text-color": [
//           "case",
//           ["==", ["get", "slug"], selectedSlug ?? ""],
//           "#fff4db",
//           ["coalesce", ["get", "color"], "#c9a45d"],
//         ],
//         "text-halo-color": "rgba(5,6,8,0.9)",
//         "text-halo-width": 1.9,
//         "text-halo-blur": 0.8,
//       },
//     });
//   }

//   if (!map.getLayer("states-selected-outline")) {
//     map.addLayer({
//       id: "states-selected-outline",
//       type: "line",
//       source: "atlas-states",
//       filter: ["==", ["get", "slug"], selectedSlug ?? ""],
//       paint: {
//         "line-color": "#f59e0b",
//         "line-width": 3.5,
//         "line-opacity": 1,
//       },
//     });
//   }

//   if (!map.getLayer("draft-fill")) {
//     map.addLayer({
//       id: "draft-fill",
//       type: "fill",
//       source: "draft-polygon",
//       paint: {
//         "fill-color": "#38bdf8",
//         "fill-opacity": 0.12,
//       },
//     });
//   }

//   if (!map.getLayer("draft-outline")) {
//     map.addLayer({
//       id: "draft-outline",
//       type: "line",
//       source: "draft-polygon",
//       paint: {
//         "line-color": "#38bdf8",
//         "line-width": 3,
//         "line-dasharray": [1, 1],
//       },
//     });
//   }

//   if (!map.getLayer("draft-vertices")) {
//     map.addLayer({
//       id: "draft-vertices",
//       type: "circle",
//       source: "draft-vertices",
//       paint: {
//         "circle-radius": ["interpolate", ["linear"], ["zoom"], 2, 5, 7, 8],
//         "circle-color": "#f8fafc",
//         "circle-stroke-color": "#0ea5e9",
//         "circle-stroke-width": 3,
//       },
//     });
//   }

//   if (!map.getLayer("states-hover-outline")) {
//     map.addLayer({
//       id: "states-hover-outline",
//       type: "line",
//       source: "atlas-states",
//       filter: ["==", ["get", "slug"], ""],
//       paint: {
//         "line-color": "#38bdf8",
//         "line-width": 2.5,
//         "line-opacity": 0.95,
//       },
//     });
//   }

//   if (map.getLayer("draft-vertices")) {
//     map.moveLayer("draft-vertices");
//   }
// }



import maplibregl from "maplibre-gl";
import {
  createDraftPolygon,
  createEmptyEventCollection,
  createVertexCollection,
} from "./historicalMapGeo";
import { createBattleCollection } from "./historicalBattleMockData";

type MapLibreMap = InstanceType<typeof maplibregl.Map>;
const BATTLE_MARKER_ICON_ID = "battle-marker-swords-transparent";

export function addHistoricalMapSources(
  map: MapLibreMap,
  collection: GeoJSON.FeatureCollection
) {
  if (!map.getSource("atlas-states")) {
    map.addSource("atlas-states", {
      type: "geojson",
      data: collection,
    });
  }

  addGeneratedBattleMarkerIcon(map);

  if (!map.getSource("draft-polygon")) {
    map.addSource("draft-polygon", {
      type: "geojson",
      data: createDraftPolygon([]),
    });
  }

  if (!map.getSource("feedback-polygon")) {
    map.addSource("feedback-polygon", {
      type: "geojson",
      data: createDraftPolygon([]),
    });
  }

  if (!map.getSource("draft-vertices")) {
    map.addSource("draft-vertices", {
      type: "geojson",
      data: createVertexCollection([]),
    });
  }

  if (!map.getSource("battle-events")) {
    map.addSource("battle-events", {
      type: "geojson",
      data: createEmptyEventCollection(),
    });
  }

  if (!map.getSource("battle-markers")) {
    const selectedYear =
      Number((collection as GeoJSON.FeatureCollection & { year?: number }).year) || 0;

    map.addSource("battle-markers", {
      type: "geojson",
      data: createBattleCollection(selectedYear),
    });
  }
}

export function addHistoricalMapLayers(
  map: MapLibreMap,
  selectedSlug: string | null
) {
  if (!map.getLayer("states-fill")) {
    map.addLayer({
      id: "states-fill",
      type: "fill",
      source: "atlas-states",
      paint: {
        "fill-color": ["coalesce", ["get", "color"], "#c9a45d"],
        "fill-opacity": [
          "case",
          ["==", ["get", "slug"], selectedSlug ?? ""],
          0.42,
          0.2,
        ],
      },
    });
  }

  if (!map.getLayer("states-outline")) {
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
  }

  if (!map.getLayer("states-labels")) {
    map.addLayer({
      id: "states-labels",
      type: "symbol",
      source: "atlas-states",
      layout: {
        "text-field": ["get", "name"],
        "text-font": ["Open Sans Bold"],
        "text-size": [
          "interpolate",
          ["linear"],
          ["zoom"],
          2,
          11,
          4,
          13.5,
          6,
          17,
        ],
        "text-letter-spacing": 0.03,
        "text-max-width": 11,
        "text-allow-overlap": true,
        "symbol-placement": "point",
      },
      paint: {
        "text-color": [
          "case",
          ["==", ["get", "slug"], selectedSlug ?? ""],
          "#fff4db",
          ["coalesce", ["get", "color"], "#c9a45d"],
        ],
        "text-halo-color": "rgba(5,6,8,0.9)",
        "text-halo-width": 1.9,
        "text-halo-blur": 0.8,
      },
    });
  }

  if (!map.getLayer("battle-events")) {
    map.addLayer({
      id: "battle-events",
      type: "symbol",
      source: "battle-events",
      layout: {
        "text-field": ["concat", ["get", "icon"], " ", ["get", "label"]],
        "text-font": ["Open Sans Bold"],
        "text-size": [
          "interpolate",
          ["linear"],
          ["zoom"],
          1.5,
          12,
          3,
          14,
          5,
          17,
        ],
        "text-letter-spacing": 0.02,
        "text-allow-overlap": true,
        "text-ignore-placement": true,
        "text-anchor": "center",
        "symbol-sort-key": ["coalesce", ["get", "importance"], 0],
      },
      paint: {
        "text-color": "#f5b348",
        "text-halo-color": "rgba(5,6,8,0.94)",
        "text-halo-width": 1.8,
        "text-halo-blur": 0.8,
      },
    });
  }

  if (!map.getLayer("battle-markers")) {
    map.addLayer({
      id: "battle-markers",
      type: "symbol",
      source: "battle-markers",
      minzoom: 1.5,
      layout: {
        "icon-image": BATTLE_MARKER_ICON_ID,
        "icon-size": [
          "interpolate",
          ["linear"],
          ["zoom"],
          1.5,
          0.62,
          3,
          0.86,
          5,
          1.12,
        ],
        "icon-anchor": "center",
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
        "symbol-sort-key": ["get", "year"],
      },
    });
  }

  if (!map.getLayer("states-selected-outline")) {
    if (!map.getLayer("states-selected-fill")) {
      map.addLayer({
        id: "states-selected-fill",
        type: "fill",
        source: "atlas-states",
        filter: ["==", ["get", "slug"], selectedSlug ?? ""],
        paint: {
          "fill-color": "#f59e0b",
          "fill-opacity": 0.28,
        },
      });
    }

    map.addLayer({
      id: "states-selected-outline",
      type: "line",
      source: "atlas-states",
      filter: ["==", ["get", "slug"], selectedSlug ?? ""],
      paint: {
        "line-color": "#f59e0b",
        "line-width": 5.5,
        "line-opacity": 1,
        "line-blur": 0.35,
      },
    });
  }

  if (!map.getLayer("feedback-preview-halo")) {
    map.addLayer({
      id: "feedback-preview-halo",
      type: "line",
      source: "feedback-polygon",
      paint: {
        "line-color": "#ffffff",
        "line-width": 8,
        "line-opacity": 0.95,
        "line-blur": 0.8,
      },
    });
  }

  if (!map.getLayer("feedback-preview-fill")) {
    map.addLayer({
      id: "feedback-preview-fill",
      type: "fill",
      source: "feedback-polygon",
      paint: {
        "fill-color": "#10b981",
        "fill-opacity": 0.38,
      },
    });
  }

  if (!map.getLayer("feedback-preview-outline")) {
    map.addLayer({
      id: "feedback-preview-outline",
      type: "line",
      source: "feedback-polygon",
      paint: {
        "line-color": "#059669",
        "line-width": 4.8,
        "line-dasharray": [1.15, 0.55],
        "line-opacity": 0.98,
      },
    });
  }

  if (!map.getLayer("feedback-preview-label")) {
    map.addLayer({
      id: "feedback-preview-label",
      type: "symbol",
      source: "feedback-polygon",
      layout: {
        "text-field": "USER-ИЙН POLYGON",
        "text-font": ["Open Sans Bold"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 2, 11, 5, 16],
        "text-letter-spacing": 0.08,
        "text-allow-overlap": true,
        "symbol-placement": "point",
      },
      paint: {
        "text-color": "#047857",
        "text-halo-color": "rgba(255,255,255,0.92)",
        "text-halo-width": 2.6,
        "text-halo-blur": 0.4,
      },
    });
  }

  if (!map.getLayer("draft-fill")) {
    map.addLayer({
      id: "draft-fill",
      type: "fill",
      source: "draft-polygon",
      paint: {
        "fill-color": "#38bdf8",
        "fill-opacity": 0.12,
      },
    });
  }

  if (!map.getLayer("draft-outline")) {
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
  }

  if (!map.getLayer("draft-vertices")) {
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
  }

  if (!map.getLayer("states-hover-outline")) {
    map.addLayer({
      id: "states-hover-outline",
      type: "line",
      source: "atlas-states",
      filter: ["==", ["get", "slug"], ""],
      paint: {
        "line-color": "#0ea5e9",
        "line-width": 4,
        "line-opacity": 0.95,
        "line-blur": 0.25,
      },
    });
  }

  if (map.getLayer("draft-vertices")) {
    if (map.getLayer("feedback-preview-halo")) map.moveLayer("feedback-preview-halo");
    if (map.getLayer("feedback-preview-outline")) map.moveLayer("feedback-preview-outline");
    if (map.getLayer("feedback-preview-label")) map.moveLayer("feedback-preview-label");
    if (map.getLayer("battle-markers")) map.moveLayer("battle-markers");
    map.moveLayer("draft-vertices");
  }
}

function addGeneratedBattleMarkerIcon(map: MapLibreMap) {
  if (map.hasImage(BATTLE_MARKER_ICON_ID) || typeof document === "undefined") {
    return;
  }

  const size = 96;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");
  if (!context) return;

  context.clearRect(0, 0, size, size);
  context.beginPath();
  context.arc(size / 2, size / 2, 36, 0, Math.PI * 2);
  context.fillStyle = "rgba(248,250,252,0.92)";
  context.fill();
  context.lineWidth = 5;
  context.strokeStyle = "rgba(239,68,68,0.92)";
  context.stroke();

  context.font = "800 62px 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', Arial, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.lineWidth = 9;
  context.strokeStyle = "rgba(5,6,8,0.96)";
  context.strokeText("⚔️", size / 2, size / 2 + 2);
  context.fillStyle = "#ef4444";
  context.fillText("⚔️", size / 2, size / 2 + 2);

  map.addImage(BATTLE_MARKER_ICON_ID, context.getImageData(0, 0, size, size), {
    pixelRatio: 2,
  });
}
