"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import HistoricalMap from "./components/HistoricalMap";
import TimelineSlider from "./components/TimelineSlider";
import { Search, X, ChevronRight, Layers, Globe, Compass } from "lucide-react";

interface Feature {
  type: string;
  properties: {
    name: string;
    color?: string; 
    leader?: string;
    description?: string;
    capital?: string;
    population?: string;
    religion?: string;
  };
  geometry: {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
}

interface GeoData {
  type: string;
  features: Feature[];
}

export default function Home() {
  const [year, setYear] = useState(1206);
  const [geoData, setGeoData] = useState<GeoData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/data/${year}.json`)
      .then((res) => res.json())
      .then((data: GeoData) => {
        setGeoData(data);
        setIsLoading(false);
      })
      .catch(() => {
        setGeoData(null);
        setIsLoading(false);
      });
  }, [year]);

  const searchResults: Feature[] = geoData?.features?.filter((f) => {
    const name = f.properties?.name || "";
    return (
      searchQuery === "" ||
      name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }) ?? [];

const handleFlyTo = useCallback((feature: Feature) => {
  setSelectedFeature(feature);
  let coordinates: [number, number] | undefined;

  if (feature.geometry.type === "Polygon") {
    const coords = feature.geometry.coordinates[0] as unknown as number[][]; 
    const lngAvg = coords.reduce((s, c) => s + c[0], 0) / coords.length;
    const latAvg = coords.reduce((s, c) => s + c[1], 0) / coords.length;
    coordinates = [lngAvg, latAvg];
  } else if (feature.geometry.type === "MultiPolygon") {
    const coords = (feature.geometry.coordinates as unknown as number[][][][])[0][0];
    const lngAvg = coords.reduce((s, c) => s + c[0], 0) / coords.length;
    const latAvg = coords.reduce((s, c) => s + c[1], 0) / coords.length;
    coordinates = [lngAvg, latAvg];
  }

  if (coordinates) {
    mapRef.current?.flyToLocation(coordinates, 4);
    mapRef.current?.highlightFeature(feature.properties.name);
  }
}, []);

const handleMapFeatureClick = useCallback((feature: any) => {
  setSelectedFeature(feature as Feature);
}, []);
  return (
    <main className="relative h-screen w-full overflow-hidden" style={{ background: "#080A12", fontFamily: "'Cinzel', Georgia, serif" }}>
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute"
          style={{
            top: "-20%",
            left: "-10%",
            width: "60%",
            height: "60%",
            background: "radial-gradient(ellipse, rgba(197,160,89,0.06) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: "-10%",
            right: "-10%",
            width: "50%",
            height: "50%",
            background: "radial-gradient(ellipse, rgba(89,130,197,0.05) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: "128px",
          }}
        />
      </div>

      <div className="relative z-10 flex h-full">
        <aside
          className="relative flex h-full flex-col transition-all duration-500 ease-in-out"
          style={{
            width: sidebarCollapsed ? "0px" : "360px",
            overflow: sidebarCollapsed ? "hidden" : "visible",
            borderRight: sidebarCollapsed ? "none" : "1px solid rgba(197,160,89,0.15)",
            background: "linear-gradient(180deg, rgba(12,14,22,0.97) 0%, rgba(10,12,20,0.99) 100%)",
            backdropFilter: "blur(24px)", 
          }}
        >
          {!sidebarCollapsed && (
            <>
              <div className="shrink-0 px-6 pt-7 pb-5" style={{ borderBottom: "1px solid rgba(197,160,89,0.12)" }}>
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Globe size={14} style={{ color: "rgba(197,160,89,0.7)" }} /> 
                    </div>
                    <h1
                      style={{
                        fontSize: "28px",
                        fontWeight: "700",
                        color: "#C5A059",
                        lineHeight: 1.1,
                        fontFamily: "'Cinzel Decorative', 'Cinzel', serif",
                        textShadow: "0 0 40px rgba(197,160,89,0.3)",
                      }}
                    >
                      {year < 0 ? `${Math.abs(year)} МЭӨ` : `${year} он`}
                    </h1>
                  </div>
                  <button
                    onClick={() => setSidebarCollapsed(true)}
                    className="mt-1 rounded-lg p-1.5 transition-colors"
                    style={{ color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <X size={13} />
                  </button>
                </div>

                {isLoading && (
                  <div className="mt-3 flex items-center gap-2">
                    <div
                      className="h-1 flex-1 overflow-hidden rounded-full"
                      style={{ background: "rgba(255,255,255,0.07)" }}
                    >
                      <div
                        className="h-full rounded-full animate-pulse"
                        style={{
                          width: "60%",
                          background: "linear-gradient(90deg, #C5A059, #E8C97A)",
                        }}
                      />
                    </div>
                    <span style={{ fontSize: "10px", color: "rgba(197,160,89,0.5)" }}>Loading...</span>
                  </div>
                )}
              </div>

              <div className="shrink-0 px-5 py-4">
                <div
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <Search size={13} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
                  <input
                    type="text"
                    placeholder="Улс, эзэнт гүрэн хайх..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      background: "none",
                      border: "none",
                      outline: "none",
                      color: "rgba(255,255,255,0.85)",
                      fontSize: "13px",
                      width: "100%",
                      fontFamily: "inherit",
                    }}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")}>
                      <X size={12} style={{ color: "rgba(255,255,255,0.3)" }} />
                    </button>
                  )}
                </div>
              </div>

              <div
                className="shrink-0 mx-5 mb-4 rounded-xl px-4 py-3 flex items-center justify-between"
                style={{ background: "rgba(197,160,89,0.06)", border: "1px solid rgba(197,160,89,0.12)" }}
              >
                <div className="text-center">
                  <div style={{ fontSize: "18px", fontWeight: "700", color: "#C5A059", lineHeight: 1 }}>
                    {searchResults.length}
                  </div>
                  <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", marginTop: "2px" }}>УЛСУУД</div>
                </div>
                <div style={{ width: "1px", height: "28px", background: "rgba(197,160,89,0.2)" }} />
                <div className="text-center">
                  <div style={{ fontSize: "18px", fontWeight: "700", color: "#9BB5D4", lineHeight: 1 }}>
                    {year}
                  </div>
                  <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", marginTop: "2px" }}>ОН</div>
                </div>
                <div style={{ width: "1px", height: "28px", background: "rgba(197,160,89,0.2)" }} />
                <div className="text-center">
                  <Layers size={16} style={{ color: "rgba(197,160,89,0.6)", margin: "0 auto" }} />
                  <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", marginTop: "2px" }}>LAYER</div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-2" style={{ scrollbarWidth: "none" }}>
                {searchResults.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Compass size={28} style={{ color: "rgba(197,160,89,0.2)", marginBottom: "12px" }} />
                    <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "13px", textAlign: "center" }}>
                      {searchQuery ? "Тохирох улс олдсонгүй" : "Энэ онд өгөгдөл байхгүй байна"}
                    </p>
                  </div>
                )}

                {searchResults.map((f, i) => {
                  const isSelected = selectedFeature?.properties.name === f.properties?.name;
                  return (
                    <div
                      key={i}
                      onClick={() => handleFlyTo(f)}
                      className="relative cursor-pointer rounded-2xl p-4 transition-all duration-200 group"
                      style={{
                        background: isSelected
                          ? `linear-gradient(135deg, ${f.properties.color || "#C5A059"}18, ${f.properties.color || "#C5A059"}08)`
                          : "rgba(255,255,255,0.025)",
                        border: isSelected
                          ? `1px solid ${f.properties.color || "#C5A059"}55`
                          : "1px solid rgba(255,255,255,0.06)",
                        transform: isSelected ? "translateX(3px)" : "translateX(0)",
                      }}
                    >
                      <div
                        className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full"
                        style={{
                          background: f.properties.color || "#C5A059",
                          opacity: isSelected ? 1 : 0.4,
                        }}
                      />

                      <div className="pl-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4
                            style={{
                              fontSize: "13px",
                              fontWeight: "600",
                              color: isSelected ? (f.properties.color || "#C5A059") : "rgba(255,255,255,0.85)",
                              lineHeight: 1.3,
                              fontFamily: "'Cinzel', serif",
                              transition: "color 0.2s",
                            }}
                          >
                            {f.properties.name}
                          </h4>
                          <ChevronRight
                            size={13}
                            className="shrink-0 mt-0.5 transition-all duration-200 group-hover:translate-x-1"
                            style={{ color: f.properties.color || "#C5A059", opacity: isSelected ? 1 : 0.4 }}
                          />
                        </div>

                        {f.properties.leader && (
                          <div className="flex items-center gap-1.5 mb-2">
                            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>Удирдагч:</span>
                            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.65)", fontWeight: "500" }}>
                              {f.properties.leader}
                            </span>
                          </div>
                        )}

                        {f.properties.description && (
                          <p
                            style={{
                              fontSize: "11px",
                              color: "rgba(255,255,255,0.38)",
                              lineHeight: 1.6,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              fontFamily: "Georgia, serif",
                            }}
                          >
                            {f.properties.description}
                          </p>
                        )}

                        {isSelected && (f.properties.capital || f.properties.religion) && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {f.properties.capital && (
                              <span
                                className="px-2.5 py-1 rounded-full"
                                style={{
                                  fontSize: "10px",
                                  background: "rgba(197,160,89,0.1)",
                                  color: "rgba(197,160,89,0.8)",
                                  border: "1px solid rgba(197,160,89,0.2)",
                                }}
                              >
                                🏛 {f.properties.capital}
                              </span>
                            )}
                            {f.properties.religion && (
                              <span
                                className="px-2.5 py-1 rounded-full"
                                style={{
                                  fontSize: "10px",
                                  background: "rgba(100,150,220,0.1)",
                                  color: "rgba(150,185,230,0.8)",
                                  border: "1px solid rgba(100,150,220,0.2)",
                                }}
                              >
                                ✦ {f.properties.religion}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </aside>

        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="absolute left-4 top-1/2 z-30 -translate-y-1/2 flex flex-col items-center gap-1 rounded-xl px-2 py-4 transition-all"
            style={{
              background: "rgba(12,14,22,0.9)",
              border: "1px solid rgba(197,160,89,0.25)",
              backdropFilter: "blur(12px)",
              color: "rgba(197,160,89,0.7)",
            }}
          >
            <Globe size={14} />
            <span style={{ fontSize: "8px", letterSpacing: "0.15em", writingMode: "vertical-rl", marginTop: "4px" }}>ATLAS</span>
          </button>
        )}

        <div className="relative flex-1 h-full">
          <HistoricalMap ref={mapRef} year={year} />

          <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none px-8 pb-8">
            <div className="pointer-events-auto">
              <TimelineSlider currentYear={year} onYearChange={setYear} />
            </div>
          </div>

          <div
            className="absolute top-6 right-6 z-10 pointer-events-none"
            style={{ opacity: 0.12 }}
          >
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <circle cx="28" cy="28" r="26" stroke="#C5A059" strokeWidth="0.5" />
              <circle cx="28" cy="28" r="20" stroke="#C5A059" strokeWidth="0.5" />
              <path d="M28 4 L30 26 L28 24 L26 26 Z" fill="#C5A059" />
              <path d="M28 52 L30 30 L28 32 L26 30 Z" fill="rgba(197,160,89,0.4)" />
              <path d="M4 28 L26 30 L24 28 L26 26 Z" fill="rgba(197,160,89,0.4)" />
              <path d="M52 28 L30 30 L32 28 L30 26 Z" fill="rgba(197,160,89,0.4)" />
              <circle cx="28" cy="28" r="2" fill="#C5A059" />
              {["N","E","S","W"].map((d,i) => (
                <text key={d} x={[28,44,28,12][i]} y={[11,32,49,32][i]}
                  textAnchor="middle" dominantBaseline="middle"
                  fill="#C5A059" fontSize="6" fontFamily="serif">{d}</text>
              ))}
            </svg>
          </div>
        </div>
      </div>
    </main>
  );
}