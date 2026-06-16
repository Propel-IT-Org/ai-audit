import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";

export default function TravelerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <TopNav />
      <main className="flex-1">
        {children}
      </main>
      {/* spacer so fixed bottom nav never overlaps page content */}
      <div aria-hidden="true" className="h-20 flex-shrink-0" />
      <BottomNav />
    </div>
  );
}
