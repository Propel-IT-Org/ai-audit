import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runAIVisibilityProbe } from "@/lib/probe/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const probeSchema = z.object({
  businessName: z.string().trim().min(1, "Business name is required"),
  location: z.string().trim().min(1, "Location is required"),
  language: z.enum(["ja", "en"]).optional().default("en"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = probeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid input parameters", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const { businessName, location, language } = result.data;
    const audit = await runAIVisibilityProbe({ businessName, location, language });

    return NextResponse.json({
      success: true,
      audit,
    });
  } catch (error) {
    console.error("[api/probe] Error running audit:", error);
    return NextResponse.json(
      { error: "Failed to generate AI visibility audit", code: "PROBE_FAILED" },
      { status: 500 }
    );
  }
}
