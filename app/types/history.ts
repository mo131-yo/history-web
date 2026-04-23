export interface FeatureMetadata {
  strategic_focus?: string;
  internal_politics?: string;
  economy?: string;
  religion?: string;
  vulnerability?: string;
  military?: {
    total_manpower?: string;
  };
  military_structure?: {
    elite_guard?: string;
    tactics?: string;
  };
}

export interface HistoricalFeatureProperties {
  name?: string;
  type?: string;
  color?: string;
  leader?: string;
  capital?: string;
  description?: string;
  metadata?: FeatureMetadata;
}

export type HistoricalFeature = GeoJSON.Feature<
  GeoJSON.Geometry,
  HistoricalFeatureProperties
>;

export type HistoricalFeatureCollection = GeoJSON.FeatureCollection<
  GeoJSON.Geometry,
  HistoricalFeatureProperties
>;
