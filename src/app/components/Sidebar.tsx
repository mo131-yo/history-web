"use client";

import { useClerk } from "@clerk/nextjs";
import type { AtlasStateFeature } from "@/lib/types";
import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown, CircleHelp, ListChecks, Map, MapPinned, Medal, Search, Sparkles, Trophy } from "lucide-react";
import { SidebarHeader } from "./atlas/SidebarHeader";
import { sidebarTheme as T } from "./atlas/sidebarTheme";
import { SidebarUserPanel } from "./atlas/SidebarUserPanel";
import type { MapMode, SavedCharacterResult } from "./atlas/types";
import type { QuizMode } from "./QuizModal";

export function Sidebar({
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
  quizEnabled,
  adminMode,
  user,
  collapsed,
  onToggleCollapsed,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  mapMode: MapMode;
  onMapModeChange: (mode: MapMode) => void;
  onOpenCharacter: () => void;
  onOpenQuiz: (mode: QuizMode) => void;
  onOpenMap: () => void;
  onOpenLeaderboard: () => void;
  onSelectSearchResult: (feature: AtlasStateFeature) => void;
  currentView: "map" | "leaderboard";
  characterResult: SavedCharacterResult | null;
  quizEnabled: boolean;
  adminMode: boolean;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  user:
    | {
        fullName?: string | null;
        imageUrl?: string;
        primaryEmailAddress?: { emailAddress?: string } | null;
      }
    | null
    | undefined;
}) {
  const { openSignIn, openSignUp, signOut } = useClerk();
  const [searchResults, setSearchResults] = useState<AtlasStateFeature[]>([]);
  const [searchStatus, setSearchStatus] = useState<"idle" | "loading" | "error">("idle");
  const [quizExpanded, setQuizExpanded] = useState(false);
  const trimmedSearch = search.trim();
  const navItems = [
    {
      id: "character",
      title: "Би хэн бэ?",
      subtitle: characterResult ? characterResult.roleName : "Дүрээ олох",
      icon: CircleHelp,
      onClick: onOpenCharacter,
      active: !!characterResult,
    },
    {
      id: "quiz",
      title: "Quiz",
      subtitle: "Атласын асуулт",
      icon: Trophy,
      onClick: () => setQuizExpanded((value) => !value),
      disabled: !quizEnabled,
    },
    {
      id: "map",
      title: "Map",
      subtitle: mapMode === "globe" ? "3D map" : "Flat map",
      icon: Map,
      onClick: onOpenMap,
      active: currentView === "map",
    },
  ];

  useEffect(() => {
    if (currentView === "leaderboard") setQuizExpanded(true);
  }, [currentView]);

  useEffect(() => {
    if (collapsed || trimmedSearch.length < 2) {
      setSearchResults([]);
      setSearchStatus("idle");
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setSearchStatus("loading");
      fetch(`/api/atlas/search?q=${encodeURIComponent(trimmedSearch)}`, { signal: controller.signal })
        .then((response) => {
          if (!response.ok) throw new Error("Search failed");
          return response.json() as Promise<{ results?: AtlasStateFeature[] }>;
        })
        .then((data) => {
          setSearchResults(data.results ?? []);
          setSearchStatus("idle");
        })
        .catch((error) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          setSearchResults([]);
          setSearchStatus("error");
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
        collapsed ? "lg:w-20" : "lg:w-[280px]"
      }`}
      style={{
        background: collapsed ? "rgba(9,14,26,0.99)" : T.bgCard,
        borderRight: collapsed ? `1px solid ${T.amber}33` : `1px solid ${T.border}`,
        boxShadow: collapsed ? "8px 0 24px rgba(0,0,0,0.34)" : "none",
        fontFamily: "'Georgia', 'Times New Roman', serif",
      }}
    >
      <SidebarHeader
        collapsed={collapsed}
        onToggleCollapsed={onToggleCollapsed} year={0}      />

      <div className={`flex flex-1 flex-col gap-3 px-3 py-3 ${collapsed ? "items-center" : ""}`}>
        {!collapsed && (
          <label
            className="flex h-10 shrink-0 items-center gap-2 rounded-lg px-3"
            style={{ background: "rgba(8,13,24,0.72)", border: `1px solid ${T.border}` }}
          >
            <Search className="size-4 shrink-0" style={{ color: T.textMuted }} />
            <input
              value={search}
              onChange={(event: { target: { value: string; }; }) => onSearchChange(event.target.value)}
              placeholder="Улс хайх"
              className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:opacity-45"
              style={{ color: T.text, fontFamily: "Georgia, serif" }}
            />
          </label>
        )}

        {!collapsed && trimmedSearch.length >= 2 && (
          <div
            className="max-h-72 shrink-0 overflow-y-auto rounded-lg p-2"
            style={{ background: "rgba(8,13,24,0.72)", border: `1px solid ${T.border}` }}
          >
            {searchStatus === "loading" && (
              <p className="px-2 py-3 text-xs" style={{ color: T.textMuted }}>
                Хайж байна...
              </p>
            )}

            {searchStatus === "error" && (
              <p className="px-2 py-3 text-xs" style={{ color: "#f08080" }}>
                Хайлт амжилтгүй боллоо.
              </p>
            )}

            {searchStatus === "idle" && searchResults.length === 0 && (
              <p className="px-2 py-3 text-xs" style={{ color: T.textMuted }}>
                1162-1300 оны хооронд тохирох улс олдсонгүй.
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
                  <span className="truncate text-sm font-semibold" style={{ color: T.text }}>
                    {feature.properties.name}
                  </span>
                  <span className="shrink-0 text-[10px] tabular-nums" style={{ color: T.amber }}>
                    {feature.properties.year}
                  </span>
                </span>
                <span className="mt-0.5 block truncate text-[10px]" style={{ color: T.textSub }}>
                  {feature.properties.leader} · {feature.properties.capital}
                </span>
                <span className="mt-1 line-clamp-2 block text-[10px] leading-4" style={{ color: T.textMuted }}>
                  {feature.properties.summary}
                </span>
              </button>
            ))}
          </div>
        )}

        <nav className={`flex flex-1 flex-col gap-2 ${collapsed ? "items-center" : ""}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isMap = item.id === "map";
            const isQuiz = item.id === "quiz";

            return (
              <div key={item.id} className={collapsed ? "w-11" : "w-full"}>
                <button
                  type="button"
                  onClick={item.onClick}
                  disabled={item.disabled}
                  className={`group flex w-full items-center rounded-lg transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-45 ${
                    collapsed ? "h-11 justify-center" : "min-h-12 justify-between gap-3 px-3"
                  }`}
                  style={{
                    background: item.active ? "rgba(245,158,11,0.11)" : "rgba(15,23,42,0.45)",
                    border: item.active ? `1px solid ${T.amber}44` : `1px solid ${T.border}`,
                    color: item.active ? T.amber : T.text,
                    boxShadow: item.active ? "0 0 18px rgba(245,158,11,0.08)" : "none",
                  }}
                  title={collapsed ? item.title : undefined}
                >
                  <span className={`flex min-w-0 items-center ${collapsed ? "justify-center" : "gap-3"}`}>
                    <Icon className="size-5 shrink-0" />
                    {!collapsed && (
                      <span className="min-w-0 text-left">
                        <span className="block truncate text-sm font-semibold leading-tight">{item.title}</span>
                        <span className="mt-0.5 block truncate text-[10px]" style={{ color: T.textMuted }}>
                          {item.subtitle}
                        </span>
                      </span>
                    )}
                  </span>
                  {!collapsed && (isMap || isQuiz) && (
                    <ChevronDown
                      className="size-4 shrink-0 transition-transform duration-150"
                      style={{
                        color: T.textMuted,
                        transform: isQuiz && quizExpanded ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  )}
                </button>

                {isQuiz && !collapsed && quizExpanded && (
                  <div className="mt-2 grid gap-2">
                    <QuizMenuButton
                      icon={<ListChecks className="size-4" />}
                      label="Мэдлэгээ сорих"
                      onClick={() => onOpenQuiz("knowledge")}
                    />
                    <QuizMenuButton
                      icon={<Trophy className="size-4" />}
                      label="Анги сонгох"
                      onClick={() => onOpenQuiz("grade")}
                    />
                    <QuizMenuButton
                      icon={<Medal className="size-4" />}
                      label="Leaderboard"
                      active={currentView === "leaderboard"}
                      onClick={onOpenLeaderboard}
                    />
                  </div>
                )}

                {isMap && !collapsed && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <MapModeButton
                      active={mapMode === "globe"}
                      icon={<Sparkles className="size-4" />}
                      label="3D"
                      onClick={() => onMapModeChange("globe")}
                    />
                    <MapModeButton
                      active={mapMode === "historical"}
                      icon={<MapPinned className="size-4" />}
                      label="Flat"
                      onClick={() => onMapModeChange("historical")}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {!collapsed && (
          <SidebarUserPanel
            adminMode={adminMode}
            user={user}
            onSignIn={() => openSignIn()}
            onSignUp={() => openSignUp()}
            onSignOut={() => signOut()}
          />
        )}
      </div>
    </aside>
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
        background: active ? "rgba(245,158,11,0.14)" : "rgba(8,13,24,0.66)",
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
        background: active ? "rgba(245,158,11,0.16)" : "rgba(8,13,24,0.66)",
        border: active ? `1px solid ${T.amber}55` : `1px solid ${T.border}`,
        color: active ? T.amber : T.textSub,
      }}
    >
      {icon}
      {label}
    </button>
  );
}
