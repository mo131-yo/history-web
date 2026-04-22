// // // "use client";

// // // import { useEffect, useState } from "react";
// // // import ReactMarkdown from "react-markdown";
// // // import { Loader2, MapPinned, Sparkles, X } from "lucide-react";
// // // import type { AtlasStateFeature } from "@/lib/types";

// // // interface SelectedStateDrawerProps {
// // //   year: number;
// // //   feature: AtlasStateFeature | null;
// // //   onClose: () => void;
// // // }

// // // export default function SelectedStateDrawer({
// // //   year,
// // //   feature,
// // //   onClose,
// // // }: SelectedStateDrawerProps) {
// // //   const [insight, setInsight] = useState("");
// // //   const [insightLoading, setInsightLoading] = useState(false);
// // //   const [insightError, setInsightError] = useState("");

// // //   useEffect(() => {
// // //     if (!feature) {
// // //       return;
// // //     }

// // //     let active = true;
// // //     const state = feature.properties;

// // //     async function loadInsight() {
// // //       setInsightLoading(true);
// // //       setInsightError("");

// // //       try {
// // //         const response = await fetch("/api/atlas/insight", {
// // //           method: "POST",
// // //           headers: {
// // //             "Content-Type": "application/json",
// // //           },
// // //           body: JSON.stringify({
// // //             year,
// // //             state: {
// // //               name: state.name,
// // //               leader: state.leader,
// // //               capital: state.capital,
// // //               summary: state.summary,
// // //               metadata: state.metadata,
// // //             },
// // //           }),
// // //         });

// // //         if (!response.ok) {
// // //           throw new Error("insight-failed");
// // //         }

// // //         const data = await response.json();

// // //         if (active) {
// // //           setInsight(data.text ?? "");
// // //         }
// // //       } catch {
// // //         if (active) {
// // //           setInsightError("AI тайлбар ачаалагдсангүй.");
// // //         }
// // //       } finally {
// // //         if (active) {
// // //           setInsightLoading(false);
// // //         }
// // //       }
// // //     }

// // //     void loadInsight();

// // //     return () => {
// // //       active = false;
// // //     };
// // //   }, [feature, year]);

// // //   if (!feature) {
// // //     return null;
// // //   }

// // //   return (
// // //     <div className="hidden h-full md:block">
// // //       <div className="flex h-full flex-col rounded-[28px] border border-amber-500/20 bg-slate-950/92 p-5 text-stone-200 shadow-[0_25px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl">
// // //         <div className="flex items-start justify-between gap-3">
// // //           <div>
// // //             <p className="text-[10px] uppercase tracking-[0.35em] text-amber-500/70">Selected State</p>
// // //             <h3 className="mt-2 font-[family:var(--font-cinzel)] text-2xl font-semibold text-stone-100">
// // //               {feature.properties.name}
// // //             </h3>
// // //           </div>
// // //           <button
// // //             type="button"
// // //             onClick={onClose}
// // //             className="rounded-full border border-white/10 bg-white/5 p-2 text-stone-300 transition hover:bg-white/10"
// // //           >
// // //             <X className="size-4" />
// // //           </button>
// // //         </div>

// // //         <div className="mt-4 flex items-center gap-2 text-sm text-stone-400">
// // //           <MapPinned className="size-4 text-amber-500" />
// // //           <span>{feature.properties.capital}</span>
// // //         </div>

// // //         <div className="mt-4 grid gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-stone-300">
// // //           <p><span className="text-stone-500">Удирдагч:</span> {feature.properties.leader}</p>
// // //           <p><span className="text-stone-500">Нийслэл:</span> {feature.properties.capital}</p>
// // //           <p><span className="text-stone-500">Сүүлд шинэчлэгдсэн:</span> {new Date(feature.properties.updatedAt).toLocaleString()}</p>
// // //         </div>

// // //         <div className="mt-4 rounded-2xl border border-amber-500/15 bg-amber-500/[0.05] p-4">
// // //           <p className="text-sm leading-7 text-stone-200">{feature.properties.summary}</p>
// // //         </div>

// // //         <div className="mt-4 flex-1 overflow-y-auto rounded-2xl border border-amber-500/15 bg-amber-500/[0.04] p-4">
// // //           <div className="flex items-center gap-2">
// // //             <Sparkles className="size-4 text-amber-500" />
// // //             <p className="text-[10px] uppercase tracking-[0.3em] text-amber-500/80">Хүүрнэгч</p>
// // //           </div>

// // //           {insightLoading ? (
// // //             <div className="mt-4 flex items-center gap-2 text-sm text-stone-300">
// // //               <Loader2 className="size-4 animate-spin" />
// // //               AI тайлбар үүсгэж байна...
// // //             </div>
// // //           ) : insightError ? (
// // //             <p className="mt-4 text-sm text-red-300">{insightError}</p>
// // //           ) : (
// // //             <div className="prose prose-invert mt-4 max-w-none prose-p:my-2 prose-li:my-1 prose-strong:text-amber-300">
// // //               <ReactMarkdown>{insight}</ReactMarkdown>
// // //             </div>
// // //           )}
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }




// // "use client";

// // import { useEffect, useState } from "react";
// // import ReactMarkdown from "react-markdown";
// // import { Loader2, MapPinned, Sparkles, X } from "lucide-react";
// // import type { AtlasStateFeature } from "@/lib/types";

// // interface SelectedStateDrawerProps {
// //   year: number;
// //   feature: AtlasStateFeature | null;
// //   onClose: () => void;
// // }

// // export default function SelectedStateDrawer({
// //   year,
// //   feature,
// //   onClose,
// // }: SelectedStateDrawerProps) {
// //   const [insight, setInsight] = useState("");
// //   const [insightLoading, setInsightLoading] = useState(false);
// //   const [insightError, setInsightError] = useState("");
// //   const [isCached, setIsCached] = useState(false);

// //   useEffect(() => {
// //     if (!feature) {
// //       return;
// //     }

// //     let active = true;
// //     const state = feature.properties;

// //     async function loadInsight() {
// //       setInsightLoading(true);
// //       setInsightError("");
// //       setInsight("");
// //       setIsCached(false);

// //       try {
// //         const response = await fetch("/api/atlas/insight", {
// //           method: "POST",
// //           headers: {
// //             "Content-Type": "application/json",
// //           },
// //           body: JSON.stringify({
// //             year,
// //             slug: state.slug,
// //             state: {
// //               name: state.name,
// //               leader: state.leader,
// //               capital: state.capital,
// //               summary: state.summary,
// //               metadata: state.metadata,
// //             },
// //           }),
// //         });

// //         if (!response.ok) {
// //           throw new Error("insight-failed");
// //         }

// //         const data = await response.json();

// //         if (active) {
// //           setInsight(data.text ?? "");
// //           setIsCached(data.cached === true);
// //         }
// //       } catch {
// //         if (active) {
// //           setInsightError("AI тайлбар ачаалагдсангүй.");
// //         }
// //       } finally {
// //         if (active) {
// //           setInsightLoading(false);
// //         }
// //       }
// //     }

// //     void loadInsight();

// //     return () => {
// //       active = false;
// //     };
// //   }, [feature, year]);

// //   if (!feature) {
// //     return null;
// //   }

// //   return (
// //     <div className="hidden h-full md:block">
// //       <div className="flex h-full flex-col rounded-[28px] border border-amber-500/20 bg-slate-950/92 p-5 text-stone-200 shadow-[0_25px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl">
// //         <div className="flex items-start justify-between gap-3">
// //           <div>
// //             <p className="text-[10px] uppercase tracking-[0.35em] text-amber-500/70">Selected State</p>
// //             <h3 className="mt-2 font-[family:var(--font-cinzel)] text-2xl font-semibold text-stone-100">
// //               {feature.properties.name}
// //             </h3>
// //           </div>
// //           <button
// //             type="button"
// //             onClick={onClose}
// //             className="rounded-full border border-white/10 bg-white/5 p-2 text-stone-300 transition hover:bg-white/10"
// //           >
// //             <X className="size-4" />
// //           </button>
// //         </div>

// //         <div className="mt-4 flex items-center gap-2 text-sm text-stone-400">
// //           <MapPinned className="size-4 text-amber-500" />
// //           <span>{feature.properties.capital}</span>
// //         </div>

// //         <div className="mt-4 grid gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-stone-300">
// //           <p><span className="text-stone-500">Удирдагч:</span> {feature.properties.leader}</p>
// //           <p><span className="text-stone-500">Нийслэл:</span> {feature.properties.capital}</p>
// //           <p><span className="text-stone-500">Сүүлд шинэчлэгдсэн:</span> {new Date(feature.properties.updatedAt).toLocaleString()}</p>
// //         </div>

// //         <div className="mt-4 rounded-2xl border border-amber-500/15 bg-amber-500/[0.05] p-4">
// //           <p className="text-sm leading-7 text-stone-200">{feature.properties.summary}</p>
// //         </div>

// //         <div className="mt-4 flex-1 overflow-y-auto rounded-2xl border border-amber-500/15 bg-amber-500/[0.04] p-4">
// //           <div className="flex items-center gap-2">
// //             <Sparkles className="size-4 text-amber-500" />
// //             <p className="text-[10px] uppercase tracking-[0.3em] text-amber-500/80">Хүүрнэгч</p>
// //             {isCached && !insightLoading && (
// //               <span className="ml-auto rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] uppercase tracking-widest text-emerald-400">
// //                 cached
// //               </span>
// //             )}
// //           </div>

// //           {insightLoading ? (
// //             <div className="mt-4 flex items-center gap-2 text-sm text-stone-300">
// //               <Loader2 className="size-4 animate-spin" />
// //               AI тайлбар үүсгэж байна...
// //             </div>
// //           ) : insightError ? (
// //             <p className="mt-4 text-sm text-red-300">{insightError}</p>
// //           ) : (
// //             <div className="prose prose-invert mt-4 max-w-none prose-p:my-2 prose-li:my-1 prose-strong:text-amber-300">
// //               <ReactMarkdown>{insight}</ReactMarkdown>
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }




// "use client";

// import { useEffect, useState } from "react";
// import ReactMarkdown from "react-markdown";
// import { Loader2, X, Scroll, Sparkles, MapPin, Swords, Crown } from "lucide-react";
// import type { AtlasStateFeature } from "@/lib/types";

// const PANEL_BG = "rgba(12,7,2,0.98)";
// const BORDER = "#4a3010";
// const GOLD = "#c9a45d";
// const GOLD_DIM = "#8b6c35";
// const TEXT_MAIN = "#f0deb4";
// const TEXT_SUB = "#9a7c50";
// const TEXT_MUTED = "#5c4020";

// interface SelectedStateDrawerProps {
//   year: number;
//   feature: AtlasStateFeature | null;
//   onClose: () => void;
// }

// function OrnamentDivider() {
//   return (
//     <div className="flex items-center gap-2 my-3">
//       <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${BORDER})` }} />
//       <svg width="10" height="10" viewBox="0 0 10 10">
//         <polygon points="5,0 6.5,3.5 10,3.5 7.2,5.7 8.1,9.5 5,7.5 1.9,9.5 2.8,5.7 0,3.5 3.5,3.5" fill={GOLD_DIM} opacity="0.6"/>
//       </svg>
//       <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${BORDER}, transparent)` }} />
//     </div>
//   );
// }

// export default function SelectedStateDrawer({ year, feature, onClose }: SelectedStateDrawerProps) {
//   const [insight, setInsight] = useState("");
//   const [insightLoading, setInsightLoading] = useState(false);
//   const [insightError, setInsightError] = useState("");
//   const [isCached, setIsCached] = useState(false);

//   useEffect(() => {
//     if (!feature) return;
//     let active = true;
//     const state = feature.properties;

//     async function loadInsight() {
//       setInsightLoading(true);
//       setInsightError("");
//       setInsight("");
//       setIsCached(false);
//       try {
//         const res = await fetch("/api/atlas/insight", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             year, slug: state.slug,
//             state: { name: state.name, leader: state.leader, capital: state.capital, summary: state.summary, metadata: state.metadata },
//           }),
//         });
//         if (!res.ok) throw new Error();
//         const data = await res.json();
//         if (active) { setInsight(data.text ?? ""); setIsCached(data.cached === true); }
//       } catch {
//         if (active) setInsightError("Тайлбар ачаалагдсангүй.");
//       } finally {
//         if (active) setInsightLoading(false);
//       }
//     }
//     void loadInsight();
//     return () => { active = false; };
//   }, [feature, year]);

//   if (!feature) {
//     return (
//       <div
//         className="hidden h-full md:flex items-center justify-center rounded-[28px]"
//         style={{ background: PANEL_BG, border: `1px solid ${BORDER}` }}
//       >
//         <div className="text-center px-8">
//           <Scroll className="mx-auto mb-3 opacity-20" size={32} style={{ color: GOLD }} />
//           <p className="text-xs uppercase tracking-widest" style={{ color: TEXT_MUTED, fontFamily: "Georgia, serif" }}>
//             Нутаг дэвсгэр сонгоно уу
//           </p>
//         </div>
//       </div>
//     );
//   }

//   const color = feature.properties.color ?? "#c9a45d";

//   return (
//     <div className="hidden h-full md:block">
//       <div
//         className="flex h-full flex-col rounded-[28px] overflow-hidden"
//         style={{
//           background: PANEL_BG,
//           border: `1px solid ${BORDER}`,
//           boxShadow: `0 0 40px rgba(0,0,0,0.8), inset 0 0 60px rgba(201,164,93,0.03)`,
//           fontFamily: "Georgia, 'Times New Roman', serif",
//         }}
//       >
//         {/* Top colour bar */}
//         <div className="h-1 shrink-0" style={{ background: `linear-gradient(90deg, transparent 0%, ${color} 40%, ${color} 60%, transparent 100%)` }} />

//         {/* Scrollable content */}
//         <div className="flex-1 overflow-y-auto px-5 py-4">

//           {/* Header */}
//           <div className="flex items-start justify-between gap-3 mb-1">
//             <div>
//               <p className="text-[8px] uppercase tracking-[0.5em] mb-2" style={{ color: TEXT_MUTED }}>
//                 ᠮᠣᠩᠭᠣᠯ · Сонгосон нутаг
//               </p>
//               <h3
//                 className="text-xl font-bold leading-tight"
//                 style={{ color: GOLD, textShadow: `0 0 12px ${color}44` }}
//               >
//                 {feature.properties.name}
//               </h3>
//               {feature.properties.metadata?.periodName && (
//                 <p className="mt-0.5 text-xs italic" style={{ color: TEXT_SUB }}>
//                   «{String(feature.properties.metadata.periodName)}»
//                 </p>
//               )}
//             </div>
//             <button
//               type="button"
//               onClick={onClose}
//               className="shrink-0 rounded p-1.5 transition-opacity hover:opacity-60"
//               style={{ border: `1px solid ${BORDER}`, color: TEXT_MUTED }}
//             >
//               <X className="size-3.5" />
//             </button>
//           </div>

//           <OrnamentDivider />

//           {/* Stats row */}
//           <div className="grid grid-cols-1 gap-2 mb-3">
//             {[
//               { Icon: Crown, label: "Удирдагч", value: feature.properties.leader },
//               { Icon: MapPin, label: "Нийслэл", value: feature.properties.capital },
//               { Icon: Swords, label: "Он", value: `${year} он` },
//             ].map(({ Icon, label, value }) => (
//               <div
//                 key={label}
//                 className="flex items-center gap-3 rounded px-3 py-2"
//                 style={{ background: "rgba(255,200,100,0.04)", border: `1px solid ${BORDER}` }}
//               >
//                 <div
//                   className="flex h-6 w-6 shrink-0 items-center justify-center rounded"
//                   style={{ background: "rgba(201,164,93,0.10)", border: `1px solid ${BORDER}` }}
//                 >
//                   <Icon className="size-3" style={{ color: GOLD_DIM }} />
//                 </div>
//                 <span className="text-[9px] uppercase tracking-[0.2em] w-14 shrink-0" style={{ color: TEXT_MUTED }}>{label}</span>
//                 <span className="text-xs font-medium truncate" style={{ color: TEXT_MAIN }}>{value}</span>
//               </div>
//             ))}
//           </div>

//           <OrnamentDivider />

//           {/* Summary scroll */}
//           <div
//             className="rounded px-4 py-3 mb-3"
//             style={{
//               background: "rgba(255,200,100,0.03)",
//               border: `1px solid ${BORDER}`,
//               borderLeft: `3px solid ${color}55`,
//             }}
//           >
//             <p className="text-[9px] uppercase tracking-[0.3em] mb-2" style={{ color: TEXT_MUTED }}>
//               Товч түүх
//             </p>
//             <p className="text-xs leading-relaxed" style={{ color: TEXT_MAIN }}>
//               {feature.properties.summary}
//             </p>
//           </div>

//           {/* AI insight */}
//           <div
//             className="rounded px-4 py-3"
//             style={{
//               background: "rgba(255,200,100,0.025)",
//               border: `1px solid ${BORDER}`,
//             }}
//           >
//             <div className="flex items-center gap-2 mb-3">
//               <Sparkles className="size-3" style={{ color: GOLD_DIM }} />
//               <p className="text-[9px] uppercase tracking-[0.3em]" style={{ color: TEXT_MUTED }}>
//                 Түүхч тайлбар
//               </p>
//               {isCached && !insightLoading && (
//                 <span
//                   className="ml-auto text-[7px] uppercase tracking-widest px-1.5 py-0.5 rounded"
//                   style={{ border: `1px solid ${BORDER}`, color: TEXT_MUTED }}
//                 >
//                   cached
//                 </span>
//               )}
//             </div>

//             {insightLoading ? (
//               <div className="flex items-center gap-2 py-3" style={{ color: TEXT_SUB }}>
//                 <Loader2 className="size-3 animate-spin" />
//                 <span className="text-xs">Тайлбар бичигдэж байна…</span>
//               </div>
//             ) : insightError ? (
//               <p className="text-xs py-2" style={{ color: "#a05030" }}>{insightError}</p>
//             ) : (
//               <div
//                 className="text-xs leading-relaxed"
//                 style={{ color: TEXT_MAIN }}
//               >
//                 {/* Custom markdown render */}
//                 <div className="prose-game">
//                   <ReactMarkdown
//                     components={{
//                       h1: ({children}) => <h1 style={{color: GOLD, fontSize: "0.85rem", fontWeight: "bold", marginBottom: "6px"}}>{children}</h1>,
//                       h2: ({children}) => <h2 style={{color: GOLD_DIM, fontSize: "0.78rem", fontWeight: "bold", marginBottom: "4px", marginTop: "10px"}}>{children}</h2>,
//                       h3: ({children}) => <h3 style={{color: GOLD_DIM, fontSize: "0.75rem", fontWeight: "bold", marginBottom: "4px", marginTop: "8px"}}>{children}</h3>,
//                       strong: ({children}) => <strong style={{color: GOLD_DIM}}>{children}</strong>,
//                       p: ({children}) => <p style={{marginBottom: "6px", color: TEXT_MAIN}}>{children}</p>,
//                       li: ({children}) => <li style={{marginBottom: "2px", color: TEXT_MAIN, listStyleType: "disc", marginLeft: "12px"}}>{children}</li>,
//                       ol: ({children}) => <ol style={{marginLeft: "12px", marginBottom: "6px"}}>{children}</ol>,
//                       ul: ({children}) => <ul style={{marginBottom: "6px"}}>{children}</ul>,
//                     }}
//                   >
//                     {insight}
//                   </ReactMarkdown>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Footer */}
//           <p className="mt-3 text-[8px] text-right" style={{ color: TEXT_MUTED }}>
//             {new Date(feature.properties.updatedAt).toLocaleDateString("mn-MN")}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }




"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Loader2, X, Scroll, Sparkles, MapPin, Swords, Crown } from "lucide-react";
import type { AtlasStateFeature } from "@/lib/types";

// ── Theme ────────────────────────────────────────────────────────────────────
const T = {
  bg: "rgba(2,6,23,0.96)",
  border: "#1e293b",
  borderHover: "#334155",
  amber: "#f59e0b",
  amberDim: "#d97706",
  amberGlow: "#f59e0b15",
  text: "#e7e5e0",
  textSub: "#a8a29e",
  textMuted: "#57534e",
};

interface SelectedStateDrawerProps {
  year: number;
  feature: AtlasStateFeature | null;
  onClose: () => void;
}

function Divider() {
  return (
    <div className="flex items-center gap-2 my-2.5">
      <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${T.border})` }} />
      <div className="h-1 w-1 rounded-full" style={{ background: T.amberDim, opacity: 0.5 }} />
      <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${T.border}, transparent)` }} />
    </div>
  );
}

export default function SelectedStateDrawer({
  year,
  feature,
  onClose,
}: SelectedStateDrawerProps) {
  const [insight, setInsight] = useState("");
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState("");
  const [isCached, setIsCached] = useState(false);

  useEffect(() => {
    if (!feature) return;
    let active = true;
    const state = feature.properties;

    async function loadInsight() {
      setInsightLoading(true);
      setInsightError("");
      setInsight("");
      setIsCached(false);
      try {
        const res = await fetch("/api/atlas/insight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            year,
            slug: state.slug,
            state: {
              name: state.name,
              leader: state.leader,
              capital: state.capital,
              summary: state.summary,
              metadata: state.metadata,
            },
          }),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (active) {
          setInsight(data.text ?? "");
          setIsCached(data.cached === true);
        }
      } catch {
        if (active) setInsightError("Тайлбар ачаалагдсангүй.");
      } finally {
        if (active) setInsightLoading(false);
      }
    }
    void loadInsight();
    return () => { active = false; };
  }, [feature, year]);

  // Empty state
  if (!feature) {
    return (
      <div
        className="hidden h-full md:flex items-center justify-center rounded-2xl"
        style={{
          background: T.bg,
          border: `1px solid ${T.border}`,
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="text-center px-8">
          <Scroll
            className="mx-auto mb-3 opacity-15"
            size={28}
            style={{ color: T.amber }}
          />
          <p
            className="text-xs uppercase tracking-widest"
            style={{ color: T.textMuted, fontFamily: "Georgia, serif" }}
          >
            Нутаг дэвсгэр сонгоно уу
          </p>
        </div>
      </div>
    );
  }

  const color = feature.properties.color ?? "#f59e0b";

  return (
    <div className="hidden h-full md:block">
      <div
        className="flex h-full flex-col rounded-2xl overflow-hidden"
        style={{
          background: T.bg,
          border: `1px solid ${T.border}`,
          boxShadow: `0 0 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)`,
          backdropFilter: "blur(16px)",
          fontFamily: "'Georgia', 'Times New Roman', serif",
        }}
      >
        {/* Top colour bar */}
        <div
          className="h-0.5 shrink-0"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${color} 35%, ${T.amber} 50%, ${color} 65%, transparent 100%)`,
          }}
        />

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-1">
            <div>
              <p className="text-[8px] uppercase tracking-[0.5em] mb-2" style={{ color: T.textMuted }}>
                Сонгосон нутаг
              </p>
              <h3
                className="text-lg font-bold leading-tight"
                style={{ color: T.amber, textShadow: `0 0 12px ${color}33` }}
              >
                {feature.properties.name}
              </h3>
              {feature.properties.metadata?.periodName && (
                <p className="mt-0.5 text-xs italic" style={{ color: T.textSub }}>
                  «{String(feature.properties.metadata.periodName)}»
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-md p-1.5 transition-opacity hover:opacity-60"
              style={{ border: `1px solid ${T.border}`, color: T.textMuted }}
            >
              <X className="size-3.5" />
            </button>
          </div>

          <Divider />

          {/* Stats */}
          <div className="grid gap-1.5 mb-3">
            {[
              { Icon: Crown, label: "Удирдагч", value: feature.properties.leader },
              { Icon: MapPin, label: "Нийслэл", value: feature.properties.capital },
              { Icon: Swords, label: "Он", value: `${year} он` },
            ].map(({ Icon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-lg px-3 py-2"
                style={{
                  background: "rgba(15,23,42,0.5)",
                  border: `1px solid ${T.border}`,
                }}
              >
                <div
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                  style={{ background: T.amberGlow, border: `1px solid ${T.amber}22` }}
                >
                  <Icon className="size-3" style={{ color: T.amberDim }} />
                </div>
                <span
                  className="text-[9px] uppercase tracking-[0.2em] w-14 shrink-0"
                  style={{ color: T.textMuted }}
                >
                  {label}
                </span>
                <span
                  className="text-xs font-medium truncate"
                  style={{ color: T.text }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>

          <Divider />

          {/* Summary */}
          <div
            className="rounded-lg px-4 py-3 mb-3"
            style={{
              background: "rgba(15,23,42,0.4)",
              border: `1px solid ${T.border}`,
              borderLeft: `3px solid ${color}66`,
            }}
          >
            <p
              className="text-[9px] uppercase tracking-[0.3em] mb-2"
              style={{ color: T.textMuted }}
            >
              Товч түүх
            </p>
            <p className="text-xs leading-relaxed" style={{ color: T.text }}>
              {feature.properties.summary}
            </p>
          </div>

          {/* AI Insight */}
          <div
            className="rounded-lg px-4 py-3"
            style={{
              background: "rgba(15,23,42,0.3)",
              border: `1px solid ${T.border}`,
            }}
          >
            <div className="flex items-center gap-2 mb-2.5">
              <Sparkles className="size-3" style={{ color: T.amberDim }} />
              <p
                className="text-[9px] uppercase tracking-[0.3em]"
                style={{ color: T.textMuted }}
              >
                Түүхч тайлбар
              </p>
              {isCached && !insightLoading && (
                <span
                  className="ml-auto text-[7px] uppercase tracking-widest px-1.5 py-0.5 rounded"
                  style={{ border: `1px solid ${T.border}`, color: T.textMuted }}
                >
                  cached
                </span>
              )}
            </div>

            {insightLoading ? (
              <div
                className="flex items-center gap-2 py-3"
                style={{ color: T.textSub }}
              >
                <Loader2 className="size-3 animate-spin" />
                <span className="text-xs">Тайлбар бичигдэж байна…</span>
              </div>
            ) : insightError ? (
              <p className="text-xs py-2" style={{ color: "#f87171" }}>
                {insightError}
              </p>
            ) : (
              <div className="text-xs leading-relaxed" style={{ color: T.text }}>
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 style={{ color: T.amber, fontSize: "0.85rem", fontWeight: "bold", marginBottom: "6px" }}>
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 style={{ color: T.amberDim, fontSize: "0.78rem", fontWeight: "bold", marginBottom: "4px", marginTop: "10px" }}>
                        {children}
                      </h2>
                    ),
                    strong: ({ children }) => (
                      <strong style={{ color: T.amberDim }}>{children}</strong>
                    ),
                    p: ({ children }) => (
                      <p style={{ marginBottom: "6px", color: T.text }}>{children}</p>
                    ),
                    li: ({ children }) => (
                      <li style={{ marginBottom: "2px", color: T.text, listStyleType: "disc", marginLeft: "12px" }}>
                        {children}
                      </li>
                    ),
                    ul: ({ children }) => (
                      <ul style={{ marginBottom: "6px" }}>{children}</ul>
                    ),
                  }}
                >
                  {insight}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Footer */}
          <p className="mt-3 text-[8px] text-right" style={{ color: T.textMuted }}>
            {new Date(feature.properties.updatedAt).toLocaleDateString("mn-MN")}
          </p>
        </div>
      </div>
    </div>
  );
}