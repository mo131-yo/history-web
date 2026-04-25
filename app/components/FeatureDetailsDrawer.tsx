"use client";

import React, { useState } from "react";
import { HistoricalFeature } from "../types/history";
import { FeatureDetailsHeader } from "./history/FeatureDetailsHeader";
import { FeatureDetailsTabs } from "./history/FeatureDetailsTabs";
import { FEATURE_ICONS, FEATURE_STATS } from "./history/featureDetailsConfig";

export default function FeatureDetailsDrawer({
  feature,
  onClose,
}: {
  feature: HistoricalFeature | null;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"info" | "military" | "stats">("info");
  if (!feature) return null;

  const props = feature.properties || {};
  const meta = props.metadata || {};
  const color = props.color || "#C5A059";
  const getMetaValue = (key: string, fallback: string) => {
    const value = meta[key as keyof typeof meta];
    return typeof value === "string" ? value : fallback;
  };

  return (
    <div className="pointer-events-none absolute inset-y-0 right-0 z-40 flex items-start justify-end p-4 md:p-6">
      <div className="pointer-events-auto mt-20 flex h-[calc(100vh-9rem)] w-full max-w-105 flex-col overflow-hidden rounded-4xl border border-white/10 bg-[#05070d]/92 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl animate-in slide-in-from-right-12 duration-300">
        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
          <div className="space-y-6">
            <FeatureDetailsHeader color={color} name={props.name} capital={props.capital} leader={props.leader} onClose={onClose} />
            <FeatureDetailsTabs activeTab={activeTab} onChange={setActiveTab} />

            {activeTab === "info" && (
              <div className="animate-in slide-in-from-bottom-2 fade-in space-y-4">
                <div className="rounded-r-xl border-l-2 border-[#C5A059] bg-[#C5A059]/5 p-4">
                  <p className="font-serif text-[13px] italic leading-relaxed text-white/80">
                    {props.description || "Түүхэн тэмдэглэл хараахан бичигдээгүй байна."}
                  </p>
                </div>
                <div className="space-y-3 rounded-xl border border-white/5 bg-white/2 p-4">
                  <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase text-white/40">
                    <FEATURE_ICONS.Target size={12} /> Стратегийн зорилт
                  </h4>
                  <p className="text-xs leading-relaxed text-white/70">
                    {meta.strategic_focus || "Газар нутгаа тэлэх, хилээ хамгаалах"}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "military" && (
              <div className="animate-in slide-in-from-bottom-2 fade-in space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-red-500/10 bg-red-500/5 p-4">
                    <p className="mb-1 text-[9px] font-bold uppercase text-red-500/50">Армийн тоо</p>
                    <p className="font-serif text-lg font-black text-red-500">{meta.military?.total_manpower || "80,000 - 120,000"}</p>
                  </div>
                  <div className="rounded-xl border border-orange-500/10 bg-orange-500/5 p-4">
                    <p className="mb-1 text-[9px] font-bold uppercase text-orange-500/50">Гол нэгж</p>
                    <p className="text-xs font-bold text-orange-500">{meta.military_structure?.elite_guard || "Хүнд морьт цэрэг"}</p>
                  </div>
                </div>
                <div className="space-y-3 rounded-xl border border-white/5 bg-white/2 p-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#C5A059]">
                    <FEATURE_ICONS.Zap size={12} /> Байлдааны тактик
                  </div>
                  <p className="text-xs italic leading-relaxed text-white/70">
                    {meta.military_structure?.tactics || "Уламжлалт бүслэлт болон гэнэтийн довтолгоо."}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "stats" && (
              <div className="animate-in slide-in-from-bottom-2 fade-in space-y-3">
                {FEATURE_STATS.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/1 p-3.5 transition-colors hover:bg-white/3">
                    <div className="flex items-center gap-3 text-white/40">
                      {item.icon}
                      <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                    </div>
                    <span className="text-xs font-bold text-white/80">{getMetaValue(item.key, item.fallback)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
