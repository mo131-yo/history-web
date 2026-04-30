"use client";

// import { INPUT_STYLE } from "./coordEditorConfig";
import { editorTheme } from "./editorStyles";

const COLOR_PRESETS = [
  "#c9a45d",
  "#d97706",
  "#b45309",
  "#dc2626",
  "#7f1d1d",
  "#2563eb",
  "#1d4ed8",
  "#0f766e",
  "#15803d",
  "#6d28d9",
];

export function CoordEditorColorField({
  color,
  onChange,
}: {
  color: string;
  onChange: (value: string) => void;
}) {
  return (
    <div
      className="rounded-[18px] p-3"
      style={{
        border: `1px solid ${editorTheme.BORDER}`,
        background:
          "#fcfcfc",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <p
            className="text-[15px]  uppercase tracking-[0.1em]"
            style={{ color: editorTheme.TEXT_MUTED }}
          >
            Polygon өнгө
          </p>
          <p
            className="mt-1 text-[10px] leading-4"
            style={{ color: editorTheme.TEXT_SUB }}
          >
            Сонгосон өнгө map дээр шууд харагдана.
          </p>
        </div>

        <label
          className="relative block w-16 h-16 overflow-hidden cursor-pointer group shrink-0 rounded-2xl"
          style={{
            border: `1px solid ${editorTheme.SELECTED_BORDER}`,
            background: color,
            boxShadow: `0 0 0 1px ${editorTheme.BORDER}, 0 10px 24px ${color}33`,
            transition: "transform 180ms ease, box-shadow 180ms ease",
          }}
        >
          <div
            className="absolute inset-0 opacity-80"
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.28), transparent 45%, rgba(255, 0, 0, 0.14))",
            }}
          />
          <div
            className="absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[8px] uppercase tracking-[0.28em]"
            style={{
              color: "#fff7e8",
              background: "rgba(12,7,2,0.48)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(6px)",
            }}
          >
            live
          </div>
          <input
            type="color"
            value={color}
            onChange={(e: any) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
            aria-label="Polygon өнгө сонгох"
          />
        </label>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-3">
        {COLOR_PRESETS.map((preset) => {
          const active = preset.toLowerCase() === color.toLowerCase();

          return (
            <button
              key={preset}
              type="button"
              onClick={() => onChange(preset)}
              className="relative h-10 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.03]"
              style={{
                background: preset,
                border: `1px solid ${
                  active ? editorTheme.TEXT_MAIN : "rgba(255,255,255,0.08)"
                }`,
                boxShadow: active
                  ? `0 0 0 1px ${editorTheme.GOLD}, 0 8px 18px ${preset}4d`
                  : `0 4px 12px ${preset}22`,
                transform: active ? "translateY(-1px) scale(1.04)" : "none",
              }}
              title={preset}
              aria-label={`${preset} өнгө сонгох`}
            >
              <span
                className="absolute h-2 rounded-full inset-x-1 top-1"
                style={{ background: "rgba(255,255,255,0.24)" }}
              />
              {active && (
                <span
                  className="absolute bottom-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full"
                  style={{ background: "#fff7e8", boxShadow: "0 0 8px rgba(255,247,232,0.9)" }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* <div className="grid grid-cols-[1fr_90px] gap-2">
        <input
          value={color}
          onChange={(e: any) => onChange(e.target.value)}
          placeholder="#c9a45d"
          style={INPUT_STYLE}
        />
        <div
          className="flex items-center justify-center rounded-xl text-[10px] uppercase tracking-[0.24em]"
          style={{
            border: `1px solid ${editorTheme.BORDER}`,
            background: "rgba(255,255,255,0.02)",
            color: editorTheme.TEXT_MAIN,
            fontFamily: "var(--font-inter), Arial, sans-serif",
          }}
        >
          {color}
        </div>
      </div> */}
    </div>
  );
}
