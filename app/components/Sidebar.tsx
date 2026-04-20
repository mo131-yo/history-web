"use client";
import React, { Activity, useState } from "react";
import { 
  Search, X, ChevronRight, BrainCircuit, Compass, 
  Shield, Coins, Users, Landmark, Map as MapIcon, Sword,
  Scroll,
  Target,
  Zap
} from "lucide-react";

interface SidebarProps {
  year: number;
  isWhatIf: boolean;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  selectedFeature: any;
  setSelectedFeature: (f: any) => void;
  searchResults: any[];
  onFlyTo: (f: any) => void;
  onStartQuiz: () => void;
}

export const Sidebar = ({
  year, isWhatIf, collapsed, setCollapsed, searchQuery, setSearchQuery,
  selectedFeature, setSelectedFeature, searchResults, onFlyTo, onStartQuiz
}: SidebarProps) => {
  const [activeTab, setActiveTab] = useState<"info" | "military" | "stats">("info");

  if (collapsed) return null;

  const metadata = selectedFeature?.properties?.metadata;

 const props = selectedFeature?.properties || {};
  const meta = props.metadata || {};

  return (
    <aside className="relative flex h-full flex-col transition-all duration-500 border-r border-white/10 w-[400px] z-20 shadow-2xl"
      style={{ 
        background: isWhatIf ? "linear-gradient(180deg, #1a0a0a 0%, #050505 100%)" : "linear-gradient(180deg, #0a0c14 0%, #020308 100%)", 
        backdropFilter: "blur(30px)" 
      }}>
      
      <div className="px-6 pt-8 pb-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter text-[#C5A059] font-serif">{year} <span className="text-lg font-normal opacity-50">он</span></h1>
            {isWhatIf && (
              <div className="flex items-center gap-2 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded">
                {/* <Activity size={10} className="text-red-500 animate-pulse" /> */}
                <span className="text-[9px] text-red-500 font-bold uppercase tracking-[0.2em]">Цаг хугацааны гажиг</span>
              </div>
            )}
          </div>
          <button onClick={() => setCollapsed(true)} className="p-2 hover:bg-white/5 rounded-full text-white/20 hover:text-white transition-all"><X size={20} /></button>
        </div>

        <button onClick={onStartQuiz} className="group relative w-full overflow-hidden flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-500 hover:to-blue-600 text-white py-3.5 rounded-xl transition-all font-bold text-[11px] uppercase tracking-[0.15em] shadow-lg shadow-indigo-500/20">
           <BrainCircuit size={16} className="group-hover:rotate-12 transition-transform" /> Түүхийн шалгалт
        </button>

        {!selectedFeature && (
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#C5A059] transition-colors" size={15} />
            <input type="text" placeholder="Эзэнт гүрэн, тулаан хайх..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-xs text-white outline-none focus:border-[#C5A059]/40 focus:bg-white/[0.05] transition-all placeholder:text-white/10" />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
        {selectedFeature ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="space-y-4">
              <button onClick={() => setSelectedFeature(null)} className="flex items-center gap-2 text-[10px] text-white/30 hover:text-[#C5A059] uppercase tracking-[0.2em] transition-all">
                <ChevronRight size={14} className="rotate-180" /> Буцах
              </button>
              
              <div className="relative p-6 rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Landmark size={80} />
                </div>
                <h2 className="text-3xl font-bold font-serif leading-tight mb-3" style={{ color: props.color || "#C5A059" }}>{props.name}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[9px] text-white/30 uppercase tracking-tighter">Нийслэл</p>
                    <p className="text-xs font-bold text-white/80">{props.capital || "Нүүдлийн өргөө"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-white/30 uppercase tracking-tighter">Удирдагч</p>
                    <p className="text-xs font-bold text-white/80">{props.leader || "Хаан"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex p-1 bg-white/[0.02] rounded-xl border border-white/5 shadow-inner">
              {[
                { id: "info", icon: <Scroll size={14} />, label: "Түүх" },
                { id: "military", icon: <Sword size={14} />, label: "Цэрэг" },
                { id: "stats", icon: <Coins size={14} />, label: "Соёл" }
              ].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] uppercase font-black tracking-widest transition-all ${activeTab === tab.id ? "bg-[#C5A059] text-black shadow-lg shadow-[#C5A059]/20" : "text-white/40 hover:text-white hover:bg-white/5"}`}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            <div className="space-y-5">
              {activeTab === "info" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="bg-[#C5A059]/5 border-l-2 border-[#C5A059] p-4 rounded-r-xl">
                    <p className="text-[13px] text-white/80 leading-relaxed font-serif italic">
                      {props.description || "Түүхэн тэмдэглэл хараахан бичигдээгүй байна."}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                    <h4 className="text-[10px] text-white/40 uppercase font-bold flex items-center gap-2"><Target size={12}/> Стратегийн зорилт</h4>
                    <p className="text-xs text-white/70 leading-relaxed">{meta.strategic_focus || "Газар нутгаа тэлэх, хилээ хамгаалах"}</p>
                  </div>
                </div>
              )}

              {activeTab === "military" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                   <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                        <p className="text-[9px] text-red-500/50 uppercase font-bold mb-1">Армийн тоо</p>
                        <p className="text-lg font-black text-red-500 font-serif">{meta.military?.total_manpower || "80,000 - 120,000"}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
                        <p className="text-[9px] text-orange-500/50 uppercase font-bold mb-1">Гол нэгж</p>
                        <p className="text-xs font-bold text-orange-500">{meta.military_structure?.elite_guard || "Хүнд морьт цэрэг"}</p>
                      </div>
                   </div>
                   
                   <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                      <div className="flex items-center gap-2 text-[10px] text-[#C5A059] font-bold uppercase tracking-widest">
                        <Zap size={12} /> Байлдааны тактик
                      </div>
                      <p className="text-xs text-white/70 leading-relaxed italic">
                        {meta.military_structure?.tactics || "Уламжлалт бүслэлт болон гэнэтийн довтолгоо."}
                      </p>
                   </div>
                </div>
              )}

              {activeTab === "stats" && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                   {[
                     { label: "Засаглал", value: meta.internal_politics || "Төвлөрсөн засаглал", icon: <Shield size={12}/> },
                     { label: "Эдийн засаг", value: meta.economy || "Арилжаа, худалдаа", icon: <Coins size={12}/> },
                     { label: "Шашин шүтлэг", value: meta.religion || "Тэнгэр шүтлэг", icon: <Compass size={12}/> },
                     { label: "Эмзэг тал", value: meta.vulnerability || "Дотоод хагарал", icon: <Target size={12}/> },
                   ].map((item, idx) => (
                     <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-colors">
                        <div className="flex items-center gap-3 text-white/40">
                          {item.icon}
                          <span className="text-[10px] uppercase font-bold tracking-wider">{item.label}</span>
                        </div>
                        <span className="text-xs font-bold text-white/80">{item.value}</span>
                     </div>
                   ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-[10px] text-white/20 uppercase font-bold tracking-[0.2em] pl-2">Бүс нутгийн эзэнт гүрнүүд</h3>
            {searchResults.length === 0 ? (
              <div className="flex flex-col items-center py-32 text-white/5">
                <Compass size={60} className="mb-4 opacity-10 rotate-12" />
                <p className="text-xs uppercase tracking-[0.3em] font-light">Түүхэн өгөгдөл олдсонгүй</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {searchResults.map((f, i) => (
                  <button key={i} onClick={() => onFlyTo(f)} 
                    className="w-full text-left relative overflow-hidden rounded-2xl p-5 bg-white/[0.02] border border-white/[0.05] hover:border-[#C5A059]/40 hover:bg-white/[0.05] transition-all group active:scale-[0.97]">
                    <div className="absolute left-0 top-0 bottom-0 w-1 transition-all group-hover:w-2" style={{ background: f.properties.color || "#C5A059" }} />
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <h4 className="text-base font-bold text-white/90 font-serif group-hover:text-[#C5A059] transition-colors">{f.properties.name}</h4>
                        <div className="flex items-center gap-3 opacity-40">
                           <span className="text-[10px] flex items-center gap-1 uppercase"><Users size={10}/> {f.properties.leader}</span>
                           <span className="text-[10px] flex items-center gap-1 uppercase"><Landmark size={10}/> {f.properties.capital}</span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-white/10 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="px-6 py-4 bg-black/40 border-t border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          <span className="text-[9px] text-white/30 uppercase font-bold tracking-widest">Систем Онлайн</span>
        </div>
        <span className="text-[9px] text-white/20 font-mono tracking-tighter">DATA_FETCH_OK: 1206_HISTORICAL_CORE</span>
      </div>
    </aside>
  );
};