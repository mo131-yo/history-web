"use client";

import type { CSSProperties } from "react";
import { editorTheme } from "./editorStyles";

const { BORDER, INPUT_BG, TEXT_MAIN } = editorTheme;

export const BTN_BASE: CSSProperties = {
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

export const INPUT_STYLE: CSSProperties = {
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

export const FORM_FIELDS = [
  { field: "name", placeholder: "Улсын нэр (2+ тэмдэгт)" },
  { field: "periodName", placeholder: "Тухайн үеийн нэр" },
  { field: "leader", placeholder: "Удирдагч" },
  { field: "capital", placeholder: "Нийслэл" },
] as const;
