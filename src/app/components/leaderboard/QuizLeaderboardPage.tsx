"use client";

import { useEffect, useMemo, useState } from "react";
import { 
  Loader2, Trophy, TrendingUp, Flame, Info,
  Medal,
  Crown
} from "lucide-react";
import { useUser } from "@clerk/nextjs"; 
import { OlympicPodium } from "./Olympicpodium";

export type LeaderboardCategory = "grade" | "knowledge" | "all";
export type LeaderboardScore = {
  userId: string;         
  userName: string;
  score: number;
  total?: number;         
  attemptsCount?: number; 
  selectedLevel?: number;
};

export function QuizLeaderboardPage({
  version,
  onStartQuiz,
}: {
  version: number;
  onStartQuiz: () => void;
}) {
  const { user } = useUser(); 
  const [scores, setScores] = useState<LeaderboardScore[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [status, setStatus] = useState<"loading" | "idle" | "error">("loading");
  const [category, setCategory] = useState<LeaderboardCategory>("all");

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    
    Promise.all([
      fetch(`/api/quiz/leaderboard?category=${category}`, { signal: controller.signal }).then(res => res.json()),
      fetch("/api/attempts", { signal: controller.signal }).then(res => res.json())
    ])
    .then(([leaderboardData, historyData]) => {
      setScores(leaderboardData.scores ?? []);
      setAttempts(historyData.attempts ?? []);
      setStatus("idle");
    })
    .catch(() => setStatus("error"));

    return () => controller.abort();
  }, [category, version]);

  const topThree = useMemo(() => scores.slice(0, 3), [scores]);

  const daysSinceJoined = useMemo(() => {
    if (!user?.createdAt) return 1;
    const joinedDate = new Date(user.createdAt);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - joinedDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [user]);

  const progressStats = useMemo(() => {
    if (attempts.length < 2) return { diff: 0, trend: "neutral" };
    const latest = (attempts[0].score / (attempts[0].total || 1)) * 100;
    const previous = (attempts[1].score / (attempts[1].total || 1)) * 100;
    const diff = Math.round(latest - previous);
    return { diff, trend: diff > 0 ? "up" : diff < 0 ? "down" : "neutral" };
  }, [attempts]);

  return (
    
    <div className="h-screen bg-[#f8faff] p-4 md:p-6 lg:p-8 font-sans overflow-hidden flex flex-col">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 w-full flex-1 min-h-0">
        
        {/* LEFT COLUMN */}
        <div className="flex flex-col min-h-0 space-y-6 lg:col-span-8">
         
          <div className="flex flex-col justify-between gap-4 shrink-0 md:flex-row md:items-center">
            <h1 className="text-2xl font-extrabold text-[#1e293b]">Онооны жагсаалт</h1>
            <div className="flex bg-[#e2e8f0]/60 p-1 rounded-full w-fit">
              {[
                { id: "grade", label: "Түвшин тогтоох" },
                { id: "knowledge", label: "Танин мэдэхүй" },
                { id: "all", label: "Нийт" }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCategory(item.id as LeaderboardCategory)}
                  className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                    category === item.id 
                    ? "bg-[#0047cc] text-white shadow-md" 
                    : "text-[#64748b] hover:text-[#1e293b]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

         
          <div className="relative shrink-0">
            <div className="absolute z-10 flex items-center justify-between pointer-events-none top-6 left-8 right-8">
                <div className="flex items-center gap-2 px-4 py-2 border shadow-sm bg-white/60 backdrop-blur-sm rounded-2xl border-white/40">
                  <Medal size={16} className="text-amber-500" />
                  <span className="text-xs font-black tracking-wider uppercase text-slate-700">Шилдэг 3</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 border shadow-sm bg-white/60 backdrop-blur-sm rounded-2xl border-white/40">
                  <Crown size={16} className="text-yellow-500" />
                  <span className="text-xs font-black tracking-wider uppercase text-slate-700">Тэргүүлэгчид</span>
                </div>
             </div>
             {status === "loading" ? (
               <div className="h-[280px] flex items-center justify-center bg-white/50 rounded-[32px] border border-dashed border-[#e2e8f0]">
                 <Loader2 className="animate-spin text-[#0047cc]" />
               </div>
             ) : (
               <div className="bg-white/40 backdrop-blur-md rounded-[32px] border border-white/20 shadow-sm overflow-hidden">
                 <OlympicPodium scores={topThree} category={category} />
               </div>
             )}
          </div>

          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex flex-col flex-1 min-h-0 mb-4 overflow-hidden">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Хэрэглэгчдийн эрэмбэлэлт</h3>
                <p className="text-xs text-slate-500">
Нийт хэрэглэгч • <span className="font-bold text-slate-800">{scores.length}</span>
</p>
              </div>
              <div className="p-2 rounded-full bg-slate-50">
                <Info size={18} className="text-slate-300" />
              </div>
            </div>

           
            <div className="flex-1 min-h-0 pr-2 overflow-x-hidden overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead className="sticky top-0 z-20 bg-white">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-4 py-2">Байр</th>
                    <th className="px-4 py-2">Хэрэглэгч</th>
                    <th className="px-4 py-2 text-center">Түвшин</th>
                    <th className="px-4 py-2 text-right">оноо</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.slice(3).map((score, index) => (
                    <tr 
                      key={score.userId || index} 
                      className="transition-colors group hover:bg-blue-50/50"
                    >
                      <td className="px-4 py-3 bg-slate-50/50 rounded-l-2xl group-hover:bg-transparent">
                        <span className="text-xs font-bold text-slate-400">#{index + 4}</span>
                      </td>
                      <td className="px-4 py-3 bg-slate-50/50 group-hover:bg-transparent">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-slate-400 text-[10px] shadow-sm border border-slate-100">
                            {score.userName.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-700 text-xs truncate max-w-[120px]">
                            {score.userName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center bg-slate-50/50 group-hover:bg-transparent">
                        <span className="text-[10px] px-2 py-1 bg-white rounded-md border border-slate-100 font-bold text-slate-500 italic">Lvl {score.selectedLevel || 1}</span>
                      </td>
                      <td className="px-4 py-3 text-sm font-black text-right bg-slate-50/50 rounded-r-2xl group-hover:bg-transparent text-slate-800">
                        {score.score.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 shrink-0">
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-[#e2e8f0] sticky top-0">
            <h3 className="text-xl font-bold text-[#1e293b] mb-6">Таны ахиц</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#f8faff] rounded-2xl border border-[#edf2f7]">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${progressStats.trend === "up" ? "bg-green-100 text-green-600" : progressStats.trend === "down" ? "bg-red-100 text-red-600" : "bg-blue-100/50 text-blue-600"}`}>
                    <TrendingUp size={20} className={progressStats.trend === "down" ? "rotate-180" : ""} />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#94a3b8] font-black uppercase tracking-wider">Мэдлэгийн өөрчлөлт</p>
                    <p className={`text-lg font-black ${progressStats.trend === "up" ? "text-green-600" : progressStats.trend === "down" ? "text-red-600" : "text-[#1e293b]"}`}>
                      {progressStats.diff > 0 ? `+${progressStats.diff}` : progressStats.diff}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#f8faff] rounded-2xl border border-[#edf2f7]">
                <div className="flex items-center gap-3">
                  <div className="p-2 text-orange-600 bg-orange-100/50 rounded-xl">
                    <Flame size={20}/>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#94a3b8] font-black uppercase tracking-wider">Тууштай судлаач</p>
                    <p className="text-lg font-black text-[#1e293b]">{daysSinceJoined} Хоног</p>
                  </div>
                </div>
                
              </div>
            </div>

            <button 
              onClick={onStartQuiz} 
              className="w-full mt-8 bg-[#0038a8] text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 active:scale-[0.98] transition-transform"
            >
              Түүхийн аялал эхлэх
            </button>
          </div>
          <div className="mt-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-[24px] p-5 border border-amber-100/50 shadow-sm relative overflow-hidden group">
  {/* Чимэглэлийн дүрс */}
  <div className="absolute transition-transform -right-2 -bottom-2 opacity-10 group-hover:scale-110">
    <Trophy size={80} />
  </div>
  
  <div className="relative z-10">
    <div className="flex items-center gap-2 mb-3">
      <div className="p-1.5 bg-amber-200/50 rounded-lg text-amber-700">
        <Info size={14} />
      </div>
      <h4 className="text-[11px] font-black text-amber-800 uppercase tracking-wider">Мэдлэгт нэмэр</h4>
    </div>
    
    <p className="text-xs font-medium leading-relaxed text-amber-900/80">
      "Монголын нууц товчоо" бол Дэлхийн утга зохиолын өвд бүртгэгдсэн цорын ганц түүхэн дурсгалт бичиг юм.
    </p>
    
    <button className="mt-4 text-[10px] font-black text-amber-700 hover:text-amber-900 flex items-center gap-1 transition-colors">
      ДЭЛГЭРЭНГҮЙ УНШИХ →
    </button>
  </div>
</div>
{/* Powered by Section */}
<div className="flex justify-center pt-6 mt-auto shrink-0">
  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] flex items-center gap-2">
    <span className="w-8 h-[1px] bg-slate-200"></span>
    Powered by <span className="transition-colors cursor-default text-slate-400 hover:text-blue-500">Kung-Fu Developers</span>
    <span className="w-8 h-[1px] bg-slate-200"></span>
  </p>
</div>
        </div>
      </div>

     
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}