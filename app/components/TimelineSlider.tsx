"use client";
import React from 'react';

interface SliderProps {
  currentYear: number;
  onYearChange: (year: number) => void;
}

const TimelineSlider = ({ currentYear, onYearChange }: SliderProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto bg-[#1A1C23]/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl">
      <div className="flex justify-between items-end mb-4">
        <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Timeline</span>
        <span className="text-2xl font-serif font-bold text-[#C5A059]">{currentYear} <span className="text-xs ml-1">AD</span></span>
      </div>
      
      <input
        type="range"
        min="1000" 
        max="2026" 
        value={currentYear}
        onChange={(e) => onYearChange(parseInt(e.target.value))}
        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
        style={{
          background: `linear-gradient(to right, #C5A059 0%, #C5A059 ${(currentYear - 1000) / (2026 - 1000) * 100}%, rgba(255,255,255,0.1) ${(currentYear - 1000) / (2026 - 1000) * 100}%, rgba(255,255,255,0.1) 100%)`
        }}
      />
      
      <div className="flex justify-between mt-2 text-[10px] text-gray-500 font-mono">
        <span>1000</span>
        <span>1206</span>
        <span>1500</span>
        <span>1800</span>
        <span>2026</span>
      </div>
    </div>
  );
};

export default TimelineSlider;