'use client';

import { Search, Shield } from 'lucide-react';
import { sidebarTheme as T } from './sidebarTheme';

export function SidebarSearch({
  search,
  onSearchChange,
  featureCount,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  featureCount: number;
}) {
  return (
    <>
      <div className="px-4 pt-4 pb-2 shrink-0">
        <label
          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 transition-colors"
          style={{ background: T.bg, border: `1px solid ${T.border}` }}
        >
          <Search
            className="size-3.5 shrink-0"
            style={{ color: T.textMuted }}
          />
          <input
            value={search}
            onChange={(e: any) => onSearchChange(e.target.value)}
            placeholder="Улс, хаан, нийслэл…"
            className="w-full text-xs bg-transparent outline-none placeholder:opacity-40"
            style={{
              background: T.bg,
              border: 'none',
              color: T.text,
              fontFamily: 'var(--font-inter), Arial, sans-serif',
            }}
          />
        </label>
      </div>

      <div className="flex items-center gap-2 px-5 py-1 shrink-0">
        <Shield className="size-3" style={{ color: T.textMuted }} />
        <p
          className="text-[9px] uppercase tracking-[0.35em]"
          style={{ color: T.textMuted }}
        >
          {featureCount} нутаг дэвсгэр
        </p>
      </div>
    </>
  );
}
