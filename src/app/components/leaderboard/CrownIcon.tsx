type CrownIconProps = {
  size?: number;
};

export function CrownIcon({ size = 32 }: CrownIconProps) {
  return (
    <svg
      width={size}
      height={Math.round(size * 0.85)}
      viewBox="0 0 32 27"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 22 L6 10 L12 18 L16 4 L20 18 L26 10 L30 22 Z"
        fill="#ca8a04"
        stroke="#a16207"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <rect
        x="2"
        y="22"
        width="28"
        height="4"
        rx="2"
        fill="#ca8a04"
        stroke="#a16207"
        strokeWidth="1"
      />
      <circle cx="16" cy="4" r="2.2" fill="#fbbf24" />
      <circle cx="6" cy="10" r="1.8" fill="#fbbf24" />
      <circle cx="26" cy="10" r="1.8" fill="#fbbf24" />
      <rect x="6" y="23.5" width="20" height="1" rx="0.5" fill="#fde68a" opacity="0.5" />
    </svg>
  );
}