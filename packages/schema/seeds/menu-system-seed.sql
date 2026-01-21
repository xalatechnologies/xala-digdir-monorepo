-- Seed Data: DB-Driven Backoffice Menu System
-- Version: 0006
-- Created: 2026-01-19
-- Description: Seeds default roles, permissions, feature flags, and menu template

-- ============================================================================
-- 1. SEED ROLES
-- ============================================================================

INSERT INTO saas.roles (code, scope, name_nb, name_en, description_nb, description_en, sort_order) VALUES
('SAAS_ADMIN', 'PLATFORM', 'Plattformadministrator', 'Platform Admin', 'Full plattformtilgang', 'Full platform access', 0),
('TENANT_ADMIN', 'TENANT', 'Kommuneadministrator', 'Tenant Admin', 'Full kommunetilgang', 'Full tenant access', 10),
('ORG_ADMIN', 'ORG', 'Organisasjonsadministrator', 'Organization Admin', 'Organisasjonsadministrator', 'Organization administrator', 20),
('TENANT_USER', 'TENANT', 'Kommunebruker', 'Tenant User', 'Standard kommunebruker', 'Standard tenant user', 30),
('ORG_USER', 'ORG', 'Organisasjonsbruker', 'Organization User', 'Standard organisasjonsbruker', 'Standard organization user', 40),
('CASE_HANDLER', 'TENANT', 'Saksbehandler', 'Case Handler', 'Behandler bookingforespørsler', 'Handles booking requests', 50)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 2. SEED PERMISSIONS
-- ============================================================================

INSERT INTO saas.permissions (code, category, description_nb, description_en) VALUES
-- Dashboard
('view:dashboard', 'dashboard', 'Se dashbord', 'View dashboard'),

-- Bookings
('view:bookings', 'bookings', 'Se bookinger', 'View bookings'),
('create:bookings', 'bookings', 'Opprette bookinger', 'Create bookings'),
('edit:bookings', 'bookings', 'Redigere bookinger', 'Edit bookings'),
('delete:bookings', 'bookings', 'Slette bookinger', 'Delete bookings'),
('approve:bookings', 'bookings', 'Godkjenne bookinger', 'Approve bookings'),
('deny:bookings', 'bookings', 'Avslå bookinger', 'Deny bookings'),

-- Calendar
('view:calendar', 'calendar', 'Se kalender', 'View calendar'),
('manage:calendar', 'calendar', 'Administrere kalender', 'Manage calendar'),

-- Seasons
('view:seasons', 'seasons', 'Se sesongleie', 'View seasonal rentals'),
('manage:seasons', 'seasons', 'Administrere sesongleie', 'Manage seasonal rentals'),

-- Reviews
('view:reviews', 'reviews', 'Se anmeldelser', 'View reviews'),
('manage:reviews', 'reviews', 'Administrere anmeldelser', 'Manage reviews'),

-- Rental Objects
('view:rental_objects', 'rental_objects', 'Se utleieobjekter', 'View rental objects'),
('create:rental_objects', 'rental_objects', 'Opprette utleieobjekter', 'Create rental objects'),
('edit:rental_objects', 'rental_objects', 'Redigere utleieobjekter', 'Edit rental objects'),
('delete:rental_objects', 'rental_objects', 'Slette utleieobjekter', 'Delete rental objects'),

-- Pricing
('view:pricing', 'pricing', 'Se priser', 'View pricing'),
('manage:pricing', 'pricing', 'Administrere priser', 'Manage pricing'),

-- Messages
('view:messages', 'messages', 'Se meldinger', 'View messages'),
('send:messages', 'messages', 'Sende meldinger', 'Send messages'),
('manage:message_templates', 'messages', 'Administrere meldingsmaler', 'Manage message templates'),

-- Reports
('view:reports', 'reports', 'Se rapporter', 'View reports'),
('export:reports', 'reports', 'Eksportere rapporter', 'Export reports'),

-- Economy
('view:economy', 'economy', 'Se økonomi', 'View economy'),
('manage:economy', 'economy', 'Administrere økonomi', 'Manage economy'),

-- Audit
('view:audit_log', 'audit', 'Se revisjonslogg', 'View audit log'),

-- System
('manage:system', 'system', 'Administrere system', 'Manage system'),

-- Settings
('view:settings', 'settings', 'Se innstillinger', 'View settings'),
('manage:settings', 'settings', 'Administrere innstillinger', 'Manage settings')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 3. ASSIGN PERMISSIONS TO ROLES
-- ============================================================================

-- SAAS_ADMIN: All permissions
INSERT INTO saas.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM saas.roles r
CROSS JOIN saas.permissions p
WHERE r.code = 'SAAS_ADMIN'
ON CONFLICT DO NOTHING;

-- TENANT_ADMIN: All except platform-level permissions
INSERT INTO saas.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM saas.roles r
CROSS JOIN saas.permissions p
WHERE r.code = 'TENANT_ADMIN'
  AND p.code NOT IN ('manage:system')
ON CONFLICT DO NOTHING;

-- ORG_ADMIN: Organization management permissions
INSERT INTO saas.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM saas.roles r
CROSS JOIN saas.permissions p
WHERE r.code = 'ORG_ADMIN'
  AND p.code IN (
    'view:dashboard',
    'view:bookings', 'create:bookings', 'edit:bookings',
    'view:calendar', 'manage:calendar',
    'view:seasons', 'manage:seasons',
    'view:reviews',
    'view:rental_objects',
    'view:messages', 'send:messages',
    'view:reports',
    'view:settings', 'manage:settings'
  )
ON CONFLICT DO NOTHING;

-- TENANT_USER: Read-only operational permissions
INSERT INTO saas.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM saas.roles r
CROSS JOIN saas.permissions p
WHERE r.code = 'TENANT_USER'
  AND p.code IN (
    'view:dashboard',
    'view:bookings', 'create:bookings',
    'view:calendar',
    'view:seasons',
    'view:reviews',
    'view:rental_objects',
    'view:messages', 'send:messages',
    'view:settings'
  )
ON CONFLICT DO NOTHING;

-- ORG_USER: Similar to TENANT_USER but organization-scoped
INSERT INTO saas.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM saas.roles r
CROSS JOIN saas.permissions p
WHERE r.code = 'ORG_USER'
  AND p.code IN (
    'view:dashboard',
    'view:bookings', 'create:bookings',
    'view:calendar',
    'view:seasons',
    'view:reviews',
    'view:rental_objects',
    'view:messages', 'send:messages',
    'view:settings'
  )
ON CONFLICT DO NOTHING;

-- CASE_HANDLER: Booking approval + limited operational access
INSERT INTO saas.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM saas.roles r
CROSS JOIN saas.permissions p
WHERE r.code = 'CASE_HANDLER'
  AND p.code IN (
    'view:dashboard',
    'view:bookings', 'approve:bookings', 'deny:bookings',
    'view:calendar',
    'view:rental_objects',
    'view:messages', 'send:messages',
    'view:settings'
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4. SEED FEATURE FLAGS
-- ============================================================================

INSERT INTO saas.feature_flags (code, type, default_value, description_nb, description_en) VALUES
('FEATURE_RECURRING', 'BOOLEAN', 'false', 'Sesongleie og gjentakende bookinger', 'Seasonal and recurring bookings'),
('FEATURE_REVIEWS', 'BOOLEAN', 'false', 'Kundeanmeldelser og vurderinger', 'Customer reviews and ratings'),
('FEATURE_ECONOMY', 'BOOLEAN', 'false', 'Økonomisk rapportering', 'Financial reporting module'),
('FEATURE_AUDIT_LOG', 'BOOLEAN', 'false', 'Detaljert revisjonslogging', 'Detailed audit logging'),
('FEATURE_MESSAGING', 'BOOLEAN', 'true', 'Meldingssystem i appen', 'In-app messaging system')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 5. CREATE DEFAULT MENU TEMPLATE
-- ============================================================================

INSERT INTO saas.menu_templates (code, version, status, name_nb, name_en, notes, published_at)
VALUES (
  'default',
  1,
  'PUBLISHED',
  'Standard Backoffice-meny',
  'Default Backoffice Menu',
  'Default menu template for all tenants',
  NOW()
)
ON CONFLICT (code, version) DO NOTHING;

-- Get template ID for subsequent inserts
DO $$
DECLARE
  template_id UUID;
  cat_overview_id UUID;
  cat_operations_id UUID;
  cat_resources_id UUID;
  cat_communication_id UUID;
  cat_insights_id UUID;
  cat_governance_id UUID;
  cat_settings_id UUID;
  
  item_dashboard_id UUID;
  item_bookings_id UUID;
  item_calendar_id UUID;
  item_seasons_id UUID;
  item_reviews_id UUID;
  item_listings_id UUID;
  item_pricing_id UUID;
  item_messages_id UUID;
  item_templates_id UUID;
  item_reports_id UUID;
  item_economy_id UUID;
  item_audit_id UUID;
  item_system_id UUID;
  item_settings_id UUID;
  item_help_id UUID;
  
  perm_view_dashboard UUID;
  perm_view_bookings UUID;
  perm_approve_bookings UUID;
  perm_view_calendar UUID;
  perm_view_seasons UUID;
  perm_view_reviews UUID;
  perm_view_rental_objects UUID;
  perm_manage_pricing UUID;
  perm_view_messages UUID;
  perm_manage_templates UUID;
  perm_view_reports UUID;
  perm_view_economy UUID;
  perm_view_audit UUID;
  perm_manage_system UUID;
  perm_view_settings UUID;
  
  flag_recurring UUID;
  flag_reviews UUID;
  flag_economy UUID;
  flag_audit UUID;
BEGIN
  -- Get template ID
  SELECT id INTO template_id FROM saas.menu_templates WHERE code = 'default' AND version = 1;
  
  -- ============================================================================
  -- 6. CREATE MENU CATEGORIES
  -- ============================================================================
  
  INSERT INTO saas.menu_categories (template_id, key, label_nb, label_en, icon_key, sort_order, is_collapsible, default_expanded)
  VALUES
    (template_id, 'overview', 'Oversikt', 'Overview', 'dashboard', 0, FALSE, TRUE),
    (template_id, 'operations', 'Drift', 'Operations', 'calendar', 10, TRUE, TRUE),
    (template_id, 'resources', 'Ressurser', 'Resources', 'building', 20, TRUE, TRUE),
    (template_id, 'communication', 'Kommunikasjon', 'Communication', 'mail', 30, TRUE, TRUE),
    (template_id, 'insights', 'Innsikt', 'Insights', 'chart', 40, TRUE, FALSE),
    (template_id, 'governance', 'Styring', 'Governance', 'shield-check', 50, TRUE, FALSE),
    (template_id, 'settings', 'Innstillinger', 'Settings', 'settings', 60, FALSE, TRUE)
  ON CONFLICT (template_id, key) DO NOTHING
  RETURNING id INTO cat_overview_id;
  
  -- Get category IDs
  SELECT id INTO cat_overview_id FROM saas.menu_categories WHERE template_id = template_id AND key = 'overview';
  SELECT id INTO cat_operations_id FROM saas.menu_categories WHERE template_id = template_id AND key = 'operations';
  SELECT id INTO cat_resources_id FROM saas.menu_categories WHERE template_id = template_id AND key = 'resources';
  SELECT id INTO cat_communication_id FROM saas.menu_categories WHERE template_id = template_id AND key = 'communication';
  SELECT id INTO cat_insights_id FROM saas.menu_categories WHERE template_id = template_id AND key = 'insights';
  SELECT id INTO cat_governance_id FROM saas.menu_categories WHERE template_id = template_id AND key = 'governance';
  SELECT id INTO cat_settings_id FROM saas.menu_categories WHERE template_id = template_id AND key = 'settings';
  
  -- ============================================================================
  -- 7. CREATE MENU ITEMS
  -- ============================================================================
  
  -- Overview Category
  INSERT INTO saas.menu_items (template_id, category_id, key, label_nb, label_en, route, icon_key, sort_order, visibility_scope)
  VALUES (template_id, cat_overview_id, 'dashboard', 'Dashbord', 'Dashboard', '/dashboard', 'dashboard', 0, 'TENANT')
  ON CONFLICT (template_id, key) DO NOTHING;
  
  -- Operations Category
  INSERT INTO saas.menu_items (template_id, category_id, key, label_nb, label_en, route, icon_key, sort_order, visibility_scope)
  VALUES
    (template_id, cat_operations_id, 'bookings', 'Bookinger', 'Bookings', '/bookings', 'clock', 0, 'TENANT'),
    (template_id, cat_operations_id, 'bookings.pending', 'Ventende forespørsler', 'Pending Requests', '/bookings/pending', 'clock', 5, 'TENANT'),
    (template_id, cat_operations_id, 'calendar', 'Kalender', 'Calendar', '/calendar', 'calendar', 10, 'TENANT'),
    (template_id, cat_operations_id, 'seasons', 'Sesongleie', 'Seasonal Rentals', '/seasons', 'repeat', 20, 'TENANT'),
    (template_id, cat_operations_id, 'reviews', 'Anmeldelser', 'Reviews', '/reviews', 'star', 30, 'TENANT')
  ON CONFLICT (template_id, key) DO NOTHING;
  
  -- Resources Category
  INSERT INTO saas.menu_items (template_id, category_id, key, label_nb, label_en, route, icon_key, sort_order, visibility_scope)
  VALUES
    (template_id, cat_resources_id, 'rental-objects', 'Utleieobjekter', 'Listings', '/rental-objects', 'building', 0, 'TENANT'),
    (template_id, cat_resources_id, 'price-groups', 'Prisgrupper', 'Price Groups', '/price-groups', 'currency', 10, 'TENANT')
  ON CONFLICT (template_id, key) DO NOTHING;
  
  -- Communication Category
  INSERT INTO saas.menu_items (template_id, category_id, key, label_nb, label_en, route, icon_key, sort_order, visibility_scope)
  VALUES
    (template_id, cat_communication_id, 'messages', 'Meldinger', 'Messages', '/messages', 'mail', 0, 'TENANT'),
    (template_id, cat_communication_id, 'message-templates', 'Meldingsmaler', 'Message Templates', '/message-templates', 'file-text', 10, 'TENANT')
  ON CONFLICT (template_id, key) DO NOTHING;
  
  -- Insights Category
  INSERT INTO saas.menu_items (template_id, category_id, key, label_nb, label_en, route, icon_key, sort_order, visibility_scope)
  VALUES
    (template_id, cat_insights_id, 'reports', 'Rapporter', 'Reports', '/reports', 'chart', 0, 'TENANT'),
    (template_id, cat_insights_id, 'economy', 'Økonomi', 'Economy', '/economy', 'currency', 10, 'TENANT')
  ON CONFLICT (template_id, key) DO NOTHING;
  
  -- Governance Category
  INSERT INTO saas.menu_items (template_id, category_id, key, label_nb, label_en, route, icon_key, sort_order, visibility_scope)
  VALUES
    (template_id, cat_governance_id, 'audit-log', 'Revisjonslogg', 'Audit Log', '/audit', 'shield-check', 0, 'TENANT'),
    (template_id, cat_governance_id, 'system', 'System', 'System', '/system', 'settings', 10, 'PLATFORM')
  ON CONFLICT (template_id, key) DO NOTHING;
  
  -- Settings Category
  INSERT INTO saas.menu_items (template_id, category_id, key, label_nb, label_en, route, icon_key, sort_order, visibility_scope)
  VALUES
    (template_id, cat_settings_id, 'settings', 'Innstillinger', 'Settings', '/settings', 'settings', 0, 'TENANT'),
    (template_id, cat_settings_id, 'help', 'Hjelp og støtte', 'Help & Support', '/help', 'help-circle', 10, 'TENANT')
  ON CONFLICT (template_id, key) DO NOTHING;
  
  -- ============================================================================
  -- 8. ASSIGN PERMISSIONS TO MENU ITEMS
  -- ============================================================================
  
  -- Get menu item IDs
  SELECT id INTO item_dashboard_id FROM saas.menu_items WHERE template_id = template_id AND key = 'dashboard';
  SELECT id INTO item_bookings_id FROM saas.menu_items WHERE template_id = template_id AND key = 'bookings';
  SELECT id INTO item_calendar_id FROM saas.menu_items WHERE template_id = template_id AND key = 'calendar';
  SELECT id INTO item_seasons_id FROM saas.menu_items WHERE template_id = template_id AND key = 'seasons';
  SELECT id INTO item_reviews_id FROM saas.menu_items WHERE template_id = template_id AND key = 'reviews';
  SELECT id INTO item_listings_id FROM saas.menu_items WHERE template_id = template_id AND key = 'rental-objects';
  SELECT id INTO item_pricing_id FROM saas.menu_items WHERE template_id = template_id AND key = 'price-groups';
  SELECT id INTO item_messages_id FROM saas.menu_items WHERE template_id = template_id AND key = 'messages';
  SELECT id INTO item_templates_id FROM saas.menu_items WHERE template_id = template_id AND key = 'message-templates';
  SELECT id INTO item_reports_id FROM saas.menu_items WHERE template_id = template_id AND key = 'reports';
  SELECT id INTO item_economy_id FROM saas.menu_items WHERE template_id = template_id AND key = 'economy';
  SELECT id INTO item_audit_id FROM saas.menu_items WHERE template_id = template_id AND key = 'audit-log';
  SELECT id INTO item_system_id FROM saas.menu_items WHERE template_id = template_id AND key = 'system';
  SELECT id INTO item_settings_id FROM saas.menu_items WHERE template_id = template_id AND key = 'settings';
  SELECT id INTO item_help_id FROM saas.menu_items WHERE template_id = template_id AND key = 'help';
  
  -- Get permission IDs
  SELECT id INTO perm_view_dashboard FROM saas.permissions WHERE code = 'view:dashboard';
  SELECT id INTO perm_view_bookings FROM saas.permissions WHERE code = 'view:bookings';
  SELECT id INTO perm_approve_bookings FROM saas.permissions WHERE code = 'approve:bookings';
  SELECT id INTO perm_view_calendar FROM saas.permissions WHERE code = 'view:calendar';
  SELECT id INTO perm_view_seasons FROM saas.permissions WHERE code = 'view:seasons';
  SELECT id INTO perm_view_reviews FROM saas.permissions WHERE code = 'view:reviews';
  SELECT id INTO perm_view_rental_objects FROM saas.permissions WHERE code = 'view:rental_objects';
  SELECT id INTO perm_manage_pricing FROM saas.permissions WHERE code = 'manage:pricing';
  SELECT id INTO perm_view_messages FROM saas.permissions WHERE code = 'view:messages';
  SELECT id INTO perm_manage_templates FROM saas.permissions WHERE code = 'manage:message_templates';
  SELECT id INTO perm_view_reports FROM saas.permissions WHERE code = 'view:reports';
  SELECT id INTO perm_view_economy FROM saas.permissions WHERE code = 'view:economy';
  SELECT id INTO perm_view_audit FROM saas.permissions WHERE code = 'view:audit_log';
  SELECT id INTO perm_manage_system FROM saas.permissions WHERE code = 'manage:system';
  SELECT id INTO perm_view_settings FROM saas.permissions WHERE code = 'view:settings';
  
  -- Assign permissions
  INSERT INTO saas.menu_item_permissions (menu_item_id, permission_id) VALUES
    (item_dashboard_id, perm_view_dashboard),
    (item_bookings_id, perm_view_bookings),
    (item_calendar_id, perm_view_calendar),
    (item_seasons_id, perm_view_seasons),
    (item_reviews_id, perm_view_reviews),
    (item_listings_id, perm_view_rental_objects),
    (item_pricing_id, perm_manage_pricing),
    (item_messages_id, perm_view_messages),
    (item_templates_id, perm_manage_templates),
    (item_reports_id, perm_view_reports),
    (item_economy_id, perm_view_economy),
    (item_audit_id, perm_view_audit),
    (item_system_id, perm_manage_system),
    (item_settings_id, perm_view_settings)
  ON CONFLICT DO NOTHING;
  
  -- Pending Requests requires approve OR deny permission
  INSERT INTO saas.menu_item_permissions (menu_item_id, permission_id)
  SELECT id, perm_approve_bookings
  FROM saas.menu_items
  WHERE template_id = template_id AND key = 'bookings.pending'
  ON CONFLICT DO NOTHING;
  
  -- ============================================================================
  -- 9. ASSIGN FEATURE FLAGS TO MENU ITEMS
  -- ============================================================================
  
  -- Get feature flag IDs
  SELECT id INTO flag_recurring FROM saas.feature_flags WHERE code = 'FEATURE_RECURRING';
  SELECT id INTO flag_reviews FROM saas.feature_flags WHERE code = 'FEATURE_REVIEWS';
  SELECT id INTO flag_economy FROM saas.feature_flags WHERE code = 'FEATURE_ECONOMY';
  SELECT id INTO flag_audit FROM saas.feature_flags WHERE code = 'FEATURE_AUDIT_LOG';
  
  -- Assign flags
  INSERT INTO saas.menu_item_flags (menu_item_id, feature_flag_id) VALUES
    (item_seasons_id, flag_recurring),
    (item_reviews_id, flag_reviews),
    (item_economy_id, flag_economy),
    (item_audit_id, flag_audit)
  ON CONFLICT DO NOTHING;
  
  -- ============================================================================
  -- 10. CREATE ROLE OVERRIDES FOR CASE_HANDLER
  -- ============================================================================
  
  INSERT INTO saas.role_menu_overrides (template_id, role_code, hidden_item_keys, notes)
  VALUES (
    template_id,
    'CASE_HANDLER',
    ARRAY['seasons', 'reviews', 'price-groups', 'message-templates', 'reports', 'economy', 'audit-log', 'system'],
    'Case handlers see only operational items: dashboard, bookings, pending requests, calendar, messages, settings, help'
  )
  ON CONFLICT (template_id, role_code) DO NOTHING;
  
END $$;
