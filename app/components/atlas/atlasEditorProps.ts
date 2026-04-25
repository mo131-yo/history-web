"use client";

import { buildFormFromFeature, emptyAtlasForm } from "./form";
import type { AtlasFormState, CoordEditorProps, SaveState, SharedMapProps } from "./types";
import type { AtlasFeatureCollection, AtlasStateFeature } from "@/lib/types";

export function buildSharedMapProps(args: {
  adminMode: boolean;
  collection: AtlasFeatureCollection | null;
  selectedSlug: string | null;
  onSelectSlug: (slug: string) => void;
  isEditing: boolean;
  isCreating: boolean;
  addPointMode: boolean;
  draftRing: Array<[number, number]>;
  onDraftRingChange: (ring: Array<[number, number]>) => void;
  selectedVertexIndex: number | null;
  onSelectVertex: (index: number | null) => void;
}): SharedMapProps {
  return {
    collection: args.collection,
    selectedSlug: args.selectedSlug,
    onSelectSlug: args.onSelectSlug,
    isEditing: args.adminMode && args.isEditing,
    isCreating: args.adminMode && args.isCreating,
    addPointMode: args.adminMode && args.addPointMode,
    draftRing: args.draftRing,
    onDraftRingChange: args.onDraftRingChange,
    selectedVertexIndex: args.selectedVertexIndex,
    onSelectVertex: args.onSelectVertex,
  };
}

export function buildCoordEditorProps(args: {
  year: number;
  feature: AtlasStateFeature | null;
  isEditing: boolean;
  isCreating: boolean;
  addPointMode: boolean;
  draftRing: Array<[number, number]>;
  saveState: SaveState;
  saveError: string | null;
  form: AtlasFormState;
  setForm: (updater: (current: AtlasFormState) => AtlasFormState) => void;
  setSelectedSlug: (slug: string | null) => void;
  setIsCreating: (value: boolean) => void;
  setIsEditing: (value: boolean | ((current: boolean) => boolean)) => void;
  setAddPointMode: (value: boolean | ((current: boolean) => boolean)) => void;
  setSelectedVertexIndex: (value: number | null) => void;
  selectedVertexIndex: number | null;
  setDraftRing: (ring: Array<[number, number]>) => void;
  setSaveState: (value: SaveState) => void;
  setSaveError: (value: string | null) => void;
  onCancelCreate: () => void;
  onSave: () => Promise<void>;
  onDelete: () => Promise<void>;
  onDeleteVertex: (index: number) => void;
}): CoordEditorProps {
  return {
    year: args.year,
    feature: args.feature,
    isEditing: args.isEditing,
    isCreating: args.isCreating,
    addPointMode: args.addPointMode,
    draftRing: args.draftRing,
    saveState: args.saveState,
    saveError: args.saveError,
    form: args.form,
    onFormChange: (field, value) => args.setForm((current) => ({ ...current, [field]: value })),
    onStartCreate: () => {
      args.setSelectedSlug(null);
      args.setIsCreating(true);
      args.setIsEditing(true);
      args.setAddPointMode(false);
      args.setSelectedVertexIndex(null);
      args.setDraftRing([]);
      args.setForm(() => emptyAtlasForm);
      args.setSaveState("idle");
      args.setSaveError(null);
    },
    onCancelCreate: args.onCancelCreate,
    onToggleEditing: () => {
      args.setIsEditing((current) => !current);
      args.setAddPointMode(false);
      args.setSelectedVertexIndex(null);
      args.setSaveState("idle");
      args.setSaveError(null);
    },
    onToggleAddPoint: () => args.setAddPointMode((current) => !current),
    onReset: () => {
      if (args.isCreating) {
        args.setDraftRing([]);
        args.setSelectedVertexIndex(null);
        args.setSaveState("idle");
        args.setSaveError(null);
        return;
      }
      if (!args.feature) return;
      args.setDraftRing(args.feature.geometry.coordinates[0] as Array<[number, number]>);
      args.setSelectedVertexIndex(null);
      args.setForm(() => buildFormFromFeature(args.feature));
      args.setSaveState("idle");
      args.setSaveError(null);
    },
    onSave: args.onSave,
    onDelete: args.onDelete,
    selectedVertexIndex: args.selectedVertexIndex,
    onSelectVertex: args.setSelectedVertexIndex,
    onDeleteVertex: args.onDeleteVertex,
  };
}
