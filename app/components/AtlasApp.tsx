// // "use client";

// // import dynamic from "next/dynamic";
// // import { useEffect, useMemo, useState, useCallback } from "react";
// // import { useUser } from "@clerk/nextjs";
// // import SelectedStateDrawer from "@/app/components/SelectedStateDrawer";
// // import { Sidebar } from "@/app/components/Sidebar";
// // import TimelineSlider from "@/app/components/TimelineSlider";
// // import type { AtlasFeatureCollection, AtlasStateFeature } from "@/lib/types";


// // const CoordEditor = dynamic(() => import("@/app/components/CoordEditor"), {
// //   ssr: false,
// // }) as any;

// // const GlobeMap = dynamic(
// //   () => import("@/app/components/Globemap").then((m) => ({ default: m.default })),
// //   { ssr: false, loading: () => <MapLoader label="Дэлхийн бөмбөрцөг" /> },
// // );


// // const HistoricalMap = dynamic(
// //   () => import("@/app/components/HistoricalMap").then((m) => ({ default: m.default })),
// //   { ssr: false, loading: () => <MapLoader label="Түүхэн зураг" /> },
// // );

// // function MapLoader({ label }: { label: string }) {
// //   return (
// //     <div className="flex h-full w-full items-center justify-center bg-slate-950">
// //       <div className="flex flex-col items-center gap-5">
// //         <div className="relative h-16 w-16">
// //           <div
// //             className="absolute inset-0 rounded-full animate-spin"
// //             style={{ border: "2px solid transparent", borderTopColor: "#f59e0b", borderRightColor: "#f59e0b44" }}
// //           />
// //           <div
// //             className="absolute inset-3 rounded-full animate-spin"
// //             style={{ border: "2px solid transparent", borderTopColor: "#d97706", animationDirection: "reverse", animationDuration: "1.4s" }}
// //           />
// //         </div>
// //         <p className="text-[9px] uppercase tracking-[0.5em]" style={{ color: "#57534e", fontFamily: "Georgia, serif" }}>
// //           {label} ачаалж байна
// //         </p>
// //       </div>
// //     </div>
// //   );
// // }

// // type MapMode = "globe" | "tactical" | "historical";

// // const MAP_OPTIONS: { mode: MapMode; label: string; mn: string; icon: string }[] = [
// //   { mode: "globe",      label: "Globe",    mn: "Бөмбөрцөг",  icon: "🌐" },
// //   { mode: "tactical",   label: "Tactical", mn: "Тактик",     icon: "⚔" },
// //   { mode: "historical", label: "Flat Map", mn: "Хавтгай",    icon: "🗺" },
// // ];

// // function MapSwitcher({
// //   current,
// //   onChange,
// // }: {
// //   current: MapMode;
// //   onChange: (m: MapMode) => void;
// // }) {
// //   const T = {
// //     bg: "rgba(2,6,23,0.92)",
// //     border: "#1e293b",
// //     amber: "#f59e0b",
// //     amberDim: "#d97706",
// //     text: "#e7e5e0",
// //     muted: "#57534e",
// //   };

// //   return (
// //     <div
// //       className="pointer-events-auto flex items-center gap-1 rounded-lg p-1"
// //       style={{
// //         background: T.bg,
// //         border: `1px solid ${T.border}`,
// //         backdropFilter: "blur(12px)",
// //         boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
// //       }}
// //     >
// //       {MAP_OPTIONS.map(({ mode, mn, icon }) => {
// //         const active = mode === current;
// //         return (
// //           <button
// //             key={mode}
// //             type="button"
// //             onClick={() => onChange(mode)}
// //             className="flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-all duration-150"
// //             style={{
// //               background: active
// //                 ? `linear-gradient(135deg, ${T.amber}22, ${T.amberDim}11)`
// //                 : "transparent",
// //               border: `1px solid ${active ? T.amber + "55" : "transparent"}`,
// //               color: active ? T.amber : T.muted,
// //               fontSize: "10px",
// //               fontFamily: "Georgia, serif",
// //               letterSpacing: "0.06em",
// //               cursor: "pointer",
// //               boxShadow: active ? `0 0 8px ${T.amber}22` : "none",
// //               whiteSpace: "nowrap",
// //             }}
// //             title={mode}
// //           >
// //             <span style={{ fontSize: "11px" }}>{icon}</span>
// //             <span className="uppercase tracking-widest hidden sm:inline">{mn}</span>
// //           </button>
// //         );
// //       })}
// //     </div>
// //   );
// // }

// // const T = {
// //   bg: "#020617",
// //   border: "#334155",
// //   amber: "#f59e0b",
// //   amberDim: "#d97706",
// //   amberGlow: "#f59e0b33",
// //   text: "#e7e5e0",
// //   textSub: "#a8a29e",
// //   textMuted: "#57534e",
// // };

// // export default function AtlasApp() {
// //   const { user, isLoaded } = useUser();
// //   const adminMode =
// //     isLoaded && (user?.publicMetadata as { role?: string } | undefined)?.role === "admin";

// //   const emptyForm = {
// //     periodName: "",
// //     name: "",
// //     leader: "",
// //     capital: "",
// //     color: "#c9a45d",
// //     summary: "",
// //   };

// //   const [mapMode, setMapMode] = useState<MapMode>("globe");

// //   const [years, setYears] = useState<number[]>([]);
// //   const [year, setYear] = useState(1206);
// //   const [collection, setCollection] = useState<AtlasFeatureCollection | null>(null);
// //   const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
// //   const [search, setSearch] = useState("");
// //   const [isEditing, setIsEditing] = useState(false);
// //   const [isCreating, setIsCreating] = useState(false);
// //   const [addPointMode, setAddPointMode] = useState(false);
// //   const [draftRing, setDraftRing] = useState<Array<[number, number]>>([]);
// //   const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
// //   const [saveError, setSaveError] = useState<string | null>(null);
// //   const [loadError, setLoadError] = useState<string | null>(null);
// //   const [form, setForm] = useState(emptyForm);
// //   const [selectedVertexIndex, setSelectedVertexIndex] = useState<number | null>(null);

// //   useEffect(() => {
// //     fetch("/api/atlas/years")
// //       .then((r) => r.json())
// //       .then((data) => {
// //         const nextYears = data.years as number[];
// //         setYears(nextYears);
// //         if (nextYears.length > 0 && !nextYears.includes(year)) setYear(nextYears[0]);
// //       })
// //       .catch(() => setLoadError("Timeline ачаалахад алдаа гарлаа."));
// //   }, [year]);

// //   useEffect(() => {
// //     setLoadError(null);
// //     fetch(`/api/atlas/states?year=${year}`)
// //       .then(async (r) => {
// //         if (!r.ok) throw new Error();
// //         return r.json();
// //       })
// //       .then((data: AtlasFeatureCollection) => {
// //         setCollection(data);
// //         setSelectedSlug((cur) => {
// //           const ok = data.features.some((f) => f.properties.slug === cur);
// //           return ok ? cur : data.features[0]?.properties.slug ?? null;
// //         });
// //         setIsEditing(false);
// //         setIsCreating(false);
// //         setAddPointMode(false);
// //         setSelectedVertexIndex(null);
// //         setSaveState("idle");
// //         setSaveError(null);
// //       })
// //       .catch(() => {
// //         setCollection(null);
// //         setSelectedSlug(null);
// //         setLoadError("Газрын зураг ачаалагдсангүй.");
// //       });
// //   }, [year]);

// //   const selectedFeature = useMemo(
// //     () => collection?.features.find((f) => f.properties.slug === selectedSlug) ?? null,
// //     [collection, selectedSlug],
// //   );

// //   const filteredFeatures = useMemo(() => {
// //     if (!collection) return [];
// //     const q = search.trim().toLowerCase();
// //     return collection.features.filter(
// //       (f) =>
// //         !q ||
// //         f.properties.name.toLowerCase().includes(q) ||
// //         f.properties.leader.toLowerCase().includes(q) ||
// //         f.properties.capital.toLowerCase().includes(q),
// //     );
// //   }, [collection, search]);

// //   useEffect(() => {
// //     if (!selectedFeature || isCreating) {
// //       setDraftRing([]);
// //       return;
// //     }
// //     setDraftRing(selectedFeature.geometry.coordinates[0] as Array<[number, number]>);
// //     setForm({
// //       periodName: String(selectedFeature.properties.metadata?.periodName ?? ""),
// //       name: selectedFeature.properties.name,
// //       leader: selectedFeature.properties.leader,
// //       capital: selectedFeature.properties.capital,
// //       color: selectedFeature.properties.color,
// //       summary: selectedFeature.properties.summary,
// //     });
// //     setSelectedVertexIndex(null);
// //     setSaveState("idle");
// //     setSaveError(null);
// //   }, [isCreating, selectedFeature]);

// //   const handleSelectSlug = useCallback((slug: string) => {
// //     setSelectedSlug(slug);
// //   }, []);

// //   function handleDeleteVertex(index: number) {
// //     if (draftRing.length <= 4) return;
// //     const next = draftRing.filter((_, i) => i !== index);
// //     setDraftRing(next);
// //     setSelectedVertexIndex(null);
// //   }

// //   function resetCreateMode() {
// //     setIsCreating(false);
// //     setIsEditing(false);
// //     setAddPointMode(false);
// //     setSelectedVertexIndex(null);
// //     setDraftRing((selectedFeature?.geometry.coordinates[0] as Array<[number, number]>) ?? []);
// //     setForm(
// //       selectedFeature
// //         ? {
// //             periodName: String(selectedFeature.properties.metadata?.periodName ?? ""),
// //             name: selectedFeature.properties.name,
// //             leader: selectedFeature.properties.leader,
// //             capital: selectedFeature.properties.capital,
// //             color: selectedFeature.properties.color,
// //             summary: selectedFeature.properties.summary,
// //           }
// //         : emptyForm,
// //     );
// //     setSaveState("idle");
// //     setSaveError(null);
// //   }

// //   async function handleSaveGeometry() {
// //     if (draftRing.length < 4) return;
// //     if (!form.name || form.name.length < 2) {
// //       setSaveError("Нэр дор хаяж 2 тэмдэгт байна.");
// //       setSaveState("error");
// //       return;
// //     }
// //     if (!form.summary || form.summary.length < 8) {
// //       setSaveError("Тайлбар дор хаяж 8 тэмдэгт байна.");
// //       setSaveState("error");
// //       return;
// //     }
// //     try {
// //       setSaveState("saving");
// //       setSaveError(null);
// //       if (isCreating) {
// //         const res = await fetch("/api/atlas/states", {
// //           method: "POST",
// //           headers: { "Content-Type": "application/json" },
// //           body: JSON.stringify({
// //             year,
// //             name: form.name,
// //             leader: form.leader,
// //             capital: form.capital,
// //             color: form.color,
// //             summary: form.summary,
// //             metadata: { periodName: form.periodName },
// //             coordinates: draftRing,
// //           }),
// //         });
// //         if (!res.ok) {
// //           const b = await res.json().catch(() => ({}));
// //           throw new Error((b as { error?: string }).error ?? "create-failed");
// //         }
// //         const { feature: cf, collection: nextCollection } = (await res.json()) as {
// //           feature: AtlasStateFeature;
// //           collection?: AtlasFeatureCollection;
// //         };
// //         setCollection((c) => {
// //           if (nextCollection) return nextCollection;
// //           return c
// //             ? { ...c, features: [...c.features, cf] }
// //             : { type: "FeatureCollection", year, features: [cf] };
// //         });
// //         setSelectedSlug(cf.properties.slug);
// //         setIsCreating(false);
// //         setIsEditing(false);
// //         setSelectedVertexIndex(null);
// //         setDraftRing(cf.geometry.coordinates[0] as Array<[number, number]>);
// //         setForm({
// //           name: cf.properties.name,
// //           leader: cf.properties.leader,
// //           capital: cf.properties.capital,
// //           color: cf.properties.color,
// //           summary: cf.properties.summary,
// //           periodName: String(cf.properties.metadata?.periodName ?? ""),
// //         });
// //         setSaveState("saved");
// //         setTimeout(() => setSaveState("idle"), 1800);
// //         return;
// //       }
// //       if (!selectedFeature) throw new Error("no-feature");
// //       const res = await fetch(`/api/atlas/states/${selectedFeature.properties.slug}`, {
// //         method: "PATCH",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({
// //           year,
// //           name: form.name,
// //           leader: form.leader,
// //           capital: form.capital,
// //           color: form.color,
// //           summary: form.summary,
// //           metadata: { ...(selectedFeature.properties.metadata ?? {}), periodName: form.periodName },
// //           coordinates: draftRing,
// //         }),
// //       });
// //       if (!res.ok) {
// //         const b = await res.json().catch(() => ({}));
// //         throw new Error((b as { error?: string }).error ?? "save-failed");
// //       }
// //       const { feature: uf } = (await res.json()) as { feature: AtlasStateFeature };
// //       setCollection((c) =>
// //         c
// //           ? { ...c, features: c.features.map((f) => (f.properties.slug === uf.properties.slug ? uf : f)) }
// //           : c,
// //       );
// //       setDraftRing(uf.geometry.coordinates[0] as Array<[number, number]>);
// //       setSelectedVertexIndex(null);
// //       setSaveState("saved");
// //       setTimeout(() => setSaveState("idle"), 1800);
// //     } catch (err) {
// //       setSaveState("error");
// //       setSaveError(err instanceof Error ? err.message : "Хадгалахад алдаа гарлаа.");
// //     }
// //   }

// //   async function handleDeleteState() {
// //     if (!selectedFeature || isCreating) return;
// //     try {
// //       setSaveState("saving");
// //       const res = await fetch(
// //         `/api/atlas/states/${selectedFeature.properties.slug}?year=${year}`,
// //         { method: "DELETE" },
// //       );
// //       if (!res.ok) throw new Error();
// //       setCollection((c) => {
// //         if (!c) return c;
// //         const next = c.features.filter((f) => f.properties.slug !== selectedFeature.properties.slug);
// //         setSelectedSlug(next[0]?.properties.slug ?? null);
// //         return { ...c, features: next };
// //       });
// //       setDraftRing([]);
// //       setSelectedVertexIndex(null);
// //       setForm(emptyForm);
// //       setIsEditing(false);
// //       setSaveState("saved");
// //       setTimeout(() => setSaveState("idle"), 1800);
// //     } catch {
// //       setSaveState("error");
// //       setSaveError("Устгахад алдаа гарлаа.");
// //     }
// //   }

// //   const sharedMapProps = {
// //     collection,
// //     selectedSlug,
// //     onSelectSlug: handleSelectSlug,
// //     isEditing: adminMode && isEditing,
// //     isCreating: adminMode && isCreating,
// //     addPointMode: adminMode && addPointMode,
// //     draftRing,
// //     onDraftRingChange: setDraftRing,
// //     selectedVertexIndex,
// //     onSelectVertex: setSelectedVertexIndex,
// //   };

// //   const coordEditorProps = {
// //     year,
// //     feature: selectedFeature,
// //     isEditing,
// //     isCreating,
// //     addPointMode,
// //     draftRing,
// //     saveState,
// //     saveError,
// //     form,
// //     onFormChange: (f: "periodName" | "name" | "leader" | "capital" | "color" | "summary", v: string) =>
// //       setForm((c) => ({ ...c, [f]: v })),
// //     onStartCreate: () => {
// //       setSelectedSlug(null);
// //       setIsCreating(true);
// //       setIsEditing(true);
// //       setAddPointMode(false);
// //       setSelectedVertexIndex(null);
// //       setDraftRing([]);
// //       setForm(emptyForm);
// //       setSaveState("idle");
// //       setSaveError(null);
// //     },
// //     onCancelCreate: resetCreateMode,
// //     onToggleEditing: () => {
// //       setIsEditing((c) => !c);
// //       setAddPointMode(false);
// //       setSelectedVertexIndex(null);
// //       setSaveState("idle");
// //       setSaveError(null);
// //     },
// //     onToggleAddPoint: () => setAddPointMode((c) => !c),
// //     onReset: () => {
// //       if (isCreating) { setDraftRing([]); setSelectedVertexIndex(null); setSaveState("idle"); setSaveError(null); return; }
// //       if (!selectedFeature) return;
// //       setDraftRing(selectedFeature.geometry.coordinates[0] as Array<[number, number]>);
// //       setSelectedVertexIndex(null);
// //       setForm({
// //         periodName: String(selectedFeature.properties.metadata?.periodName ?? ""),
// //         name: selectedFeature.properties.name,
// //         leader: selectedFeature.properties.leader,
// //         capital: selectedFeature.properties.capital,
// //         color: selectedFeature.properties.color,
// //         summary: selectedFeature.properties.summary,
// //       });
// //       setSaveState("idle");
// //       setSaveError(null);
// //     },
// //     onSave: handleSaveGeometry,
// //     onDelete: handleDeleteState,
// //     selectedVertexIndex,  
// //     onSelectVertex: setSelectedVertexIndex,
// //     onDeleteVertex: handleDeleteVertex,
// //   };

// //   return (
// //     <main
// //       className="min-h-screen overflow-hidden"
// //       style={{ background: T.bg, fontFamily: "'Georgia', 'Times New Roman', serif" }}
// //     >
// //       <div className="flex min-h-screen flex-col lg:h-screen lg:flex lg:flex-row lg:overflow-hidden">

// //         <Sidebar
// //           year={year}
// //           features={filteredFeatures}
// //           selectedFeature={selectedFeature}
// //           onSelectSlug={handleSelectSlug}
// //           search={search}
// //           onSearchChange={setSearch}
// //           adminMode={adminMode}
// //           user={user}
// //         />

// //         <section className="relative flex-1 flex flex-col min-h-[70vh] lg:h-screen lg:min-h-0 overflow-hidden">

// //           <div className="absolute inset-0 z-0">
// //             {mapMode === "globe" && <GlobeMap {...sharedMapProps} />}
// //             {mapMode === "historical" && <HistoricalMap {...sharedMapProps} />}
// //           </div>

// //           <div className="relative z-20 pointer-events-none flex justify-between items-start px-4 pt-3 gap-3">

// //             <div
// //               className="pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-lg"
// //               style={{
// //                 background: "rgba(2,6,23,0.88)",
// //                 border: `1px solid ${T.border}`,
// //                 backdropFilter: "blur(12px)",
// //                 boxShadow: `0 4px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)`,
// //               }}
// //             >
// //               <svg width="18" height="18" viewBox="0 0 18 18" className="shrink-0">
// //                 <polygon
// //                   points="9,1 11,6.5 17,6.5 12.2,10.2 14,16 9,12.5 4,16 5.8,10.2 1,6.5 7,6.5"
// //                   fill={T.amber}
// //                   opacity="0.85"
// //                 />
// //               </svg>
// //               <div>
// //                 <h1 className="text-sm font-bold leading-none" style={{ color: T.amber, letterSpacing: "0.1em", textShadow: `0 0 12px ${T.amberGlow}` }}>
// //                   МОНГОЛ · ТӨВ АЗИЙН АТЛАС
// //                 </h1>
// //                 <p className="text-[8px] mt-1 tracking-[0.5em]" style={{ color: T.textMuted }}>
// //                   1162 — 1300 · ДУНДАД ЗУУН
// //                 </p>
// //               </div>
// //             </div>

// //             <div className="pointer-events-auto flex items-center gap-2 flex-wrap justify-end">

// //               <MapSwitcher current={mapMode} onChange={setMapMode} />

// //               {adminMode && (
// //                 <div
// //                   className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] uppercase tracking-widest"
// //                   style={{
// //                     background: "rgba(2,6,23,0.88)",
// //                     border: `1px solid ${T.amber}44`,
// //                     color: T.amber,
// //                     backdropFilter: "blur(12px)",
// //                   }}
// //                 >
// //                   <svg width="10" height="10" viewBox="0 0 10 10">
// //                     <polygon points="5,0 6.2,3.5 10,3.5 7,5.7 8,9.5 5,7.5 2,9.5 3,5.7 0,3.5 3.8,3.5" fill={T.amber} />
// //                   </svg>
// //                   Хаан
// //                 </div>
// //               )}

// //               {collection && (
// //                 <div
// //                   className="px-3 py-2 rounded-lg text-[10px] uppercase tracking-widest"
// //                   style={{
// //                     background: "rgba(2,6,23,0.88)",
// //                     border: `1px solid ${T.border}`,
// //                     color: T.textSub,
// //                     backdropFilter: "blur(12px)",
// //                   }}
// //                 >
// //                   {collection.features.length} улс
// //                 </div>
// //               )}
// //             </div>
// //           </div>

// //           {loadError && (
// //             <div
// //               className="absolute top-16 left-4 z-30 rounded-lg px-4 py-2.5 text-xs"
// //               style={{
// //                 background: "rgba(30,5,5,0.95)",
// //                 border: `1px solid #7f1d1d`,
// //                 color: "#fca5a5",
// //                 backdropFilter: "blur(12px)",
// //               }}
// //             >
// //               ⚠ {loadError}
// //             </div>
// //           )}

// //           <div
// //             className="absolute top-16 right-4 bottom-28 z-20 w-85 hidden xl:flex flex-col"
// //             style={{ pointerEvents: selectedFeature || adminMode ? "auto" : "none" }}
// //           >
// //             {adminMode ? (
// //               <div className="flex-1 overflow-hidden">
// //                 <CoordEditor {...coordEditorProps} />
// //               </div>
// //             ) : (
// //               <SelectedStateDrawer
// //                 year={year}
// //                 feature={selectedFeature}
// //                 onClose={() => setSelectedSlug(null)}
// //               />
// //             )}
// //           </div>

// //           <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-4">
// //             <div
// //               className="rounded-xl overflow-hidden"
// //               style={{
// //                 background: "rgba(2,6,23,0.93)",
// //                 border: `1px solid ${T.border}`,
// //                 backdropFilter: "blur(16px)",
// //                 boxShadow: `0 -4px 30px rgba(0,0,0,0.5)`,
// //               }}
// //             >
// //               <div
// //                 className="flex text-[8px] uppercase tracking-[0.3em] px-4 pt-2 pb-1 border-b"
// //                 style={{ borderColor: "#1e293b", color: T.textMuted }}
// //               >
// //                 {[
// //                   { label: "Эрт дундад зуун", flex: 2 },
// //                   { label: "Дунд үе", flex: 3 },
// //                   { label: "Өндөр дундад зуун", flex: 2 },
// //                   { label: "Монголын хаант улс", flex: 3 },
// //                 ].map(({ label, flex }) => (
// //                   <div key={label} className="text-center" style={{ flex }}>{label}</div>
// //                 ))}
// //               </div>
// //               <div className="px-4 py-3">
// //                 <TimelineSlider years={years} currentYear={year} onYearChange={setYear} />
// //               </div>
// //             </div>
// //           </div>

// //           <div className="relative z-10 px-4 pb-4 pt-[calc(70vh+1rem)] xl:hidden">
// //             {adminMode ? (
// //               <CoordEditor {...coordEditorProps} />
// //             ) : (
// //               <SelectedStateDrawer
// //                 year={year}
// //                 feature={selectedFeature}
// //                 onClose={() => setSelectedSlug(null)}
// //               />
// //             )}
// //           </div>

// //         </section>
// //       </div>
// //     </main>
// //   );
// // }






// // app/components/AtlasApp.tsx эсвэл таны AtlasApp байрлаж байгаа файл
// "use client";

// import dynamic from "next/dynamic";
// import { useCallback, useEffect, useMemo, useState } from "react";
// import { useUser } from "@clerk/nextjs";
// import SelectedStateDrawer from "@/app/components/SelectedStateDrawer";
// import { Sidebar } from "@/app/components/Sidebar";
// import TimelineSlider from "@/app/components/TimelineSlider";
// import type { AtlasFeatureCollection, AtlasStateFeature } from "@/lib/types";

// const CoordEditor = dynamic(() => import("@/app/components/CoordEditor"), {
//   ssr: false,
// }) as any;

// const GlobeMap = dynamic(
//   () => import("@/app/components/Globemap").then((m) => ({ default: m.default })),
//   {
//     ssr: false,
//     loading: () => <MapLoader label="Дэлхийн бөмбөрцөг" />,
//   }
// );

// const HistoricalMap = dynamic(
//   () => import("@/app/components/HistoricalMap").then((m) => ({ default: m.default })),
//   {
//     ssr: false,
//     loading: () => <MapLoader label="Түүхэн зураг" />,
//   }
// );

// type MapMode = "globe" | "historical";

// type RoleId =
//   | "malchin"
//   | "aduuchin"
//   | "helmerch"
//   | "oydolchin"
//   | "tariachin"
//   | "aravt"
//   | "zuut"
//   | "myangat"
//   | "myangatiin_noyon"
//   | "bicheech"
//   | "darkhan"
//   | "anchin"
//   | "hudaldaachin"
//   | "boo_udgan";

// type RoleScore = Partial<Record<RoleId, number>>;

// type CharacterRole = {
//   id: RoleId;
//   name: string;
//   subtitle: string;
//   icon: string;
//   description: string;
//   strengths: string[];
// };

// type RpgQuestion = {
//   id: string;
//   question: string;
//   options: {
//     label: string;
//     scores: RoleScore;
//   }[];
// };

// const T = {
//   bg: "#080502",
//   panel: "rgba(8,5,2,0.92)",
//   border: "#2a1a08",
//   borderMid: "#3d2a12",
//   amber: "#c9a45d",
//   amberBright: "#f0c060",
//   amberDim: "#8b6c35",
//   amberGlow: "rgba(201,164,93,0.25)",
//   text: "#e8d8b8",
//   textSub: "#9a7c50",
//   textMuted: "#5c4020",
//   red: "#c06060",
// };

// const MAP_OPTIONS: {
//   mode: MapMode;
//   label: string;
//   mn: string;
//   icon: string;
//   desc: string;
// }[] = [
//   {
//     mode: "globe",
//     label: "Globe",
//     mn: "Бөмбөрцөг",
//     icon: "🌐",
//     desc: "Гурван хэмжээст",
//   },
//   {
//     mode: "historical",
//     label: "Flat Map",
//     mn: "Хавтгай",
//     icon: "🗺",
//     desc: "Хуучин зураг",
//   },
// ];

// const CHARACTER_ROLES: CharacterRole[] = [
//   {
//     id: "malchin",
//     name: "Малчин",
//     subtitle: "Нүүдлийн амьдралын тулгуур",
//     icon: "🐑",
//     description:
//       "Чи овог аймгийн өдөр тутмын амьдралыг авч явдаг, мал сүрэг, бэлчээр, улирлын нүүдлийг хамгийн сайн мэддэг хүн.",
//     strengths: ["Тэвчээр", "Байгаль унших чадвар", "Гэр бүл/овогт үнэнч"],
//   },
//   {
//     id: "aduuchin",
//     name: "Адуучин",
//     subtitle: "Хүлэг морь, холын замын эзэн",
//     icon: "🐎",
//     description:
//       "Чи морь таних, сургах, холын аянд бэлтгэхдээ гарамгай. Морь бол чиний хүч, хурд, нэр төр.",
//     strengths: ["Хурд", "Морь таних мэдрэмж", "Эр зориг"],
//   },
//   {
//     id: "helmerch",
//     name: "Хэлмэрч",
//     subtitle: "Олон хэл, олон газрын гүүр",
//     icon: "🗣️",
//     description:
//       "Чи олон аймаг, худалдаачин, элч төлөөлөгчдийн үгийг холбож, зөрчлийг эвээр тайлах чадвартай.",
//     strengths: ["Хэл яриа", "Дипломат мэдрэмж", "Ажигч гярхай байдал"],
//   },
//   {
//     id: "oydolchin",
//     name: "Оёдолчин",
//     subtitle: "Дээл, туг, хэрэгслийн урлаач",
//     icon: "🧵",
//     description:
//       "Чи дээл хувцас, туг, уут сав, ахуйн хэрэглэлийг урлаж, отог аймгийн өнгө төрхийг бүтээдэг хүн.",
//     strengths: ["Нягт нямбай", "Гоо зүйн мэдрэмж", "Гарын ур"],
//   },
//   {
//     id: "tariachin",
//     name: "Тариачин",
//     subtitle: "Суурин иргэншлийн хүнс тэжээлийн түшиг",
//     icon: "🌾",
//     description:
//       "Чи газар, ус, улирлыг тооцож ургац авдаг. Нүүдэлчдийн ертөнцөд тогтвортой хүнс, хөдөлмөрийн үнэ цэнийг сануулна.",
//     strengths: ["Төлөвлөлт", "Хөдөлмөрч зан", "Тогтвортой байдал"],
//   },
//   {
//     id: "aravt",
//     name: "Аравт",
//     subtitle: "Арван хүний сахилга баттай дайчин",
//     icon: "🛡️",
//     description:
//       "Чи жижиг бүлгийнхээ дунд найдвартай, тушаал биелүүлдэг, хамтрагчаа орхидоггүй дайчин.",
//     strengths: ["Сахилга бат", "Багаар ажиллах", "Шийдэмгий байдал"],
//   },
//   {
//     id: "zuut",
//     name: "Зуут",
//     subtitle: "Зуун цэргийн зохион байгуулагч",
//     icon: "⚔️",
//     description:
//       "Чи зөвхөн тулалдахаас гадна хүмүүсийг эмхэлж, тушаал дамжуулж, зохион байгуулалт хийж чадна.",
//     strengths: ["Удирдах эхлэл", "Тактик", "Хариуцлага"],
//   },
//   {
//     id: "myangat",
//     name: "Мянгат",
//     subtitle: "Их цэргийн баганын ноён нуруу",
//     icon: "🏹",
//     description:
//       "Чи олон хүний хөдөлгөөн, хүнс, морь, зам, мэдээ мэдээллийг зэрэг тооцдог том зохион байгуулагч.",
//     strengths: ["Стратеги", "Тооцоо", "Том зураг харах"],
//   },
//   {
//     id: "myangatiin_noyon",
//     name: "Мянгатын ноён",
//     subtitle: "Их зохион байгуулалтын эзэн",
//     icon: "👑",
//     description:
//       "Чи эрх мэдэл, үүрэг, хариуцлага гурвыг зэрэг дааж чаддаг. Хүмүүс чиний шийдвэрийг дагана.",
//     strengths: ["Манлайлал", "Шийдвэр гаргалт", "Эв нэгдэл"],
//   },
//   {
//     id: "bicheech",
//     name: "Бичээч",
//     subtitle: "Зарлиг, мэдээ, түүхийг хадгалагч",
//     icon: "📜",
//     description:
//       "Чи үг, тэмдэглэл, тооцоо, гэрээ хэлэлцээг нягт хадгалдаг. Чиний бичсэн зүйл маргаашийн түүх болно.",
//     strengths: ["Ой тогтоолт", "Нягт нямбай", "Мэдлэг"],
//   },
//   {
//     id: "darkhan",
//     name: "Дархан",
//     subtitle: "Төмөр, мод, зэвсгийн урлаач",
//     icon: "🔨",
//     description:
//       "Чи хэрэгсэл, зэвсэг, тоног, эдлэл урлаж, хүний хүчийг эд зүйлээр нэмэгдүүлдэг бүтээгч.",
//     strengths: ["Уран чадвар", "Бүтээлч сэтгэлгээ", "Асуудал шийдэх"],
//   },
//   {
//     id: "anchin",
//     name: "Анчин",
//     subtitle: "Мөр уншигч, байгальд уусагч",
//     icon: "🦅",
//     description:
//       "Чи мөр, салхи, газрын хэв шинжийг анзаарч, амьд үлдэх чадвараараа бусдыг хамгаална.",
//     strengths: ["Мөрдөх", "Төвлөрөл", "Байгальд дасан зохицох"],
//   },
//   {
//     id: "hudaldaachin",
//     name: "Худалдаачин",
//     subtitle: "Зам, бараа, үнэ цэнийн мэдрэгч",
//     icon: "🐫",
//     description:
//       "Чи бараа солилцоо, үнэ цэнэ, зам харилцаа, хүмүүсийн хэрэгцээг сайн мэддэг ухаалаг наймаачин.",
//     strengths: ["Харилцаа", "Тооцоо", "Эрсдэл үнэлэх"],
//   },
//   {
//     id: "boo_udgan",
//     name: "Бөө / Удган",
//     subtitle: "Итгэл, ёс, билгийн дуу хоолой",
//     icon: "🔥",
//     description:
//       "Чи хүмүүсийн айдас, итгэл, ёс заншлыг мэдэрч, шийдвэр гаргах үед сэтгэл зүйн түшиг болдог.",
//     strengths: ["Зөн совин", "Ёс заншил", "Сэтгэл засах чадвар"],
//   },
// ];

// const RPG_QUESTIONS: RpgQuestion[] = [
//   {
//     id: "q1",
//     question: "Аян замд хамгийн түрүүнд чи юуг шалгах вэ?",
//     options: [
//       {
//         label: "Морьдын хүч, эмээл хазаар, замын хурдыг шалгана.",
//         scores: { aduuchin: 3, aravt: 1, zuut: 1 },
//       },
//       {
//         label: "Хүнс, ус, өвс бэлчээр хүрэлцэх эсэхийг тооцно.",
//         scores: { malchin: 2, tariachin: 2, myangat: 2 },
//       },
//       {
//         label: "Хэний нутаг, хэний хэл, ямар ёстойг асууна.",
//         scores: { helmerch: 3, hudaldaachin: 2, bicheech: 1 },
//       },
//       {
//         label: "Тэмдэглэл, зарлиг, тооцоогоо эмхэлнэ.",
//         scores: { bicheech: 3, myangatiin_noyon: 1 },
//       },
//     ],
//   },
//   {
//     id: "q2",
//     question: "Маргаан гарвал чи яаж шийдэх вэ?",
//     options: [
//       {
//         label: "Хоёр талын үгийг сонсоод эвлэрүүлэх гарц хайна.",
//         scores: { helmerch: 3, boo_udgan: 1, myangatiin_noyon: 1 },
//       },
//       {
//         label: "Дүрэм, тушаал, сахилга батыг баримтална.",
//         scores: { aravt: 2, zuut: 3, myangat: 1 },
//       },
//       {
//         label: "Ашиг, алдагдлыг тооцож тохиролцоо санал болгоно.",
//         scores: { hudaldaachin: 3, bicheech: 1 },
//       },
//       {
//         label: "Ахмадын ёс, тэнгэр шүтлэг, зан үйлийг сануулна.",
//         scores: { boo_udgan: 3, malchin: 1 },
//       },
//     ],
//   },
//   {
//     id: "q3",
//     question: "Чиний хамгийн их дуртай ажил юу вэ?",
//     options: [
//       {
//         label: "Гараар юм урлах, засах, гоё болгох.",
//         scores: { oydolchin: 3, darkhan: 3 },
//       },
//       {
//         label: "Газраа арчлах, ургацаа тооцох.",
//         scores: { tariachin: 4 },
//       },
//       {
//         label: "Мал сүрэг, бэлчээр, улирлын нүүдэл төлөвлөх.",
//         scores: { malchin: 4, aduuchin: 1 },
//       },
//       {
//         label: "Хүмүүсийг зохион байгуулж, үүрэг хуваарилах.",
//         scores: { zuut: 2, myangat: 3, myangatiin_noyon: 3 },
//       },
//     ],
//   },
//   {
//     id: "q4",
//     question: "Дайсны мэдээ ирвэл чи юу хийх вэ?",
//     options: [
//       {
//         label: "Тагнуулын мөр, газрын байдал, салхины чигийг ажиглана.",
//         scores: { anchin: 3, aravt: 1 },
//       },
//       {
//         label: "Цэргүүдийг бүлэглэж, тушаал дамжуулах бэлтгэл хийнэ.",
//         scores: { zuut: 3, myangat: 3, myangatiin_noyon: 1 },
//       },
//       {
//         label: "Хэлэлцээ хийх боломж байгаа эсэхийг судална.",
//         scores: { helmerch: 3, hudaldaachin: 1 },
//       },
//       {
//         label: "Морь, сум, тоног хэрэгслийг бэлэн болгоно.",
//         scores: { aduuchin: 2, darkhan: 2, aravt: 2 },
//       },
//     ],
//   },
//   {
//     id: "q5",
//     question: "Чамд нэг өдөр чөлөө өгвөл чи юу хийх вэ?",
//     options: [
//       {
//         label: "Морь унаж, тал нутгаар давхина.",
//         scores: { aduuchin: 4, anchin: 1 },
//       },
//       {
//         label: "Юм оёж, засаж, хэрэгтэй эдлэл бүтээнэ.",
//         scores: { oydolchin: 3, darkhan: 2 },
//       },
//       {
//         label: "Худалдаачидтай уулзаж сонин мэдээ сонсоно.",
//         scores: { hudaldaachin: 3, helmerch: 2 },
//       },
//       {
//         label: "Тэмдэглэл уншиж, хуучин явдлыг эргэцүүлнэ.",
//         scores: { bicheech: 3, boo_udgan: 1 },
//       },
//     ],
//   },
//   {
//     id: "q6",
//     question: "Хүмүүс чамайг юугаар хамгийн их үнэлдэг вэ?",
//     options: [
//       {
//         label: "Найдвартай, чимээгүй ч ажлаа хийдэг.",
//         scores: { malchin: 2, tariachin: 2, aravt: 2 },
//       },
//       {
//         label: "Удирдаж чаддаг, шийдвэр хурдан гаргадаг.",
//         scores: { zuut: 2, myangat: 3, myangatiin_noyon: 3 },
//       },
//       {
//         label: "Ухаантай ярьж, хүмүүсийг ойлгуулж чаддаг.",
//         scores: { helmerch: 3, hudaldaachin: 2 },
//       },
//       {
//         label: "Гарын уртай, нарийн мэдрэмжтэй.",
//         scores: { oydolchin: 3, darkhan: 3 },
//       },
//     ],
//   },
//   {
//     id: "q7",
//     question: "Чи ямар зүйлээс хамгийн их хүч авдаг вэ?",
//     options: [
//       {
//         label: "Тал нутаг, сүрэг мал, гэр бүлээс.",
//         scores: { malchin: 3, aduuchin: 1 },
//       },
//       {
//         label: "Эмх журам, туг сүлд, хамт олноос.",
//         scores: { aravt: 2, zuut: 2, myangat: 2 },
//       },
//       {
//         label: "Мэдлэг, бичиг, ой санамжаас.",
//         scores: { bicheech: 3, helmerch: 1 },
//       },
//       {
//         label: "Ёс заншил, билэг тэмдэг, сэтгэлийн хүчнээс.",
//         scores: { boo_udgan: 4 },
//       },
//     ],
//   },
//   {
//     id: "q8",
//     question: "Чи аль үүргийг өөртөө хамгийн ойр гэж мэдрэх вэ?",
//     options: [
//       {
//         label: "Амьдралыг тэтгэгч хүн.",
//         scores: { malchin: 2, tariachin: 3 },
//       },
//       {
//         label: "Зам, мэдээ, солилцоог холбогч хүн.",
//         scores: { helmerch: 2, hudaldaachin: 3, bicheech: 1 },
//       },
//       {
//         label: "Дайн, хамгаалалт, сахилгын хүн.",
//         scores: { aravt: 2, zuut: 2, myangat: 2, myangatiin_noyon: 1 },
//       },
//       {
//         label: "Урлал, хэрэгсэл, бүтээлийн хүн.",
//         scores: { oydolchin: 2, darkhan: 3 },
//       },
//     ],
//   },
// ];

// function MapLoader({ label }: { label: string }) {
//   return (
//     <div
//       className="flex h-full w-full items-center justify-center"
//       style={{ background: "#06040200" }}
//     >
//       <div className="flex flex-col items-center gap-5">
//         <div className="relative h-14 w-14">
//           <div
//             className="absolute inset-0 rounded-full animate-spin"
//             style={{
//               border: "1.5px solid transparent",
//               borderTopColor: "#c9a45d",
//               borderRightColor: "rgba(201,164,93,0.3)",
//               animationDuration: "1.4s",
//             }}
//           />
//           <div
//             className="absolute inset-2.5 rounded-full animate-spin"
//             style={{
//               border: "1.5px solid transparent",
//               borderTopColor: "#8b6c35",
//               animationDirection: "reverse",
//               animationDuration: "2.1s",
//             }}
//           />
//           <div className="absolute inset-0 flex items-center justify-center">
//             <div
//               className="h-1.5 w-1.5 rounded-full"
//               style={{ background: "#c9a45d", opacity: 0.7 }}
//             />
//           </div>
//         </div>
//         <p
//           className="text-[9px] uppercase tracking-[0.45em]"
//           style={{ color: "#5c4020", fontFamily: "Georgia, serif" }}
//         >
//           {label} ачаалж байна
//         </p>
//       </div>
//     </div>
//   );
// }

// function MapSwitcher({
//   current,
//   onChange,
// }: {
//   current: MapMode;
//   onChange: (m: MapMode) => void;
// }) {
//   return (
//     <div
//       className="pointer-events-auto flex items-center gap-0.5 rounded-xl p-1"
//       style={{
//         background: "rgba(8,5,2,0.92)",
//         border: `1px solid ${T.border}`,
//         backdropFilter: "blur(16px)",
//         boxShadow:
//           "0 4px 24px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.03)",
//       }}
//     >
//       {MAP_OPTIONS.map(({ mode, mn, icon }) => {
//         const active = mode === current;
//         return (
//           <button
//             key={mode}
//             type="button"
//             onClick={() => onChange(mode)}
//             className="relative flex items-center gap-1.5 rounded-lg px-3 py-2 transition-all duration-200"
//             style={{
//               background: active
//                 ? "linear-gradient(135deg, rgba(201,164,93,0.18) 0%, rgba(139,108,53,0.08) 100%)"
//                 : "transparent",
//               border: `1px solid ${
//                 active ? "rgba(201,164,93,0.4)" : "transparent"
//               }`,
//               color: active ? T.amberBright : T.textMuted,
//               fontSize: "10px",
//               fontFamily: "Georgia, serif",
//               letterSpacing: "0.07em",
//               cursor: "pointer",
//               boxShadow: active
//                 ? "0 0 12px rgba(201,164,93,0.15), inset 0 1px 0 rgba(255,255,255,0.05)"
//                 : "none",
//               whiteSpace: "nowrap",
//             }}
//             title={mode}
//           >
//             <span style={{ fontSize: "12px", lineHeight: 1 }}>{icon}</span>
//             <span className="hidden uppercase tracking-widest sm:inline">{mn}</span>
//             {active && (
//               <span
//                 className="absolute bottom-0.5 left-1/2 -translate-x-1/2 rounded-full"
//                 style={{
//                   width: 18,
//                   height: 1.5,
//                   background: T.amber,
//                   opacity: 0.6,
//                 }}
//               />
//             )}
//           </button>
//         );
//       })}
//     </div>
//   );
// }

// function CharacterRpgModal({ onClose }: { onClose: () => void }) {
//   const [step, setStep] = useState(0);
//   const [scores, setScores] = useState<Record<RoleId, number>>(() => {
//     const base = {} as Record<RoleId, number>;
//     for (const role of CHARACTER_ROLES) base[role.id] = 0;
//     return base;
//   });
//   const [result, setResult] = useState<CharacterRole | null>(null);

//   const question = RPG_QUESTIONS[step];

//   function choose(optionScores: RoleScore) {
//     const nextScores = { ...scores };

//     for (const [roleId, value] of Object.entries(optionScores) as [
//       RoleId,
//       number,
//     ][]) {
//       nextScores[roleId] = (nextScores[roleId] ?? 0) + value;
//     }

//     setScores(nextScores);

//     if (step + 1 >= RPG_QUESTIONS.length) {
//       const bestRole =
//         CHARACTER_ROLES.slice().sort(
//           (a, b) => (nextScores[b.id] ?? 0) - (nextScores[a.id] ?? 0)
//         )[0] ?? CHARACTER_ROLES[0];

//       setResult(bestRole);

//       try {
//         localStorage.setItem(
//           "atlas-character-result",
//           JSON.stringify({
//             roleId: bestRole.id,
//             roleName: bestRole.name,
//             scores: nextScores,
//             createdAt: new Date().toISOString(),
//           })
//         );
//       } catch {
//         // localStorage disabled байвал тоглоом хэвийн үргэлжилнэ
//       }

//       return;
//     }

//     setStep((s) => s + 1);
//   }

//   function restart() {
//     const base = {} as Record<RoleId, number>;
//     for (const role of CHARACTER_ROLES) base[role.id] = 0;
//     setScores(base);
//     setStep(0);
//     setResult(null);
//   }

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center p-4"
//       style={{
//         background:
//           "radial-gradient(circle at 50% 20%, rgba(201,164,93,0.18), transparent 35%), rgba(0,0,0,0.76)",
//         backdropFilter: "blur(8px)",
//       }}
//       role="dialog"
//       aria-modal="true"
//     >
//       <div
//         className="w-full max-w-[620px] overflow-hidden rounded-2xl"
//         style={{
//           background: "rgba(8,5,2,0.97)",
//           border: `1px solid rgba(201,164,93,0.35)`,
//           boxShadow: "0 30px 90px rgba(0,0,0,0.75)",
//           fontFamily: "Georgia, serif",
//         }}
//       >
//         <div
//           className="flex items-center justify-between px-5 py-4"
//           style={{ borderBottom: `1px solid ${T.border}` }}
//         >
//           <div>
//             <div
//               className="text-[10px] uppercase tracking-[0.35em]"
//               style={{ color: T.textMuted }}
//             >
//               1162–1300 · Character RPG
//             </div>
//             <h2
//               className="mt-1 text-lg font-bold"
//               style={{ color: T.amberBright }}
//             >
//               Чи Их Монголын үед хэн байх байсан бэ?
//             </h2>
//           </div>

//           <button
//             type="button"
//             onClick={onClose}
//             className="h-9 w-9 rounded-lg"
//             style={{
//               border: `1px solid ${T.borderMid}`,
//               background: "rgba(255,255,255,0.03)",
//               color: T.textSub,
//             }}
//           >
//             ✕
//           </button>
//         </div>

//         {!result ? (
//           <div className="p-5">
//             <div className="mb-4 flex items-center justify-between">
//               <span
//                 className="text-[10px] uppercase tracking-[0.25em]"
//                 style={{ color: T.textMuted }}
//               >
//                 Асуулт {step + 1} / {RPG_QUESTIONS.length}
//               </span>
//               <div
//                 className="h-2 w-40 overflow-hidden rounded-full"
//                 style={{ background: "#1a1208" }}
//               >
//                 <div
//                   className="h-full rounded-full"
//                   style={{
//                     width: `${((step + 1) / RPG_QUESTIONS.length) * 100}%`,
//                     background: `linear-gradient(90deg, ${T.amberDim}, ${T.amberBright})`,
//                   }}
//                 />
//               </div>
//             </div>

//             <h3
//               className="mb-5 text-xl font-bold leading-snug"
//               style={{ color: T.text }}
//             >
//               {question.question}
//             </h3>

//             <div className="grid gap-3">
//               {question.options.map((option, idx) => (
//                 <button
//                   key={idx}
//                   type="button"
//                   onClick={() => choose(option.scores)}
//                   className="rounded-xl px-4 py-4 text-left transition-all hover:scale-[1.01]"
//                   style={{
//                     background:
//                       "linear-gradient(135deg, rgba(201,164,93,0.08), rgba(255,255,255,0.025))",
//                     border: `1px solid ${T.borderMid}`,
//                     color: T.text,
//                     fontFamily: "Georgia, serif",
//                   }}
//                 >
//                   <span
//                     className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px]"
//                     style={{
//                       background: "rgba(201,164,93,0.14)",
//                       color: T.amberBright,
//                       border: `1px solid rgba(201,164,93,0.25)`,
//                     }}
//                   >
//                     {idx + 1}
//                   </span>
//                   {option.label}
//                 </button>
//               ))}
//             </div>
//           </div>
//         ) : (
//           <div className="p-6 text-center">
//             <div className="mb-3 text-6xl">{result.icon}</div>

//             <div
//               className="text-[10px] uppercase tracking-[0.35em]"
//               style={{ color: T.textMuted }}
//             >
//               Чиний дүр
//             </div>

//             <h3
//               className="mt-2 text-3xl font-bold"
//               style={{ color: T.amberBright }}
//             >
//               {result.name}
//             </h3>

//             <div className="mt-1 text-sm" style={{ color: T.textSub }}>
//               {result.subtitle}
//             </div>

//             <p
//               className="mx-auto mt-5 max-w-[480px] text-sm leading-7"
//               style={{ color: T.text }}
//             >
//               {result.description}
//             </p>

//             <div className="mt-5 flex flex-wrap justify-center gap-2">
//               {result.strengths.map((strength) => (
//                 <span
//                   key={strength}
//                   className="rounded-full px-3 py-1 text-xs"
//                   style={{
//                     background: "rgba(201,164,93,0.12)",
//                     border: `1px solid rgba(201,164,93,0.25)`,
//                     color: T.amberBright,
//                   }}
//                 >
//                   {strength}
//                 </span>
//               ))}
//             </div>

//             <div className="mt-7 grid grid-cols-2 gap-3">
//               <button
//                 type="button"
//                 onClick={restart}
//                 className="rounded-xl px-4 py-3 text-sm font-bold"
//                 style={{
//                   background: "rgba(255,255,255,0.04)",
//                   border: `1px solid ${T.borderMid}`,
//                   color: T.text,
//                 }}
//               >
//                 Дахин тоглох
//               </button>

//               <button
//                 type="button"
//                 onClick={onClose}
//                 className="rounded-xl px-4 py-3 text-sm font-bold"
//                 style={{
//                   background: `linear-gradient(135deg, ${T.amber}, ${T.amberDim})`,
//                   color: "#120b03",
//                   border: "none",
//                 }}
//               >
//                 Атлас руу буцах
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default function AtlasApp() {
//   const { user, isLoaded } = useUser();

//   const adminMode =
//     isLoaded &&
//     (user?.publicMetadata as { role?: string } | undefined)?.role === "admin";

//   const emptyForm = {
//     periodName: "",
//     name: "",
//     leader: "",
//     capital: "",
//     color: "#c9a45d",
//     summary: "",
//   };

//   const [mapMode, setMapMode] = useState<MapMode>("globe");
//   const [years, setYears] = useState<number[]>([]);
//   const [year, setYear] = useState(1206);
//   const [collection, setCollection] =
//     useState<AtlasFeatureCollection | null>(null);
//   const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
//   const [search, setSearch] = useState("");
//   const [isEditing, setIsEditing] = useState(false);
//   const [isCreating, setIsCreating] = useState(false);
//   const [addPointMode, setAddPointMode] = useState(false);
//   const [draftRing, setDraftRing] = useState<Array<[number, number]>>([]);
//   const [saveState, setSaveState] = useState<
//     "idle" | "saving" | "saved" | "error"
//   >("idle");
//   const [saveError, setSaveError] = useState<string | null>(null);
//   const [loadError, setLoadError] = useState<string | null>(null);
//   const [form, setForm] = useState(emptyForm);
//   const [selectedVertexIndex, setSelectedVertexIndex] = useState<number | null>(
//     null
//   );
//   const [characterOpen, setCharacterOpen] = useState(false);

//   useEffect(() => {
//     fetch("/api/atlas/years")
//       .then((r) => r.json())
//       .then((data) => {
//         const nextYears = data.years as number[];
//         setYears(nextYears);

//         if (nextYears.length > 0 && !nextYears.includes(year)) {
//           setYear(nextYears[0]);
//         }
//       })
//       .catch(() => setLoadError("Timeline ачаалахад алдаа гарлаа."));
//   }, [year]);

//   useEffect(() => {
//     setLoadError(null);

//     fetch(`/api/atlas/states?year=${year}`)
//       .then(async (r) => {
//         if (!r.ok) throw new Error();
//         return r.json();
//       })
//       .then((data: AtlasFeatureCollection) => {
//         setCollection(data);
//         setSelectedSlug((cur) => {
//           const ok = data.features.some((f) => f.properties.slug === cur);
//           return ok ? cur : data.features[0]?.properties.slug ?? null;
//         });
//         setIsEditing(false);
//         setIsCreating(false);
//         setAddPointMode(false);
//         setSelectedVertexIndex(null);
//         setSaveState("idle");
//         setSaveError(null);
//       })
//       .catch(() => {
//         setCollection(null);
//         setSelectedSlug(null);
//         setLoadError("Газрын зураг ачаалагдсангүй.");
//       });
//   }, [year]);

//   const selectedFeature = useMemo(
//     () =>
//       collection?.features.find((f) => f.properties.slug === selectedSlug) ??
//       null,
//     [collection, selectedSlug]
//   );

//   const filteredFeatures = useMemo(() => {
//     if (!collection) return [];

//     const q = search.trim().toLowerCase();

//     return collection.features.filter(
//       (f) =>
//         !q ||
//         f.properties.name.toLowerCase().includes(q) ||
//         f.properties.leader.toLowerCase().includes(q) ||
//         f.properties.capital.toLowerCase().includes(q)
//     );
//   }, [collection, search]);

//   useEffect(() => {
//     if (!selectedFeature || isCreating) {
//       setDraftRing([]);
//       return;
//     }

//     setDraftRing(selectedFeature.geometry.coordinates[0] as Array<[number, number]>);

//     setForm({
//       periodName: String(selectedFeature.properties.metadata?.periodName ?? ""),
//       name: selectedFeature.properties.name,
//       leader: selectedFeature.properties.leader,
//       capital: selectedFeature.properties.capital,
//       color: selectedFeature.properties.color,
//       summary: selectedFeature.properties.summary,
//     });

//     setSelectedVertexIndex(null);
//     setSaveState("idle");
//     setSaveError(null);
//   }, [isCreating, selectedFeature]);

//   const handleSelectSlug = useCallback((slug: string) => {
//     setSelectedSlug(slug);
//   }, []);

//   function handleDeleteVertex(index: number) {
//     if (draftRing.length <= 4) return;

//     const next = draftRing.filter((_, i) => i !== index);
//     setDraftRing(next);
//     setSelectedVertexIndex(null);
//   }

//   function resetCreateMode() {
//     setIsCreating(false);
//     setIsEditing(false);
//     setAddPointMode(false);
//     setSelectedVertexIndex(null);
//     setDraftRing(
//       (selectedFeature?.geometry.coordinates[0] as Array<[number, number]>) ?? []
//     );
//     setForm(
//       selectedFeature
//         ? {
//             periodName: String(selectedFeature.properties.metadata?.periodName ?? ""),
//             name: selectedFeature.properties.name,
//             leader: selectedFeature.properties.leader,
//             capital: selectedFeature.properties.capital,
//             color: selectedFeature.properties.color,
//             summary: selectedFeature.properties.summary,
//           }
//         : emptyForm
//     );
//     setSaveState("idle");
//     setSaveError(null);
//   }

//   async function handleSaveGeometry() {
//     if (draftRing.length < 4) return;

//     if (!form.name || form.name.length < 2) {
//       setSaveError("Нэр дор хаяж 2 тэмдэгт байна.");
//       setSaveState("error");
//       return;
//     }

//     if (!form.summary || form.summary.length < 8) {
//       setSaveError("Тайлбар дор хаяж 8 тэмдэгт байна.");
//       setSaveState("error");
//       return;
//     }

//     try {
//       setSaveState("saving");
//       setSaveError(null);

//       if (isCreating) {
//         const res = await fetch("/api/atlas/states", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             year,
//             name: form.name,
//             leader: form.leader,
//             capital: form.capital,
//             color: form.color,
//             summary: form.summary,
//             metadata: { periodName: form.periodName },
//             coordinates: draftRing,
//           }),
//         });

//         if (!res.ok) {
//           const b = await res.json().catch(() => ({}));
//           throw new Error((b as { error?: string }).error ?? "create-failed");
//         }

//         const { feature: cf, collection: nextCollection } =
//           (await res.json()) as {
//             feature: AtlasStateFeature;
//             collection?: AtlasFeatureCollection;
//           };

//         setCollection((c) => {
//           if (nextCollection) return nextCollection;

//           return c
//             ? { ...c, features: [...c.features, cf] }
//             : { type: "FeatureCollection", year, features: [cf] };
//         });

//         setSelectedSlug(cf.properties.slug);
//         setIsCreating(false);
//         setIsEditing(false);
//         setSelectedVertexIndex(null);
//         setDraftRing(cf.geometry.coordinates[0] as Array<[number, number]>);
//         setForm({
//           name: cf.properties.name,
//           leader: cf.properties.leader,
//           capital: cf.properties.capital,
//           color: cf.properties.color,
//           summary: cf.properties.summary,
//           periodName: String(cf.properties.metadata?.periodName ?? ""),
//         });
//         setSaveState("saved");
//         setTimeout(() => setSaveState("idle"), 1800);
//         return;
//       }

//       if (!selectedFeature) throw new Error("no-feature");

//       const res = await fetch(
//         `/api/atlas/states/${selectedFeature.properties.slug}`,
//         {
//           method: "PATCH",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             year,
//             name: form.name,
//             leader: form.leader,
//             capital: form.capital,
//             color: form.color,
//             summary: form.summary,
//             metadata: {
//               ...(selectedFeature.properties.metadata ?? {}),
//               periodName: form.periodName,
//             },
//             coordinates: draftRing,
//           }),
//         }
//       );

//       if (!res.ok) {
//         const b = await res.json().catch(() => ({}));
//         throw new Error((b as { error?: string }).error ?? "save-failed");
//       }

//       const { feature: uf } = (await res.json()) as {
//         feature: AtlasStateFeature;
//       };

//       setCollection((c) =>
//         c
//           ? {
//               ...c,
//               features: c.features.map((f) =>
//                 f.properties.slug === uf.properties.slug ? uf : f
//               ),
//             }
//           : c
//       );

//       setDraftRing(uf.geometry.coordinates[0] as Array<[number, number]>);
//       setSelectedVertexIndex(null);
//       setSaveState("saved");
//       setTimeout(() => setSaveState("idle"), 1800);
//     } catch (err) {
//       setSaveState("error");
//       setSaveError(
//         err instanceof Error ? err.message : "Хадгалахад алдаа гарлаа."
//       );
//     }
//   }

//   async function handleDeleteState() {
//     if (!selectedFeature || isCreating) return;

//     try {
//       setSaveState("saving");

//       const res = await fetch(
//         `/api/atlas/states/${selectedFeature.properties.slug}?year=${year}`,
//         { method: "DELETE" }
//       );

//       if (!res.ok) throw new Error();

//       setCollection((c) => {
//         if (!c) return c;

//         const next = c.features.filter(
//           (f) => f.properties.slug !== selectedFeature.properties.slug
//         );

//         setSelectedSlug(next[0]?.properties.slug ?? null);

//         return { ...c, features: next };
//       });

//       setDraftRing([]);
//       setSelectedVertexIndex(null);
//       setForm(emptyForm);
//       setIsEditing(false);
//       setSaveState("saved");
//       setTimeout(() => setSaveState("idle"), 1800);
//     } catch {
//       setSaveState("error");
//       setSaveError("Устгахад алдаа гарлаа.");
//     }
//   }

//   const sharedMapProps = {
//     collection,
//     selectedSlug,
//     onSelectSlug: handleSelectSlug,
//     isEditing: adminMode && isEditing,
//     isCreating: adminMode && isCreating,
//     addPointMode: adminMode && addPointMode,
//     draftRing,
//     onDraftRingChange: setDraftRing,
//     selectedVertexIndex,
//     onSelectVertex: setSelectedVertexIndex,
//   };

//   const coordEditorProps = {
//     year,
//     feature: selectedFeature,
//     isEditing,
//     isCreating,
//     addPointMode,
//     draftRing,
//     saveState,
//     saveError,
//     form,
//     onFormChange: (
//       f: "periodName" | "name" | "leader" | "capital" | "color" | "summary",
//       v: string
//     ) => setForm((c) => ({ ...c, [f]: v })),
//     onStartCreate: () => {
//       setSelectedSlug(null);
//       setIsCreating(true);
//       setIsEditing(true);
//       setAddPointMode(false);
//       setSelectedVertexIndex(null);
//       setDraftRing([]);
//       setForm(emptyForm);
//       setSaveState("idle");
//       setSaveError(null);
//     },
//     onCancelCreate: resetCreateMode,
//     onToggleEditing: () => {
//       setIsEditing((c) => !c);
//       setAddPointMode(false);
//       setSelectedVertexIndex(null);
//       setSaveState("idle");
//       setSaveError(null);
//     },
//     onToggleAddPoint: () => setAddPointMode((c) => !c),
//     onReset: () => {
//       if (isCreating) {
//         setDraftRing([]);
//         setSelectedVertexIndex(null);
//         setSaveState("idle");
//         setSaveError(null);
//         return;
//       }

//       if (!selectedFeature) return;

//       setDraftRing(
//         selectedFeature.geometry.coordinates[0] as Array<[number, number]>
//       );
//       setSelectedVertexIndex(null);
//       setForm({
//         periodName: String(selectedFeature.properties.metadata?.periodName ?? ""),
//         name: selectedFeature.properties.name,
//         leader: selectedFeature.properties.leader,
//         capital: selectedFeature.properties.capital,
//         color: selectedFeature.properties.color,
//         summary: selectedFeature.properties.summary,
//       });
//       setSaveState("idle");
//       setSaveError(null);
//     },
//     onSave: handleSaveGeometry,
//     onDelete: handleDeleteState,
//     selectedVertexIndex,
//     onSelectVertex: setSelectedVertexIndex,
//     onDeleteVertex: handleDeleteVertex,
//   };

//   return (
//     <main
//       className="min-h-screen overflow-hidden"
//       style={{
//         background: T.bg,
//         fontFamily: "'Georgia', 'Times New Roman', serif",
//       }}
//     >
//       {characterOpen && (
//         <CharacterRpgModal onClose={() => setCharacterOpen(false)} />
//       )}

//       <div className="flex min-h-screen flex-col lg:h-screen lg:flex-row lg:overflow-hidden">
//         <Sidebar
//           year={year}
//           features={filteredFeatures}
//           selectedFeature={selectedFeature}
//           onSelectSlug={handleSelectSlug}
//           search={search}
//           onSearchChange={setSearch}
//           adminMode={adminMode}
//           user={user}
//         />

//         <section className="relative flex min-h-[70vh] flex-1 flex-col overflow-hidden lg:h-screen lg:min-h-0">
//           <div className="absolute inset-0 z-0">
//             {mapMode === "globe" && <GlobeMap {...sharedMapProps} />}
//             {mapMode === "historical" && <HistoricalMap {...sharedMapProps} />}
//           </div>

//           <div className="pointer-events-none relative z-20 flex items-start justify-between gap-3 px-4 pt-3">
//             <div
//               className="pointer-events-auto flex items-center gap-3 rounded-xl py-2.5 pl-3 pr-4"
//               style={{
//                 background: T.panel,
//                 border: `1px solid ${T.border}`,
//                 backdropFilter: "blur(16px)",
//                 boxShadow:
//                   "0 4px 28px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.03)",
//               }}
//             >
//               <div
//                 className="relative flex shrink-0 items-center justify-center"
//                 style={{ width: 32, height: 32 }}
//               >
//                 <div
//                   className="absolute inset-0 rounded-full"
//                   style={{
//                     background:
//                       "radial-gradient(circle at 40% 35%, rgba(201,164,93,0.18), transparent 70%)",
//                     border: "1px solid rgba(201,164,93,0.22)",
//                   }}
//                 />
//                 <svg width="20" height="20" viewBox="0 0 20 20">
//                   <polygon
//                     points="10,1 12.2,7 18.5,7 13.4,11 15.4,17.5 10,14 4.6,17.5 6.6,11 1.5,7 7.8,7"
//                     fill="#c9a45d"
//                     opacity="0.9"
//                   />
//                 </svg>
//               </div>

//               <div>
//                 <h1
//                   className="text-sm font-bold uppercase leading-none tracking-widest"
//                   style={{
//                     color: T.amber,
//                     letterSpacing: "0.12em",
//                     textShadow: `0 0 16px ${T.amberGlow}`,
//                     fontFamily: "Georgia, serif",
//                   }}
//                 >
//                   Монгол · Төв Азийн Атлас
//                 </h1>
//                 <p
//                   className="mt-1 text-[8px] uppercase tracking-[0.45em]"
//                   style={{ color: T.textMuted, fontFamily: "Georgia, serif" }}
//                 >
//                   1162 — 1300 · Дундад зуун
//                 </p>
//               </div>
//             </div>

//             <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-2">
//               <button
//                 type="button"
//                 onClick={() => setCharacterOpen(true)}
//                 className="rounded-xl px-3 py-2 text-[10px] uppercase tracking-widest"
//                 style={{
//                   background:
//                     "linear-gradient(135deg, rgba(201,164,93,0.20), rgba(139,108,53,0.08))",
//                   border: "1px solid rgba(201,164,93,0.42)",
//                   color: T.amberBright,
//                   backdropFilter: "blur(16px)",
//                   fontFamily: "Georgia, serif",
//                   boxShadow: "0 0 16px rgba(201,164,93,0.10)",
//                 }}
//               >
//                 🎲 Дүрээ олох
//               </button>

//               <MapSwitcher current={mapMode} onChange={setMapMode} />

//               {adminMode && (
//                 <div
//                   className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[10px] uppercase tracking-widest"
//                   style={{
//                     background: T.panel,
//                     border: "1px solid rgba(201,164,93,0.38)",
//                     color: T.amber,
//                     backdropFilter: "blur(16px)",
//                     boxShadow: "0 0 16px rgba(201,164,93,0.08)",
//                     fontFamily: "Georgia, serif",
//                     letterSpacing: "0.1em",
//                   }}
//                 >
//                   <svg width="9" height="9" viewBox="0 0 10 10">
//                     <polygon
//                       points="5,0 6.2,3.5 10,3.5 7,5.7 8,9.5 5,7.5 2,9.5 3,5.7 0,3.5 3.8,3.5"
//                       fill={T.amber}
//                     />
//                   </svg>
//                   Хаан
//                 </div>
//               )}

//               {collection && (
//                 <div
//                   className="rounded-xl px-3 py-2 text-[10px] uppercase tracking-widest tabular-nums"
//                   style={{
//                     background: "rgba(8,5,2,0.88)",
//                     border: `1px solid ${T.border}`,
//                     color: T.textSub,
//                     backdropFilter: "blur(16px)",
//                     fontFamily: "Georgia, serif",
//                   }}
//                 >
//                   {collection.features.length} улс
//                 </div>
//               )}
//             </div>
//           </div>

//           {loadError && (
//             <div
//               className="absolute left-4 top-16 z-30 flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs"
//               style={{
//                 background: "rgba(20,4,4,0.96)",
//                 border: "1px solid rgba(150,40,40,0.5)",
//                 color: "#f08080",
//                 backdropFilter: "blur(12px)",
//                 fontFamily: "Georgia, serif",
//               }}
//             >
//               <span style={{ fontSize: 11 }}>⚠</span>
//               {loadError}
//             </div>
//           )}

//           <div
//             className="absolute bottom-28 right-4 top-16 z-20 hidden w-[340px] flex-col xl:flex"
//             style={{
//               pointerEvents: selectedFeature || adminMode ? "auto" : "none",
//             }}
//           >
//             {adminMode ? (
//               <div className="flex-1 overflow-hidden">
//                 <CoordEditor {...coordEditorProps} />
//               </div>
//             ) : (
//               <SelectedStateDrawer
//                 year={year}
//                 feature={selectedFeature}
//                 onClose={() => setSelectedSlug(null)}
//               />
//             )}
//           </div>

//           <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-4">
//             <div
//               className="overflow-hidden rounded-2xl"
//               style={{
//                 background: "rgba(8,5,2,0.94)",
//                 border: `1px solid ${T.border}`,
//                 backdropFilter: "blur(20px)",
//                 boxShadow:
//                   "0 -2px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.025)",
//               }}
//             >
//               <div
//                 className="flex px-5 pb-1 pt-2.5 text-[8px] uppercase tracking-[0.28em]"
//                 style={{ borderBottom: `1px solid ${T.border}` }}
//               >
//                 {[
//                   { label: "Эрт дундад зуун", flex: 2 },
//                   { label: "Дунд үе", flex: 3 },
//                   { label: "Өндөр дундад зуун", flex: 2 },
//                   { label: "Монголын хаант улс", flex: 3 },
//                 ].map(({ label, flex }, i, arr) => (
//                   <div
//                     key={label}
//                     className="relative text-center"
//                     style={{
//                       flex,
//                       color: T.textMuted,
//                       fontFamily: "Georgia, serif",
//                       borderRight:
//                         i < arr.length - 1 ? `1px solid ${T.border}` : "none",
//                       paddingRight: 4,
//                     }}
//                   >
//                     {label}
//                   </div>
//                 ))}
//               </div>

//               <div className="flex items-center gap-4 px-5 pb-3 pt-2">
//                 <div
//                   className="flex shrink-0 flex-col items-center justify-center rounded-lg px-3 py-1.5 tabular-nums"
//                   style={{
//                     background:
//                       "linear-gradient(135deg, rgba(201,164,93,0.14), rgba(139,108,53,0.06))",
//                     border: "1px solid rgba(201,164,93,0.3)",
//                     minWidth: 64,
//                     boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
//                   }}
//                 >
//                   <span
//                     style={{
//                       color: T.amberBright,
//                       fontSize: 18,
//                       fontWeight: 700,
//                       fontFamily: "Georgia, serif",
//                       lineHeight: 1.1,
//                       letterSpacing: "0.02em",
//                     }}
//                   >
//                     {year}
//                   </span>
//                   <span
//                     style={{
//                       color: T.textMuted,
//                       fontSize: 8,
//                       letterSpacing: "0.25em",
//                       textTransform: "uppercase",
//                       fontFamily: "Georgia, serif",
//                     }}
//                   >
//                     он
//                   </span>
//                 </div>

//                 <div className="flex-1">
//                   <TimelineSlider
//                     years={years}
//                     currentYear={year}
//                     onYearChange={setYear}
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="relative z-10 px-4 pb-4 pt-[calc(70vh+1rem)] xl:hidden">
//             {adminMode ? (
//               <CoordEditor {...coordEditorProps} />
//             ) : (
//               <SelectedStateDrawer
//                 year={year}
//                 feature={selectedFeature}
//                 onClose={() => setSelectedSlug(null)}
//               />
//             )}
//           </div>
//         </section>
//       </div>
//     </main>
//   );
// }




"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import SelectedStateDrawer from "@/app/components/SelectedStateDrawer";
import { Sidebar } from "@/app/components/Sidebar";
import TimelineSlider from "@/app/components/TimelineSlider";
import type { AtlasFeatureCollection, AtlasStateFeature } from "@/lib/types";

const CoordEditor = dynamic(() => import("@/app/components/CoordEditor"), {
  ssr: false,
}) as any;

const GlobeMap = dynamic(
  () => import("@/app/components/Globemap").then((m) => ({ default: m.default })),
  {
    ssr: false,
    loading: () => <MapLoader label="Дэлхийн бөмбөрцөг" />,
  }
);

const HistoricalMap = dynamic(
  () => import("@/app/components/HistoricalMap").then((m) => ({ default: m.default })),
  {
    ssr: false,
    loading: () => <MapLoader label="Түүхэн зураг" />,
  }
);

type MapMode = "globe" | "historical";

type RoleId =
  | "malchin"
  | "aduuchin"
  | "helmerch"
  | "oydolchin"
  | "tariachin"
  | "aravt"
  | "zuut"
  | "myangat"
  | "myangatiin_noyon"
  | "bicheech"
  | "darkhan"
  | "anchin"
  | "hudaldaachin"
  | "boo_udgan";

type RoleScore = Partial<Record<RoleId, number>>;

type CharacterRole = {
  id: RoleId;
  name: string;
  subtitle: string;
  icon: string;
  description: string;
  strengths: string[];
};

type RpgQuestion = {
  id: string;
  question: string;
  options: {
    label: string;
    scores: RoleScore;
  }[];
};

type SavedCharacterResult = {
  roleId: RoleId;
  roleName: string;
  icon: string;
  playerName: string;
  isGuest: boolean;
  createdAt: string;
};

const T = {
  bg: "#080502",
  panel: "rgba(8,5,2,0.92)",
  border: "#2a1a08",
  borderMid: "#3d2a12",
  amber: "#c9a45d",
  amberBright: "#f0c060",
  amberDim: "#8b6c35",
  amberGlow: "rgba(201,164,93,0.25)",
  text: "#e8d8b8",
  textSub: "#9a7c50",
  textMuted: "#5c4020",
  red: "#c06060",
};

const CHARACTER_STORAGE_KEY = "atlas-character-result";

const MAP_OPTIONS: {
  mode: MapMode;
  label: string;
  mn: string;
  icon: string;
  desc: string;
}[] = [
  {
    mode: "globe",
    label: "Globe",
    mn: "Бөмбөрцөг",
    icon: "🌐",
    desc: "Гурван хэмжээст",
  },
  {
    mode: "historical",
    label: "Flat Map",
    mn: "Хавтгай",
    icon: "🗺",
    desc: "Хуучин зураг",
  },
];

const CHARACTER_ROLES: CharacterRole[] = [
  {
    id: "malchin",
    name: "Малчин",
    subtitle: "Нүүдлийн амьдралын тулгуур",
    icon: "🐑",
    description:
      "Чи овог аймгийн өдөр тутмын амьдралыг авч явдаг, мал сүрэг, бэлчээр, улирлын нүүдлийг хамгийн сайн мэддэг хүн.",
    strengths: ["Тэвчээр", "Байгаль унших чадвар", "Овог аймагтаа үнэнч"],
  },
  {
    id: "aduuchin",
    name: "Адуучин",
    subtitle: "Хүлэг морь, холын замын эзэн",
    icon: "🐎",
    description:
      "Чи морь таних, сургах, холын аянд бэлтгэхдээ гарамгай. Морь бол чиний хурд, хүч, нэр төр.",
    strengths: ["Хурд", "Морь таних мэдрэмж", "Эр зориг"],
  },
  {
    id: "helmerch",
    name: "Хэлмэрч",
    subtitle: "Олон хэл, олон газрын гүүр",
    icon: "🗣️",
    description:
      "Чи олон аймаг, худалдаачин, элч төлөөлөгчдийн үгийг холбож, зөрчлийг эвээр тайлах чадвартай.",
    strengths: ["Хэл яриа", "Дипломат мэдрэмж", "Ажигч гярхай байдал"],
  },
  {
    id: "oydolchin",
    name: "Оёдолчин",
    subtitle: "Дээл, туг, хэрэгслийн урлаач",
    icon: "🧵",
    description:
      "Чи дээл хувцас, туг, уут сав, ахуйн хэрэглэлийг урлаж, отог аймгийн өнгө төрхийг бүтээдэг хүн.",
    strengths: ["Нягт нямбай", "Гоо зүйн мэдрэмж", "Гарын ур"],
  },
  {
    id: "tariachin",
    name: "Тариачин",
    subtitle: "Суурин иргэншлийн хүнс тэжээлийн түшиг",
    icon: "🌾",
    description:
      "Чи газар, ус, улирлыг тооцож ургац авдаг. Нүүдэлчдийн ертөнцөд тогтвортой хүнс, хөдөлмөрийн үнэ цэнийг сануулна.",
    strengths: ["Төлөвлөлт", "Хөдөлмөрч зан", "Тогтвортой байдал"],
  },
  {
    id: "aravt",
    name: "Аравт",
    subtitle: "Арван хүний сахилга баттай дайчин",
    icon: "🛡️",
    description:
      "Чи жижиг бүлгийнхээ дунд найдвартай, тушаал биелүүлдэг, хамтрагчаа орхидоггүй дайчин.",
    strengths: ["Сахилга бат", "Багаар ажиллах", "Шийдэмгий байдал"],
  },
  {
    id: "zuut",
    name: "Зуут",
    subtitle: "Зуун цэргийн зохион байгуулагч",
    icon: "⚔️",
    description:
      "Чи зөвхөн тулалдахаас гадна хүмүүсийг эмхэлж, тушаал дамжуулж, зохион байгуулалт хийж чадна.",
    strengths: ["Удирдах эхлэл", "Тактик", "Хариуцлага"],
  },
  {
    id: "myangat",
    name: "Мянгат",
    subtitle: "Их цэргийн баганын ноён нуруу",
    icon: "🏹",
    description:
      "Чи олон хүний хөдөлгөөн, хүнс, морь, зам, мэдээ мэдээллийг зэрэг тооцдог том зохион байгуулагч.",
    strengths: ["Стратеги", "Тооцоо", "Том зураг харах"],
  },
  {
    id: "myangatiin_noyon",
    name: "Мянгатын ноён",
    subtitle: "Их зохион байгуулалтын эзэн",
    icon: "👑",
    description:
      "Чи эрх мэдэл, үүрэг, хариуцлага гурвыг зэрэг дааж чаддаг. Хүмүүс чиний шийдвэрийг дагана.",
    strengths: ["Манлайлал", "Шийдвэр гаргалт", "Эв нэгдэл"],
  },
  {
    id: "bicheech",
    name: "Бичээч",
    subtitle: "Зарлиг, мэдээ, түүхийг хадгалагч",
    icon: "📜",
    description:
      "Чи үг, тэмдэглэл, тооцоо, гэрээ хэлэлцээг нягт хадгалдаг. Чиний бичсэн зүйл маргаашийн түүх болно.",
    strengths: ["Ой тогтоолт", "Нягт нямбай", "Мэдлэг"],
  },
  {
    id: "darkhan",
    name: "Дархан",
    subtitle: "Төмөр, мод, зэвсгийн урлаач",
    icon: "🔨",
    description:
      "Чи хэрэгсэл, зэвсэг, тоног, эдлэл урлаж, хүний хүчийг эд зүйлээр нэмэгдүүлдэг бүтээгч.",
    strengths: ["Уран чадвар", "Бүтээлч сэтгэлгээ", "Асуудал шийдэх"],
  },
  {
    id: "anchin",
    name: "Анчин",
    subtitle: "Мөр уншигч, байгальд уусагч",
    icon: "🦅",
    description:
      "Чи мөр, салхи, газрын хэв шинжийг анзаарч, амьд үлдэх чадвараараа бусдыг хамгаална.",
    strengths: ["Мөрдөх", "Төвлөрөл", "Байгальд дасан зохицох"],
  },
  {
    id: "hudaldaachin",
    name: "Худалдаачин",
    subtitle: "Зам, бараа, үнэ цэнийн мэдрэгч",
    icon: "🐫",
    description:
      "Чи бараа солилцоо, үнэ цэнэ, зам харилцаа, хүмүүсийн хэрэгцээг сайн мэддэг ухаалаг наймаачин.",
    strengths: ["Харилцаа", "Тооцоо", "Эрсдэл үнэлэх"],
  },
  {
    id: "boo_udgan",
    name: "Бөө / Удган",
    subtitle: "Итгэл, ёс, билгийн дуу хоолой",
    icon: "🔥",
    description:
      "Чи хүмүүсийн айдас, итгэл, ёс заншлыг мэдэрч, шийдвэр гаргах үед сэтгэл зүйн түшиг болдог.",
    strengths: ["Зөн совин", "Ёс заншил", "Сэтгэл засах чадвар"],
  },
];

const RPG_QUESTIONS: RpgQuestion[] = [
  {
    id: "q1",
    question: "Аян замд хамгийн түрүүнд чи юуг шалгах вэ?",
    options: [
      {
        label: "Морьдын хүч, эмээл хазаар, замын хурдыг шалгана.",
        scores: { aduuchin: 3, aravt: 1, zuut: 1 },
      },
      {
        label: "Хүнс, ус, өвс бэлчээр хүрэлцэх эсэхийг тооцно.",
        scores: { malchin: 2, tariachin: 2, myangat: 2 },
      },
      {
        label: "Хэний нутаг, хэний хэл, ямар ёстойг асууна.",
        scores: { helmerch: 3, hudaldaachin: 2, bicheech: 1 },
      },
      {
        label: "Тэмдэглэл, зарлиг, тооцоогоо эмхэлнэ.",
        scores: { bicheech: 3, myangatiin_noyon: 1 },
      },
    ],
  },
  {
    id: "q2",
    question: "Маргаан гарвал чи яаж шийдэх вэ?",
    options: [
      {
        label: "Хоёр талын үгийг сонсоод эвлэрүүлэх гарц хайна.",
        scores: { helmerch: 3, boo_udgan: 1, myangatiin_noyon: 1 },
      },
      {
        label: "Дүрэм, тушаал, сахилга батыг баримтална.",
        scores: { aravt: 2, zuut: 3, myangat: 1 },
      },
      {
        label: "Ашиг, алдагдлыг тооцож тохиролцоо санал болгоно.",
        scores: { hudaldaachin: 3, bicheech: 1 },
      },
      {
        label: "Ахмадын ёс, тэнгэр шүтлэг, зан үйлийг сануулна.",
        scores: { boo_udgan: 3, malchin: 1 },
      },
    ],
  },
  {
    id: "q3",
    question: "Чиний хамгийн их дуртай ажил юу вэ?",
    options: [
      {
        label: "Гараар юм урлах, засах, гоё болгох.",
        scores: { oydolchin: 3, darkhan: 3 },
      },
      {
        label: "Газраа арчлах, ургацаа тооцох.",
        scores: { tariachin: 4 },
      },
      {
        label: "Мал сүрэг, бэлчээр, улирлын нүүдэл төлөвлөх.",
        scores: { malchin: 4, aduuchin: 1 },
      },
      {
        label: "Хүмүүсийг зохион байгуулж, үүрэг хуваарилах.",
        scores: { zuut: 2, myangat: 3, myangatiin_noyon: 3 },
      },
    ],
  },
  {
    id: "q4",
    question: "Дайсны мэдээ ирвэл чи юу хийх вэ?",
    options: [
      {
        label: "Тагнуулын мөр, газрын байдал, салхины чигийг ажиглана.",
        scores: { anchin: 3, aravt: 1 },
      },
      {
        label: "Цэргүүдийг бүлэглэж, тушаал дамжуулах бэлтгэл хийнэ.",
        scores: { zuut: 3, myangat: 3, myangatiin_noyon: 1 },
      },
      {
        label: "Хэлэлцээ хийх боломж байгаа эсэхийг судална.",
        scores: { helmerch: 3, hudaldaachin: 1 },
      },
      {
        label: "Морь, сум, тоног хэрэгслийг бэлэн болгоно.",
        scores: { aduuchin: 2, darkhan: 2, aravt: 2 },
      },
    ],
  },
  {
    id: "q5",
    question: "Чамд нэг өдөр чөлөө өгвөл чи юу хийх вэ?",
    options: [
      {
        label: "Морь унаж, тал нутгаар давхина.",
        scores: { aduuchin: 4, anchin: 1 },
      },
      {
        label: "Юм оёж, засаж, хэрэгтэй эдлэл бүтээнэ.",
        scores: { oydolchin: 3, darkhan: 2 },
      },
      {
        label: "Худалдаачидтай уулзаж сонин мэдээ сонсоно.",
        scores: { hudaldaachin: 3, helmerch: 2 },
      },
      {
        label: "Тэмдэглэл уншиж, хуучин явдлыг эргэцүүлнэ.",
        scores: { bicheech: 3, boo_udgan: 1 },
      },
    ],
  },
  {
    id: "q6",
    question: "Хүмүүс чамайг юугаар хамгийн их үнэлдэг вэ?",
    options: [
      {
        label: "Найдвартай, чимээгүй ч ажлаа хийдэг.",
        scores: { malchin: 2, tariachin: 2, aravt: 2 },
      },
      {
        label: "Удирдаж чаддаг, шийдвэр хурдан гаргадаг.",
        scores: { zuut: 2, myangat: 3, myangatiin_noyon: 3 },
      },
      {
        label: "Ухаантай ярьж, хүмүүсийг ойлгуулж чаддаг.",
        scores: { helmerch: 3, hudaldaachin: 2 },
      },
      {
        label: "Гарын уртай, нарийн мэдрэмжтэй.",
        scores: { oydolchin: 3, darkhan: 3 },
      },
    ],
  },
  {
    id: "q7",
    question: "Чи ямар зүйлээс хамгийн их хүч авдаг вэ?",
    options: [
      {
        label: "Тал нутаг, сүрэг мал, гэр бүлээс.",
        scores: { malchin: 3, aduuchin: 1 },
      },
      {
        label: "Эмх журам, туг сүлд, хамт олноос.",
        scores: { aravt: 2, zuut: 2, myangat: 2 },
      },
      {
        label: "Мэдлэг, бичиг, ой санамжаас.",
        scores: { bicheech: 3, helmerch: 1 },
      },
      {
        label: "Ёс заншил, билэг тэмдэг, сэтгэлийн хүчнээс.",
        scores: { boo_udgan: 4 },
      },
    ],
  },
  {
    id: "q8",
    question: "Чи аль үүргийг өөртөө хамгийн ойр гэж мэдрэх вэ?",
    options: [
      {
        label: "Амьдралыг тэтгэгч хүн.",
        scores: { malchin: 2, tariachin: 3 },
      },
      {
        label: "Зам, мэдээ, солилцоог холбогч хүн.",
        scores: { helmerch: 2, hudaldaachin: 3, bicheech: 1 },
      },
      {
        label: "Дайн, хамгаалалт, сахилгын хүн.",
        scores: { aravt: 2, zuut: 2, myangat: 2, myangatiin_noyon: 1 },
      },
      {
        label: "Урлал, хэрэгсэл, бүтээлийн хүн.",
        scores: { oydolchin: 2, darkhan: 3 },
      },
    ],
  },
];

function MapLoader({ label }: { label: string }) {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ background: "#06040200" }}
    >
      <div className="flex flex-col items-center gap-5">
        <div className="relative h-14 w-14">
          <div
            className="absolute inset-0 animate-spin rounded-full"
            style={{
              border: "1.5px solid transparent",
              borderTopColor: "#c9a45d",
              borderRightColor: "rgba(201,164,93,0.3)",
              animationDuration: "1.4s",
            }}
          />
          <div
            className="absolute inset-2.5 animate-spin rounded-full"
            style={{
              border: "1.5px solid transparent",
              borderTopColor: "#8b6c35",
              animationDirection: "reverse",
              animationDuration: "2.1s",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "#c9a45d", opacity: 0.7 }}
            />
          </div>
        </div>
        <p
          className="text-[9px] uppercase tracking-[0.45em]"
          style={{ color: "#5c4020", fontFamily: "Georgia, serif" }}
        >
          {label} ачаалж байна
        </p>
      </div>
    </div>
  );
}

function MapSwitcher({
  current,
  onChange,
}: {
  current: MapMode;
  onChange: (m: MapMode) => void;
}) {
  return (
    <div
      className="pointer-events-auto flex items-center gap-0.5 rounded-xl p-1"
      style={{
        background: "rgba(8,5,2,0.92)",
        border: `1px solid ${T.border}`,
        backdropFilter: "blur(16px)",
        boxShadow:
          "0 4px 24px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      {MAP_OPTIONS.map(({ mode, mn, icon }) => {
        const active = mode === current;

        return (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            className="relative flex items-center gap-1.5 rounded-lg px-3 py-2 transition-all duration-200"
            style={{
              background: active
                ? "linear-gradient(135deg, rgba(201,164,93,0.18) 0%, rgba(139,108,53,0.08) 100%)"
                : "transparent",
              border: `1px solid ${
                active ? "rgba(201,164,93,0.4)" : "transparent"
              }`,
              color: active ? T.amberBright : T.textMuted,
              fontSize: "10px",
              fontFamily: "Georgia, serif",
              letterSpacing: "0.07em",
              cursor: "pointer",
              boxShadow: active
                ? "0 0 12px rgba(201,164,93,0.15), inset 0 1px 0 rgba(255,255,255,0.05)"
                : "none",
              whiteSpace: "nowrap",
            }}
            title={mode}
          >
            <span style={{ fontSize: "12px", lineHeight: 1 }}>{icon}</span>
            <span className="hidden uppercase tracking-widest sm:inline">
              {mn}
            </span>
            {active && (
              <span
                className="absolute bottom-0.5 left-1/2 -translate-x-1/2 rounded-full"
                style={{
                  width: 18,
                  height: 1.5,
                  background: T.amber,
                  opacity: 0.6,
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

function CharacterRpgModal({
  userName,
  isGuest,
  onClose,
  onResult,
}: {
  userName: string;
  isGuest: boolean;
  onClose: () => void;
  onResult: (result: SavedCharacterResult) => void;
}) {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<RoleId, number>>(() => {
    const base = {} as Record<RoleId, number>;
    for (const role of CHARACTER_ROLES) base[role.id] = 0;
    return base;
  });
  const [result, setResult] = useState<CharacterRole | null>(null);

  const question = RPG_QUESTIONS[step];

  function choose(optionScores: RoleScore) {
    const nextScores = { ...scores };

    for (const [roleId, value] of Object.entries(optionScores) as [
      RoleId,
      number,
    ][]) {
      nextScores[roleId] = (nextScores[roleId] ?? 0) + value;
    }

    setScores(nextScores);

    if (step + 1 >= RPG_QUESTIONS.length) {
      const bestRole =
        CHARACTER_ROLES.slice().sort(
          (a, b) => (nextScores[b.id] ?? 0) - (nextScores[a.id] ?? 0)
        )[0] ?? CHARACTER_ROLES[0];

      const saved: SavedCharacterResult = {
        roleId: bestRole.id,
        roleName: bestRole.name,
        icon: bestRole.icon,
        playerName: userName,
        isGuest,
        createdAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem(CHARACTER_STORAGE_KEY, JSON.stringify(saved));
      } catch {
        // localStorage blocked байвал зөвхөн state дээр хадгална
      }

      setResult(bestRole);
      onResult(saved);
      return;
    }

    setStep((s) => s + 1);
  }

  function restart() {
    const base = {} as Record<RoleId, number>;
    for (const role of CHARACTER_ROLES) base[role.id] = 0;
    setScores(base);
    setStep(0);
    setResult(null);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background:
          "radial-gradient(circle at 50% 20%, rgba(201,164,93,0.18), transparent 35%), rgba(0,0,0,0.76)",
        backdropFilter: "blur(8px)",
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-[620px] overflow-hidden rounded-2xl"
        style={{
          background: "rgba(8,5,2,0.97)",
          border: "1px solid rgba(201,164,93,0.35)",
          boxShadow: "0 30px 90px rgba(0,0,0,0.75)",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: `1px solid ${T.border}` }}
        >
          <div>
            <div
              className="text-[10px] uppercase tracking-[0.35em]"
              style={{ color: T.textMuted }}
            >
              {isGuest ? "Зочин тоглогч" : userName} · 1162–1300
            </div>
            <h2 className="mt-1 text-lg font-bold" style={{ color: T.amberBright }}>
              Чи Их Монголын үед хэн байх байсан бэ?
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-lg"
            style={{
              border: `1px solid ${T.borderMid}`,
              background: "rgba(255,255,255,0.03)",
              color: T.textSub,
            }}
          >
            ✕
          </button>
        </div>

        {!result ? (
          <div className="p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <span
                className="text-[10px] uppercase tracking-[0.25em]"
                style={{ color: T.textMuted }}
              >
                Асуулт {step + 1} / {RPG_QUESTIONS.length}
              </span>

              <div
                className="h-2 w-40 overflow-hidden rounded-full"
                style={{ background: "#1a1208" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${((step + 1) / RPG_QUESTIONS.length) * 100}%`,
                    background: `linear-gradient(90deg, ${T.amberDim}, ${T.amberBright})`,
                  }}
                />
              </div>
            </div>

            <h3 className="mb-5 text-xl font-bold leading-snug" style={{ color: T.text }}>
              {question.question}
            </h3>

            <div className="grid gap-3">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => choose(option.scores)}
                  className="rounded-xl px-4 py-4 text-left transition-all hover:scale-[1.01]"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(201,164,93,0.08), rgba(255,255,255,0.025))",
                    border: `1px solid ${T.borderMid}`,
                    color: T.text,
                    fontFamily: "Georgia, serif",
                  }}
                >
                  <span
                    className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px]"
                    style={{
                      background: "rgba(201,164,93,0.14)",
                      color: T.amberBright,
                      border: "1px solid rgba(201,164,93,0.25)",
                    }}
                  >
                    {idx + 1}
                  </span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <div className="mb-3 text-6xl">{result.icon}</div>

            <div
              className="text-[10px] uppercase tracking-[0.35em]"
              style={{ color: T.textMuted }}
            >
              {userName}-ийн дүр
            </div>

            <h3 className="mt-2 text-3xl font-bold" style={{ color: T.amberBright }}>
              {result.name}
            </h3>

            <div className="mt-1 text-sm" style={{ color: T.textSub }}>
              {result.subtitle}
            </div>

            <p className="mx-auto mt-5 max-w-[480px] text-sm leading-7" style={{ color: T.text }}>
              {result.description}
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {result.strengths.map((strength) => (
                <span
                  key={strength}
                  className="rounded-full px-3 py-1 text-xs"
                  style={{
                    background: "rgba(201,164,93,0.12)",
                    border: "1px solid rgba(201,164,93,0.25)",
                    color: T.amberBright,
                  }}
                >
                  {strength}
                </span>
              ))}
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={restart}
                className="rounded-xl px-4 py-3 text-sm font-bold"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${T.borderMid}`,
                  color: T.text,
                }}
              >
                Дахин тоглох
              </button>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-3 text-sm font-bold"
                style={{
                  background: `linear-gradient(135deg, ${T.amber}, ${T.amberDim})`,
                  color: "#120b03",
                  border: "none",
                }}
              >
                Атлас руу буцах
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AtlasApp() {
  const { user, isLoaded } = useUser();

  const adminMode = isLoaded && !!user;

  const playerName =
    user?.fullName ??
    user?.primaryEmailAddress?.emailAddress ??
    "Зочин";

  const isGuest = !user;

  const emptyForm = {
    periodName: "",
    name: "",
    leader: "",
    capital: "",
    color: "#c9a45d",
    summary: "",
  };

  const [mapMode, setMapMode] = useState<MapMode>("globe");
  const [years, setYears] = useState<number[]>([]);
  const [year, setYear] = useState(1206);
  const [collection, setCollection] =
    useState<AtlasFeatureCollection | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [addPointMode, setAddPointMode] = useState(false);
  const [draftRing, setDraftRing] = useState<Array<[number, number]>>([]);
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedVertexIndex, setSelectedVertexIndex] = useState<number | null>(
    null
  );
  const [characterOpen, setCharacterOpen] = useState(false);
  const [characterResult, setCharacterResult] =
    useState<SavedCharacterResult | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHARACTER_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as SavedCharacterResult;
      setCharacterResult(parsed);
    } catch {
      setCharacterResult(null);
    }
  }, []);

  useEffect(() => {
    fetch("/api/atlas/years")
      .then((r) => r.json())
      .then((data) => {
        const nextYears = data.years as number[];
        setYears(nextYears);

        if (nextYears.length > 0 && !nextYears.includes(year)) {
          setYear(nextYears[0]);
        }
      })
      .catch(() => setLoadError("Timeline ачаалахад алдаа гарлаа."));
  }, [year]);

  useEffect(() => {
    setLoadError(null);

    fetch(`/api/atlas/states?year=${year}`)
      .then(async (r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data: AtlasFeatureCollection) => {
        setCollection(data);
        setSelectedSlug((cur) => {
          const ok = data.features.some((f) => f.properties.slug === cur);
          return ok ? cur : data.features[0]?.properties.slug ?? null;
        });
        setIsEditing(false);
        setIsCreating(false);
        setAddPointMode(false);
        setSelectedVertexIndex(null);
        setSaveState("idle");
        setSaveError(null);
      })
      .catch(() => {
        setCollection(null);
        setSelectedSlug(null);
        setLoadError("Газрын зураг ачаалагдсангүй.");
      });
  }, [year]);

  const selectedFeature = useMemo(
    () =>
      collection?.features.find((f) => f.properties.slug === selectedSlug) ??
      null,
    [collection, selectedSlug]
  );

  const filteredFeatures = useMemo(() => {
    if (!collection) return [];

    const q = search.trim().toLowerCase();

    return collection.features.filter(
      (f) =>
        !q ||
        f.properties.name.toLowerCase().includes(q) ||
        f.properties.leader.toLowerCase().includes(q) ||
        f.properties.capital.toLowerCase().includes(q)
    );
  }, [collection, search]);

  useEffect(() => {
    if (!selectedFeature || isCreating) {
      setDraftRing([]);
      return;
    }

    setDraftRing(
      selectedFeature.geometry.coordinates[0] as Array<[number, number]>
    );

    setForm({
      periodName: String(selectedFeature.properties.metadata?.periodName ?? ""),
      name: selectedFeature.properties.name,
      leader: selectedFeature.properties.leader,
      capital: selectedFeature.properties.capital,
      color: selectedFeature.properties.color,
      summary: selectedFeature.properties.summary,
    });

    setSelectedVertexIndex(null);
    setSaveState("idle");
    setSaveError(null);
  }, [isCreating, selectedFeature]);

  const handleSelectSlug = useCallback((slug: string) => {
    setSelectedSlug(slug);
  }, []);

  function handleDeleteVertex(index: number) {
    if (draftRing.length <= 4) return;

    const next = draftRing.filter((_, i) => i !== index);
    setDraftRing(next);
    setSelectedVertexIndex(null);
  }

  function resetCreateMode() {
    setIsCreating(false);
    setIsEditing(false);
    setAddPointMode(false);
    setSelectedVertexIndex(null);
    setDraftRing(
      (selectedFeature?.geometry.coordinates[0] as Array<[number, number]>) ??
        []
    );
    setForm(
      selectedFeature
        ? {
            periodName: String(
              selectedFeature.properties.metadata?.periodName ?? ""
            ),
            name: selectedFeature.properties.name,
            leader: selectedFeature.properties.leader,
            capital: selectedFeature.properties.capital,
            color: selectedFeature.properties.color,
            summary: selectedFeature.properties.summary,
          }
        : emptyForm
    );
    setSaveState("idle");
    setSaveError(null);
  }

  // async function handleSaveGeometry() {
  //   if (draftRing.length < 4) return;

  //   if (!form.name || form.name.length < 2) {
  //     setSaveError("Нэр дор хаяж 2 тэмдэгт байна.");
  //     setSaveState("error");
  //     return;
  //   }

  //   if (!form.summary || form.summary.length < 8) {
  //     setSaveError("Тайлбар дор хаяж 8 тэмдэгт байна.");
  //     setSaveState("error");
  //     return;
  //   }

  //   try {
  //     setSaveState("saving");
  //     setSaveError(null);

  //     if (isCreating) {
  //       const res = await fetch("/api/atlas/states", {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           year,
  //           name: form.name,
  //           leader: form.leader,
  //           capital: form.capital,
  //           color: form.color,
  //           summary: form.summary,
  //           metadata: { periodName: form.periodName },
  //           coordinates: draftRing,
  //         }),
  //       });

  //       if (!res.ok) {
  //         const b = await res.json().catch(() => ({}));
  //         throw new Error((b as { error?: string }).error ?? "create-failed");
  //       }

  //       const { feature: cf, collection: nextCollection } =
  //         (await res.json()) as {
  //           feature: AtlasStateFeature;
  //           collection?: AtlasFeatureCollection;
  //         };

  //       setCollection((c) => {
  //         if (nextCollection) return nextCollection;

  //         return c
  //           ? { ...c, features: [...c.features, cf] }
  //           : { type: "FeatureCollection", year, features: [cf] };
  //       });

  //       setSelectedSlug(cf.properties.slug);
  //       setIsCreating(false);
  //       setIsEditing(false);
  //       setSelectedVertexIndex(null);
  //       setDraftRing(cf.geometry.coordinates[0] as Array<[number, number]>);
  //       setForm({
  //         name: cf.properties.name,
  //         leader: cf.properties.leader,
  //         capital: cf.properties.capital,
  //         color: cf.properties.color,
  //         summary: cf.properties.summary,
  //         periodName: String(cf.properties.metadata?.periodName ?? ""),
  //       });
  //       setSaveState("saved");
  //       setTimeout(() => setSaveState("idle"), 1800);
  //       return;
  //     }

  //     if (!selectedFeature) throw new Error("no-feature");

  //     const res = await fetch(
  //       `/api/atlas/states/${selectedFeature.properties.slug}`,
  //       {
  //         method: "PATCH",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           year,
  //           name: form.name,
  //           leader: form.leader,
  //           capital: form.capital,
  //           color: form.color,
  //           summary: form.summary,
  //           metadata: {
  //             ...(selectedFeature.properties.metadata ?? {}),
  //             periodName: form.periodName,
  //           },
  //           coordinates: draftRing,
  //         }),
  //       }
  //     );

  //     if (!res.ok) {
  //       const b = await res.json().catch(() => ({}));
  //       throw new Error((b as { error?: string }).error ?? "save-failed");
  //     }

  //     const { feature: uf } = (await res.json()) as {
  //       feature: AtlasStateFeature;
  //     };

  //     setCollection((c) =>
  //       c
  //         ? {
  //             ...c,
  //             features: c.features.map((f) =>
  //               f.properties.slug === uf.properties.slug ? uf : f
  //             ),
  //           }
  //         : c
  //     );

  //     setDraftRing(uf.geometry.coordinates[0] as Array<[number, number]>);
  //     setSelectedVertexIndex(null);
  //     setSaveState("saved");
  //     setTimeout(() => setSaveState("idle"), 1800);
  //   } catch (err) {
  //     setSaveState("error");
  //     setSaveError(
  //       err instanceof Error ? err.message : "Хадгалахад алдаа гарлаа."
  //     );
  //   }
  // }

  async function handleSaveGeometry() {
  const cleanedCoordinates = draftRing
    .map((point) => [Number(point[0]), Number(point[1])] as [number, number])
    .filter(
      ([lng, lat]) =>
        Number.isFinite(lng) &&
        Number.isFinite(lat) &&
        lng >= -180 &&
        lng <= 180 &&
        lat >= -90 &&
        lat <= 90
    );

  if (cleanedCoordinates.length < 4) {
    setSaveError(
      "Polygon үүсгэхийн тулд газрын зураг дээр дор хаяж 3 цэг дарна уу."
    );
    setSaveState("error");
    return;
  }

  const cleanedName = form.name.trim();
  const cleanedLeader = form.leader.trim() || "Тодорхойгүй";
  const cleanedCapital = form.capital.trim() || "Тодорхойгүй";
  const cleanedColor = form.color.trim() || "#c9a45d";
  const cleanedSummary = form.summary.trim();
  const cleanedPeriodName = form.periodName.trim();

  if (cleanedName.length < 2) {
    setSaveError("Нэр дор хаяж 2 тэмдэгт байна.");
    setSaveState("error");
    return;
  }

  if (cleanedSummary.length < 8) {
    setSaveError("Тайлбар дор хаяж 8 тэмдэгт байна.");
    setSaveState("error");
    return;
  }

  try {
    setSaveState("saving");
    setSaveError(null);

    if (isCreating) {
      const payload = {
        year: Number(year),
        name: cleanedName,
        leader: cleanedLeader,
        capital: cleanedCapital,
        color: cleanedColor,
        summary: cleanedSummary,
        metadata: {
          periodName: cleanedPeriodName,
        },
        coordinates: cleanedCoordinates,
      };

      const res = await fetch("/api/atlas/states", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const b = await res.json().catch(() => ({}));

        console.error("[create atlas state failed]", b);

        throw new Error(
          b?.details?.fieldErrors
            ? Object.entries(b.details.fieldErrors)
                .map(([key, value]) => `${key}: ${(value as string[]).join(", ")}`)
                .join(" | ")
            : b?.error ?? "create-failed"
        );
      }

      const { feature: cf, collection: nextCollection } =
        (await res.json()) as {
          feature: AtlasStateFeature;
          collection?: AtlasFeatureCollection;
        };

      setCollection((c) => {
        if (nextCollection) return nextCollection;

        return c
          ? {
              ...c,
              features: [...c.features, cf],
            }
          : {
              type: "FeatureCollection",
              year,
              features: [cf],
            };
      });

      setSelectedSlug(cf.properties.slug);
      setIsCreating(false);
      setIsEditing(false);
      setAddPointMode(false);
      setSelectedVertexIndex(null);
      setDraftRing(cf.geometry.coordinates[0] as Array<[number, number]>);

      setForm({
        name: cf.properties.name,
        leader: cf.properties.leader,
        capital: cf.properties.capital,
        color: cf.properties.color,
        summary: cf.properties.summary,
        periodName: String(cf.properties.metadata?.periodName ?? ""),
      });

      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1800);
      return;
    }

    if (!selectedFeature) {
      throw new Error("no-feature");
    }

    const payload = {
      year: Number(year),
      name: cleanedName,
      leader: cleanedLeader,
      capital: cleanedCapital,
      color: cleanedColor,
      summary: cleanedSummary,
      metadata: {
        ...(selectedFeature.properties.metadata ?? {}),
        periodName: cleanedPeriodName,
      },
      coordinates: cleanedCoordinates,
    };

    const res = await fetch(
      `/api/atlas/states/${selectedFeature.properties.slug}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const b = await res.json().catch(() => ({}));

      console.error("[update atlas state failed]", b);

      throw new Error(
        b?.details?.fieldErrors
          ? Object.entries(b.details.fieldErrors)
              .map(([key, value]) => `${key}: ${(value as string[]).join(", ")}`)
              .join(" | ")
          : b?.error ?? "save-failed"
      );
    }

    const { feature: uf } = (await res.json()) as {
      feature: AtlasStateFeature;
    };

    setCollection((c) =>
      c
        ? {
            ...c,
            features: c.features.map((f) =>
              f.properties.slug === uf.properties.slug ? uf : f
            ),
          }
        : c
    );

    setDraftRing(uf.geometry.coordinates[0] as Array<[number, number]>);
    setSelectedVertexIndex(null);
    setSaveState("saved");
    setTimeout(() => setSaveState("idle"), 1800);
  } catch (err) {
    console.error("[handleSaveGeometry]", err);

    setSaveState("error");
    setSaveError(
      err instanceof Error ? err.message : "Хадгалахад алдаа гарлаа."
    );
  }
}

  async function handleDeleteState() {
    if (!selectedFeature || isCreating) return;

    try {
      setSaveState("saving");

      const res = await fetch(
        `/api/atlas/states/${selectedFeature.properties.slug}?year=${year}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error();

      setCollection((c) => {
        if (!c) return c;

        const next = c.features.filter(
          (f) => f.properties.slug !== selectedFeature.properties.slug
        );

        setSelectedSlug(next[0]?.properties.slug ?? null);

        return { ...c, features: next };
      });

      setDraftRing([]);
      setSelectedVertexIndex(null);
      setForm(emptyForm);
      setIsEditing(false);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1800);
    } catch {
      setSaveState("error");
      setSaveError("Устгахад алдаа гарлаа.");
    }
  }

  const sharedMapProps = {
    collection,
    selectedSlug,
    onSelectSlug: handleSelectSlug,
    isEditing: adminMode && isEditing,
    isCreating: adminMode && isCreating,
    addPointMode: adminMode && addPointMode,
    draftRing,
    onDraftRingChange: setDraftRing,
    selectedVertexIndex,
    onSelectVertex: setSelectedVertexIndex,
  };

  const coordEditorProps = {
    year,
    feature: selectedFeature,
    isEditing,
    isCreating,
    addPointMode,
    draftRing,
    saveState,
    saveError,
    form,
    onFormChange: (
      f: "periodName" | "name" | "leader" | "capital" | "color" | "summary",
      v: string
    ) => setForm((c) => ({ ...c, [f]: v })),
    onStartCreate: () => {
      setSelectedSlug(null);
      setIsCreating(true);
      setIsEditing(true);
      setAddPointMode(false);
      setSelectedVertexIndex(null);
      setDraftRing([]);
      setForm(emptyForm);
      setSaveState("idle");
      setSaveError(null);
    },
    onCancelCreate: resetCreateMode,
    onToggleEditing: () => {
      setIsEditing((c) => !c);
      setAddPointMode(false);
      setSelectedVertexIndex(null);
      setSaveState("idle");
      setSaveError(null);
    },
    onToggleAddPoint: () => setAddPointMode((c) => !c),
    onReset: () => {
      if (isCreating) {
        setDraftRing([]);
        setSelectedVertexIndex(null);
        setSaveState("idle");
        setSaveError(null);
        return;
      }

      if (!selectedFeature) return;

      setDraftRing(
        selectedFeature.geometry.coordinates[0] as Array<[number, number]>
      );
      setSelectedVertexIndex(null);
      setForm({
        periodName: String(
          selectedFeature.properties.metadata?.periodName ?? ""
        ),
        name: selectedFeature.properties.name,
        leader: selectedFeature.properties.leader,
        capital: selectedFeature.properties.capital,
        color: selectedFeature.properties.color,
        summary: selectedFeature.properties.summary,
      });
      setSaveState("idle");
      setSaveError(null);
    },
    onSave: handleSaveGeometry,
    onDelete: handleDeleteState,
    selectedVertexIndex,
    onSelectVertex: setSelectedVertexIndex,
    onDeleteVertex: handleDeleteVertex,
  };

  return (
    <main
      className="min-h-screen overflow-hidden"
      style={{
        background: T.bg,
        fontFamily: "'Georgia', 'Times New Roman', serif",
      }}
    >
      {characterOpen && (
        <CharacterRpgModal
          userName={playerName}
          isGuest={isGuest}
          onClose={() => setCharacterOpen(false)}
          onResult={setCharacterResult}
        />
      )}

      <div className="flex min-h-screen flex-col lg:h-screen lg:flex-row lg:overflow-hidden">
        <Sidebar
          year={year}
          features={filteredFeatures}
          selectedFeature={selectedFeature}
          onSelectSlug={handleSelectSlug}
          search={search}
          onSearchChange={setSearch}
          adminMode={adminMode}
          user={user}
        />

        <section className="relative flex min-h-[70vh] flex-1 flex-col overflow-hidden lg:h-screen lg:min-h-0">
          <div className="absolute inset-0 z-0">
            {mapMode === "globe" && <GlobeMap {...sharedMapProps} />}
            {mapMode === "historical" && <HistoricalMap {...sharedMapProps} />}
          </div>

          <div className="pointer-events-none relative z-20 flex items-start justify-between gap-3 px-4 pt-3">
            <div
              className="pointer-events-auto flex items-center gap-3 rounded-xl py-2.5 pl-3 pr-4"
              style={{
                background: T.panel,
                border: `1px solid ${T.border}`,
                backdropFilter: "blur(16px)",
                boxShadow:
                  "0 4px 28px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.03)",
              }}
            >
              <div
                className="relative flex shrink-0 items-center justify-center"
                style={{ width: 32, height: 32 }}
              >
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle at 40% 35%, rgba(201,164,93,0.18), transparent 70%)",
                    border: "1px solid rgba(201,164,93,0.22)",
                  }}
                />
                <svg width="20" height="20" viewBox="0 0 20 20">
                  <polygon
                    points="10,1 12.2,7 18.5,7 13.4,11 15.4,17.5 10,14 4.6,17.5 6.6,11 1.5,7 7.8,7"
                    fill="#c9a45d"
                    opacity="0.9"
                  />
                </svg>
              </div>

              <div>
                <h1
                  className="text-sm font-bold uppercase leading-none tracking-widest"
                  style={{
                    color: T.amber,
                    letterSpacing: "0.12em",
                    textShadow: `0 0 16px ${T.amberGlow}`,
                    fontFamily: "Georgia, serif",
                  }}
                >
                  Монгол · Төв Азийн Атлас
                </h1>
                <p
                  className="mt-1 text-[8px] uppercase tracking-[0.45em]"
                  style={{ color: T.textMuted, fontFamily: "Georgia, serif" }}
                >
                  1162 — 1300 · Дундад зуун
                </p>
              </div>
            </div>

            <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCharacterOpen(true)}
                className="rounded-xl px-3 py-2 text-[10px] uppercase tracking-widest"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(201,164,93,0.20), rgba(139,108,53,0.08))",
                  border: "1px solid rgba(201,164,93,0.42)",
                  color: T.amberBright,
                  backdropFilter: "blur(16px)",
                  fontFamily: "Georgia, serif",
                  boxShadow: "0 0 16px rgba(201,164,93,0.10)",
                }}
              >
                🎲 {characterResult ? "Дүрээ солих" : "Дүрээ олох"}
              </button>

              <MapSwitcher current={mapMode} onChange={setMapMode} />

              {adminMode && (
                <div
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[10px] uppercase tracking-widest"
                  style={{
                    background: T.panel,
                    border: "1px solid rgba(201,164,93,0.38)",
                    color: T.amber,
                    backdropFilter: "blur(16px)",
                    boxShadow: "0 0 16px rgba(201,164,93,0.08)",
                    fontFamily: "Georgia, serif",
                    letterSpacing: "0.1em",
                  }}
                >
                  <svg width="9" height="9" viewBox="0 0 10 10">
                    <polygon
                      points="5,0 6.2,3.5 10,3.5 7,5.7 8,9.5 5,7.5 2,9.5 3,5.7 0,3.5 3.8,3.5"
                      fill={T.amber}
                    />
                  </svg>
                  Хаан · Засах эрхтэй
                </div>
              )}

              {collection && (
                <div
                  className="rounded-xl px-3 py-2 text-[10px] uppercase tracking-widest tabular-nums"
                  style={{
                    background: "rgba(8,5,2,0.88)",
                    border: `1px solid ${T.border}`,
                    color: T.textSub,
                    backdropFilter: "blur(16px)",
                    fontFamily: "Georgia, serif",
                  }}
                >
                  {collection.features.length} улс
                </div>
              )}
            </div>
          </div>

          {characterResult && (
            <div
              className="pointer-events-auto absolute left-4 top-24 z-20 max-w-[320px] rounded-2xl p-4"
              style={{
                background: "rgba(8,5,2,0.90)",
                border: "1px solid rgba(201,164,93,0.32)",
                backdropFilter: "blur(16px)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
              }}
            >
              <div
                className="text-[9px] uppercase tracking-[0.32em]"
                style={{ color: T.textMuted }}
              >
                {characterResult.isGuest ? "Зочны дүр" : "Миний дүр"}
              </div>

              <div className="mt-2 flex items-center gap-3">
                <div className="text-4xl">{characterResult.icon}</div>
                <div>
                  <div className="text-lg font-bold" style={{ color: T.amberBright }}>
                    {characterResult.roleName}
                  </div>
                  <div className="text-xs" style={{ color: T.textSub }}>
                    {characterResult.playerName}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCharacterOpen(true)}
                className="mt-4 w-full rounded-xl px-3 py-2 text-xs font-bold"
                style={{
                  background: "rgba(201,164,93,0.12)",
                  border: "1px solid rgba(201,164,93,0.25)",
                  color: T.amberBright,
                }}
              >
                Дахин тоглож дүрээ солих
              </button>
            </div>
          )}

          {loadError && (
            <div
              className="absolute left-4 top-16 z-30 flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs"
              style={{
                background: "rgba(20,4,4,0.96)",
                border: "1px solid rgba(150,40,40,0.5)",
                color: "#f08080",
                backdropFilter: "blur(12px)",
                fontFamily: "Georgia, serif",
              }}
            >
              <span style={{ fontSize: 11 }}>⚠</span>
              {loadError}
            </div>
          )}

          <div
            className="absolute bottom-28 right-4 top-16 z-20 hidden w-[340px] flex-col xl:flex"
            style={{
              pointerEvents: selectedFeature || adminMode ? "auto" : "none",
            }}
          >
            {adminMode ? (
              <div className="flex-1 overflow-hidden">
                <CoordEditor {...coordEditorProps} />
              </div>
            ) : (
              <SelectedStateDrawer
                year={year}
                feature={selectedFeature}
                onClose={() => setSelectedSlug(null)}
              />
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-4">
            <div
              className="overflow-hidden rounded-2xl"
              style={{
                background: "rgba(8,5,2,0.94)",
                border: `1px solid ${T.border}`,
                backdropFilter: "blur(20px)",
                boxShadow:
                  "0 -2px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.025)",
              }}
            >
              <div
                className="flex px-5 pb-1 pt-2.5 text-[8px] uppercase tracking-[0.28em]"
                style={{ borderBottom: `1px solid ${T.border}` }}
              >
                {[
                  { label: "Эрт дундад зуун", flex: 2 },
                  { label: "Дунд үе", flex: 3 },
                  { label: "Өндөр дундад зуун", flex: 2 },
                  { label: "Монголын хаант улс", flex: 3 },
                ].map(({ label, flex }, i, arr) => (
                  <div
                    key={label}
                    className="relative text-center"
                    style={{
                      flex,
                      color: T.textMuted,
                      fontFamily: "Georgia, serif",
                      borderRight:
                        i < arr.length - 1 ? `1px solid ${T.border}` : "none",
                      paddingRight: 4,
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 px-5 pb-3 pt-2">
                <div
                  className="flex shrink-0 flex-col items-center justify-center rounded-lg px-3 py-1.5 tabular-nums"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(201,164,93,0.14), rgba(139,108,53,0.06))",
                    border: "1px solid rgba(201,164,93,0.3)",
                    minWidth: 64,
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                  }}
                >
                  <span
                    style={{
                      color: T.amberBright,
                      fontSize: 18,
                      fontWeight: 700,
                      fontFamily: "Georgia, serif",
                      lineHeight: 1.1,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {year}
                  </span>
                  <span
                    style={{
                      color: T.textMuted,
                      fontSize: 8,
                      letterSpacing: "0.25em",
                      textTransform: "uppercase",
                      fontFamily: "Georgia, serif",
                    }}
                  >
                    он
                  </span>
                </div>

                <div className="flex-1">
                  <TimelineSlider
                    years={years}
                    currentYear={year}
                    onYearChange={setYear}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 px-4 pb-4 pt-[calc(70vh+1rem)] xl:hidden">
            {adminMode ? (
              <CoordEditor {...coordEditorProps} />
            ) : (
              <SelectedStateDrawer
                year={year}
                feature={selectedFeature}
                onClose={() => setSelectedSlug(null)}
              />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}