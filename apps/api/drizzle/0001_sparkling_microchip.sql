CREATE TABLE IF NOT EXISTS "season_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"season_id" uuid NOT NULL,
	"listing_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"applicant_name" varchar(255) NOT NULL,
	"applicant_email" varchar(255) NOT NULL,
	"applicant_phone" varchar(50),
	"weekday" integer NOT NULL,
	"start_time" varchar(10) NOT NULL,
	"end_time" varchar(10) NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"priority" integer,
	"notes" text,
	"rejection_reason" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "season_applications" ADD CONSTRAINT "season_applications_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "season_applications" ADD CONSTRAINT "season_applications_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "season_applications" ADD CONSTRAINT "season_applications_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "season_applications" ADD CONSTRAINT "season_applications_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "season_applications_tenant_idx" ON "season_applications" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "season_applications_season_idx" ON "season_applications" USING btree ("season_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "season_applications_listing_idx" ON "season_applications" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "season_applications_org_idx" ON "season_applications" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "season_applications_status_idx" ON "season_applications" USING btree ("status");