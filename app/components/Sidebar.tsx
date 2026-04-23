"use client";

import { useClerk } from "@clerk/nextjs";
import { Search, Crown, LogIn, LogOut, User, Shield, Globe } from "lucide-react";
import type { AtlasStateFeature } from "@/lib/types";

const T = {
  bg: "#020617",  
  bgCard: "rgba(15,23,42,0.97)",
  bgHover: "rgba(30,41,59,0.6)", 
  border: "#1e293b",   
  borderHover: "#334155", 
  amber: "#f59e0b",     
  amberDim: "#d97706",    
  amberGlow: "#f59e0b20",
  text: "#e7e5e0",       
  textSub: "#a8a29e",   
  textMuted: "#57534e", 
};

interface SidebarProps {
  year: number;
  features: AtlasStateFeature[];
  selectedFeature: AtlasStateFeature | null;
  onSelectSlug: (slug: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  adminMode: boolean;
  user: { fullName?: string | null; imageUrl?: string; primaryEmailAddress?: { emailAddress?: string } | null } | null | undefined;
}

export function Sidebar({
  year,
  features,
  selectedFeature,
  onSelectSlug,
  search,
  onSearchChange,
  user,
}: SidebarProps) {

  return (
    <aside
      className="flex min-h-screen flex-col lg:h-screen lg:min-h-0 lg:w-[320px] shrink-0"
      style={{
        background: T.bgCard,
        borderRight: `1px solid ${T.border}`,
        fontFamily: "'Georgia', 'Times New Roman', serif",
      }}
    >
      <div
        className="shrink-0 px-5 py-5"
        style={{ borderBottom: `1px solid ${T.border}` }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div
            className="flex-1 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${T.amber}66)` }}
          />
          <svg width="16" height="16" viewBox="0 0 16 16">
            <polygon
              points="8,1 9.5,5.5 14.5,5.5 10.3,8.8 11.8,13.5 8,10.8 4.2,13.5 5.7,8.8 1.5,5.5 6.5,5.5"
              fill={T.amber}
              opacity="0.8"
            />
          </svg>
          <div
            className="flex-1 h-px"
            style={{ background: `linear-gradient(90deg, ${T.amber}66, transparent)` }}
          />
        </div>

        <div className="flex items-start justify-between gap-2">
          <div>
            <p
              className="text-[8px] uppercase tracking-[0.6em] mb-1"
              style={{ color: T.textMuted }}
            >
              Монгол Атлас
            </p>
            <h2
              className="text-4xl font-bold leading-none"
              style={{ color: T.amber, textShadow: `0 0 30px ${T.amberGlow}, 0 0 60px ${T.amberGlow}` }}
            >
              {year}
            </h2>
            <p
              className="text-[9px] uppercase tracking-[0.4em] mt-1"
              style={{ color: T.textMuted }}
            >
              он · Дундад Зуун
            </p>
          </div>
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0 mt-1"
            style={{ background: T.amberGlow, border: `1px solid ${T.amber}33` }}
          >
            <Globe className="size-5" style={{ color: T.amberDim }} />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <div className="flex-1 h-px" style={{ background: T.border }} />
          <div className="h-1.5 w-1.5 rounded-full" style={{ background: T.amberDim, opacity: 0.5 }} />
          <div className="flex-1 h-px" style={{ background: T.border }} />
        </div>
      </div>

      <div className="shrink-0 px-4 pt-4 pb-2">
        <label
          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 transition-colors"
          style={{
            background: "rgba(15,23,42,0.6)",
            border: `1px solid ${T.border}`,
          }}
        >
          <Search className="size-3.5 shrink-0" style={{ color: T.textMuted }} />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Улс, хаан, нийслэл…"
            className="w-full bg-transparent text-xs outline-none placeholder:opacity-40"
            style={{ color: T.text, fontFamily: "Georgia, serif" }}
          />
        </label>
      </div>

      <div className="shrink-0 px-5 py-1 flex items-center gap-2">
        <Shield className="size-3" style={{ color: T.textMuted }} />
        <p className="text-[9px] uppercase tracking-[0.35em]" style={{ color: T.textMuted }}>
          {features.length} нутаг дэвсгэр
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-2 flex flex-col gap-1.5">
        {features.length === 0 && (
          <div
            className="rounded-lg px-4 py-8 text-center text-xs mt-4"
            style={{ border: `1px solid ${T.border}`, color: T.textMuted }}
          >
            Энэ онд нутаг дэвсгэр олдсонгүй
          </div>
        )}

        {features.map((feature) => {
          const selected = feature.properties.slug === selectedFeature?.properties.slug;
          const color = feature.properties.color ?? "#f59e0b";

          return (
            <button
              key={`${feature.properties.year}-${feature.properties.slug}`}
              type="button"
              onClick={() => onSelectSlug(feature.properties.slug)}
              className="w-full text-left rounded-lg transition-all duration-150 relative overflow-hidden group"
              style={{
                background: selected
                  ? `linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0.05) 100%)`
                  : "rgba(15,23,42,0.4)",
                border: selected ? `1px solid ${T.amber}44` : `1px solid ${T.border}`,
                boxShadow: selected
                  ? `0 0 20px rgba(245,158,11,0.08), inset 0 1px 0 rgba(255,255,255,0.03)`
                  : "none",
                padding: "10px 12px",
              }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
                style={{ background: "rgba(245,158,11,0.04)" }}
              />

              <div
                className="absolute left-0 top-2 bottom-2 w-0.75 rounded-full"
                style={{ background: color, opacity: selected ? 1 : 0.45 }}
              />

              <div className="pl-3.5">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className="text-sm font-semibold leading-tight truncate"
                    style={{ color: selected ? T.amber : T.text }}
                  >
                    {feature.properties.name}
                  </p>
                  <div
                    className="shrink-0 h-3.5 w-3.5 rounded-sm"
                    style={{
                      background: color,
                      boxShadow: selected ? `0 0 6px ${color}88` : "none",
                      clipPath: "polygon(20% 0%, 80% 0%, 100% 20%, 100% 75%, 50% 100%, 0% 75%, 0% 20%)",
                    }}
                  />
                </div>

                <p
                  className="mt-0.5 text-[10px] truncate"
                  style={{ color: selected ? T.textSub : T.textMuted }}
                >
                  {feature.properties.leader}
                </p>

                <div className="mt-1.5 flex items-center gap-1.5">
                  <div
                    className="h-px flex-1"
                    style={{ background: selected ? `${T.amber}30` : T.border }}
                  />
                  <p
                    className="text-[8px] uppercase tracking-[0.2em]"
                    style={{ color: T.textMuted }}
                  >
                    {feature.properties.capital}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div
        className="shrink-0 px-4 py-4"
        style={{ borderTop: `1px solid ${T.border}` }}
      >
        {user ? (
          <div
            className="flex items-center gap-3 rounded-lg px-3 py-2.5"
            style={{ background: "rgba(15,23,42,0.6)", border: `1px solid ${T.border}` }}
          >
            {user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt=""
                className="h-8 w-8 rounded-lg border object-cover shrink-0"
                style={{ borderColor: T.border }}
              />
            ) : (
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg border shrink-0"
                style={{ borderColor: T.border, background: T.amberGlow }}
              >
                <User className="size-4" style={{ color: T.amberDim }} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs truncate" style={{ color: T.text }}>
                {user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "Хэрэглэгч"}
              </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Crown className="size-2.5" style={{ color: T.amber }} />
                  <span
                    className="text-[8px] uppercase tracking-widest"
                    style={{ color: T.amber }}
                  >
                    Хаан
                  </span>
                </div>
            </div>
            <button
              type="button"
              className="rounded-md p-1.5 transition-colors hover:opacity-70"
              style={{ border: `1px solid ${T.border}`, color: T.textMuted }}
            >
              <LogOut className="size-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs transition-all hover:opacity-80"
            style={{
              border: `1px solid ${T.border}`,
              background: "rgba(15,23,42,0.6)",
              color: T.textMuted,
              fontFamily: "Georgia, serif",
            }}
          >
            <LogIn className="size-3.5" />
            Нэвтрэх
          </button>
        )}
      </div>
    </aside>
  );
}