// // "use client";

// // interface TimelineSliderProps {
// //   years: number[];
// //   currentYear: number;
// //   onYearChange: (year: number) => void;
// // }

// // export default function TimelineSlider({ years, currentYear, onYearChange }: TimelineSliderProps) {
// //   const currentIndex = Math.max(0, years.findIndex((year) => year === currentYear));

// //   return (
// //     <div className="rounded-[28px] border border-white/10 bg-slate-950/70 px-5 py-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
// //       <div className="flex items-center justify-between gap-4">
// //         <div>
// //           <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Timeline</p>
// //           <h3 className="mt-2 font-[family:var(--font-cinzel-decorative)] text-2xl text-white">{currentYear} он</h3>
// //         </div>
// //         <p className="text-right text-xs text-slate-400">1162-1300</p>
// //       </div>

// //       <input
// //         type="range"
// //         min={0}
// //         max={Math.max(years.length - 1, 0)}
// //         step={1}
// //         value={currentIndex}
// //         onChange={(event) => onYearChange(years[Number(event.target.value)] ?? currentYear)}
// //         className="mt-5 w-full accent-amber-300"
// //       />

// //       <div className="mt-4 overflow-x-auto pb-1">
// //         <div className="flex min-w-max gap-2">
// //           {years.map((year) => (
// //             <button
// //               key={year}
// //               type="button"
// //               onClick={() => onYearChange(year)}
// //               className={`shrink-0 rounded-full px-3 py-1 text-xs transition ${
// //                 year === currentYear
// //                   ? "bg-amber-300 text-slate-950"
// //                   : "bg-white/5 text-slate-300 hover:bg-white/10"
// //               }`}
// //             >
// //               {year}
// //             </button>
// //           ))}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }




// "use client";

// const GOLD = "#c9a45d";
// const GOLD_DIM = "#8b6c35";
// const BORDER = "#4a3010";
// const TEXT_MAIN = "#f0deb4";
// const TEXT_MUTED = "#5c4020";
// const BG = "rgba(12,7,2,0.97)";

// interface TimelineSliderProps {
//   years: number[];
//   currentYear: number;
//   onYearChange: (year: number) => void;
// }

// export default function TimelineSlider({ years, currentYear, onYearChange }: TimelineSliderProps) {
//   const currentIndex = Math.max(0, years.findIndex((y) => y === currentYear));

//   return (
//     <div
//       className="rounded-[20px] px-5 py-4"
//       style={{
//         background: BG,
//         border: `1px solid ${BORDER}`,
//         boxShadow: `0 0 30px rgba(0,0,0,0.7), inset 0 0 40px rgba(201,164,93,0.03)`,
//         fontFamily: "Georgia, serif",
//       }}
//     >
//       {/* Header */}
//       <div className="flex items-center justify-between mb-3">
//         <div className="flex items-center gap-3">
//           {/* Sword icon */}
//           <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
//             <line x1="2" y1="12" x2="12" y2="2" stroke={GOLD_DIM} strokeWidth="1.5" strokeLinecap="round"/>
//             <line x1="10" y1="4" x2="12" y2="6" stroke={GOLD_DIM} strokeWidth="1.5" strokeLinecap="round"/>
//             <circle cx="2.5" cy="11.5" r="1" fill={GOLD_DIM}/>
//           </svg>
//           <div>
//             <p className="text-[8px] uppercase tracking-[0.45em]" style={{ color: TEXT_MUTED }}>Цаг хугацааны шугам</p>
//             <p className="text-2xl font-bold leading-none mt-0.5" style={{ color: GOLD, textShadow: `0 0 10px ${GOLD}44` }}>
//               {currentYear} <span className="text-sm font-normal" style={{ color: GOLD_DIM }}>он</span>
//             </p>
//           </div>
//         </div>
//         <div className="text-right">
//           <p className="text-[8px] uppercase tracking-[0.3em]" style={{ color: TEXT_MUTED }}>Хугацаа</p>
//           <p className="text-xs" style={{ color: TEXT_MUTED }}>1162 — 1300</p>
//         </div>
//       </div>

//       {/* Custom range track */}
//       <div className="relative mb-3">
//         {/* Track background */}
//         <div
//           className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[3px] rounded-full"
//           style={{ background: `linear-gradient(90deg, ${GOLD_DIM}, ${GOLD_DIM}80)` }}
//         />
//         {/* Progress fill */}
//         <div
//           className="absolute top-1/2 left-0 -translate-y-1/2 h-[3px] rounded-full"
//           style={{
//             background: `linear-gradient(90deg, ${GOLD}, ${GOLD_DIM})`,
//             width: `${years.length > 1 ? (currentIndex / (years.length - 1)) * 100 : 0}%`,
//             boxShadow: `0 0 6px ${GOLD}88`,
//           }}
//         />
//         <input
//           type="range"
//           min={0}
//           max={Math.max(years.length - 1, 0)}
//           step={1}
//           value={currentIndex}
//           onChange={(e) => onYearChange(years[Number(e.target.value)] ?? currentYear)}
//           className="relative w-full appearance-none bg-transparent outline-none"
//           style={{
//             height: "20px",
//             cursor: "pointer",
//           }}
//         />
//       </div>

//       {/* Year buttons */}
//       <div className="overflow-x-auto pb-1">
//         <div className="flex min-w-max gap-1.5">
//           {years.map((year) => {
//             const active = year === currentYear;
//             return (
//               <button
//                 key={year}
//                 type="button"
//                 onClick={() => onYearChange(year)}
//                 className="shrink-0 rounded px-2.5 py-1 text-[10px] transition-all duration-150"
//                 style={{
//                   background: active
//                     ? `linear-gradient(135deg, ${GOLD}28, ${GOLD}12)`
//                     : "rgba(255,200,100,0.04)",
//                   border: `1px solid ${active ? GOLD + "66" : BORDER}`,
//                   color: active ? GOLD : TEXT_MUTED,
//                   fontFamily: "Georgia, serif",
//                   boxShadow: active ? `0 0 8px ${GOLD}33` : "none",
//                   letterSpacing: "0.04em",
//                 }}
//               >
//                 {year}
//               </button>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";

// ── Theme ────────────────────────────────────────────────────────────────────
const T = {
  amber: "#f59e0b",
  amberDim: "#d97706",
  amberGlow: "#f59e0b22",
  text: "#e7e5e0",
  textSub: "#a8a29e",
  textMuted: "#57534e",
  border: "#1e293b",
};

interface TimelineSliderProps {
  years: number[];
  currentYear: number;
  onYearChange: (year: number) => void;
}

export default function TimelineSlider({
  years,
  currentYear,
  onYearChange,
}: TimelineSliderProps) {
  const currentIndex = Math.max(0, years.findIndex((y) => y === currentYear));
  const progress = years.length > 1 ? (currentIndex / (years.length - 1)) * 100 : 0;

  return (
    <div className="w-full" style={{ fontFamily: "'Georgia', serif" }}>
      {/* Top row: year label + range */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-baseline gap-2">
          <span
            className="text-2xl font-bold leading-none"
            style={{ color: T.amber, textShadow: `0 0 10px ${T.amberGlow}` }}
          >
            {currentYear}
          </span>
          <span className="text-xs" style={{ color: T.amberDim }}>он</span>
        </div>
        <span className="text-[9px] uppercase tracking-[0.35em]" style={{ color: T.textMuted }}>
          1162 — 1300
        </span>
      </div>

      {/* Custom range track */}
      <div className="relative mb-3" style={{ height: "20px" }}>
        {/* Track bg */}
        <div
          className="absolute top-1/2 left-0 right-0 -translate-y-1/2 rounded-full"
          style={{ height: "3px", background: T.border }}
        />
        {/* Progress fill */}
        <div
          className="absolute top-1/2 left-0 -translate-y-1/2 rounded-full"
          style={{
            height: "3px",
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${T.amberDim}, ${T.amber})`,
            boxShadow: `0 0 8px ${T.amber}66`,
          }}
        />
        {/* Thumb tick mark */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            left: `${progress}%`,
            width: "3px",
            height: "12px",
            background: T.amber,
            borderRadius: "2px",
            boxShadow: `0 0 6px ${T.amber}`,
          }}
        />
        <input
          type="range"
          min={0}
          max={Math.max(years.length - 1, 0)}
          step={1}
          value={currentIndex}
          onChange={(e) => onYearChange(years[Number(e.target.value)] ?? currentYear)}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          style={{ height: "20px" }}
        />
      </div>

      {/* Year pills */}
      <div className="overflow-x-auto pb-0.5 -mx-1">
        <div className="flex min-w-max gap-1.5 px-1">
          {years.map((year) => {
            const active = year === currentYear;
            return (
              <button
                key={year}
                type="button"
                onClick={() => onYearChange(year)}
                className="shrink-0 rounded px-2.5 py-1 text-[10px] transition-all duration-150"
                style={{
                  background: active
                    ? `linear-gradient(135deg, ${T.amber}22, ${T.amber}10)`
                    : "rgba(15,23,42,0.5)",
                  border: `1px solid ${active ? T.amber + "55" : T.border}`,
                  color: active ? T.amber : T.textMuted,
                  boxShadow: active ? `0 0 8px ${T.amber}22` : "none",
                  letterSpacing: "0.04em",
                  fontFamily: "Georgia, serif",
                }}
              >
                {year}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}