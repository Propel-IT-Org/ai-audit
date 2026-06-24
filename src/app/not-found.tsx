import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <Image
        src="/mockups/traveler-journey/illustrations/not-found.webp"
        alt="Shirube pointing a lost traveler back home"
        width={320}
        height={320}
        className="h-56 w-auto"
        priority
      />
      <p className="av-eyebrow mt-6">Error 404</p>
      <h1 className="mt-1 text-3xl font-extrabold text-foreground">
        This path leads nowhere
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        The page you&apos;re looking for moved or never existed. Shirube will
        point you back to the start.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-kon2 px-5 py-2.5 font-bold text-white transition-colors hover:bg-kon"
      >
        ← Back home
      </Link>
    </section>
  );
}
