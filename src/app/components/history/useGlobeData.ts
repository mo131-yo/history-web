'use client';

import { useMemo } from 'react';
import type {
  GlobeLabel,
  GlobeMapProps,
  GlobePoint,
  GlobePolygon,
} from './globeTypes';
import { computeCentroid, ringToCoords } from './globeMath';
import { createFlagCollection } from '../atlas/historicalMapGeo';

export function useGlobeData({
  battleEvents,
  collection,
  draftRing,
  layerVisibility,
  hoveredVertexIndex,
  isEditing,
  selectedVertexIndex,
}: Pick<
  GlobeMapProps,
  | 'battleEvents'
  | 'collection'
  | 'draftRing'
  | 'isEditing'
  | 'layerVisibility'
  | 'selectedVertexIndex'
> & {
  hoveredVertexIndex: number | null;
}) {
  const polygonData: GlobePolygon[] = useMemo(() => {
    if (!collection || !layerVisibility.states) return [];
    return collection.features.map((feature) => ({
      type: 'Feature' as const,
      geometry: feature.geometry,
      properties: {
        slug: feature.properties.slug,
        name: feature.properties.name,
        color: feature.properties.color ?? '#c9a45d',
        capital: feature.properties.capital,
        leader: feature.properties.leader,
      },
    }));
  }, [collection, layerVisibility.states]);

  const draftPolygons: GlobePolygon[] = useMemo(() => {
    if (!isEditing || draftRing.length < 3) return [];
    return [
      {
        type: 'Feature' as const,
        geometry: {
          type: 'Polygon' as const,
          coordinates: ringToCoords(draftRing),
        },
        properties: { slug: '__draft__', name: 'Draft', color: '#d4a843' },
      },
    ];
  }, [draftRing, isEditing]);

  const labelsData: GlobeLabel[] = useMemo(() => {
    const stateLabels =
      collection && layerVisibility.labels
        ? collection.features.map((feature) => {
            const centroid = computeCentroid(
              feature.geometry.coordinates[0] as number[][],
            );
            return {
              lat: centroid.lat,
              lng: centroid.lng,
              text: feature.properties.name,
              color: feature.properties.color ?? '#c9a45d',
              slug: feature.properties.slug,
              kind: 'label' as const,
            };
          })
        : [];

    const flagLabels =
      collection && layerVisibility.capitals
        ? createFlagCollection(collection).features.map((feature) => ({
            lat: feature.geometry.coordinates[1],
            lng: feature.geometry.coordinates[0],
            text: feature.properties.name,
            color: '#c9a45d',
            slug: feature.properties.slug,
            kind: 'flag' as const,
            flagAsset: feature.properties.flagAsset,
            flagUrl: feature.properties.flagUrl,
            flagLabel: feature.properties.flagLabel,
          }))
        : [];

    const eventLabels =
      battleEvents && layerVisibility.battles
        ? battleEvents.features.map((feature) => ({
            lat: feature.geometry.coordinates[1],
            lng: feature.geometry.coordinates[0],
            text: `${feature.properties.icon} ${feature.properties.label}`,
            color: '#f2b24f',
            slug: feature.properties.slug,
            kind: 'event' as const,
            eventType: feature.properties.eventType,
            description: feature.properties.description,
            startYear: feature.properties.startYear,
            endYear: feature.properties.endYear,
            relatedStates: feature.properties.relatedStates,
            importance: feature.properties.importance,
          }))
        : [];

    return [...stateLabels, ...flagLabels, ...eventLabels];
  }, [battleEvents, collection, layerVisibility.battles, layerVisibility.capitals, layerVisibility.labels]);

  const vertexPoints: GlobePoint[] = useMemo(
    () =>
      isEditing
        ? draftRing.map(([lng, lat], index) => ({
            lat,
            lng,
            index,
            isSelected: index === selectedVertexIndex,
            isHovered: index === hoveredVertexIndex,
          }))
        : [],
    [draftRing, hoveredVertexIndex, isEditing, selectedVertexIndex],
  );

  return {
    allPolygons: [...polygonData, ...draftPolygons],
    labelsData,
    vertexPoints,
  };
}
