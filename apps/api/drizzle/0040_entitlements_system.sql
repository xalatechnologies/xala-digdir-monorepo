CREATE TABLE IF NOT EXISTS "saas"."entitlement_audit_log" (
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
CREATE TABLE IF NOT EXISTS "saas"."global_kill_switches" (
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
CREATE TABLE IF NOT EXISTS "saas"."integration_configs" (
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
CREATE TABLE IF NOT EXISTS "saas"."nav_policies" (
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
CREATE TABLE IF NOT EXISTS "saas"."plan_entitlements" (
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
CREATE TABLE IF NOT EXISTS "saas"."route_policies" (
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
CREATE TABLE IF NOT EXISTS "saas"."tenant_entitlement_overrides" (
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
CREATE INDEX IF NOT EXISTS "entitlement_audit_tenant_idx" ON "saas"."entitlement_audit_log" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "entitlement_audit_action_idx" ON "saas"."entitlement_audit_log" USING btree ("action");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "entitlement_audit_created_at_idx" ON "saas"."entitlement_audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "entitlement_audit_correlation_idx" ON "saas"."entitlement_audit_log" USING btree ("correlation_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "kill_switches_key_type_key_idx" ON "saas"."global_kill_switches" USING btree ("key_type","key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "integration_configs_tenant_integration_idx" ON "saas"."integration_configs" USING btree ("tenant_id","integration_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "integration_configs_status_idx" ON "saas"."integration_configs" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "nav_policies_app_nav_item_idx" ON "saas"."nav_policies" USING btree ("app","nav_item_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "nav_policies_app_order_idx" ON "saas"."nav_policies" USING btree ("app","order");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "plan_entitlements_plan_key_idx" ON "saas"."plan_entitlements" USING btree ("plan_id","key_type","key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "route_policies_app_idx" ON "saas"."route_policies" USING btree ("app");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "route_policies_route_key_idx" ON "saas"."route_policies" USING btree ("route_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tenant_overrides_tenant_key_idx" ON "saas"."tenant_entitlement_overrides" USING btree ("tenant_id","key_type","key");