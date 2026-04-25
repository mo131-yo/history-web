"use client";

import type { AtlasFeatureCollection, AtlasStateFeature } from "@/lib/types";
import { useEffect } from "react";
import { buildFormFromFeature } from "./form";
import { resetCreateDraft } from "./atlasEditorData";
import {
  applySavedFeature,
  deleteAtlasFeature,
  finishSave,
  resetDeletedState,
  saveAtlasFeature,
  validateEditorPayload,
} from "./atlasEditorMutations";
import type { AtlasFormState, SaveState } from "./types";

export function useSelectedFeatureDraftSync(args: {
  isCreating: boolean;
  selectedFeature: AtlasStateFeature | null;
  setDraftRing: (ring: Array<[number, number]>) => void;
  setForm: (form: AtlasFormState) => void;
  setSelectedVertexIndex: (value: number | null) => void;
  setSaveState: (value: SaveState) => void;
  setSaveError: (value: string | null) => void;
}) {
  useEffect(() => {
    if (!args.selectedFeature || args.isCreating) return void args.setDraftRing([]);
    args.setDraftRing(args.selectedFeature.geometry.coordinates[0] as Array<[number, number]>);
    args.setForm(buildFormFromFeature(args.selectedFeature));
    args.setSelectedVertexIndex(null);
    args.setSaveState("idle");
    args.setSaveError(null);
  }, [
    args.isCreating,
    args.selectedFeature,
    args.setDraftRing,
    args.setForm,
    args.setSelectedVertexIndex,
    args.setSaveError,
    args.setSaveState,
  ]);
}

export function buildResetCreateMode(args: {
  selectedFeature: AtlasStateFeature | null;
  setIsCreating: (value: boolean) => void;
  setIsEditing: (value: boolean) => void;
  setAddPointMode: (value: boolean) => void;
  setSelectedVertexIndex: (value: number | null) => void;
  setDraftRing: (ring: Array<[number, number]>) => void;
  setForm: (form: AtlasFormState) => void;
  setSaveState: (value: SaveState) => void;
  setSaveError: (value: string | null) => void;
}) {
  return function resetCreateMode() {
    resetCreateDraft((args.selectedFeature?.geometry.coordinates[0] as Array<[number, number]>) ?? [], buildFormFromFeature(args.selectedFeature), args.setIsCreating, args.setIsEditing, args.setAddPointMode, args.setSelectedVertexIndex, args.setDraftRing, args.setForm, args.setSaveState, args.setSaveError);
  };
}

export function buildSaveGeometry(args: {
  draftRing: Array<[number, number]>;
  form: AtlasFormState;
  year: number;
  isCreating: boolean;
  selectedFeature: AtlasStateFeature | null;
  setSaveError: (value: string | null) => void;
  setSaveState: (value: SaveState) => void;
  setCollection: (value: AtlasFeatureCollection | null | ((current: AtlasFeatureCollection | null) => AtlasFeatureCollection | null)) => void;
  setSelectedSlug: (value: string | null) => void;
  setIsCreating: (value: boolean) => void;
  setIsEditing: (value: boolean) => void;
  setAddPointMode: (value: boolean) => void;
  setDraftRing: (ring: Array<[number, number]>) => void;
  setForm: (form: AtlasFormState) => void;
  setSelectedVertexIndex: (value: number | null) => void;
}) {
  return async function handleSaveGeometry() {
    const validation = validateEditorPayload(args.draftRing, args.form);
    if (validation.error || !validation.payload) {
      args.setSaveError(validation.error ?? "Хадгалах мэдээлэл буруу байна.");
      args.setSaveState("error");
      return;
    }

    try {
      args.setSaveState("saving");
      args.setSaveError(null);
      const { feature, collection: nextCollection } = await saveAtlasFeature({
        year: args.year,
        isCreating: args.isCreating,
        selectedFeature: args.selectedFeature,
        validated: validation.payload,
      });

      if (args.isCreating) {
      args.setCollection((current) => nextCollection ?? (current ? { ...current, features: [...current.features, feature] } : { type: "FeatureCollection", year: args.year, features: [feature] }));
        args.setSelectedSlug(feature.properties.slug);
        args.setIsCreating(false);
        args.setIsEditing(false);
        args.setAddPointMode(false);
        applySavedFeature(feature, args.setDraftRing, args.setForm, args.setSelectedVertexIndex);
        finishSave(args.setSaveState);
        return;
      }

      if (!args.selectedFeature) throw new Error("no-feature");
      args.setCollection((current) => current ? { ...current, features: current.features.map((item) => item.properties.slug === feature.properties.slug ? feature : item) } : current);
      applySavedFeature(feature, args.setDraftRing, args.setForm, args.setSelectedVertexIndex);
      finishSave(args.setSaveState);
    } catch (err) {
      args.setSaveState("error");
      args.setSaveError(err instanceof Error ? err.message : "Хадгалахад алдаа гарлаа.");
    }
  };
}

export function buildDeleteState(args: {
  year: number;
  isCreating: boolean;
  selectedFeature: AtlasStateFeature | null;
  setSaveState: (value: SaveState) => void;
  setSaveError: (value: string | null) => void;
  setCollection: (value: AtlasFeatureCollection | null | ((current: AtlasFeatureCollection | null) => AtlasFeatureCollection | null)) => void;
  setSelectedSlug: (value: string | null) => void;
  setDraftRing: (ring: Array<[number, number]>) => void;
  setSelectedVertexIndex: (value: number | null) => void;
  setForm: (form: AtlasFormState) => void;
  setIsEditing: (value: boolean) => void;
}) {
  return async function handleDeleteState() {
    if (!args.selectedFeature || args.isCreating) return;
    try {
      args.setSaveState("saving");
      await deleteAtlasFeature(args.year, args.selectedFeature.properties.slug);
      args.setCollection((current) => {
        if (!current) return current;
        const next = current.features.filter((item) => item.properties.slug !== args.selectedFeature?.properties.slug);
        args.setSelectedSlug(next[0]?.properties.slug ?? null);
        return { ...current, features: next };
      });
      resetDeletedState(args.setDraftRing, args.setSelectedVertexIndex, args.setForm, args.setIsEditing);
      finishSave(args.setSaveState);
    } catch {
      args.setSaveState("error");
      args.setSaveError("Устгахад алдаа гарлаа.");
    }
  };
}
