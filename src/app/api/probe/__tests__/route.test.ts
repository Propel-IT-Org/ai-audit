import { describe, it, expect } from "vitest";
import { POST } from "../route";
import { NextRequest } from "next/server";

describe("API Route: /api/probe", () => {
  it("should return 400 when businessName or location is missing", async () => {
    const req = new NextRequest("http://localhost:3000/api/probe", {
      method: "POST",
      body: JSON.stringify({ businessName: "" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });
});
