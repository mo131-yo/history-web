'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import type { AtlasStateFeature } from '@/lib/types';
import { useEffect, useState } from 'react';
import {
  Bell,
  Check,
  ChevronDown,
  CircleHelp,
  Crown,
  Globe,
  LayoutGrid,
  ListChecks,
  Map,
  MapPinned,
  Medal,
  Search,
  Trophy,
  XCircle,
} from 'lucide-react';
import { SidebarHeader } from './atlas/SidebarHeader';
import { sidebarTheme as T } from './atlas/sidebarTheme';
import {
  SidebarUserPanel,
  type UserSyncStatus,
} from './atlas/SidebarUserPanel';
import type { MapMode, SavedCharacterResult } from './atlas/types';
import type { QuizMode } from './QuizModal';

type SidebarNavItem = {
  id: 'character' | 'quiz' | 'map' | 'lineage';
  title: string;
  subtitle: string;
  icon: typeof CircleHelp;
  iconText?: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
};

type SidebarProps = {
  year: number;
  search: string;
  onSearchChange: (value: string) => void;
  mapMode: MapMode;
  onMapModeChange: (mode: MapMode) => void;
  onOpenCharacter: () => void;
  onOpenQuiz: (mode: QuizMode) => void;
  onOpenMap: () => void;
  onOpenLeaderboard: () => void;
  onOpenLineage: () => void;
  onSelectSearchResult: (feature: AtlasStateFeature) => void;
  currentView: 'map' | 'leaderboard' | 'lineage';
  characterResult: SavedCharacterResult | null;
  pendingFeedbackCount?: number;
  quizEnabled: boolean;
  adminMode: boolean;
  collapsed: boolean;
  onToggleCollapsed: () => void;
};

export function Sidebar({
  year,
  search,
  onSearchChange,
  mapMode,
  onMapModeChange,
  onOpenCharacter,
  onOpenQuiz,
  onOpenMap,
  onOpenLeaderboard,
  onOpenLineage,
  onSelectSearchResult,
  currentView,
  characterResult,
  quizEnabled,
  adminMode,
  collapsed,
  onToggleCollapsed,
}: SidebarProps) {
  const { openSignIn, openSignUp, signOut } = useClerk();
  const { user, isLoaded } = useUser();

  const [searchResults, setSearchResults] = useState<AtlasStateFeature[]>([]);
  const [searchStatus, setSearchStatus] = useState<
    'idle' | 'loading' | 'error'
  >('idle');
  const [userSyncStatus, setUserSyncStatus] = useState<UserSyncStatus>('idle');
  const [quizExpanded, setQuizExpanded] = useState(false);
  const [mapExpanded, setMapExpanded] = useState(false);

  const trimmedSearch = search.trim();

  const navItems: SidebarNavItem[] = [
    {
      id: 'character',
      title: 'Би хэн бэ?',
      subtitle: characterResult ? characterResult.roleName : 'Дүрээ олох',
      icon: CircleHelp,
      iconText: characterResult?.icon,
      onClick: onOpenCharacter,
      active: !!characterResult,
    },
    {
      id: 'quiz',
      title: 'Quiz',
      subtitle: 'Атласын асуулт',
      icon: Trophy,
      onClick: () => {
        setMapExpanded(false);
        setQuizExpanded((value) => !value);
      },
      disabled: !quizEnabled,
    },
    {
      id: 'map',
      title: 'Map',
      subtitle: mapMode === 'globe' ? '3D map' : 'Flat map',
      icon: Map,
      onClick: () => {
        onOpenMap();
        setMapExpanded((prev) => !prev);
      },
      active: currentView === 'map',
    },
    {
      id: 'lineage',
      title: 'Алтан Ураг',
      subtitle: 'Их хаадын угсаа',
      icon: Crown,
      onClick: () => {
        setQuizExpanded(false);
        setMapExpanded(false);
        onOpenLineage();
      },
      active: currentView === 'lineage',
    },
  ];

  useEffect(() => {
    if (currentView === 'leaderboard') setQuizExpanded(true);
  }, [currentView]);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user?.id) {
      setUserSyncStatus('idle');
      return;
    }

    const controller = new AbortController();
    setUserSyncStatus('syncing');

    fetch('/api/users/me', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.primaryEmailAddress?.emailAddress ?? null,
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        username: user.username ?? null,
        imageUrl: user.imageUrl ?? null,
      }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          const message = await response.text().catch(() => '');
          console.error('User sync failed:', response.status, message);
          setUserSyncStatus('error');
          return;
        }

        setUserSyncStatus('synced');
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        console.error('User sync request failed:', error);
        setUserSyncStatus('error');
      });

    return () => controller.abort();
  }, [
    isLoaded,
    user?.id,
    user?.primaryEmailAddress?.emailAddress,
    user?.firstName,
    user?.lastName,
    user?.username,
    user?.imageUrl,
  ]);

  useEffect(() => {
    if (collapsed || trimmedSearch.length < 2) {
      setSearchResults([]);
      setSearchStatus('idle');
      return;
    }

    const controller = new AbortController();

    const timeout = window.setTimeout(() => {
      setSearchStatus('loading');

      fetch(`/api/atlas/search?q=${encodeURIComponent(trimmedSearch)}`, {
        signal: controller.signal,
      })
        .then((response) => {
          if (!response.ok) throw new Error('Search failed');
          return response.json() as Promise<{ results?: AtlasStateFeature[] }>;
        })
        .then((data) => {
          setSearchResults(data.results ?? []);
          setSearchStatus('idle');
        })
        .catch((error) => {
          if (error instanceof DOMException && error.name === 'AbortError') {
            return;
          }

          console.error(error);
          setSearchResults([]);
          setSearchStatus('error');
        });
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [collapsed, trimmedSearch]);

  return (
    <aside
      className={`relative z-30 flex w-full shrink-0 flex-col border-b transition-[width] duration-300 lg:h-screen lg:min-h-0 lg:border-b-0 lg:border-r ${
        collapsed ? 'lg:w-20' : 'lg:w-[280px]'
      }`}
      style={{
        background: collapsed ? 'rgba(255,255,255,0.96)' : T.bg,
        borderRight: collapsed
          ? `1px solid ${T.border}`
          : `1px solid ${T.border}`,
        boxShadow: collapsed ? '8px 0 26px rgba(37,99,235,0.16)' : 'none',
        fontFamily: 'var(--font-inter), Arial, sans-serif',
      }}
    >
      <SidebarHeader
        collapsed={collapsed}
        onToggleCollapsed={onToggleCollapsed}
        onOpenMap={onOpenMap}
        year={year}
      />

      <div
        className={`flex flex-1 flex-col gap-3 px-3 py-3 ${
          collapsed ? 'items-center' : ''
        }`}
      >
     {!collapsed && (
  <div className="relative px-1 group shrink-0">
    <label
      className="flex items-center gap-3 px-4 transition-all duration-200 bg-white border shadow-sm h-11 rounded-2xl group-focus-within:border-blue-400 group-focus-within:ring-4 group-focus-within:ring-blue-50/50 group-hover:border-slate-300 border-slate-200"
    >
      <Search
        className="transition-colors duration-200 size-4 shrink-0 text-slate-400 group-focus-within:text-blue-500"
      />
      <input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Улс хайх..."
        className="flex-1 min-w-0 text-sm font-medium bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
        style={{
          fontFamily: 'var(--font-inter), Arial, sans-serif',
        }}
      />
      
      {search.length > 0 && (
        <button 
          onClick={() => onSearchChange("")}
          className="p-1 transition-colors rounded-full hover:bg-slate-100"
        >
          <XCircle className="size-3.5 text-slate-300 hover:text-slate-500" />
        </button>
      )}
    </label>
  </div>
)}

{!collapsed && (
  <div className="relative px-1 shrink-0"> 
  


    {trimmedSearch.length >= 2 && (
      <div
        className="absolute top-[calc(100%+8px)] left-1 right-1 z-[100] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200"
      >
        <div className="max-h-[400px] overflow-y-auto p-1.5 custom-scrollbar bg-white">
          {searchStatus === 'loading' && (
            <div className="flex items-center gap-2 px-3 py-4">
              <div className="border-2 border-blue-500 rounded-full size-3 border-t-transparent animate-spin" />
              <p className="text-xs font-medium text-slate-400">Хайж байна...</p>
            </div>
          )}

          {searchStatus === 'idle' && searchResults.length === 0 && (
            <p className="px-3 py-4 text-xs italic font-medium text-slate-400">
              Тохирох улс олдсонгүй.
            </p>
          )}

          <div className="grid gap-1">
            {searchResults.map((feature) => (
              <button
                key={`${feature.properties.year}-${feature.properties.slug}`}
                type="button"
                onClick={() => {
                  onSelectSearchResult(feature);
                  onSearchChange(""); 
                }}
                className="group w-full rounded-xl px-3 py-2.5 text-left transition-all hover:bg-blue-50 active:scale-[0.98]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600">
                    {feature.properties.name}
                  </span>
                  <span className="shrink-0 rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-black text-blue-500">
                    {feature.properties.year}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span className="font-medium truncate">{feature.properties.leader}</span>
                </div>
                <p className="mt-1 line-clamp-1 text-[10px] text-slate-400 group-hover:text-slate-500 italic">
                  {feature.properties.summary}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    )}
  </div>
)}

       <nav className={`flex flex-col gap-5 relative z-20 ${collapsed ? "items-center" : ""}`}>
  {navItems.map((item) => {
    const Icon = item.icon;
    const isQuiz = item.id === "quiz";
    const isMap = item.id === "map";
    const isCharacter = item.id === "character";
    const isLineage = item.id === "lineage";
    
    // Дэд цэс нээлттэй эсэхийг тодорхойлох
    const isOpen = (isQuiz && quizExpanded) || (isMap && mapExpanded);
    const isActive = item.active || isOpen;

    return (
      <div key={item.id} className="w-full">
        {/* Хэсгийн гарчиг (Collapsed биш үед харагдана) */}
        {!collapsed && (
          <div className="flex items-center gap-2 px-2 mb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {isLineage ? 'Ургийн мод' : isCharacter ? 'Навигаци' : isQuiz ? 'Суралцах' : 'Газрын зураг'}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            if (isQuiz) {
              setMapExpanded(false); // Quiz дээр дарахад Map-ыг хаана
              setQuizExpanded(!quizExpanded);
            } else if (isMap) {
              setQuizExpanded(false); // Map дээр дарахад Quiz-ийг хаана
              setMapExpanded(!mapExpanded);
              onOpenMap();
            } else {
              item.onClick();
            }
          }}
          disabled={item.disabled}
          className={`flex w-full items-center transition-all duration-200 active:scale-[0.98] ${
            collapsed ? "h-12 justify-center rounded-xl" : "p-3 rounded-2xl border min-h-[60px]"
          } ${
            isActive 
              ? "bg-white border-blue-200 shadow-md ring-4 ring-blue-50" 
              : "bg-white/50 border-slate-100 hover:bg-white hover:border-slate-200"
          } disabled:opacity-40`}
        >
          <div className={`flex items-center ${collapsed ? "justify-center" : "gap-4"}`}>
            {/* Икон контейнер */}
            <div className={`flex items-center justify-center rounded-xl transition-all ${
              collapsed ? "size-10" : "size-11"
            } ${
              isActive 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
                : "bg-white border border-slate-100 text-slate-400 shadow-sm"
            }`}>
              {item.iconText ? (
                <span className="text-xl leading-none">{item.iconText}</span>
              ) : (
                <Icon size={isQuiz ? 22 : 20} />
              )}
            </div>

            {!collapsed && (
              <div className="overflow-hidden text-left">
                <p className={`text-sm font-bold leading-tight truncate ${isActive ? "text-slate-900" : "text-slate-600"}`}>
                  {item.title}
                </p>
                <p className="mt-0.5 text-[10px] font-medium text-slate-400 truncate">
                  {item.subtitle}
                </p>
              </div>
            )}
          </div>

          {!collapsed && (isQuiz || isMap) && (
            <ChevronDown 
              size={14} 
              className={`ml-auto transition-transform duration-300 ${
                isOpen ? "rotate-180 text-blue-500" : "text-slate-300"
              }`} 
            />
          )}
        </button>

        {/* QUIZ ДЭД ЦЭС */}
        {!collapsed && isQuiz && quizExpanded && (
          <div className="mt-2.5 ml-4 pl-4 border-l-2 border-blue-100 grid gap-1 animate-in slide-in-from-left-2 duration-200">
            <button 
              onClick={() => onOpenQuiz('knowledge')}
              className="flex items-center gap-3 p-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all"
            >
              <ListChecks size={14} /> Мэдлэгээ сорих
            </button>
            <button 
              onClick={() => onOpenQuiz('grade')}
              className="flex items-center gap-3 p-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all"
            >
              <LayoutGrid size={14} /> Level сонгох
            </button>
            <button 
              onClick={onOpenLeaderboard}
              className={`flex items-center gap-3 p-2.5 rounded-xl text-xs font-bold transition-all ${
                currentView === 'leaderboard' ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              <Medal size={14} /> Leaderboard
            </button>
          </div>
        )}

        {/* MAP ДЭД ЦЭС */}
        {!collapsed && isMap && mapExpanded && (
          <div className="mt-2.5 ml-4 pl-4 border-l-2 border-blue-100 grid grid-cols-2 gap-2 animate-in slide-in-from-left-2 duration-200">
            <button 
              onClick={() => onMapModeChange('globe')}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
                mapMode === 'globe' ? "bg-blue-50 border-blue-200 text-blue-600 shadow-sm" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
              }`}
            >
              <Globe size={14} />
              <span className="text-[10px] font-bold mt-1.5">3D Map</span>
            </button>
            <button 
              onClick={() => onMapModeChange('historical')}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
                mapMode === 'historical' ? "bg-blue-50 border-blue-200 text-blue-600 shadow-sm" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
              }`}
            >
              <MapPinned size={14} />
              <span className="text-[10px] font-bold mt-1.5">Flat Map</span>
            </button>
          </div>
        )}
      </div>
    );
  })}
</nav>

       {/* FOOTER SECTION: USER PANEL */}
<div className="relative z-20 flex flex-col gap-4 pt-6 mt-auto">
  
  {!collapsed && (
    <div className="px-1 space-y-4">
      {/* USER PANEL - Илүү цэвэрхэн тусгаарлагчтай */}
      {isLoaded && (
        <div className="relative">
          {/* Чимэглэлийн нарийн зураас */}
          <div className="absolute inset-x-4 -top-2 h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
          
          <div className="rounded-[24px] bg-white/40 backdrop-blur-md border border-white/60 p-1">
            <SidebarUserPanel
              adminMode={adminMode}
              user={user}
              syncStatus={userSyncStatus}
              onSignIn={() => openSignIn()}
              onSignUp={() => openSignUp()}
              onSignOut={() => signOut({ redirectUrl: '/' })}
            />
          </div>
        </div>
      )}
    </div>
  )}
</div>
      </div>
    </aside>
  );
}

type PendingFeedback = {
  id: string;
  slug: string;
  year: number;
  stateName: string;
  userName: string;
  rating: number;
  comment: string;
  proposedGeometry?: GeoJSON.Polygon | null;
};

export function AdminFeedbackNotice({
  activeFeedbackId,
  addPointMode = false,
  draftRing = [],
  editingFeedback = false,
  onApproveEdited,
  onCancelPreview,
  onPreviewGeometry,
  onReviewed,
  onStartEdit,
  onToggleAddPoint,
  pendingFeedbackCount,
}: {
  activeFeedbackId?: string | null;
  addPointMode?: boolean;
  draftRing?: Array<[number, number]>;
  editingFeedback?: boolean;
  onApproveEdited?: (id: string) => Promise<AtlasStateFeature | null | undefined>;
  onCancelPreview?: () => void;
  onPreviewGeometry?: (item: PendingFeedback) => void;
  onReviewed?: (feature?: AtlasStateFeature | null) => void;
  onStartEdit?: () => void;
  onToggleAddPoint?: () => void;
  pendingFeedbackCount: number;
}) {
  const [open, setOpen] = useState(pendingFeedbackCount > 0);
  const [items, setItems] = useState<PendingFeedback[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const activeItem = items.find((item) => item.id === activeFeedbackId);

  useEffect(() => {
    if (pendingFeedbackCount <= 0) {
      setItems([]);
      return;
    }

    const controller = new AbortController();
    setStatus('loading');

    fetch('/api/atlas/feedback?status=pending', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Pending feedback failed');
        return response.json() as Promise<{ feedback?: PendingFeedback[] }>;
      })
      .then((data) => {
        setItems(data.feedback ?? []);
        setStatus('idle');
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        console.error(error);
        setItems([]);
        setStatus('error');
      });

    return () => controller.abort();
  }, [pendingFeedbackCount]);

  async function reviewFeedback(id: string, action: 'approve' | 'reject') {
    const response = await fetch('/api/atlas/feedback', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    });

    if (!response.ok) {
      setStatus('error');
      return;
    }

    const data = (await response.json().catch(() => null)) as {
      feature?: AtlasStateFeature | null;
    } | null;
    setItems((current) => current.filter((item) => item.id !== id));
    onReviewed?.(data?.feature ?? null);
  }

  async function approveEditedFeedback(id: string) {
    if (!onApproveEdited) {
      await reviewFeedback(id, 'approve');
      return;
    }

    const feature = await onApproveEdited(id);
    setItems((current) => current.filter((item) => item.id !== id));
    onReviewed?.(feature ?? null);
  }

  return (
    <div
      className="p-2 rounded-xl"
      style={{
        background:
          pendingFeedbackCount > 0
            ? 'rgba(255,255,255,0.96)'
            : 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(14px)',
        border: '1px solid rgba(59,130,246,0.28)',
        boxShadow: '0 14px 34px rgba(37,99,235,0.16)',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center w-full gap-2 px-2 py-2 text-left rounded-lg"
        style={{ color: pendingFeedbackCount > 0 ? T.amber : T.textMuted }}
      >
        <Bell className="size-4 shrink-0" />
        <span className="flex-1 min-w-0 text-xs font-semibold truncate">
          Feedback review
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{
            background: pendingFeedbackCount > 0 ? T.amber : 'rgba(37,99,235,0.1)',
            color: pendingFeedbackCount > 0 ? '#ffffff' : T.amber,
          }}
        >
          {pendingFeedbackCount}
        </span>
      </button>

      {open && (
        <div className="grid gap-2 mt-2 overflow-y-auto max-h-72">
          {status === 'loading' && (
            <p className="px-2 py-2 text-xs" style={{ color: T.textMuted }}>
              Feedback уншиж байна...
            </p>
          )}

          {status === 'error' && (
            <p className="px-2 py-2 text-xs" style={{ color: '#f87171' }}>
              Feedback шалгахад алдаа гарлаа.
            </p>
          )}

          {items.length === 0 && status !== 'loading' && (
            <p className="px-2 py-2 text-xs" style={{ color: T.textMuted }}>
              Хүлээгдэж буй координат санал алга.
            </p>
          )}

          {items.map((item) => (
            <div
              key={item.id}
              role={item.proposedGeometry ? 'button' : undefined}
              tabIndex={item.proposedGeometry ? 0 : undefined}
              onClick={() => {
                if (!item.proposedGeometry || activeFeedbackId === item.id) {
                  return;
                }

                onPreviewGeometry?.(item);
              }}
              onKeyDown={(event) => {
                if (
                  !item.proposedGeometry ||
                  activeFeedbackId === item.id ||
                  (event.key !== 'Enter' && event.key !== ' ')
                ) {
                  return;
                }

                event.preventDefault();
                onPreviewGeometry?.(item);
              }}
              className="rounded-lg px-2.5 py-2 transition-all duration-200"
              style={{
                background:
                  activeFeedbackId === item.id
                    ? 'linear-gradient(135deg, rgba(236,253,245,0.98), rgba(255,255,255,0.96))'
                    : 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(12px)',
                border:
                  activeFeedbackId === item.id
                    ? '1px solid rgba(34,197,94,0.48)'
                    : '1px solid rgba(59,130,246,0.15)',
                boxShadow:
                  activeFeedbackId === item.id
                    ? '0 12px 30px rgba(16,185,129,0.22)'
                    : '0 8px 24px rgba(0,0,0,0.08)',
                borderRadius: '16px',
                cursor: item.proposedGeometry ? 'pointer' : 'default',
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <p
                  className="text-xs font-semibold truncate"
                  style={{ color: T.text }}
                >
                  {item.stateName}
                </p>
                <span
                  className="shrink-0 text-[10px]"
                  style={{ color: T.amber }}
                >
                  {item.year}
                </span>
              </div>

              <p
                className="mt-1 line-clamp-2 text-[10px] leading-4"
                style={{ color: T.textMuted }}
              >
                {item.userName}: {item.comment}
              </p>

              <p className="mt-1 text-[10px]" style={{ color: T.textSub }}>
                {item.proposedGeometry
                  ? `${item.proposedGeometry.coordinates?.[0]?.length ?? 0} coordinate point`
                  : 'Guest feedback'}
              </p>

              {item.proposedGeometry && (
                <div className="mt-2 grid gap-2">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      if (activeFeedbackId === item.id) return;
                      onPreviewGeometry?.(item);
                    }}
                    disabled={activeFeedbackId === item.id}
                    className="h-8 rounded-md text-[10px] font-semibold disabled:cursor-default"
                    style={{
                      background:
                        activeFeedbackId === item.id
                          ? 'rgba(34,197,94,0.14)'
                          : 'rgba(12,96,169,0.08)',
                      border:
                        activeFeedbackId === item.id
                          ? '1px solid rgba(34,197,94,0.36)'
                          : '1px solid rgba(12,96,169,0.28)',
                      color: activeFeedbackId === item.id ? '#15803d' : T.amber,
                    }}
                  >
                    {activeFeedbackId === item.id ? '✓ Харагдаж байна' : 'Map дээр харах'}
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onCancelPreview?.();
                    }}
                    disabled={activeFeedbackId !== item.id}
                    className="hidden h-8 rounded-md text-[10px] font-semibold disabled:opacity-45"
                    style={{
                      background: 'rgba(148,163,184,0.12)',
                      border: '1px solid rgba(148,163,184,0.25)',
                      color: '#475569',
                    }}
                  >
                    Хаах
                  </button>
                </div>
              )}

              {false && activeFeedbackId === item.id && (
                <div className="mt-2 grid gap-2">
                  <p className="text-[10px]" style={{ color: T.textMuted }}>
                    {editingFeedback
                      ? `Засварлаж байна. Цэгийг чирж засна, double click устгана. Одоо ${draftRing.length} цэг байна.`
                      : 'Одоогоор зөвхөн харж байна. Засах бол доорх товчийг дарна.'}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <span
                      className="rounded-md px-2 py-1 text-[10px] font-semibold"
                      style={{ background: 'rgba(245,158,11,0.12)', color: '#b45309' }}
                    >
                      Үндсэн polygon
                    </span>
                    <span
                      className="rounded-md px-2 py-1 text-[10px] font-semibold"
                      style={{ background: 'rgba(34,197,94,0.12)', color: '#15803d' }}
                    >
                      Feedback polygon
                    </span>
                  </div>
                  {!editingFeedback && (
                    <button
                      type="button"
                      onClick={onStartEdit}
                      className="h-8 rounded-md text-[10px] font-semibold"
                      style={{
                        background: 'rgba(12,96,169,0.1)',
                        border: '1px solid rgba(12,96,169,0.3)',
                        color: T.amber,
                      }}
                    >
                      Засах горим асаах
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onToggleAddPoint}
                    disabled={!editingFeedback}
                    className="h-8 rounded-md text-[10px] font-semibold disabled:opacity-45"
                    style={{
                      background: addPointMode
                        ? 'rgba(34,197,94,0.14)'
                        : 'rgba(12,96,169,0.08)',
                      border: addPointMode
                        ? '1px solid rgba(34,197,94,0.36)'
                        : '1px solid rgba(12,96,169,0.28)',
                      color: addPointMode ? '#15803d' : T.amber,
                    }}
                  >
                    {addPointMode ? 'Цэг нэмэх горим асаалттай' : 'Цэг нэмэх'}
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    activeFeedbackId === item.id
                      ? approveEditedFeedback(item.id)
                      : reviewFeedback(item.id, 'approve');
                  }}
                  disabled={Boolean(item.proposedGeometry && activeFeedbackId !== item.id)}
                  className="flex h-8 items-center justify-center gap-1 rounded-md text-[10px] font-semibold disabled:opacity-45"
                  style={{
                    display: item.proposedGeometry ? 'none' : undefined,
                    background: 'rgba(34,197,94,0.13)',
                    border: '1px solid rgba(34,197,94,0.35)',
                    color: '#15803d',
                  }}
                >
                  <Check className="size-3" />
                  {activeFeedbackId === item.id
                    ? editingFeedback
                      ? 'Засвараар approve'
                      : 'Харагдаж буйгаар approve'
                    : item.proposedGeometry
                      ? 'Эхлээд харах'
                      : 'Нийтлэх'}
                </button>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    reviewFeedback(item.id, 'reject');
                  }}
                  className="flex h-8 items-center justify-center gap-1 rounded-md text-[10px] font-semibold"
                  style={{
                    background: 'rgba(239,68,68,0.12)',
                    border: '1px solid rgba(239,68,68,0.35)',
                    color: '#dc2626',
                  }}
                >
                  <XCircle className="size-3" />
                  Татгалзах
                </button>
              </div>
            </div>
          ))}

          {activeItem?.proposedGeometry && (
            <div
              className="sticky bottom-0 grid gap-2 rounded-xl p-3"
              style={{
                background: 'rgba(248,250,252,0.98)',
                border: '1px solid rgba(34,197,94,0.3)',
                boxShadow: '0 -10px 28px rgba(15,23,42,0.12)',
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: '#15803d' }}>
                    Feedback review
                  </p>
                  <p className="mt-0.5 text-[10px]" style={{ color: T.textMuted }}>
                    {editingFeedback
                      ? `${draftRing.length} цэгтэй засварлаж байна`
                      : 'User feedback харагдаж байна. Дараагийн алхмаа сонгоно уу.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onCancelPreview}
                  className="h-7 rounded-md px-2 text-[10px] font-semibold"
                  style={{ background: 'rgba(148,163,184,0.12)', color: '#475569' }}
                >
                  Хаах
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={onStartEdit}
                  disabled={editingFeedback}
                  className="h-9 rounded-md text-[10px] font-semibold disabled:opacity-45"
                  style={{
                    background: 'rgba(12,96,169,0.1)',
                    border: '1px solid rgba(12,96,169,0.3)',
                    color: T.amber,
                  }}
                >
                  Засах
                </button>
                <button
                  type="button"
                  onClick={onToggleAddPoint}
                  disabled={!editingFeedback}
                  className="h-9 rounded-md text-[10px] font-semibold disabled:opacity-45"
                  style={{
                    background: addPointMode ? 'rgba(34,197,94,0.14)' : 'rgba(12,96,169,0.08)',
                    border: addPointMode ? '1px solid rgba(34,197,94,0.36)' : '1px solid rgba(12,96,169,0.28)',
                    color: addPointMode ? '#15803d' : T.amber,
                  }}
                >
                  {addPointMode ? 'Цэг нэмэх ON' : 'Цэг нэмэх'}
                </button>
                <button
                  type="button"
                  onClick={() => approveEditedFeedback(activeItem.id)}
                  className="h-9 rounded-md text-[10px] font-semibold"
                  style={{
                    background: 'rgba(34,197,94,0.15)',
                    border: '1px solid rgba(34,197,94,0.4)',
                    color: '#15803d',
                  }}
                >
                  Approve
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
