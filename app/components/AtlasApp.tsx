"use client";

import dynamic from "next/dynamic";
import { useMemo, useSyncExternalStore, useState } from "react";
import { useUser } from "@clerk/nextjs";
import SelectedStateDrawer from "@/app/components/SelectedStateDrawer";
import { Sidebar } from "@/app/components/Sidebar";
import { AtlasCharacterRpgModal } from "./atlas/AtlasCharacterRpgModal";
import { AtlasCharacterSummary } from "./atlas/AtlasCharacterSummary";
import { AtlasHeader } from "./atlas/AtlasHeader";
import { MapLoader } from "./atlas/AtlasMapControls";
import { AtlasTimelineFooter } from "./atlas/AtlasTimelineFooter";
import { CHARACTER_STORAGE_KEY, T } from "./atlas/constants";
import { useAtlasEditor } from "./atlas/useAtlasEditor";
import type { CoordEditorProps, SavedCharacterResult } from "./atlas/types";

const CoordEditor = dynamic<CoordEditorProps>(
  () => import("@/app/components/CoordEditor"),
  { ssr: false }
);

const GlobeMap = dynamic(
  () => import("@/app/components/Globemap").then((m) => ({ default: m.default })),
  { ssr: false, loading: () => <MapLoader label="Дэлхийн бөмбөрцөг" /> }
);

const HistoricalMap = dynamic(
  () => import("@/app/components/HistoricalMap").then((m) => ({ default: m.default })),
  { ssr: false, loading: () => <MapLoader label="Түүхэн зураг" /> }
);

export default function AtlasApp() {
  const { user, isLoaded } = useUser();
  const adminMode = isLoaded && !!user;
  const [year, setYear] = useState(1206);
  const [mapMode, setMapMode] = useState<"globe" | "historical">("globe");
  const [characterOpen, setCharacterOpen] = useState(false);
  const [liveCharacterResult, setLiveCharacterResult] = useState<SavedCharacterResult | null>(null);
  const storedCharacterResultRaw = useSyncExternalStore(
    subscribeCharacterResult,
    readCharacterResultRawSnapshot,
    () => null,
  );
  const storedCharacterResult = useMemo(() => {
    if (!storedCharacterResultRaw) return null;
    try {
      return JSON.parse(storedCharacterResultRaw) as SavedCharacterResult;
    } catch {
      return null;
    }
  }, [storedCharacterResultRaw]);
  const characterResult = liveCharacterResult ?? storedCharacterResult;
  const playerName = user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "Зочин";
  const isGuest = !user;

  const {
    years,
    collection,
    selectedFeature,
    filteredFeatures,
    search,
    setSearch,
    setSelectedSlug,
    loadError,
    sharedMapProps,
    coordEditorProps,
  } = useAtlasEditor(year, adminMode);

  const drawer = adminMode ? (
    <div className="flex-1 overflow-hidden">
      <CoordEditor {...coordEditorProps} />
    </div>
  ) : (
    <SelectedStateDrawer
      year={year}
      feature={selectedFeature}
      onClose={() => setSelectedSlug(null)}
    />
  );

  return (
    <main
      className="min-h-screen overflow-hidden"
      style={{ background: T.bg, fontFamily: "'Georgia', 'Times New Roman', serif" }}
    >
      {characterOpen && (
        <AtlasCharacterRpgModal
          userName={playerName}
          isGuest={isGuest}
          onClose={() => setCharacterOpen(false)}
          onResult={setLiveCharacterResult}
        />
      )}

      <div className="flex min-h-screen flex-col lg:h-screen lg:flex-row lg:overflow-hidden">
        <Sidebar
          year={year}
          features={filteredFeatures}
          selectedFeature={selectedFeature}
          onSelectSlug={setSelectedSlug}
          search={search}
          onSearchChange={setSearch}
          adminMode={adminMode}
          user={user}
        />

        <section className="relative flex min-h-[70vh] flex-1 flex-col overflow-hidden lg:h-screen lg:min-h-0">
          <div className="absolute inset-x-0 top-0 bottom-32 z-0 lg:bottom-36">
            {mapMode === "globe" && <GlobeMap {...sharedMapProps} />}
            {mapMode === "historical" && <HistoricalMap {...sharedMapProps} />}
          </div>

          <AtlasHeader
            mapMode={mapMode}
            onMapModeChange={setMapMode}
            onOpenCharacter={() => setCharacterOpen(true)}
            characterResult={characterResult}
            adminMode={adminMode}
            collectionCount={collection?.features.length ?? null}
          />

          {characterResult && (
            <AtlasCharacterSummary
              result={characterResult}
              onOpen={() => setCharacterOpen(true)}
            />
          )}

          {loadError && (
            <div
              className="absolute left-4 top-16 z-30 flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs"
              style={{
                background: "rgba(20,4,4,0.96)",
                border: "1px solid rgba(150,40,40,0.5)",
                color: "#f08080",
                backdropFilter: "blur(12px)",
                fontFamily: "Georgia, serif",
              }}
            >
              <span style={{ fontSize: 11 }}>⚠</span>
              {loadError}
            </div>
          )}

          <div
            className="absolute bottom-36 right-4 top-16 z-20 hidden w-[340px] flex-col xl:flex"
            style={{ pointerEvents: selectedFeature || adminMode ? "auto" : "none" }}
          >
            {drawer}
          </div>

          <AtlasTimelineFooter year={year} years={years} onYearChange={setYear} />

          <div className="relative z-10 px-4 pb-4 pt-[calc(70vh+1rem)] xl:hidden">{drawer}</div>
        </section>
      </div>
    </main>
  );
}

function subscribeCharacterResult(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handleChange = () => onStoreChange();
  window.addEventListener("storage", handleChange);
  window.addEventListener("focus", handleChange);
  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener("focus", handleChange);
  };
}

function readCharacterResultRawSnapshot(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(CHARACTER_STORAGE_KEY);
  } catch {
    return null;
  }
}
