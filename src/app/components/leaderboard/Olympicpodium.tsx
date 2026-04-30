import type { LeaderboardCategory, LeaderboardScore } from "./QuizLeaderboardPage";

import { CrownIcon } from "./CrownIcon";
import { MedalIcon } from "./Medalicon";

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
};

const PODIUM_CONFIGS: PodiumConfig[] = [
  {
    dataIdx: 1,
    order: 0,
    pedHeight: 56,
    labelColor: "#475569",
    scoreColor: "#64748b",
    cardBg: "linear-gradient(180deg,#f8fafc,#e2e8f0)",
    cardBorder: "rgba(100,116,139,0.36)",
    avatarBg: "#e2e8f0",
    avatarColor: "#475569",
    avatarBorder: "rgba(100,116,139,0.42)",
    pedBg: "linear-gradient(180deg,#cbd5e1,#94a3b8)",
    pedBorder: "rgba(100,116,139,0.42)",
    pedRankColor: "#ffffff",
  },
  {
    dataIdx: 0,
    order: 1,
    pedHeight: 88,
    labelColor: "#92400e",
    scoreColor: "#d97706",
    cardBg: "linear-gradient(180deg,#fffbeb,#fde68a)",
    cardBorder: "rgba(217,119,6,0.42)",
    avatarBg: "#fef3c7",
    avatarColor: "#92400e",
    avatarBorder: "rgba(217,119,6,0.46)",
    pedBg: "linear-gradient(180deg,#fbbf24,#d97706)",
    pedBorder: "rgba(180,83,9,0.45)",
    pedRankColor: "#ffffff",
  },
  {
    dataIdx: 2,
    order: 2,
    pedHeight: 40,
    labelColor: "#9a3412",
    scoreColor: "#c2410c",
    cardBg: "linear-gradient(180deg,#fff7ed,#fed7aa)",
    cardBorder: "rgba(194,65,12,0.36)",
    avatarBg: "#ffedd5",
    avatarColor: "#9a3412",
    avatarBorder: "rgba(194,65,12,0.40)",
    pedBg: "linear-gradient(180deg,#fb923c,#c2410c)",
    pedBorder: "rgba(154,52,18,0.42)",
    pedRankColor: "#ffffff",
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
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
        padding: "28px 16px 0",
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
            <div
              style={{
                marginBottom: 6,
                height: 36,
                display: "flex",
                alignItems: "center",
              }}
            >
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
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.72)",
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
                  fontWeight: 700,
                  color: cfg.avatarColor,
                  flexShrink: 0,
                }}
              >
                {initials(entry.userName)}
              </div>

              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#0f172a",
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
                <span
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: cfg.scoreColor,
                  }}
                >
                  {entry.score}
                </span>
                <span style={{ fontSize: 13, color: "#64748b" }}>
                  /{entry.total}
                </span>
              </p>

              <p style={{ fontSize: 11, color: cfg.labelColor, margin: 0 }}>
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
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)",
              }}
            >
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: cfg.pedRankColor,
                  textShadow: "0 1px 8px rgba(15,23,42,0.18)",
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

function formatPodiumMeta(
  entry: LeaderboardScore,
  category: LeaderboardCategory,
) {
  if (category === "grade") {
    return entry.selectedLevel ? `Level ${entry.selectedLevel}` : "Level quiz";
  }

  if (category === "knowledge") {
    return `${entry.attemptsCount} мэдлэгийн оролдлого`;
  }

  return `${entry.attemptsCount} нийт quiz`;
}
