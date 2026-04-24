import type { AtlasFeatureCollection } from "@/lib/types";

export interface HistoricalMapProps {
  collection: AtlasFeatureCollection | null;
  selectedSlug: string | null;
  onSelectSlug: (slug: string) => void;
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
}

export type HistoricalMapFocusPadding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};
