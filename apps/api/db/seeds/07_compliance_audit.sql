-- =====================================================================
--  07_COMPLIANCE_AUDIT.SQL
--  GDPR compliance, audit events
-- =====================================================================

BEGIN;

-- =====================================================================
-- PROCESSING RECORDS (GDPR Article 30)
-- =====================================================================

INSERT INTO compliance.processing_records (
  tenant_id, activity_name, purpose, legal_basis,
  data_categories, retention_period, is_active
)
VALUES
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479',
   'Booking Management',
   'Administrere utleiebookinger',
   'CONTRACT',
   ARRAY['contact_info', 'booking_history', 'payment_info'],
   '7 years',
   true),
  
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479',
   'User Communication',
   'Kommunikasjon med brukere',
   'LEGITIMATE_INTEREST',
   ARRAY['contact_info', 'messages'],
   '3 years',
   true)
ON CONFLICT DO NOTHING;

-- =====================================================================
-- RETENTION POLICIES
-- =====================================================================

INSERT INTO compliance.retention_policies (
  tenant_id, data_type, retention_days, deletion_method, is_active
)
VALUES
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479',
   'bookings',
   2555, -- 7 years
   'SOFT_DELETE',
   true),
  
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479',
   'messages',
   1095, -- 3 years
   'SOFT_DELETE',
   true),
  
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479',
   'audit_events',
   3650, -- 10 years
   'ARCHIVE',
   true)
ON CONFLICT (tenant_id, data_type) DO UPDATE SET
  retention_days = EXCLUDED.retention_days;

-- =====================================================================
-- CONSENTS
-- =====================================================================

INSERT INTO compliance.consents (
  tenant_id, user_id, consent_type,
  given_at, expires_at, is_active
)
VALUES
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479',
   '01a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c',
   'MARKETING',
   NOW() - INTERVAL '30 days',
   NOW() + INTERVAL '1 year',
   true),
  
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'DATA_PROCESSING',
   NOW() - INTERVAL '60 days',
   NULL,
   true)
ON CONFLICT DO NOTHING;

-- =====================================================================
-- AUDIT EVENTS (Critical actions)
-- =====================================================================

INSERT INTO platform.audit_events (
  tenant_id, user_id, action, entity_type, entity_id,
  old_value, new_value, ip_address, user_agent
)
VALUES
  -- User login
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479',
   '01a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c',
   'auth.login',
   'session',
   'session-001',
   NULL,
   '{"method": "demo-token", "success": true}'::jsonb,
   '192.168.1.100',
   'Mozilla/5.0'),
  
  -- Booking created
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479',
   '01a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c',
   'booking.created',
   'booking',
   'b0000001-0000-0000-0000-000000000001',
   NULL,
   '{"rental_object_id": "d0000001-0000-0000-0000-000000000001", "status": "PENDING"}'::jsonb,
   '192.168.1.100',
   'Mozilla/5.0'),
  
  -- Booking approved
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479',
   '77777777-7777-7777-7777-777777777777',
   'booking.approved',
   'booking',
   'b0000001-0000-0000-0000-000000000001',
   '{"status": "PENDING"}'::jsonb,
   '{"status": "CONFIRMED"}'::jsonb,
   '192.168.1.50',
   'Mozilla/5.0'),
  
  -- Rental object published
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479',
   '66666666-6666-6666-6666-666666666666',
   'rental_object.published',
   'rental_object',
   'd0000001-0000-0000-0000-000000000001',
   '{"status": "DRAFT"}'::jsonb,
   '{"status": "PUBLISHED"}'::jsonb,
   '192.168.1.10',
   'Mozilla/5.0')
ON CONFLICT DO NOTHING;

COMMIT;

-- =====================================================================
-- VERIFICATION
-- =====================================================================

SELECT 'Compliance & audit seed complete.' AS status,
  (SELECT COUNT(*) FROM compliance.processing_records) AS processing_records,
  (SELECT COUNT(*) FROM compliance.retention_policies) AS retention_policies,
  (SELECT COUNT(*) FROM compliance.consents) AS consents,
  (SELECT COUNT(*) FROM platform.audit_events) AS audit_events;
