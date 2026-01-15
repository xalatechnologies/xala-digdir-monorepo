-- GDPR Consent System Migration
-- Created: 2026-01-15
-- Description: Adds comprehensive GDPR consent management system including:
--   - Consent types with versioning
--   - User consent tracking
--   - Consent audit log (Article 30 compliance)
--   - Data processing records
--   - Data subject requests (access, erasure, portability, etc.)

-- ============================================================================
-- 1. Consent Types Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS "consent_types" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "description" text NOT NULL,
  "required" boolean DEFAULT false NOT NULL,
  "legal_basis" text NOT NULL,
  "version" integer DEFAULT 1 NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- ============================================================================
-- 2. User Consents Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS "user_consents" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "consent_type_id" uuid NOT NULL,
  "granted" boolean NOT NULL,
  "version" integer NOT NULL,
  "ip_address" text,
  "user_agent" text,
  "source" text NOT NULL,
  "expires_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- ============================================================================
-- 3. Consent Audit Log Table (GDPR Article 30)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "consent_audit_log" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "consent_type_id" uuid NOT NULL,
  "action" text NOT NULL,
  "granted" boolean NOT NULL,
  "version" integer NOT NULL,
  "ip_address" text,
  "user_agent" text,
  "source" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- ============================================================================
-- 4. Data Processing Records Table (GDPR Article 30)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "data_processing_records" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL,
  "processing_purpose" text NOT NULL,
  "legal_basis" text NOT NULL,
  "data_categories" text[] NOT NULL,
  "data_subjects" text[] NOT NULL,
  "recipients" text[],
  "retention_period" text NOT NULL,
  "security_measures" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- ============================================================================
-- 5. Data Subject Requests Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS "data_subject_requests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "tenant_id" uuid NOT NULL,
  "request_type" text NOT NULL,
  "status" text DEFAULT 'pending' NOT NULL,
  "details" text,
  "admin_notes" text,
  "completed_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "data_subject_requests_request_type_check" CHECK (
    "request_type" IN ('access', 'erasure', 'portability', 'rectification', 'restriction', 'objection')
  ),
  CONSTRAINT "data_subject_requests_status_check" CHECK (
    "status" IN ('pending', 'in_progress', 'completed', 'rejected')
  )
);

-- ============================================================================
-- Foreign Key Constraints
-- ============================================================================
ALTER TABLE "user_consents"
  ADD CONSTRAINT "user_consents_consent_type_id_fkey"
  FOREIGN KEY ("consent_type_id") REFERENCES "consent_types"("id") ON DELETE CASCADE;

ALTER TABLE "consent_audit_log"
  ADD CONSTRAINT "consent_audit_log_consent_type_id_fkey"
  FOREIGN KEY ("consent_type_id") REFERENCES "consent_types"("id") ON DELETE CASCADE;

-- ============================================================================
-- Indexes for Performance
-- ============================================================================
-- User consents indexes
CREATE INDEX IF NOT EXISTS "user_consents_user_id_idx" ON "user_consents"("user_id");
CREATE INDEX IF NOT EXISTS "user_consents_consent_type_id_idx" ON "user_consents"("consent_type_id");
CREATE INDEX IF NOT EXISTS "user_consents_created_at_idx" ON "user_consents"("created_at");

-- Consent audit log indexes
CREATE INDEX IF NOT EXISTS "consent_audit_log_user_id_idx" ON "consent_audit_log"("user_id");
CREATE INDEX IF NOT EXISTS "consent_audit_log_consent_type_id_idx" ON "consent_audit_log"("consent_type_id");
CREATE INDEX IF NOT EXISTS "consent_audit_log_created_at_idx" ON "consent_audit_log"("created_at");

-- Data processing records indexes
CREATE INDEX IF NOT EXISTS "data_processing_records_tenant_id_idx" ON "data_processing_records"("tenant_id");

-- Data subject requests indexes
CREATE INDEX IF NOT EXISTS "data_subject_requests_user_id_idx" ON "data_subject_requests"("user_id");
CREATE INDEX IF NOT EXISTS "data_subject_requests_tenant_id_idx" ON "data_subject_requests"("tenant_id");
CREATE INDEX IF NOT EXISTS "data_subject_requests_status_idx" ON "data_subject_requests"("status");
CREATE INDEX IF NOT EXISTS "data_subject_requests_created_at_idx" ON "data_subject_requests"("created_at");

-- ============================================================================
-- Unique Constraints
-- ============================================================================
-- Ensure one active consent per user per type
CREATE UNIQUE INDEX IF NOT EXISTS "user_consents_unique_active"
  ON "user_consents"("user_id", "consent_type_id")
  WHERE "granted" = true;

-- ============================================================================
-- Seed Default Consent Types
-- ============================================================================
INSERT INTO "consent_types" ("name", "description", "required", "legal_basis", "version") VALUES
  ('Terms of Service', 'Agreement to the platform terms and conditions', true, 'contract', 1),
  ('Privacy Policy', 'Consent to collection and processing of personal data as described in privacy policy', true, 'consent', 1),
  ('Marketing Communications', 'Consent to receive marketing emails, newsletters, and promotional offers', false, 'consent', 1),
  ('Analytics and Improvement', 'Consent to use of analytics tools to improve platform functionality and user experience', false, 'legitimate_interests', 1)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Comments for Documentation
-- ============================================================================
COMMENT ON TABLE "consent_types" IS 'Defines types of consent required or optional for users';
COMMENT ON TABLE "user_consents" IS 'Tracks user consent decisions with version and audit trail';
COMMENT ON TABLE "consent_audit_log" IS 'Complete audit trail of consent changes (GDPR Article 30)';
COMMENT ON TABLE "data_processing_records" IS 'Record of processing activities (GDPR Article 30)';
COMMENT ON TABLE "data_subject_requests" IS 'Tracks GDPR data subject requests (access, erasure, portability, etc.)';
