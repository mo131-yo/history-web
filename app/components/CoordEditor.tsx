// "use client";

// import { Edit3, PlusCircle, RotateCcw, Save, Trash2, WandSparkles } from "lucide-react";
// import type { AtlasStateFeature } from "@/lib/types";

// interface CoordEditorProps {
//   year: number;
//   feature: AtlasStateFeature | null;
//   isEditing: boolean;
//   isCreating: boolean;
//   addPointMode: boolean;
//   draftRing: Array<[number, number]>;
//   saveState: "idle" | "saving" | "saved" | "error";
//   form: {
//     periodName: string;
//     name: string;
//     leader: string;
//     capital: string;
//     color: string;
//     summary: string;
//   };
//   onFormChange: (field: "periodName" | "name" | "leader" | "capital" | "color" | "summary", value: string) => void;
//   onStartCreate: () => void;
//   onCancelCreate: () => void;
//   onToggleEditing: () => void;
//   onToggleAddPoint: () => void;
//   onReset: () => void;
//   onSave: () => void;
//   onDelete: () => void;
// }

// export default function CoordEditor({
//   year,
//   feature,
//   isEditing,
//   isCreating,
//   addPointMode,
//   draftRing,
//   saveState,
//   form,
//   onFormChange,
//   onStartCreate,
//   onCancelCreate,
//   onToggleEditing,
//   onToggleAddPoint,
//   onReset,
//   onSave,
//   onDelete,
// }: CoordEditorProps) {
//   const safeForm = {
//     periodName: form.periodName ?? "",
//     name: form.name ?? "",
//     leader: form.leader ?? "",
//     capital: form.capital ?? "",
//     color: form.color ?? "#c9a45d",
//     summary: form.summary ?? "",
//   };
//   const hasEditableTarget = Boolean(feature) || isCreating;
//   const canSave = hasEditableTarget && draftRing.length >= 4 && saveState !== "saving";

//   return (
//     <aside className="flex h-full min-h-[420px] flex-col rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(7,13,22,0.96),rgba(5,8,15,0.98))] p-4 shadow-[0_20px_70px_rgba(0,0,0,0.35)] lg:min-h-0">
//       <div>
//         <h3 className="mt-1 text-xl font-semibold text-white">
//           {isCreating ? `Шинэ GeoJSON Polygon · ${year}` : feature ? `${feature.properties.name} · ${year}` : "Polygon сонгоно уу"}
//         </h3>
//         <p className="mt-2 text-xs leading-5 text-slate-400">
//           {isCreating
//             ? "Map дээр дарж цэгүүдээ зур. Дараа нь нэр, хаан, нийслэл, тайлбараа оруулаад хадгал."
//             : "Улсын нэр, тухайн үеийн нэр болон бусад мэдээллийг form-оос шууд шинэчилж хадгалж болно. Хэрэв хилээ засах бол Edit mode асаана."}
//         </p>
//       </div>

//       <div className="mt-4 grid gap-2.5">
//         <div className="grid grid-cols-2 gap-3">
//           <button
//             type="button"
//             onClick={isCreating ? onCancelCreate : onStartCreate}
//             className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition ${
//               isCreating ? "bg-amber-300 text-slate-950" : "bg-violet-400 text-slate-950 hover:bg-violet-300"
//             }`}
//           >
//             <WandSparkles className="size-4" />
//             {isCreating ? "Create mode цуцлах" : "Шинэ polygon"}
//           </button>

//           <button
//             type="button"
//             onClick={onDelete}
//             disabled={!feature || isCreating}
//             className="flex items-center justify-center gap-2 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
//           >
//             <Trash2 className="size-4" />
//             Delete
//           </button>
//         </div>

//         <button
//           type="button"
//           onClick={onToggleEditing}
//           disabled={!feature || isCreating}
//           className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition ${
//             isEditing
//               ? "bg-sky-400 text-slate-950"
//               : "bg-white/6 text-white hover:bg-white/10"
//           } disabled:cursor-not-allowed disabled:opacity-40`}
//         >
//           <Edit3 className="size-4" />
//           {isEditing ? "Edit mode унтраах" : "Edit mode асаах"}
//         </button>

//         <button
//           type="button"
//           onClick={onToggleAddPoint}
//           disabled={!feature || !isEditing || isCreating}
//           className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition ${
//             addPointMode
//               ? "bg-amber-300 text-slate-950"
//               : "bg-white/6 text-white hover:bg-white/10"
//           } disabled:cursor-not-allowed disabled:opacity-40`}
//         >
//           <PlusCircle className="size-4" />
//           {addPointMode ? "Add point горим идэвхтэй" : "Шинэ цэг нэмэх"}
//         </button>

//         <div className="grid grid-cols-2 gap-3">
//           <button
//             type="button"
//             onClick={onReset}
//             disabled={!hasEditableTarget}
//             className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
//           >
//             <RotateCcw className="size-4" />
//             Буцаах
//           </button>

//           <button
//             type="button"
//             onClick={onSave}
//             disabled={!canSave}
//             className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
//           >
//             <Save className="size-4" />
//             {saveState === "saving" ? "Хадгалж байна" : isCreating ? "Шинээр хадгалах" : "Update хадгалах"}
//           </button>
//         </div>
//       </div>

//       <div className="mt-3 grid gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
//         <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">State Form</p>
//         <input value={safeForm.name} onChange={(event) => onFormChange("name", event.target.value)} placeholder="Улсын нэр" className="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none" />
//         <input value={safeForm.leader} onChange={(event) => onFormChange("leader", event.target.value)} placeholder="Удирдагч" className="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none" />
//         <input value={safeForm.capital} onChange={(event) => onFormChange("capital", event.target.value)} placeholder="Нийслэл" className="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none" />
//         <div className="grid grid-cols-[1fr_88px] gap-3">
//           <input value={safeForm.summary} onChange={(event) => onFormChange("summary", event.target.value)} placeholder="Товч тайлбар" className="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none" />
//           <input value={safeForm.color} onChange={(event) => onFormChange("color", event.target.value)} placeholder="#c9a45d" className="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none" />
//         </div>
//       </div>

//       <div className="mt-3 rounded-2xl border border-sky-300/10 bg-sky-300/[0.04] p-3">
//         <p className="text-[10px] uppercase tracking-[0.3em] text-sky-200/60">Current Vertices</p>
//         <div className="mt-2 grid max-h-40 grid-cols-2 gap-2 overflow-hidden">
//           {draftRing.length === 0 ? (
//             <p className="col-span-2 text-sm text-slate-500">Polygon сонгоход coordinate энд гарна.</p>
//           ) : (
//             draftRing.map(([lng, lat], index) => (
//               <div
//                 key={`${index}-${lng}-${lat}`}
//                 className="rounded-xl border border-white/8 bg-slate-950/40 px-2.5 py-2 text-xs text-slate-200"
//               >
//                 #{index + 1} · lng {lng.toFixed(5)} · lat {lat.toFixed(5)}
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//     </aside>
//   );
// }



"use client";

import { Edit3, PlusCircle, RotateCcw, Save, Trash2, WandSparkles, Swords } from "lucide-react";
import type { AtlasStateFeature } from "@/lib/types";

const BG = "rgba(12,7,2,0.98)";
const BORDER = "#4a3010";
const GOLD = "#c9a45d";
const GOLD_DIM = "#8b6c35";
const TEXT_MAIN = "#f0deb4";
const TEXT_SUB = "#9a7c50";
const TEXT_MUTED = "#5c4020";
const INPUT_BG = "rgba(255,200,100,0.04)";

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

  return (
    <aside
      className="flex h-full min-h-[420px] flex-col rounded-[28px] overflow-y-auto"
      style={{
        background: BG,
        border: `1px solid ${BORDER}`,
        boxShadow: `0 0 40px rgba(0,0,0,0.8), inset 0 0 40px rgba(201,164,93,0.02)`,
        fontFamily: "Georgia, serif",
      }}
    >
      {/* Top colour accent */}
      <div className="h-0.5 shrink-0" style={{ background: `linear-gradient(90deg, transparent, ${GOLD_DIM}, transparent)` }} />

      <div className="flex-1 px-4 py-4 flex flex-col gap-3 lg:min-h-0">
        {/* Header */}
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

        {/* Divider */}
        <div className="h-px" style={{ background: BORDER }} />

        {/* Action buttons */}
        <div className="grid gap-2">
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={isCreating ? onCancelCreate : onStartCreate}
              style={{ ...BTN_BASE, background: isCreating ? `${GOLD}20` : "rgba(139,108,53,0.15)", borderColor: isCreating ? GOLD+"55" : BORDER, color: isCreating ? GOLD : TEXT_MAIN }}>
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
            style={{ ...BTN_BASE, background: addPointMode ? `${GOLD}15` : INPUT_BG, borderColor: addPointMode ? GOLD+"44" : BORDER, color: addPointMode ? GOLD : TEXT_MAIN, opacity: (!feature || !isEditing || isCreating) ? 0.35 : 1, cursor: (!feature || !isEditing || isCreating) ? "not-allowed" : "pointer" }}>
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

        {/* Form */}
        <div className="h-px" style={{ background: BORDER }} />
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

        {/* Vertices */}
        <div className="h-px" style={{ background: BORDER }} />
        <div>
          <p className="text-[8px] uppercase tracking-[0.4em] mb-2" style={{ color: TEXT_MUTED }}>
            Координатууд ({draftRing.length})
          </p>
          <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-hidden">
            {draftRing.length === 0 ? (
              <p className="col-span-2 text-[10px]" style={{ color: TEXT_MUTED }}>Нутаг сонгоход гарна.</p>
            ) : draftRing.map(([lng, lat], i) => (
              <div
                key={`${i}-${lng}-${lat}`}
                className="rounded px-2 py-1.5 text-[10px]"
                style={{ background: INPUT_BG, border: `1px solid ${BORDER}`, color: TEXT_SUB }}
              >
                #{i+1} · {lng.toFixed(3)}, {lat.toFixed(3)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}