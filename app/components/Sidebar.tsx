"use client";

import { useClerk } from "@clerk/nextjs";
import type { AtlasStateFeature } from "@/lib/types";
import { SidebarFeatureList } from "./atlas/SidebarFeatureList";
import { SidebarHeader } from "./atlas/SidebarHeader";
import { SidebarSearch } from "./atlas/SidebarSearch";
import { sidebarTheme as T } from "./atlas/sidebarTheme";
import { SidebarUserPanel } from "./atlas/SidebarUserPanel";

export function Sidebar({
  year,
  features,
  selectedFeature,
  onSelectSlug,
  search,
  onSearchChange,
  adminMode,
  user,
}: {
  year: number;
  features: AtlasStateFeature[];
  selectedFeature: AtlasStateFeature | null;
  onSelectSlug: (slug: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  adminMode: boolean;
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

  return (
    <aside
      className="flex min-h-screen shrink-0 flex-col lg:h-screen lg:min-h-0 lg:w-[320px]"
      style={{ background: T.bgCard, borderRight: `1px solid ${T.border}`, fontFamily: "'Georgia', 'Times New Roman', serif" }}
    >
      <SidebarHeader year={year} />
      <SidebarSearch search={search} onSearchChange={onSearchChange} featureCount={features.length} />
      <SidebarFeatureList features={features} selectedFeature={selectedFeature} onSelectSlug={onSelectSlug} />
      <SidebarUserPanel
        adminMode={adminMode}
        user={user}
        onSignIn={() => openSignIn()}
        onSignUp={() => openSignUp()}
        onSignOut={() => signOut()}
      />
    </aside>
  );
}
