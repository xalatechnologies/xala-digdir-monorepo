-- Digilist Production Schema Migration
-- Generated: 2026-01-16
-- Purpose: Create all tables, foreign keys, and indexes for fresh database

-- Foreign Key Constraints
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "priority_rules" ADD CONSTRAINT "priority_rules_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "season_applications" ADD CONSTRAINT "season_applications_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "season_applications" ADD CONSTRAINT "season_applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "seasonal_leases" ADD CONSTRAINT "seasonal_leases_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "seasonal_leases" ADD CONSTRAINT "seasonal_leases_rental_object_id_rental_objects_id_fk" FOREIGN KEY ("rental_object_id") REFERENCES "public"."rental_objects"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "seasonal_leases" ADD CONSTRAINT "seasonal_leases_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "seasons" ADD CONSTRAINT "seasons_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "usage" ADD CONSTRAINT "usage_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;

-- Indexes for Performance
CREATE INDEX "allocations_tenant_idx" ON "allocations" USING btree ("tenant_id");
CREATE INDEX "allocations_rental_object_idx" ON "allocations" USING btree ("rental_object_id");
CREATE INDEX "allocations_time_idx" ON "allocations" USING btree ("start_time","end_time");
CREATE INDEX "audit_logs_tenant_idx" ON "audit_logs" USING btree ("tenant_id","timestamp");
CREATE INDEX "audit_logs_resource_idx" ON "audit_logs" USING btree ("resource","resource_id");
CREATE INDEX "bookings_tenant_idx" ON "bookings" USING btree ("tenant_id");
CREATE INDEX "bookings_rental_object_idx" ON "bookings" USING btree ("rental_object_id");
CREATE INDEX "bookings_user_idx" ON "bookings" USING btree ("user_id");
CREATE INDEX "bookings_status_idx" ON "bookings" USING btree ("status");
CREATE INDEX "conversations_tenant_idx" ON "conversations" USING btree ("tenant_id");
CREATE INDEX "conversations_user_idx" ON "conversations" USING btree ("user_id");
CREATE INDEX "gdpr_requests_tenant_idx" ON "gdpr_requests" USING btree ("tenant_id");
CREATE INDEX "gdpr_requests_user_idx" ON "gdpr_requests" USING btree ("user_id");
CREATE INDEX "gdpr_requests_status_idx" ON "gdpr_requests" USING btree ("status");
CREATE INDEX "gdpr_requests_tenant_status_idx" ON "gdpr_requests" USING btree ("tenant_id","status");
CREATE INDEX "incidents_status_idx" ON "incidents" USING btree ("status");
CREATE INDEX "incidents_severity_idx" ON "incidents" USING btree ("severity");
CREATE INDEX "rental_objects_tenant_idx" ON "rental_objects" USING btree ("tenant_id");
CREATE INDEX "rental_objects_category_key_idx" ON "rental_objects" USING btree ("category_key");
CREATE INDEX "rental_objects_time_mode_idx" ON "rental_objects" USING btree ("time_mode");
CREATE INDEX "rental_objects_status_idx" ON "rental_objects" USING btree ("status");
CREATE INDEX "rental_objects_slug_idx" ON "rental_objects" USING btree ("tenant_id","slug");
CREATE INDEX "messages_conversation_idx" ON "messages" USING btree ("conversation_id");
CREATE INDEX "orgs_tenant_idx" ON "organizations" USING btree ("tenant_id");
CREATE INDEX "orgs_slug_idx" ON "organizations" USING btree ("tenant_id","slug");
CREATE INDEX "seasonal_leases_tenant_idx" ON "seasonal_leases" USING btree ("tenant_id");
CREATE INDEX "seasonal_leases_rental_object_idx" ON "seasonal_leases" USING btree ("rental_object_id");
CREATE INDEX "seasonal_leases_org_idx" ON "seasonal_leases" USING btree ("organization_id");
CREATE INDEX "subscriptions_tenant_idx" ON "subscriptions" USING btree ("tenant_id");
CREATE INDEX "tenants_slug_idx" ON "tenants" USING btree ("slug");
CREATE INDEX "tenants_status_idx" ON "tenants" USING btree ("status");
CREATE INDEX "usage_tenant_metric_idx" ON "usage" USING btree ("tenant_id","metric","timestamp");
CREATE INDEX "users_tenant_email_idx" ON "users" USING btree ("tenant_id","email");
CREATE INDEX "users_tenant_idx" ON "users" USING btree ("tenant_id");
