-- =====================================================================
-- DIGILIST SCHEMA: 0000_schemas.sql
-- Creates PostgreSQL schema namespaces and extensions
-- Run order: 1st (before all other migrations)
-- =====================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schema namespaces
CREATE SCHEMA IF NOT EXISTS platform;    -- Core platform: tenants, users, orgs, RBAC
CREATE SCHEMA IF NOT EXISTS domain;      -- Business domain: rental objects, bookings
CREATE SCHEMA IF NOT EXISTS compliance;  -- GDPR, audit logs, data retention
CREATE SCHEMA IF NOT EXISTS monitoring;  -- Alerts, incidents, observability
CREATE SCHEMA IF NOT EXISTS saas;        -- SaaS: plans, subscriptions, entitlements

-- Grant usage on schemas (for app user)
-- In production, replace 'digilist' with your app user
GRANT USAGE ON SCHEMA platform TO digilist;
GRANT USAGE ON SCHEMA domain TO digilist;
GRANT USAGE ON SCHEMA compliance TO digilist;
GRANT USAGE ON SCHEMA monitoring TO digilist;
GRANT USAGE ON SCHEMA saas TO digilist;

-- Set search path to include all schemas
ALTER DATABASE digilist_prod SET search_path TO platform, domain, compliance, monitoring, saas, public;
