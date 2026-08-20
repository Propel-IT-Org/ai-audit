CREATE TABLE "audits" (
	"id" text PRIMARY KEY NOT NULL,
	"business_name" text NOT NULL,
	"location" text NOT NULL,
	"entity_type" text DEFAULT 'general',
	"overall_score" integer NOT NULL,
	"grade" text NOT NULL,
	"teaser_summary" text,
	"dimensions" jsonb NOT NULL,
	"hallucinations" jsonb DEFAULT '[]'::jsonb,
	"action_items" jsonb DEFAULT '[]'::jsonb,
	"report_payload" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" text PRIMARY KEY NOT NULL,
	"audit_id" text,
	"email" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"source_ip" text,
	"unlocked_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_audit_id_audits_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."audits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audits_business_name_idx" ON "audits" USING btree ("business_name");--> statement-breakpoint
CREATE INDEX "audits_location_idx" ON "audits" USING btree ("location");--> statement-breakpoint
CREATE INDEX "audits_created_at_idx" ON "audits" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "leads_audit_id_idx" ON "leads" USING btree ("audit_id");--> statement-breakpoint
CREATE INDEX "leads_email_idx" ON "leads" USING btree ("email");--> statement-breakpoint
CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");