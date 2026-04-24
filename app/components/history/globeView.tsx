import type { GlobeMapProps, GlobeLabel, GlobePoint, GlobePolygon } from "./globeTypes";
import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import { getPolygonSlug, hexToRgba, lighten } from "./globeMath";

export const STAR_BACKGROUND = `
  radial-gradient(1px 1px at 12% 18%, rgba(245,230,200,0.5) 0%, transparent 100%),
  radial-gradient(1px 1px at 85% 12%, rgba(245,230,200,0.35) 0%, transparent 100%),
  radial-gradient(1px 1px at 55% 88%, rgba(245,230,200,0.4) 0%, transparent 100%),
  radial-gradient(1px 1px at 28% 72%, rgba(245,230,200,0.3) 0%, transparent 100%),
  radial-gradient(1px 1px at 72% 45%, rgba(245,230,200,0.45) 0%, transparent 100%),
  radial-gradient(1px 1px at 40% 30%, rgba(245,230,200,0.25) 0%, transparent 100%),
  radial-gradient(1px 1px at 90% 70%, rgba(245,230,200,0.3) 0%, transparent 100%),
  radial-gradient(1px 1px at 18% 55%, rgba(245,230,200,0.35) 0%, transparent 100%)
`;

export function getPolygonFill(data: object, selectedSlug: string | null, hoveredSlug: string | null) {
  const { slug, color } = (data as GlobePolygon).properties;
  if (slug === "__draft__") return "rgba(212,168,67,0.22)";
  if (slug === selectedSlug) return hexToRgba(lighten(color, 0.1), 0.68);
  if (slug === hoveredSlug) return hexToRgba(lighten(color, 0.05), 0.52);
  return hexToRgba(color, 0.35);
}

export function getPolygonSide(data: object, selectedSlug: string | null, hoveredSlug: string | null) {
  const { slug, color } = (data as GlobePolygon).properties;
  if (slug === "__draft__") return "rgba(212,168,67,0.55)";
  if (slug === selectedSlug) return hexToRgba(color, 0.85);
  if (slug === hoveredSlug) return hexToRgba(color, 0.65);
  return hexToRgba(color, 0.45);
}

export function getPolygonStroke(data: object, selectedSlug: string | null, hoveredSlug: string | null) {
  const { slug, color } = (data as GlobePolygon).properties;
  if (slug === "__draft__") return "#d4a843";
  if (slug === selectedSlug) return lighten(color, 0.3);
  if (slug === hoveredSlug) return lighten(color, 0.15);
  return "rgba(20,12,0,0.55)";
}

export function getPolygonAltitude(data: object, selectedSlug: string | null, hoveredSlug: string | null) {
  const slug = (data as GlobePolygon).properties.slug;
  if (slug === "__draft__") return 0.02;
  if (slug === selectedSlug) return 0.014;
  if (slug === hoveredSlug) return 0.008;
  return 0.003;
}

export function getPolygonStrokeWidth(data: object, selectedSlug: string | null, hoveredSlug: string | null) {
  const slug = (data as GlobePolygon).properties.slug;
  if (slug === selectedSlug) return 1.8;
  if (slug === hoveredSlug) return 1;
  return 0.35;
}

export function getDynamicLabelColor(data: object, selectedSlug: string | null, hoveredSlug: string | null) {
  const label = data as GlobeLabel;
  if (label.slug === selectedSlug) return "#f5e6c8";
  if (label.slug === hoveredSlug) return lighten(label.color, 0.2);
  return lighten(label.color, 0.05);
}

export function syncHoveredSlug(
  data: object | null,
  hoveredSlugRef: MutableRefObject<string | null>,
  setHoverTick: Dispatch<SetStateAction<number>>,
) {
  const slug = getPolygonSlug(data);
  if (hoveredSlugRef.current !== slug) {
    hoveredSlugRef.current = slug;
    setHoverTick((tick) => tick + 1);
  }
}

export function renderPolygonLabel(data: object, selectedSlug: string | null) {
  const { slug, name, color } = (data as GlobePolygon).properties;
  if (slug === "__draft__") return "";
  const isSelected = slug === selectedSlug;
  return `<div style="background:rgba(10,6,2,0.93);border:1px solid ${isSelected ? "#c9a45d" : hexToRgba(color, 0.4)};border-radius:6px;padding:6px 11px;font-family:Georgia,serif;color:#e8d8b8;font-size:12px;letter-spacing:0.05em;box-shadow:0 4px 16px rgba(0,0,0,0.7);white-space:nowrap;"><span style="color:${isSelected ? "#d4a843" : lighten(color, 0.15)};font-weight:600;font-size:12px;">${name}</span></div>`;
}

export function renderPointLabel(data: object) {
  const point = data as GlobePoint;
  return `<div style="background:rgba(10,6,2,0.92);border:1px solid ${point.isSelected ? "rgba(245,158,11,0.6)" : "rgba(201,164,93,0.3)"};border-radius:5px;padding:3px 8px;color:${point.isSelected ? "#f59e0b" : "#c9a45d"};font-size:10px;font-family:Georgia,serif;white-space:nowrap;">цэг #${point.index + 1}${point.isSelected ? " · сонгогдсон" : ""}</div>`;
}

export function renderEditingHud(props: GlobeMapProps, selectedVertexIndex: number | null, isDraggingVertex: boolean) {
  const selectedVertex = selectedVertexIndex !== null ? props.draftRing[selectedVertexIndex] : null;
  return <>
    <div className="pointer-events-none absolute left-4 top-4 z-20 flex max-w-55 flex-col gap-2">
      <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs" style={{ background: "rgba(10,6,2,0.92)", border: "1px solid rgba(90,60,20,0.5)", color: "#c9a45d", fontFamily: "Georgia, serif", backdropFilter: "blur(4px)" }}>
        <span style={{ fontSize: 10, opacity: 0.7 }}>◆</span>
        <span>{props.draftRing.length} орой</span>
        {selectedVertexIndex !== null && <span style={{ color: "#f59e0b", marginLeft: 4 }}>· #{selectedVertexIndex + 1} сонгосон</span>}
      </div>
      {selectedVertex ? (
        <div className="rounded-lg px-3 py-2 text-xs" style={{ background: "rgba(10,6,2,0.92)", border: "1px solid rgba(245,158,11,0.3)", color: "#e8d8b8", fontFamily: "Georgia, serif", backdropFilter: "blur(4px)", fontSize: 10, lineHeight: 1.8 }}>
          <div style={{ color: "#f59e0b", marginBottom: 2, fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase" }}>#{selectedVertexIndex! + 1} цэг</div>
          <div>Урт: {selectedVertex[0].toFixed(4)}°</div>
          <div>Өрг: {selectedVertex[1].toFixed(4)}°</div>
          <div style={{ marginTop: 4, color: "#5c4020", fontSize: 9 }}>Чирж байршлыг өөрчил · Delete устгах</div>
        </div>
      ) : (
        <div className="rounded-lg px-3 py-1.5 text-xs" style={{ background: "rgba(10,6,2,0.85)", border: "1px solid rgba(90,60,20,0.3)", color: "#5c4020", fontFamily: "Georgia, serif", backdropFilter: "blur(4px)", fontSize: 9, letterSpacing: "0.05em" }}>
          {props.isCreating ? "Газрын зураг дарж цэг нэм" : props.addPointMode ? "Дарж шинэ цэг оруул" : "Цэг дарж сонго · чир"}
        </div>
      )}
    </div>
    {isDraggingVertex && (
      <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.1)" }}>
        <div className="rounded-lg px-4 py-2 text-xs" style={{ background: "rgba(10,6,2,0.92)", border: "1px solid rgba(245,158,11,0.4)", color: "#f59e0b", fontFamily: "Georgia, serif", fontSize: 11 }}>
          ⟳ Цэгийн байрлалыг өөрчилж байна…
        </div>
      </div>
    )}
  </>;
}

export function renderSelectedBadge(collection: GlobeMapProps["collection"], selectedSlug: string) {
  const feature = collection?.features.find((item) => item.properties.slug === selectedSlug);
  if (!feature) return null;
  const color = feature.properties.color ?? "#c9a45d";
  return (
    <div className="pointer-events-none absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-[10px] px-[18px] py-2" style={{ background: "rgba(10,6,2,0.9)", border: `1px solid ${hexToRgba(color, 0.35)}`, backdropFilter: "blur(8px)", boxShadow: "0 2px 20px rgba(0,0,0,0.6)" }}>
      <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0, boxShadow: `0 0 6px ${hexToRgba(color, 0.7)}` }} />
      <span style={{ color: "#f0e0c0", fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.04em" }}>{feature.properties.name}</span>
      {feature.properties.capital && <span style={{ color: "#7a5c2a", fontSize: 11, fontFamily: "Georgia, serif" }}>{feature.properties.capital}</span>}
    </div>
  );
}
