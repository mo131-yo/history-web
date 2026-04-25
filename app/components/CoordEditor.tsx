"use client";

import type { CoordEditorProps } from "./atlas/types";
import { CoordEditorFields } from "./atlas/CoordEditorFields";
import { CoordEditorHeader } from "./atlas/CoordEditorHeader";
import { CoordEditorVertices } from "./atlas/CoordEditorVertices";
import { buildFormFromFeature } from "./atlas/form";
import { editorTheme } from "./atlas/editorStyles";

export default function CoordEditor(props: CoordEditorProps) {
  const {
    year,
    feature,
    isEditing,
    isCreating,
    addPointMode,
    draftRing,
    saveState,
    saveError,
    form,
    onFormChange,
    onStartCreate,
    onCancelCreate,
    onToggleEditing,
    onToggleAddPoint,
    onReset,
    onSave,
    onDelete,
    selectedVertexIndex = null,
    onSelectVertex,
    onDeleteVertex,
  } = props;

  const safeForm = { ...buildFormFromFeature(null), ...form };
  const hasTarget = Boolean(feature) || isCreating;
  const canSave = hasTarget && draftRing.length >= 4 && saveState !== "saving";
  const isClosedRing =
    draftRing.length > 1 &&
    draftRing[0][0] === draftRing[draftRing.length - 1]?.[0] &&
    draftRing[0][1] === draftRing[draftRing.length - 1]?.[1];
  const displayCount = isClosedRing ? draftRing.length - 1 : draftRing.length;
  const title = isCreating ? `Шинэ нутаг · ${year}` : feature ? `${feature.properties.name} · ${year}` : "Нутаг сонгоно уу";
  const subtitle = isCreating ? "Газрын зураг дарж нутгийн хилийг тэмдэглэ." : "Мэдээлэл болон хилийг засаарай.";

  return (
    <aside
      className="flex h-full min-h-105 flex-col overflow-hidden rounded-[28px]"
      style={{
        background: editorTheme.BG,
        border: `1px solid ${editorTheme.BORDER}`,
        boxShadow: "0 0 40px rgba(0,0,0,0.8), inset 0 0 40px rgba(201,164,93,0.02)",
        fontFamily: "Georgia, serif",
      }}
    >
      <div className="h-0.5 shrink-0" style={{ background: `linear-gradient(90deg, transparent, ${editorTheme.GOLD_DIM}, transparent)` }} />
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4" style={{ scrollbarWidth: "thin", scrollbarColor: `${editorTheme.BORDER} transparent` }}>
        <CoordEditorHeader
          year={year}
          title={title}
          subtitle={subtitle}
          isCreating={isCreating}
          isEditing={isEditing}
          saveState={saveState}
          hasFeature={Boolean(feature)}
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
        <CoordEditorFields form={safeForm} onFormChange={onFormChange} />
        <CoordEditorVertices
          draftRing={draftRing}
          isClosedRing={isClosedRing}
          displayCount={displayCount}
          isEditing={isEditing}
          selectedVertexIndex={selectedVertexIndex}
          onSelectVertex={onSelectVertex}
          onDeleteVertex={onDeleteVertex}
        />
      </div>
      <div className="h-0.5 shrink-0" style={{ background: `linear-gradient(90deg, transparent, ${editorTheme.GOLD_DIM}55, transparent)` }} />
    </aside>
  );
}
