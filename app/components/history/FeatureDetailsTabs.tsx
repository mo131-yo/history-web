"use client";

import { FEATURE_TABS } from "./featureDetailsConfig";

export function FeatureDetailsTabs({
  activeTab,
  onChange,
}: {
  activeTab: "info" | "military" | "stats";
  onChange: (tab: "info" | "military" | "stats") => void;
}) {
  return (
    <div className="flex rounded-xl border border-white/5 bg-white/2 p-1 shadow-inner">
      {FEATURE_TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? "bg-[#C5A059] text-black shadow-lg shadow-[#C5A059]/20" : "text-white/40 hover:bg-white/5 hover:text-white"}`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
