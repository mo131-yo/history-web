"use client";

import { MapPin, X } from "lucide-react";
import { BTN_BASE } from "./coordEditorConfig";
import { editorTheme } from "./editorStyles";

export function CoordEditorVertices({
  draftRing,
  isClosedRing,
  displayCount,
  isEditing,
  selectedVertexIndex,
  onSelectVertex,
  onDeleteVertex,
}: {
  draftRing: Array<[number, number]>;
  isClosedRing: boolean;
  displayCount: number;
  isEditing: boolean;
  selectedVertexIndex: number | null;
  onSelectVertex?: (index: number | null) => void;
  onDeleteVertex?: (index: number) => void;
}) {
  const canDeleteVertex = selectedVertexIndex !== null && draftRing.length > 4;

  return (
    <>
      <div className="h-px shrink-0" style={{ background: editorTheme.BORDER }} />
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="size-3" style={{ color: editorTheme.GOLD_DIM }} />
            <p className="text-[8px] uppercase tracking-[0.4em]" style={{ color: editorTheme.TEXT_MUTED }}>
              Координатууд
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="rounded-full px-2 py-0.5 text-[9px]"
              style={{
                background: displayCount > 0 ? `${editorTheme.GOLD}20` : "transparent",
                border: `1px solid ${displayCount > 0 ? `${editorTheme.GOLD}40` : editorTheme.BORDER}`,
                color: displayCount > 0 ? editorTheme.GOLD : editorTheme.TEXT_MUTED,
                fontFamily: "Georgia, serif",
              }}
            >
              {displayCount} орой
            </span>
            {canDeleteVertex && onDeleteVertex && (
              <button
                type="button"
                onClick={() => selectedVertexIndex !== null && onDeleteVertex(selectedVertexIndex)}
                title="Сонгосон цэгийг устгах (Delete)"
                style={{
                  ...BTN_BASE,
                  padding: "3px 8px",
                  fontSize: "9px",
                  borderColor: "#6b2020",
                  background: "rgba(180,30,30,0.1)",
                  color: "#c06060",
                  gap: "4px",
                }}
              >
                <X className="size-2.5" />
                #{selectedVertexIndex! + 1} устгах
              </button>
            )}
          </div>
        </div>

        {isEditing && (
          <p className="text-[9px] leading-4" style={{ color: editorTheme.TEXT_MUTED }}>
            Цэг дарж сонго · чирж байршуулна · Delete товч устгана
          </p>
        )}

        <div
          className="overflow-y-auto rounded-lg"
          style={{
            maxHeight: "200px",
            border: `1px solid ${editorTheme.BORDER}`,
            background: "rgba(0,0,0,0.2)",
            scrollbarWidth: "thin",
            scrollbarColor: `${editorTheme.BORDER} transparent`,
          }}
        >
          {draftRing.length === 0 ? (
            <div className="px-3 py-4 text-center text-[10px]" style={{ color: editorTheme.TEXT_MUTED }}>
              Нутаг сонгоход гарна.
            </div>
          ) : (
            <div className="flex flex-col gap-0.5 p-1.5">
              {draftRing.map(([lng, lat], i) => {
                const isClosing = i === draftRing.length - 1 && isClosedRing;
                if (isClosing) return null;
                const isSelected = i === selectedVertexIndex;
                return (
                  <button
                    key={`${i}-${lng}-${lat}`}
                    type="button"
                    onClick={() => onSelectVertex?.(isSelected ? null : i)}
                    className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left transition-all"
                    style={{
                      background: isSelected ? editorTheme.SELECTED_BG : "transparent",
                      border: `1px solid ${isSelected ? editorTheme.SELECTED_BORDER : "transparent"}`,
                      cursor: "pointer",
                      outline: "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) (e.currentTarget as HTMLElement).style.background = editorTheme.HOVER_BG;
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    <span
                      className="shrink-0 rounded px-1.5 py-0.5 text-[9px] tabular-nums"
                      style={{
                        background: isSelected ? `${editorTheme.GOLD}25` : "rgba(201,164,93,0.08)",
                        color: isSelected ? editorTheme.GOLD : editorTheme.TEXT_MUTED,
                        minWidth: "28px",
                        textAlign: "center",
                        fontFamily: "Georgia, serif",
                      }}
                    >
                      {i + 1}
                    </span>
                    <span
                      className="flex-1 text-[10px] tabular-nums"
                      style={{ color: isSelected ? editorTheme.TEXT_MAIN : editorTheme.TEXT_SUB, fontFamily: "Georgia, serif" }}
                    >
                      {lng.toFixed(3)}°, {lat.toFixed(3)}°
                    </span>
                    {isSelected && <span style={{ color: editorTheme.GOLD, fontSize: 8 }}>◆</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
