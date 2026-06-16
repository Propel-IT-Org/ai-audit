"use client";

import { useId } from "react";

interface AivyProps {
  size?: number;
  className?: string;
}

export function Aivy({ size = 32, className }: AivyProps) {
  const gradId = useId();
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      style={{ display: "inline-block", lineHeight: 0, flex: "none" }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6E80E0" />
          <stop offset="1" stopColor="#4A5DC4" />
        </linearGradient>
      </defs>
      <path
        d="M32 3 C49 3 59 14 59 32 C59 49 50 61 32 61 C14 61 5 49 5 32 C5 14 15 3 32 3 Z"
        fill={`url(#${gradId})`}
      />
      <ellipse cx="24" cy="30" rx="3.4" ry="4.6" fill="#fff" />
      <ellipse cx="40" cy="30" rx="3.4" ry="4.6" fill="#fff" />
      <circle cx="24.6" cy="31.6" r="1.7" fill="#2A2A4A" />
      <circle cx="40.6" cy="31.6" r="1.7" fill="#2A2A4A" />
      <path
        d="M27 41 Q32 46 37 41"
        stroke="#2A2A4A"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      <g transform="rotate(-10 47 47)">
        <rect x="41" y="41" width="13" height="13" rx="2.5" fill="#E0344A" stroke="#fff" strokeWidth="1.5" />
        <text
          x="47.5"
          y="50.7"
          fontSize="9"
          fontWeight="700"
          fill="#fff"
          textAnchor="middle"
          fontFamily="serif"
        >
          藍
        </text>
      </g>
    </svg>
  );
}
