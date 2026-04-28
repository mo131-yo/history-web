type MedalIconProps = {
  rank: 2 | 3;
  size?: number;
};

const MEDAL_PALETTE = {
  2: {
    outerFill: "#e2e8f0",
    outerStroke: "#94a3b8",
    innerFill: "#f8fafc",
    innerStroke: "#cbd5e1",
    textColor: "#475569",
  },
  3: {
    outerFill: "#fed7aa",
    outerStroke: "#fb923c",
    innerFill: "#fff7ed",
    innerStroke: "#fdba74",
    textColor: "#7c2d12",
  },
};

export function MedalIcon({ rank, size = 28 }: MedalIconProps) {
  const p = MEDAL_PALETTE[rank];
  const cx = size / 2;
  const cy = size / 2;
  const outerR = cx - 1.5;
  const innerR = outerR * 0.58;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx={cx} cy={cy} r={outerR} fill={p.outerFill} stroke={p.outerStroke} strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r={innerR} fill={p.innerFill} stroke={p.innerStroke} strokeWidth="1" />
      <text
        x={cx}
        y={cy + 4}
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        fill={p.textColor}
        fontFamily="system-ui, sans-serif"
      >
        {rank}
      </text>
    </svg>
  );
}