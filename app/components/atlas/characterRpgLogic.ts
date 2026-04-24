"use client";

import type { RoleId, RoleScore, SavedCharacterResult } from "./types";
import { CHARACTER_ROLES, CHARACTER_STORAGE_KEY, RPG_QUESTIONS } from "./constants";

export function createBaseScores() {
  const base = {} as Record<RoleId, number>;
  for (const role of CHARACTER_ROLES) base[role.id] = 0;
  return base;
}

export function applyRoleScores(current: Record<RoleId, number>, optionScores: RoleScore) {
  const nextScores = { ...current };
  for (const [roleId, value] of Object.entries(optionScores) as [RoleId, number][]) {
    nextScores[roleId] = (nextScores[roleId] ?? 0) + value;
  }
  return nextScores;
}

export function resolveBestRole(scores: Record<RoleId, number>) {
  return (
    CHARACTER_ROLES.slice().sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0))[0] ??
    CHARACTER_ROLES[0]
  );
}

export function buildSavedCharacter(
  userName: string,
  isGuest: boolean,
  role = CHARACTER_ROLES[0],
): SavedCharacterResult {
  return {
    roleId: role.id,
    roleName: role.name,
    icon: role.icon,
    playerName: userName,
    isGuest,
    createdAt: new Date().toISOString(),
  };
}

export function persistCharacterResult(saved: SavedCharacterResult) {
  try {
    localStorage.setItem(CHARACTER_STORAGE_KEY, JSON.stringify(saved));
  } catch {}
}

export function isFinalQuestion(step: number) {
  return step + 1 >= RPG_QUESTIONS.length;
}
