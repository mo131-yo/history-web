export interface AtlasMetadata {
  periodName?: string;
  culture?: string;
  religion?: string;
  economy?: string;
  military?: string;
  governance?: string;
  notableEvents?: string[];
  strategicFocus?: string;
}

export interface AtlasEventMetadata {
  icon?: string;
  label?: string;
  importance?: number;
  [key: string]: unknown;
}

export interface AtlasStateRecord {
  slug: string;
  year: number;
  name: string;
  leader: string;
  capital: string;
  color: string;
  summary: string;
  metadata: AtlasMetadata;
  geometry: GeoJSON.Polygon;
}


export interface AtlasStateProperties {
  [key: string]: unknown;
  slug: string;
  year: number;
  name: string;
  leader: string;
  capital: string;
  color: string;
  summary: string;
  metadata: AtlasMetadata;
  center: [number, number];
  updatedAt: string;
}

export type AtlasStateFeature = GeoJSON.Feature<GeoJSON.Polygon, AtlasStateProperties>;

export interface AtlasFeatureCollection extends GeoJSON.FeatureCollection<GeoJSON.Polygon, AtlasStateProperties> {
  year: number;
}

export interface AtlasEventProperties {
  slug: string;
  startYear: number;
  endYear: number;
  title: string;
  description: string;
  eventType: string;
  relatedStates: string[];
  icon: string;
  label: string;
  importance: number;
  metadata: AtlasEventMetadata;
}

export type AtlasEventFeature = GeoJSON.Feature<
  GeoJSON.Point,
  AtlasEventProperties
>;

export interface AtlasEventFeatureCollection
  extends GeoJSON.FeatureCollection<GeoJSON.Point, AtlasEventProperties> {
  year: number;
}

export interface AtlasStateInput {
  year: number;
  name: string;
  leader: string;
  capital: string;
  color: string;
  summary: string;
  metadata?: AtlasMetadata;
  geometry: GeoJSON.Polygon;
}
