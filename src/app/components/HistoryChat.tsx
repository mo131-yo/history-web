"use client";
import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, Bot, User, Sparkles, MinusCircle } from "lucide-react";

export default function HistoryChat({ currentContext }: { currentContext: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, historyContext: currentContext }),
      });
      const data = await res.json();
      
      setMessages((prev) => [...prev, { role: "ai" as const, content: data.text }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "ai" as const, content: "Уучлаарай, холболтонд алдаа гарлаа." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-8 z-[60] font-sans">
      {isOpen ? (
        <div className="w-[400px] h-[550px] bg-[#0d1117]/95 border border-white/10 rounded-[2rem] flex flex-col backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-5 duration-300 overflow-hidden">
          
          <div className="p-5 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-[#C5A059]/10 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#C5A059] flex items-center justify-center text-black">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="text-[13px] font-bold text-white tracking-wide">Түүхийн зөвлөх</h3>
                {currentContext?.name && (
                  <p className="text-[10px] text-[#C5A059] font-medium opacity-80 uppercase tracking-tighter flex items-center gap-1">
                    <Sparkles size={10} /> {currentContext.name}
                  </p>
                )}
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/20 hover:text-white transition-colors p-1">
              <MinusCircle size={20} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[url('/grid.svg')] bg-center">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-30 px-10">
                <Bot size={40} strokeWidth={1} />
                <p className="text-xs leading-relaxed italic font-serif">
                  Монгол гүрний түүх болон тухайн цаг үеийн талаар юуг ч хамаагүй асууж болно.
                </p>
              </div>
            )}
            
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}>
                <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mt-1 shrink-0 ${m.role === 'user' ? 'bg-white/10' : 'bg-[#C5A059]/20 text-[#C5A059]'}`}>
                    {m.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                  </div>
                  <div className={`p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                    m.role === 'user' 
                      ? 'bg-white/[0.08] text-white rounded-tr-none border border-white/5' 
                      : 'bg-white/[0.03] text-white/90 rounded-tl-none border border-white/10 font-serif'
                  }`}>
                    {m.content}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-white/[0.03] p-4 rounded-2xl rounded-tl-none border border-white/10 flex gap-2">
                  <div className="w-1.5 h-1.5 bg-[#C5A059] rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-[#C5A059] rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-[#C5A059] rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          <div className="p-5 bg-white/[0.02] border-t border-white/5">
            <div className="relative flex items-end gap-2 bg-white/[0.03] border border-white/10 rounded-[1.2rem] p-2 focus-within:border-[#C5A059]/40 transition-all">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                className="flex-1 bg-transparent border-none text-[13px] text-white outline-none px-3 py-2 resize-none max-h-32 custom-scrollbar placeholder:text-white/10"
                placeholder="Зурвас илгээх..."
              />
              <button 
                onClick={sendMessage} 
                disabled={!input.trim() || isLoading}
                className={`p-2.5 rounded-xl transition-all ${
                  input.trim() && !isLoading ? 'bg-[#C5A059] text-black shadow-lg shadow-[#C5A059]/20' : 'bg-white/5 text-white/20'
                }`}
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-[9px] text-white/10 mt-3 text-center uppercase tracking-[0.2em]">Powered by GPT-4o-Mini • Historical Core</p>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="group relative p-5 bg-gradient-to-br from-[#C5A059] to-[#9A7B3E] text-black rounded-full shadow-[0_10px_30px_rgba(197,160,89,0.3)] hover:scale-110 active:scale-95 transition-all duration-300"
        >
          <div className="absolute inset-0 rounded-full border border-white/20 scale-100 group-hover:scale-125 opacity-0 group-hover:opacity-100 transition-all duration-500" />
          <MessageCircle size={26} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}