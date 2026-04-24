"use client";

import { Edit3, PlusCircle, RotateCcw, Save, Trash2, WandSparkles, Swords, X, MapPin } from "lucide-react";
import type { AtlasStateFeature } from "@/lib/types";

const BG = "rgba(12,7,2,0.98)";
const BORDER = "#4a3010";
const GOLD = "#c9a45d";
const GOLD_DIM = "#8b6c35";
const TEXT_MAIN = "#f0deb4";
const TEXT_SUB = "#9a7c50";
const TEXT_MUTED = "#5c4020";
const INPUT_BG = "rgba(255,200,100,0.04)";
const SELECTED_BG = "rgba(245,158,11,0.12)";
const SELECTED_BORDER = "rgba(245,158,11,0.45)";
const HOVER_BG = "rgba(201,164,93,0.08)";

const BTN_BASE: React.CSSProperties = {
  fontFamily: "Georgia, serif",
  fontSize: "12px",
  borderRadius: "6px",
  padding: "9px 12px",
  border: `1px solid ${BORDER}`,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  transition: "all 0.15s",
  color: TEXT_MAIN,
  background: INPUT_BG,
};

interface CoordEditorProps {
  year: number;
  feature: AtlasStateFeature | null;
  isEditing: boolean;
  isCreating: boolean;
  addPointMode: boolean;
  draftRing: Array<[number, number]>;
  saveState: "idle" | "saving" | "saved" | "error";
  saveError: string | null;
  form: { periodName: string; name: string; leader: string; capital: string; color: string; summary: string; };
  onFormChange: (field: "periodName" | "name" | "leader" | "capital" | "color" | "summary", value: string) => void;
  onStartCreate: () => void;
  onCancelCreate: () => void;
  onToggleEditing: () => void;
  onToggleAddPoint: () => void;
  onReset: () => void;
  onSave: () => void;
  onDelete: () => void;
  selectedVertexIndex?: number | null;
  onSelectVertex?: (index: number | null) => void;
  onDeleteVertex?: (index: number) => void;
}

const INPUT_STYLE: React.CSSProperties = {
  background: INPUT_BG,
  border: `1px solid ${BORDER}`,
  borderRadius: "6px",
  padding: "7px 10px",
  fontSize: "12px",
  color: TEXT_MAIN,
  fontFamily: "Georgia, serif",
  outline: "none",
  width: "100%",
};

export default function CoordEditor({
  year, feature, isEditing, isCreating, addPointMode,
  draftRing, saveState, saveError, form,
  onFormChange, onStartCreate, onCancelCreate, onToggleEditing,
  onToggleAddPoint, onReset, onSave, onDelete,
  selectedVertexIndex = null,
  onSelectVertex,
  onDeleteVertex,
}: CoordEditorProps) {
  const safeForm = {
    periodName: form.periodName ?? "",
    name: form.name ?? "",
    leader: form.leader ?? "",
    capital: form.capital ?? "",
    color: form.color ?? "#c9a45d",
    summary: form.summary ?? "",
  };
  const hasTarget = Boolean(feature) || isCreating;
  const canSave = hasTarget && draftRing.length >= 4 && saveState !== "saving";
  const canDeleteVertex = selectedVertexIndex !== null && draftRing.length > 4;

  const vertexCount = draftRing.length;
  const isClosedRing =
    draftRing.length > 1 &&
    draftRing[0][0] === draftRing[draftRing.length - 1][0] &&
    draftRing[0][1] === draftRing[draftRing.length - 1][1];
  const displayCount = isClosedRing ? vertexCount - 1 : vertexCount;

  return (
    <aside
      className="flex h-full min-h-105 flex-col rounded-[28px] overflow-hidden"
      style={{
        background: BG,
        border: `1px solid ${BORDER}`,
        boxShadow: `0 0 40px rgba(  0,0,0,0.8), inset 0 0 40px rgba(201,164,93,0.02)`,
        fontFamily: "Georgia, serif",
      }}
    >
      <div className="h-0.5 shrink-0" style={{ background: `linear-gradient(90deg, transparent, ${GOLD_DIM}, transparent)` }} />

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3" style={{ scrollbarWidth: "thin", scrollbarColor: `${BORDER} transparent` }}>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <Swords className="size-3.5" style={{ color: GOLD_DIM }} />
            <p className="text-[8px] uppercase tracking-[0.5em]" style={{ color: TEXT_MUTED }}>Засах самбар</p>
          </div>
          <h3 className="text-base font-bold leading-tight" style={{ color: GOLD }}>
            {isCreating ? `Шинэ нутаг · ${year}` : feature ? `${feature.properties.name} · ${year}` : "Нутаг сонгоно уу"}
          </h3>
          <p className="mt-1 text-[10px] leading-4" style={{ color: TEXT_SUB }}>
            {isCreating
              ? "Газрын зураг дарж нутгийн хилийг тэмдэглэ."
              : "Мэдээлэл болон хилийг засаарай."}
          </p>
        </div>

        <div className="h-px shrink-0" style={{ background: BORDER }} />

        <div className="grid gap-2">
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={isCreating ? onCancelCreate : onStartCreate}
              style={{ ...BTN_BASE, background: isCreating ? `${GOLD}20` : "rgba(139,108,53,0.15)", borderColor: isCreating ? GOLD + "55" : BORDER, color: isCreating ? GOLD : TEXT_MAIN }}>
              <WandSparkles className="size-3.5" />
              {isCreating ? "Цуцлах" : "Шинэ нутаг"}
            </button>
            <button type="button" onClick={onDelete} disabled={!feature || isCreating}
              style={{ ...BTN_BASE, borderColor: "#6b2020", background: "rgba(180,30,30,0.08)", color: "#c06060", opacity: (!feature || isCreating) ? 0.35 : 1, cursor: (!feature || isCreating) ? "not-allowed" : "pointer" }}>
              <Trash2 className="size-3.5" />
              Устгах
            </button>
          </div>

          <button type="button" onClick={onToggleEditing} disabled={!feature || isCreating}
            style={{ ...BTN_BASE, background: isEditing ? "rgba(56,180,220,0.12)" : INPUT_BG, borderColor: isEditing ? "#38bdf855" : BORDER, color: isEditing ? "#7dd3fc" : TEXT_MAIN, opacity: (!feature || isCreating) ? 0.35 : 1, cursor: (!feature || isCreating) ? "not-allowed" : "pointer" }}>
            <Edit3 className="size-3.5" />
            {isEditing ? "Edit mode унтраах" : "Edit mode асаах"}
          </button>

          <button type="button" onClick={onToggleAddPoint} disabled={!feature || !isEditing || isCreating}
            style={{ ...BTN_BASE, background: addPointMode ? `${GOLD}15` : INPUT_BG, borderColor: addPointMode ? GOLD + "44" : BORDER, color: addPointMode ? GOLD : TEXT_MAIN, opacity: (!feature || !isEditing || isCreating) ? 0.35 : 1, cursor: (!feature || !isEditing || isCreating) ? "not-allowed" : "pointer" }}>
            <PlusCircle className="size-3.5" />
            {addPointMode ? "Add point идэвхтэй" : "Шинэ цэг нэмэх"}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={onReset} disabled={!hasTarget}
              style={{ ...BTN_BASE, opacity: !hasTarget ? 0.35 : 1, cursor: !hasTarget ? "not-allowed" : "pointer" }}>
              <RotateCcw className="size-3.5" />
              Буцаах
            </button>
            <button type="button" onClick={onSave} disabled={!canSave}
              style={{ ...BTN_BASE, background: canSave ? `linear-gradient(135deg, rgba(100,180,80,0.20), rgba(80,160,60,0.12))` : INPUT_BG, borderColor: canSave ? "#4a9040" : BORDER, color: canSave ? "#88c878" : TEXT_MUTED, opacity: !canSave ? 0.4 : 1, cursor: !canSave ? "not-allowed" : "pointer" }}>
              <Save className="size-3.5" />
              {saveState === "saving" ? "Хадгалж…" : saveState === "saved" ? "✓ Хадгалагдлаа" : isCreating ? "Үүсгэх" : "Хадгалах"}
            </button>
          </div>

          {saveState === "error" && saveError && (
            <div className="rounded px-3 py-2 text-[10px]" style={{ border: "1px solid #6b2020", background: "rgba(180,30,30,0.08)", color: "#c06060" }}>
              ⚠ {saveError}
            </div>
          )}
          {saveState === "saved" && (
            <div className="rounded px-3 py-2 text-[10px]" style={{ border: "1px solid #2a5c1a", background: "rgba(60,140,40,0.08)", color: "#88c878" }}>
              ✓ DB-д амжилттай хадгалагдлаа
            </div>
          )}
        </div>

        <div className="h-px shrink-0" style={{ background: BORDER }} />

        <div className="grid gap-2">
          <p className="text-[8px] uppercase tracking-[0.4em]" style={{ color: TEXT_MUTED }}>Нутгийн мэдээлэл</p>
          {[
            { field: "name" as const, placeholder: "Улсын нэр (2+ тэмдэгт)" },
            { field: "periodName" as const, placeholder: "Тухайн үеийн нэр" },
            { field: "leader" as const, placeholder: "Удирдагч" },
            { field: "capital" as const, placeholder: "Нийслэл" },
          ].map(({ field, placeholder }) => (
            <input
              key={field}
              value={safeForm[field]}
              onChange={(e) => onFormChange(field, e.target.value)}
              placeholder={placeholder}
              style={{ ...INPUT_STYLE }}
            />
          ))}
          <div className="grid grid-cols-[1fr_80px] gap-2">
            <textarea
              value={safeForm.summary}
              onChange={(e) => onFormChange("summary", e.target.value)}
              placeholder="Товч тайлбар (8+ тэмдэгт)"
              rows={3}
              style={{ ...INPUT_STYLE, resize: "none" }}
            />
            <div className="flex flex-col gap-2">
              <input
                value={safeForm.color}
                onChange={(e) => onFormChange("color", e.target.value)}
                placeholder="#c9a45d"
                style={{ ...INPUT_STYLE }}
              />
              <input
                type="color"
                value={safeForm.color}
                onChange={(e) => onFormChange("color", e.target.value)}
                className="w-full cursor-pointer rounded"
                style={{ height: "36px", border: `1px solid ${BORDER}`, background: INPUT_BG, padding: "2px" }}
              />
            </div>
          </div>
        </div>

        <div className="h-px shrink-0" style={{ background: BORDER }} />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="size-3" style={{ color: GOLD_DIM }} />
              <p className="text-[8px] uppercase tracking-[0.4em]" style={{ color: TEXT_MUTED }}>
                Координатууд
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-[9px] px-2 py-0.5 rounded-full"
                style={{
                  background: displayCount > 0 ? `${GOLD}20` : "transparent",
                  border: `1px solid ${displayCount > 0 ? GOLD + "40" : BORDER}`,
                  color: displayCount > 0 ? GOLD : TEXT_MUTED,
                  fontFamily: "Georgia, serif",
                }}
              >
                {displayCount} орой
              </span>
              {canDeleteVertex && onDeleteVertex && (
                <button
                  type="button"
                  onClick={() => {
                    if (selectedVertexIndex !== null) onDeleteVertex(selectedVertexIndex);
                  }}
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
            <p className="text-[9px] leading-4" style={{ color: TEXT_MUTED }}>
              Цэг дарж сонго · чирж байршуулна · Delete товч устгана
            </p>
          )}

          <div
            className="rounded-lg overflow-y-auto"
            style={{
              maxHeight: "200px",
              border: `1px solid ${BORDER}`,
              background: "rgba(0,0,0,0.2)",
              scrollbarWidth: "thin",
              scrollbarColor: `${BORDER} transparent`,
            }}
          >
            {draftRing.length === 0 ? (
              <div className="px-3 py-4 text-center text-[10px]" style={{ color: TEXT_MUTED }}>
                Нутаг сонгоход гарна.
              </div>
            ) : (
              <div className="p-1.5 flex flex-col gap-0.5">
                {draftRing.map(([lng, lat], i) => {
                  const isClosing = i === draftRing.length - 1 && isClosedRing;
                  if (isClosing) return null;
                  const isSelected = i === selectedVertexIndex;
                  return (
                    <button
                      key={`${i}-${lng}-${lat}`}
                      type="button"
                      onClick={() => onSelectVertex?.(isSelected ? null : i)}
                      className="flex items-center gap-2 w-full text-left rounded px-2 py-1.5 transition-all"
                      style={{
                        background: isSelected ? SELECTED_BG : "transparent",
                        border: `1px solid ${isSelected ? SELECTED_BORDER : "transparent"}`,
                        cursor: "pointer",
                        outline: "none",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) (e.currentTarget as HTMLElement).style.background = HOVER_BG;
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) (e.currentTarget as HTMLElement).style.background = "transparent";
                      }}
                    >
                      <span
                        className="text-[9px] shrink-0 rounded px-1.5 py-0.5 tabular-nums"
                        style={{
                          background: isSelected ? `${GOLD}25` : "rgba(201,164,93,0.08)",
                          color: isSelected ? GOLD : TEXT_MUTED,
                          minWidth: "28px",
                          textAlign: "center",
                          fontFamily: "Georgia, serif",
                        }}
                      >
                        {i + 1}
                      </span>

                      <span
                        className="text-[10px] tabular-nums flex-1"
                        style={{ color: isSelected ? TEXT_MAIN : TEXT_SUB, fontFamily: "Georgia, serif" }}
                      >
                        {lng.toFixed(3)}°, {lat.toFixed(3)}°
                      </span>

                      {isSelected && (
                        <span style={{ color: GOLD, fontSize: 8 }}>◆</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-0.5 shrink-0" style={{ background: `linear-gradient(90deg, transparent, ${GOLD_DIM}55, transparent)` }} />
    </aside>
  );
}