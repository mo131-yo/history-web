import type {
  GlobeMapProps,
  GlobeLabel,
  GlobePoint,
  GlobePolygon,
} from './globeTypes';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { getPolygonSlug, hexToRgba, lighten } from './globeMath';

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

export function getPolygonFill(
  data: object,
  selectedSlug: string | null,
  hoveredSlug: string | null,
) {
  const { slug, color } = (data as GlobePolygon).properties;
  if (slug === '__draft__') return 'rgba(212,168,67,0.22)';
  if (slug === selectedSlug) return hexToRgba(lighten(color, 0.1), 0.68);
  if (slug === hoveredSlug) return hexToRgba(lighten(color, 0.05), 0.52);
  return hexToRgba(color, 0.35);
}

export function getPolygonSide(
  data: object,
  selectedSlug: string | null,
  hoveredSlug: string | null,
) {
  const { slug, color } = (data as GlobePolygon).properties;
  if (slug === '__draft__') return 'rgba(212,168,67,0.55)';
  if (slug === selectedSlug) return hexToRgba(color, 0.85);
  if (slug === hoveredSlug) return hexToRgba(color, 0.65);
  return hexToRgba(color, 0.45);
}

export function getPolygonStroke(
  data: object,
  selectedSlug: string | null,
  hoveredSlug: string | null,
) {
  const { slug, color } = (data as GlobePolygon).properties;
  if (slug === '__draft__') return '#d4a843';
  if (slug === selectedSlug) return lighten(color, 0.3);
  if (slug === hoveredSlug) return lighten(color, 0.15);
  return 'rgba(20,12,0,0.55)';
}

export function getPolygonAltitude(
  data: object,
  selectedSlug: string | null,
  hoveredSlug: string | null,
) {
  const slug = (data as GlobePolygon).properties.slug;
  if (slug === '__draft__') return 0.02;
  if (slug === selectedSlug) return 0.014;
  if (slug === hoveredSlug) return 0.008;
  return 0.003;
}

export function getPolygonStrokeWidth(
  data: object,
  selectedSlug: string | null,
  hoveredSlug: string | null,
) {
  const slug = (data as GlobePolygon).properties.slug;
  if (slug === selectedSlug) return 1.8;
  if (slug === hoveredSlug) return 1;
  return 0.35;
}

export function getDynamicLabelColor(
  data: object,
  selectedSlug: string | null,
  hoveredSlug: string | null,
) {
  const label = data as GlobeLabel;
  if (label.slug === selectedSlug) return '#f5e6c8';
  if (label.slug === hoveredSlug) return lighten(label.color, 0.2);
  return lighten(label.color, 0.05);
}

export function renderGlobeStaticLabel(
  data: object,
  selectedSlug: string | null,
  hoveredSlug: string | null,
  selectedEventSlug?: string | null,
  onSelectEvent?: (slug: string | null) => void,
) {
  const label = data as GlobeLabel;
  if (label.kind === 'event') {
    const element = document.createElement('button');
    const isSelected = label.slug === selectedEventSlug;

    element.type = 'button';
    element.textContent = label.text;
    element.onclick = () => onSelectEvent?.(label.slug);
    element.style.color = isSelected ? '#fff1cd' : '#f2b24f';
    element.style.fontFamily = 'var(--font-inter), Arial, sans-serif';
    element.style.fontSize = isSelected ? '16px' : '14px';
    element.style.fontWeight = isSelected ? '700' : '600';
    element.style.whiteSpace = 'nowrap';
    element.style.padding = isSelected ? '5px 10px' : '4px 8px';
    element.style.borderRadius = '999px';
    element.style.border = isSelected
      ? '1px solid rgba(255,215,128,0.82)'
      : '1px solid rgba(201,164,93,0.35)';
    element.style.background = isSelected
      ? 'rgba(31,16,3,0.92)'
      : 'rgba(14,9,2,0.82)';
    element.style.boxShadow =
      '0 0 2px rgba(5,6,8,0.95), 0 0 14px rgba(0,0,0,0.66), 0 4px 14px rgba(0,0,0,0.45)';
    element.style.pointerEvents = 'auto';
    element.style.cursor = 'pointer';
    element.style.userSelect = 'none';
    element.style.transform = 'translate(-50%, -50%)';
    return element;
  }

  if (label.kind === 'flag' && label.flagUrl) {
    const element = document.createElement('div');
    const image = document.createElement('img');
    const isSelected = label.slug === selectedSlug;

    image.src = label.flagUrl;
    image.alt = label.flagLabel ?? `${label.text} далбаа`;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.onerror = () => {
      element.style.display = 'none';
    };

    image.style.display = 'block';
    image.style.width = isSelected ? '34px' : '28px';
    image.style.height = isSelected ? '22px' : '18px';
    image.style.objectFit = 'cover';
    image.style.borderRadius = '3px';
    image.style.border = isSelected
      ? '1px solid rgba(255,244,219,0.92)'
      : '1px solid rgba(201,164,93,0.62)';
    image.style.boxShadow =
      '0 2px 7px rgba(0,0,0,0.72), 0 0 10px rgba(201,164,93,0.22)';

    element.appendChild(image);
    element.title = image.alt;
    element.style.pointerEvents = 'none';
    element.style.userSelect = 'none';
    element.style.transform = 'translate(-50%, -115%)';

    return element;
  }

  const element = document.createElement('div');
  const isSelected = label.slug === selectedSlug;
  const isHovered = label.slug === hoveredSlug;
  const color = isSelected
    ? '#fff4db'
    : isHovered
      ? lighten(label.color, 0.26)
      : lighten(label.color, 0.14);

  element.textContent = label.text;
  element.style.color = color;
  element.style.fontFamily = 'var(--font-inter), Arial, sans-serif';
  element.style.fontSize = isSelected ? '20px' : '17px';
  element.style.fontWeight = isSelected ? '700' : '600';
  element.style.letterSpacing = '0.03em';
  element.style.whiteSpace = 'nowrap';
  element.style.textShadow =
    '0 0 2px rgba(5,6,8,0.95), 0 0 8px rgba(5,6,8,0.78), 0 1px 10px rgba(0,0,0,0.82)';
  element.style.pointerEvents = 'none';
  element.style.userSelect = 'none';
  element.style.transform = 'translate(-50%, -50%)';

  return element;
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
  if (slug === '__draft__') return '';
  const isSelected = slug === selectedSlug;
  return `<div style="background:rgba(10,6,2,0.93);border:1px solid ${isSelected ? '#c9a45d' : hexToRgba(color, 0.4)};border-radius:6px;padding:6px 11px;font-family:var(--font-inter),Arial,sans-serif;color:#e8d8b8;font-size:12px;letter-spacing:0.05em;box-shadow:0 4px 16px rgba(0,0,0,0.7);white-space:nowrap;"><span style="color:${isSelected ? '#d4a843' : lighten(color, 0.15)};font-weight:600;font-size:12px;">${name}</span></div>`;
}

export function renderPointLabel(data: object) {
  const point = data as GlobePoint;
  return `<div style="background:rgba(10,6,2,0.92);border:1px solid ${point.isSelected ? 'rgba(245,158,11,0.6)' : 'rgba(201,164,93,0.3)'};border-radius:5px;padding:3px 8px;color:${point.isSelected ? '#f59e0b' : '#c9a45d'};font-size:10px;font-family:var(--font-inter),Arial,sans-serif;white-space:nowrap;">цэг #${point.index + 1}${point.isSelected ? ' · сонгогдсон' : ''}</div>`;
}

export function renderEditingHud(
  props: GlobeMapProps,
  selectedVertexIndex: number | null,
  isDraggingVertex: boolean,
) {
  const selectedVertex =
    selectedVertexIndex !== null ? props.draftRing[selectedVertexIndex] : null;
  return (
    <>
      <div className="pointer-events-none absolute left-4 top-4 z-20 flex max-w-55 flex-col gap-2">
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs"
          style={{
            background: 'rgba(10,6,2,0.92)',
            border: '1px solid rgba(90,60,20,0.5)',
            color: '#c9a45d',
            fontFamily: 'var(--font-inter), Arial, sans-serif',
            backdropFilter: 'blur(4px)',
          }}
        >
          <span style={{ fontSize: 10, opacity: 0.7 }}>◆</span>
          <span>{props.draftRing.length} орой</span>
          {selectedVertexIndex !== null && (
            <span style={{ color: '#f59e0b', marginLeft: 4 }}>
              · #{selectedVertexIndex + 1} сонгосон
            </span>
          )}
        </div>
        {selectedVertex ? (
          <div
            className="rounded-lg px-3 py-2 text-xs"
            style={{
              background: 'rgba(10,6,2,0.92)',
              border: '1px solid rgba(245,158,11,0.3)',
              color: '#e8d8b8',
              fontFamily: 'var(--font-inter), Arial, sans-serif',
              backdropFilter: 'blur(4px)',
              fontSize: 10,
              lineHeight: 1.8,
            }}
          >
            <div
              style={{
                color: '#f59e0b',
                marginBottom: 2,
                fontSize: 9,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
              }}
            >
              #{selectedVertexIndex! + 1} цэг
            </div>
            <div>Урт: {selectedVertex[0].toFixed(4)}°</div>
            <div>Өрг: {selectedVertex[1].toFixed(4)}°</div>
            <div style={{ marginTop: 4, color: '#5c4020', fontSize: 9 }}>
              Чирж байршлыг өөрчил · Delete устгах
            </div>
          </div>
        ) : (
          <div
            className="rounded-lg px-3 py-1.5 text-xs"
            style={{
              background: 'rgba(10,6,2,0.85)',
              border: '1px solid rgba(90,60,20,0.3)',
              color: '#5c4020',
              fontFamily: 'var(--font-inter), Arial, sans-serif',
              backdropFilter: 'blur(4px)',
              fontSize: 9,
              letterSpacing: '0.05em',
            }}
          >
            {props.isCreating
              ? 'Газрын зураг дарж цэг нэм'
              : props.addPointMode
                ? 'Дарж шинэ цэг оруул'
                : 'Цэг дарж сонго · чир'}
          </div>
        )}
      </div>
      {isDraggingVertex && (
        <div
          className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.1)' }}
        >
          <div
            className="rounded-lg px-4 py-2 text-xs"
            style={{
              background: 'rgba(10,6,2,0.92)',
              border: '1px solid rgba(245,158,11,0.4)',
              color: '#f59e0b',
              fontFamily: 'var(--font-inter), Arial, sans-serif',
              fontSize: 11,
            }}
          >
            ⟳ Цэгийн байрлалыг өөрчилж байна…
          </div>
        </div>
      )}
    </>
  );
}

export function renderSelectedBadge(
  collection: GlobeMapProps['collection'],
  selectedSlug: string,
) {
  const feature = collection?.features.find(
    (item) => item.properties.slug === selectedSlug,
  );
  if (!feature) return null;
  const color = feature.properties.color ?? '#c9a45d';
  return (
    <div
      className="pointer-events-none absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-[10px] px-[18px] py-2"
      style={{
        background: 'rgba(10,6,2,0.9)',
        border: `1px solid ${hexToRgba(color, 0.35)}`,
        backdropFilter: 'blur(8px)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.6)',
      }}
    >
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
          boxShadow: `0 0 6px ${hexToRgba(color, 0.7)}`,
        }}
      />
      <span
        style={{
          color: '#f0e0c0',
          fontFamily: 'var(--font-inter), Arial, sans-serif',
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: '0.04em',
        }}
      >
        {feature.properties.name}
      </span>
      {feature.properties.capital && (
        <span
          style={{
            color: '#7a5c2a',
            fontSize: 11,
            fontFamily: 'var(--font-inter), Arial, sans-serif',
          }}
        >
          {feature.properties.capital}
        </span>
      )}
    </div>
  );
}
