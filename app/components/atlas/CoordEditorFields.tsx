"use client";

import { FORM_FIELDS, INPUT_STYLE } from "./coordEditorConfig";
import { editorTheme } from "./editorStyles";
import type { AtlasFormState } from "./types";

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
            onChange={(e) => onFormChange(field, e.target.value)}
            placeholder={placeholder}
            style={INPUT_STYLE}
          />
        ))}
        <div className="grid grid-cols-[1fr_80px] gap-2">
          <textarea
            value={form.summary}
            onChange={(e) => onFormChange("summary", e.target.value)}
            placeholder="Товч тайлбар (8+ тэмдэгт)"
            rows={3}
            style={{ ...INPUT_STYLE, resize: "none" }}
          />
          <div className="flex flex-col gap-2">
            <input
              value={form.color}
              onChange={(e) => onFormChange("color", e.target.value)}
              placeholder="#c9a45d"
              style={INPUT_STYLE}
            />
            <input
              type="color"
              value={form.color}
              onChange={(e) => onFormChange("color", e.target.value)}
              className="w-full cursor-pointer rounded"
              style={{ height: "36px", border: `1px solid ${editorTheme.BORDER}`, background: editorTheme.INPUT_BG, padding: "2px" }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
