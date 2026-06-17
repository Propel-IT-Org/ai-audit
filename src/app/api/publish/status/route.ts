import { NextRequest } from "next/server";
import { readRunStatus } from "@/lib/workflow/status-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Poll a publish run's status. Used by the generate UI after it resumes a
 * suspended (customization) run — once the workflow suspends, the original
 * SSE stream is gone, so completion is observed by polling the durable status.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const runId = searchParams.get("runId");
  if (!runId) {
    return Response.json(
      { error: "Missing runId parameter", code: "BAD_REQUEST" },
      { status: 400 },
    );
  }

  const status = await readRunStatus("publish", runId);
  if (!status) {
    return Response.json(
      { error: "Run not found", code: "NOT_FOUND" },
      { status: 404 },
    );
  }
  return Response.json(status);
}
