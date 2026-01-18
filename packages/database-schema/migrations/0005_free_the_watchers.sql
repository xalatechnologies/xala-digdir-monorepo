CREATE TABLE "platform"."translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"namespace" varchar(50) NOT NULL,
	"key" varchar(100) NOT NULL,
	"language" varchar(10) NOT NULL,
	"value" text NOT NULL,
	"is_system_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
ALTER TABLE "platform"."translations" ADD CONSTRAINT "translations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "platform"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "translations_unique_idx" ON "platform"."translations" USING btree ("tenant_id","namespace","key","language");--> statement-breakpoint
CREATE INDEX "translations_namespace_idx" ON "platform"."translations" USING btree ("namespace");--> statement-breakpoint
CREATE INDEX "translations_language_idx" ON "platform"."translations" USING btree ("language");--> statement-breakpoint
CREATE INDEX "translations_tenant_idx" ON "platform"."translations" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "translations_key_idx" ON "platform"."translations" USING btree ("key");--> statement-breakpoint
CREATE INDEX "translations_lookup_idx" ON "platform"."translations" USING btree ("namespace","language");