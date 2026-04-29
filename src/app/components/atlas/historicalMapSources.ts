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
  createFlagCollection,
  createVertexCollection,
  loadFlagImages,
} from "./historicalMapGeo";

type MapLibreMap = InstanceType<typeof maplibregl.Map>;

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

  const flagCollection = createFlagCollection(collection);
  void loadFlagImages(map, flagCollection);

  if (!map.getSource("state-flags")) {
    map.addSource("state-flags", {
      type: "geojson",
      data: flagCollection,
    });
  }

  if (!map.getSource("draft-polygon")) {
    map.addSource("draft-polygon", {
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

  if (!map.getLayer("state-flags")) {
    map.addLayer({
      id: "state-flags",
      type: "symbol",
      source: "state-flags",
      layout: {
        "icon-image": ["concat", "flag-", ["get", "flagAsset"]],
        "icon-size": [
          "interpolate",
          ["linear"],
          ["zoom"],
          2,
          0.2,
          4,
          0.28,
          6,
          0.38,
        ],
        "icon-anchor": "bottom",
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
      },
      paint: {
        "icon-opacity": [
          "case",
          ["==", ["get", "slug"], selectedSlug ?? ""],
          1,
          0.9,
        ],
      },
    });
  }

  if (!map.getLayer("states-selected-outline")) {
    map.addLayer({
      id: "states-selected-outline",
      type: "line",
      source: "atlas-states",
      filter: ["==", ["get", "slug"], selectedSlug ?? ""],
      paint: {
        "line-color": "#f59e0b",
        "line-width": 3.5,
        "line-opacity": 1,
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
        "line-color": "#38bdf8",
        "line-width": 2.5,
        "line-opacity": 0.95,
      },
    });
  }

  if (map.getLayer("draft-vertices")) {
    map.moveLayer("draft-vertices");
  }
}
