import type { LeaderboardScore } from "./QuizLeaderboardPage";

import { CrownIcon } from "./CrownIcon";
import { MedalIcon } from "./Medalicon";
import { sidebarTheme as T } from "../atlas/sidebarTheme";
import type { LeaderboardCategory } from "./QuizLeaderboardPage";

type PodiumConfig = {
  dataIdx: number;
  order: number;
  pedHeight: number;
  labelColor: string;
  scoreColor: string;
  cardBg: string;
  cardBorder: string;
  avatarBg: string;
  avatarColor: string;
  avatarBorder: string;
  pedBg: string;
  pedBorder: string;
  pedRankColor: string;
  label: string;
};

const PODIUM_CONFIGS: PodiumConfig[] = [
  {
    dataIdx: 1,
    order: 0,
    pedHeight: 56,
    label: "2-р байр",
    labelColor: "#94a3b8",
    scoreColor: "#cbd5e1",
    cardBg: "rgba(12,96,169,0.04)",
    cardBorder: "rgba(12,96,169,0.18)",
    avatarBg: "rgba(12,96,169,0.07)",
    avatarColor: "#94a3b8",
    avatarBorder: "rgba(12,96,169,0.20)",
    pedBg: "rgba(12,96,169,0.07)",
    pedBorder: "rgba(12,96,169,0.20)",
    pedRankColor: "#94a3b8",
  },
  {
    dataIdx: 0,
    order: 1,
    pedHeight: 88,
    label: "1-р байр",
    labelColor: "#0c60a9",
    scoreColor: "#0c60a9",
    cardBg: "rgba(12,96,169,0.10)",
    cardBorder: "rgba(12,96,169,0.35)",
    avatarBg: "rgba(12,96,169,0.14)",
    avatarColor: "#0c60a9",
    avatarBorder: "rgba(12,96,169,0.40)",
    pedBg: "rgba(12,96,169,0.14)",
    pedBorder: "rgba(12,96,169,0.30)",
    pedRankColor: "#0c60a9",
  },
  {
    dataIdx: 2,
    order: 2,
    pedHeight: 40,
    label: "3-р байр",
    labelColor: "#3679c4",
    scoreColor: "#3679c4",
    cardBg: "rgba(12,96,169,0.06)",
    cardBorder: "rgba(12,96,169,0.22)",
    avatarBg: "rgba(12,96,169,0.09)",
    avatarColor: "#3679c4",
    avatarBorder: "rgba(12,96,169,0.24)",
    pedBg: "rgba(12,96,169,0.09)",
    pedBorder: "rgba(12,96,169,0.22)",
    pedRankColor: "#3679c4",
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function OlympicPodium({
  scores,
  category,
}: {
  scores: LeaderboardScore[];
  category: LeaderboardCategory;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: 0,
        padding: "24px 16px 0",
      }}
    >
      {PODIUM_CONFIGS.map((cfg) => {
        const entry = scores[cfg.dataIdx];
        if (!entry) return null;
        const rank = cfg.dataIdx + 1;

        return (
          <div
            key={entry.userId}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flex: 1,
              maxWidth: 200,
              order: cfg.order,
            }}
          >
            <div style={{ marginBottom: 6, height: 36, display: "flex", alignItems: "center" }}>
              {rank === 1 ? (
                <CrownIcon size={32} />
              ) : (
                <MedalIcon rank={rank as 2 | 3} size={28} />
              )}
            </div>

            <div
              style={{
                width: "100%",
                borderRadius: "12px 12px 0 0",
                border: `1px solid ${cfg.cardBorder}`,
                borderBottom: "none",
                background: cfg.cardBg,
                padding: "14px 10px 12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: "50%",
                  background: cfg.avatarBg,
                  border: `1.5px solid ${cfg.avatarBorder}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 600,
                  color: cfg.avatarColor,
                  flexShrink: 0,
                }}
              >
                {initials(entry.userName)}
              </div>

              <p
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: T.text,
                  textAlign: "center",
                  maxWidth: 120,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  lineHeight: 1.3,
                  margin: 0,
                }}
              >
                {entry.userName}
              </p>

              <p style={{ margin: 0, lineHeight: 1 }}>
                <span style={{ fontSize: 26, fontWeight: 700, color: cfg.scoreColor }}>
                  {entry.score}
                </span>
                <span style={{ fontSize: 13, color: T.textMuted }}>/{entry.total}</span>
              </p>

              <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>
                {formatPodiumMeta(entry, category)}
              </p>
            </div>

            <div
              style={{
                width: "100%",
                height: cfg.pedHeight,
                background: cfg.pedBg,
                border: `1px solid ${cfg.pedBorder}`,
                borderTop: "none",
                borderRadius: "0 0 6px 6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: cfg.pedRankColor,
                  opacity: 0.6,
                }}
              >
                #{rank}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatPodiumMeta(entry: LeaderboardScore, category: LeaderboardCategory) {
  if (category === "grade") {
    return entry.selectedGrade ? `${entry.selectedGrade}-р анги` : "Ангийн quiz";
  }

  if (category === "knowledge") {
    return `${entry.attemptsCount} мэдлэгийн оролдлого`;
  }

  return `${entry.attemptsCount} нийт quiz`;
}
