"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useUser } from "@clerk/nextjs";
import { Check, ChevronDown, ChevronUp, Crown, Loader2, MapPin, Plus, RotateCcw, Scroll, Send, Sparkles, Star, Swords, X } from "lucide-react";
import type { AtlasStateFeature } from "@/lib/types";
import { normalizeClosedRing } from "@/lib/geometry";
import { SelectedStateMarkdown } from "./atlas/SelectedStateMarkdown";
import { selectedStateTheme as T } from "./atlas/selectedStateTheme";
import { useStateInsight } from "./atlas/useStateInsight";

type StateFeedback = {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  status?: string;
  proposedGeometry?: GeoJSON.Polygon | null;
  createdAt: string;
};

type FeedbackEditorState = {
  isEditing: boolean;
  addPointMode: boolean;
  draftRing: Array<[number, number]>;
  onDraftRingChange: (ring: Array<[number, number]>) => void;
  selectedVertexIndex: number | null;
  onSelectVertex: (index: number | null) => void;
  onStart: () => void;
  onStop: () => void;
  onToggleAddPoint: () => void;
  onReset: () => void;
};

function Divider() {
  return (
    <div className="my-2.5 flex items-center gap-2">
      <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${T.border})` }} />
      <div className="h-1 w-1 rounded-full" style={{ background: T.amberDim, opacity: 0.5 }} />
      <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${T.border}, transparent)` }} />
    </div>
  );
}

export default function SelectedStateDrawer({
  year,
  feature,
  adminMode = false,
  onClose,
  feedbackEditor,
}: {
  year: number;
  feature: AtlasStateFeature | null;
  adminMode?: boolean;
  onClose: () => void;
  feedbackEditor?: FeedbackEditorState;
}) {
  const { insight, insightLoading, insightError } = useStateInsight(year, feature);
  const { user } = useUser();
  const userName = user?.fullName ?? user?.username ?? user?.primaryEmailAddress?.emailAddress ?? "Зочин";
  const [insightExpanded, setInsightExpanded] = useState(false);

  useEffect(() => {
    setInsightExpanded(false);
  }, [feature?.properties.slug, year]);

  if (!feature) {
    return (
      <div
        className="hidden h-full items-center justify-center rounded-[35px] md:flex"
        style={{
          background: T.bg,
          border: `1px solid ${T.border}`,
          boxShadow: "0 0 40px rgba(0,0,0,0.18), inset 0 0 40px rgba(12,96,169,0.02)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="px-8 text-center">
          <Scroll className="mx-auto mb-3 opacity-15" size={28} style={{ color: T.amber }} />
          <p className="text-xs uppercase tracking-widest" style={{ color: T.textMuted, fontFamily: "var(--font-inter), Arial, sans-serif" }}>
            Нутаг дэвсгэр сонгоно уу
          </p>
        </div>
      </div>
    );
  }

  const color = feature.properties.color ?? "#0c60a9";

  return (
    <div className="h-full">
      <div className="flex h-full flex-col overflow-hidden rounded-2xl" style={{ background: T.bg, border: `1px solid ${T.border}`, boxShadow: "0 0 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)", backdropFilter: "blur(16px)", fontFamily: "var(--font-inter), Arial, sans-serif" }}>
        <div className="h-0.5 shrink-0" style={{background: 'linear-gradient(90deg, transparent, rgb(12, 96, 169), transparent)'}}/>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-1 flex items-start justify-between gap-3">
            <div>
              <p className="mb-2 text-[8px] uppercase tracking-[0.5em]" style={{ color: T.textMuted }}>Сонгосон нутаг</p>
              <h3 className="text-lg font-bold leading-tight" style={{ color: T.amber }}>{feature.properties.name}</h3>
              {feature.properties.metadata?.periodName && (
                <p className="mt-0.5 text-xs italic" style={{ color: T.textSub }}>«{String(feature.properties.metadata.periodName)}»</p>
              )}
            </div>
            <button type="button" onClick={onClose} className="shrink-0 rounded-md p-1.5 transition-opacity hover:opacity-60" style={{ border: `2px solid ${T.border}`, color: T.textMuted }}>
              <X className="size-3.5" />
            </button>
          </div>

          <Divider />

          <div className="mb-3 grid gap-1.5">
            {[
              { Icon: Crown, label: "Удирдагч", value: feature.properties.leader },
              { Icon: MapPin, label: "Нийслэл", value: feature.properties.capital },
              { Icon: Swords, label: "Он", value: `${year} он` },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 rounded-lg px-3 py-2" style={{ background: "rgba(12,96,169,0.04)", border: `1px solid ${T.border}` }}>
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md" style={{ background: T.amberGlow, border: `1px solid ${T.amber}22` }}>
                  <Icon className="size-4" style={{ color: T.amberDim }} />
                </div>
                <span className="w-14 shrink-0 text-[9px] uppercase tracking-[0.2em]" style={{ color: T.textMuted }}>{label}</span>
                <span className="truncate text-xs font-medium" style={{ color: T.text }}>{value}</span>
              </div>
            ))}
          </div>

          <Divider />

          <div className="mb-3 rounded-lg px-4 py-3" style={{ background: "rgba(12,96,169,0.04)", border: `1px solid ${T.border}`, borderLeft: `3px solid ${color}66` }}>
            <p className="mb-2 text-[9px] uppercase tracking-[0.3em]" style={{ color: T.textMuted }}>Товч түүх</p>
            <p className="text-xs leading-relaxed" style={{ color: T.text }}>{feature.properties.summary}</p>
          </div>

          <div className="rounded-lg px-4 py-3" style={{ background: "rgba(12,96,169,0.035)", border: `1px solid ${T.border}` }}>
            <div className="mb-2.5 flex items-center gap-2">
              <Sparkles className="size-4" style={{ color: T.amberDim }} />
              <p className="text-[12px] uppercase tracking-[0.2em]" style={{ color: T.textMuted }}>Түүхч тайлбар</p>
            </div>

            {insightLoading ? (
              <div className="flex items-center gap-2 py-3" style={{ color: T.textSub }}>
                <Loader2 className="size-3 animate-spin" />
                <span className="text-xs">Уншиж байна…</span>
              </div>
            ) : insightError ? (
              <p className="py-2 text-xs" style={{ color: "#dc2626" }}>{insightError}</p>
            ) : (
              <>
                <div className="relative">
                  <div className={insightExpanded ? "" : "max-h-36 overflow-hidden"}>
                    <SelectedStateMarkdown text={insight} />
                  </div>
                  {!insightExpanded && (
                    <div
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-10"
                      style={{ background: "linear-gradient(180deg, rgba(252,252,252,0), rgba(252,252,252,0.96))" }}
                    />
                  )}
                </div>
                {insight && (
                  <button
                    type="button"
                    onClick={() => setInsightExpanded((value) => !value)}
                    className="mt-2 flex h-8 w-full items-center justify-center gap-1 rounded-md text-[10px] font-semibold transition hover:opacity-80"
                    style={{ border: `1px solid ${T.border}`, color: T.amber, background: "rgba(12,96,169,0.08)" }}
                  >
                    {insightExpanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-5" />}
                    {insightExpanded ? "Хураах" : "Дэлгэрэнгүй унших"}
                  </button>
                )}
              </>
            )}
          </div>

          <StateFeedbackPanel
            adminMode={adminMode}
            feature={feature}
            userName={userName}
            year={year}
            feedbackEditor={feedbackEditor}
          />

          <p className="mt-3 text-right text-[8px]" style={{ color: T.textMuted }}>
            {new Date(feature.properties.updatedAt).toLocaleDateString("mn-MN")}
          </p>
        </div>
      </div>
    </div>
  );
}

function StateFeedbackPanel({
  adminMode,
  feature,
  userName,
  year,
  feedbackEditor,
}: {
  adminMode: boolean;
  feature: AtlasStateFeature;
  userName: string;
  year: number;
  feedbackEditor?: FeedbackEditorState;
}) {
  const [feedback, setFeedback] = useState<StateFeedback[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [includeCoordinates, setIncludeCoordinates] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const slug = feature.properties.slug;
  const stateName = feature.properties.name;
  const currentCoordinates = feature.geometry.coordinates[0] ?? [];

  const averageRating = useMemo(() => {
    if (feedback.length === 0) return null;
    const total = feedback.reduce((sum, item) => sum + item.rating, 0);
    return (total / feedback.length).toFixed(1);
  }, [feedback]);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    setError(null);

    fetch(`/api/atlas/feedback?slug=${encodeURIComponent(slug)}&year=${year}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Feedback load failed");
        return response.json() as Promise<{ feedback?: StateFeedback[] }>;
      })
      .then((data) => {
        setFeedback(data.feedback ?? []);
        setStatus("idle");
      })
      .catch((loadError) => {
        if (loadError instanceof DOMException && loadError.name === "AbortError") return;
        setFeedback([]);
        setStatus("error");
        setError("Feedback ачаалахад алдаа гарлаа.");
      });

    return () => controller.abort();
  }, [slug, year]);

  useEffect(() => {
    setIncludeCoordinates(false);
    feedbackEditor?.onStop();
  }, [currentCoordinates, slug, year]);

  function handleCoordinateToggle(checked: boolean) {
    setIncludeCoordinates(checked);
    setError(null);
    if (checked) feedbackEditor?.onStart();
    else feedbackEditor?.onStop();
  }

  async function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedComment = comment.trim();
    if (trimmedComment.length < 2) {
      setError("Сэтгэгдлээ 2-оос дээш тэмдэгтээр бичнэ үү.");
      return;
    }

    let proposedCoordinates: Array<[number, number]> | undefined;
    if (includeCoordinates) {
      const draftRing = feedbackEditor?.draftRing ?? [];
      if (draftRing.length < 4) {
        setError("Газрын зураг дээр дор хаяж 3 цэгтэй хил зурна уу.");
        return;
      }
      proposedCoordinates = normalizeClosedRing(draftRing);
    }

    setStatus("saving");
    setError(null);

    try {
      const response = await fetch("/api/atlas/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          year,
          stateName,
          userName,
          rating,
          comment: trimmedComment,
          proposedCoordinates,
        }),
      });

      if (!response.ok) throw new Error("Feedback save failed");
      const data = (await response.json()) as { feedback?: StateFeedback };
      if (data.feedback) setFeedback((current) => [data.feedback!, ...current]);
      setComment("");
      setIncludeCoordinates(false);
      feedbackEditor?.onStop();
      setRating(5);
      setStatus("saved");
    } catch {
      setStatus("error");
      setError("Feedback хадгалахад алдаа гарлаа.");
    }
  }

  async function reviewFeedback(id: string, action: "approve" | "reject") {
    setError(null);
    const response = await fetch("/api/atlas/feedback", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });

    if (!response.ok) {
      setError("Coordinate feedback шалгахад алдаа гарлаа.");
      return;
    }

    setFeedback((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, status: action === "approve" ? "approved" : "rejected" }
          : item,
      ),
    );
  }

  return (
    <div className="mt-3 rounded-lg px-4 py-3" style={{ background: "rgba(12,96,169,0.035)", border: `1px solid ${T.border}` }}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: T.textMuted }}>User feedback</p>
          <p className="mt-1 text-xs" style={{ color: T.textSub }}>
            {averageRating ? `${averageRating}/5 · ${feedback.length} санал` : "Анхны feedback-ээ үлдээгээрэй"}
          </p>
        </div>
        <div className="flex items-center gap-0.5" aria-label={`${rating} од`}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className="rounded p-0.5 transition hover:scale-110"
              style={{ color: value <= rating ? "#f59e0b" : "#cbd5e1" }}
              aria-label={`${value} од`}
            >
              <Star className="size-4" fill={value <= rating ? "currentColor" : "none"} />
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={submitFeedback} className="grid gap-2">
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={3}
          maxLength={700}
          placeholder={`${stateName} дээр feedback бичих`}
          className="w-full resize-none rounded-lg px-3 py-2 text-xs outline-none transition focus:border-amber-500/50"
          style={{
            background: "#ffffff",
            border: `1px solid ${T.border}`,
            color: T.text,
            fontFamily: "var(--font-inter), Arial, sans-serif",
          }}
        />
        <label className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition hover:opacity-90" style={{ background: includeCoordinates ? "rgba(12,96,169,0.10)" : "rgba(12,96,169,0.04)", border: `1px solid ${includeCoordinates ? `${T.amber}55` : T.border}`, color: includeCoordinates ? T.amber : T.textSub }}>
          <input
            type="checkbox"
            checked={includeCoordinates}
            onChange={(event) => handleCoordinateToggle(event.target.checked)}
            className="size-3 accent-green-600"
          />
          Засах санал болгох
        </label>
        {includeCoordinates && (
          <div className="grid gap-2 rounded-lg px-3 py-2" style={{ background: "#ffffff", border: `1px solid ${T.border}` }}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px]" style={{ color: T.textSub }}>
                {feedbackEditor?.draftRing.length ?? 0} цэг · цэгийг чирж засна, double click хийж устгана
              </span>
              <button
                type="button"
                onClick={feedbackEditor?.onReset}
                className="flex h-7 items-center gap-1 rounded-md px-2 text-[10px] font-semibold transition hover:opacity-80"
                style={{ border: `1px solid ${T.border}`, color: T.textSub }}
              >
                <RotateCcw className="size-3" />
                Reset
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={feedbackEditor?.onStart}
                className="flex h-8 items-center justify-center gap-1 rounded-md text-[10px] font-semibold"
                style={{ background: "rgba(12,96,169,0.10)", border: `1px solid ${T.amber}44`, color: T.amber }}
              >
                <MapPin className="size-3" />
                Засах горим
              </button>
              <button
                type="button"
                onClick={feedbackEditor?.onToggleAddPoint}
                className="flex h-8 items-center justify-center gap-1 rounded-md text-[10px] font-semibold"
                style={{
                  background: feedbackEditor?.addPointMode ? "rgba(34,197,94,0.12)" : "rgba(12,96,169,0.04)",
                  border: feedbackEditor?.addPointMode ? "1px solid rgba(34,197,94,0.45)" : `1px solid ${T.border}`,
                  color: feedbackEditor?.addPointMode ? "#15803d" : T.textSub,
                }}
              >
                <Plus className="size-3" />
                Цэг нэмэх
              </button>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px]" style={{ color: error ? "#dc2626" : T.textMuted }}>
            {error ?? (status === "saved" ? "Feedback хадгаллаа." : `${comment.length}/700`)}
          </span>
          <button
            type="submit"
            disabled={status === "saving"}
            className="flex h-8 items-center gap-2 rounded-lg px-3 text-xs font-semibold transition disabled:opacity-55"
            style={{
              background: "rgba(12,96,169,0.10)",
              border: `1px solid ${T.amber}44`,
              color: T.amber,
            }}
          >
            {status === "saving" ? <Loader2 className="size-3 animate-spin" /> : <Send className="size-3" />}
            Илгээх
          </button>
        </div>
      </form>

      {status === "loading" ? (
        <div className="mt-3 flex items-center gap-2 text-xs" style={{ color: T.textSub }}>
          <Loader2 className="size-3 animate-spin" />
          Feedback уншиж байна...
        </div>
      ) : feedback.length > 0 ? (
        <div className="mt-3 grid gap-2">
          {feedback.slice(0, 3).map((item) => (
            <div key={item.id} className="rounded-lg px-3 py-2" style={{ background: "#ffffff", border: `1px solid ${T.border}` }}>
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="truncate text-xs font-semibold" style={{ color: T.text }}>{item.userName}</span>
                <span className="flex items-center gap-1 text-[10px]" style={{ color: "#f59e0b" }}>
                  <Star className="size-3" fill="currentColor" />
                  {item.rating}/5
                </span>
              </div>
              <p className="line-clamp-3 text-xs leading-5" style={{ color: T.textSub }}>{item.comment}</p>
              {adminMode && item.proposedGeometry && (
                <div className="mt-2 rounded-md p-2" style={{ background: "rgba(12,96,169,0.04)", border: `1px solid ${T.border}` }}>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold" style={{ color: T.amber }}>
                      Coordinate санал · {item.status ?? "pending"}
                    </span>
                    <span className="text-[10px]" style={{ color: T.textMuted }}>
                      {item.proposedGeometry.coordinates[0]?.length ?? 0} цэг
                    </span>
                  </div>
                  <pre className="max-h-28 overflow-auto rounded bg-transparent p-0 text-[9px] leading-4" style={{ color: T.textSub }}>
                    {JSON.stringify(item.proposedGeometry.coordinates[0] ?? [], null, 2)}
                  </pre>
                  {item.status === "pending" && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => reviewFeedback(item.id, "approve")}
                        className="flex h-8 items-center justify-center gap-1 rounded-md text-[10px] font-semibold"
                        style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.35)", color: "#15803d" }}
                      >
                        <Check className="size-3" />
                        DB рүү зөвшөөрөх
                      </button>
                      <button
                        type="button"
                        onClick={() => reviewFeedback(item.id, "reject")}
                        className="flex h-8 items-center justify-center rounded-md text-[10px] font-semibold"
                        style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.35)", color: "#dc2626" }}
                      >
                        Буруу
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
