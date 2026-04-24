"use client";

import { Edit3, PlusCircle, RotateCcw, Save, Trash2, WandSparkles } from "lucide-react";
import { BTN_BASE } from "./coordEditorConfig";
import { editorTheme } from "./editorStyles";
import type { SaveState } from "./types";

const { BORDER, GOLD, INPUT_BG, TEXT_MAIN, TEXT_MUTED } = editorTheme;

export function CoordEditorActions({
  isCreating,
  isEditing,
  saveState,
  hasFeature,
  canSave,
  addPointMode,
  hasTarget,
  saveError,
  onStartCreate,
  onCancelCreate,
  onDelete,
  onToggleEditing,
  onToggleAddPoint,
  onReset,
  onSave,
}: {
  isCreating: boolean;
  isEditing: boolean;
  saveState: SaveState;
  hasFeature: boolean;
  canSave: boolean;
  addPointMode: boolean;
  hasTarget: boolean;
  saveError: string | null;
  onStartCreate: () => void;
  onCancelCreate: () => void;
  onDelete: () => void;
  onToggleEditing: () => void;
  onToggleAddPoint: () => void;
  onReset: () => void;
  onSave: () => void;
}) {
  return (
    <>
      <div className="grid gap-2">
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={isCreating ? onCancelCreate : onStartCreate} style={{ ...BTN_BASE, background: isCreating ? `${GOLD}20` : "rgba(139,108,53,0.15)", borderColor: isCreating ? `${GOLD}55` : BORDER, color: isCreating ? GOLD : TEXT_MAIN }}>
            <WandSparkles className="size-3.5" />
            {isCreating ? "Цуцлах" : "Шинэ нутаг"}
          </button>
          <button type="button" onClick={onDelete} disabled={!hasFeature || isCreating} style={{ ...BTN_BASE, borderColor: "#6b2020", background: "rgba(180,30,30,0.08)", color: "#c06060", opacity: !hasFeature || isCreating ? 0.35 : 1, cursor: !hasFeature || isCreating ? "not-allowed" : "pointer" }}>
            <Trash2 className="size-3.5" />
            Устгах
          </button>
        </div>

        <button type="button" onClick={onToggleEditing} disabled={!hasFeature || isCreating} style={{ ...BTN_BASE, background: isEditing ? "rgba(56,180,220,0.12)" : INPUT_BG, borderColor: isEditing ? "#38bdf855" : BORDER, color: isEditing ? "#7dd3fc" : TEXT_MAIN, opacity: !hasFeature || isCreating ? 0.35 : 1, cursor: !hasFeature || isCreating ? "not-allowed" : "pointer" }}>
          <Edit3 className="size-3.5" />
          {isEditing ? "Edit mode унтраах" : "Edit mode асаах"}
        </button>

        <button type="button" onClick={onToggleAddPoint} disabled={!hasFeature || !isEditing || isCreating} style={{ ...BTN_BASE, background: addPointMode ? `${GOLD}15` : INPUT_BG, borderColor: addPointMode ? `${GOLD}44` : BORDER, color: addPointMode ? GOLD : TEXT_MAIN, opacity: !hasFeature || !isEditing || isCreating ? 0.35 : 1, cursor: !hasFeature || !isEditing || isCreating ? "not-allowed" : "pointer" }}>
          <PlusCircle className="size-3.5" />
          {addPointMode ? "Add point идэвхтэй" : "Шинэ цэг нэмэх"}
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={onReset} disabled={!hasTarget} style={{ ...BTN_BASE, opacity: !hasTarget ? 0.35 : 1, cursor: !hasTarget ? "not-allowed" : "pointer" }}>
            <RotateCcw className="size-3.5" />
            Буцаах
          </button>
          <button type="button" onClick={onSave} disabled={!canSave} style={{ ...BTN_BASE, background: canSave ? "linear-gradient(135deg, rgba(100,180,80,0.20), rgba(80,160,60,0.12))" : INPUT_BG, borderColor: canSave ? "#4a9040" : BORDER, color: canSave ? "#88c878" : TEXT_MUTED, opacity: !canSave ? 0.4 : 1, cursor: !canSave ? "not-allowed" : "pointer" }}>
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
    </>
  );
}
