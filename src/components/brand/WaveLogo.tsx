import Image from "next/image";

interface WaveLogoProps {
  size?: number;
  className?: string;
}

export function WaveLogo({ size = 26, className }: WaveLogoProps) {
  return (
    <Image
      src="/shirube-logo.webp"
      alt="Shirube"
      width={size}
      height={size}
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", flex: "none" }}
    />
  );
}
