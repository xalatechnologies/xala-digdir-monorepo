-- =====================================================================
-- DOMAIN: Complete Payment System (Intents, Transactions, Refunds, Receipts)
-- =====================================================================

-- Note: domain.payments already exists in 0001_clean_schema.sql
-- This extends with full payment lifecycle

-- ---------------------------------------------------------------------
-- 1) PAYMENT INTENTS (Provider intent tracking)
-- ---------------------------------------------------------------------

create table if not exists domain.payment_intents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  booking_id uuid not null references domain.bookings(id) on delete cascade,
  provider text not null references domain.enum_payment_provider(code),
  provider_intent_id text not null,
  amount_cents int not null,
  currency text not null default 'NOK',
  status text not null references domain.enum_payment_status(code) default 'INITIATED',
  idempotency_key text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, provider, provider_intent_id),
  unique (tenant_id, idempotency_key)
);

create index if not exists idx_payment_intents_booking
  on domain.payment_intents(booking_id, status);

-- ---------------------------------------------------------------------
-- 2) PAYMENT TRANSACTIONS (Captures, authorizations, voids)
-- ---------------------------------------------------------------------

create table if not exists domain.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  payment_intent_id uuid not null references domain.payment_intents(id) on delete cascade,
  transaction_type text not null check (transaction_type in ('AUTHORIZE','CAPTURE','VOID','PARTIAL_CAPTURE')),
  amount_cents int not null,
  currency text not null default 'NOK',
  provider_transaction_id text null,
  status text not null check (status in ('PENDING','SUCCESS','FAILED')) default 'PENDING',
  error_code text null,
  error_message text null,
  created_at timestamptz not null default now()
);

create index if not exists idx_payment_txn_intent
  on domain.payment_transactions(payment_intent_id, created_at desc);

-- ---------------------------------------------------------------------
-- 3) REFUNDS
-- ---------------------------------------------------------------------

create table if not exists domain.refunds (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  payment_intent_id uuid not null references domain.payment_intents(id) on delete cascade,
  booking_id uuid not null references domain.bookings(id) on delete cascade,
  refund_type text not null check (refund_type in ('FULL','PARTIAL','DEPOSIT_ONLY')),
  amount_cents int not null,
  currency text not null default 'NOK',
  reason text not null check (reason in ('CANCELLATION','DISPUTE','ERROR','GOODWILL','OTHER')),
  reason_details text null,
  provider_refund_id text null,
  status text not null check (status in ('PENDING','PROCESSING','COMPLETED','FAILED')) default 'PENDING',
  requested_by_user_id uuid null references platform.users(id) on delete set null,
  approved_by_user_id uuid null references platform.users(id) on delete set null,
  created_at timestamptz not null default now(),
  completed_at timestamptz null
);

create index if not exists idx_refunds_booking
  on domain.refunds(booking_id, status);

-- ---------------------------------------------------------------------
-- 4) PAYOUTS (Marketplace / org split)
-- ---------------------------------------------------------------------

create table if not exists domain.payouts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  organization_id uuid null references platform.organizations(id) on delete cascade,
  payout_type text not null check (payout_type in ('BOOKING_REVENUE','COMMISSION','REFUND_REVERSAL')),
  amount_cents int not null,
  currency text not null default 'NOK',
  period_start date not null,
  period_end date not null,
  status text not null check (status in ('PENDING','PROCESSING','PAID','FAILED')) default 'PENDING',
  provider_payout_id text null,
  bank_account_last4 text null,
  created_at timestamptz not null default now(),
  paid_at timestamptz null
);

create index if not exists idx_payouts_org_period
  on domain.payouts(organization_id, period_start, period_end);

-- Payout line items
create table if not exists domain.payout_items (
  id uuid primary key default gen_random_uuid(),
  payout_id uuid not null references domain.payouts(id) on delete cascade,
  booking_id uuid null references domain.bookings(id) on delete set null,
  payment_intent_id uuid null references domain.payment_intents(id) on delete set null,
  description text not null,
  amount_cents int not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 5) RECEIPTS (PDF generation tracking)
-- ---------------------------------------------------------------------

create table if not exists domain.receipts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  booking_id uuid not null references domain.bookings(id) on delete cascade,
  payment_intent_id uuid null references domain.payment_intents(id) on delete set null,
  receipt_no text not null unique,
  receipt_type text not null check (receipt_type in ('PAYMENT','REFUND','DEPOSIT','INVOICE')),
  amount_cents int not null,
  currency text not null default 'NOK',
  pdf_attachment_id uuid null references domain.attachments(id) on delete set null,
  generated_at timestamptz not null default now(),
  sent_to_email text null,
  sent_at timestamptz null
);

create index if not exists idx_receipts_booking
  on domain.receipts(booking_id, generated_at desc);

-- ---------------------------------------------------------------------
-- COMMENTS
-- ---------------------------------------------------------------------

comment on table domain.payment_intents is 'Payment provider intents with idempotency tracking';
comment on table domain.payment_transactions is 'Individual payment transactions: authorize, capture, void';
comment on table domain.refunds is 'Refund requests and processing status';
comment on table domain.payouts is 'Payouts to organizations (marketplace model)';
comment on table domain.payout_items is 'Line items for payout breakdown';
comment on table domain.receipts is 'Generated receipts with PDF attachments';
