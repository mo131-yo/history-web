"use client";

import { Swords } from "lucide-react";
import { CoordEditorActions } from "./CoordEditorActions";
import { editorTheme } from "./editorStyles";
import type { SaveState } from "./types";

const { BORDER, GOLD, TEXT_MUTED } = editorTheme;

export function CoordEditorHeader({
  year,
  title,
  subtitle,
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
  year: number;
  title: string;
  subtitle: string;
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
      <div>
        <div className="mb-1 flex items-center gap-2">
          <Swords className="size-3.5" style={{ color: editorTheme.GOLD_DIM }} />
          <p className="text-[8px] uppercase tracking-[0.5em]" style={{ color: TEXT_MUTED }}>
            Засах самбар
          </p>
        </div>
        <h3 className="text-base font-bold leading-tight" style={{ color: GOLD }}>
          {title || `Шинэ нутаг · ${year}`}
        </h3>
        <p className="mt-1 text-[10px] leading-4" style={{ color: editorTheme.TEXT_SUB }}>
          {subtitle}
        </p>
      </div>

      <div className="h-px shrink-0" style={{ background: BORDER }} />
      <CoordEditorActions
        isCreating={isCreating}
        isEditing={isEditing}
        saveState={saveState}
        hasFeature={hasFeature}
        canSave={canSave}
        addPointMode={addPointMode}
        hasTarget={hasTarget}
        saveError={saveError}
        onStartCreate={onStartCreate}
        onCancelCreate={onCancelCreate}
        onDelete={onDelete}
        onToggleEditing={onToggleEditing}
        onToggleAddPoint={onToggleAddPoint}
        onReset={onReset}
        onSave={onSave}
      />
    </>
  );
}
