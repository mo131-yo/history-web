// "use client";
// import React from "react";
// import { 
//   Swords, Store, Landmark, Coins, Wheat, 
//   Crown, Pickaxe, MapPin, AlertTriangle 
// } from "lucide-react";

// interface Props {
//   resources: { gold: number; food: number; prestige: number };
//   buildings: any[];
//   selectedToBuild: string | null;
//   setSelectedToBuild: (id: string | null) => void;
// }

// export const BUILDING_TYPES = {
//   BARRACKS: { id: "barracks", name: "Цэргийн хүрээ", cost: 100, desc: "Цэргийн хүчийг нэмэгдүүлнэ", icon: <Swords size={18} />, color: "#ef4444" },
//   MARKET: { id: "market", name: "Өртөө / Зах", cost: 150, desc: "Алтны орлогыг өсгөнө", icon: <Store size={18} />, color: "#fbbf24" },
//   TEMPLE: { id: "temple", name: "Сүм хийд", cost: 200, desc: "Нэр хүндийг өсгөнө", icon: <Landmark size={18} />, color: "#8b5cf6" },
// };

// export default function EmpireManager({ resources, buildings, selectedToBuild, setSelectedToBuild }: Props) {
//   return (
//     <div className="flex flex-col h-full bg-[#080A12]/50 backdrop-blur-xl border-l border-white/5 text-slate-200">
      
//       {/* 1. Header & Stats Section */}
//       <div className="p-6 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
//         <h2 className="font-serif text-xl font-bold text-[#C5A059] mb-4 flex items-center gap-2">
//           <Crown size={20} /> Эзэнт Гүрний Удирдах Төв
//         </h2>
        
//         <div className="grid grid-cols-3 gap-3">
//           <StatCard icon={<Coins className="text-yellow-500" />} label="Алт" value={resources.gold} />
//           <StatCard icon={<Wheat className="text-green-500" />} label="Хүнс" value={resources.food} />
//           <StatCard icon={<Crown className="text-purple-500" />} label="Нэр хүнд" value={resources.prestige} />
//         </div>
//       </div>

//       {/* 2. Building Menu */}
//       <div className="p-6 flex-1 overflow-y-auto space-y-4">
//         <div className="flex justify-between items-center mb-2">
//           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Байгууламж барих</h3>
//           <span className="text-[9px] bg-white/5 px-2 py-1 rounded text-white/40">Барилга: {buildings.length}</span>
//         </div>

//         <div className="grid gap-3">
//           {Object.values(BUILDING_TYPES).map((b) => {
//             const isSelected = selectedToBuild === b.id;
//             const canAfford = resources.gold >= b.cost;

//             return (
//               <button
//                 key={b.id}
//                 onClick={() => setSelectedToBuild(isSelected ? null : b.id)}
//                 disabled={!canAfford}
//                 className={`group relative flex flex-col p-4 rounded-2xl border transition-all duration-300 ${
//                   isSelected 
//                     ? 'bg-[#C5A059] border-[#C5A059] text-black shadow-[0_0_20px_rgba(197,160,89,0.2)] scale-[0.98]' 
//                     : 'bg-white/[0.03] border-white/10 hover:border-white/20'
//                 } ${!canAfford && 'opacity-40 cursor-not-allowed grayscale'}`}
//               >
//                 <div className="flex justify-between items-start w-full mb-1">
//                   <div className={`p-2 rounded-lg ${isSelected ? 'bg-black/10' : 'bg-white/5 text-[#C5A059]'}`}>
//                     {b.icon}
//                   </div>
//                   <span className={`text-[10px] font-bold ${isSelected ? 'text-black/60' : 'text-white/20'}`}>
//                     {b.cost} <Coins size={10} className="inline mb-0.5" />
//                   </span>
//                 </div>
                
//                 <div className="text-left mt-2">
//                   <p className="text-xs font-bold uppercase tracking-tight">{b.name}</p>
//                   <p className={`text-[10px] leading-tight mt-1 ${isSelected ? 'text-black/70' : 'text-white/40'}`}>
//                     {b.desc}
//                   </p>
//                 </div>

//                 {isSelected && (
//                   <div className="absolute -right-2 -top-2 bg-red-500 text-white p-1 rounded-full animate-bounce">
//                     <MapPin size={12} />
//                   </div>
//                 )}
//               </button>
//             );
//           })}
//         </div>

//         {selectedToBuild && (
//           <div className="mt-6 p-4 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center gap-3 animate-pulse">
//             <Pickaxe size={18} className="text-[#C5A059]" />
//             <p className="text-[11px] text-[#C5A059] font-medium">
//               Газрын зураг дээр дарж байршлыг сонгоно уу...
//             </p>
//           </div>
//         )}
//       </div>

//       {/* 3. Recent Events / Logs */}
//       <div className="p-6 border-t border-white/5 bg-black/20">
//         <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-4 flex items-center gap-2">
//           <AlertTriangle size={12} /> Сүүлийн үйл явдлууд
//         </h3>
//         <div className="space-y-3">
//           <LogItem text="Шинэ он гарлаа. Нөөц нэмэгдэв." time="Одоо" />
//           {buildings.length > 0 && (
//             <LogItem text={`${buildings[buildings.length - 1].name} баригдаж дууслаа.`} time="Саяхан" />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// // Туслах компонентууд
// function StatCard({ icon, label, value }: { icon: any, label: string, value: number }) {
//   return (
//     <div className="bg-white/[0.02] border border-white/5 p-3 rounded-2xl flex flex-col items-center justify-center">
//       <div className="mb-1">{icon}</div>
//       <span className="text-[16px] font-black text-white leading-none">{value}</span>
//       <span className="text-[8px] uppercase tracking-widest text-white/30 mt-1">{label}</span>
//     </div>
//   );
// }

// function LogItem({ text, time }: { text: string; time: string }) {
//   return (
//     <div className="flex justify-between items-center gap-4">
//       <p className="text-[10px] text-white/50 truncate">● {text}</p>
//       <span className="text-[8px] text-white/20 whitespace-nowrap">{time}</span>
//     </div>
//   );
// }

// kkkk