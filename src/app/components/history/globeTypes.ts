import type { AtlasFeatureCollection } from '@/lib/types';
import type {
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
};

export interface GlobeMapProps {
  collection: AtlasFeatureCollection | null;
  selectedSlug: string | null;
  focusRequest: SelectedFeatureFocusRequest | null;
  onSelectSlug: (slug: string, options?: SelectedSlugOptions) => void;
  isEditing: boolean;
  isCreating: boolean;
  addPointMode: boolean;
  draftRing: Array<[number, number]>;
  onDraftRingChange: (ring: Array<[number, number]>) => void;
  selectedVertexIndex?: number | null;
  onSelectVertex?: (index: number | null) => void;
}
