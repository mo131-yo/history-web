"use client";

import { useCallback, useMemo, useState } from "react";
import type { AtlasFeatureCollection } from "@/lib/types";
import { emptyAtlasForm } from "./form";
import { resetEditorStatus, useAtlasCollection, useAtlasYears } from "./atlasEditorData";
import { buildCoordEditorProps, buildSharedMapProps } from "./atlasEditorProps";
import { buildDeleteState, buildResetCreateMode, buildSaveGeometry, useSelectedFeatureDraftSync } from "./useAtlasEditorPersistence";
import type { AtlasFormState, SaveState } from "./types";

export function useAtlasEditor(year: number, adminMode: boolean) {
  const [years, setYears] = useState<number[]>([]);
  const [collection, setCollection] = useState<AtlasFeatureCollection | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [addPointMode, setAddPointMode] = useState(false);
  const [draftRing, setDraftRing] = useState<Array<[number, number]>>([]);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState<AtlasFormState>(emptyAtlasForm);
  const [selectedVertexIndex, setSelectedVertexIndex] = useState<number | null>(null);

  const resetUiState = useCallback(() => {
    resetEditorStatus(
      setIsEditing,
      setIsCreating,
      setAddPointMode,
      setSelectedVertexIndex,
      setSaveState,
      setSaveError,
    );
  }, []);

  useAtlasYears(year, years, setYears, setLoadError);
  useAtlasCollection(
    year,
    setCollection,
    setSelectedSlug,
    resetUiState,
    setLoadError,
  );

  const selectedFeature = useMemo(() => collection?.features.find((f) => f.properties.slug === selectedSlug) ?? null, [collection, selectedSlug]);

  const filteredFeatures = useMemo(() => {
    if (!collection) return [];
    const q = search.trim().toLowerCase();
    return collection.features.filter(
      (f) =>
        !q ||
        f.properties.name.toLowerCase().includes(q) ||
        f.properties.leader.toLowerCase().includes(q) ||
        f.properties.capital.toLowerCase().includes(q)
    );
  }, [collection, search]);

  useSelectedFeatureDraftSync({ isCreating, selectedFeature, setDraftRing, setForm, setSelectedVertexIndex, setSaveState, setSaveError });

  const handleSelectSlug = useCallback((slug: string) => {
    setSelectedSlug(slug);
  }, []);

  function handleDeleteVertex(index: number) {
    if (draftRing.length <= 4) return;
    setDraftRing(draftRing.filter((_, i) => i !== index));
    setSelectedVertexIndex(null);
  }

  const resetCreateMode = buildResetCreateMode({
    selectedFeature,
    setIsCreating,
    setIsEditing,
    setAddPointMode,
    setSelectedVertexIndex,
    setDraftRing,
    setForm,
    setSaveState,
    setSaveError,
  });
  const handleSaveGeometry = buildSaveGeometry({
    draftRing,
    form,
    year,
    isCreating,
    selectedFeature,
    setSaveError,
    setSaveState,
    setCollection,
    setSelectedSlug,
    setIsCreating,
    setIsEditing,
    setAddPointMode,
    setDraftRing,
    setForm,
    setSelectedVertexIndex,
  });
  const handleDeleteState = buildDeleteState({
    year,
    isCreating,
    selectedFeature,
    setSaveState,
    setSaveError,
    setCollection,
    setSelectedSlug,
    setDraftRing,
    setSelectedVertexIndex,
    setForm,
    setIsEditing,
  });

  const sharedMapProps = buildSharedMapProps({
    adminMode,
    collection,
    selectedSlug,
    onSelectSlug: handleSelectSlug,
    isEditing,
    isCreating,
    addPointMode,
    draftRing,
    onDraftRingChange: setDraftRing,
    selectedVertexIndex,
    onSelectVertex: setSelectedVertexIndex,
  });

  const coordEditorProps = buildCoordEditorProps({
    year,
    feature: selectedFeature,
    isEditing,
    isCreating,
    addPointMode,
    draftRing,
    saveState,
    saveError,
    form,
    setForm,
    setSelectedSlug,
    setIsCreating,
    setIsEditing,
    setAddPointMode,
    setSelectedVertexIndex,
    selectedVertexIndex,
    setDraftRing,
    setSaveState,
    setSaveError,
    onCancelCreate: resetCreateMode,
    onSave: handleSaveGeometry,
    onDelete: handleDeleteState,
    onDeleteVertex: handleDeleteVertex,
  });

  return { years, collection, selectedFeature, filteredFeatures, search, setSearch, setSelectedSlug, loadError, sharedMapProps, coordEditorProps };
}
