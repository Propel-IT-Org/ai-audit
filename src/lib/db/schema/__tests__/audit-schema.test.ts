import { describe, it, expect } from "vitest";
import { audits } from "../audit";
import { leads } from "../lead";
import { getTableColumns } from "drizzle-orm";

describe("Database Schemas: Audits & Leads", () => {
  it("should have correct column definitions for audits table", () => {
    const columns = getTableColumns(audits);

    expect(columns.id).toBeDefined();
    expect(columns.businessName).toBeDefined();
    expect(columns.location).toBeDefined();
    expect(columns.overallScore).toBeDefined();
    expect(columns.grade).toBeDefined();
    expect(columns.dimensions).toBeDefined();
    expect(columns.hallucinations).toBeDefined();
    expect(columns.actionItems).toBeDefined();
    expect(columns.reportPayload).toBeDefined();
    expect(columns.createdAt).toBeDefined();
  });

  it("should have correct column definitions for leads table", () => {
    const columns = getTableColumns(leads);

    expect(columns.id).toBeDefined();
    expect(columns.auditId).toBeDefined();
    expect(columns.email).toBeDefined();
    expect(columns.status).toBeDefined();
    expect(columns.createdAt).toBeDefined();
  });
});
