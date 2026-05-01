"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import { Pause, Play, Search } from "lucide-react";

type TimelineSliderProps = {
  years: number[];
  currentYear: number;
  onYearChange: (year: number) => void;
  isAutoPlaying?: boolean;
  onAutoToggle?: () => void;
};

const AUTOPLAY_DELAY_MS = 1800;

export default function TimelineSlider({
  years,
  currentYear,
  isAutoPlaying,
  onAutoToggle,
  onYearChange,
}: TimelineSliderProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const activeYearRef = useRef<HTMLButtonElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const pendingYearRef = useRef<number | null>(null);
  const [yearQuery, setYearQuery] = useState(String(currentYear));
  const [localAutoPlaying, setLocalAutoPlaying] = useState(false);
  const autoPlaying = isAutoPlaying ?? localAutoPlaying;

  const { safeYears, currentIndex, maxIndex, progress, startYear, endYear } =
    useMemo(() => {
      const nextYears = years.length > 0 ? years : [currentYear];
      const foundIndex = nextYears.findIndex((year) => year === currentYear);
      const safeIndex = foundIndex >= 0 ? foundIndex : 0;
      const lastIndex = Math.max(nextYears.length - 1, 0);
      const percent = lastIndex > 0 ? (safeIndex / lastIndex) * 100 : 0;

      return {
        safeYears: nextYears,
        currentIndex: safeIndex,
        maxIndex: lastIndex,
        progress: percent,
        startYear: nextYears[0],
        endYear: nextYears[nextYears.length - 1],
      };
    }, [currentYear, years]);

  useEffect(() => {
    activeYearRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [currentYear, years.length]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setYearQuery(String(currentYear));
  }, [currentYear]);

  useEffect(() => {
    if (!autoPlaying || safeYears.length <= 1) return;

    const intervalId = window.setInterval(() => {
      const nextIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
      onYearChange(safeYears[nextIndex] ?? currentYear);
    }, AUTOPLAY_DELAY_MS);

    return () => window.clearInterval(intervalId);
  }, [autoPlaying, currentIndex, currentYear, maxIndex, onYearChange, safeYears]);

  const commitYearChange = useCallback(
    (nextYear: number) => {
      if (nextYear === currentYear) {
        pendingYearRef.current = null;
        if (animationFrameRef.current !== null) {
          window.cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        return;
      }

      pendingYearRef.current = nextYear;

      if (animationFrameRef.current !== null) return;

      animationFrameRef.current = window.requestAnimationFrame(() => {
        animationFrameRef.current = null;
        const pendingYear = pendingYearRef.current;
        pendingYearRef.current = null;

        if (pendingYear !== null) {
          onYearChange(pendingYear);
        }
      });
    },
    [currentYear, onYearChange],
  );

  const handleRangeChange = (value: string) => {
    const nextIndex = Math.min(Math.max(Number(value), 0), maxIndex);
    commitYearChange(safeYears[nextIndex] ?? currentYear);
  };

  const handleYearSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const requestedYear = Number.parseInt(yearQuery, 10);
    if (!Number.isFinite(requestedYear)) {
      setYearQuery(String(currentYear));
      return;
    }

    const exactYear = safeYears.find((year) => year === requestedYear);
    const nearestYear =
      exactYear ??
      safeYears.reduce((closest, year) => {
        return Math.abs(year - requestedYear) < Math.abs(closest - requestedYear)
          ? year
          : closest;
      }, safeYears[0] ?? currentYear);

    onYearChange(nearestYear);
    setYearQuery(String(nearestYear));
  };

  const handleAutoToggle = () => {
    if (isAutoPlaying === undefined) {
      setLocalAutoPlaying((playing) => !playing);
    }

    if (onAutoToggle) {
      onAutoToggle();
    }
  };

  const sliderStyle = {
    "--timeline-progress": `${progress}%`,
  } as CSSProperties;

  const markerStyle = {
    left: `${progress}%`,
  } as CSSProperties;

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-xl border border-blue-500/30 bg-white/90 px-3 py-2.5 shadow-[0_-10px_34px_rgba(30,64,175,0.16)] backdrop-blur-xl sm:px-4">
      <div className="flex items-center justify-between gap-3">
        <div className="shrink-0">
          <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-blue-700">
            Timeline
          </p>
          <h3
            className="mt-0.5 text-lg font-semibold text-slate-800"
            style={{ fontFamily: "var(--font-inter), Arial, sans-serif" }}
          >
            {currentYear} он
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <form
            onSubmit={handleYearSearch}
            className="hidden h-8 items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-50/80 px-2.5 sm:flex"
          >
            <input
              type="number"
              inputMode="numeric"
              min={startYear}
              max={endYear}
              value={yearQuery}
              onChange={(event) => setYearQuery(event.target.value)}
              className="h-6 w-16 bg-transparent text-xs font-semibold tabular-nums text-slate-800 outline-none placeholder:text-blue-400"
              style={{ fontFamily: "var(--font-inter), Arial, sans-serif" }}
              placeholder="Он хайх"
              aria-label="Оноор хайх"
              list="timeline-years"
            />
            <button
              type="submit"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-blue-700 transition hover:bg-blue-200/60"
              aria-label="Оноор хайх"
              title="Оноор хайх"
            >
              <Search size={12} />
            </button>
            <datalist id="timeline-years">
              {safeYears.map((year) => (
                <option key={year} value={year} />
              ))}
            </datalist>
          </form>

          <button
            type="button"
            onClick={handleAutoToggle}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition ${
              autoPlaying
                ? "border-blue-500 bg-blue-600 text-white shadow-[0_0_22px_rgba(37,99,235,0.35)]"
                : "border-blue-500/30 bg-blue-50/80 text-blue-700 hover:border-blue-500/70 hover:bg-blue-100"
            }`}
            title={autoPlaying ? "Автоматаар тоглуулахыг зогсоох" : "Автоматаар тоглуулах"}
            aria-label={autoPlaying ? "Автоматаар тоглуулахыг зогсоох" : "Автоматаар тоглуулах"}
          >
            {autoPlaying ? (
              <Pause size={14} fill="currentColor" />
            ) : (
              <Play size={14} fill="currentColor" />
            )}
          </button>

          <div className="rounded-lg border border-blue-500/30 bg-blue-50/90 px-2.5 py-1 text-right shadow-inner shadow-white/70">
            <p className="text-[7px] font-bold uppercase tracking-[0.18em] text-blue-700">
              Одоогийн
            </p>
            <p className="text-xs font-semibold text-slate-800">
              {currentIndex + 1}/{safeYears.length}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-2 grid gap-1.5">
        <form
          onSubmit={handleYearSearch}
          className="flex h-8 items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-50/80 px-3 sm:hidden"
        >
          <input
            type="number"
            inputMode="numeric"
            min={startYear}
            max={endYear}
            value={yearQuery}
            onChange={(event) => setYearQuery(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-xs font-semibold tabular-nums text-slate-800 outline-none placeholder:text-blue-400"
            style={{ fontFamily: "var(--font-inter), Arial, sans-serif" }}
            placeholder="Он хайх"
            aria-label="Оноор хайх"
            list="timeline-years-mobile"
          />
          <button
            type="submit"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-blue-700 transition hover:bg-blue-200/60"
            aria-label="Оноор хайх"
            title="Оноор хайх"
          >
            <Search size={12} />
          </button>
          <datalist id="timeline-years-mobile">
            {safeYears.map((year) => (
              <option key={year} value={year} />
            ))}
          </datalist>
        </form>

        <div className="flex items-center justify-between text-[10px] font-medium text-slate-500">
          <span>Эхлэл {startYear}</span>
          <span className="rounded-full bg-blue-600 px-2 py-0.5 font-semibold text-white shadow-[0_0_14px_rgba(37,99,235,0.32)]">
            {currentYear}
          </span>
          <span>Төгсгөл {endYear}</span>
        </div>

        <div className="relative">
          <input
            type="range"
            min={0}
            max={maxIndex}
            step={1}
            value={currentIndex}
            onChange={(event) => handleRangeChange(event.target.value)}
            className="timeline-range w-full"
            style={sliderStyle}
            aria-label="Timeline year selector"
          />
          <div
            className="pointer-events-none absolute top-1/2 h-7 w-px -translate-y-1/2 bg-blue-700/75 shadow-[0_0_14px_rgba(37,99,235,0.65)] transition-[left] duration-150 ease-out"
            style={markerStyle}
          />
        </div>
      </div>

      <div className="relative mt-1.5 min-w-0">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-linear-to-r from-white/95 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-linear-to-l from-white/95 to-transparent" />

        <div
          ref={scrollRef}
          className="timeline-years-scroll w-full min-w-0 overflow-x-auto overflow-y-hidden overscroll-x-contain"
        >
          <div className="flex w-max max-w-none gap-1.5 px-1">
            {safeYears.map((year) => {
              const active = year === currentYear;

              return (
                <button
                  key={year}
                  ref={active ? activeYearRef : null}
                  type="button"
                  onClick={() => commitYearChange(year)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs transition ${
                    active
                      ? "bg-blue-600 text-white shadow-[0_0_18px_rgba(37,99,235,0.32)]"
                      : "border border-blue-500/25 bg-blue-50/70 text-slate-700 hover:border-blue-500/60 hover:bg-blue-100 hover:text-blue-800"
                  }`}
                >
                  {year}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .timeline-range {
          height: 8px;
          appearance: none;
          border-radius: 999px;
          background: linear-gradient(
            to right,
            #2563eb 0%,
            #2563eb var(--timeline-progress),
            rgba(37, 99, 235, 0.16) var(--timeline-progress),
            rgba(37, 99, 235, 0.16) 100%
          );
          outline: none;
        }

        .timeline-range::-webkit-slider-thumb {
          height: 16px;
          width: 16px;
          appearance: none;
          border: 2px solid #ffffff;
          border-radius: 999px;
          background: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.16);
          cursor: pointer;
        }

        .timeline-range::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border: 2px solid #ffffff;
          border-radius: 999px;
          background: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.16);
          cursor: pointer;
        }

        .timeline-years-scroll {
          scrollbar-color: rgba(37, 99, 235, 0.42) rgba(37, 99, 235, 0.08);
        }

        .timeline-years-scroll::-webkit-scrollbar {
          height: 8px;
        }

        .timeline-years-scroll::-webkit-scrollbar-track {
          border-radius: 999px;
          background: rgba(37, 99, 235, 0.08);
        }

        .timeline-years-scroll::-webkit-scrollbar-thumb {
          border-radius: 999px;
          background: rgba(37, 99, 235, 0.42);
        }
      `}</style>
    </div>
  );
}
