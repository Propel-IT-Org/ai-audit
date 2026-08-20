import { describe, it, expect } from "vitest";
import { POST } from "../route";
import { NextRequest } from "next/server";

describe("API Route: /api/leads/unlock", () => {
  it("should return 400 when email is invalid", async () => {
    const req = new NextRequest("http://localhost:3000/api/leads/unlock", {
      method: "POST",
      body: JSON.stringify({ auditId: "aud_123", email: "not-an-email" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("should return 400 when auditId is missing", async () => {
    const req = new NextRequest("http://localhost:3000/api/leads/unlock", {
      method: "POST",
      body: JSON.stringify({ email: "owner@tanaka.jp" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });
});
