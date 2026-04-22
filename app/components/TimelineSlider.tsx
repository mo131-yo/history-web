"use client";

interface TimelineSliderProps {
  years: number[];
  currentYear: number;
  onYearChange: (year: number) => void;
}

export default function TimelineSlider({ years, currentYear, onYearChange }: TimelineSliderProps) {
  const currentIndex = Math.max(0, years.findIndex((year) => year === currentYear));

  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-950/70 px-5 py-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Timeline</p>
          <h3 className="mt-2 font-[family:var(--font-cinzel-decorative)] text-2xl text-white">{currentYear} он</h3>
        </div>
        <p className="text-right text-xs text-slate-400">1162-1300</p>
      </div>

      <input
        type="range"
        min={0}
        max={Math.max(years.length - 1, 0)}
        step={1}
        value={currentIndex}
        onChange={(event) => onYearChange(years[Number(event.target.value)] ?? currentYear)}
        className="mt-5 w-full accent-amber-300"
      />

      <div className="mt-4 overflow-x-auto pb-1">
        <div className="flex min-w-max gap-2">
          {years.map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => onYearChange(year)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs transition ${
                year === currentYear
                  ? "bg-amber-300 text-slate-950"
                  : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
