"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { TravelerMapIcon, NorenIcon } from "@/components/icons";

function Point({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2">
      <Check className="h-4 w-4 flex-none text-kon2" aria-hidden="true" />
      <span>{text}</span>
    </li>
  );
}

export default function FrontDoorPage() {
  return (
    <section className="hero-map relative px-4 py-12 md:py-16">
      <div className="relative mx-auto w-full max-w-6xl">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div className="text-center md:text-left">
            <p className="av-eyebrow mb-2">Japan&apos;s AI visibility layer</p>
            <h1 className="text-3xl font-extrabold leading-tight text-white md:text-5xl">
              Travelers ask AI. We make sure Japan&apos;s best places get recommended.
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm text-indigo-100/80 md:mx-0 md:text-base">
              Plan a Japan trip with verified local gems — or make your business one of the places AI recommends.
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero-a.webp"
              alt="Japan AI visibility"
              width={1672}
              height={941}
              className="h-auto w-full"
            />
          </div>
        </div>

        <div className="mt-10 grid gap-5 text-left md:grid-cols-2">
          <Link
            href="/plan"
            className="group flex flex-col rounded-2xl bg-white p-6 shadow-2xl transition-transform hover:-translate-y-1"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-light">
                <TravelerMapIcon size={28} />
              </span>
              <div>
                <div className="av-eyebrow">For travelers</div>
                <h2 className="text-xl font-extrabold text-gray-900">Plan a trip to Japan</h2>
              </div>
            </div>
            <p className="mt-3 flex-1 text-sm text-gray-500">
              Search what you want to experience, build an AI-assisted itinerary, and discover verified local gems English-only search hides.
            </p>
            <ul className="mt-4 space-y-1.5 text-[13px] text-gray-600">
              <Point text="AI itinerary planner (chat with Aivy)" />
              <Point text="Verified hidden gems on a live map" />
              <Point text="Bilingual JP + EN search" />
            </ul>
            <span className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-kon2 px-6 py-3 font-bold text-white transition-colors group-hover:bg-kon">
              Start planning →
            </span>
          </Link>

          <Link
            href="/business"
            className="group flex flex-col rounded-2xl bg-white p-6 shadow-2xl transition-transform hover:-translate-y-1"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-paper">
                <NorenIcon size={28} />
              </span>
              <div>
                <div className="av-eyebrow">For businesses</div>
                <h2 className="text-xl font-extrabold text-gray-900">Make your business AI-visible</h2>
              </div>
            </div>
            <p className="mt-3 flex-1 text-sm text-gray-500">
              See how ChatGPT, Gemini and Perplexity see your business today — then let AI build you a site their travelers can actually find.
            </p>
            <ul className="mt-4 space-y-1.5 text-[13px] text-gray-600">
              <Point text="Free AI-visibility audit (30 seconds)" />
              <Point text="AI builds & refines your site" />
              <Point text="Get recommended in AI itineraries" />
            </ul>
            <span className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-kon2 px-6 py-3 font-bold text-kon2 transition-colors group-hover:bg-kon2 group-hover:text-white">
              Check my business →
            </span>
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-indigo-100/70">
          The two sides connect: travelers&apos; AI itineraries fill with the businesses we make visible.
        </p>
      </div>
    </section>
  );
}
