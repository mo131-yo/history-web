"use client";
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface Props {
  year: number;
}

const HistoricalMap = forwardRef((props: Props, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useImperativeHandle(ref, () => ({
    flyToLocation: (center: [number, number], zoom: number) => {
      map.current?.flyTo({ center, zoom, speed: 1.5, curve: 1 });
    }
  }));

  useEffect(() => {
    if (!mapContainer.current) return;

    const mapOptions: any = {
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json', 
      center: [45, 40],
      zoom: 1.5,
      antialias: true 
    };

    map.current = new maplibregl.Map(mapOptions);

    map.current.on('load', () => {
      if (!map.current) return;

      const mapInstance = map.current as any; 

      if (typeof mapInstance.setProjection === 'function') {
        mapInstance.setProjection({
          type: 'globe'
        });
      }

      if (typeof mapInstance.setFog === 'function') {
        mapInstance.setFog({
          'color': 'rgb(11, 24, 44)',
          'high-color': 'rgb(36, 92, 223)',
          'horizon-blend': 0.05,
          'space-color': 'rgb(0, 0, 0)',
          'star-intensity': 0.6
        });
      }

      map.current.addSource('historical-borders', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.current.addLayer({
        id: 'borders-fill',
        type: 'fill',
        source: 'historical-borders',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.6
        }
      });

      map.current.addLayer({
        id: 'borders-line',
        type: 'line',
        source: 'historical-borders',
        paint: {
          'line-color': '#ffffff',
          'line-width': 0.8,
          'line-opacity': 0.5
        }
      });
    });

    return () => map.current?.remove();
  }, []);

  useEffect(() => {
    if (map.current?.getSource('historical-borders')) {
      const source = map.current.getSource('historical-borders') as maplibregl.GeoJSONSource;
      fetch(`/data/${props.year}.json`)
        .then(res => res.json())
        .then(data => source.setData(data))
        .catch(() => source.setData({ type: 'FeatureCollection', features: [] }));
    }
  }, [props.year]);

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-full bg-black rounded-[2rem] overflow-hidden" 
    />
  );
});

HistoricalMap.displayName = "HistoricalMap";
export default HistoricalMap;