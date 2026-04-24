"use client";

import { Coins, Compass, Scroll, Shield, Sword, Target, Zap } from "lucide-react";

export const FEATURE_TABS = [
  { id: "info", icon: <Scroll size={14} />, label: "Түүх" },
  { id: "military", icon: <Sword size={14} />, label: "Цэрэг" },
  { id: "stats", icon: <Coins size={14} />, label: "Соёл" },
] as const;

export const FEATURE_STATS = [
  { label: "Засаглал", key: "internal_politics", fallback: "Төвлөрсөн засаглал", icon: <Shield size={12} /> },
  { label: "Эдийн засаг", key: "economy", fallback: "Арилжаа, худалдаа", icon: <Coins size={12} /> },
  { label: "Шашин шүтлэг", key: "religion", fallback: "Тэнгэр шүтлэг", icon: <Compass size={12} /> },
  { label: "Эмзэг тал", key: "vulnerability", fallback: "Дотоод хагарал", icon: <Target size={12} /> },
] as const;

export const FEATURE_ICONS = { Zap, Target };
