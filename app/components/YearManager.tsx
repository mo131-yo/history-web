"use client";
// components/admin/YearManager.tsx
import React, { useState, useEffect } from "react";
import { Plus, Trash2, RefreshCw, Calendar } from "lucide-react";

interface MapYear {
  year: number;
  label: string;
  is_active: boolean;
}

interface Props {
  currentYear: number;
  onSelectYear: (year: number) => void;
}

export default function YearManager({ currentYear, onSelectYear }: Props) {
  const [years, setYears] = useState<MapYear[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newYear, setNewYear] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchYears = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/years");
      if (res.ok) setYears(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchYears(); }, []);

  const handleAdd = async () => {
    const y = parseInt(newYear);
    if (isNaN(y) || y < 1 || y > 2100) return;
    setAdding(true);
    try {
      const res = await fetch("/api/years", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: y, label: newLabel || `${y} он` }),
      });
      if (res.ok) {
        await fetchYears();
        setNewYear("");
        setNewLabel("");
        setShowAdd(false);
      }
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (year: number) => {
    if (!confirm(`${year} оны бүх feature-ийг устгах уу?`)) return;
    await fetch(`/api/years/${year}`, { method: "DELETE" });
    fetchYears();
    if (currentYear === year && years.length > 1) {
      onSelectYear(years.find((y) => y.year !== year)?.year || 1206);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar size={13} className="text-[#C5A059]" />
          <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">Оны удирдлага</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={fetchYears}
            disabled={loading}
            className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors"
          >
            <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShowAdd((v) => !v)}
            className="p-1.5 rounded-lg text-[#C5A059]/70 hover:text-[#C5A059] hover:bg-[#C5A059]/10 transition-colors"
          >
            <Plus size={11} />
          </button>
        </div>
      </div>

      {/* Add year form */}
      {showAdd && (
        <div className="mb-3 bg-white/5 border border-white/10 rounded-xl p-3 space-y-2">
          <div className="flex gap-2">
            <input
              type="number"
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
              placeholder="Он (жишээ: 1227)"
              className="w-28 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-[#C5A059]/50"
            />
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Нэр (заавал биш)"
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-[#C5A059]/50"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAdd(false)}
              className="flex-1 py-1.5 rounded-lg border border-white/10 text-white/30 text-xs hover:bg-white/5"
            >
              Болих
            </button>
            <button
              onClick={handleAdd}
              disabled={adding || !newYear}
              className="flex-1 py-1.5 rounded-lg bg-[#C5A059]/20 border border-[#C5A059]/30 text-[#C5A059] text-xs font-semibold disabled:opacity-40"
            >
              {adding ? "..." : "+ Нэмэх"}
            </button>
          </div>
        </div>
      )}

      {/* Year list */}
      <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
        {years.map((y) => (
          <div
            key={y.year}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all group ${
              currentYear === y.year
                ? "bg-[#C5A059]/15 border border-[#C5A059]/30"
                : "hover:bg-white/5 border border-transparent"
            }`}
            onClick={() => onSelectYear(y.year)}
          >
            <span
              className={`font-bold text-sm tabular-nums ${
                currentYear === y.year ? "text-[#C5A059]" : "text-white/60"
              }`}
            >
              {y.year}
            </span>
            <span className="flex-1 text-white/40 text-xs truncate">{y.label}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(y.year);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded text-red-400/60 hover:text-red-400 transition-all"
            >
              <Trash2 size={11} />
            </button>
          </div>
        ))}
        {years.length === 0 && !loading && (
          <div className="text-center text-white/20 py-4 text-xs">Он байхгүй байна</div>
        )}
      </div>
    </div>
  );
}