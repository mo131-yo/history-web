"use client";

import TimelineSlider from "@/app/components/TimelineSlider";
import { T } from "./constants";

export function AtlasTimelineFooter({
  year,
  years,
  onYearChange,
}: {
  year: number;
  years: number[];
  onYearChange: (year: number) => void;
}) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 px-4 pb-4">
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
          className="flex px-5 pb-1 pt-2.5 text-[8px] uppercase tracking-[0.28em]"
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

        <div className="flex items-center gap-4 px-5 pb-3 pt-2">
          <div
            className="flex shrink-0 flex-col items-center justify-center rounded-lg px-3 py-1.5 tabular-nums"
            style={{
              background: "linear-gradient(135deg, rgba(201,164,93,0.14), rgba(139,108,53,0.06))",
              border: "1px solid rgba(201,164,93,0.3)",
              minWidth: 64,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            <span
              style={{
                color: T.amberBright,
                fontSize: 18,
                fontWeight: 700,
                fontFamily: "Georgia, serif",
                lineHeight: 1.1,
                letterSpacing: "0.02em",
              }}
            >
              {year}
            </span>
            <span
              style={{
                color: T.textMuted,
                fontSize: 8,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                fontFamily: "Georgia, serif",
              }}
            >
              он
            </span>
          </div>

          <div className="flex-1">
            <TimelineSlider years={years} currentYear={year} onYearChange={onYearChange} />
          </div>
        </div>
      </div>
    </div>
  );
}
