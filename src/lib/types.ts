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
