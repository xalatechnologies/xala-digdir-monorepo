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
CREATE TABLE "domain"."allocations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"rental_object_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"status" varchar(50) DEFAULT 'confirmed' NOT NULL,
	"booking_id" uuid,
	"user_id" uuid,
	"notes" text,
	"recurring" jsonb DEFAULT '{}'::jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "domain"."blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"rental_object_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"reason" text,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"all_day" boolean DEFAULT false NOT NULL,
	"recurring" boolean DEFAULT false NOT NULL,
	"recurrence_rule" text,
	"visibility" varchar(20) DEFAULT 'public' NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "domain"."seasonal_leases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"rental_object_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"weekdays" jsonb DEFAULT '[]'::jsonb,
	"start_time" varchar(10) NOT NULL,
	"end_time" varchar(10) NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
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
CREATE TABLE "saas"."entitlement_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"action" varchar(100) NOT NULL,
	"key_type" varchar(50),
	"key" varchar(100),
	"before" jsonb,
	"after" jsonb,
	"actor_id" uuid,
	"actor_type" varchar(50),
	"correlation_id" uuid,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saas"."global_kill_switches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key_type" varchar(50) NOT NULL,
	"key" varchar(100) NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"reason" text NOT NULL,
	"environment" varchar(50),
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "kill_switches_key_type_key_env_unique" UNIQUE("key_type","key","environment")
);
--> statement-breakpoint
CREATE TABLE "saas"."integration_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"integration_key" varchar(100) NOT NULL,
	"config_json" jsonb NOT NULL,
	"status" varchar(50) DEFAULT 'MISSING' NOT NULL,
	"last_validated_at" timestamp,
	"validation_error" text,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "integration_configs_tenant_integration_unique" UNIQUE("tenant_id","integration_key")
);
--> statement-breakpoint
CREATE TABLE "saas"."nav_policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app" varchar(50) NOT NULL,
	"nav_item_key" varchar(200) NOT NULL,
	"route_key" varchar(200),
	"required_roles" jsonb DEFAULT '[]' NOT NULL,
	"required_modules" jsonb DEFAULT '[]' NOT NULL,
	"required_features" jsonb DEFAULT '[]' NOT NULL,
	"label_key" varchar(200) NOT NULL,
	"icon_key" varchar(100),
	"parent_key" varchar(200),
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "nav_policies_app_nav_item_unique" UNIQUE("app","nav_item_key")
);
--> statement-breakpoint
CREATE TABLE "saas"."plan_entitlements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"key_type" varchar(50) NOT NULL,
	"key" varchar(100) NOT NULL,
	"default_enabled" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "plan_entitlements_plan_key_unique" UNIQUE("plan_id","key_type","key")
);
--> statement-breakpoint
CREATE TABLE "saas"."plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"display_name" varchar(100) NOT NULL,
	"description" text,
	"price_monthly" integer DEFAULT 0 NOT NULL,
	"price_yearly" integer DEFAULT 0 NOT NULL,
	"max_users" integer,
	"max_listings" integer,
	"features" jsonb DEFAULT '[]' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "plans_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "saas"."route_policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app" varchar(50) NOT NULL,
	"route_key" varchar(200) NOT NULL,
	"required_roles" jsonb DEFAULT '[]' NOT NULL,
	"required_modules" jsonb DEFAULT '[]' NOT NULL,
	"required_features" jsonb DEFAULT '[]' NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "route_policies_route_key_unique" UNIQUE("route_key")
);
--> statement-breakpoint
CREATE TABLE "saas"."tenant_entitlement_overrides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"key_type" varchar(50) NOT NULL,
	"key" varchar(100) NOT NULL,
	"enabled" boolean NOT NULL,
	"reason" text,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tenant_overrides_tenant_key_unique" UNIQUE("tenant_id","key_type","key")
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
ALTER TABLE "domain"."allocations" ADD CONSTRAINT "allocations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "platform"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain"."allocations" ADD CONSTRAINT "allocations_rental_object_id_rental_objects_id_fk" FOREIGN KEY ("rental_object_id") REFERENCES "domain"."rental_objects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain"."allocations" ADD CONSTRAINT "allocations_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "domain"."bookings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain"."allocations" ADD CONSTRAINT "allocations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "platform"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain"."blocks" ADD CONSTRAINT "blocks_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "platform"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain"."blocks" ADD CONSTRAINT "blocks_rental_object_id_rental_objects_id_fk" FOREIGN KEY ("rental_object_id") REFERENCES "domain"."rental_objects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain"."blocks" ADD CONSTRAINT "blocks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "platform"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain"."seasonal_leases" ADD CONSTRAINT "seasonal_leases_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "platform"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain"."seasonal_leases" ADD CONSTRAINT "seasonal_leases_rental_object_id_rental_objects_id_fk" FOREIGN KEY ("rental_object_id") REFERENCES "domain"."rental_objects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain"."seasonal_leases" ADD CONSTRAINT "seasonal_leases_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "platform"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "platform"."translations" ADD CONSTRAINT "translations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "platform"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas"."plan_entitlements" ADD CONSTRAINT "plan_entitlements_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "saas"."plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
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
CREATE INDEX "allocations_tenant_idx" ON "domain"."allocations" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "allocations_rental_object_idx" ON "domain"."allocations" USING btree ("rental_object_id");--> statement-breakpoint
CREATE INDEX "allocations_time_idx" ON "domain"."allocations" USING btree ("start_time","end_time");--> statement-breakpoint
CREATE INDEX "blocks_tenant_idx" ON "domain"."blocks" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "blocks_rental_object_idx" ON "domain"."blocks" USING btree ("rental_object_id");--> statement-breakpoint
CREATE INDEX "blocks_time_range_idx" ON "domain"."blocks" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE INDEX "blocks_status_idx" ON "domain"."blocks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "seasonal_leases_tenant_idx" ON "domain"."seasonal_leases" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "seasonal_leases_rental_object_idx" ON "domain"."seasonal_leases" USING btree ("rental_object_id");--> statement-breakpoint
CREATE INDEX "seasonal_leases_org_idx" ON "domain"."seasonal_leases" USING btree ("organization_id");--> statement-breakpoint
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
CREATE UNIQUE INDEX "translations_unique_idx" ON "platform"."translations" USING btree ("tenant_id","namespace","key","language");--> statement-breakpoint
CREATE INDEX "translations_namespace_idx" ON "platform"."translations" USING btree ("namespace");--> statement-breakpoint
CREATE INDEX "translations_language_idx" ON "platform"."translations" USING btree ("language");--> statement-breakpoint
CREATE INDEX "translations_tenant_idx" ON "platform"."translations" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "translations_key_idx" ON "platform"."translations" USING btree ("key");--> statement-breakpoint
CREATE INDEX "translations_lookup_idx" ON "platform"."translations" USING btree ("namespace","language");--> statement-breakpoint
CREATE INDEX "entitlement_audit_tenant_idx" ON "saas"."entitlement_audit_log" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "entitlement_audit_action_idx" ON "saas"."entitlement_audit_log" USING btree ("action");--> statement-breakpoint
CREATE INDEX "entitlement_audit_created_at_idx" ON "saas"."entitlement_audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "entitlement_audit_correlation_idx" ON "saas"."entitlement_audit_log" USING btree ("correlation_id");--> statement-breakpoint
CREATE INDEX "kill_switches_key_type_key_idx" ON "saas"."global_kill_switches" USING btree ("key_type","key");--> statement-breakpoint
CREATE INDEX "integration_configs_tenant_integration_idx" ON "saas"."integration_configs" USING btree ("tenant_id","integration_key");--> statement-breakpoint
CREATE INDEX "integration_configs_status_idx" ON "saas"."integration_configs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "nav_policies_app_nav_item_idx" ON "saas"."nav_policies" USING btree ("app","nav_item_key");--> statement-breakpoint
CREATE INDEX "nav_policies_app_order_idx" ON "saas"."nav_policies" USING btree ("app","order");--> statement-breakpoint
CREATE INDEX "plan_entitlements_plan_key_idx" ON "saas"."plan_entitlements" USING btree ("plan_id","key_type","key");--> statement-breakpoint
CREATE INDEX "plans_name_idx" ON "saas"."plans" USING btree ("name");--> statement-breakpoint
CREATE INDEX "plans_is_active_idx" ON "saas"."plans" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "plans_sort_order_idx" ON "saas"."plans" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "route_policies_app_idx" ON "saas"."route_policies" USING btree ("app");--> statement-breakpoint
CREATE INDEX "route_policies_route_key_idx" ON "saas"."route_policies" USING btree ("route_key");--> statement-breakpoint
CREATE INDEX "tenant_overrides_tenant_key_idx" ON "saas"."tenant_entitlement_overrides" USING btree ("tenant_id","key_type","key");--> statement-breakpoint
CREATE INDEX "audit_logs_tenant_idx" ON "compliance"."audit_logs" USING btree ("tenant_id","timestamp");--> statement-breakpoint
CREATE INDEX "audit_logs_resource_idx" ON "compliance"."audit_logs" USING btree ("resource","resource_id");