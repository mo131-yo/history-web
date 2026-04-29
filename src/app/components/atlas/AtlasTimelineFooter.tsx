"use client";

import TimelineSlider from "@/app/components/TimelineSlider";

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
    <div className="absolute bottom-0 left-0 right-0 z-30 min-w-0 overflow-hidden px-2 pb-1 sm:px-3 sm:pb-2">
      <div className="flex min-w-0 items-center">
        <div className="min-w-0 flex-1">
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
  );
}
