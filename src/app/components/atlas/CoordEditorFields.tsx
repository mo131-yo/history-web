"use client";

import { FORM_FIELDS, INPUT_STYLE } from "./coordEditorConfig";
import { CoordEditorColorField } from "./CoordEditorColorField";
import { editorTheme } from "./editorStyles";
import { AtlasFormState } from "./types";

export function CoordEditorFields({
  form,
  onFormChange,
}: {
  form: AtlasFormState;
  onFormChange: (field: keyof AtlasFormState, value: string) => void;
}) {
  return (
    <>
      <div className="h-px shrink-0" style={{ background: editorTheme.BORDER }} />
      <div className="grid gap-2">
        <p className="text-[8px] uppercase tracking-[0.4em]" style={{ color: editorTheme.TEXT_MUTED }}>
          Нутгийн мэдээлэл
        </p>
        {FORM_FIELDS.map(({ field, placeholder }) => (
          <input
            key={field}
            value={form[field]}
            onChange={(e: any) => onFormChange(field, e.target.value)}
            placeholder={placeholder}
            style={INPUT_STYLE}
          />
        ))}
        <textarea
          value={form.summary}
          onChange={(e: any) => onFormChange("summary", e.target.value)}
          placeholder="Товч тайлбар (8+ тэмдэгт)"
          rows={3}
          style={{ ...INPUT_STYLE, resize: "none" }}
        />
        <CoordEditorColorField
          color={form.color}
          onChange={(value) => onFormChange("color", value)}
        />
      </div>
    </>
  );
}
