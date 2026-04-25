"use client";

import type { AtlasFeatureCollection, AtlasStateFeature } from "@/lib/types";

export type MapMode = "globe" | "historical";

export type RoleId =
  | "malchin"
  | "aduuchin"
  | "helmerch"
  | "oydolchin"
  | "tariachin"
  | "aravt"
  | "zuut"
  | "myangat"
  | "myangatiin_noyon"
  | "bicheech"
  | "darkhan"
  | "anchin"
  | "hudaldaachin"
  | "boo_udgan";

export type RoleScore = Partial<Record<RoleId, number>>;

export type CharacterRole = {
  id: RoleId;
  name: string;
  subtitle: string;
  icon: string;
  description: string;
  strengths: string[];
};

export type RpgQuestion = {
  id: string;
  question: string;
  options: {
    label: string;
    scores: RoleScore;
  }[];
};

export type SavedCharacterResult = {
  roleId: RoleId;
  roleName: string;
  icon: string;
  playerName: string;
  isGuest: boolean;
  createdAt: string;
};

export type AtlasFormState = {
  periodName: string;
  name: string;
  leader: string;
  capital: string;
  color: string;
  summary: string;
};

export type SaveState = "idle" | "saving" | "saved" | "error";

export type SharedMapProps = {
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
};

export type CoordEditorProps = {
  year: number;
  feature: AtlasStateFeature | null;
  isEditing: boolean;
  isCreating: boolean;
  addPointMode: boolean;
  draftRing: Array<[number, number]>;
  saveState: SaveState;
  saveError: string | null;
  form: AtlasFormState;
  onFormChange: (field: keyof AtlasFormState, value: string) => void;
  onStartCreate: () => void;
  onCancelCreate: () => void;
  onToggleEditing: () => void;
  onToggleAddPoint: () => void;
  onReset: () => void;
  onSave: () => Promise<void>;
  onDelete: () => Promise<void>;
  selectedVertexIndex: number | null;
  onSelectVertex: (index: number | null) => void;
  onDeleteVertex: (index: number) => void;
};
