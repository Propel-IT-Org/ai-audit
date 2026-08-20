import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { audits } from "@/lib/db/schema/audit";
import { eq } from "drizzle-orm";
import { SmeScoreAuditor } from "@/components/probe/SmeScoreAuditor";
import { TopNav } from "@/components/layout/TopNav";

export const dynamic = "force-dynamic";

interface ReportPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { id } = await params;
  const audit = await db.query.audits.findFirst({
    where: eq(audits.id, id),
  });

  if (!audit) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <TopNav />
      <main className="py-8">
        <SmeScoreAuditor initialAudit={audit} />
      </main>
    </div>
  );
}
