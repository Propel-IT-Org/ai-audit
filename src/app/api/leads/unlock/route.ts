import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { leads } from "@/lib/db/schema/lead";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const unlockSchema = z.object({
  auditId: z.string().min(1, "Audit ID is required"),
  email: z.string().email("Please enter a valid email address"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = unlockSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid email format", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const { auditId, email } = result.data;
    const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const leadId = `lead_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;

    const [saved] = await db
      .insert(leads)
      .values({
        id: leadId,
        auditId,
        email,
        sourceIp: clientIp,
        status: "new",
      })
      .returning();

    return NextResponse.json({
      success: true,
      leadId: saved.id,
    });
  } catch (error) {
    console.error("[api/leads/unlock] Error capturing lead:", error);
    return NextResponse.json(
      { error: "Failed to record lead", code: "LEAD_CAPTURE_FAILED" },
      { status: 500 }
    );
  }
}
