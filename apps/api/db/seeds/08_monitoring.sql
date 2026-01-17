-- =====================================================================
--  08_MONITORING.SQL
--  Request logs, error events, incident tracking
-- =====================================================================

BEGIN;

-- =====================================================================
-- REQUEST LOGS
-- =====================================================================

INSERT INTO monitoring.request_logs (
  tenant_id, user_id, method, path, status_code,
  duration_ms, ip_address, user_agent
)
VALUES
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479',
   '01a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c',
   'GET',
   '/api/rental-objects',
   200,
   45,
   '192.168.1.100',
   'Mozilla/5.0'),
  
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479',
   '01a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c',
   'POST',
   '/api/bookings',
   201,
   230,
   '192.168.1.100',
   'Mozilla/5.0'),
  
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'GET',
   '/api/bookings/quote',
   200,
   120,
   '192.168.1.200',
   'Mozilla/5.0')
ON CONFLICT DO NOTHING;

-- =====================================================================
-- ERROR EVENTS (RFC 7807)
-- =====================================================================

INSERT INTO monitoring.error_events (
  tenant_id, user_id, error_code, error_type, error_title,
  error_detail, status_code, instance, stack_trace
)
VALUES
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479',
   '01a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c',
   'VALIDATION_ERROR',
   'https://api.digilist.no/errors/validation',
   'Validation Failed',
   'Start time must be in the future',
   400,
   '/api/bookings',
   'ValidationError: Start time must be in the future\n  at validateBooking...')
ON CONFLICT DO NOTHING;

-- =====================================================================
-- JOB RUNS (Background jobs)
-- =====================================================================

INSERT INTO monitoring.job_runs (
  tenant_id, job_name, status, started_at, completed_at,
  duration_ms, result
)
VALUES
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479',
   'notification_delivery',
   'SUCCESS',
   NOW() - INTERVAL '1 hour',
   NOW() - INTERVAL '55 minutes',
   300000,
   '{"sent": 45, "failed": 0}'::jsonb),
  
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479',
   'retention_cleanup',
   'SUCCESS',
   NOW() - INTERVAL '12 hours',
   NOW() - INTERVAL '11 hours 50 minutes',
   600000,
   '{"deleted": 123, "archived": 45}'::jsonb)
ON CONFLICT DO NOTHING;

-- =====================================================================
-- INCIDENT LOGS
-- =====================================================================

INSERT INTO monitoring.incident_logs (
  tenant_id, severity, title, description,
  status, detected_at, resolved_at
)
VALUES
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479',
   'MEDIUM',
   'Slow API Response Times',
   'Quote calculator endpoint experiencing 2x normal latency',
   'RESOLVED',
   NOW() - INTERVAL '2 days',
   NOW() - INTERVAL '1 day'),
  
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
   'LOW',
   'Email Delivery Delay',
   'Booking confirmation emails delayed by 10 minutes',
   'RESOLVED',
   NOW() - INTERVAL '5 days',
   NOW() - INTERVAL '5 days' + INTERVAL '30 minutes')
ON CONFLICT DO NOTHING;

COMMIT;

-- =====================================================================
-- VERIFICATION
-- =====================================================================

SELECT 'Monitoring seed complete.' AS status,
  (SELECT COUNT(*) FROM monitoring.request_logs) AS request_logs,
  (SELECT COUNT(*) FROM monitoring.error_events) AS error_events,
  (SELECT COUNT(*) FROM monitoring.job_runs) AS job_runs,
  (SELECT COUNT(*) FROM monitoring.incident_logs) AS incident_logs;

-- =====================================================================
-- FINAL SUMMARY
-- =====================================================================

SELECT '✅ ALL SEEDS COMPLETE!' AS status,
  (SELECT COUNT(*) FROM platform.tenants) AS tenants,
  (SELECT COUNT(*) FROM platform.users) AS users,
  (SELECT COUNT(*) FROM domain.rental_objects) AS rental_objects,
  (SELECT COUNT(*) FROM domain.bookings) AS bookings,
  (SELECT COUNT(*) FROM domain.messages) AS messages,
  (SELECT COUNT(*) FROM platform.audit_events) AS audit_events;
