import { TopNav } from "@/components/layout/TopNav";

export default function SmeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <TopNav />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
