"use client";
import React, { useState, useEffect, useRef } from "react";
import HistoricalMap from "./components/HistoricalMap";
import TimelineSlider from "./components/TimelineSlider";

export default function Home() {
  const [year, setYear] = useState(1206);
  const [wikiData, setWikiData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const mapRef = useRef<any>(null);

  useEffect(() => {
    fetch(`/data/${year}.json`)
      .then(res => res.json())
      .then(data => setWikiData(data))
      .catch(() => setWikiData(null));
  }, [year]);

const searchResults = wikiData?.features?.filter((f: any) => {
  const name = f.properties?.name || ""; 
  return name.toLowerCase().includes(searchQuery.toLowerCase());
}) || [];

  const handleFlyTo = (feature: any) => {
  const coordinates = feature.geometry.coordinates[0][0];
  
  if (coordinates && mapRef.current) {
    mapRef.current.flyToLocation(coordinates as [number, number], 4);
  }
};

  return (
    <main className="relative h-screen w-full bg-[#0B0D17] text-white flex overflow-hidden font-sans">

      <aside className="relative z-20 w-87.5 h-full bg-[#1A1C23]/95 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col gap-6 shadow-2xl">
        <div className="space-y-4">
          <h2 className="text-3xl font-serif font-bold text-[#C5A059]">{year} он</h2>
          
          <div className="relative">
            <input 
              type="text" 
              placeholder="Улс хайх..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-[#C5A059] transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {searchResults.map((f: any, i: number) => (
        <div 
          key={i}
          onClick={() => handleFlyTo(f)}
          className="relative overflow-hidden p-4 bg-linear-to-br from-white/5 to-transparent rounded-2xl border border-white/10 hover:border-[#C5A059]/40 hover:from-[#C5A059]/5 transition-all cursor-pointer group mb-3"
        >
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#C5A059]/10 rounded-full blur-2xl group-hover:bg-[#C5A059]/20 transition-all" />

          <div className="relative z-10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-mono text-[#C5A059]/80 uppercase tracking-widest">Empire Data</span>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: f.properties.color }} />
            </div>

            <h4 className="font-serif text-lg font-bold text-gray-100 group-hover:text-[#C5A059] transition-colors">
              {f.properties.name}
            </h4>

            {f.properties.leader && (
              <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400">
                <span className="opacity-50 italic">Удирдагч:</span>
                <span className="text-gray-200 font-medium">{f.properties.leader}</span>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-3 leading-relaxed line-clamp-3 group-hover:text-gray-400 transition-colors">
              {f.properties.description}
            </p>

            <div className="mt-4 flex items-center justify-between">
              <button className="text-[10px] text-[#C5A059] font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                Дэлгэрэнгүй харах →
              </button>
            </div>
          </div>
        </div>
      ))}
        </div>
      </aside>

      <div className="relative flex-1 h-full">
        <HistoricalMap ref={mapRef} year={year} />
        
        <div className="absolute bottom-10 left-10 right-10 z-20">
          <TimelineSlider currentYear={year} onYearChange={setYear} />
        </div>
  
      </div>
    </main>
  );
}
