import {
  pgTable,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { audits } from "./audit";

export const leads = pgTable(
  "leads",
  {
    id: text("id").primaryKey(),
    auditId: text("audit_id").references(() => audits.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    status: text("status").notNull().default("new"),
    sourceIp: text("source_ip"),
    unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("leads_audit_id_idx").on(table.auditId),
    index("leads_email_idx").on(table.email),
    index("leads_created_at_idx").on(table.createdAt),
  ]
);

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
