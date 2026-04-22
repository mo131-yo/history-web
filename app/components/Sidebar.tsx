// // "use client";

// // import { Search } from "lucide-react";
// // import type { AtlasStateFeature } from "@/lib/types";

// // interface SidebarProps {
// //   year: number;
// //   features: AtlasStateFeature[];
// //   selectedFeature: AtlasStateFeature | null;
// //   onSelectSlug: (slug: string) => void;
// //   search: string;
// //   onSearchChange: (value: string) => void;
// // }

// // export function Sidebar({
// //   year,
// //   features,
// //   selectedFeature,
// //   onSelectSlug,
// //   search,
// //   onSearchChange,
// // }: SidebarProps) {
// //   return (
// //     <aside className="flex min-h-screen flex-col overflow-y-auto border-r border-white/10 bg-[linear-gradient(180deg,rgba(10,14,24,0.96),rgba(6,10,18,0.98))] px-5 py-5 backdrop-blur-xl lg:h-screen lg:min-h-0">
// //       <div className="shrink-0 rounded-[28px] border border-amber-200/10 bg-amber-50/[0.03] p-5">
// //         <p className="text-[10px] uppercase tracking-[0.35em] text-amber-200/60">Atlas</p>
// //         <h2 className="mt-2 font-[family:var(--font-cinzel-decorative)] text-3xl text-amber-100">{year}</h2>
// //       </div>

// //       <label className="mt-5 flex shrink-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
// //         <Search className="size-4 text-slate-400" />
// //         <input
// //           value={search}
// //           onChange={(event) => onSearchChange(event.target.value)}
// //           placeholder="Улс, хаан, нийслэл хайх"
// //           className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
// //         />
// //       </label>

// //       <div className="mt-5 grid shrink-0 gap-3 pr-1">
// //         {features.map((feature) => {
// //           const selected = feature.properties.slug === selectedFeature?.properties.slug;

// //           return (
// //             <button
// //               key={`${feature.properties.year}-${feature.properties.slug}`}
// //               type="button"
// //               onClick={() => onSelectSlug(feature.properties.slug)}
// //               className={`rounded-[24px] border px-4 py-4 text-left transition ${
// //                 selected
// //                   ? "border-amber-300/60 bg-amber-300/10 shadow-[0_10px_30px_rgba(245,158,11,0.12)]"
// //                   : "border-white/8 bg-white/[0.03] hover:border-amber-500/30 hover:bg-white/[0.06]"
// //               }`}
// //             >
// //               <div className="flex items-center justify-between gap-3">
// //                 <div>
// //                   <p className="font-[family:var(--font-cinzel)] text-lg font-semibold text-stone-200">
// //                     {feature.properties.name}
// //                   </p>
// //                   <p className="mt-1 text-xs text-stone-400">{feature.properties.leader}</p>
// //                 </div>
// //                 <span
// //                   className="h-4 w-4 rounded-full border border-white/40"
// //                   style={{ backgroundColor: feature.properties.color }}
// //                 />
// //               </div>
// //               <p className="mt-3 text-xs uppercase tracking-[0.2em] text-stone-500">{feature.properties.capital}</p>
// //             </button>
// //           );
// //         })}
// //       </div>
// //     </aside>
// //   );
// // }




// "use client";

// import { useClerk } from "@clerk/nextjs";
// import { Search, Crown, LogIn, LogOut, User, Swords, Shield } from "lucide-react";
// import type { AtlasStateFeature } from "@/lib/types";

// interface SidebarProps {
//   year: number;
//   features: AtlasStateFeature[];
//   selectedFeature: AtlasStateFeature | null;
//   onSelectSlug: (slug: string) => void;
//   search: string;
//   onSearchChange: (value: string) => void;
//   adminMode: boolean;
//   user: { fullName?: string | null; imageUrl?: string; primaryEmailAddress?: { emailAddress?: string } | null } | null | undefined;
// }

// const PANEL_BG = "rgba(14,8,3,0.97)";
// const BORDER = "#4a3010";
// const GOLD = "#c9a45d";
// const GOLD_DIM = "#8b6c35";
// const TEXT_MAIN = "#f0deb4";
// const TEXT_SUB = "#9a7c50";
// const TEXT_MUTED = "#5c4020";

// export function Sidebar({
//   year,
//   features,
//   selectedFeature,
//   onSelectSlug,
//   search,
//   onSearchChange,
//   adminMode,
//   user,
// }: SidebarProps) {
//   const { openSignIn, signOut } = useClerk();

//   return (
//     <aside
//       className="flex min-h-screen flex-col overflow-y-auto lg:h-screen lg:min-h-0"
//       style={{
//         background: PANEL_BG,
//         borderRight: `1px solid ${BORDER}`,
//         fontFamily: "Georgia, 'Times New Roman', serif",
//       }}
//     >
//       {/* ── Header crest ────────────────────────────────────────────── */}
//       <div
//         className="shrink-0 px-5 py-5"
//         style={{ borderBottom: `1px solid ${BORDER}` }}
//       >
//         {/* Decorative top rule */}
//         <div className="flex items-center gap-2 mb-4">
//           <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD_DIM})` }} />
//           <svg width="18" height="18" viewBox="0 0 18 18">
//             <polygon points="9,1 11,7 17,7 12,11 14,17 9,13 4,17 6,11 1,7 7,7" fill={GOLD_DIM} opacity="0.8"/>
//           </svg>
//           <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${GOLD_DIM}, transparent)` }} />
//         </div>

//         <div className="text-center">
//           <p className="text-[8px] uppercase tracking-[0.6em] mb-1.5" style={{ color: TEXT_MUTED }}>Монгол Атлас</p>
//           <h2
//             className="text-5xl font-bold leading-none mb-1"
//             style={{ color: GOLD, textShadow: `0 0 20px ${GOLD}55` }}
//           >
//             {year}
//           </h2>
//           <p className="text-[9px] uppercase tracking-[0.35em]" style={{ color: TEXT_MUTED }}>он · Дундад Зуун</p>
//         </div>

//         {/* Bottom ornament */}
//         <div className="flex items-center gap-2 mt-4">
//           <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${BORDER})` }} />
//           <div className="h-1 w-1 rounded-full" style={{ background: BORDER }} />
//           <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${BORDER}, transparent)` }} />
//         </div>
//       </div>

//       {/* ── Search ──────────────────────────────────────────────────── */}
//       <div className="shrink-0 px-4 pt-4">
//         <label
//           className="flex items-center gap-2.5 rounded px-3 py-2.5 transition-colors"
//           style={{ background: "rgba(255,200,100,0.04)", border: `1px solid ${BORDER}` }}
//         >
//           <Search className="size-3.5 shrink-0" style={{ color: GOLD_DIM }} />
//           <input
//             value={search}
//             onChange={(e) => onSearchChange(e.target.value)}
//             placeholder="Улс, хаан, нийслэл…"
//             className="w-full bg-transparent text-xs outline-none placeholder:opacity-40"
//             style={{ color: TEXT_MAIN, fontFamily: "Georgia, serif" }}
//           />
//         </label>
//       </div>

//       {/* ── State count ─────────────────────────────────────────────── */}
//       <div className="shrink-0 px-5 pt-3 pb-1.5 flex items-center gap-2">
//         <Shield className="size-3" style={{ color: TEXT_MUTED }} />
//         <p className="text-[9px] uppercase tracking-[0.35em]" style={{ color: TEXT_MUTED }}>
//           {features.length} нутаг дэвсгэр
//         </p>
//       </div>

//       {/* ── Territory list ───────────────────────────────────────────── */}
//       <div className="flex-1 overflow-y-auto px-3 pb-2 grid gap-1.5 content-start">
//         {features.length === 0 && (
//           <div
//             className="rounded px-4 py-6 text-center text-xs"
//             style={{ border: `1px solid ${BORDER}`, color: TEXT_MUTED }}
//           >
//             Энэ онд нутаг дэвсгэр олдсонгүй
//           </div>
//         )}

//         {features.map((feature) => {
//           const selected = feature.properties.slug === selectedFeature?.properties.slug;
//           const color = feature.properties.color ?? "#c9a45d";

//           return (
//             <button
//               key={`${feature.properties.year}-${feature.properties.slug}`}
//               type="button"
//               onClick={() => onSelectSlug(feature.properties.slug)}
//               className="w-full text-left rounded transition-all duration-150 group relative"
//               style={{
//                 background: selected
//                   ? `linear-gradient(135deg, rgba(201,164,93,0.14) 0%, rgba(201,164,93,0.06) 100%)`
//                   : "rgba(255,200,100,0.02)",
//                 border: selected ? `1px solid ${GOLD}55` : `1px solid ${BORDER}`,
//                 boxShadow: selected ? `0 0 16px rgba(201,164,93,0.12), inset 0 0 20px rgba(201,164,93,0.04)` : "none",
//                 padding: "10px 12px",
//               }}
//             >
//               {/* Left colour strip */}
//               <div
//                 className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full transition-opacity"
//                 style={{ background: color, opacity: selected ? 0.9 : 0.5 }}
//               />

//               <div className="pl-3">
//                 <div className="flex items-center justify-between gap-2">
//                   <p
//                     className="text-sm font-semibold leading-tight truncate"
//                     style={{ color: selected ? GOLD : TEXT_MAIN }}
//                   >
//                     {feature.properties.name}
//                   </p>
//                   {/* Colour swatch as shield */}
//                   <div
//                     className="shrink-0 h-4 w-3 clip-shield"
//                     style={{
//                       background: color,
//                       clipPath: "polygon(20% 0%, 80% 0%, 100% 20%, 100% 70%, 50% 100%, 0% 70%, 0% 20%)",
//                       boxShadow: `0 0 6px ${color}66`,
//                     }}
//                   />
//                 </div>

//                 <p className="mt-0.5 text-[10px] truncate" style={{ color: TEXT_SUB }}>
//                   {feature.properties.leader}
//                 </p>

//                 <div className="mt-1.5 flex items-center gap-1.5">
//                   <div className="h-px flex-1" style={{ background: selected ? `${GOLD}30` : `${BORDER}80` }} />
//                   <p className="text-[8px] uppercase tracking-[0.25em]" style={{ color: TEXT_MUTED }}>
//                     {feature.properties.capital}
//                   </p>
//                 </div>
//               </div>
//             </button>
//           );
//         })}
//       </div>

//       {/* ── User / Auth ──────────────────────────────────────────────── */}
//       <div
//         className="shrink-0 px-4 py-4"
//         style={{ borderTop: `1px solid ${BORDER}` }}
//       >
//         {user ? (
//           <div
//             className="flex items-center gap-3 rounded px-3 py-2.5"
//             style={{ background: "rgba(255,200,100,0.04)", border: `1px solid ${BORDER}` }}
//           >
//             {user.imageUrl ? (
//               <img src={user.imageUrl} alt="" className="h-8 w-8 rounded border object-cover" style={{ borderColor: BORDER }} />
//             ) : (
//               <div className="flex h-8 w-8 items-center justify-center rounded border" style={{ borderColor: BORDER, background: "rgba(255,200,100,0.06)" }}>
//                 <User className="size-4" style={{ color: GOLD_DIM }} />
//               </div>
//             )}
//             <div className="min-w-0 flex-1">
//               <p className="text-xs truncate" style={{ color: TEXT_MAIN }}>
//                 {user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "Хэрэглэгч"}
//               </p>
//               {adminMode && (
//                 <div className="flex items-center gap-1 mt-0.5">
//                   <Crown className="size-2.5" style={{ color: GOLD }} />
//                   <span className="text-[8px] uppercase tracking-widest" style={{ color: GOLD }}>Хаан</span>
//                 </div>
//               )}
//             </div>
//             <button
//               type="button"
//               onClick={() => signOut()}
//               className="rounded p-1.5 transition-colors hover:opacity-80"
//               style={{ border: `1px solid ${BORDER}`, color: TEXT_MUTED }}
//             >
//               <LogOut className="size-3" />
//             </button>
//           </div>
//         ) : (
//           <button
//             type="button"
//             onClick={() => openSignIn()}
//             className="flex w-full items-center justify-center gap-2 rounded px-4 py-2.5 text-xs transition-all hover:opacity-80"
//             style={{
//               border: `1px solid ${BORDER}`,
//               background: "rgba(255,200,100,0.04)",
//               color: GOLD_DIM,
//               fontFamily: "Georgia, serif",
//             }}
//           >
//             <LogIn className="size-3.5" />
//             Нэвтрэх
//           </button>
//         )}
//       </div>
//     </aside>
//   );
// }


"use client";

import { useClerk } from "@clerk/nextjs";
import { Search, Crown, LogIn, LogOut, User, Shield, Globe } from "lucide-react";
import type { AtlasStateFeature } from "@/lib/types";

// ── Theme ────────────────────────────────────────────────────────────────────
const T = {
  bg: "#020617",           // slate-950
  bgCard: "rgba(15,23,42,0.97)",   // slate-900
  bgHover: "rgba(30,41,59,0.6)",   // slate-800/60
  border: "#1e293b",       // slate-800
  borderHover: "#334155",  // slate-700
  amber: "#f59e0b",        // amber-500
  amberDim: "#d97706",     // amber-600
  amberGlow: "#f59e0b20",
  text: "#e7e5e0",         // stone-200
  textSub: "#a8a29e",      // stone-400
  textMuted: "#57534e",    // stone-600
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
  adminMode,
  user,
}: SidebarProps) {
  const { openSignIn, signOut } = useClerk();

  return (
    <aside
      className="flex min-h-screen flex-col lg:h-screen lg:min-h-0 lg:w-[320px] shrink-0"
      style={{
        background: T.bgCard,
        borderRight: `1px solid ${T.border}`,
        fontFamily: "'Georgia', 'Times New Roman', serif",
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div
        className="shrink-0 px-5 py-5"
        style={{ borderBottom: `1px solid ${T.border}` }}
      >
        {/* Decorative top line */}
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

        {/* Globe icon + year */}
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

        {/* Bottom ornament */}
        <div className="flex items-center gap-2 mt-4">
          <div className="flex-1 h-px" style={{ background: T.border }} />
          <div className="h-1.5 w-1.5 rounded-full" style={{ background: T.amberDim, opacity: 0.5 }} />
          <div className="flex-1 h-px" style={{ background: T.border }} />
        </div>
      </div>

      {/* ── Search ─────────────────────────────────────────────────────── */}
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

      {/* ── Count ──────────────────────────────────────────────────────── */}
      <div className="shrink-0 px-5 py-1 flex items-center gap-2">
        <Shield className="size-3" style={{ color: T.textMuted }} />
        <p className="text-[9px] uppercase tracking-[0.35em]" style={{ color: T.textMuted }}>
          {features.length} нутаг дэвсгэр
        </p>
      </div>

      {/* ── Territory list ──────────────────────────────────────────────── */}
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
              {/* Hover overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
                style={{ background: "rgba(245,158,11,0.04)" }}
              />

              {/* Left colour accent strip */}
              <div
                className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full"
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
                  {/* Colour swatch */}
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

      {/* ── Auth footer ─────────────────────────────────────────────────── */}
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
              {adminMode && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Crown className="size-2.5" style={{ color: T.amber }} />
                  <span
                    className="text-[8px] uppercase tracking-widest"
                    style={{ color: T.amber }}
                  >
                    Хаан
                  </span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => signOut()}
              className="rounded-md p-1.5 transition-colors hover:opacity-70"
              style={{ border: `1px solid ${T.border}`, color: T.textMuted }}
            >
              <LogOut className="size-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => openSignIn()}
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