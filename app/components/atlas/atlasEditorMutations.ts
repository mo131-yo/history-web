"use client";

import type { AtlasFeatureCollection, AtlasStateFeature } from "@/lib/types";
import { buildFormFromFeature, emptyAtlasForm } from "./form";
import type { AtlasFormState, SaveState } from "./types";

export function validateEditorPayload(draftRing: Array<[number, number]>, form: AtlasFormState) {
  const coordinates = draftRing
    .map((point) => [Number(point[0]), Number(point[1])] as [number, number])
    .filter(([lng, lat]) => Number.isFinite(lng) && Number.isFinite(lat) && lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90);
  if (coordinates.length < 4) return { error: "Polygon үүсгэхийн тулд газрын зураг дээр дор хаяж 3 цэг дарна уу." };

  const payload = {
    coordinates,
    name: form.name.trim(),
    leader: form.leader.trim() || "Тодорхойгүй",
    capital: form.capital.trim() || "Тодорхойгүй",
    color: form.color.trim() || "#c9a45d",
    summary: form.summary.trim(),
    periodName: form.periodName.trim(),
  };
  if (payload.name.length < 2) return { error: "Нэр дор хаяж 2 тэмдэгт байна." };
  if (payload.summary.length < 8) return { error: "Тайлбар дор хаяж 8 тэмдэгт байна." };
  return { payload };
}

export async function saveAtlasFeature(args: {
  year: number;
  isCreating: boolean;
  selectedFeature: AtlasStateFeature | null;
  validated: NonNullable<ReturnType<typeof validateEditorPayload>["payload"]>;
}) {
  const payload = {
    year: Number(args.year),
    name: args.validated.name,
    leader: args.validated.leader,
    capital: args.validated.capital,
    color: args.validated.color,
    summary: args.validated.summary,
    metadata: args.isCreating
      ? { periodName: args.validated.periodName }
      : { ...(args.selectedFeature?.properties.metadata ?? {}), periodName: args.validated.periodName },
    coordinates: args.validated.coordinates,
  };
  const url = args.isCreating ? "/api/atlas/states" : `/api/atlas/states/${args.selectedFeature?.properties.slug}`;
  const method = args.isCreating ? "POST" : "PATCH";
  const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.details?.fieldErrors ? Object.entries(body.details.fieldErrors).map(([key, value]) => `${key}: ${(value as string[]).join(", ")}`).join(" | ") : body?.error ?? (args.isCreating ? "create-failed" : "save-failed"));
  }
  return response.json() as Promise<{ feature: AtlasStateFeature; collection?: AtlasFeatureCollection }>;
}

export async function deleteAtlasFeature(year: number, slug: string) {
  const response = await fetch(`/api/atlas/states/${slug}?year=${year}`, { method: "DELETE" });
  if (!response.ok) throw new Error();
}

export function finishSave(setSaveState: (value: SaveState) => void) {
  setSaveState("saved");
  window.setTimeout(() => setSaveState("idle"), 1800);
}

export function resetDeletedState(
  setDraftRing: (ring: Array<[number, number]>) => void,
  setSelectedVertexIndex: (value: number | null) => void,
  setForm: (form: AtlasFormState) => void,
  setIsEditing: (value: boolean) => void,
) {
  setDraftRing([]);
  setSelectedVertexIndex(null);
  setForm(emptyAtlasForm);
  setIsEditing(false);
}

export function applySavedFeature(feature: AtlasStateFeature, setDraftRing: (ring: Array<[number, number]>) => void, setForm: (form: AtlasFormState) => void, setSelectedVertexIndex: (value: number | null) => void) {
  setDraftRing(feature.geometry.coordinates[0] as Array<[number, number]>);
  setSelectedVertexIndex(null);
  setForm(buildFormFromFeature(feature));
}
