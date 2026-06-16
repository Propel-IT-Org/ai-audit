"use client";

import Link from "next/link";
import { WaveLogo } from "@/components/brand/WaveLogo";

export function TopNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-1.5">
          <WaveLogo size={26} />
          <span className="text-xl font-bold text-gray-900">AIVIBLE</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-gray-500 md:flex">
          <Link href="/plan" className="transition-colors hover:text-gray-900">
            Plan
          </Link>
          <Link href="/explore" className="transition-colors hover:text-gray-900">
            Explore
          </Link>
          <Link href="/discover" className="transition-colors hover:text-gray-900">
            Discover
          </Link>
          <span className="text-gray-200">|</span>
          <Link href="/business" className="transition-colors hover:text-gray-900">
            For Businesses
          </Link>
        </nav>
      </div>
    </header>
  );
}
