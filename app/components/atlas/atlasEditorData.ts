"use client";

import { useEffect } from "react";
import type { AtlasFeatureCollection } from "@/lib/types";
import type { AtlasFormState, SaveState } from "./types";

export function useAtlasYears(year: number, years: number[], setYears: (years: number[]) => void, setLoadError: (value: string | null) => void) {
  useEffect(() => {
    fetch("/api/atlas/years")
      .then((response) => response.json())
      .then((data) => setYears(data.years as number[]))
      .catch(() => setLoadError("Timeline ачаалахад алдаа гарлаа."));
  }, [setLoadError, setYears]);

  useEffect(() => {
    if (years.length > 0 && !years.includes(year)) setYears(years);
  }, [year, years, setYears]);
}

export function useAtlasCollection(
  year: number,
  setCollection: (value: AtlasFeatureCollection | null | ((current: AtlasFeatureCollection | null) => AtlasFeatureCollection | null)) => void,
  setSelectedSlug: (value: string | null | ((current: string | null) => string | null)) => void,
  resetUiState: () => void,
  setLoadError: (value: string | null) => void,
) {
  useEffect(() => {
    setLoadError(null);
    fetch(`/api/atlas/states?year=${year}`)
      .then(async (response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((data: AtlasFeatureCollection) => {
        setCollection(data);
        setSelectedSlug((current) => {
          const exists = data.features.some((feature) => feature.properties.slug === current);
          return exists ? current : data.features[0]?.properties.slug ?? null;
        });
        resetUiState();
      })
      .catch(() => {
        setCollection(null);
        setSelectedSlug(null);
        setLoadError("Газрын зураг ачаалагдсангүй.");
      });
  }, [year, resetUiState, setCollection, setLoadError, setSelectedSlug]);
}

export function resetEditorStatus(
  setIsEditing: (value: boolean) => void,
  setIsCreating: (value: boolean) => void,
  setAddPointMode: (value: boolean) => void,
  setSelectedVertexIndex: (value: number | null) => void,
  setSaveState: (value: SaveState) => void,
  setSaveError: (value: string | null) => void,
) {
  setIsEditing(false);
  setIsCreating(false);
  setAddPointMode(false);
  setSelectedVertexIndex(null);
  setSaveState("idle");
  setSaveError(null);
}

export function resetCreateDraft(
  selectedRing: Array<[number, number]>,
  nextForm: AtlasFormState,
  setIsCreating: (value: boolean) => void,
  setIsEditing: (value: boolean) => void,
  setAddPointMode: (value: boolean) => void,
  setSelectedVertexIndex: (value: number | null) => void,
  setDraftRing: (ring: Array<[number, number]>) => void,
  setForm: (form: AtlasFormState) => void,
  setSaveState: (value: SaveState) => void,
  setSaveError: (value: string | null) => void,
) {
  setIsCreating(false);
  setIsEditing(false);
  setAddPointMode(false);
  setSelectedVertexIndex(null);
  setDraftRing(selectedRing);
  setForm(nextForm);
  setSaveState("idle");
  setSaveError(null);
}
