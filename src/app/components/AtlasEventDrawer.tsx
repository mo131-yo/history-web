"use client";

import { X } from "lucide-react";
import type { AtlasEventFeature } from "@/lib/types";

export function AtlasEventDrawer({
  event,
  onClose,
}: {
  event: AtlasEventFeature | null;
  onClose: () => void;
}) {
  if (!event) return null;

  const { title, startYear, endYear, description, relatedStates, eventType, icon } =
    event.properties;
  const yearRange =
    startYear === endYear ? `${startYear}` : `${startYear} - ${endYear}`;

  return (
    <div className="pointer-events-none absolute inset-y-0 left-0 z-20 flex items-start p-4 md:p-5">
      <div
        className="pointer-events-auto mt-30 w-full max-w-sm rounded-2xl border px-4 py-4 shadow-2xl"
        style={{
          background: "rgba(8, 6, 2, 0.92)",
          borderColor: "rgba(224, 168, 66, 0.24)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-[#a88a52]">
              {icon} {eventType}
            </p>
            <h3 className="mt-1 text-lg font-semibold text-[#f5e1b1]">
              {title}
            </h3>
            <p className="mt-1 text-xs text-[#cfb274]">{yearRange}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border p-1.5 text-[#9e8453] transition hover:text-[#f5e1b1]"
            style={{ borderColor: "rgba(201,164,93,0.18)" }}
          >
            <X className="size-4" />
          </button>
        </div>

        <p className="text-sm leading-6 text-[#e8dcc1]">{description}</p>

        <div className="mt-4">
          <p className="text-[10px] uppercase tracking-[0.32em] text-[#8d7549]">
            Related states
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(relatedStates.length > 0 ? relatedStates : ["None"]).map((item) => (
              <span
                key={item}
                className="rounded-full border px-2.5 py-1 text-[11px] text-[#e7cf99]"
                style={{ borderColor: "rgba(201,164,93,0.18)" }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
