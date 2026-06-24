"use client";

import Image from "next/image";
import Link from "next/link";

interface ComingSoonProps {
  title?: string;
}

export function ComingSoon({ title = "Coming soon" }: ComingSoonProps) {
  return (
    <section className="flex flex-col items-center justify-center px-4 py-20 text-center">
      <Image
        src="/shirube-character-full.webp"
        alt="Shirube"
        width={120}
        height={120}
        className="mb-4 h-28 w-auto"
        priority
      />
      <h1 className="text-2xl font-extrabold text-gray-900">{title}</h1>
      <p className="mt-2 max-w-sm text-sm text-gray-500">
        This feature is being built by the AIVIBLE team.
      </p>
      <p className="mt-1 text-xs text-gray-400">Coming soon</p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-kon2 px-5 py-2.5 font-bold text-white transition-colors hover:bg-kon"
      >
        ← Home
      </Link>
    </section>
  );
}
