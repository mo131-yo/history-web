// // import type maplibregl from "maplibre-gl";
// // import { MAPTILER_TERRAIN_SOURCE } from "./maptiler";

// // const GLOBE_TERRAIN_SOURCE_ID = "maptiler-terrain";

// // export function applyGlobeScene(
// //   map: maplibregl.Map,
// //   projection: "globe" | "vertical-perspective" = "globe"
// // ) {
// //   if (!map.isStyleLoaded()) return;
// //   map.setProjection({ type: projection });

// //   if (!map.getSource(GLOBE_TERRAIN_SOURCE_ID)) {
// //     map.addSource(GLOBE_TERRAIN_SOURCE_ID, {
// //       type: "raster-dem",
// //       url: MAPTILER_TERRAIN_SOURCE,
// //       tileSize: 256,
// //       maxzoom: 14,
// //     });
// //   }

// //   map.setTerrain({
// //     source: GLOBE_TERRAIN_SOURCE_ID,
// //     exaggeration: 1.45,
// //   });
// // }

// // export function clearGlobeScene(map: maplibregl.Map) {
// //   if (!map.isStyleLoaded()) return;
// //   map.setTerrain(null);
// //   map.setProjection({ type: "mercator" });
// // }



// import type { Map as MapLibreMap } from "maplibre-gl";
// import { MAPTILER_TERRAIN_SOURCE } from "./maptiler";

// const GLOBE_TERRAIN_SOURCE_ID = "maptiler-terrain";

// export function applyGlobeScene(
//   map: MapLibreMap,
//   projection: "globe" | "vertical-perspective" = "globe"
// ) {
//   if (!map.isStyleLoaded()) return;

//   map.setProjection({
//     type: projection,
//   } as any);

//   if (!map.getSource(GLOBE_TERRAIN_SOURCE_ID)) {
//     map.addSource(GLOBE_TERRAIN_SOURCE_ID, {
//       type: "raster-dem",
//       url: MAPTILER_TERRAIN_SOURCE,
//       tileSize: 256,
//       maxzoom: 14,
//     });
//   }

//   map.setTerrain({
//     source: GLOBE_TERRAIN_SOURCE_ID,
//     exaggeration: 1.45,
//   });
// }

// export function clearGlobeScene(map: MapLibreMap) {
//   if (!map.isStyleLoaded()) return;

//   map.setTerrain(null);

//   map.setProjection({
//     type: "mercator",
//   });
// }

import maplibregl from "maplibre-gl";
import { MAPTILER_TERRAIN_SOURCE } from "./maptiler";

type MapLibreMap = InstanceType<typeof maplibregl.Map>;

const GLOBE_TERRAIN_SOURCE_ID = "maptiler-terrain";

export function applyGlobeScene(
  map: MapLibreMap,
  projection: "globe" | "vertical-perspective" = "globe"
) {
  if (!map.isStyleLoaded()) return;

  map.setProjection({
    type: projection,
  } as any);

  if (!map.getSource(GLOBE_TERRAIN_SOURCE_ID)) {
    map.addSource(GLOBE_TERRAIN_SOURCE_ID, {
      type: "raster-dem",
      url: MAPTILER_TERRAIN_SOURCE,
      tileSize: 256,
      maxzoom: 14,
    });
  }

  map.setTerrain({
    source: GLOBE_TERRAIN_SOURCE_ID,
    exaggeration: 1.45,
  });
}

export function clearGlobeScene(map: MapLibreMap) {
  if (!map.isStyleLoaded()) return;

  map.setTerrain(null);
  map.setProjection({ type: "mercator" });
}