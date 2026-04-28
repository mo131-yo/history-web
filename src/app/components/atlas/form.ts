"use client";

import type { AtlasStateFeature } from "@/lib/types";
import type { AtlasFormState } from "./types";

export const emptyAtlasForm: AtlasFormState = {
  periodName: "",
  name: "",
  leader: "",
  capital: "",
  color: "#c9a45d",
  summary: "",
};

export function buildFormFromFeature(
  feature: AtlasStateFeature | null
): AtlasFormState {
  if (!feature) return emptyAtlasForm;

  return {
    periodName: String(feature.properties.metadata?.periodName ?? ""),
    name: feature.properties.name,
    leader: feature.properties.leader,
    capital: feature.properties.capital,
    color: feature.properties.color,
    summary: feature.properties.summary,
  };
}
