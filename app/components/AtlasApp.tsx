"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import HistoricalMap from "@/app/components/HistoricalMap";
import SelectedStateDrawer from "@/app/components/SelectedStateDrawer";
import { Sidebar } from "@/app/components/Sidebar";
import TimelineSlider from "@/app/components/TimelineSlider";
import type { AtlasFeatureCollection, AtlasStateFeature } from "@/lib/types";

const CoordEditor = dynamic(() => import("@/app/components/CoordEditor"), {
  ssr: false,
});

export default function AtlasApp({ adminMode }: { adminMode: boolean }) {
  const emptyForm = {
    periodName: "",
    name: "",
    leader: "",
    capital: "",
    color: "#c9a45d",
    summary: "",
  };
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetch("/api/atlas/years")
      .then((response) => response.json())
      .then((data) => {
        const nextYears = data.years as number[];
        setYears(nextYears);
        if (nextYears.length > 0 && !nextYears.includes(year)) {
          setYear(nextYears[0]);
        }
      })
      .catch(() => {
        setLoadError("Timeline ачаалахад алдаа гарлаа.");
      });
  }, [year]);

  useEffect(() => {
    setLoadError(null);
    fetch(`/api/atlas/states?year=${year}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("load-failed");
        }

        return response.json();
      })
      .then((data: AtlasFeatureCollection) => {
        setCollection(data);
        setSelectedSlug((current) => {
          const stillExists = data.features.some((feature) => feature.properties.slug === current);
          return stillExists ? current : data.features[0]?.properties.slug ?? null;
        });
        setIsEditing(false);
        setIsCreating(false);
        setAddPointMode(false);
        setSaveState("idle");
      })
      .catch(() => {
        setCollection(null);
        setSelectedSlug(null);
        setLoadError("Тухайн оны газрын зураг ачаалагдсангүй.");
      });
  }, [year]);

  const selectedFeature = useMemo(() => {
    return collection?.features.find((feature) => feature.properties.slug === selectedSlug) ?? null;
  }, [collection, selectedSlug]);

  const filteredFeatures = useMemo(() => {
    if (!collection) {
      return [];
    }

    const query = search.trim().toLowerCase();

    return collection.features.filter((feature) => {
      if (!query) {
        return true;
      }

      const properties = feature.properties;
      return (
        properties.name.toLowerCase().includes(query) ||
        properties.leader.toLowerCase().includes(query) ||
        properties.capital.toLowerCase().includes(query)
      );
    });
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
  }, [isCreating, selectedFeature]);

  function resetCreateMode() {
    setIsCreating(false);
    setIsEditing(false);
    setAddPointMode(false);
    setDraftRing(selectedFeature?.geometry.coordinates[0] as Array<[number, number]> ?? []);
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
  }

  async function handleSaveGeometry() {
    if (!adminMode || draftRing.length < 4) {
      return;
    }

    try {
      setSaveState("saving");

      if (isCreating) {
        const response = await fetch("/api/atlas/states", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            year,
            name: form.name,
            leader: form.leader,
            capital: form.capital,
            color: form.color,
            summary: form.summary,
            metadata: {
              periodName: form.periodName,
            },
            coordinates: draftRing,
          }),
        });

        if (!response.ok) {
          throw new Error("create-failed");
        }

        const payload = await response.json();
        const createdFeature = payload.feature as AtlasStateFeature;

        setCollection((current) =>
          current
            ? { ...current, features: [...current.features, createdFeature] }
            : { type: "FeatureCollection", year, features: [createdFeature] },
        );
        setSelectedSlug(createdFeature.properties.slug);
        setIsCreating(false);
        setIsEditing(false);
        setDraftRing(createdFeature.geometry.coordinates[0] as Array<[number, number]>);
        setForm({
          name: createdFeature.properties.name,
          leader: createdFeature.properties.leader,
          capital: createdFeature.properties.capital,
          color: createdFeature.properties.color,
          summary: createdFeature.properties.summary,
          periodName: String(createdFeature.properties.metadata?.periodName ?? ""),
        });
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 1800);
        return;
      }

      if (!selectedFeature) {
        throw new Error("missing-selected-feature");
      }

      const response = await fetch(`/api/atlas/states/${selectedFeature.properties.slug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          year,
          name: form.name,
          leader: form.leader,
          capital: form.capital,
          color: form.color,
          summary: form.summary,
          metadata: {
            ...(selectedFeature.properties.metadata ?? {}),
            periodName: form.periodName,
          },
          coordinates: draftRing,
        }),
      });

      if (!response.ok) {
        throw new Error("save-failed");
      }

      const payload = await response.json();
      const updatedFeature = payload.feature as AtlasStateFeature;

      setCollection((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          features: current.features.map((feature) =>
            feature.properties.slug === updatedFeature.properties.slug ? updatedFeature : feature,
          ),
        };
      });

      setDraftRing(updatedFeature.geometry.coordinates[0] as Array<[number, number]>);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1800);
    } catch {
      setSaveState("error");
    }
  }

  async function handleDeleteState() {
    if (!adminMode || !selectedFeature || isCreating) {
      return;
    }

    try {
      setSaveState("saving");
      const response = await fetch(`/api/atlas/states/${selectedFeature.properties.slug}?year=${year}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("delete-failed");
      }

      setCollection((current) => {
        if (!current) {
          return current;
        }

        const nextFeatures = current.features.filter(
          (feature) => feature.properties.slug !== selectedFeature.properties.slug,
        );
        setSelectedSlug(nextFeatures[0]?.properties.slug ?? null);

        return {
          ...current,
          features: nextFeatures,
        };
      });
      setDraftRing([]);
      setForm(emptyForm);
      setIsEditing(false);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1800);
    } catch {
      setSaveState("error");
    }
  }

  async function handleLogout() {
    if (!adminMode) {
      return;
    }

    await fetch("/admin/api/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <main className="atlas-shell min-h-screen bg-[radial-gradient(circle_at_top,#22304f_0%,#0b1220_42%,#05070d_100%)] text-slate-100">
      <div className="atlas-grid flex min-h-screen flex-col lg:h-screen lg:grid lg:grid-cols-[360px_minmax(0,1fr)] lg:overflow-hidden">
        <Sidebar
          year={year}
          features={filteredFeatures}
          selectedFeature={selectedFeature}
          onSelectSlug={setSelectedSlug}
          search={search}
          onSearchChange={setSearch}
        />

        <section className="relative flex min-h-[60vh] flex-col lg:grid lg:h-screen lg:min-h-0 lg:grid-rows-[minmax(0,1fr)_auto] lg:overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center px-4 pt-4">
            <div className="pointer-events-auto flex w-full max-w-6xl items-center justify-between rounded-full border border-white/10 bg-slate-950/65 px-5 py-3 backdrop-blur-xl">
              <div>
                <h1 className="font-[family:var(--font-cinzel-decorative)] text-xl text-amber-100 md:text-2xl">
                  1162-1300 оны Монгол ба Төв Азийн түүхэн хил
                </h1>
              </div>
              {adminMode ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-200"
                >
                  Admin гарах
                </button>
              ) : null}
            </div>
          </div>

          <div className="flex-1 px-4 pb-3 pt-24 lg:min-h-0">
            <div className="grid h-full gap-4 lg:min-h-0 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/50 shadow-[0_20px_70px_rgba(0,0,0,0.45)]">
                <HistoricalMap
                  collection={collection}
                  selectedSlug={selectedSlug}
                  onSelectSlug={setSelectedSlug}
                  adminMode={adminMode}
                  isEditing={adminMode && isEditing}
                  isCreating={adminMode && isCreating}
                  addPointMode={adminMode && addPointMode}
                  draftRing={draftRing}
                  onDraftRingChange={setDraftRing}
                />

                {loadError ? (
                  <div className="absolute left-4 top-4 rounded-2xl border border-red-500/30 bg-red-950/70 px-4 py-3 text-sm text-red-100">
                    {loadError}
                  </div>
                ) : null}
              </div>

              {adminMode ? (
                <CoordEditor
                  year={year}
                  feature={selectedFeature}
                  isEditing={isEditing}
                  isCreating={isCreating}
                  addPointMode={addPointMode}
                  draftRing={draftRing}
                  saveState={saveState}
                  form={form}
                  onFormChange={(field, value) => setForm((current) => ({ ...current, [field]: value }))}
                  onStartCreate={() => {
                    setSelectedSlug(null);
                    setIsCreating(true);
                    setIsEditing(true);
                    setAddPointMode(false);
                    setDraftRing([]);
                    setForm(emptyForm);
                    setSaveState("idle");
                  }}
                  onCancelCreate={resetCreateMode}
                  onToggleEditing={() => {
                    setIsEditing((current) => !current);
                    setAddPointMode(false);
                    setSaveState("idle");
                  }}
                  onToggleAddPoint={() => setAddPointMode((current) => !current)}
                  onReset={() => {
                    if (isCreating) {
                      setDraftRing([]);
                      setSaveState("idle");
                      return;
                    }

                    if (!selectedFeature) {
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
                  }}
                  onSave={handleSaveGeometry}
                  onDelete={handleDeleteState}
                />
              ) : (
                <SelectedStateDrawer
                  year={year}
                  feature={selectedFeature}
                  onClose={() => setSelectedSlug(null)}
                />
              )}
            </div>
          </div>

          <div className="px-4 pb-4 lg:pt-0">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
              <TimelineSlider years={years} currentYear={year} onYearChange={setYear} />
              <div className="hidden xl:block" aria-hidden="true" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
