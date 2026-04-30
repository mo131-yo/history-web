"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Menu } from "lucide-react";
import { sidebarTheme as T } from "./sidebarTheme";


function AnimatedYear({ year }: { year: number }) {
  const [displayYear, setDisplayYear] = useState(year);

  useEffect(() => {
    let start = displayYear;
    const end = year;

    if (start === end) return;

    const step = start < end ? 1 : -1;
    const speed = Math.abs(end - start) > 50 ? 5 : 20;

    const interval = setInterval(() => {
      start += step;
      setDisplayYear(start);

      if (start === end) {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [year]);

  return <>{displayYear}</>;
}

export function SidebarHeader({
  year,
  collapsed,
  onToggleCollapsed,
  onOpenMap,
}: {
  year: number;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onOpenMap: () => void;
}) {
  return (
    <div
      className="px-4 py-4 shrink-0 sm:px-5 sm:py-5"
      style={{
        background: T.bg,
        borderBottom: `1px solid ${T.border}`,
      }}
    >
     
      <div className="flex items-center gap-3 mb-4 sm:mb-5">
        <div
          className="flex-1 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${T.amber}66)`,
          }}
        />
        <svg width="16" height="16" viewBox="0 0 16 16">
          <polygon
            points="8,1 9.5,5.5 14.5,5.5 10.3,8.8 11.8,13.5 8,10.8 4.2,13.5 5.7,8.8 1.5,5.5 6.5,5.5"
            fill={T.amber}
            opacity="0.8"
          />
        </svg>
        <div
          className="flex-1 h-px"
          style={{
            background: `linear-gradient(90deg, ${T.amber}66, transparent)`,
          }}
        />
      </div>

    
      <div
        className={`flex gap-3 ${
          collapsed
            ? "items-center justify-center lg:flex-col"
            : "items-start justify-between"
        }`}
      >
      
        {!collapsed && (
          <button
            type="button"
            onClick={onOpenMap}
            className="min-w-0 text-left rounded-xl transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
            title="Map руу буцах"
          >
            <p
              className="mb-1 text-[7px] uppercase tracking-[0.45em] sm:text-[8px] sm:tracking-[0.6em]"
              style={{ color: T.text }}
            >
              Монгол Атлас
            </p>

            <h2
              className="text-4xl font-bold leading-none tracking-tight sm:text-5xl"
              style={{
                background: "linear-gradient(135deg, #2563eb, #60a5fa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              <AnimatedYear year={year} />
            </h2>

            <p
              className="mt-2 text-[9px] uppercase tracking-[0.3em] sm:text-[10px] sm:tracking-[0.4em]"
              style={{ color: T.text }}
            >
              он · Дундад Зуун
            </p>
          </button>
        )}

        
        {collapsed && (
          <button
            type="button"
            onClick={onOpenMap}
            className="text-center rounded-xl transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-400/40 lg:block"
            title="Map руу буцах"
          >
            <p
              className="text-[7px] uppercase tracking-[0.35em]"
              style={{ color: T.textMuted }}
            >
              Атлас
            </p>

            <h2
              className="mt-2 text-2xl font-bold leading-none"
              style={{
                color: T.amber,
                textShadow: `0 0 20px ${T.amberGlow}`,
              }}
            >
              <AnimatedYear year={year} />
            </h2>
          </button>
        )}

   
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="flex items-center justify-center w-10 h-10 mt-1 transition-all duration-300 group shrink-0 rounded-xl hover:scale-105"
          style={{
            background: "rgba(255,255,255,0.7)",
            border: "1px solid #e5e7eb",
            backdropFilter: "blur(10px)",
          }}
          title={collapsed ? "Sidebar нээх" : "Sidebar хаах"}
        >
          {collapsed ? (
            <Menu
              className="transition-transform duration-300 size-5 group-hover:rotate-12"
              style={{ color: "#2563eb" }}
            />
          ) : (
            <ChevronLeft
              className="transition-transform duration-300 size-5 group-hover:-translate-x-1"
              style={{ color: "#2563eb" }}
            />
          )}
        </button>
      </div>

     
      <div className="flex items-center gap-2 mt-4">
        <div className="flex-1 h-px" style={{ background: T.border }} />
        <div
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: T.amber, opacity: 0.5 }}
        />
        <div className="flex-1 h-px" style={{ background: T.border }} />
      </div>
    </div>
  );
}
