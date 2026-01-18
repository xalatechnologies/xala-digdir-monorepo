-- Migration: 0039_rental_object_custody
-- Rental Object Custody & Delegation Hierarchy

-- 1) Main custody grants table
CREATE TABLE IF NOT EXISTS "domain"."rental_object_custody_grants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"rental_object_id" uuid NOT NULL,
	"grantee_type" varchar(20) NOT NULL, -- 'USER' | 'ORG'
	"grantee_id" uuid NOT NULL,
	"scopes" text[] DEFAULT '{}' NOT NULL,
	"can_subdelegate" boolean DEFAULT false NOT NULL,
	"effective_from" timestamptz,
	"effective_to" timestamptz,
	"reason" text,
	"status" varchar(20) DEFAULT 'ACTIVE' NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"created_at" timestamptz DEFAULT now() NOT NULL,
	"updated_at" timestamptz DEFAULT now() NOT NULL,
	"revoked_at" timestamptz,
	"revoked_by_user_id" uuid
);

-- 2) Subgrants table for organization members
CREATE TABLE IF NOT EXISTS "domain"."rental_object_custody_subgrants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"parent_grant_id" uuid NOT NULL,
	"org_id" uuid NOT NULL,
	"member_user_id" uuid NOT NULL,
	"scopes" text[] DEFAULT '{}' NOT NULL,
	"effective_from" timestamptz,
	"effective_to" timestamptz,
	"status" varchar(20) DEFAULT 'ACTIVE' NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"created_at" timestamptz DEFAULT now() NOT NULL,
	"updated_at" timestamptz DEFAULT now() NOT NULL
);

-- 3) Indices
CREATE INDEX IF NOT EXISTS "ro_custody_grants_tenant_idx" ON "domain"."rental_object_custody_grants" ("tenant_id");
CREATE INDEX IF NOT EXISTS "ro_custody_grants_ro_idx" ON "domain"."rental_object_custody_grants" ("rental_object_id");
CREATE INDEX IF NOT EXISTS "ro_custody_grants_grantee_idx" ON "domain"."rental_object_custody_grants" ("grantee_type", "grantee_id");
CREATE UNIQUE INDEX IF NOT EXISTS "ro_custody_grants_unique_active" ON "domain"."rental_object_custody_grants" ("tenant_id", "rental_object_id", "grantee_type", "grantee_id");

CREATE INDEX IF NOT EXISTS "ro_custody_subgrants_tenant_idx" ON "domain"."rental_object_custody_subgrants" ("tenant_id");
CREATE INDEX IF NOT EXISTS "ro_custody_subgrants_parent_idx" ON "domain"."rental_object_custody_subgrants" ("parent_grant_id");
CREATE INDEX IF NOT EXISTS "ro_custody_subgrants_member_idx" ON "domain"."rental_object_custody_subgrants" ("member_user_id");
CREATE INDEX IF NOT EXISTS "ro_custody_subgrants_org_idx" ON "domain"."rental_object_custody_subgrants" ("org_id");

-- 4) Foreign Keys
DO $$ BEGIN
 ALTER TABLE "domain"."rental_object_custody_grants" ADD CONSTRAINT "ro_custody_grants_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "platform"."tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "domain"."rental_object_custody_grants" ADD CONSTRAINT "ro_custody_grants_rental_object_id_rental_objects_id_fk" FOREIGN KEY ("rental_object_id") REFERENCES "domain"."rental_objects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "domain"."rental_object_custody_grants" ADD CONSTRAINT "ro_custody_grants_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "platform"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "domain"."rental_object_custody_grants" ADD CONSTRAINT "ro_custody_grants_revoked_by_user_id_users_id_fk" FOREIGN KEY ("revoked_by_user_id") REFERENCES "platform"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "domain"."rental_object_custody_subgrants" ADD CONSTRAINT "ro_custody_subgrants_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "platform"."tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "domain"."rental_object_custody_subgrants" ADD CONSTRAINT "ro_custody_subgrants_parent_grant_id_ro_custody_grants_id_fk" FOREIGN KEY ("parent_grant_id") REFERENCES "domain"."rental_object_custody_grants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "domain"."rental_object_custody_subgrants" ADD CONSTRAINT "ro_custody_subgrants_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "platform"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "domain"."rental_object_custody_subgrants" ADD CONSTRAINT "ro_custody_subgrants_member_user_id_users_id_fk" FOREIGN KEY ("member_user_id") REFERENCES "platform"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "domain"."rental_object_custody_subgrants" ADD CONSTRAINT "ro_custody_subgrants_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "platform"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
