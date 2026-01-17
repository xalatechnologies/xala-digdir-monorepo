-- =====================================================================
--  05_DOMAIN_BOOKINGS.SQL
--  Sample bookings, approvals, recurring series
-- =====================================================================

BEGIN;

-- =====================================================================
-- BOOKINGS (Sample data across statuses)
-- =====================================================================

INSERT INTO domain.bookings (
  id, tenant_id, rental_object_id, user_id, organization_id,
  start_time, end_time, status, booking_mode,
  total_price_cents, deposit_cents, payment_status,
  notes
)
VALUES
  -- Confirmed booking (Ola Hansen)
  ('b0000001-0000-0000-0000-000000000001',
   'f47ac10b-58cc-4372-a567-0e02b2c3d479',
   'd0000001-0000-0000-0000-000000000001',
   '01a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c',
   '11111111-1111-1111-1111-111111111111',
   '2026-02-15 10:00:00'::timestamp,
   '2026-02-15 14:00:00'::timestamp,
   'CONFIRMED',
   'SINGLE',
   187500, -- 4 hours * 1500 NOK
   300000, -- Deposit
   'PAID',
   'Fotballtrening - juniorlag'),
  
  -- Pending approval (Lisa Berg)
  ('b0000001-0000-0001-0000-000000000000',
   'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
   'd0000001-0000-0001-0000-000000000000',
   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   '33333333-3333-3333-3333-333333333333',
   '2026-02-20 16:00:00'::timestamp,
   '2026-02-20 18:00:00'::timestamp,
   'PENDING',
   'SINGLE',
   150000, -- 2 hours * 1500 NOK (pending approval)
   NULL,
   'PENDING',
   'Håndballkamp - lag avdeling'),
  
  -- Recurring series booking (Skien IL)
  ('b0000001-0000-0002-0000-000000000000',
   'f47ac10b-58cc-4372-a567-0e02b2c3d479',
   'd0000001-0000-0002-0000-000000000000',
   '88888888-8888-8888-8888-888888888888',
   '22222222-2222-2222-2222-222222222222',
   '2026-03-01 18:00:00'::timestamp,
   '2026-03-01 20:00:00'::timestamp,
   'CONFIRMED',
   'RECURRING',
   150000,
   300000,
   'PAID',
   'Tennis trening - ukentlig'),
  
  -- Cancelled booking
  ('b0000001-0000-0003-0000-000000000000',
   'f47ac10b-58cc-4372-a567-0e02b2c3d479',
   'd0000001-0000-0003-0000-000000000000',
   '01a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c',
   '11111111-1111-1111-1111-111111111111',
   '2026-02-10 14:00:00'::timestamp,
   '2026-02-10 16:00:00'::timestamp,
   'CANCELLED',
   'SINGLE',
   150000,
   300000,
   'REFUNDED',
   'Avlyst - sykdom')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  payment_status = EXCLUDED.payment_status;

-- =====================================================================
-- BOOKING APPROVALS (For pending bookings)
-- =====================================================================

INSERT INTO domain.booking_approvals (
  tenant_id, booking_id, approver_id,
  decision, decided_at, notes
)
VALUES
  -- Approved booking
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479',
   'b0000001-0000-0000-0000-000000000001',
   '77777777-7777-7777-7777-777777777777',
   'APPROVED',
   NOW() - INTERVAL '2 days',
   'Godkjent - saksbehandler Ole Jensen')
ON CONFLICT DO NOTHING;

-- =====================================================================
-- RECURRING SERIES (For weekly bookings)
-- =====================================================================

INSERT INTO domain.recurring_series (
  id, tenant_id, rental_object_id, user_id,
  recurrence_pattern, start_date, end_date,
  time_start, time_end, is_active
)
VALUES
  ('r0000001-0000-0000-0000-000000000001',
   'f47ac10b-58cc-4372-a567-0e02b2c3d479',
   'd0000001-0000-0002-0000-000000000000',
   '88888888-8888-8888-8888-888888888888',
   'WEEKLY',
   '2026-03-01'::date,
   '2026-08-31'::date,
   '18:00'::time,
   '20:00'::time,
   true)
ON CONFLICT (id) DO UPDATE SET
  is_active = EXCLUDED.is_active;

-- =====================================================================
-- RECURRING INSTANCES (Generated from series)
-- =====================================================================

INSERT INTO domain.recurring_instances (
  tenant_id, series_id, booking_id, instance_date, status
)
VALUES
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479',
   'r0000001-0000-0000-0000-000000000001',
   'b0000001-0000-0002-0000-000000000000',
   '2026-03-01'::date,
   'CONFIRMED'),
  
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479',
   'r0000001-0000-0000-0000-000000000001',
   NULL, -- Future instance, not yet booked
   '2026-03-08'::date,
   'SCHEDULED')
ON CONFLICT DO NOTHING;

COMMIT;

-- =====================================================================
-- VERIFICATION
-- =====================================================================

SELECT 'Bookings seed complete.' AS status,
  (SELECT COUNT(*) FROM domain.bookings) AS bookings,
  (SELECT COUNT(*) FROM domain.booking_approvals) AS approvals,
  (SELECT COUNT(*) FROM domain.recurring_series) AS recurring_series,
  (SELECT COUNT(*) FROM domain.recurring_instances) AS instances;
