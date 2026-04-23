"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, Send, MinusCircle, Bot, User, Sparkles, RotateCcw } from "lucide-react";

interface Message {
  role: "user" | "ai";
  content: string;
  isStreaming?: boolean;
}

function getSuggestions(context: any): string[] {
  if (!context) return [
    "Монгол эзэнт гүрэн хэзээ байгуулагдсан бэ?",
    "Чингис хааны байлдан дагуулалтын талаар хэлж өгнө үү",
    "Монгол гүрний хамгийн их нутаг хэзээ байсан бэ?",
  ];
  const name = context?.name ?? "";
  return [
    `${name} хэзээ байгуулагдсан бэ?`,
    `${name}-ийн хамгийн алдартай захирагч хэн бэ?`,
    `${name}-ийн уналтын шалтгаан юу вэ?`,
    `${name}-ийн хөршүүдтэй харилцаа хэрхэн байсан бэ?`,
  ].slice(0, 3);
}

export default function HistoryChat({ currentContext }: { currentContext: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const suggestions = getSuggestions(currentContext);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  const sendMessage = useCallback(async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isLoading) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setMessages(prev => [...prev, { role: "user", content }]);
    setInput("");
    setIsLoading(true);

    setMessages(prev => [...prev, { role: "ai", content: "", isStreaming: true }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, historyContext: currentContext }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error("API алдаа");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let accumulated = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") break;
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.delta?.text ?? parsed.text ?? "";
                accumulated += delta;
                setMessages(prev => {
                  const msgs = [...prev];
                  const last = msgs[msgs.length - 1];
                  if (last?.isStreaming) {
                    msgs[msgs.length - 1] = { ...last, content: accumulated };
                  }
                  return msgs;
                });
              } catch {
              }
            }
          }
        }
        setMessages(prev => {
          const msgs = [...prev];
          const last = msgs[msgs.length - 1];
          if (last?.isStreaming) {
            msgs[msgs.length - 1] = { ...last, isStreaming: false };
          }
          return msgs;
        });
      } else {
        const data = await res.json();
        setMessages(prev => {
          const msgs = [...prev];
          msgs[msgs.length - 1] = { role: "ai", content: data.text ?? "Хариулт авч чадсангүй." };
          return msgs;
        });
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setMessages(prev => {
        const msgs = [...prev];
        msgs[msgs.length - 1] = {
          role: "ai",
          content: "Уучлаарай, холболтонд алдаа гарлаа. Дахин оролдоно уу.",
        };
        return msgs;
      });
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, currentContext]);

  const clearMessages = () => {
    abortRef.current?.abort();
    setMessages([]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-24 right-8 z-60 font-sans">
      {isOpen ? (
        <div
          className="w-105 h-145 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300"
          style={{
            background: "rgba(10,8,4,0.97)",
            border: "1px solid rgba(90,60,20,0.5)",
            borderRadius: "20px",
            backdropFilter: "blur(24px)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(200,160,80,0.08)",
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid rgba(80,50,15,0.4)",
              background: "linear-gradient(180deg, rgba(197,160,89,0.08) 0%, transparent 100%)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #d4a843, #8b6020)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1a0f00",
                  flexShrink: 0,
                }}
              >
                <Bot size={17} />
              </div>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#f5e6c8", margin: 0, letterSpacing: "0.03em" }}>
                  Түүхийн зөвлөх
                </h3>
                {currentContext?.name ? (
                  <p style={{ fontSize: 10, color: "#c9a45d", margin: 0, display: "flex", alignItems: "center", gap: 4, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.85 }}>
                    <Sparkles size={9} /> {currentContext.name}
                    {currentContext.year && <span style={{ color: "#8b6020" }}>• {currentContext.year}</span>}
                  </p>
                ) : (
                  <p style={{ fontSize: 10, color: "#6b4a18", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    claude-sonnet-4 • Mongol Atlas
                  </p>
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {messages.length > 0 && (
                <button
                  onClick={clearMessages}
                  title="Цэвэрлэх"
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(90,60,20,0.4)",
                    color: "#6b4a18",
                    padding: "4px 8px",
                    borderRadius: 8,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 11,
                  }}
                >
                  <RotateCcw size={12} />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: "transparent", border: "none", color: "rgba(200,160,80,0.3)", cursor: "pointer", padding: 2 }}
              >
                <MinusCircle size={19} />
              </button>
            </div>
          </div>

          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(90,60,20,0.4) transparent",
            }}
          >
            {messages.length === 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  gap: 12,
                  textAlign: "center",
                  opacity: 0.4,
                  padding: "0 24px",
                }}
              >
                <Bot size={38} strokeWidth={1} color="#c9a45d" />
                <p style={{ fontSize: 12, lineHeight: 1.7, color: "#c9a45d", fontFamily: "Georgia, serif", fontStyle: "italic", margin: 0 }}>
                  Монгол гүрний түүх болон тухайн цаг үеийн талаар юуг ч хамаагүй асууж болно.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", marginTop: 8, opacity: 1 }}>
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(s)}
                      style={{
                        background: "rgba(90,60,20,0.2)",
                        border: "1px solid rgba(90,60,20,0.4)",
                        color: "#c9a45d",
                        fontSize: 11,
                        padding: "7px 12px",
                        borderRadius: 10,
                        cursor: "pointer",
                        textAlign: "left",
                        fontFamily: "Georgia, serif",
                        lineHeight: 1.4,
                        transition: "all 0.15s",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                  gap: 8,
                  alignItems: "flex-start",
                }}
              >
                {m.role === "ai" && (
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: "rgba(197,160,89,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 2,
                      color: "#c9a45d",
                    }}
                  >
                    <Bot size={13} />
                  </div>
                )}
                <div
                  style={{
                    maxWidth: "82%",
                    padding: "10px 13px",
                    borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "4px 14px 14px 14px",
                    fontSize: 13,
                    lineHeight: 1.65,
                    background: m.role === "user"
                      ? "rgba(255,255,255,0.07)"
                      : "rgba(255,255,255,0.025)",
                    border: m.role === "user"
                      ? "1px solid rgba(255,255,255,0.08)"
                      : "1px solid rgba(90,60,20,0.3)",
                    color: m.role === "user" ? "#e8dcc8" : "rgba(245,230,200,0.9)",
                    fontFamily: m.role === "ai" ? "Georgia, serif" : "inherit",
                    position: "relative",
                  }}
                >
                  {m.content.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
                    part.startsWith("**") && part.endsWith("**")
                      ? <strong key={j} style={{ color: "#f0c060", fontWeight: 600 }}>{part.slice(2, -2)}</strong>
                      : part
                  )}
                  {m.isStreaming && (
                    <span
                      style={{
                        display: "inline-block",
                        width: 2,
                        height: "1em",
                        background: "#c9a45d",
                        marginLeft: 2,
                        verticalAlign: "text-bottom",
                        animation: "blink 1s step-end infinite",
                      }}
                    />
                  )}
                </div>
                {m.role === "user" && (
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 2,
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    <User size={13} />
                  </div>
                )}
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.content === "" && (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(197,160,89,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#c9a45d", flexShrink: 0 }}>
                  <Bot size={13} />
                </div>
                <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(90,60,20,0.3)", padding: "10px 14px", borderRadius: "4px 14px 14px 14px", display: "flex", gap: 5 }}>
                  {[0, 0.22, 0.44].map((delay, i) => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#c9a45d", animation: `bounce 1.2s ease-in-out ${delay}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {messages.length > 0 && messages.length < 4 && (
            <div
              style={{
                padding: "6px 12px",
                borderTop: "1px solid rgba(60,40,10,0.3)",
                display: "flex",
                gap: 6,
                overflowX: "auto",
                scrollbarWidth: "none",
                flexShrink: 0,
              }}
            >
              {suggestions.slice(0, 2).map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  style={{
                    background: "rgba(60,40,10,0.4)",
                    border: "1px solid rgba(90,60,20,0.35)",
                    color: "#a07830",
                    fontSize: 11,
                    padding: "4px 10px",
                    borderRadius: 10,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    fontFamily: "Georgia, serif",
                    flexShrink: 0,
                  }}
                >
                  {s.length > 28 ? s.slice(0, 28) + "…" : s}
                </button>
              ))}
            </div>
          )}

          <div
            style={{
              padding: "10px 12px 14px",
              borderTop: "1px solid rgba(60,40,10,0.4)",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 8,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(90,60,20,0.35)",
                borderRadius: 14,
                padding: "6px 6px 6px 12px",
                transition: "border-color 0.2s",
              }}
              onFocusCapture={e => (e.currentTarget.style.borderColor = "rgba(197,160,89,0.5)")}
              onBlurCapture={e => (e.currentTarget.style.borderColor = "rgba(90,60,20,0.35)")}
            >
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  color: "#e8dcc8",
                  fontSize: 13,
                  outline: "none",
                  resize: "none",
                  maxHeight: 120,
                  lineHeight: 1.5,
                  fontFamily: "Georgia, serif",
                }}
                placeholder="Зурвас илгээх… (Shift+Enter = мөр)"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  border: "none",
                  cursor: input.trim() && !isLoading ? "pointer" : "default",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: input.trim() && !isLoading
                    ? "linear-gradient(135deg, #d4a843, #8b6020)"
                    : "rgba(255,255,255,0.04)",
                  color: input.trim() && !isLoading ? "#1a0f00" : "rgba(255,255,255,0.15)",
                  transition: "all 0.2s",
                  flexShrink: 0,
                }}
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative"
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #d4a843, #7a5010)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#1a0f00",
            boxShadow: "0 8px 28px rgba(180,120,30,0.35)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.transform = "scale(1.1)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 36px rgba(180,120,30,0.5)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(180,120,30,0.35)";
          }}
        >
          <MessageCircle size={24} strokeWidth={2.5} />
          <span style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#f0c060",
            border: "1.5px solid #1a0f00",
            animation: "pulse-dot 2s ease-in-out infinite",
          }} />
        </button>
      )}

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  );
}