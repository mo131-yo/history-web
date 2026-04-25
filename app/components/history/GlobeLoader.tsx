"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

export const Globe = dynamic(() => import("react-globe.gl").then((mod) => mod.default), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center" style={{ background: "#0c0a06" }}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full" style={{ border: "1.5px solid rgba(201,164,93,0.15)", animation: "spin 3s linear infinite" }} />
          <div className="absolute inset-0 rounded-full" style={{ border: "1.5px solid transparent", borderTopColor: "#c9a45d", animation: "spin 1.8s linear infinite" }} />
        </div>
        <p style={{ color: "#5c3d1a", fontSize: 10, letterSpacing: "0.35em", textTransform: "uppercase", fontFamily: "Georgia, serif" }}>
          Дэлхийн зураг ачаалж байна
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  ),
}) as ComponentType<Record<string, unknown>>;
