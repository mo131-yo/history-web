// "use client";

// import maplibregl from "maplibre-gl";
// import type { HistoricalMapFocusPadding, HistoricalMapProps } from "./historicalMapTypes";
// import {
//   createDraftPolygon,
//   createVertexCollection,
//   getFeatureBounds,
//   getFeatureCenter,
//   normalizeLngLatLike,
//   safeSetData,
// } from "./historicalMapGeo";

// export function syncCollection(
//   map: maplibregl.Map | null,
//   ready: boolean,
//   collection: HistoricalMapProps["collection"],
//   selectedSlug: string | null,
//   padding: HistoricalMapFocusPadding,
// ) {
//   if (!map) return;
//   const push = () => {
//     safeSetData(map, "atlas-states", collection ?? { type: "FeatureCollection", features: [] });
//     if (!selectedSlug || !collection) return;
//     const selected = collection.features.find((feature) => feature.properties.slug === selectedSlug);
//     const shape = selected as GeoJSON.Feature<GeoJSON.Polygon> | undefined;
//     const bounds = getFeatureBounds(shape);
//     const center = normalizeLngLatLike(selected?.properties.center) || getFeatureCenter(shape);
//     if (bounds) map.fitBounds(bounds, { padding, maxZoom: 4, duration: 700, essential: true });
//     else if (center) map.flyTo({ center, zoom: Math.max(Math.min(map.getZoom(), 3.8), 3), speed: 0.7 });
//   };
//   if (ready && map.isStyleLoaded()) push();
//   else map.once("load", push);
// }

// export function syncSelection(map: maplibregl.Map | null, ready: boolean, selectedSlug: string | null) {
//   if (!map) return;
//   const apply = () => map.getLayer("states-selected-outline") && map.setFilter("states-selected-outline", ["==", ["get", "slug"], selectedSlug ?? ""]);
//   if (ready && map.isStyleLoaded()) apply();
//   else map.once("load", apply);
// }

// export function syncDraft(map: maplibregl.Map | null, ready: boolean, draftRing: Array<[number, number]>, isEditing: boolean) {
//   if (!map) return;
//   const apply = () => {
//     safeSetData(map, "draft-polygon", isEditing ? createDraftPolygon(draftRing) : createDraftPolygon([]));
//     safeSetData(map, "draft-vertices", isEditing ? createVertexCollection(draftRing) : createVertexCollection([]));
//   };
//   if (ready && map.isStyleLoaded()) apply();
//   else map.once("load", apply);
// }



"use client";

import maplibregl from "maplibre-gl";
import type {
  HistoricalMapFocusPadding,
  HistoricalMapProps,
} from "./historicalMapTypes";
import {
  createDraftPolygon,
  createFlagCollection,
  createVertexCollection,
  getFeatureBounds,
  getFeatureCenter,
  loadFlagImages,
  normalizeLngLatLike,
  safeSetData,
} from "./historicalMapGeo";

type MapLibreMap = InstanceType<typeof maplibregl.Map>;

export function syncCollection(
  map: MapLibreMap | null,
  ready: boolean,
  collection: HistoricalMapProps["collection"]
) {
  if (!map) return;

  const push = () => {
    const emptyCollection = {
      type: "FeatureCollection" as const,
      features: [],
    };
    const nextCollection = collection ?? emptyCollection;
    const flagCollection = createFlagCollection(nextCollection);

    safeSetData(
      map,
      "atlas-states",
      nextCollection
    );
    safeSetData(map, "state-flags", flagCollection);
    void loadFlagImages(map, flagCollection);

  if (ready && map.isStyleLoaded()) push();
  else map.once("load", push);
}

export function syncSelectedFeatureFocus(
  map: MapLibreMap | null,
  ready: boolean,
  collection: HistoricalMapProps["collection"],
  focusRequest: HistoricalMapProps["focusRequest"],
  padding: HistoricalMapFocusPadding
) {
  if (!map || !collection || !focusRequest) return false;
  if (focusRequest.year !== undefined && collection.year !== focusRequest.year) {
    return false;
  }

  const selected = collection.features.find(
    (feature) => feature.properties.slug === focusRequest.slug
  );

  if (!selected) return false;

  const focus = () => {
    const shape = selected as GeoJSON.Feature<GeoJSON.Polygon> | undefined;
    const bounds = getFeatureBounds(shape);

    const center =
      normalizeLngLatLike(selected?.properties.center) ||
      getFeatureCenter(shape);

    if (bounds) {
      map.fitBounds(bounds, {
        padding,
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
  };

  if (ready && map.isStyleLoaded()) focus();
  else map.once("load", focus);

  return true;
}

export function syncSelection(
  map: MapLibreMap | null,
  ready: boolean,
  selectedSlug: string | null
) {
  if (!map) return;

  const apply = () => {
    if (!map.getLayer("states-selected-outline")) return;

    map.setFilter("states-selected-outline", [
      "==",
      ["get", "slug"],
      selectedSlug ?? "",
    ]);
  };

  if (ready && map.isStyleLoaded()) apply();
  else map.once("load", apply);
}

export function syncDraft(
  map: MapLibreMap | null,
  ready: boolean,
  draftRing: Array<[number, number]>,
  isEditing: boolean
) {
  if (!map) return;

  const apply = () => {
    safeSetData(
      map,
      "draft-polygon",
      isEditing ? createDraftPolygon(draftRing) : createDraftPolygon([])
    );

    safeSetData(
      map,
      "draft-vertices",
      isEditing ? createVertexCollection(draftRing) : createVertexCollection([])
    );
  };

  if (ready && map.isStyleLoaded()) apply();
  else map.once("load", apply);
}
