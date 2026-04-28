import type { LeaderboardScore } from "./QuizLeaderboardPage";
import { T } from "./constants";
import { CrownIcon } from "./CrownIcon";
import { MedalIcon } from "./MedalIcon";

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
    cardBg: "rgba(148,163,184,0.10)",
    cardBorder: "rgba(148,163,184,0.30)",
    avatarBg: "rgba(148,163,184,0.18)",
    avatarColor: "#94a3b8",
    avatarBorder: "rgba(148,163,184,0.40)",
    pedBg: "rgba(148,163,184,0.22)",
    pedBorder: "rgba(148,163,184,0.35)",
    pedRankColor: "#94a3b8",
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
    labelColor: "#fb923c",
    scoreColor: "#fdba74",
    cardBg: "rgba(180,83,9,0.10)",
    cardBorder: "rgba(180,83,9,0.30)",
    avatarBg: "rgba(180,83,9,0.14)",
    avatarColor: "#fb923c",
    avatarBorder: "rgba(180,83,9,0.35)",
    pedBg: "rgba(180,83,9,0.18)",
    pedBorder: "rgba(180,83,9,0.30)",
    pedRankColor: "#c2410c",
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

              <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>{entry.year} он</p>
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