"use client";

import type { AtlasStateFeature } from "@/lib/types";
import { SidebarFeatureList } from "./atlas/SidebarFeatureList";
import { SidebarHeader } from "./atlas/SidebarHeader";
import { SidebarSearch } from "./atlas/SidebarSearch";
import { sidebarTheme as T } from "./atlas/sidebarTheme";
import { SidebarUserPanel } from "./atlas/SidebarUserPanel";

type SidebarProps = {
  year?: number;
  features?: AtlasStateFeature[];
  selectedFeature?: AtlasStateFeature | null;
  onSelectSlug?: (slug: string) => void;

  search: string;
  onSearchChange: (value: string) => void;

  adminMode?: boolean;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;

  user:
    | {
        fullName?: string | null;
        imageUrl?: string;
        primaryEmailAddress?: { emailAddress?: string } | null;
      }
    | null
    | undefined;

  mapMode?: "globe" | "historical";
  onMapModeChange?: (mode: "globe" | "historical") => void;
  onOpenCharacter?: () => void;

  [key: string]: any;
};

export function Sidebar({
  year = 1206,
  features = [],
  selectedFeature = null,
  onSelectSlug = () => {},
  search,
  onSearchChange,
  adminMode = false,
  user,
  collapsed = false,
  onToggleCollapsed = () => {},
}: SidebarProps) {
  const { openSignIn, openSignUp, signOut } = useClerk();

  return (
    <aside
      className={`flex w-full shrink-0 flex-col border-b transition-[width] duration-300 lg:h-screen lg:min-h-0 lg:border-b-0 lg:border-r ${
        collapsed ? "lg:w-[96px]" : "lg:w-[320px]"
      }`}
      style={{
        background: T.bgCard,
        borderRight: `1px solid ${T.border}`,
        fontFamily: "'Georgia', 'Times New Roman', serif",
      }}
    >
      <SidebarHeader
        year={year}
        collapsed={collapsed}
        onToggleCollapsed={onToggleCollapsed}
      />

      {!collapsed && (
        <>
          <SidebarSearch
            search={search}
            onSearchChange={onSearchChange}
            featureCount={features.length}
          />

          <SidebarFeatureList
            features={features}
            selectedFeature={selectedFeature}
            onSelectSlug={onSelectSlug}
          />

          <SidebarUserPanel
            adminMode={adminMode}
            user={user}
            onSignIn={() => openSignIn()}
            onSignUp={() => openSignUp()}
            onSignOut={() => signOut()}
          />
        </>
      )}
    </aside>
  );
}

function useClerk(): { openSignIn: any; openSignUp: any; signOut: any; } {
  throw new Error("Function not implemented.");
}
