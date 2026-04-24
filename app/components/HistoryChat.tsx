"use client";

import React from "react";
import { Bot, MessageCircle, MinusCircle, RotateCcw } from "lucide-react";
import { getSuggestions } from "./history/historyChatConfig";
import { useHistoryChat } from "./history/useHistoryChat";

export default function HistoryChat({ currentContext }: { currentContext: unknown }) {
  const {
    isOpen,
    setIsOpen,
    input,
    setInput,
    messages,
    isLoading,
    scrollRef,
    textareaRef,
    sendMessage,
    clearMessages,
  } = useHistoryChat(currentContext);
  const suggestions = getSuggestions(currentContext);

  return (
    <div className="fixed bottom-24 right-8 z-60 font-sans">
      {isOpen ? (
        <div className="flex h-145 w-105 flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300" style={{ background: "rgba(10,8,4,0.97)", border: "1px solid rgba(90,60,20,0.5)", borderRadius: "20px", backdropFilter: "blur(24px)", boxShadow: "0 24px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(200,160,80,0.08)" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(80,50,15,0.4)", background: "linear-gradient(180deg, rgba(197,160,89,0.08) 0%, transparent 100%)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #d4a843, #8b6020)", display: "flex", alignItems: "center", justifyContent: "center", color: "#1a0f00", flexShrink: 0 }}>
                <Bot size={17} />
              </div>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#f5e6c8", margin: 0, letterSpacing: "0.03em" }}>Түүхийн зөвлөх</h3>
                <p style={{ fontSize: 10, color: currentContext && (currentContext as { name?: string }).name ? "#c9a45d" : "#6b4a18", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.85 }}>
                  {currentContext && (currentContext as { name?: string; year?: number }).name
                    ? `${(currentContext as { name?: string }).name}${(currentContext as { year?: number }).year ? ` • ${(currentContext as { year?: number }).year}` : ""}`
                    : "claude-sonnet-4 • Mongol Atlas"}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {messages.length > 0 && (
                <button onClick={clearMessages} title="Цэвэрлэх" style={{ background: "transparent", border: "1px solid rgba(90,60,20,0.4)", color: "#6b4a18", padding: "4px 8px", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
                  <RotateCcw size={12} />
                </button>
              )}
              <button onClick={() => setIsOpen(false)} style={{ background: "transparent", border: "none", color: "rgba(200,160,80,0.3)", cursor: "pointer", padding: 2 }}>
                <MinusCircle size={19} />
              </button>
            </div>
          </div>

          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "14px", scrollbarWidth: "thin", scrollbarColor: "rgba(90,60,20,0.4) transparent" }}>
            {messages.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12, textAlign: "center", opacity: 0.4, padding: "0 24px" }}>
                <Bot size={38} strokeWidth={1} color="#c9a45d" />
                <p style={{ fontSize: 12, lineHeight: 1.7, color: "#c9a45d", fontFamily: "Georgia, serif", fontStyle: "italic", margin: 0 }}>
                  Монгол гүрний түүх болон тухайн цаг үеийн талаар юуг ч хамаагүй асууж болно.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", marginTop: 8, opacity: 1 }}>
                  {suggestions.map((s, i) => (
                    <button key={i} onClick={() => sendMessage(s)} style={{ padding: "10px 12px", borderRadius: 12, background: "rgba(201,164,93,0.08)", border: "1px solid rgba(201,164,93,0.15)", color: "#c9a45d", fontSize: 11, cursor: "pointer", textAlign: "left" }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, idx) => (
                <div key={idx} style={{ alignSelf: message.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%", padding: "12px 14px", borderRadius: 16, background: message.role === "user" ? "linear-gradient(135deg, rgba(201,164,93,0.22), rgba(139,96,32,0.22))" : "rgba(255,255,255,0.04)", border: message.role === "user" ? "1px solid rgba(201,164,93,0.22)" : "1px solid rgba(90,60,20,0.25)", color: message.role === "user" ? "#f4ddad" : "#f5e6c8", fontSize: 12, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                  {message.content || (message.isStreaming ? "Бичиж байна..." : "")}
                </div>
              ))
            )}
          </div>

          <div style={{ padding: 14, borderTop: "1px solid rgba(80,50,15,0.35)", flexShrink: 0 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder="Асуултаа энд бичнэ үү..."
                style={{ flex: 1, minHeight: 44, maxHeight: 120, resize: "none", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(90,60,20,0.4)", borderRadius: 14, padding: "12px 14px", color: "#f5e6c8", fontSize: 12, outline: "none" }}
              />
              <button
                onClick={() => void sendMessage()}
                disabled={!input.trim() || isLoading}
                style={{ width: 44, height: 44, borderRadius: 14, border: "1px solid rgba(201,164,93,0.25)", background: input.trim() && !isLoading ? "linear-gradient(135deg, #d4a843, #8b6020)" : "rgba(255,255,255,0.04)", color: input.trim() && !isLoading ? "#1a0f00" : "#6b4a18", cursor: input.trim() && !isLoading ? "pointer" : "not-allowed", flexShrink: 0 }}
              >
                <MessageCircle size={18} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full"
          style={{ background: "linear-gradient(135deg, #d4a843, #8b6020)", boxShadow: "0 18px 30px rgba(0,0,0,0.35), 0 0 0 4px rgba(201,164,93,0.1)", color: "#1a0f00" }}
        >
          <MessageCircle size={22} />
        </button>
      )}
    </div>
  );
}
