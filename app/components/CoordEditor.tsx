"use client";

import { Edit3, PlusCircle, RotateCcw, Save, Trash2, WandSparkles } from "lucide-react";
import type { AtlasStateFeature } from "@/lib/types";

interface CoordEditorProps {
  year: number;
  feature: AtlasStateFeature | null;
  isEditing: boolean;
  isCreating: boolean;
  addPointMode: boolean;
  draftRing: Array<[number, number]>;
  saveState: "idle" | "saving" | "saved" | "error";
  form: {
    periodName: string;
    name: string;
    leader: string;
    capital: string;
    color: string;
    summary: string;
  };
  onFormChange: (field: "periodName" | "name" | "leader" | "capital" | "color" | "summary", value: string) => void;
  onStartCreate: () => void;
  onCancelCreate: () => void;
  onToggleEditing: () => void;
  onToggleAddPoint: () => void;
  onReset: () => void;
  onSave: () => void;
  onDelete: () => void;
}

export default function CoordEditor({
  year,
  feature,
  isEditing,
  isCreating,
  addPointMode,
  draftRing,
  saveState,
  form,
  onFormChange,
  onStartCreate,
  onCancelCreate,
  onToggleEditing,
  onToggleAddPoint,
  onReset,
  onSave,
  onDelete,
}: CoordEditorProps) {
  const safeForm = {
    periodName: form.periodName ?? "",
    name: form.name ?? "",
    leader: form.leader ?? "",
    capital: form.capital ?? "",
    color: form.color ?? "#c9a45d",
    summary: form.summary ?? "",
  };
  const hasEditableTarget = Boolean(feature) || isCreating;
  const canSave = hasEditableTarget && draftRing.length >= 4 && saveState !== "saving";

  return (
    <aside className="flex h-full min-h-[420px] flex-col rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(7,13,22,0.96),rgba(5,8,15,0.98))] p-4 shadow-[0_20px_70px_rgba(0,0,0,0.35)] lg:min-h-0">
      <div>
        <h3 className="mt-1 text-xl font-semibold text-white">
          {isCreating ? `Шинэ GeoJSON Polygon · ${year}` : feature ? `${feature.properties.name} · ${year}` : "Polygon сонгоно уу"}
        </h3>
        <p className="mt-2 text-xs leading-5 text-slate-400">
          {isCreating
            ? "Map дээр дарж цэгүүдээ зур. Дараа нь нэр, хаан, нийслэл, тайлбараа оруулаад хадгал."
            : "Улсын нэр, тухайн үеийн нэр болон бусад мэдээллийг form-оос шууд шинэчилж хадгалж болно. Хэрэв хилээ засах бол Edit mode асаана."}
        </p>
      </div>

      <div className="mt-4 grid gap-2.5">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={isCreating ? onCancelCreate : onStartCreate}
            className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition ${
              isCreating ? "bg-amber-300 text-slate-950" : "bg-violet-400 text-slate-950 hover:bg-violet-300"
            }`}
          >
            <WandSparkles className="size-4" />
            {isCreating ? "Create mode цуцлах" : "Шинэ polygon"}
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={!feature || isCreating}
            className="flex items-center justify-center gap-2 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 className="size-4" />
            Delete
          </button>
        </div>

        <button
          type="button"
          onClick={onToggleEditing}
          disabled={!feature || isCreating}
          className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition ${
            isEditing
              ? "bg-sky-400 text-slate-950"
              : "bg-white/6 text-white hover:bg-white/10"
          } disabled:cursor-not-allowed disabled:opacity-40`}
        >
          <Edit3 className="size-4" />
          {isEditing ? "Edit mode унтраах" : "Edit mode асаах"}
        </button>

        <button
          type="button"
          onClick={onToggleAddPoint}
          disabled={!feature || !isEditing || isCreating}
          className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition ${
            addPointMode
              ? "bg-amber-300 text-slate-950"
              : "bg-white/6 text-white hover:bg-white/10"
          } disabled:cursor-not-allowed disabled:opacity-40`}
        >
          <PlusCircle className="size-4" />
          {addPointMode ? "Add point горим идэвхтэй" : "Шинэ цэг нэмэх"}
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onReset}
            disabled={!hasEditableTarget}
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw className="size-4" />
            Буцаах
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={!canSave}
            className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Save className="size-4" />
            {saveState === "saving" ? "Хадгалж байна" : isCreating ? "Шинээр хадгалах" : "Update хадгалах"}
          </button>
        </div>
      </div>

      <div className="mt-3 grid gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">State Form</p>
        <input value={safeForm.name} onChange={(event) => onFormChange("name", event.target.value)} placeholder="Улсын нэр" className="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none" />
        <input value={safeForm.leader} onChange={(event) => onFormChange("leader", event.target.value)} placeholder="Удирдагч" className="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none" />
        <input value={safeForm.capital} onChange={(event) => onFormChange("capital", event.target.value)} placeholder="Нийслэл" className="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none" />
        <div className="grid grid-cols-[1fr_88px] gap-3">
          <input value={safeForm.summary} onChange={(event) => onFormChange("summary", event.target.value)} placeholder="Товч тайлбар" className="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none" />
          <input value={safeForm.color} onChange={(event) => onFormChange("color", event.target.value)} placeholder="#c9a45d" className="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none" />
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-sky-300/10 bg-sky-300/[0.04] p-3">
        <p className="text-[10px] uppercase tracking-[0.3em] text-sky-200/60">Current Vertices</p>
        <div className="mt-2 grid max-h-40 grid-cols-2 gap-2 overflow-hidden">
          {draftRing.length === 0 ? (
            <p className="col-span-2 text-sm text-slate-500">Polygon сонгоход coordinate энд гарна.</p>
          ) : (
            draftRing.map(([lng, lat], index) => (
              <div
                key={`${index}-${lng}-${lat}`}
                className="rounded-xl border border-white/8 bg-slate-950/40 px-2.5 py-2 text-xs text-slate-200"
              >
                #{index + 1} · lng {lng.toFixed(5)} · lat {lat.toFixed(5)}
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
