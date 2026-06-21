"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WaveLogo } from "@/components/brand/WaveLogo";

/** Only allow same-origin relative paths to avoid open-redirect abuse. */
function sanitizeNext(next: string | null): string {
  if (!next) return "/";
  // Must be a root-relative path, not a protocol-relative ("//evil.com") URL.
  if (next.startsWith("/") && !next.startsWith("//")) return next;
  return "/";
}

function SignInContent() {
  const searchParams = useSearchParams();
  const next = sanitizeNext(searchParams.get("next"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}${next}`,
      });
    } catch {
      setError("Failed to initialize Google login.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 pb-10 pt-16">
      <Card className="w-full max-w-md border border-border p-6 shadow-lg">
        <CardHeader className="space-y-2 pb-4 text-center">
          <div className="flex items-center justify-center gap-1.5">
            <WaveLogo size={26} />
            <span className="text-2xl font-bold text-foreground">AIVIBLE</span>
          </div>
          <CardTitle className="text-xl font-bold">Sign in to AIVIBLE</CardTitle>
          <p className="text-sm text-muted-foreground">
            To build and publish your AI-optimized storefront
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-start gap-2 rounded-xl border border-success/15 bg-success/5 px-4 py-3 text-xs text-success">
            <span className="font-bold">✓</span>
            <span>
              No credit card needed. Your existing website will not be changed.
              Cancel any time.
            </span>
          </div>

          {/* GOOGLE SOCIAL LOGIN */}
          <Button
            onClick={handleGoogleAuth}
            variant="outline"
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-border py-3 transition-all hover:border-accent-brand hover:shadow-sm"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
                  fill="#4285F4"
                />
                <path
                  d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.259c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
                  fill="#34A853"
                />
                <path
                  d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"
                  fill="#FBBC05"
                />
                <path
                  d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
                  fill="#EA4335"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </Button>

          {error && (
            <p className="text-center text-xs font-medium text-danger">{error}</p>
          )}

          <p className="pt-2 text-center text-xs text-muted-foreground">
            By signing in you agree to our{" "}
            <a href="#" className="text-accent-brand hover:underline">
              Terms
            </a>{" "}
            &amp;{" "}
            <a href="#" className="text-accent-brand hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-1.5 text-xl font-bold">
            <WaveLogo size={26} />
            <span>AIVIBLE</span>
          </Link>
        </div>
      </header>
      <Suspense
        fallback={
          <div className="flex min-h-[calc(100vh-120px)] items-center justify-center">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <SignInContent />
      </Suspense>
    </div>
  );
}
