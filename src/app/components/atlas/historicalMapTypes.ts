import type { AtlasFeatureCollection } from "@/lib/types";
import type {
  SelectedFeatureFocusRequest,
  SelectedSlugOptions,
} from "./types";

export interface HistoricalMapProps {
  collection: AtlasFeatureCollection | null;
  selectedSlug: string | null;
  focusRequest: SelectedFeatureFocusRequest | null;
  onSelectSlug: (slug: string, options?: SelectedSlugOptions) => void;
  isEditing: boolean;
  isCreating: boolean;
  addPointMode: boolean;
  draftRing: Array<[number, number]>;
  onDraftRingChange: (ring: Array<[number, number]>) => void;
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
