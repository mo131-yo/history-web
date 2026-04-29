import maplibregl, { type GeoJSONSource } from "maplibre-gl";
import type { AtlasFeatureCollection, AtlasStateFeature } from "@/lib/types";

type MapLibreMap = InstanceType<typeof maplibregl.Map>;

const CLOUDINARY_CLOUD_NAME = "dzljgphud";
const FLAG_PUBLIC_IDS_BY_SLUG: Record<string, string> = {
  "golden-horde": "atlas-flags/golden-horde",
  "golden-horde-frontier": "atlas-flags/golden-horde",
  "jin-dynasty": "atlas-flags/jin-dynasty",
  "western-xia": "atlas-flags/western-xia",
  "delhi-sultanate": "atlas-flags/delhi-sultanate",
  "ilkhanate": "atlas-flags/ilkhanate",
  "ilkhanate-frontier": "atlas-flags/ilkhanate",
  "great-mongol-state": "atlas-flags/great-mongol-state",
  "khamag-mongol": "atlas-flags/khamag-mongol",
  "mongol-empire": "atlas-flags/mongol-empire",
  "uighur-idiqut": "atlas-flags/uighur-idiqut",
  "qara-khitai": "atlas-flags/qara-khitai",
  "khwarazm": "atlas-flags/khwarazm",
  "chagatai-khanate": "atlas-flags/chagatai-khanate",
  "yuan-dynasty": "atlas-flags/yuan-dynasty",
  "song-dynasty": "atlas-flags/song-dynasty",
  "mamluk-sultanate": "atlas-flags/mamluk-sultanate",
};

type FlagProperties = {
  slug: string;
  name: string;
  flagAsset: string;
  flagUrl: string;
  flagLabel: string;
};

export type FlagFeature = GeoJSON.Feature<GeoJSON.Point, FlagProperties>;
export type FlagFeatureCollection = GeoJSON.FeatureCollection<GeoJSON.Point, FlagProperties>;

export function normalizeLngLatLike(value: unknown): [number, number] | null {
  if (Array.isArray(value) && value.length >= 2) {
    const lng = Number(value[0]);
    const lat = Number(value[1]);
    if (Number.isFinite(lng) && Number.isFinite(lat)) return [lng, lat];
  }

  if (value && typeof value === "object") {
    const candidate = value as { lng?: unknown; lon?: unknown; lat?: unknown };
    const lng = Number(candidate.lng ?? candidate.lon);
    const lat = Number(candidate.lat);
    if (Number.isFinite(lng) && Number.isFinite(lat)) return [lng, lat];
  }

  return null;
}

export function getFeatureCenter(
  feature: GeoJSON.Feature<GeoJSON.Polygon> | undefined,
): [number, number] | null {
  const ring = feature?.geometry.coordinates?.[0];
  if (!ring || ring.length === 0) return null;
  const uniquePoints = ring.slice(0, -1);
  const points = uniquePoints.length > 0 ? uniquePoints : ring;
  if (points.length === 0) return null;

  const total = points.reduce(
    (acc, [lng, lat]) => ({ lng: acc.lng + lng, lat: acc.lat + lat }),
    { lng: 0, lat: 0 },
  );

  return [total.lng / points.length, total.lat / points.length];
}

export function getFeatureBounds(
  feature: GeoJSON.Feature<GeoJSON.Polygon> | undefined,
): maplibregl.LngLatBoundsLike | null {
  const ring = feature?.geometry.coordinates?.[0];
  if (!ring || ring.length === 0) return null;

  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  for (const [lng, lat] of ring) {
    minLng = Math.min(minLng, lng);
    minLat = Math.min(minLat, lat);
    maxLng = Math.max(maxLng, lng);
    maxLat = Math.max(maxLat, lat);
  }

  if (![minLng, minLat, maxLng, maxLat].every(Number.isFinite)) return null;
  return [[minLng, minLat], [maxLng, maxLat]];
}

export function createDraftPolygon(ring: Array<[number, number]>) {
  const displayRing =
    ring.length > 0 &&
    ring[0][0] === ring[ring.length - 1]?.[0] &&
    ring[0][1] === ring[ring.length - 1]?.[1]
      ? ring
      : ring.length >= 3
        ? [...ring, ring[0]]
        : ring;

  return {
    type: "FeatureCollection" as const,
    features:
      displayRing.length >= 4
        ? [
            {
              type: "Feature" as const,
              geometry: { type: "Polygon" as const, coordinates: [displayRing] },
              properties: {},
            },
          ]
        : [],
  };
}

export function createVertexCollection(ring: Array<[number, number]>) {
  return {
    type: "FeatureCollection" as const,
    features: ring.map((coordinates, index) => ({
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates },
      properties: { index },
    })),
  };
}

export function createFlagCollection(
  collection: AtlasFeatureCollection | GeoJSON.FeatureCollection | null | undefined,
): FlagFeatureCollection {
  const features = (collection?.features ?? [])
    .map((feature) => createFlagFeature(feature as AtlasStateFeature))
    .filter((feature): feature is FlagFeature => Boolean(feature));

  return {
    type: "FeatureCollection",
    features,
  };
}

export function getRequiredFlagImages(collection: FlagFeatureCollection) {
  const images = new Map<string, string>();

  for (const feature of collection.features) {
    const { flagAsset, flagUrl } = feature.properties;
    if (flagAsset && flagUrl) images.set(`flag-${flagAsset}`, flagUrl);
  }

  return Array.from(images, ([id, url]) => ({ id, url }));
}

export async function loadFlagImages(
  map: MapLibreMap,
  collection: FlagFeatureCollection,
) {
  const images = getRequiredFlagImages(collection);

  await Promise.all(
    images.map(async ({ id, url }) => {
      if (map.hasImage(id)) return;

      try {
        const response = await map.loadImage(url);
        if (!map.hasImage(id)) map.addImage(id, response.data);
      } catch {
        // Flag assets may be uploaded later; missing images should never break the map.
      }
    }),
  );
}

// export function safeSetData(
//   map: maplibregl.Map,
//   sourceId: string,
//   data: GeoJSON.FeatureCollection,
// ) {
//   const source = map.getSource(sourceId) as GeoJSONSource | undefined;
//   source?.setData(data);
// }



export function safeSetData(
  map: MapLibreMap,
  sourceId: string,
  data: GeoJSON.FeatureCollection
) {
  const source = map.getSource(sourceId) as GeoJSONSource | undefined;
  source?.setData(data);
}

function createFlagFeature(feature: AtlasStateFeature): FlagFeature | null {
  const center =
    normalizeLngLatLike(feature.properties.center) ||
    getFeatureCenter(feature as GeoJSON.Feature<GeoJSON.Polygon>);
  if (!center) return null;

  const slug = feature.properties.slug;
  const flag = getFlagMetadata(feature);
  if (!flag?.url || !flag.asset) return null;

  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: center,
    },
    properties: {
      slug,
      name: feature.properties.name,
      flagAsset: flag.asset,
      flagUrl: flag.url,
      flagLabel: flag.label ?? `${feature.properties.name} далбаа`,
    },
  };
}

function getFlagMetadata(feature: AtlasStateFeature) {
  const flag = feature.properties.metadata?.flag;
  if (flag?.url && flag.asset) {
    return {
      asset: flag.asset,
      url: flag.url,
      label: flag.label,
    };
  }

  const publicId = FLAG_PUBLIC_IDS_BY_SLUG[feature.properties.slug];
  if (!publicId) return null;

  const asset = publicId.split("/").at(-1) ?? feature.properties.slug;

  return {
    asset,
    publicId,
    url: `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/${publicId}.png`,
    label: `${feature.properties.name} далбаа`,
  };
}
