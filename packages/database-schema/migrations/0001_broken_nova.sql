CREATE SCHEMA "compliance";
--> statement-breakpoint
CREATE SCHEMA "domain";
--> statement-breakpoint
CREATE SCHEMA "monitoring";
--> statement-breakpoint
CREATE SCHEMA "platform";
--> statement-breakpoint
CREATE SCHEMA "saas";
--> statement-breakpoint
CREATE TABLE "platform"."tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"domain" varchar(255),
	"settings" jsonb DEFAULT '{}'::jsonb,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"subscription_plan_id" uuid,
	"license_key_hash" text,
	"license_key_rotated_at" timestamp,
	"seat_limits" jsonb DEFAULT '{"maxUsers":5,"maxOrganizations":1,"maxListings":10,"maxBookingsPerMonth":100,"maxStorageMb":500}'::jsonb,
	"branding_version_id" uuid,
	"feature_flags" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"enabled_rental_object_categories" text[] DEFAULT '{"LOCALE","ARRANGEMENT"}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "platform"."organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"type" varchar(50) DEFAULT 'other' NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"external_org_id" varchar(50),
	"source" varchar(50) DEFAULT 'manual',
	"last_synced_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"organization_id" uuid,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"national_id" varchar(11),
	"role" varchar(50) DEFAULT 'member' NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"demo_token" varchar(100),
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_login_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "domain"."rental_objects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"organization_id" uuid,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"category_key" varchar(50) DEFAULT 'LOKALER_OG_BANER' NOT NULL,
	"time_mode" varchar(20) DEFAULT 'PERIOD' NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"rule_set_key" varchar(50),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"requires_approval" boolean DEFAULT false NOT NULL,
	"capacity" integer,
	"inventory_total" integer,
	"images" jsonb DEFAULT '[]'::jsonb,
	"pricing" jsonb DEFAULT '{}'::jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "domain"."bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"rental_object_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"total_price" numeric(10, 2) DEFAULT '0',
	"currency" varchar(3) DEFAULT 'NOK' NOT NULL,
	"notes" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform"."sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"refresh_token_hash" text NOT NULL,
	"access_token_jti" text,
	"user_agent" text,
	"ip_address" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_refreshed_at" timestamp,
	"expires_at" timestamp NOT NULL,
	"revoked_at" timestamp,
	"revoked_reason" text,
	CONSTRAINT "sessions_refresh_token_hash_unique" UNIQUE("refresh_token_hash")
);
--> statement-breakpoint
CREATE TABLE "domain"."access_grants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"org_id" uuid NOT NULL,
	"rental_object_id" uuid NOT NULL,
	"granted_by" uuid NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"valid_from" timestamp,
	"valid_until" timestamp,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform"."case_handler_scopes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"scope_type" varchar(50) NOT NULL,
	"rental_object_id" uuid,
	"assigned_by" uuid,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform"."org_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"org_id" uuid NOT NULL,
	"org_role" varchar(50) DEFAULT 'member' NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform"."permission_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"rental_object_id" uuid NOT NULL,
	"permissions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"assigned_by" uuid,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "compliance"."audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"user_id" uuid,
	"action" varchar(100) NOT NULL,
	"resource" varchar(100) NOT NULL,
	"resource_id" varchar(255),
	"severity" varchar(20) DEFAULT 'info' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "platform"."organizations" ADD CONSTRAINT "organizations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "platform"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform"."users" ADD CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "platform"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform"."users" ADD CONSTRAINT "users_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "platform"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain"."rental_objects" ADD CONSTRAINT "rental_objects_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "platform"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain"."rental_objects" ADD CONSTRAINT "rental_objects_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "platform"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain"."bookings" ADD CONSTRAINT "bookings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "platform"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain"."bookings" ADD CONSTRAINT "bookings_rental_object_id_rental_objects_id_fk" FOREIGN KEY ("rental_object_id") REFERENCES "domain"."rental_objects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain"."bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "platform"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform"."sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "platform"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform"."sessions" ADD CONSTRAINT "sessions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "platform"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain"."access_grants" ADD CONSTRAINT "access_grants_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "platform"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain"."access_grants" ADD CONSTRAINT "access_grants_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "platform"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain"."access_grants" ADD CONSTRAINT "access_grants_rental_object_id_rental_objects_id_fk" FOREIGN KEY ("rental_object_id") REFERENCES "domain"."rental_objects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain"."access_grants" ADD CONSTRAINT "access_grants_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "platform"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform"."case_handler_scopes" ADD CONSTRAINT "case_handler_scopes_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "platform"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform"."case_handler_scopes" ADD CONSTRAINT "case_handler_scopes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "platform"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform"."case_handler_scopes" ADD CONSTRAINT "case_handler_scopes_rental_object_id_rental_objects_id_fk" FOREIGN KEY ("rental_object_id") REFERENCES "domain"."rental_objects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform"."case_handler_scopes" ADD CONSTRAINT "case_handler_scopes_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "platform"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform"."org_memberships" ADD CONSTRAINT "org_memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "platform"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform"."org_memberships" ADD CONSTRAINT "org_memberships_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "platform"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform"."permission_assignments" ADD CONSTRAINT "permission_assignments_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "platform"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform"."permission_assignments" ADD CONSTRAINT "permission_assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "platform"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform"."permission_assignments" ADD CONSTRAINT "permission_assignments_rental_object_id_rental_objects_id_fk" FOREIGN KEY ("rental_object_id") REFERENCES "domain"."rental_objects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform"."permission_assignments" ADD CONSTRAINT "permission_assignments_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "platform"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance"."audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "platform"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance"."audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "platform"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tenants_slug_idx" ON "platform"."tenants" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "tenants_status_idx" ON "platform"."tenants" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tenants_subscription_plan_idx" ON "platform"."tenants" USING btree ("subscription_plan_id");--> statement-breakpoint
CREATE INDEX "orgs_tenant_idx" ON "platform"."organizations" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "orgs_slug_idx" ON "platform"."organizations" USING btree ("tenant_id","slug");--> statement-breakpoint
CREATE INDEX "orgs_external_org_idx" ON "platform"."organizations" USING btree ("external_org_id");--> statement-breakpoint
CREATE INDEX "users_tenant_email_idx" ON "platform"."users" USING btree ("tenant_id","email");--> statement-breakpoint
CREATE INDEX "users_tenant_idx" ON "platform"."users" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "users_national_id_idx" ON "platform"."users" USING btree ("national_id");--> statement-breakpoint
CREATE INDEX "users_demo_token_idx" ON "platform"."users" USING btree ("demo_token");--> statement-breakpoint
CREATE INDEX "rental_objects_tenant_idx" ON "domain"."rental_objects" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "rental_objects_category_key_idx" ON "domain"."rental_objects" USING btree ("category_key");--> statement-breakpoint
CREATE INDEX "rental_objects_time_mode_idx" ON "domain"."rental_objects" USING btree ("time_mode");--> statement-breakpoint
CREATE INDEX "rental_objects_status_idx" ON "domain"."rental_objects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "rental_objects_slug_idx" ON "domain"."rental_objects" USING btree ("tenant_id","slug");--> statement-breakpoint
CREATE INDEX "bookings_tenant_idx" ON "domain"."bookings" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "bookings_rental_object_idx" ON "domain"."bookings" USING btree ("rental_object_id");--> statement-breakpoint
CREATE INDEX "bookings_user_idx" ON "domain"."bookings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "bookings_status_idx" ON "domain"."bookings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "platform"."sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_tenant_idx" ON "platform"."sessions" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "sessions_refresh_token_hash_idx" ON "platform"."sessions" USING btree ("refresh_token_hash");--> statement-breakpoint
CREATE INDEX "sessions_expires_at_idx" ON "platform"."sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "sessions_user_tenant_idx" ON "platform"."sessions" USING btree ("user_id","tenant_id");--> statement-breakpoint
CREATE INDEX "access_grants_tenant_idx" ON "domain"."access_grants" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "access_grants_org_idx" ON "domain"."access_grants" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "access_grants_rental_object_idx" ON "domain"."access_grants" USING btree ("rental_object_id");--> statement-breakpoint
CREATE INDEX "access_grants_org_rental_object_idx" ON "domain"."access_grants" USING btree ("org_id","rental_object_id");--> statement-breakpoint
CREATE INDEX "case_handler_scopes_tenant_idx" ON "platform"."case_handler_scopes" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "case_handler_scopes_user_idx" ON "platform"."case_handler_scopes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "case_handler_scopes_scope_type_idx" ON "platform"."case_handler_scopes" USING btree ("scope_type");--> statement-breakpoint
CREATE INDEX "case_handler_scopes_rental_object_idx" ON "platform"."case_handler_scopes" USING btree ("rental_object_id");--> statement-breakpoint
CREATE INDEX "case_handler_scopes_user_scope_idx" ON "platform"."case_handler_scopes" USING btree ("user_id","scope_type","rental_object_id");--> statement-breakpoint
CREATE INDEX "org_memberships_user_idx" ON "platform"."org_memberships" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "org_memberships_org_idx" ON "platform"."org_memberships" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "org_memberships_user_org_idx" ON "platform"."org_memberships" USING btree ("user_id","org_id");--> statement-breakpoint
CREATE INDEX "permission_assignments_org_idx" ON "platform"."permission_assignments" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "permission_assignments_user_idx" ON "platform"."permission_assignments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "permission_assignments_rental_object_idx" ON "platform"."permission_assignments" USING btree ("rental_object_id");--> statement-breakpoint
CREATE INDEX "permission_assignments_org_user_rental_object_idx" ON "platform"."permission_assignments" USING btree ("org_id","user_id","rental_object_id");--> statement-breakpoint
CREATE INDEX "audit_logs_tenant_idx" ON "compliance"."audit_logs" USING btree ("tenant_id","timestamp");--> statement-breakpoint
CREATE INDEX "audit_logs_resource_idx" ON "compliance"."audit_logs" USING btree ("resource","resource_id");