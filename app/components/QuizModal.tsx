"use client";
import React, { useState, useEffect } from "react";
import { X, CheckCircle2, Loader2, Target, BrainCircuit, ChevronRight } from "lucide-react";

export const QuizModal = ({ isOpen, onClose, year, geoData, onFlyTo }: any) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (isOpen && geoData) fetchQuestions();
  }, [isOpen]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ yearData: geoData }),
      });
      const data = await res.json();
      setQuestions(data);
      setCurrentStep(0);
      setScore(0);
      setIsFinished(false);
    } catch (err) {
      console.error("Quiz API error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (option: string) => {
    const currentQ = questions[currentStep];
    if (currentQ.coords) {
      onFlyTo({
        geometry: { type: "Point", coordinates: currentQ.coords },
        properties: { name: currentQ.question }
      });
    }

    if (option === currentQ.correctAnswer) setScore(s => s + 1);
    
    if (currentStep + 1 < questions.length) {
      setCurrentStep(s => s + 1);
    } else {
      setIsFinished(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-[#0a0c14] border border-white/10 w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(197,160,89,0.1)]">
        
        <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-3 text-[#C5A059]">
            <BrainCircuit size={20} />
            <h3 className="font-serif font-black uppercase tracking-[0.2em] text-xs">AI Түүхийн сорил • {year} он</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/20 hover:text-white transition-all"><X size={20}/></button>
        </div>

        <div className="p-10">
          {loading ? (
            <div className="flex flex-col items-center py-20 gap-6">
              <div className="relative">
                <Loader2 className="animate-spin text-[#C5A059]" size={50} />
                <div className="absolute inset-0 blur-xl bg-[#C5A059]/20 animate-pulse" />
              </div>
              <p className="text-white/40 text-[10px] font-black tracking-[0.3em] uppercase">AI түүхэн өгөгдлийг боловсруулж байна...</p>
            </div>
          ) : isFinished ? (
            <div className="text-center space-y-8 py-4">
              <div className="relative inline-block">
                <CheckCircle2 size={80} className="text-green-500" />
                <div className="absolute inset-0 blur-2xl bg-green-500/20" />
              </div>
              <div className="space-y-2">
                <h2 className="text-4xl font-bold text-white font-serif">Сорил дууслаа</h2>
                <p className="text-white/40 text-sm italic font-serif">Таны түүхийн мэдлэг өндөр түвшинд байна.</p>
              </div>
              <div className="bg-white/[0.03] rounded-3xl p-6 border border-white/5">
                 <p className="text-[10px] text-white/30 uppercase font-bold tracking-[0.2em] mb-1">Нийт оноо</p>
                 <p className="text-5xl font-black text-[#C5A059]">{score} / {questions.length}</p>
              </div>
              <button onClick={onClose} className="w-full bg-[#C5A059] text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-[#d4ae6a] transition-all shadow-xl shadow-[#C5A059]/10">Аялалаа үргэлжлүүлэх</button>
            </div>
          ) : questions.length > 0 ? (
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-black tracking-widest text-white/20 uppercase">
                  <span>Асуулт {currentStep + 1} / {questions.length}</span>
                  <span className="text-[#C5A059]">Оноо: {score}</span>
                </div>
                <h2 className="text-2xl font-bold text-white font-serif leading-snug">
                  {questions[currentStep].question}
                </h2>
              </div>
              <div className="grid gap-4">
                {questions[currentStep].options.map((opt: string, i: number) => (
                  <button key={i} onClick={() => handleAnswer(opt)}
                    className="group w-full py-5 px-8 rounded-2xl bg-white/[0.02] border border-white/5 text-white/70 text-sm font-bold hover:bg-white/[0.06] hover:border-[#C5A059]/40 transition-all text-left flex justify-between items-center active:scale-[0.98]">
                    <span className="flex items-center gap-4">
                      <span className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-[10px] group-hover:bg-[#C5A059] group-hover:text-black transition-colors">{i+1}</span>
                      {opt}
                    </span>
                    <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[#C5A059]" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 opacity-30">Өгөгдөл олдсонгүй...</div>
          )}
        </div>
      </div>
    </div>
  );
};