"use client";

import type { MapMode } from "./types";

export const MAP_OPTIONS: {
  mode: MapMode;
  label: string;
  mn: string;
  icon: string;
  desc: string;
}[] = [
  { mode: "globe", label: "Globe", mn: "Бөмбөрцөг", icon: "🌐", desc: "Гурван хэмжээст" },
  { mode: "historical", label: "Flat Map", mn: "Хавтгай", icon: "🗺", desc: "Хуучин зураг" },
];
