"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import SelectedStateDrawer from "@/app/components/SelectedStateDrawer";
import { Sidebar } from "@/app/components/Sidebar";
import TimelineSlider from "@/app/components/TimelineSlider";
import type { AtlasFeatureCollection, AtlasStateFeature } from "@/lib/types";
import type CoordEditorType from "@/app/components/CoordEditor";

const CoordEditor = dynamic(() => import("@/app/components/CoordEditor"), {
  ssr: false,
}) as typeof CoordEditorType;

const GlobeMap = dynamic(() => import("@/app/components/Globemap"), {
  ssr: false,
  loading: () => <MapLoader label="Дэлхийн бөмбөрцөг" />,
});

const TacticalMap = dynamic(() => import("@/app/components/Tacticalmap"), {
  ssr: false,
  loading: () => <MapLoader label="Тактикийн зураг" />,
});

const HistoricalMap = dynamic(() => import("@/app/components/HistoricalMap"), {
  ssr: false,
  loading: () => <MapLoader label="Түүхэн зураг" />,
});

function MapLoader({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-5">
        <div className="relative h-16 w-16">
          <div
            className="absolute inset-0 rounded-full animate-spin"
            style={{ border: "2px solid transparent", borderTopColor: "#f59e0b", borderRightColor: "#f59e0b44" }}
          />
          <div
            className="absolute inset-3 rounded-full animate-spin"
            style={{ border: "2px solid transparent", borderTopColor: "#d97706", animationDirection: "reverse", animationDuration: "1.4s" }}
          />
        </div>
        <p className="text-[9px] uppercase tracking-[0.5em]" style={{ color: "#57534e", fontFamily: "Georgia, serif" }}>
          {label} ачаалж байна
        </p>
      </div>
    </div>
  );
}

type MapMode = "globe" | "tactical" | "historical";

const MAP_OPTIONS: { mode: MapMode; label: string; mn: string; icon: string }[] = [
  { mode: "globe",      label: "Globe",    mn: "Бөмбөрцөг",  icon: "🌐" },
  { mode: "tactical",   label: "Tactical", mn: "Тактик",     icon: "⚔" },
  { mode: "historical", label: "Flat Map", mn: "Хавтгай",    icon: "🗺" },
];

function MapSwitcher({
  current,
  onChange,
}: {
  current: MapMode;
  onChange: (m: MapMode) => void;
}) {
  const T = {
    bg: "rgba(2,6,23,0.92)",
    border: "#1e293b",
    amber: "#f59e0b",
    amberDim: "#d97706",
    text: "#e7e5e0",
    muted: "#57534e",
  };

  return (
    <div
      className="pointer-events-auto flex items-center gap-1 rounded-lg p-1"
      style={{
        background: T.bg,
        border: `1px solid ${T.border}`,
        backdropFilter: "blur(12px)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
      }}
    >
      {MAP_OPTIONS.map(({ mode, mn, icon }) => {
        const active = mode === current;
        return (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-all duration-150"
            style={{
              background: active
                ? `linear-gradient(135deg, ${T.amber}22, ${T.amberDim}11)`
                : "transparent",
              border: `1px solid ${active ? T.amber + "55" : "transparent"}`,
              color: active ? T.amber : T.muted,
              fontSize: "10px",
              fontFamily: "Georgia, serif",
              letterSpacing: "0.06em",
              cursor: "pointer",
              boxShadow: active ? `0 0 8px ${T.amber}22` : "none",
              whiteSpace: "nowrap",
            }}
            title={mode}
          >
            <span style={{ fontSize: "11px" }}>{icon}</span>
            <span className="uppercase tracking-widest hidden sm:inline">{mn}</span>
          </button>
        );
      })}
    </div>
  );
}

const T = {
  bg: "#020617",
  border: "#334155",
  amber: "#f59e0b",
  amberDim: "#d97706",
  amberGlow: "#f59e0b33",
  text: "#e7e5e0",
  textSub: "#a8a29e",
  textMuted: "#57534e",
};

export default function AtlasApp() {
  const { user, isLoaded } = useUser();
  const adminMode =
    isLoaded && (user?.publicMetadata as { role?: string } | undefined)?.role === "admin";

  const emptyForm = {
    periodName: "",
    name: "",
    leader: "",
    capital: "",
    color: "#c9a45d",
    summary: "",
  };

  const [mapMode, setMapMode] = useState<MapMode>("globe");

  const [years, setYears] = useState<number[]>([]);
  const [year, setYear] = useState(1206);
  const [collection, setCollection] = useState<AtlasFeatureCollection | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [addPointMode, setAddPointMode] = useState(false);
  const [draftRing, setDraftRing] = useState<Array<[number, number]>>([]);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetch("/api/atlas/years")
      .then((r) => r.json())
      .then((data) => {
        const nextYears = data.years as number[];
        setYears(nextYears);
        if (nextYears.length > 0 && !nextYears.includes(year)) setYear(nextYears[0]);
      })
      .catch(() => setLoadError("Timeline ачаалахад алдаа гарлаа."));
  }, [year]);

  useEffect(() => {
    setLoadError(null);
    fetch(`/api/atlas/states?year=${year}`)
      .then(async (r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data: AtlasFeatureCollection) => {
        setCollection(data);
        setSelectedSlug((cur) => {
          const ok = data.features.some((f) => f.properties.slug === cur);
          return ok ? cur : data.features[0]?.properties.slug ?? null;
        });
        setIsEditing(false);
        setIsCreating(false);
        setAddPointMode(false);
        setSaveState("idle");
        setSaveError(null);
      })
      .catch(() => {
        setCollection(null);
        setSelectedSlug(null);
        setLoadError("Газрын зураг ачаалагдсангүй.");
      });
  }, [year]);

  const selectedFeature = useMemo(
    () => collection?.features.find((f) => f.properties.slug === selectedSlug) ?? null,
    [collection, selectedSlug],
  );

  const filteredFeatures = useMemo(() => {
    if (!collection) return [];
    const q = search.trim().toLowerCase();
    return collection.features.filter(
      (f) =>
        !q ||
        f.properties.name.toLowerCase().includes(q) ||
        f.properties.leader.toLowerCase().includes(q) ||
        f.properties.capital.toLowerCase().includes(q),
    );
  }, [collection, search]);

  useEffect(() => {
    if (!selectedFeature || isCreating) {
      setDraftRing([]);
      return;
    }
    setDraftRing(selectedFeature.geometry.coordinates[0] as Array<[number, number]>);
    setForm({
      periodName: String(selectedFeature.properties.metadata?.periodName ?? ""),
      name: selectedFeature.properties.name,
      leader: selectedFeature.properties.leader,
      capital: selectedFeature.properties.capital,
      color: selectedFeature.properties.color,
      summary: selectedFeature.properties.summary,
    });
    setSaveState("idle");
    setSaveError(null);
  }, [isCreating, selectedFeature]);

  const handleSelectSlug = useCallback((slug: string) => {
    setSelectedSlug(slug);
  }, []);

  function resetCreateMode() {
    setIsCreating(false);
    setIsEditing(false);
    setAddPointMode(false);
    setDraftRing((selectedFeature?.geometry.coordinates[0] as Array<[number, number]>) ?? []);
    setForm(
      selectedFeature
        ? {
            periodName: String(selectedFeature.properties.metadata?.periodName ?? ""),
            name: selectedFeature.properties.name,
            leader: selectedFeature.properties.leader,
            capital: selectedFeature.properties.capital,
            color: selectedFeature.properties.color,
            summary: selectedFeature.properties.summary,
          }
        : emptyForm,
    );
    setSaveState("idle");
    setSaveError(null);
  }

  async function handleSaveGeometry() {
    if (draftRing.length < 4) return;
    if (!form.name || form.name.length < 2) {
      setSaveError("Нэр дор хаяж 2 тэмдэгт байна.");
      setSaveState("error");
      return;
    }
    if (!form.summary || form.summary.length < 8) {
      setSaveError("Тайлбар дор хаяж 8 тэмдэгт байна.");
      setSaveState("error");
      return;
    }
    try {
      setSaveState("saving");
      setSaveError(null);
      if (isCreating) {
        const res = await fetch("/api/atlas/states", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            year,
            name: form.name,
            leader: form.leader,
            capital: form.capital,
            color: form.color,
            summary: form.summary,
            metadata: { periodName: form.periodName },
            coordinates: draftRing,
          }),
        });
        if (!res.ok) {
          const b = await res.json().catch(() => ({}));
          throw new Error((b as { error?: string }).error ?? "create-failed");
        }
        const { feature: cf } = (await res.json()) as { feature: AtlasStateFeature };
        setCollection((c) =>
          c
            ? { ...c, features: [...c.features, cf] }
            : { type: "FeatureCollection", year, features: [cf] },
        );
        setSelectedSlug(cf.properties.slug);
        setIsCreating(false);
        setIsEditing(false);
        setDraftRing(cf.geometry.coordinates[0] as Array<[number, number]>);
        setForm({
          name: cf.properties.name,
          leader: cf.properties.leader,
          capital: cf.properties.capital,
          color: cf.properties.color,
          summary: cf.properties.summary,
          periodName: String(cf.properties.metadata?.periodName ?? ""),
        });
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 1800);
        return;
      }
      if (!selectedFeature) throw new Error("no-feature");
      const res = await fetch(`/api/atlas/states/${selectedFeature.properties.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year,
          name: form.name,
          leader: form.leader,
          capital: form.capital,
          color: form.color,
          summary: form.summary,
          metadata: { ...(selectedFeature.properties.metadata ?? {}), periodName: form.periodName },
          coordinates: draftRing,
        }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error((b as { error?: string }).error ?? "save-failed");
      }
      const { feature: uf } = (await res.json()) as { feature: AtlasStateFeature };
      setCollection((c) =>
        c
          ? { ...c, features: c.features.map((f) => (f.properties.slug === uf.properties.slug ? uf : f)) }
          : c,
      );
      setDraftRing(uf.geometry.coordinates[0] as Array<[number, number]>);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1800);
    } catch (err) {
      setSaveState("error");
      setSaveError(err instanceof Error ? err.message : "Хадгалахад алдаа гарлаа.");
    }
  }

  async function handleDeleteState() {
    if (!selectedFeature || isCreating) return;
    try {
      setSaveState("saving");
      const res = await fetch(
        `/api/atlas/states/${selectedFeature.properties.slug}?year=${year}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error();
      setCollection((c) => {
        if (!c) return c;
        const next = c.features.filter((f) => f.properties.slug !== selectedFeature.properties.slug);
        setSelectedSlug(next[0]?.properties.slug ?? null);
        return { ...c, features: next };
      });
      setDraftRing([]);
      setForm(emptyForm);
      setIsEditing(false);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1800);
    } catch {
      setSaveState("error");
      setSaveError("Устгахад алдаа гарлаа.");
    }
  }

  const sharedMapProps = {
    collection,
    selectedSlug,
    onSelectSlug: handleSelectSlug,
    isEditing: adminMode && isEditing,
    isCreating: adminMode && isCreating,
    addPointMode: adminMode && addPointMode,
    draftRing,
    onDraftRingChange: setDraftRing,
  };

  const coordEditorProps = {
    year,
    feature: selectedFeature,
    isEditing,
    isCreating,
    addPointMode,
    draftRing,
    saveState,
    saveError,
    form,
    onFormChange: (f: "periodName" | "name" | "leader" | "capital" | "color" | "summary", v: string) =>
      setForm((c) => ({ ...c, [f]: v })),
    onStartCreate: () => {
      setSelectedSlug(null);
      setIsCreating(true);
      setIsEditing(true);
      setAddPointMode(false);
      setDraftRing([]);
      setForm(emptyForm);
      setSaveState("idle");
      setSaveError(null);
    },
    onCancelCreate: resetCreateMode,
    onToggleEditing: () => {
      setIsEditing((c) => !c);
      setAddPointMode(false);
      setSaveState("idle");
      setSaveError(null);
    },
    onToggleAddPoint: () => setAddPointMode((c) => !c),
    onReset: () => {
      if (isCreating) { setDraftRing([]); setSaveState("idle"); setSaveError(null); return; }
      if (!selectedFeature) return;
      setDraftRing(selectedFeature.geometry.coordinates[0] as Array<[number, number]>);
      setForm({
        periodName: String(selectedFeature.properties.metadata?.periodName ?? ""),
        name: selectedFeature.properties.name,
        leader: selectedFeature.properties.leader,
        capital: selectedFeature.properties.capital,
        color: selectedFeature.properties.color,
        summary: selectedFeature.properties.summary,
      });
      setSaveState("idle");
      setSaveError(null);
    },
    onSave: handleSaveGeometry,
    onDelete: handleDeleteState,
  };

  return (
    <main
      className="min-h-screen overflow-hidden"
      style={{ background: T.bg, fontFamily: "'Georgia', 'Times New Roman', serif" }}
    >
      <div className="flex min-h-screen flex-col lg:h-screen lg:flex lg:flex-row lg:overflow-hidden">

        <Sidebar
          year={year}
          features={filteredFeatures}
          selectedFeature={selectedFeature}
          onSelectSlug={handleSelectSlug}
          search={search}
          onSearchChange={setSearch}
          adminMode={adminMode}
          user={user}
        />

        <section className="relative flex-1 flex flex-col min-h-[70vh] lg:h-screen lg:min-h-0 overflow-hidden">

          <div className="absolute inset-0 z-0">
            {mapMode === "globe" && <GlobeMap {...sharedMapProps} />}
            {mapMode === "tactical" && <TacticalMap {...sharedMapProps} />}
            {mapMode === "historical" && <HistoricalMap {...sharedMapProps} />}
          </div>

          <div className="relative z-20 pointer-events-none flex justify-between items-start px-4 pt-3 gap-3">

            <div
              className="pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-lg"
              style={{
                background: "rgba(2,6,23,0.88)",
                border: `1px solid ${T.border}`,
                backdropFilter: "blur(12px)",
                boxShadow: `0 4px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)`,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" className="shrink-0">
                <polygon
                  points="9,1 11,6.5 17,6.5 12.2,10.2 14,16 9,12.5 4,16 5.8,10.2 1,6.5 7,6.5"
                  fill={T.amber}
                  opacity="0.85"
                />
              </svg>
              <div>
                <h1 className="text-sm font-bold leading-none" style={{ color: T.amber, letterSpacing: "0.1em", textShadow: `0 0 12px ${T.amberGlow}` }}>
                  МОНГОЛ · ТӨВ АЗИЙН АТЛАС
                </h1>
                <p className="text-[8px] mt-1 tracking-[0.5em]" style={{ color: T.textMuted }}>
                  1162 — 1300 · ДУНДАД ЗУУН
                </p>
              </div>
            </div>

            <div className="pointer-events-auto flex items-center gap-2 flex-wrap justify-end">

              <MapSwitcher current={mapMode} onChange={setMapMode} />

              {adminMode && (
                <div
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] uppercase tracking-widest"
                  style={{
                    background: "rgba(2,6,23,0.88)",
                    border: `1px solid ${T.amber}44`,
                    color: T.amber,
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10">
                    <polygon points="5,0 6.2,3.5 10,3.5 7,5.7 8,9.5 5,7.5 2,9.5 3,5.7 0,3.5 3.8,3.5" fill={T.amber} />
                  </svg>
                  Хаан
                </div>
              )}

              {collection && (
                <div
                  className="px-3 py-2 rounded-lg text-[10px] uppercase tracking-widest"
                  style={{
                    background: "rgba(2,6,23,0.88)",
                    border: `1px solid ${T.border}`,
                    color: T.textSub,
                    backdropFilter: "blur(12px)",
                  }}
                >
                  {collection.features.length} улс
                </div>
              )}
            </div>
          </div>

          {loadError && (
            <div
              className="absolute top-16 left-4 z-30 rounded-lg px-4 py-2.5 text-xs"
              style={{
                background: "rgba(30,5,5,0.95)",
                border: `1px solid #7f1d1d`,
                color: "#fca5a5",
                backdropFilter: "blur(12px)",
              }}
            >
              ⚠ {loadError}
            </div>
          )}

          <div
            className="absolute top-16 right-4 bottom-28 z-20 w-[340px] hidden xl:flex flex-col"
            style={{ pointerEvents: selectedFeature || adminMode ? "auto" : "none" }}
          >
            {adminMode ? (
              <div className="flex-1 overflow-hidden">
                <CoordEditor {...coordEditorProps} />
              </div>
            ) : (
              <SelectedStateDrawer
                year={year}
                feature={selectedFeature}
                onClose={() => setSelectedSlug(null)}
              />
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-4">
            <div
              className="rounded-xl overflow-hidden"
              style={{
                background: "rgba(2,6,23,0.93)",
                border: `1px solid ${T.border}`,
                backdropFilter: "blur(16px)",
                boxShadow: `0 -4px 30px rgba(0,0,0,0.5)`,
              }}
            >
              <div
                className="flex text-[8px] uppercase tracking-[0.3em] px-4 pt-2 pb-1 border-b"
                style={{ borderColor: "#1e293b", color: T.textMuted }}
              >
                {[
                  { label: "Эрт дундад зуун", flex: 2 },
                  { label: "Дунд үе", flex: 3 },
                  { label: "Өндөр дундад зуун", flex: 2 },
                  { label: "Монголын хаант улс", flex: 3 },
                ].map(({ label, flex }) => (
                  <div key={label} className="text-center" style={{ flex }}>{label}</div>
                ))}
              </div>
              <div className="px-4 py-3">
                <TimelineSlider years={years} currentYear={year} onYearChange={setYear} />
              </div>
            </div>
          </div>

          <div className="relative z-10 px-4 pb-4 pt-[calc(70vh+1rem)] xl:hidden">
            {adminMode ? (
              <CoordEditor {...coordEditorProps} />
            ) : (
              <SelectedStateDrawer
                year={year}
                feature={selectedFeature}
                onClose={() => setSelectedSlug(null)}
              />
            )}
          </div>

        </section>
      </div>
    </main>
  );
}