"use client";

import { Compass } from "lucide-react";

type MapLike = {
  rotateTo?: (bearing: number) => void;
  easeTo?: (options: { bearing: number }) => void;
};

type AtlasHeaderProps = {
  bearing?: number;
  mapBearing?: number;
  currentBearing?: number;
  onCompassClick?: () => void;
  onResetNorth?: () => void;
  onResetDirection?: () => void;
  onResetView?: () => void;
  [key: string]: unknown;
};

function resetMapDirectionFallback() {
  const windowWithMaps = window as typeof window & {
    map?: MapLike;
    atlasMap?: MapLike;
    __MONGOL_ATLAS_MAP__?: MapLike;
  };
  const map =
    windowWithMaps.__MONGOL_ATLAS_MAP__ ??
    windowWithMaps.atlasMap ??
    windowWithMaps.map;

  if (map?.easeTo) {
    map.easeTo({ bearing: 0 });
    return;
  }

  if (map?.rotateTo) {
    map.rotateTo(0);
    return;
  }

  const mapboxCompass = document.querySelector<HTMLButtonElement>(
    ".mapboxgl-ctrl-compass",
  );

  if (mapboxCompass) {
    mapboxCompass.click();
    return;
  }

  window.dispatchEvent(new CustomEvent("mongol-atlas:reset-direction"));
}

export function AtlasHeader({
  bearing,
  mapBearing,
  currentBearing,
  onCompassClick,
  onResetNorth,
  onResetDirection,
  onResetView,
}: AtlasHeaderProps) {
  const nextBearing = bearing ?? mapBearing ?? currentBearing ?? 0;
  const normalizedBearing = Number.isFinite(nextBearing) ? nextBearing : 0;

  const handleCompassClick = () => {
    const resetDirection =
      onCompassClick ?? onResetNorth ?? onResetDirection ?? onResetView;

    if (resetDirection) {
      resetDirection();
      return;
    }

    resetMapDirectionFallback();
  };

  return (
    <div className="pointer-events-auto inline-flex w-fit max-w-[calc(100vw-2rem)] items-center gap-3 rounded-xl border border-blue-500/30 bg-white/90 px-3 py-2 shadow-lg shadow-blue-950/10 backdrop-blur-md">
      <button
        type="button"
        onClick={handleCompassClick}
        className="group relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-400/35 bg-blue-50 text-blue-700 shadow-inner shadow-white/70 transition hover:border-blue-500/70 hover:bg-blue-100 hover:text-blue-800"
        aria-label="Зүг чигийг хойд зүг рүү тохируулах"
        title="Зүг чигийг хойд зүг рүү тохируулах"
      >
        <Compass
          size={21}
          strokeWidth={2.2}
          className="transition-transform duration-300 ease-out"
          style={{ transform: `rotate(${-normalizedBearing}deg)` }}
        />
        <span className="pointer-events-none absolute top-1 h-1.5 w-px rounded-full bg-blue-700" />
      </button>

      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-blue-700">
          Монгол Атлас
        </p>
        <p className="mt-0.5 truncate text-[11px] font-medium text-blue-600/85">
          Түүхэн газрын зураг
        </p>
      </div>
    </div>
  );
}

export default AtlasHeader;
