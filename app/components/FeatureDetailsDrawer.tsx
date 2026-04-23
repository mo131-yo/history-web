'use client';

import React, { useState } from 'react';
import {
  ChevronRight,
  Coins,
  Compass,
  Landmark,
  Scroll,
  Shield,
  Sword,
  Target,
  X,
  Zap,
} from 'lucide-react';
import { HistoricalFeature } from '../types/history';

interface Props {
  feature: HistoricalFeature | null;
  onClose: () => void;
}

export default function FeatureDetailsDrawer({ feature, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'info' | 'military' | 'stats'>(
    'info',
  );

  if (!feature) return null;

  const props = feature.properties || {};
  const meta = props.metadata || {};

  return (
    <div className="pointer-events-none absolute inset-y-0 right-0 z-40 flex items-start justify-end p-4 md:p-6">
      <div className="pointer-events-auto mt-20 flex h-[calc(100vh-9rem)] w-full max-w-105 flex-col overflow-hidden rounded-4xl border border-white/10 bg-[#05070d]/92 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl animate-in slide-in-from-right-12 duration-300">
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/40 transition-colors hover:text-[#C5A059]"
          >
            <ChevronRight size={14} className="rotate-180" />
            Буцах
          </button>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-white/30 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Close details"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/3 p-6">
              <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-br from-[#C5A059]/20 via-transparent to-transparent" />
              <div className="absolute -right-4 -top-4 opacity-5">
                <Landmark size={96} />
              </div>
              <div className="relative space-y-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">
                    Сонгосон улс
                  </p>
                  <h2
                    className="mt-2 font-serif text-3xl font-bold leading-tight"
                    style={{ color: props.color || '#C5A059' }}
                  >
                    {props.name}
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[9px] uppercase tracking-tighter text-white/30">
                      Нийслэл
                    </p>
                    <p className="text-xs font-bold text-white/80">
                      {props.capital || 'Нүүдлийн өргөө'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] uppercase tracking-tighter text-white/30">
                      Удирдагч
                    </p>
                    <p className="text-xs font-bold text-white/80">
                      {props.leader || 'Хаан'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex rounded-xl border border-white/5 bg-white/2 p-1 shadow-inner">
              {[
                { id: 'info', icon: <Scroll size={14} />, label: 'Түүх' },
                { id: 'military', icon: <Sword size={14} />, label: 'Цэрэг' },
                { id: 'stats', icon: <Coins size={14} />, label: 'Соёл' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'info' | 'military' | 'stats')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-[#C5A059] text-black shadow-lg shadow-[#C5A059]/20' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="space-y-5">
              {activeTab === 'info' && (
                <div className="animate-in slide-in-from-bottom-2 fade-in space-y-4">
                  <div className="rounded-r-xl border-l-2 border-[#C5A059] bg-[#C5A059]/5 p-4">
                    <p className="font-serif text-[13px] italic leading-relaxed text-white/80">
                      {props.description ||
                        'Түүхэн тэмдэглэл хараахан бичигдээгүй байна.'}
                    </p>
                  </div>
                  <div className="space-y-3 rounded-xl border border-white/5 bg-white/2 p-4">
                    <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase text-white/40">
                      <Target size={12} /> Стратегийн зорилт
                    </h4>
                    <p className="text-xs leading-relaxed text-white/70">
                      {meta.strategic_focus ||
                        'Газар нутгаа тэлэх, хилээ хамгаалах'}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'military' && (
                <div className="animate-in slide-in-from-bottom-2 fade-in space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-red-500/10 bg-red-500/5 p-4">
                      <p className="mb-1 text-[9px] font-bold uppercase text-red-500/50">
                        Армийн тоо
                      </p>
                      <p className="font-serif text-lg font-black text-red-500">
                        {meta.military?.total_manpower || '80,000 - 120,000'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-orange-500/10 bg-orange-500/5 p-4">
                      <p className="mb-1 text-[9px] font-bold uppercase text-orange-500/50">
                        Гол нэгж
                      </p>
                      <p className="text-xs font-bold text-orange-500">
                        {meta.military_structure?.elite_guard ||
                          'Хүнд морьт цэрэг'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-xl border border-white/5 bg-white/2 p-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#C5A059]">
                      <Zap size={12} /> Байлдааны тактик
                    </div>
                    <p className="text-xs italic leading-relaxed text-white/70">
                      {meta.military_structure?.tactics ||
                        'Уламжлалт бүслэлт болон гэнэтийн довтолгоо.'}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'stats' && (
                <div className="animate-in slide-in-from-bottom-2 fade-in space-y-3">
                  {[
                    {
                      label: 'Засаглал',
                      value: meta.internal_politics || 'Төвлөрсөн засаглал',
                      icon: <Shield size={12} />,
                    },
                    {
                      label: 'Эдийн засаг',
                      value: meta.economy || 'Арилжаа, худалдаа',
                      icon: <Coins size={12} />,
                    },
                    {
                      label: 'Шашин шүтлэг',
                      value: meta.religion || 'Тэнгэр шүтлэг',
                      icon: <Compass size={12} />,
                    },
                    {
                      label: 'Эмзэг тал',
                      value: meta.vulnerability || 'Дотоод хагарал',
                      icon: <Target size={12} />,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-xl border border-white/5 bg-white/1 p-3.5 transition-colors hover:bg-white/3"
                    >
                      <div className="flex items-center gap-3 text-white/40">
                        {item.icon}
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          {item.label}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-white/80">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
