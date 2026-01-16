-- Migration: Notification System
-- Created: 2026-01-15
-- Description: Comprehensive notification system with templates, multi-channel delivery, and queue

-- =============================================================================
-- Notification Templates
-- =============================================================================
CREATE TABLE IF NOT EXISTS "notification_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid REFERENCES "tenants"("id") ON DELETE cascade,
	"code" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"email_template" jsonb DEFAULT '{}'::jsonb,
	"sms_template" jsonb DEFAULT '{}'::jsonb,
	"push_template" jsonb DEFAULT '{}'::jsonb,
	"in_app_template" jsonb DEFAULT '{}'::jsonb,
	"available_variables" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "notification_templates_tenant_code_idx" ON "notification_templates" ("tenant_id", "code");
CREATE INDEX IF NOT EXISTS "notification_templates_code_idx" ON "notification_templates" ("code");
CREATE INDEX IF NOT EXISTS "notification_templates_active_idx" ON "notification_templates" ("is_active");

-- =============================================================================
-- Notifications
-- =============================================================================
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
	"user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
	"organization_id" uuid REFERENCES "organizations"("id") ON DELETE set null,
	"type" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"priority" varchar(20) DEFAULT 'normal' NOT NULL,
	"related_entity_type" varchar(50),
	"related_entity_id" uuid,
	"action_url" varchar(500),
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"read_at" timestamp,
	"dismissed_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "notifications_tenant_user_idx" ON "notifications" ("tenant_id", "user_id");
CREATE INDEX IF NOT EXISTS "notifications_user_read_idx" ON "notifications" ("user_id", "read_at");
CREATE INDEX IF NOT EXISTS "notifications_type_idx" ON "notifications" ("type");
CREATE INDEX IF NOT EXISTS "notifications_priority_idx" ON "notifications" ("priority");
CREATE INDEX IF NOT EXISTS "notifications_created_idx" ON "notifications" ("created_at");
CREATE INDEX IF NOT EXISTS "notifications_expires_idx" ON "notifications" ("expires_at");

-- =============================================================================
-- Notification Delivery Logs
-- =============================================================================
CREATE TABLE IF NOT EXISTS "notification_delivery_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
	"notification_id" uuid NOT NULL REFERENCES "notifications"("id") ON DELETE cascade,
	"channel" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"recipient_address" varchar(255),
	"provider_message_id" varchar(255),
	"provider_response" jsonb DEFAULT '{}'::jsonb,
	"error_code" varchar(100),
	"error_message" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"next_retry_at" timestamp,
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"failed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "notification_delivery_logs_notification_idx" ON "notification_delivery_logs" ("notification_id");
CREATE INDEX IF NOT EXISTS "notification_delivery_logs_channel_idx" ON "notification_delivery_logs" ("channel");
CREATE INDEX IF NOT EXISTS "notification_delivery_logs_status_idx" ON "notification_delivery_logs" ("status");
CREATE INDEX IF NOT EXISTS "notification_delivery_logs_sent_at_idx" ON "notification_delivery_logs" ("sent_at");

-- =============================================================================
-- Notification Queue
-- =============================================================================
CREATE TABLE IF NOT EXISTS "notification_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
	"user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
	"organization_id" uuid REFERENCES "organizations"("id") ON DELETE set null,
	"notification_id" uuid REFERENCES "notifications"("id") ON DELETE set null,
	"type" varchar(100) NOT NULL,
	"channels" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"variables" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"priority" varchar(20) DEFAULT 'normal' NOT NULL,
	"scheduled_for" timestamp,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"processed_at" timestamp,
	"failed_at" timestamp,
	"error_message" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"max_retries" integer DEFAULT 3 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "notification_queue_status_idx" ON "notification_queue" ("status");
CREATE INDEX IF NOT EXISTS "notification_queue_scheduled_idx" ON "notification_queue" ("scheduled_for");
CREATE INDEX IF NOT EXISTS "notification_queue_user_idx" ON "notification_queue" ("user_id");

-- =============================================================================
-- Provider Configurations
-- =============================================================================
CREATE TABLE IF NOT EXISTS "sms_provider_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
	"provider" varchar(50) NOT NULL,
	"config" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "email_provider_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE cascade,
	"provider" varchar(50) NOT NULL,
	"config" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- =============================================================================
-- Seed System Templates
-- =============================================================================
INSERT INTO "notification_templates" ("tenant_id", "code", "name", "description", "in_app_template", "email_template", "is_system", "is_active") VALUES
(NULL, 'booking_approved', 'Booking Approved', 'Notification when booking is approved',
	'{"nb": {"title": "Booking godkjent", "body": "Din booking av {{listingName}} er godkjent!"}, "en": {"title": "Booking Approved", "body": "Your booking for {{listingName}} has been approved!"}}'::jsonb,
	'{"nb": {"subject": "Booking godkjent", "body": "Hei {{userName}},\n\nDin booking av {{listingName}} for {{startDate}} er godkjent!\n\nMvh,\nDigilist"}, "en": {"subject": "Booking Approved", "body": "Hi {{userName}},\n\nYour booking for {{listingName}} on {{startDate}} has been approved!\n\nBest regards,\nDigilist"}}'::jsonb,
	true, true),
(NULL, 'booking_rejected', 'Booking Rejected', 'Notification when booking is rejected',
	'{"nb": {"title": "Booking avslått", "body": "Din booking av {{listingName}} ble dessverre avslått."}, "en": {"title": "Booking Rejected", "body": "Your booking for {{listingName}} was rejected."}}'::jsonb,
	'{"nb": {"subject": "Booking avslått", "body": "Hei {{userName}},\n\nDin booking av {{listingName}} for {{startDate}} ble dessverre avslått.\n\nGrunn: {{rejectionReason}}\n\nMvh,\nDigilist"}, "en": {"subject": "Booking Rejected", "body": "Hi {{userName}},\n\nYour booking for {{listingName}} on {{startDate}} was rejected.\n\nReason: {{rejectionReason}}\n\nBest regards,\nDigilist"}}'::jsonb,
	true, true),
(NULL, 'gdpr_request_received', 'GDPR Request Received', 'Notification when GDPR data request is received',
	'{"nb": {"title": "GDPR-forespørsel mottatt", "body": "Din {{requestType}}-forespørsel er mottatt og vil bli behandlet."}, "en": {"title": "GDPR Request Received", "body": "Your {{requestType}} request has been received and will be processed."}}'::jsonb,
	'{"nb": {"subject": "GDPR-forespørsel mottatt", "body": "Hei {{userName}},\n\nVi har mottatt din forespørsel om {{requestType}}.\n\nForespørsel-ID: {{requestId}}\nType: {{requestType}}\nMottatt: {{receivedDate}}\n\nDenne forespørselen vil bli behandlet innen 30 dager i henhold til GDPR.\n\nMvh,\nDigilist"}, "en": {"subject": "GDPR Request Received", "body": "Hi {{userName}},\n\nWe have received your {{requestType}} request.\n\nRequest ID: {{requestId}}\nType: {{requestType}}\nReceived: {{receivedDate}}\n\nThis request will be processed within 30 days according to GDPR.\n\nBest regards,\nDigilist"}}'::jsonb,
	true, true),
(NULL, 'gdpr_request_completed', 'GDPR Request Completed', 'Notification when GDPR data request is completed',
	'{"nb": {"title": "GDPR-forespørsel fullført", "body": "Din {{requestType}}-forespørsel er nå fullført."}, "en": {"title": "GDPR Request Completed", "body": "Your {{requestType}} request has been completed."}}'::jsonb,
	'{"nb": {"subject": "GDPR-forespørsel fullført", "body": "Hei {{userName}},\n\nDin forespørsel om {{requestType}} er nå fullført.\n\nForespørsel-ID: {{requestId}}\nFullført: {{completedDate}}\n\n{{completionNotes}}\n\nMvh,\nDigilist"}, "en": {"subject": "GDPR Request Completed", "body": "Hi {{userName}},\n\nYour {{requestType}} request has been completed.\n\nRequest ID: {{requestId}}\nCompleted: {{completedDate}}\n\n{{completionNotes}}\n\nBest regards,\nDigilist"}}'::jsonb,
	true, true)
ON CONFLICT DO NOTHING;
