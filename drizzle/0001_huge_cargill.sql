CREATE TABLE "restaurant" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name_en" text NOT NULL,
	"name_jp" text,
	"address" text,
	"ai_overview" text,
	"short_en" text,
	"short_jp" text,
	"category" text,
	"subcategory" text,
	"area" text,
	"prefecture" text,
	"region" text,
	"price" text,
	"lat" double precision,
	"lng" double precision,
	"image_url" text,
	"image_emoji" text,
	"website_url" text,
	"hidden_gem" boolean DEFAULT false,
	"audit_score" integer,
	"audit_grade" text,
	"mdx_body" text,
	"published_subdomain" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "restaurant_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "impersonated_by" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "banned" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ban_reason" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ban_expires" timestamp;--> statement-breakpoint
CREATE INDEX "restaurant_slug_idx" ON "restaurant" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "restaurant_prefecture_idx" ON "restaurant" USING btree ("prefecture");--> statement-breakpoint
CREATE INDEX "restaurant_category_idx" ON "restaurant" USING btree ("category");