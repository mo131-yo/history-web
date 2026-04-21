"use client";
// components/admin/FeatureCard.tsx

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  GripVertical,
  RefreshCw,
  Save,
} from "lucide-react";

export interface AdminFeature {
  id: number;
  year: number;
  is_alternate: boolean;
  name: string;
  feature_type: "polygon" | "line" | "point";
  properties: Record<string, any>;
  coordinates: number[][];
  color: string;
}

interface Props {
  feature: AdminFeature;
  onDelete: () => void;
  onEditCoords: () => void;
  onUpdated: (updated: AdminFeature) => void;
}

export default function FeatureCard({
  feature,
  onDelete,
  onEditCoords,
  onUpdated,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: feature.name,
    color: feature.color,
  });
  const [propJson, setPropJson] = useState(
    JSON.stringify(feature.properties, null, 2)
  );
  const [propError, setPropError] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    let parsedProps: Record<string, any>;
    try {
      parsedProps = JSON.parse(propJson);
      setPropError(false);
    } catch {
      setPropError(true);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/features/${feature.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          color: form.color,
          properties: parsedProps,
        }),
      });
      if (res.ok) {
        onUpdated({
          ...feature,
          name: form.name,
          color: form.color,
          properties: parsedProps,
        });
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const propEntries = Object.entries(feature.properties).filter(
    ([k]) => !["id", "name", "color", "feature_type"].includes(k)
  );

  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all ${
        expanded
          ? "border-white/15 bg-[#0f1117]"
          : "border-white/8 bg-[#0d0f1a] hover:border-white/12"
      }`}
    >
      {/* Row */}
      <div className="flex items-center gap-2.5 px-3.5 py-2.5">
        <div
          className="w-3.5 h-3.5 rounded-sm flex-shrink-0 border border-white/20"
          style={{ backgroundColor: feature.color }}
        />
        <span className="text-white/85 font-medium text-sm flex-1 truncate">
          {feature.name}
        </span>
        <span className="text-white/25 text-[10px] uppercase tracking-wider">
          {feature.feature_type}
        </span>
        <span className="text-white/20 text-[10px]">
          {feature.coordinates.length}цэг
        </span>

        {/* Actions */}
        <button
          onClick={onEditCoords}
          title="Координат засах (drag)"
          className="p-1.5 rounded-lg text-blue-400/60 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
        >
          <GripVertical size={13} />
        </button>
        <button
          onClick={() => {
            setExpanded((v) => !v);
            if (!expanded) setEditing(false);
          }}
          className="p-1.5 rounded-lg text-white/25 hover:text-white/70 transition-colors"
        >
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg text-red-400/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-white/5">
          {!editing ? (
            <>
              <div className="mt-3 grid grid-cols-2 gap-1.5">
                {propEntries.slice(0, 6).map(([k, v]) => (
                  <div key={k} className="bg-white/4 rounded-lg p-2">
                    <div className="text-white/35 text-[10px] capitalize mb-0.5">
                      {k}
                    </div>
                    <div className="text-white/70 text-xs leading-snug line-clamp-2">
                      {String(v)}
                    </div>
                  </div>
                ))}
              </div>
              {propEntries.length === 0 && (
                <div className="text-white/20 text-xs mt-3">
                  Properties байхгүй
                </div>
              )}
              <button
                onClick={() => setEditing(true)}
                className="mt-3 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/50 text-xs hover:bg-white/8 transition-colors"
              >
                ✏️ Засах
              </button>
            </>
          ) : (
            <div className="mt-3 space-y-2.5">
              {/* Name */}
              <div>
                <label className="text-white/30 text-[11px]">Нэр</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C5A059]/40"
                />
              </div>

              {/* Color */}
              <div>
                <label className="text-white/30 text-[11px]">Өнгө</label>
                <div className="flex gap-2 mt-1 items-center">
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) =>
                      setForm({ ...form, color: e.target.value })
                    }
                    className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent flex-shrink-0"
                  />
                  <input
                    value={form.color}
                    onChange={(e) =>
                      setForm({ ...form, color: e.target.value })
                    }
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C5A059]/40"
                  />
                </div>
              </div>

              {/* Properties JSON */}
              <div>
                <label className="text-white/30 text-[11px]">
                  Properties (JSON)
                </label>
                <textarea
                  rows={5}
                  value={propJson}
                  onChange={(e) => setPropJson(e.target.value)}
                  className={`w-full mt-1 bg-white/5 border rounded-lg px-3 py-2 text-white text-[11px] font-mono resize-none focus:outline-none ${
                    propError
                      ? "border-red-500/50"
                      : "border-white/10 focus:border-[#C5A059]/40"
                  }`}
                />
                {propError && (
                  <p className="text-red-400 text-[10px] mt-1">
                    JSON формат буруу байна
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    setEditing(false);
                    setPropError(false);
                    setForm({ name: feature.name, color: feature.color });
                    setPropJson(JSON.stringify(feature.properties, null, 2));
                  }}
                  className="px-3 py-1.5 rounded-lg border border-white/10 text-white/40 text-xs hover:bg-white/5"
                >
                  Цуцлах
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-1.5 rounded-lg bg-[#C5A059] text-black font-bold text-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {saving ? (
                    <RefreshCw size={11} className="animate-spin" />
                  ) : (
                    <Save size={11} />
                  )}
                  Хадгалах
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}