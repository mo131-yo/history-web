'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import type { AtlasStateFeature } from '@/lib/types';
import { useEffect, useState, type ReactNode } from 'react';
import {
  Bell,
  Check,
  ChevronDown,
  CircleHelp,
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
  id: 'character' | 'quiz' | 'map';
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
  onSelectSearchResult: (feature: AtlasStateFeature) => void;
  currentView: 'map' | 'leaderboard';
  characterResult: SavedCharacterResult | null;
  pendingFeedbackCount: number;
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
  onSelectSearchResult,
  currentView,
  characterResult,
  pendingFeedbackCount,
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
        background: collapsed ? 'rgba(9,14,26,0.99)' : T.bg,
        borderRight: collapsed
          ? `1px solid ${T.amber}33`
          : `1px solid ${T.border}`,
        boxShadow: collapsed ? '8px 0 24px rgba(0,0,0,0.34)' : 'none',
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
    
    // Дэд цэс нээлттэй эсэхийг тодорхойлох
    const isOpen = (isQuiz && quizExpanded) || (isMap && mapExpanded);
    const isActive = item.active || isOpen;

    return (
      <div key={item.id} className="w-full">
        {/* Хэсгийн гарчиг (Collapsed биш үед харагдана) */}
        {!collapsed && (
          <div className="flex items-center gap-2 px-2 mb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {isCharacter ? 'Навигаци' : isQuiz ? 'Суралцах' : 'Газрын зураг'}
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

       {/* FOOTER SECTION: FEEDBACK & USER PANEL */}
<div className="relative z-20 flex flex-col gap-4 pt-6 mt-auto">
  
  {!collapsed && (
    <div className="px-1 space-y-4">
      {/* FEEDBACK / ADMIN SECTION */}
      <div className="relative overflow-hidden group">
        {adminMode ? (
          <div className="transition-all duration-300 transform group-hover:translate-y-[-2px]">
            <AdminFeedbackNotice pendingFeedbackCount={pendingFeedbackCount} />
          </div>
        ) : (
          <button 
            type="button"
            onClick={() => console.log("Open Feedback")}
            className="w-full p-3.5 rounded-[20px] bg-gradient-to-br from-white to-slate-50/50 border border-slate-200/80 flex items-center gap-3.5 hover:border-blue-400/50 hover:shadow-[0_8px_20px_-10px_rgba(59,130,246,0.2)] transition-all duration-300 active:scale-[0.97] group"
          >
            {/* Икон - зөөлөн цэнхэр туяатай */}
            <div className="flex items-center justify-center text-blue-500 transition-transform duration-300 size-9 rounded-xl bg-blue-50/50 group-hover:scale-110">
              <Bell size={18} className="drop-shadow-sm" />
            </div>
            
            <div className="flex-1 text-left">
              <p className="text-[11px] font-black text-slate-600 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                Coordinate feedback
              </p>
              <p className="text-[10px] text-slate-400 font-medium italic">
                Системд туслах
              </p>
            </div>

            {pendingFeedbackCount > 0 && (
              <div className="relative flex items-center justify-center">
                <span className="absolute bg-blue-400 rounded-full animate-ping size-3 opacity-20"></span>
                <span className="relative size-5 rounded-lg bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                  {pendingFeedbackCount}
                </span>
              </div>
            )}
          </button>
        )}
      </div>

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

function AdminFeedbackNotice({
  pendingFeedbackCount,
}: {
  pendingFeedbackCount: number;
}) {
  const [open, setOpen] = useState(pendingFeedbackCount > 0);
  const [items, setItems] = useState<PendingFeedback[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

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

    setItems((current) => current.filter((item) => item.id !== id));
  }

  return (
    <div
      className="p-2 rounded-lg"
      style={{
        background:
          pendingFeedbackCount > 0
            ? 'rgba(245,158,11,0.14)'
            : 'rgba(248,250,252,0.86)',
        backdropFilter: 'blur(14px)',
        border: '1px solid rgba(59,130,246,0.18)',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center w-full gap-2 px-2 py-2 text-left rounded-md"
        style={{ color: pendingFeedbackCount > 0 ? T.amber : T.textSub }}
      >
        <Bell className="size-4 shrink-0" />
        <span className="flex-1 min-w-0 text-xs font-semibold truncate">
          Coordinate feedback
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{ background: `${T.amber}22` }}
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
              className="rounded-lg px-2.5 py-2"
              style={{
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(59,130,246,0.15)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                borderRadius: '16px',
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

              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => reviewFeedback(item.id, 'approve')}
                  className="flex h-8 items-center justify-center gap-1 rounded-md text-[10px] font-semibold"
                  style={{
                    background: 'rgba(34,197,94,0.13)',
                    border: '1px solid rgba(34,197,94,0.35)',
                    color: '#86efac',
                  }}
                >
                  <Check className="size-3" />
                  {item.proposedGeometry ? 'Зөвшөөрөх' : 'Нийтлэх'}
                </button>

                <button
                  type="button"
                  onClick={() => reviewFeedback(item.id, 'reject')}
                  className="flex h-8 items-center justify-center gap-1 rounded-md text-[10px] font-semibold"
                  style={{
                    background: 'rgba(239,68,68,0.12)',
                    border: '1px solid rgba(239,68,68,0.35)',
                    color: '#fca5a5',
                  }}
                >
                  <XCircle className="size-3" />
                  Татгалзах
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QuizMenuButton({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 items-center gap-2 rounded-lg px-3 text-left text-[11px] font-semibold transition-colors hover:bg-white/5"
      style={{
        background: active ? T.bg : T.bg,
        border: active ? `1px solid ${T.amber}55` : `1px solid ${T.border}`,
        color: active ? T.amber : T.textSub,
      }}
    >
      <span className="shrink-0" style={{ color: T.amber }}>
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
}

function MapModeButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 items-center justify-center gap-2 rounded-lg text-[10px] font-semibold uppercase tracking-widest transition-colors"
      style={{
        background: active ? T.amber : T.textMuted + '80',
        border: active ? `1px solid ${T.amber}55` : `1px solid ${T.border}`,
        color: active ? T.bg : T.bg,
      }}
    >
      {icon}
      {label}
    </button>
  );
}
