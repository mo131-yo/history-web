import type maplibregl from "maplibre-gl";
import { MAPTILER_TERRAIN_SOURCE } from "./maptiler";

const GLOBE_TERRAIN_SOURCE_ID = "maptiler-terrain";

export function applyGlobeScene(map: maplibregl.Map) {
  if (!map.isStyleLoaded()) return;
  map.setProjection({ type: "globe" });

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

export function clearGlobeScene(map: maplibregl.Map) {
  if (!map.isStyleLoaded()) return;
  map.setTerrain(null);
  map.setProjection({ type: "mercator" });
}
