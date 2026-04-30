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
          <label
            className="flex items-center h-10 gap-2 px-3 rounded-lg shrink-0"
            style={{ background: T.bg, border: `1px solid ${T.border}` }}
          >
            <Search
              className="size-4 shrink-0"
              style={{ color: T.textMuted }}
            />
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Улс эсвэл он хайх"
              className="flex-1 min-w-0 text-xs bg-transparent outline-none placeholder:opacity-45"
              style={{
                color: T.text,
                fontFamily: 'var(--font-inter), Arial, sans-serif',
                background: T.bg,
              }}
            />
          </label>
        )}

        {!collapsed && trimmedSearch.length >= 2 && (
          <div
            className="p-2 overflow-y-auto rounded-lg max-h-72 shrink-0"
            style={{ background: T.bg, border: `1px solid ${T.border}` }}
          >
            {/^\d{3,4}$/.test(trimmedSearch) && searchResults.length > 0 && (
              <p
                className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: T.textMuted }}
              >
                {trimmedSearch} оны бүх улс
              </p>
            )}

            {searchStatus === 'loading' && (
              <p className="px-2 py-3 text-xs" style={{ color: T.text }}>
                Хайж байна...
              </p>
            )}

            {searchStatus === 'error' && (
              <p className="px-2 py-3 text-xs" style={{ color: '#f08080' }}>
                Хайлт амжилтгүй боллоо.
              </p>
            )}

            {searchStatus === 'idle' && searchResults.length === 0 && (
              <p className="px-2 py-3 text-xs" style={{ color: T.text }}>
                Тохирох улс олдсонгүй.
              </p>
            )}

            {searchResults.map((feature) => (
              <button
                key={`${feature.properties.year}-${feature.properties.slug}`}
                type="button"
                onClick={() => onSelectSearchResult(feature)}
                className="w-full rounded-md px-2.5 py-2 text-left transition-colors hover:bg-white/5"
              >
                <span className="flex items-center justify-between gap-2">
                  <span
                    className="text-sm font-semibold truncate"
                    style={{ color: T.text }}
                  >
                    {feature.properties.name}
                  </span>
                  <span
                    className="shrink-0 text-[10px] tabular-nums"
                    style={{ color: T.amber }}
                  >
                    {feature.properties.year}
                  </span>
                </span>

                <span
                  className="mt-0.5 block truncate text-[10px]"
                  style={{ color: T.textSub }}
                >
                  {feature.properties.leader} · {feature.properties.capital}
                </span>

                <span
                  className="mt-1 line-clamp-2 block text-[10px] leading-4"
                  style={{ color: T.textMuted }}
                >
                  {feature.properties.summary}
                </span>
              </button>
            ))}
          </div>
        )}

        <nav
          className={`flex flex-1 flex-col gap-2 ${
            collapsed ? 'items-center' : ''
          }`}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isMap = item.id === 'map';
            const isQuiz = item.id === 'quiz';
            const hasCharacterIcon = item.id === 'character' && item.iconText;

            return (
              <div key={item.id} className={collapsed ? 'w-11' : 'w-full'}>
                {hasCharacterIcon && !collapsed && (
                  <div className="flex items-center gap-2 px-2 mb-1">
                    <CircleHelp
                      className="size-3"
                      style={{ color: T.textMuted }}
                    />
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: T.textMuted }}
                    >
                      Навигаци
                    </span>
                  </div>
                )}

                {isQuiz && !collapsed && (
                  <div className="flex items-center gap-2 px-2 mb-1">
                    <Trophy className="size-3" style={{ color: T.textMuted }} />
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: T.textMuted }}
                    >
                      Суралцах
                    </span>
                  </div>
                )}

                {isMap && !collapsed && (
                  <div className="flex items-center gap-2 px-2 mb-1">
                    <Map className="size-3" style={{ color: T.textMuted }} />
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: T.textMuted }}
                    >
                      Газрын зураг
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={item.onClick}
                  disabled={item.disabled}
                  className={`group flex w-full items-center rounded-lg transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-45 ${
                    collapsed
                      ? 'h-11 justify-center'
                      : 'min-h-12 justify-between gap-3 px-3'
                  }`}
                  style={{
                    background: item.active ? T.bg : T.bg,
                    border: item.active
                      ? `1px solid ${T.amber}44`
                      : `1px solid ${T.border}`,
                    color: item.active ? T.amber : T.amber,
                    boxShadow: item.active
                      ? '0 0 18px rgba(245,158,11,0.08)'
                      : 'none',
                  }}
                  title={collapsed ? item.title : undefined}
                >
                  <span
                    className={`flex min-w-0 items-center ${
                      collapsed ? 'justify-center' : 'gap-3'
                    }`}
                  >
                    {hasCharacterIcon ? (
                      <span
                        className="flex items-center justify-center text-base leading-none rounded-full size-6 shrink-0"
                        style={{
                          background: T.amber,
                          border: `1px solid ${T.amber}35`,
                          boxShadow: '0 0 14px rgba(245,158,11,0.12)',
                        }}
                        aria-hidden="true"
                      >
                        {item.iconText}
                      </span>
                    ) : (
                      <Icon className="size-5 shrink-0" />
                    )}

                    {!collapsed && (
                      <span className="min-w-0 text-left">
                        <span
                          className="block text-sm font-semibold leading-tight truncate"
                          style={{ color: T.text }}
                        >
                          {item.title}
                        </span>
                        <span
                          className="mt-0.5 block truncate text-[10px]"
                          style={{ color: T.textSub, background: T.bg }}
                        >
                          {item.subtitle}
                        </span>
                      </span>
                    )}
                  </span>

                  {!collapsed && (isQuiz || isMap) && (
                    <ChevronDown
                      className="transition-transform duration-150 size-4 shrink-0"
                      style={{
                        color: T.textMuted,
                        transform:
                          (isQuiz && quizExpanded) || (isMap && mapExpanded)
                            ? 'rotate(180deg)'
                            : 'rotate(0deg)',
                      }}
                    />
                  )}
                </button>

                {isQuiz && !collapsed && quizExpanded && (
                  <div className="grid gap-2 mt-2">
                    <QuizMenuButton
                      icon={<ListChecks className="size-4" />}
                      label="Мэдлэгээ сорих"
                      onClick={() => onOpenQuiz('knowledge')}
                    />
                    <QuizMenuButton
                      icon={
                        <Trophy className="size-4" style={{ color: T.amber }} />
                      }
                      label="Level сонгох"
                      onClick={() => onOpenQuiz('grade')}
                    />
                    <QuizMenuButton
                      icon={<Medal className="size-4" />}
                      label="Leaderboard"
                      active={currentView === 'leaderboard'}
                      onClick={onOpenLeaderboard}
                    />
                  </div>
                )}

                {isMap && !collapsed && mapExpanded && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <MapModeButton
                      active={mapMode === 'globe'}
                      icon={<Globe className="size-4" />}
                      label="3D"
                      onClick={() => onMapModeChange('globe')}
                    />
                    <MapModeButton
                      active={mapMode === 'historical'}
                      icon={<MapPinned className="size-4" />}
                      label="Flat"
                      onClick={() => onMapModeChange('historical')}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {isLoaded && !collapsed && (
          <SidebarUserPanel
            adminMode={adminMode}
            user={user}
            syncStatus={userSyncStatus}
            onSignIn={() => openSignIn()}
            onSignUp={() => openSignUp()}
            onSignOut={() => signOut({ redirectUrl: '/' })}
          />
        )}
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
          Coordinate feedback
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
