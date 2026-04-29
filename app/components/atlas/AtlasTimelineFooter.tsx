"use client";

import TimelineSlider from "@/app/components/TimelineSlider";
import { T } from "./constants";

export function AtlasTimelineFooter({
  year,
  years,
  isAutoPlaying,
  onAutoToggle,
  onYearChange,
}: {
  year: number;
  years: number[];
  isAutoPlaying: boolean;
  onAutoToggle: () => void;
  onYearChange: (year: number) => void;
}) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 px-3 pb-3 sm:px-4 sm:pb-4">
      <div
        className="overflow-hidden rounded-2xl"
        style={{
          background: "rgba(8,5,2,0.94)",
          border: `1px solid ${T.border}`,
          backdropFilter: "blur(20px)",
          boxShadow: "0 -2px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.025)",
        }}
      >
        <div
          className="flex px-3 pb-1 pt-2 text-[7px] uppercase tracking-[0.18em] sm:px-5 sm:pt-2.5 sm:text-[8px] sm:tracking-[0.28em]"
          style={{ borderBottom: `1px solid ${T.border}` }}
        >
          {[
            { label: "Эрт дундад зуун", flex: 2 },
            { label: "Дунд үе", flex: 3 },
            { label: "Өндөр дундад зуун", flex: 2 },
            { label: "Монголын хаант улс", flex: 3 },
          ].map(({ label, flex }, i, arr) => (
            <div
              key={label}
              className="relative text-center"
              style={{
                flex,
                color: T.textMuted,
                fontFamily: "Georgia, serif",
                borderRight: i < arr.length - 1 ? `1px solid ${T.border}` : "none",
                paddingRight: 4,
              }}
            >
              {label}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 px-3 pb-3 pt-2 sm:gap-4 sm:px-5">
          <div className="flex-1">
            <TimelineSlider
              years={years}
              currentYear={year}
              isAutoPlaying={isAutoPlaying}
              onAutoToggle={onAutoToggle}
              onYearChange={onYearChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
