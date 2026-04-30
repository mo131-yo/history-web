import type {
  AtlasEventFeatureCollection,
  AtlasFeatureCollection,
} from '@/lib/types';
import type {
  AtlasLayerVisibility,
  SelectedFeatureFocusRequest,
  SelectedSlugOptions,
} from '../atlas/types';

export type GlobePolygon = {
  type: 'Feature';
  geometry: { type: 'Polygon'; coordinates: number[][][] };
  properties: {
    slug: string;
    name: string;
    color: string;
    capital?: string;
    leader?: string;
  };
};

export type GlobePoint = {
  lat: number;
  lng: number;
  index: number;
  isSelected: boolean;
  isHovered: boolean;
};

export type GlobeLabel = {
  lat: number;
  lng: number;
  text: string;
  color: string;
  slug: string;
  kind?: 'label' | 'event';
  eventType?: string;
  description?: string;
  startYear?: number;
  endYear?: number;
  relatedStates?: string[];
  importance?: number;
};

export interface GlobeMapProps {
  collection: AtlasFeatureCollection | null;
  battleEvents: AtlasEventFeatureCollection | null;
  selectedSlug: string | null;
  selectedEventSlug: string | null;
  focusRequest: SelectedFeatureFocusRequest | null;
  onSelectSlug: (slug: string, options?: SelectedSlugOptions) => void;
  onSelectEvent: (slug: string | null) => void;
  isEditing: boolean;
  isCreating: boolean;
  addPointMode: boolean;
  draftRing: Array<[number, number]>;
  onDraftRingChange: (ring: Array<[number, number]>) => void;
  layerVisibility: AtlasLayerVisibility;
  selectedVertexIndex?: number | null;
  onSelectVertex?: (index: number | null) => void;
}
