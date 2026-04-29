"use client";
import HistoryQuiz from "./Historyquiz";
import { T } from "./atlas/constants";

export type QuizMode = "knowledge" | "grade";

export const QuizModal = ({
  isOpen,
  mode,
  onClose,
  userName,
  onScoreSaved,
}: {
  isOpen: boolean;
  mode: QuizMode;
  onClose: () => void;
  userName?: string;
  onScoreSaved?: () => void;
}) => {

  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 z-40 overflow-y-auto backdrop-blur-md animate-in fade-in duration-300"
      style={{ background: `rgba(8,5,2,0.94)`, borderLeft: `1px solid ${T.border}` }}
    >
      <HistoryQuiz mode={mode} onClose={onClose} userName={userName} onScoreSaved={onScoreSaved} />
    </div>
  );
};
