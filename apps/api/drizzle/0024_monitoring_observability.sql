-- =====================================================================
-- 0024: MONITORING & OBSERVABILITY
-- Request logs, error events, job monitoring, uptime checks
-- =====================================================================

-- Note: audit_logs, alerts, incidents tables already exist from earlier migrations
-- This extends monitoring with request/error/job tracking

-- =====================================================================
-- Request Logs (API Performance Monitoring)
-- =====================================================================

create table if not exists monitoring.request_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid null references platform.tenants(id) on delete cascade,
  
  -- Request
  method text not null check (method in ('GET','POST','PUT','PATCH','DELETE','OPTIONS','HEAD')),
  path text not null,
  query_params jsonb default '{}'::jsonb,
  
  -- Response
  status_code integer not null,
  response_time_ms integer not null,
  response_size_bytes integer null,
  
  -- User context
  user_id uuid null references platform.users(id) on delete set null,
  api_key_id uuid null references platform.api_keys(id) on delete set null,
  
  -- Network
  ip_address inet not null,
  user_agent text null,
  
  -- Tracing
  request_id text not null unique,
  trace_id text null,
  parent_span_id text null,
  
  -- Errors
  is_error boolean not null default false,
  error_type text null,
  error_message text null,
  
  created_at timestamptz not null default now()
);

-- Partitioning by created_at recommended for production (monthly partitions)
create index if not exists idx_request_logs_tenant on monitoring.request_logs(tenant_id, created_at desc);
create index if not exists idx_request_logs_path on monitoring.request_logs(path, created_at desc);
create index if not exists idx_request_logs_status on monitoring.request_logs(status_code, created_at desc);
create index if not exists idx_request_logs_user on monitoring.request_logs(user_id, created_at desc);
create index if not exists idx_request_logs_errors on monitoring.request_logs(is_error, created_at desc) where is_error;
create index if not exists idx_request_logs_slow on monitoring.request_logs(response_time_ms desc, created_at desc) where response_time_ms > 1000;
create index if not exists idx_request_logs_request_id on monitoring.request_logs(request_id);

comment on table monitoring.request_logs is 'HTTP request/response logs for performance analysis';

-- =====================================================================
-- Error Events (RFC 7807 Error Snapshots)
-- =====================================================================

create table if not exists monitoring.error_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid null references platform.tenants(id) on delete cascade,
  
  -- RFC 7807 Problem Details
  error_type text not null, -- URI reference
  title text not null,
  status integer not null,
  detail text null,
  instance text null, -- URI reference to specific error occurrence
  
  -- Stack trace
  stack_trace text null,
  
  -- Context
  request_id text null references monitoring.request_logs(request_id) on delete set null,
  user_id uuid null references platform.users(id) on delete set null,
  
  -- Fingerprinting (for grouping)
  error_hash text not null, -- Hash of type + stack for deduplication
  occurrence_count integer not null default 1,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  
  -- Resolution
  is_resolved boolean not null default false,
  resolved_at timestamptz null,
  resolved_by uuid null references platform.users(id) on delete set null,
  
  created_at timestamptz not null default now()
);

create index if not exists idx_error_events_tenant on monitoring.error_events(tenant_id, created_at desc);
create index if not exists idx_error_events_type on monitoring.error_events(error_type, created_at desc);
create index if not exists idx_error_events_hash on monitoring.error_events(error_hash, last_seen_at desc);
create index if not exists idx_error_events_unresolved on monitoring.error_events(is_resolved, created_at desc) where not is_resolved;

comment on table monitoring.error_events is 'RFC 7807 error event tracking with deduplication';

-- =====================================================================
-- Background Job Runs (Queue Monitoring)
-- =====================================================================

create table if not exists monitoring.job_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid null references platform.tenants(id) on delete cascade,
  
  job_type text not null, -- e.g., 'notification_delivery', 'retention_enforcement', 'rag_ingestion'
  job_name text not null,
  
  -- Execution
  status text not null check (status in ('QUEUED','RUNNING','COMPLETED','FAILED','CANCELLED')) default 'QUEUED',
  
  started_at timestamptz null,
  completed_at timestamptz null,
  duration_ms integer null,
  
  -- Results
  records_processed integer default 0,
  records_succeeded integer default 0,
  records_failed integer default 0,
  
  -- Error details
  error text null,
  stack_trace text null,
  
  -- Retry
  attempt_number integer not null default 1,
  max_attempts integer not null default 3,
  next_retry_at timestamptz null,
  
  -- Context
  input_params jsonb default '{}'::jsonb,
  output_result jsonb default '{}'::jsonb,
  
  created_at timestamptz not null default now()
);

create index if not exists idx_job_runs_tenant on monitoring.job_runs(tenant_id, created_at desc);
create index if not exists idx_job_runs_type on monitoring.job_runs(job_type, status, created_at desc);
create index if not exists idx_job_runs_status on monitoring.job_runs(status, created_at desc);
create index if not exists idx_job_runs_failed on monitoring.job_runs(status, created_at desc) where status = 'FAILED';
create index if not exists idx_job_runs_retry on monitoring.job_runs(next_retry_at) where status = 'FAILED' and next_retry_at is not null;

comment on table monitoring.job_runs is 'Background job execution tracking and monitoring';

-- =====================================================================
-- Uptime Checks (Health Monitoring)
-- =====================================================================

create table if not exists monitoring.uptime_checks (
  id uuid primary key default gen_random_uuid(),
  
  check_name text not null unique,
  endpoint_url text not null,
  check_interval_seconds integer not null default 60,
  timeout_seconds integer not null default 10,
  
  is_active boolean not null default true,
  
  created_at timestamptz not null default now()
);

create index if not exists idx_uptime_checks_active on monitoring.uptime_checks(is_active);

comment on table monitoring.uptime_checks is 'Health check endpoint definitions';

-- =====================================================================
-- Uptime Check Results
-- =====================================================================

create table if not exists monitoring.uptime_check_results (
  id uuid primary key default gen_random_uuid(),
  check_id uuid not null references monitoring.uptime_checks(id) on delete cascade,
  
  checked_at timestamptz not null default now(),
  
  status_code integer null,
  response_time_ms integer null,
  
  is_up boolean not null,
  error_message text null,
  
  -- Alerting
  trigger_alert boolean not null default false
);

create index if not exists idx_uptime_results_check on monitoring.uptime_check_results(check_id, checked_at desc);
create index if not exists idx_uptime_results_down on monitoring.uptime_check_results(is_up, checked_at desc) where not is_up;
create index if not exists idx_uptime_results_alerts on monitoring.uptime_check_results(trigger_alert, checked_at desc) where trigger_alert;

comment on table monitoring.uptime_check_results is 'Uptime check execution results';

-- =====================================================================
-- Performance Metrics (Time-Series)
-- =====================================================================

create table if not exists monitoring.performance_metrics (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid null references platform.tenants(id) on delete cascade,
  
  metric_name text not null,
  metric_type text not null check (metric_type in ('COUNTER','GAUGE','HISTOGRAM','TIMER')),
  
  value numeric(15,4) not null,
  unit text null, -- ms, bytes, requests, etc.
  
  tags jsonb default '{}'::jsonb, -- e.g., {endpoint: "/api/bookings", status: "200"}
  
  timestamp timestamptz not null default now()
);

-- Time-series optimized indexes
create index if not exists idx_performance_metrics_tenant on monitoring.performance_metrics(tenant_id, timestamp desc);
create index if not exists idx_performance_metrics_name on monitoring.performance_metrics(metric_name, timestamp desc);
create index if not exists idx_performance_metrics_tags on monitoring.performance_metrics using gin(tags);

comment on table monitoring.performance_metrics is 'Application performance metrics (time-series)';

-- =====================================================================
-- SLA Reports (Pre-Calculated)
-- =====================================================================

create table if not exists monitoring.sla_reports (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  
  report_period text not null check (report_period in ('HOURLY','DAILY','WEEKLY','MONTHLY')),
  period_start timestamptz not null,
  period_end timestamptz not null,
  
  -- Availability
  total_requests integer not null,
  successful_requests integer not null,
  failed_requests integer not null,
  availability_percentage numeric(5,2) not null,
  
  -- Performance
  avg_response_time_ms integer not null,
  p50_response_time_ms integer not null,
  p95_response_time_ms integer not null,
  p99_response_time_ms integer not null,
  
  -- Error rate
  error_rate_percentage numeric(5,2) not null,
  
  created_at timestamptz not null default now(),
  
  unique (tenant_id, report_period, period_start)
);

create index if not exists idx_sla_reports_tenant on monitoring.sla_reports(tenant_id, period_start desc);
create index if not exists idx_sla_reports_period on monitoring.sla_reports(report_period, period_start desc);

comment on table monitoring.sla_reports is 'Pre-calculated SLA compliance reports';

comment on schema monitoring is 'Monitoring and observability tables';
