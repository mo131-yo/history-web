"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage } from "./historyChatConfig";

export function useHistoryChat(currentContext: unknown) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
  }, [input]);

  const sendMessage = useCallback(async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isLoading) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setMessages((prev) => [...prev, { role: "user", content }, { role: "ai", content: "", isStreaming: true }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, historyContext: currentContext }),
        signal: abortRef.current.signal,
      });
      if (!res.ok) throw new Error("API алдаа");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("no-stream");
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value, { stream: true }).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            accumulated += parsed.delta?.text ?? parsed.text ?? "";
            setMessages((prev) => prev.map((msg, i) => (i === prev.length - 1 && msg.isStreaming ? { ...msg, content: accumulated } : msg)));
          } catch {}
        }
      }

      setMessages((prev) => prev.map((msg, i) => (i === prev.length - 1 && msg.isStreaming ? { ...msg, isStreaming: false } : msg)));
    } catch (err) {
      if ((err as { name?: string }).name === "AbortError") return;
      setMessages((prev) => prev.map((msg, i) => (i === prev.length - 1 ? { role: "ai", content: "Уучлаарай, холболтонд алдаа гарлаа. Дахин оролдоно уу." } : msg)));
    } finally {
      setIsLoading(false);
    }
  }, [currentContext, input, isLoading]);

  return {
    isOpen,
    setIsOpen,
    input,
    setInput,
    messages,
    isLoading,
    scrollRef,
    textareaRef,
    sendMessage,
    clearMessages: () => {
      abortRef.current?.abort();
      setMessages([]);
      setIsLoading(false);
    },
  };
}
