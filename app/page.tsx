"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import HistoricalMap, { MapHandle } from "./components/HistoricalMap";
import TimelineSlider from "./components/TimelineSlider";
import HistoryChat from "./components/HistoryChat";
import { Sidebar } from "./components/Sidebar";
import { QuizModal } from "./components/QuizModal";
import { Globe, Flame } from "lucide-react";

export default function Home() {
  const [year, setYear] = useState(1206);
  const [isWhatIf, setIsWhatIf] = useState(false);
  const [geoData, setGeoData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const mapRef = useRef<MapHandle>(null);

  useEffect(() => {
    const dataPath = isWhatIf && year === 1206 ? `/data/${year}_alternate.json` : `/data/${year}.json`;
    fetch(dataPath)
      .then(res => res.json())
      .then(setGeoData)
      .catch(() => setGeoData(null));
  }, [year, isWhatIf]);

  const searchResults = geoData?.features?.filter((f: any) => {
    if (f.properties.type === "battle-line") return false;
    return searchQuery === "" || f.properties.name.toLowerCase().includes(searchQuery.toLowerCase());
  }) ?? [];

  const handleFlyTo = useCallback((feature: any) => {
    setSelectedFeature(feature);
    let coords;
    if (feature.geometry.type === "Polygon") {
      coords = feature.geometry.coordinates[0][0];
    } else if (feature.geometry.type === "Point" || feature.geometry.type === "LineString") {
      coords = feature.geometry.coordinates;
    }

    if (coords && mapRef.current) {
      mapRef.current.flyToLocation(coords, 4);
    }
  }, []);

  return (
    <main className="relative h-screen w-full overflow-hidden bg-[#080A12] text-slate-200 font-sans">
      {year === 1206 && (
        <div className="absolute top-6 right-6 z-50">
          <button 
            onClick={() => setIsWhatIf(!isWhatIf)} 
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl border transition-all duration-500 backdrop-blur-xl shadow-2xl ${
              isWhatIf ? 'bg-red-600/20 border-red-500/50 text-red-100' : 'bg-white/5 border-white/10 text-white/70'
            }`}
          >
            <Flame size={16} className={isWhatIf ? "animate-pulse" : ""} />
            <span className="text-xs font-black tracking-widest">{isWhatIf ? "БОДИТ ТҮҮХ" : "WHAT-IF ХАРАХ"}</span>
          </button>
        </div>
      )}

      <QuizModal 
        isOpen={isQuizOpen} 
        onClose={() => setIsQuizOpen(false)} 
        year={year}
        geoData={geoData}
        onFlyTo={handleFlyTo}
      />

      <div className="relative z-10 flex h-full">
        <Sidebar 
          year={year} 
          isWhatIf={isWhatIf} 
          collapsed={sidebarCollapsed} 
          setCollapsed={setSidebarCollapsed}
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          selectedFeature={selectedFeature}
          setSelectedFeature={setSelectedFeature} 
          searchResults={searchResults} 
          onFlyTo={handleFlyTo}
          onStartQuiz={() => setIsQuizOpen(true)}
        />

        <div className="relative flex-1 h-full">
          {sidebarCollapsed && (
            <button 
              onClick={() => setSidebarCollapsed(false)} 
              className="absolute left-6 top-6 z-50 p-4 bg-[#080A12]/80 border border-white/10 rounded-full text-[#C5A059] shadow-2xl backdrop-blur-xl hover:scale-110 transition-transform"
            >
              <Globe size={24} />
            </button>
          )}
          
          <HistoricalMap ref={mapRef} year={year} isWhatIf={isWhatIf} onSelectFeature={(feature) => setSelectedFeature(feature)} />
          
          <HistoryChat currentContext={selectedFeature?.properties || geoData?.features?.[0]?.properties} />
          
          <div className="absolute bottom-10 left-0 right-0 z-20 px-8 pointer-events-none">
            <div className="max-w-4xl mx-auto pointer-events-auto bg-[#0a0c14]/40 backdrop-blur-md p-6 rounded-3xl border border-white/5">
              <TimelineSlider 
                currentYear={year} 
                onYearChange={(y) => { 
                  setYear(y); 
                  setSelectedFeature(null); 
                  if (y !== 1206) setIsWhatIf(false); 
                }} 
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}