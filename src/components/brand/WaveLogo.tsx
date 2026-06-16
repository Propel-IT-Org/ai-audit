interface WaveLogoProps {
  size?: number;
  className?: string;
}

export function WaveLogo({ size = 26, className }: WaveLogoProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      style={{ display: "inline-block", lineHeight: 0, verticalAlign: "middle", flex: "none" }}
    >
      <rect width="32" height="32" rx="8" fill="#F5EEDC" />
      <circle cx="22.5" cy="9.5" r="4.3" fill="#D6452C" />
      <path
        d="M0 23 C5.5 16 10.5 27 16 21.5 C21 16.5 26.5 25 32 19.5 L32 32 L0 32 Z"
        fill="#1F4788"
      />
      <circle cx="8.5" cy="23" r="1.25" fill="#fff" />
      <circle cx="17.5" cy="25" r="1" fill="#fff" />
      <circle cx="25.5" cy="24" r="1" fill="#fff" />
    </svg>
  );
}
