"use client";
// components/admin/AIFeatureGenerator.tsx

import React, { useState } from "react";
import {
  Wand2,
  RefreshCw,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
} from "lucide-react";

export interface AIGeneratedFeature {
  name: string;
  color: string;
  feature_type: "polygon" | "line" | "point";
  coordinates: number[][];
  properties: {
    leader?: string;
    capital?: string;
    description?: string;
    era?: string;
    [key: string]: any;
  };
}

interface Props {
  year: number;
  isAlternate: boolean;
  onApprove: (feature: AIGeneratedFeature) => Promise<void>;
}

// OpenAI API proxy дамжуулан дуудах
async function callOpenAI(
  prompt: string,
  year: number
): Promise<AIGeneratedFeature> {
  const systemPrompt = `Та түүхийн газрын зурагт зориулсан GeoJSON feature үүсгэх мэргэжилтэн юм.
Хэрэглэгч ямар нэг улс, бүс нутаг, эсвэл байлдааны шугамыг тодорхойлохыг хүснэ.
Та ЗӨВХӨН JSON объект буцааж өгнө — markdown, тайлбар, нэмэлт текст огт байхгүй.

JSON бүтэц:
{
  "name": "улс/бүсийн монгол нэр",
  "color": "#rrggbb",
  "feature_type": "polygon",
  "coordinates": [[lng, lat], [lng, lat], ...],
  "properties": {
    "leader": "удирдагч",
    "capital": "нийслэл",
    "era": "үе",
    "description": "монгол хэлээр дэлгэрэнгүй тайлбар (3-5 өгүүлбэр)"
  }
}

ЧУХАЛ ДҮРМҮҮД:
- Coordinates нь газарзүйн хувьд зөв байх ёстой (longitude -180..180, latitude -90..90)
- Polygon ЗААВАЛ хаалттай байна: эхний цэг = сүүлийн цэг
- Дор хаяж 8-15 цэг ашиглан нарийвчлалтай polygon үүсгэ
- Өнгийг тухайн улсын шинж чанарт тохируулан сонго
- Он: ${year}`;

  const res = await fetch("/api/openai-proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `${year} оны "${prompt}" үүсгэж өг` },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "";
  return JSON.parse(text);
}

// Diff Viewer
function DiffViewer({
  original,
  updated,
}: {
  original: AIGeneratedFeature | null;
  updated: AIGeneratedFeature;
}) {
  const [showCoords, setShowCoords] = useState(false);

  const fields: { key: keyof AIGeneratedFeature; label: string }[] = [
    { key: "name", label: "Нэр" },
    { key: "color", label: "Өнгө" },
    { key: "feature_type", label: "Төрөл" },
  ];

  const propFields = ["leader", "capital", "era", "description"];

  return (
    <div className="space-y-2 text-xs">
      {fields.map(({ key, label }) => {
        const oldVal = original ? (original as any)[key] : null;
        const newVal = (updated as any)[key];
        const changed = original && oldVal !== newVal;
        return (
          <div key={key} className="flex gap-3 items-start">
            <span className="text-white/30 w-16 flex-shrink-0">{label}</span>
            {changed ? (
              <div className="flex gap-2 flex-1 flex-wrap">
                <span className="line-through text-red-400/60">
                  {String(oldVal)}
                </span>
                <span className="text-emerald-400">→ {String(newVal)}</span>
              </div>
            ) : (
              <span className="text-white/70">{String(newVal)}</span>
            )}
          </div>
        );
      })}

      {propFields.map((k) => {
        const oldVal = original?.properties?.[k];
        const newVal = updated.properties?.[k];
        if (!newVal) return null;
        const changed = original && oldVal !== newVal;
        return (
          <div key={k} className="flex gap-3 items-start">
            <span className="text-white/30 w-16 flex-shrink-0 capitalize">
              {k}
            </span>
            {changed ? (
              <div className="flex flex-col gap-1 flex-1">
                {oldVal && (
                  <span className="line-through text-red-400/60 text-[11px]">
                    {String(oldVal)}
                  </span>
                )}
                <span className="text-emerald-400 text-[11px]">
                  {String(newVal)}
                </span>
              </div>
            ) : (
              <span className="text-white/60 text-[11px] leading-relaxed">
                {String(newVal)}
              </span>
            )}
          </div>
        );
      })}

      <button
        onClick={() => setShowCoords((v) => !v)}
        className="flex items-center gap-1 text-white/30 hover:text-white/60 transition-colors mt-1"
      >
        <Eye size={11} />
        Координатууд ({updated.coordinates.length} цэг)
        {showCoords ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
      </button>

      {showCoords && (
        <div className="bg-black/30 rounded-lg p-2 font-mono text-[10px] text-white/40 max-h-28 overflow-y-auto">
          {updated.coordinates.slice(0, 20).map((c, i) => (
            <div key={i}>
              [{c[0].toFixed(4)}, {c[1].toFixed(4)}]
            </div>
          ))}
          {updated.coordinates.length > 20 && (
            <div className="text-white/20">
              ... {updated.coordinates.length - 20} цэг нэмэлт
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Main Component
export default function AIFeatureGenerator({
  year,
  isAlternate,
  onApprove,
}: Props) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<AIGeneratedFeature | null>(null);
  const [editedDraft, setEditedDraft] = useState<AIGeneratedFeature | null>(
    null
  );
  const [approving, setApproving] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [history, setHistory] = useState<AIGeneratedFeature[]>([]);
  const [revisePrompt, setRevisePrompt] = useState("");

  // Polygon хаалттай болгох helper
  const ensureClosedPolygon = (result: AIGeneratedFeature): AIGeneratedFeature => {
    if (
      result.feature_type === "polygon" &&
      result.coordinates.length >= 3
    ) {
      const first = result.coordinates[0];
      const last = result.coordinates[result.coordinates.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        return {
          ...result,
          coordinates: [...result.coordinates, [...first]],
        };
      }
    }
    return result;
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    try {
      let result = await callOpenAI(prompt, year);
      result = ensureClosedPolygon(result);
      setDraft(result);
      setEditedDraft({ ...result, properties: { ...result.properties } });
      setHistory([]);
    } catch (err: any) {
      setError(`Алдаа: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRevise = async (rPrompt: string) => {
    if (!draft) return;
    setLoading(true);
    setError("");
    try {
      let result = await callOpenAI(
        `Өмнөх feature: ${JSON.stringify(draft)}. Засах хүсэлт: ${rPrompt}`,
        year
      );
      result = ensureClosedPolygon(result);
      setHistory((h) => [draft!, ...h]);
      setDraft(result);
      setEditedDraft({ ...result, properties: { ...result.properties } });
    } catch (err: any) {
      setError(`Алдаа: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!editedDraft) return;
    setApproving(true);
    try {
      await onApprove(editedDraft);
      setDraft(null);
      setEditedDraft(null);
      setPrompt("");
      setHistory([]);
      setError("");
    } catch {
      setError("DB-д хадгалахад алдаа гарлаа");
    } finally {
      setApproving(false);
    }
  };

  const handleReject = () => {
    setDraft(null);
    setEditedDraft(null);
    setHistory([]);
    setError("");
  };

  return (
    <div className="space-y-3">
      {/* Generate input — draft байхгүй үед */}
      {!draft && (
        <>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) handleGenerate();
            }}
            placeholder={`Жишээ: "1206 оны Сун улс өмнөд Хятадад, улаан өнгөтэй" эсвэл "Монголчуудын Хорезм руу довтолсон шугам"`}
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 resize-none focus:outline-none focus:border-[#C5A059]/50 transition-colors"
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full py-2.5 rounded-xl bg-[#C5A059]/15 border border-[#C5A059]/30 text-[#C5A059] font-semibold text-sm hover:bg-[#C5A059]/25 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Үүсгэж байна...
              </>
            ) : (
              <>
                <Wand2 size={14} />
                OpenAI-аар үүсгэх (Ctrl+Enter)
              </>
            )}
          </button>
          {error && (
            <p className="text-red-400 text-xs bg-red-400/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </>
      )}

      {/* Draft review */}
      {draft && editedDraft && (
        <div className="bg-[#0a0d15] border border-[#C5A059]/20 rounded-xl overflow-hidden">
          {/* Draft header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#C5A059]/5">
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-[#C5A059] font-semibold text-sm">
              AI үүсгэсэн — Шалгаж батлана уу
            </span>
            {history.length > 0 && (
              <span className="ml-auto text-white/30 text-xs">
                {history.length} хувилбар
              </span>
            )}
          </div>

          {/* Color + name */}
          <div className="flex items-center gap-3 px-4 pt-3">
            <div
              className="w-5 h-5 rounded border border-white/20 flex-shrink-0"
              style={{ backgroundColor: editedDraft.color }}
            />
            <span className="text-white font-bold text-sm">
              {editedDraft.name}
            </span>
          </div>

          {/* Diff viewer */}
          <div className="px-4 py-3">
            <DiffViewer original={history[0] || null} updated={editedDraft} />
          </div>

          {/* Edit mode toggle */}
          <div className="px-4 pb-3">
            <button
              onClick={() => setShowEdit((v) => !v)}
              className="text-white/30 text-xs hover:text-white/60 transition-colors flex items-center gap-1"
            >
              ✏️ Гараар засах{" "}
              {showEdit ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>

            {showEdit && (
              <div className="mt-2 space-y-2">
                <div>
                  <label className="text-white/30 text-[11px]">Нэр</label>
                  <input
                    value={editedDraft.name}
                    onChange={(e) =>
                      setEditedDraft({ ...editedDraft, name: e.target.value })
                    }
                    className="w-full mt-0.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none"
                  />
                </div>
                <div className="flex gap-2 items-center">
                  <label className="text-white/30 text-[11px]">Өнгө</label>
                  <input
                    type="color"
                    value={editedDraft.color}
                    onChange={(e) =>
                      setEditedDraft({ ...editedDraft, color: e.target.value })
                    }
                    className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    value={editedDraft.color}
                    onChange={(e) =>
                      setEditedDraft({ ...editedDraft, color: e.target.value })
                    }
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-white/30 text-[11px]">Тайлбар</label>
                  <textarea
                    rows={3}
                    value={editedDraft.properties.description || ""}
                    onChange={(e) =>
                      setEditedDraft({
                        ...editedDraft,
                        properties: {
                          ...editedDraft.properties,
                          description: e.target.value,
                        },
                      })
                    }
                    className="w-full mt-0.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs resize-none focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Revise input */}
          <div className="px-4 pb-3 flex gap-2">
            <input
              value={revisePrompt}
              onChange={(e) => setRevisePrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && revisePrompt.trim()) {
                  handleRevise(revisePrompt);
                  setRevisePrompt("");
                }
              }}
              placeholder="Засах хүсэлт... (Enter)"
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs placeholder-white/20 focus:outline-none focus:border-[#C5A059]/40"
            />
            <button
              disabled={loading || !revisePrompt.trim()}
              onClick={() => {
                handleRevise(revisePrompt);
                setRevisePrompt("");
              }}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/50 text-xs hover:bg-white/10 disabled:opacity-30"
            >
              {loading ? (
                <RefreshCw size={11} className="animate-spin" />
              ) : (
                "↻ Дахин"
              )}
            </button>
          </div>

          {/* Approve / Reject */}
          <div className="flex border-t border-white/5">
            <button
              onClick={handleReject}
              className="flex-1 py-3 flex items-center justify-center gap-2 text-red-400/70 text-sm hover:bg-red-500/5 transition-colors"
            >
              <X size={14} /> Татгалзах
            </button>
            <div className="w-px bg-white/5" />
            <button
              onClick={handleApprove}
              disabled={approving}
              className="flex-1 py-3 flex items-center justify-center gap-2 text-emerald-400 font-semibold text-sm hover:bg-emerald-500/10 transition-colors disabled:opacity-40"
            >
              {approving ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Check size={14} />
              )}
              DB-д батлан хадгалах
            </button>
          </div>
        </div>
      )}

      {error && draft && (  
        <p className="text-red-400 text-xs bg-red-400/10 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}