import type { AtlasMapSceneProps } from "./types";
import type {
  SelectedFeatureFocusRequest,
  SelectedSlugOptions,
} from "./types";

export interface HistoricalMapProps extends AtlasMapSceneProps {
  focusRequest: SelectedFeatureFocusRequest | null;
  onSelectSlug: (slug: string, options?: SelectedSlugOptions) => void;
}

export interface HistoricalMapView {
  center?: [number, number];
  zoom?: number;
  pitch?: number;
  bearing?: number;
  maxPitch?: number;
  mode?: "flat" | "globe";
  projection?: "mercator" | "globe" | "vertical-perspective";
}

export type HistoricalMapFocusPadding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};
