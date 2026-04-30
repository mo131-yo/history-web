"use client";
 
import { useMemo,useEffect,useState } from "react";
 
import {
  handleGlobeClick,
  toggleSelectedPoint,
} from "./history/globeEventHandlers";
import {
  getPolygonAltitude,
  getPolygonFill,
  getPolygonSide,
  getPolygonStroke,
  renderGlobeStaticLabel,
  renderEditingHud,
  renderPointLabel,
  renderPolygonLabel,
  renderSelectedBadge,
  STAR_BACKGROUND,
  syncHoveredSlug,
} from "./history/globeView";
import {
  getPointAltitude,
  getPointColor,
  getPointRadius,
} from "./history/globeMath";
import { useGlobeData } from "./history/useGlobeData";
import { useGlobeEditor } from "./history/useGlobeEditor";
import { useGlobePointerEditing } from "./history/useGlobePointerEditing";
import { Globe } from "./history/GlobeLeader";
import { AtlasMapSceneProps } from "./atlas/types";
 
const MAPTILER_HYBRID_TILE = (x: number, y: number, level: number) =>
  `https://api.maptiler.com/maps/hybrid-v4/256/${level}/${x}/${y}@2x.png?key=UDHwVf5wxc04GFo8f0PC`;
 
export default function GlobeMap(props: AtlasMapSceneProps) {
  const globeEditor = useGlobeEditor(props);
 const [stars, setStars] = useState<
    { x: number; y: number; size: number; speed: number }[]
  >([]);

  useEffect(() => {
    setStars(
      Array.from({ length: 800 }).map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 0.5,
speed: Math.random() * 0.2 + 0.05,
      }))
    );
  }, []);
  const { allPolygons, labelsData, vertexPoints } = useGlobeData({
    battleEvents: props.battleEvents,
    collection: props.collection,
    draftRing: props.draftRing,
    hoveredVertexIndex: globeEditor.hoveredVertexIndex,
    isEditing: props.isEditing,
    layerVisibility: props.layerVisibility,
    selectedVertexIndex: props.selectedVertexIndex ?? null,
  });
 
  useGlobePointerEditing({
    draftRingRef: globeEditor.draftRingRef,
    dragVertexIndexRef: globeEditor.dragVertexIndexRef,
    globeRef: globeEditor.globeRef,
    isDraggingRef: globeEditor.isDraggingRef,
    isEditingRef: globeEditor.isEditingRef,
    mounted: globeEditor.mounted,
    onDraftRingChange: props.onDraftRingChange,
    onSelectVertex: props.onSelectVertex,
    setHoveredVertexIndex: globeEditor.setHoveredVertexIndex,
    setIsDraggingVertex: globeEditor.setIsDraggingVertex,
  });
 const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const globeProps = useMemo(
    () => ({
      animateIn: true,
      atmosphereAltitude: 0.20,
      atmosphereColor: "#75b8e7",
      backgroundColor: "rgba(255, 255, 255, 0)",
      bumpImageUrl: null,
      enablePointerInteraction: true,
      globeImageUrl: null,
      globeTileEngineUrl: MAPTILER_HYBRID_TILE,
      height: globeEditor.dimensions.height,
      htmlAltitude: 0.02,
      htmlElement: (data: object) =>
        renderGlobeStaticLabel(
          data,
          props.selectedSlug,
          globeEditor.hoveredSlugRef.current,
          props.selectedEventSlug,
          props.onSelectEvent
        ),
      htmlElementsData: labelsData,
      htmlLat: "lat",
      htmlLng: "lng",
      onGlobeClick: (coords: { lat: number; lng: number }) =>
        handleGlobeClick(
          coords,
          globeEditor.isDraggingRef.current,
          props.isEditing,
          globeEditor.addPointModeRef,
          globeEditor.draftRingRef,
          globeEditor.isCreatingRef,
          props.onDraftRingChange,
          props.onSelectVertex,
          props.selectedVertexIndex ?? null
        ),
      onGlobeReady: () => {
        globeEditor.globeRef.current?.pointOfView(
          { lat: 22, lng: 0, altitude: 1.65 },
          0
        );
      },
      onPointClick: (point: object) =>
        toggleSelectedPoint(
          point,
          props.selectedVertexIndex ?? null,
          props.onSelectVertex
        ),
      onPointHover: (point: object | null) =>
        globeEditor.setHoveredVertexIndex(
          point ? (point as { index: number }).index : null
        ),
      onPolygonClick: (polygon: object) => {
        if (props.isEditing) return;
        const slug = (polygon as { properties?: { slug?: string } }).properties?.slug;
        if (!slug || slug === "__draft__") return;
        props.onSelectSlug(slug, { focus: true });
      },
      onPolygonHover: (polygon: object | null) =>
        syncHoveredSlug(
          polygon,
          globeEditor.hoveredSlugRef,
          globeEditor.setHoverTick
        ),
      pointAltitude: (data: object) => getPointAltitude(data),
      pointColor: (data: object) => getPointColor(data),
      pointLabel: (data: object) => renderPointLabel(data),
      pointLat: "lat",
      pointLng: "lng",
      pointRadius: (data: object) => getPointRadius(data),
      pointsData: vertexPoints,
      polygonAltitude: (data: object) =>
        getPolygonAltitude(
          data,
          props.selectedSlug,
          globeEditor.hoveredSlugRef.current
        ),
      polygonCapColor: (data: object) =>
        getPolygonFill(
          data,
          props.selectedSlug,
          globeEditor.hoveredSlugRef.current
        ),
      polygonGeoJsonGeometry: "geometry",
      polygonLabel: (data: object) =>
        renderPolygonLabel(data, props.selectedSlug),
      polygonsData: allPolygons,
      polygonSideColor: (data: object) =>
        getPolygonSide(
          data,
          props.selectedSlug,
          globeEditor.hoveredSlugRef.current
        ),
      polygonStrokeColor: (data: object) =>
        getPolygonStroke(
          data,
          props.selectedSlug,
          globeEditor.hoveredSlugRef.current
        ),
      pointOfView: { lat: 22, lng: 0, altitude: 1.65 },
      showAtmosphere: true,
      showGlobe: true,
      showGraticules: false,
      width: globeEditor.dimensions.width,
    }),
    [
      allPolygons,
      globeEditor.addPointModeRef,
      globeEditor.dimensions.height,
      globeEditor.dimensions.width,
      globeEditor.draftRingRef,
      globeEditor.hoveredSlugRef,
      globeEditor.isCreatingRef,
      globeEditor.isDraggingRef,
      globeEditor.setHoverTick,
      globeEditor.setHoveredVertexIndex,
      labelsData,
      props,
      vertexPoints,
    ]
  );
 useEffect(() => {
  const handleMouseMove = (e: MouseEvent) => {
    setMouse({
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    });
  };

  window.addEventListener("mousemove", handleMouseMove);
  return () => window.removeEventListener("mousemove", handleMouseMove);
}, []);
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        background: `${STAR_BACKGROUND}, radial-gradient(circle at 50% 32%, rgba(41,72,118,0.22), transparent 38%), #050608`,
      }}
    >
<div className="pointer-events-none absolute inset-0">
  {stars.map((star, i) => {
    const moveX = (mouse.x - 0.5) * star.speed * 900; 
    const moveY = (mouse.y - 0.5) * star.speed * 900;

    return (
      <div
        key={i}
        className="absolute rounded-full bg-white"
        style={{
          left: `${star.x}%`,
          top: `${star.y}%`,
          width: `${star.size}px`,
          height: `${star.size}px`,
          opacity: 0.8,
          transform: `translate3d(${moveX}px, ${moveY}px, 0)`, 
          transition: "transform 0.1s linear", 
        }}
      />
    );
  })}
</div>
      <div
        ref={globeEditor.containerRef}
        className="absolute inset-x-0 -top-2 bottom-6 lg:-top-4 lg:bottom-8"
      >
        <Globe
          {...(globeProps as Record<string, unknown>)}
          ref={globeEditor.globeRef}
        />
      </div>
 
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,transparent_18%,rgba(5,6,8,0.16)_48%,rgba(5,6,8,0.9)_100%)]" />
 
      {props.isEditing &&
        renderEditingHud(
          props,
          props.selectedVertexIndex ?? null,
          globeEditor.isDraggingVertex
        )}
 
      {props.selectedSlug &&
        renderSelectedBadge(props.collection, props.selectedSlug)}
    </div>
  );
}
 