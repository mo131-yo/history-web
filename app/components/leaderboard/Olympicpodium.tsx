import type { LeaderboardScore } from "./QuizLeaderboardPage";
import { T } from "../atlas/constants";
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
  label: string;
};

const PODIUM_CONFIGS: PodiumConfig[] = [
  {
    dataIdx: 1,
    order: 0,
    pedHeight: 56,
    label: "2-р байр",
    labelColor: T.textSub,
    scoreColor: T.text,
    cardBg: "rgba(92,64,32,0.18)",
    cardBorder: T.borderMid,
    avatarBg: "rgba(92,64,32,0.22)",
    avatarColor: T.textSub,
    avatarBorder: T.borderMid,
    pedBg: "rgba(92,64,32,0.18)",
    pedBorder: T.borderMid,
    pedRankColor: T.textSub,
  },
  {
    dataIdx: 0,
    order: 1,
    pedHeight: 88,
    label: "1-р байр",
    labelColor: "#fbbf24",
    scoreColor: "#fbbf24",
    cardBg: "rgba(201,164,93,0.12)",
    cardBorder: "rgba(201,164,93,0.38)",
    avatarBg: "rgba(201,164,93,0.18)",
    avatarColor: "#f59e0b",
    avatarBorder: "rgba(201,164,93,0.50)",
    pedBg: "rgba(201,164,93,0.22)",
    pedBorder: "rgba(201,164,93,0.40)",
    pedRankColor: "#ca8a04",
  },
  {
    dataIdx: 2,
    order: 2,
    pedHeight: 40,
    label: "3-р байр",
    labelColor: T.amberDim,
    scoreColor: T.amber,
    cardBg: "rgba(139,108,53,0.10)",
    cardBorder: "rgba(139,108,53,0.35)",
    avatarBg: "rgba(139,108,53,0.14)",
    avatarColor: T.amberDim,
    avatarBorder: "rgba(139,108,53,0.38)",
    pedBg: "rgba(139,108,53,0.16)",
    pedBorder: "rgba(139,108,53,0.34)",
    pedRankColor: T.amberDim,
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

export function OlympicPodium({ scores }: { scores: LeaderboardScore[] }) {
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

              <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>{entry.year ? `${entry.year} он` : "Ерөнхий"}</p>
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
