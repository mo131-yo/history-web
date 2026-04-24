"use client";

export type ChatMessage = {
  role: "user" | "ai";
  content: string;
  isStreaming?: boolean;
};

export function getSuggestions(context: unknown): string[] {
  const safe = context as { name?: string } | null;
  if (!safe?.name) {
    return [
      "Монгол эзэнт гүрэн хэзээ байгуулагдсан бэ?",
      "Чингис хааны байлдан дагуулалтын талаар хэлж өгнө үү",
      "Монгол гүрний хамгийн их нутаг хэзээ байсан бэ?",
    ];
  }
  return [
    `${safe.name} хэзээ байгуулагдсан бэ?`,
    `${safe.name}-ийн хамгийн алдартай захирагч хэн бэ?`,
    `${safe.name}-ийн уналтын шалтгаан юу вэ?`,
  ];
}
