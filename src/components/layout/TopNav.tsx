"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { WaveLogo } from "@/components/brand/WaveLogo";
import { useSession, signOut } from "@/lib/auth-client";

export function TopNav() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-1.5">
          <WaveLogo size={26} />
          <span className="text-xl font-bold text-gray-900">AIVIBLE</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-gray-600 md:flex">
          <Link href="/" className="font-semibold text-gray-900 transition-colors hover:text-accent-brand">
            AI Scoring Tool
          </Link>
          <Link href="/business" className="transition-colors hover:text-gray-900">
            Why GEO Matters
          </Link>
          <Link href="/storefronts" className="transition-colors hover:text-gray-900">
            Storefronts
          </Link>
          <span className="text-gray-200">|</span>
          {isPending ? null : session ? (
            <div className="flex items-center gap-3">
              <span className="max-w-48 truncate text-gray-700 font-medium">
                {session.user.name || session.user.email}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-xs font-semibold text-gray-500 hover:text-gray-900"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/signin"
              className="font-semibold text-gray-900 transition-colors hover:text-accent-brand"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
