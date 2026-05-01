import React from "react";

// Props-ийн төрлийг тодорхойлж өгнө
interface CrownIconProps {
  size?: number;
  className?: string;
}

export const CrownIcon = ({ size = 24, className = "" }: CrownIconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M5 15L3 6L8 9L12 3L16 9L21 6L19 15H5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 15C5 16.6569 8.13401 18 12 18C15.866 18 19 16.6569 19 15"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
};