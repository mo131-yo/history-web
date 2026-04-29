"use client";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useSyncExternalStore, useState, SetStateAction } from "react";
import { useUser } from "@clerk/nextjs";
import SelectedStateDrawer from "@/app/components/SelectedStateDrawer";
import { Sidebar } from "@/app/components/Sidebar";
import { AtlasCharacterRpgModal } from "./atlas/AtlasCharacterRpgModal";
import { AtlasHeader } from "./atlas/AtlasHeader";
import { MapLoader } from "./atlas/AtlasMapControls";
import { AtlasTimelineFooter } from "./atlas/AtlasTimelineFooter";
import { QuizModal } from "./QuizModal";
import { CHARACTER_STORAGE_KEY, T } from "./atlas/constants";
import { QuizLeaderboardPage } from "./leaderboard/QuizLeaderboardPage";
import { SavedCharacterResult } from "./atlas/types";
import { useAtlasEditor } from "./atlas/useAtlasEditor";

const CoordEditor = dynamic(
  () => import("@/app/components/CoordEditor"),
  { ssr: false }
) as any;

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
  const [mapMode, setMapMode] = useState<"globe" | "historical">("historical");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [characterOpen, setCharacterOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [leaderboardVersion] = useState(0);
  const [currentView, setCurrentView] = useState<"map" | "leaderboard">("map");
  const [timelineAutoPlaying, setTimelineAutoPlaying] = useState(false);
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
    search,
    setSearch,
    setSelectedSlug,
    loadError,
    sharedMapProps,
    coordEditorProps,
  } = useAtlasEditor(year, adminMode);

  useEffect(() => {
    if (!timelineAutoPlaying || currentView !== "map" || years.length < 2) return;

    const timer = window.setInterval(() => {
      setYear((currentYear) => {
        const currentIndex = years.findIndex((timelineYear) => timelineYear === currentYear);
        const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % years.length : 0;
        return years[nextIndex] ?? currentYear;
      });
    }, 1800);

    return () => window.clearInterval(timer);
  }, [currentView, timelineAutoPlaying, years]);

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

<QuizModal
  isOpen={quizOpen}
  mode="grade"
  onClose={() => setQuizOpen(false)}
  userName={user?.fullName ?? undefined}
  onScoreSaved={() => {}}
/>

      <div className="flex min-h-screen flex-col lg:h-screen lg:flex-row lg:overflow-hidden">
        <Sidebar
          year={year}
          search={search}
          onSearchChange={setSearch}
          mapMode={mapMode}
          onMapModeChange={setMapMode}
          onOpenCharacter={() => setCharacterOpen(true)}
          onOpenQuiz={() => setQuizOpen(true)}
          onOpenMap={() => setCurrentView("map")}
          onOpenLeaderboard={() => setCurrentView("leaderboard")}
          onSelectSearchResult={(feature: { properties: { year: SetStateAction<number>; slug: any; }; }) => {
            setCurrentView("map");
            setYear(feature.properties.year);
            setSelectedSlug(feature.properties.slug);
          }}
          currentView={currentView}
          characterResult={characterResult}
          quizEnabled={!!collection?.features.length}
          adminMode={adminMode}
          user={user}
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed((value) => !value)}
        />

        <section className="relative flex min-h-[620px] flex-1 flex-col overflow-hidden md:min-h-[720px] lg:h-screen lg:min-h-0">
          {currentView === "leaderboard" ? (
            <QuizLeaderboardPage
              version={leaderboardVersion}
              onStartQuiz={() => setQuizOpen(true)}
            />
          ) : (
            <>
              <div className="absolute inset-x-0 top-0 bottom-44 z-0 md:bottom-48 lg:bottom-44">
                {mapMode === "globe" && <GlobeMap {...sharedMapProps} />}
                {mapMode === "historical" && <HistoricalMap {...sharedMapProps} />}
              </div>

              <AtlasHeader
                adminMode={adminMode}
                collectionCount={collection?.features.length ?? null}
              />

              {loadError && (
                <div
                  className="absolute left-4 top-16 z-30 flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs lg:left-auto lg:right-4"
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
                className="absolute bottom-44 right-4 top-16 z-20 hidden w-[340px] flex-col xl:flex"
                style={{ pointerEvents: selectedFeature || adminMode ? "auto" : "none" }}
              >
                {drawer}
              </div>

              <AtlasTimelineFooter
                year={year}
                years={years}
                isAutoPlaying={timelineAutoPlaying}
                onAutoToggle={() => setTimelineAutoPlaying((value) => !value)}
                onYearChange={setYear}
              />

              <div className="relative z-10 px-3 pb-4 pt-[calc(100vw*0.62+15rem)] sm:px-4 md:pt-[calc(100vw*0.5+16rem)] lg:pt-[calc(70vh+1rem)] xl:hidden">
                {drawer}
              </div>
            </>
          )}
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
