-- Migration: Add Complete Notification System Tables
-- Created: 2026-01-15
-- Description: Creates tables for the full notification system including templates, queue, and delivery logs

-- ============================================================================
-- Notification Templates
-- ============================================================================
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- null = global template
  
  -- Template identification
  code VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Channel-specific content (JSONB for flexibility)
  email_template JSONB DEFAULT '{}',
  sms_template JSONB DEFAULT '{}',
  push_template JSONB DEFAULT '{}',
  in_app_template JSONB DEFAULT '{}',
  
  -- Variables available in this template
  available_variables JSONB DEFAULT '[]',
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_system BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  
  CONSTRAINT notification_templates_tenant_code_unique UNIQUE (tenant_id, code)
);

CREATE INDEX IF NOT EXISTS notification_templates_code_idx ON notification_templates(code);
CREATE INDEX IF NOT EXISTS notification_templates_active_idx ON notification_templates(is_active);

-- ============================================================================
-- Notifications (Individual instances)
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Recipient
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  
  -- Notification type
  type VARCHAR(100) NOT NULL,
  
  -- Content
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  -- Priority
  priority VARCHAR(20) NOT NULL DEFAULT 'normal',
  
  -- Related entities (for deep linking)
  related_entity_type VARCHAR(50),
  related_entity_id UUID,
  
  -- Action URL
  action_url VARCHAR(500),
  
  -- Additional data
  metadata JSONB DEFAULT '{}',
  
  -- Read status
  read_at TIMESTAMP,
  dismissed_at TIMESTAMP,
  
  -- Expiration
  expires_at TIMESTAMP,
  
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_tenant_user_idx ON notifications(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS notifications_user_read_idx ON notifications(user_id, read_at);
CREATE INDEX IF NOT EXISTS notifications_type_idx ON notifications(type);
CREATE INDEX IF NOT EXISTS notifications_priority_idx ON notifications(priority);
CREATE INDEX IF NOT EXISTS notifications_created_idx ON notifications(created_at);
CREATE INDEX IF NOT EXISTS notifications_expires_idx ON notifications(expires_at);

-- ============================================================================
-- Notification Delivery Logs
-- ============================================================================
CREATE TABLE IF NOT EXISTS notification_delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  
  -- Delivery channel
  channel VARCHAR(20) NOT NULL,
  
  -- Delivery status
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  
  -- Recipient address
  recipient_address VARCHAR(255),
  
  -- Provider response
  provider_message_id VARCHAR(255),
  provider_response JSONB DEFAULT '{}',
  
  -- Error tracking
  error_code VARCHAR(100),
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  next_retry_at TIMESTAMP,
  
  -- Timing
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  failed_at TIMESTAMP,
  
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notification_delivery_logs_notification_idx ON notification_delivery_logs(notification_id);
CREATE INDEX IF NOT EXISTS notification_delivery_logs_channel_idx ON notification_delivery_logs(channel);
CREATE INDEX IF NOT EXISTS notification_delivery_logs_status_idx ON notification_delivery_logs(status);
CREATE INDEX IF NOT EXISTS notification_delivery_logs_sent_at_idx ON notification_delivery_logs(sent_at);

-- ============================================================================
-- Notification Queue
-- ============================================================================
CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Target
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  
  -- Notification details
  type VARCHAR(100) NOT NULL,
  channels JSONB NOT NULL DEFAULT '[]',
  
  -- Template variables
  template_variables JSONB NOT NULL DEFAULT '{}',
  
  -- Related entities
  related_entity_type VARCHAR(50),
  related_entity_id UUID,
  
  -- Priority and scheduling
  priority VARCHAR(20) NOT NULL DEFAULT 'normal',
  scheduled_for TIMESTAMP,
  
  -- Processing status
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  processed_at TIMESTAMP,
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  
  -- Result tracking
  notification_id UUID REFERENCES notifications(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notification_queue_tenant_status_idx ON notification_queue(tenant_id, status);
CREATE INDEX IF NOT EXISTS notification_queue_scheduled_idx ON notification_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS notification_queue_priority_idx ON notification_queue(priority);
CREATE INDEX IF NOT EXISTS notification_queue_status_idx ON notification_queue(status);

-- ============================================================================
-- SMS Provider Config
-- ============================================================================
CREATE TABLE IF NOT EXISTS sms_provider_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
  
  provider VARCHAR(50) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  config JSONB NOT NULL DEFAULT '{}',
  
  -- Rate limiting
  daily_limit INTEGER DEFAULT 1000,
  monthly_limit INTEGER DEFAULT 10000,
  
  -- Usage tracking
  daily_count INTEGER NOT NULL DEFAULT 0,
  monthly_count INTEGER NOT NULL DEFAULT 0,
  last_reset_daily TIMESTAMP DEFAULT now(),
  last_reset_monthly TIMESTAMP DEFAULT now(),
  
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sms_provider_configs_active_idx ON sms_provider_configs(is_active);

-- ============================================================================
-- Email Provider Config
-- ============================================================================
CREATE TABLE IF NOT EXISTS email_provider_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
  
  provider VARCHAR(50) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  config JSONB NOT NULL DEFAULT '{}',
  
  -- Sender info
  from_email VARCHAR(255) NOT NULL,
  from_name VARCHAR(255),
  reply_to_email VARCHAR(255),
  
  -- Rate limiting
  daily_limit INTEGER DEFAULT 10000,
  monthly_limit INTEGER DEFAULT 100000,
  
  -- Usage tracking
  daily_count INTEGER NOT NULL DEFAULT 0,
  monthly_count INTEGER NOT NULL DEFAULT 0,
  last_reset_daily TIMESTAMP DEFAULT now(),
  last_reset_monthly TIMESTAMP DEFAULT now(),
  
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS email_provider_configs_active_idx ON email_provider_configs(is_active);

-- ============================================================================
-- Updated at triggers
-- ============================================================================
CREATE OR REPLACE FUNCTION update_notification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notification_templates_updated_at ON notification_templates;
CREATE TRIGGER notification_templates_updated_at
  BEFORE UPDATE ON notification_templates
  FOR EACH ROW EXECUTE FUNCTION update_notification_updated_at();

DROP TRIGGER IF EXISTS notification_queue_updated_at ON notification_queue;
CREATE TRIGGER notification_queue_updated_at
  BEFORE UPDATE ON notification_queue
  FOR EACH ROW EXECUTE FUNCTION update_notification_updated_at();

DROP TRIGGER IF EXISTS sms_provider_configs_updated_at ON sms_provider_configs;
CREATE TRIGGER sms_provider_configs_updated_at
  BEFORE UPDATE ON sms_provider_configs
  FOR EACH ROW EXECUTE FUNCTION update_notification_updated_at();

DROP TRIGGER IF EXISTS email_provider_configs_updated_at ON email_provider_configs;
CREATE TRIGGER email_provider_configs_updated_at
  BEFORE UPDATE ON email_provider_configs
  FOR EACH ROW EXECUTE FUNCTION update_notification_updated_at();

-- ============================================================================
-- Seed default notification templates
-- ============================================================================
INSERT INTO notification_templates (code, name, description, is_system, available_variables, email_template, sms_template, in_app_template)
VALUES
  ('request_received', 'Booking Request Received', 'Sent when a booking request is received', true, 
   '["userName", "listingName", "startDate", "endDate", "bookingId"]',
   '{"nb": {"subject": "Ny bookingforespørsel mottatt", "body": "Hei {{userName}},\n\nVi har mottatt din forespørsel om å booke {{listingName}} fra {{startDate}} til {{endDate}}.\n\nDu vil få beskjed når forespørselen er behandlet.\n\nMvh,\nDigilist"}, "en": {"subject": "Booking Request Received", "body": "Hi {{userName}},\n\nWe have received your request to book {{listingName}} from {{startDate}} to {{endDate}}.\n\nYou will be notified when the request is processed.\n\nBest regards,\nDigilist"}}',
   '{"nb": "Bookingforespørsel mottatt for {{listingName}} {{startDate}}. Du får beskjed når den er behandlet.", "en": "Booking request received for {{listingName}} {{startDate}}. You will be notified when processed."}',
   '{"nb": {"title": "Forespørsel mottatt", "body": "Din forespørsel om {{listingName}} er mottatt"}, "en": {"title": "Request Received", "body": "Your request for {{listingName}} has been received"}}'
  ),
  
  ('approved', 'Booking Approved', 'Sent when a booking is approved', true,
   '["userName", "listingName", "startDate", "endDate", "startTime", "endTime", "bookingId", "totalPrice"]',
   '{"nb": {"subject": "Din booking er godkjent!", "body": "Hei {{userName}},\n\nDin booking av {{listingName}} er godkjent!\n\nDetaljer:\n- Dato: {{startDate}}\n- Tid: {{startTime}} - {{endTime}}\n- Pris: {{totalPrice}} kr\n\nVi ser frem til å se deg!\n\nMvh,\nDigilist"}, "en": {"subject": "Your Booking is Approved!", "body": "Hi {{userName}},\n\nYour booking for {{listingName}} has been approved!\n\nDetails:\n- Date: {{startDate}}\n- Time: {{startTime}} - {{endTime}}\n- Price: {{totalPrice}} NOK\n\nWe look forward to seeing you!\n\nBest regards,\nDigilist"}}',
   '{"nb": "Din booking av {{listingName}} {{startDate}} kl {{startTime}} er godkjent!", "en": "Your booking for {{listingName}} {{startDate}} at {{startTime}} is approved!"}',
   '{"nb": {"title": "Booking godkjent", "body": "{{listingName}} - {{startDate}} kl {{startTime}}"}, "en": {"title": "Booking Approved", "body": "{{listingName}} - {{startDate}} at {{startTime}}"}}'
  ),
  
  ('rejected', 'Booking Rejected', 'Sent when a booking is rejected', true,
   '["userName", "listingName", "startDate", "rejectionReason", "bookingId"]',
   '{"nb": {"subject": "Din bookingforespørsel ble avslått", "body": "Hei {{userName}},\n\nVi beklager å informere om at din forespørsel om {{listingName}} for {{startDate}} ble avslått.\n\nBegrunnelse: {{rejectionReason}}\n\nDu kan gjerne prøve å booke et annet tidspunkt.\n\nMvh,\nDigilist"}, "en": {"subject": "Your Booking Request Was Declined", "body": "Hi {{userName}},\n\nWe regret to inform you that your request for {{listingName}} on {{startDate}} was declined.\n\nReason: {{rejectionReason}}\n\nFeel free to try booking another time.\n\nBest regards,\nDigilist"}}',
   '{"nb": "Din forespørsel om {{listingName}} {{startDate}} ble dessverre avslått.", "en": "Your request for {{listingName}} {{startDate}} was unfortunately declined."}',
   '{"nb": {"title": "Forespørsel avslått", "body": "{{listingName}} - {{startDate}}"}, "en": {"title": "Request Declined", "body": "{{listingName}} - {{startDate}}"}}'
  ),
  
  ('booking_changed', 'Booking Changed', 'Sent when a booking is modified', true,
   '["userName", "listingName", "oldStartDate", "newStartDate", "oldStartTime", "newStartTime", "bookingId"]',
   '{"nb": {"subject": "Din booking er endret", "body": "Hei {{userName}},\n\nDin booking av {{listingName}} er blitt endret.\n\nGammel tid: {{oldStartDate}} kl {{oldStartTime}}\nNy tid: {{newStartDate}} kl {{newStartTime}}\n\nMvh,\nDigilist"}, "en": {"subject": "Your Booking Has Been Changed", "body": "Hi {{userName}},\n\nYour booking for {{listingName}} has been changed.\n\nOld time: {{oldStartDate}} at {{oldStartTime}}\nNew time: {{newStartDate}} at {{newStartTime}}\n\nBest regards,\nDigilist"}}',
   '{"nb": "Viktig: Din booking av {{listingName}} er endret til {{newStartDate}} kl {{newStartTime}}", "en": "Important: Your booking for {{listingName}} changed to {{newStartDate}} at {{newStartTime}}"}',
   '{"nb": {"title": "Booking endret", "body": "{{listingName}} flyttet til {{newStartDate}}"}, "en": {"title": "Booking Changed", "body": "{{listingName}} moved to {{newStartDate}}"}}'
  ),
  
  ('cancelled', 'Booking Cancelled', 'Sent when a booking is cancelled', true,
   '["userName", "listingName", "startDate", "cancellationReason", "bookingId"]',
   '{"nb": {"subject": "Booking avlyst", "body": "Hei {{userName}},\n\nVi må dessverre informere om at din booking av {{listingName}} for {{startDate}} er avlyst.\n\nBegrunnelse: {{cancellationReason}}\n\nVi beklager eventuelle ulemper dette medfører.\n\nMvh,\nDigilist"}, "en": {"subject": "Booking Cancelled", "body": "Hi {{userName}},\n\nWe regret to inform you that your booking for {{listingName}} on {{startDate}} has been cancelled.\n\nReason: {{cancellationReason}}\n\nWe apologize for any inconvenience.\n\nBest regards,\nDigilist"}}',
   '{"nb": "AVLYST: Din booking av {{listingName}} {{startDate}} er avlyst. {{cancellationReason}}", "en": "CANCELLED: Your booking for {{listingName}} {{startDate}} is cancelled. {{cancellationReason}}"}',
   '{"nb": {"title": "Booking avlyst", "body": "{{listingName}} - {{startDate}} er avlyst"}, "en": {"title": "Booking Cancelled", "body": "{{listingName}} - {{startDate}} is cancelled"}}'
  ),
  
  ('reminder_24h', 'Reminder 24 Hours Before', 'Sent 24 hours before booking', true,
   '["userName", "listingName", "startDate", "startTime", "endTime", "address", "bookingId"]',
   '{"nb": {"subject": "Påminnelse: Booking i morgen", "body": "Hei {{userName}},\n\nDette er en påminnelse om at du har en booking i morgen:\n\n{{listingName}}\nDato: {{startDate}}\nTid: {{startTime}} - {{endTime}}\nAdresse: {{address}}\n\nVi ser frem til å se deg!\n\nMvh,\nDigilist"}, "en": {"subject": "Reminder: Booking Tomorrow", "body": "Hi {{userName}},\n\nThis is a reminder that you have a booking tomorrow:\n\n{{listingName}}\nDate: {{startDate}}\nTime: {{startTime}} - {{endTime}}\nAddress: {{address}}\n\nWe look forward to seeing you!\n\nBest regards,\nDigilist"}}',
   '{"nb": "Påminnelse: {{listingName}} i morgen {{startDate}} kl {{startTime}}. Adresse: {{address}}", "en": "Reminder: {{listingName}} tomorrow {{startDate}} at {{startTime}}. Address: {{address}}"}',
   '{"nb": {"title": "Booking i morgen", "body": "{{listingName}} kl {{startTime}}"}, "en": {"title": "Booking Tomorrow", "body": "{{listingName}} at {{startTime}}"}}'
  ),
  
  ('reminder_2h', 'Reminder 2 Hours Before', 'Sent 2 hours before booking', true,
   '["userName", "listingName", "startTime", "address", "bookingId"]',
   '{"nb": {"subject": "Påminnelse: Booking om 2 timer", "body": "Hei {{userName}},\n\nDin booking starter om 2 timer:\n\n{{listingName}}\nTid: {{startTime}}\nAdresse: {{address}}\n\nVi sees snart!\n\nMvh,\nDigilist"}, "en": {"subject": "Reminder: Booking in 2 Hours", "body": "Hi {{userName}},\n\nYour booking starts in 2 hours:\n\n{{listingName}}\nTime: {{startTime}}\nAddress: {{address}}\n\nSee you soon!\n\nBest regards,\nDigilist"}}',
   '{"nb": "Snart: {{listingName}} starter kl {{startTime}}. Adresse: {{address}}", "en": "Soon: {{listingName}} starts at {{startTime}}. Address: {{address}}"}',
   '{"nb": {"title": "Starter om 2 timer", "body": "{{listingName}} kl {{startTime}}"}, "en": {"title": "Starts in 2 Hours", "body": "{{listingName}} at {{startTime}}"}}'
  ),
  
  ('invoice_available', 'Invoice Available', 'Sent when an invoice is ready', true,
   '["userName", "invoiceNumber", "amount", "dueDate", "invoiceUrl"]',
   '{"nb": {"subject": "Faktura tilgjengelig", "body": "Hei {{userName}},\n\nEn ny faktura er klar:\n\nFakturanummer: {{invoiceNumber}}\nBeløp: {{amount}} kr\nForfallsdato: {{dueDate}}\n\nSe faktura: {{invoiceUrl}}\n\nMvh,\nDigilist"}, "en": {"subject": "Invoice Available", "body": "Hi {{userName}},\n\nA new invoice is ready:\n\nInvoice number: {{invoiceNumber}}\nAmount: {{amount}} NOK\nDue date: {{dueDate}}\n\nView invoice: {{invoiceUrl}}\n\nBest regards,\nDigilist"}}',
   '{"nb": "Ny faktura: {{invoiceNumber}} på {{amount}} kr. Forfall: {{dueDate}}", "en": "New invoice: {{invoiceNumber}} for {{amount}} NOK. Due: {{dueDate}}"}',
   '{"nb": {"title": "Faktura klar", "body": "{{invoiceNumber}} - {{amount}} kr"}, "en": {"title": "Invoice Ready", "body": "{{invoiceNumber}} - {{amount}} NOK"}}'
  ),
  
  ('payment_status', 'Payment Status Changed', 'Sent when payment status changes', true,
   '["userName", "invoiceNumber", "newStatus", "amount"]',
   '{"nb": {"subject": "Betalingsstatus oppdatert", "body": "Hei {{userName}},\n\nBetalingsstatus for faktura {{invoiceNumber}} er oppdatert til: {{newStatus}}\n\nBeløp: {{amount}} kr\n\nMvh,\nDigilist"}, "en": {"subject": "Payment Status Updated", "body": "Hi {{userName}},\n\nPayment status for invoice {{invoiceNumber}} has been updated to: {{newStatus}}\n\nAmount: {{amount}} NOK\n\nBest regards,\nDigilist"}}',
   '{"nb": "Betaling: Faktura {{invoiceNumber}} - {{newStatus}}", "en": "Payment: Invoice {{invoiceNumber}} - {{newStatus}}"}',
   '{"nb": {"title": "Betaling oppdatert", "body": "{{invoiceNumber}} - {{newStatus}}"}, "en": {"title": "Payment Updated", "body": "{{invoiceNumber}} - {{newStatus}}"}}'
  ),
  
  ('request_more_info', 'Request More Information', 'Sent when more info is needed from booker', true,
   '["userName", "listingName", "bookingId", "requestMessage", "responseUrl"]',
   '{"nb": {"subject": "Mer informasjon trengs for din booking", "body": "Hei {{userName}},\n\nVi trenger mer informasjon om din bookingforespørsel for {{listingName}}:\n\n{{requestMessage}}\n\nVennligst svar her: {{responseUrl}}\n\nMvh,\nDigilist"}, "en": {"subject": "More Information Needed for Your Booking", "body": "Hi {{userName}},\n\nWe need more information about your booking request for {{listingName}}:\n\n{{requestMessage}}\n\nPlease respond here: {{responseUrl}}\n\nBest regards,\nDigilist"}}',
   '{"nb": "Mer info trengs for booking av {{listingName}}. Se e-post for detaljer.", "en": "More info needed for {{listingName}} booking. Check email for details."}',
   '{"nb": {"title": "Mer info trengs", "body": "{{listingName}} - vennligst svar på forespørselen"}, "en": {"title": "More Info Needed", "body": "{{listingName}} - please respond to the request"}}'
  )
ON CONFLICT (tenant_id, code) DO NOTHING;
