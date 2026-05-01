'use client';
import dynamic from 'next/dynamic';
import {
  useEffect,
  useMemo,
  useSyncExternalStore,
  useState,
  type SetStateAction,
} from 'react';
import { useUser } from '@clerk/nextjs';
import type { AtlasEventFeatureCollection, AtlasStateFeature } from '@/lib/types';
import SelectedStateDrawer from '@/app/components/SelectedStateDrawer';
import { AtlasEventDrawer } from '@/app/components/AtlasEventDrawer';
import { AdminFeedbackNotice, Sidebar } from '@/app/components/Sidebar';
import { AtlasCharacterRpgModal } from './atlas/AtlasCharacterRpgModal';
import { AtlasHeader } from './atlas/AtlasHeader';
import { AtlasLayerToggle } from './atlas/AtlasLayerToggle';
import { MapLoader } from './atlas/AtlasMapControls';
import { AtlasTimelineFooter } from './atlas/AtlasTimelineFooter';
import { QuizModal, type QuizMode } from './QuizModal';
import { CHARACTER_STORAGE_KEY, T } from './atlas/constants';
import { QuizLeaderboardPage } from './leaderboard/QuizLeaderboardPage';
import type { AtlasLayerVisibility, SavedCharacterResult } from './atlas/types';
import { useAtlasEditor } from './atlas/useAtlasEditor';
import { ensureEditableRing } from '@/lib/geometry';

type PendingFeedbackPreview = {
  id: string;
  slug: string;
  year: number;
  stateName: string;
  proposedGeometry?: GeoJSON.Polygon | null;
};

async function reviewFeedbackWithDraft(
  id: string,
  draftRing: Array<[number, number]>,
) {
  const response = await fetch('/api/atlas/feedback', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id,
      action: 'approve',
      proposedCoordinates: draftRing,
    }),
  });

  if (!response.ok) throw new Error('Feedback approve failed');

  const data = (await response.json()) as {
    feature?: AtlasStateFeature | null;
  };

  return data.feature ?? null;
}

const CoordEditor = dynamic(() => import('@/app/components/CoordEditor'), {
  ssr: false,
}) as any;

const GlobeMap = dynamic(
  () =>
    import('@/app/components/Globemap').then((m) => ({ default: m.default })),
  { ssr: false, loading: () => <MapLoader label="Дэлхийн бөмбөрцөг" /> },
);

const HistoricalMap = dynamic(
  () =>
    import('@/app/components/HistoricalMap').then((m) => ({
      default: m.default,
    })),
  { ssr: false, loading: () => <MapLoader label="Түүхэн зураг" /> },
);

const LineageTree = dynamic(
  () =>
    import('@/app/components/lineage/LineageTree').then((m) => ({
      default: m.default,
    })),
  { ssr: false, loading: () => <MapLoader label="Алтан Ураг" /> },
);

export default function AtlasApp() {
  const { user, isLoaded } = useUser();
  const adminMode = isLoaded && !!user;
  const [year, setYear] = useState(1206);
  const [mapMode, setMapMode] = useState<'globe' | 'historical'>('historical');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [characterOpen, setCharacterOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizMode, setQuizMode] = useState<QuizMode>('grade');
  const [leaderboardVersion, setLeaderboardVersion] = useState(0);
  const [currentView, setCurrentView] = useState<
    'map' | 'leaderboard' | 'lineage'
  >('map');
  const [timelineAutoPlaying, setTimelineAutoPlaying] = useState(false);
  const [liveCharacterResult, setLiveCharacterResult] =
    useState<SavedCharacterResult | null>(null);
  const [pendingFeedbackCount, setPendingFeedbackCount] = useState(0);
  const [battleEvents, setBattleEvents] =
    useState<AtlasEventFeatureCollection | null>(null);
  const [selectedEventSlug, setSelectedEventSlug] = useState<string | null>(
    null,
  );
  const [layerVisibility, setLayerVisibility] = useState<AtlasLayerVisibility>({
    states: true,
    labels: true,
    capitals: true,
    battles: true,
  });
  const [feedbackEditing, setFeedbackEditing] = useState(false);
  const [feedbackAddPointMode, setFeedbackAddPointMode] = useState(false);
  const [feedbackDraftRing, setFeedbackDraftRing] = useState<
    Array<[number, number]>
  >([]);
  const [feedbackPreviewRing, setFeedbackPreviewRing] = useState<
    Array<[number, number]>
  >([]);
  const [feedbackSelectedVertexIndex, setFeedbackSelectedVertexIndex] =
    useState<number | null>(null);
  const [reviewingFeedbackId, setReviewingFeedbackId] = useState<string | null>(
    null,
  );
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
  const playerName =
    user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? 'Зочин';
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
    applyFeatureUpdate,
  } = useAtlasEditor(year, adminMode);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/atlas-events?year=${year}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Event fetch failed');
        return response.json() as Promise<AtlasEventFeatureCollection>;
      })
      .then((data) => setBattleEvents(data))
      .catch((error) => {
        if (error instanceof DOMException && error.name === 'AbortError')
          return;
        setBattleEvents({
          type: 'FeatureCollection',
          year,
          features: [],
        });
      });

    return () => controller.abort();
  }, [year]);

  useEffect(() => {
    setSelectedEventSlug((current) => {
      if (!current) return null;
      const exists = battleEvents?.features.some(
        (feature) => feature.properties.slug === current,
      );
      return exists ? current : null;
    });
  }, [battleEvents, year]);

  useEffect(() => {
    if (reviewingFeedbackId) return;

    const coordinates = selectedFeature?.geometry.coordinates[0] as
      | Array<[number, number]>
      | undefined;
    setFeedbackEditing(false);
    setFeedbackAddPointMode(false);
    setFeedbackSelectedVertexIndex(null);
    setFeedbackDraftRing(coordinates ? ensureEditableRing(coordinates) : []);
    setFeedbackPreviewRing([]);
  }, [reviewingFeedbackId, selectedFeature?.properties.slug, year]);

  useEffect(() => {
    if (!timelineAutoPlaying || currentView !== 'map' || years.length < 2)
      return;

    const timer = window.setInterval(() => {
      setYear((currentYear) => {
        const currentIndex = years.findIndex(
          (timelineYear) => timelineYear === currentYear,
        );
        const nextIndex =
          currentIndex >= 0 ? (currentIndex + 1) % years.length : 0;
        return years[nextIndex] ?? currentYear;
      });
    }, 1800);

    return () => window.clearInterval(timer);
  }, [currentView, timelineAutoPlaying, years]);

  useEffect(() => {
    if (!adminMode) {
      setPendingFeedbackCount(0);
      return;
    }

    const controller = new AbortController();
    const loadPendingFeedbackCount = () => {
      fetch('/api/atlas/feedback?status=pending', { signal: controller.signal })
        .then((response) => {
          if (!response.ok) throw new Error('Feedback notification failed');
          return response.json() as Promise<{ count?: number }>;
        })
        .then((data) => setPendingFeedbackCount(data.count ?? 0))
        .catch((error) => {
          if (error instanceof DOMException && error.name === 'AbortError')
            return;
          setPendingFeedbackCount(0);
        });
    };

    loadPendingFeedbackCount();
    const timer = window.setInterval(loadPendingFeedbackCount, 30000);

    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, [adminMode, selectedFeature?.properties.slug, year]);

  const drawer = adminMode ? (
      <CoordEditor {...coordEditorProps} />
  ) : (
    <SelectedStateDrawer
      year={year}
      feature={selectedFeature}
      adminMode={adminMode}
      onClose={() => setSelectedSlug(null)}
      feedbackEditor={{
        isEditing: feedbackEditing,
        addPointMode: feedbackAddPointMode,
        draftRing: feedbackDraftRing,
        onDraftRingChange: setFeedbackDraftRing,
        selectedVertexIndex: feedbackSelectedVertexIndex,
        onSelectVertex: setFeedbackSelectedVertexIndex,
        onStart: () => {
          const coordinates = selectedFeature?.geometry.coordinates[0] as
            | Array<[number, number]>
            | undefined;
          setFeedbackDraftRing((current) =>
            current.length
              ? current
              : coordinates
                ? ensureEditableRing(coordinates)
                : [],
          );
          setFeedbackEditing(true);
          setFeedbackAddPointMode(false);
          setFeedbackSelectedVertexIndex(null);
        },
        onStop: () => {
          setFeedbackEditing(false);
          setFeedbackAddPointMode(false);
          setFeedbackSelectedVertexIndex(null);
        },
        onToggleAddPoint: () => setFeedbackAddPointMode((value) => !value),
        onReset: () => {
          const coordinates = selectedFeature?.geometry.coordinates[0] as
            | Array<[number, number]>
            | undefined;
          setFeedbackDraftRing(
            coordinates ? ensureEditableRing(coordinates) : [],
          );
          setFeedbackAddPointMode(false);
          setFeedbackSelectedVertexIndex(null);
        },
      }}
    />
  );

  const visibleMapProps =
    feedbackEditing
      ? {
          ...sharedMapProps,
          isEditing: true,
          isCreating: false,
          addPointMode: feedbackAddPointMode,
          draftRing: feedbackDraftRing,
          feedbackPreviewRing,
          feedbackReviewSlug: selectedFeature?.properties.slug ?? null,
          onDraftRingChange: setFeedbackDraftRing,
          selectedVertexIndex: feedbackSelectedVertexIndex,
          onSelectVertex: setFeedbackSelectedVertexIndex,
        }
      : sharedMapProps;

  const previewFeedbackGeometry = (item: PendingFeedbackPreview) => {
    if (!item.proposedGeometry?.coordinates?.[0]) return;

    setCurrentView('map');
    setMapMode('historical');
    setYear(item.year);
    setSelectedSlug(item.slug, { focus: true, year: item.year });
    setReviewingFeedbackId(item.id);
    const nextRing = ensureEditableRing(
      item.proposedGeometry.coordinates[0] as Array<[number, number]>,
    );
    setFeedbackPreviewRing(nextRing);
    setFeedbackDraftRing(nextRing);
    setFeedbackEditing(false);
    setFeedbackAddPointMode(false);
    setFeedbackSelectedVertexIndex(null);
  };

  const stopFeedbackReview = () => {
    setReviewingFeedbackId(null);
    setFeedbackEditing(false);
    setFeedbackAddPointMode(false);
    setFeedbackPreviewRing([]);
    setFeedbackDraftRing([]);
    setFeedbackSelectedVertexIndex(null);
  };

  const startFeedbackEdit = () => {
    setFeedbackDraftRing((current) =>
      current.length ? current : feedbackPreviewRing,
    );
    setFeedbackEditing(true);
    setFeedbackAddPointMode(false);
    setFeedbackSelectedVertexIndex(null);
  };

  const handleFeedbackReviewed = (feature?: AtlasStateFeature | null) => {
    if (feature) applyFeatureUpdate(feature);
    setPendingFeedbackCount((count) => Math.max(0, count - 1));
    stopFeedbackReview();
    window.dispatchEvent(new CustomEvent('mongol-atlas:states-refresh'));
  };

  const selectedEvent = useMemo(
    () =>
      battleEvents?.features.find(
        (feature) => feature.properties.slug === selectedEventSlug,
      ) ?? null,
    [battleEvents, selectedEventSlug],
  );

  const mapSceneProps = useMemo(
    () => ({
      ...visibleMapProps,
      feedbackPreviewRing: feedbackEditing ? [] : feedbackPreviewRing,
      feedbackReviewSlug: reviewingFeedbackId
        ? selectedFeature?.properties.slug ?? null
        : null,
      battleEvents,
      selectedEventSlug,
      onSelectEvent: setSelectedEventSlug,
      layerVisibility,
    }),
    [
      battleEvents,
      feedbackEditing,
      feedbackPreviewRing,
      layerVisibility,
      reviewingFeedbackId,
      selectedEventSlug,
      selectedFeature?.properties.slug,
      visibleMapProps,
    ],
  );

  return (
    <main
      className="min-h-screen overflow-hidden"
      style={{
        background: T.bg,
        fontFamily: 'var(--font-inter), Arial, sans-serif',
      }}
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
        mode={quizMode}
        onClose={() => setQuizOpen(false)}
        userName={user?.fullName ?? undefined}
        onScoreSaved={() => setLeaderboardVersion((value) => value + 1)}
      />

      <div className="flex flex-col min-h-screen lg:h-screen lg:flex-row lg:overflow-hidden">
        <Sidebar
          year={year}
          search={search}
          onSearchChange={setSearch}
          mapMode={mapMode}
          onMapModeChange={setMapMode}
          onOpenCharacter={() => setCharacterOpen(true)}
          onOpenQuiz={(mode: QuizMode) => {
            setQuizMode(mode);
            setQuizOpen(true);
          }}
          onOpenMap={() => setCurrentView('map')}
          onOpenLeaderboard={() => setCurrentView('leaderboard')}
          onOpenLineage={() => setCurrentView('lineage')}
          onSelectSearchResult={(feature: {
            properties: { year: SetStateAction<number>; slug: any };
          }) => {
            setCurrentView('map');
            setYear(feature.properties.year);
            setSelectedSlug(feature.properties.slug, {
              focus: true,
              year: Number(feature.properties.year),
            });
          }}
          currentView={currentView}
          characterResult={characterResult}
          pendingFeedbackCount={pendingFeedbackCount}
          quizEnabled={!!collection?.features.length}
          adminMode={adminMode}
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed((value) => !value)}
        />

        <section className="relative flex min-h-[620px] flex-1 flex-col overflow-hidden md:min-h-[720px] lg:h-screen lg:min-h-0">
          {currentView === 'leaderboard' ? (
            <QuizLeaderboardPage
              version={leaderboardVersion}
              onStartQuiz={() => setQuizOpen(true)}
            />
          ) : currentView === 'lineage' ? (
            <div className="h-full overflow-auto bg-slate-50 p-4 md:p-6">
              <LineageTree />
            </div>
          ) : (
            <>
              <div className="absolute inset-x-0 top-0 bottom-[7.5rem] z-0 md:bottom-32 lg:bottom-[7.5rem]">
                {mapMode === 'globe' && <GlobeMap {...mapSceneProps} />}
                {mapMode === 'historical' && (
                  <HistoricalMap {...mapSceneProps} />
                )}
              </div>

              <div className="pointer-events-none absolute inset-x-4 top-4 z-30 flex items-start justify-between gap-3">
                <div className="pointer-events-auto flex w-fit flex-col gap-2">
                  <AtlasHeader
                    adminMode={adminMode}
                    collectionCount={collection?.features.length ?? null}
                  />

                  <AtlasLayerToggle
                    value={layerVisibility}
                    onChange={(key, next) =>
                      setLayerVisibility((current) => ({
                        ...current,
                        [key]: next,
                      }))
                    }
                  />
                </div>

                {adminMode && (
                  <div className="pointer-events-auto w-full max-w-[320px]">
                    <AdminFeedbackNotice
                      activeFeedbackId={reviewingFeedbackId}
                      addPointMode={feedbackAddPointMode}
                      draftRing={feedbackDraftRing}
                      editingFeedback={feedbackEditing}
                      pendingFeedbackCount={pendingFeedbackCount}
                      onApproveEdited={(id) =>
                        reviewFeedbackWithDraft(id, feedbackDraftRing)
                      }
                      onCancelPreview={stopFeedbackReview}
                      onStartEdit={startFeedbackEdit}
                      onPreviewGeometry={previewFeedbackGeometry}
                      onReviewed={handleFeedbackReviewed}
                      onToggleAddPoint={() =>
                        setFeedbackAddPointMode((value) => !value)
                      }
                    />
                  </div>
                )}
              </div>

              <AtlasEventDrawer
                event={selectedEvent}
                onClose={() => setSelectedEventSlug(null)}
              />

              {loadError && (
                <div
                  className="absolute left-4 top-16 z-30 flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs lg:left-auto lg:right-4"
                  style={{
                    background: 'rgba(20,4,4,0.96)',
                    border: '1px solid rgba(150,40,40,0.5)',
                    color: '#f08080',
                    backdropFilter: 'blur(12px)',
                    fontFamily: 'var(--font-inter), Arial, sans-serif',
                  }}
                >
                  <span style={{ fontSize: 11 }}>⚠</span>
                  {loadError}
                </div>
              )}

              <div
                className="absolute bottom-[7.5rem] right-4 top-16 z-20 hidden w-[340px] flex-col xl:flex"
                style={{
                  pointerEvents: selectedFeature || adminMode ? 'auto' : 'none',
                }}
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
  if (typeof window === 'undefined') return () => {};
  const handleChange = () => onStoreChange();
  window.addEventListener('storage', handleChange);
  window.addEventListener('focus', handleChange);
  return () => {
    window.removeEventListener('storage', handleChange);
    window.removeEventListener('focus', handleChange);
  };
}

function readCharacterResultRawSnapshot(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(CHARACTER_STORAGE_KEY);
  } catch {
    return null;
  }
}
