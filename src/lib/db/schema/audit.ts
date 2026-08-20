import {
  pgTable,
  text,
  integer,
  timestamp,
  index,
  jsonb,
} from "drizzle-orm/pg-core";

export interface AuditDimension {
  name: string;
  score: number; // 0-100 or 0-25
  grade: string;
  status: "good" | "warning" | "critical";
  summary: string;
  details: string[];
}

export interface HallucinationItem {
  claim: string;
  reality?: string;
  severity: "high" | "medium" | "low";
}

export interface ActionItem {
  priority: number;
  title: string;
  description: string;
  estimatedImpact: string;
}

export const audits = pgTable(
  "audits",
  {
    id: text("id").primaryKey(),
    businessName: text("business_name").notNull(),
    location: text("location").notNull(),
    entityType: text("entity_type").default("general"),
    overallScore: integer("overall_score").notNull(),
    grade: text("grade").notNull(),
    teaserSummary: text("teaser_summary"),
    dimensions: jsonb("dimensions").$type<Record<string, AuditDimension>>().notNull(),
    hallucinations: jsonb("hallucinations").$type<HallucinationItem[]>().default([]),
    actionItems: jsonb("action_items").$type<ActionItem[]>().default([]),
    reportPayload: jsonb("report_payload").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("audits_business_name_idx").on(table.businessName),
    index("audits_location_idx").on(table.location),
    index("audits_created_at_idx").on(table.createdAt),
  ]
);

export type Audit = typeof audits.$inferSelect;
export type NewAudit = typeof audits.$inferInsert;
