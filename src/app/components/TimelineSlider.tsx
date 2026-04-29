"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { Pause, Play, Search } from "lucide-react";

type TimelineSliderProps = {
  years: number[];
  currentYear: number;
  onYearChange: (year: number) => void;
  isAutoPlaying?: boolean;
  onAutoToggle?: () => void;
};

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

  const commitYearChange = useCallback((nextYear: number) => {
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
  }, [currentYear, onYearChange]);

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

  const sliderStyle = {
    "--timeline-progress": `${progress}%`,
  } as CSSProperties;

  const markerStyle = {
    left: `${progress}%`,
  } as CSSProperties;

  return (
    <div className="rounded-xl border border-amber-500/15 bg-slate-950/88 px-3 py-2 shadow-[0_-8px_28px_rgba(0,0,0,0.36)] backdrop-blur-xl sm:px-4">
      <div className="flex items-center justify-between gap-3">
        <div className="shrink-0">
          <p className="text-[8px] uppercase tracking-[0.22em] text-stone-500">
            Timeline
          </p>
          <h3
            className="mt-0.5 text-lg text-stone-200"
            style={{ fontFamily: "var(--font-inter), Arial, sans-serif" }}
          >
            {currentYear} он
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <form
            onSubmit={handleYearSearch}
            className="hidden h-8 items-center gap-1.5 rounded-full border border-amber-500/20 bg-stone-900/70 px-2.5 sm:flex"
          >
            <input
              type="number"
              inputMode="numeric"
              min={startYear}
              max={endYear}
              value={yearQuery}
              onChange={(event: { target: { value: string } }) => setYearQuery(event.target.value)}
              className="h-6 w-16 bg-transparent text-xs font-semibold tabular-nums text-stone-100 outline-none placeholder:text-stone-500"
              style={{ fontFamily: "var(--font-inter), Arial, sans-serif" }}
              placeholder="Он хайх"
              aria-label="Оноор хайх"
              list="timeline-years"
            />
            <button
              type="submit"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-amber-200 transition hover:bg-amber-500/15"
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
            onClick={onAutoToggle}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition ${
              isAutoPlaying
                ? "border-amber-300 bg-amber-400 text-slate-950 shadow-[0_0_24px_rgba(245,158,11,0.55)]"
                : "border-amber-500/25 bg-stone-900/70 text-amber-200 hover:border-amber-400/70 hover:bg-amber-500/15"
            }`}
            title={isAutoPlaying ? "Auto зогсоох" : "Auto тоглуулах"}
            aria-label={isAutoPlaying ? "Auto зогсоох" : "Auto тоглуулах"}
          >
            {isAutoPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
          </button>

          <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-right">
            <p className="text-[7px] uppercase tracking-[0.18em] text-amber-500">
              Одоогийн
            </p>
            <p className="text-xs font-semibold text-stone-200">
              {currentIndex + 1}/{safeYears.length}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-2 grid gap-1.5">
        <form
          onSubmit={handleYearSearch}
          className="flex h-8 items-center gap-2 rounded-full border border-amber-500/20 bg-stone-900/70 px-3 sm:hidden"
        >
          <input
            type="number"
            inputMode="numeric"
            min={startYear}
            max={endYear}
            value={yearQuery}
            onChange={(event: { target: { value: string } }) => setYearQuery(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-xs font-semibold tabular-nums text-stone-100 outline-none placeholder:text-stone-500"
            style={{ fontFamily: "var(--font-inter), Arial, sans-serif" }}
            placeholder="Он хайх"
            aria-label="Оноор хайх"
            list="timeline-years-mobile"
          />
          <button
            type="submit"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-amber-200 transition hover:bg-amber-500/15"
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

        <div className="flex items-center justify-between text-[10px] text-stone-400">
          <span>Эхлэл {startYear}</span>
          <span className="rounded-full bg-amber-500 px-2 py-0.5 font-semibold text-slate-950 shadow-[0_0_14px_rgba(245,158,11,0.42)]">
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
            onChange={(event: { target: { value: string; }; }) => handleRangeChange(event.target.value)}
            className="timeline-range w-full"
            style={sliderStyle}
            aria-label="Timeline year selector"
          />
          <div
            className="pointer-events-none absolute top-1/2 h-7 w-px -translate-y-1/2 bg-stone-200/70 shadow-[0_0_14px_rgba(245,158,11,0.8)] transition-[left] duration-150 ease-out"
            style={markerStyle}
          />
        </div>
      </div>

      <div className="relative mt-1.5">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-linear-to-r from-slate-950/95 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-linear-to-l from-slate-950/95 to-transparent" />

        <div ref={scrollRef} className="timeline-years-scroll overflow-x-auto">
          <div className="flex min-w-max gap-1.5 px-1">
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
                      ? "bg-amber-500 text-slate-950 shadow-[0_0_18px_rgba(245,158,11,0.45)]"
                      : "border border-stone-700/60 bg-stone-900/45 text-stone-300 hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-200"
                  }`}
                >
                  {year}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
