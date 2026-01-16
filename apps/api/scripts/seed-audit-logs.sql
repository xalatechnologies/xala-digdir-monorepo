-- Audit Logs Seed - Activity History
-- Uses real user IDs from the database

-- Clear existing audit logs
DELETE FROM audit_logs;

-- Get tenant ID
DO $$
DECLARE
    tenant_uuid UUID;
    admin_uuid UUID := '66666666-6666-6666-6666-666666666666';
    manager_uuid UUID := '77777777-7777-7777-7777-777777777777';
    staff_uuid UUID := '88888888-8888-8888-8888-888888888888';
    demo_uuid UUID := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
BEGIN
    -- Get the first tenant
    SELECT id INTO tenant_uuid FROM tenants LIMIT 1;
    
    -- Recent activities (last 7 days)
    
    INSERT INTO audit_logs (tenant_id, user_id, action, resource, resource_id, severity, metadata, ip_address, user_agent, timestamp)
    VALUES (
        tenant_uuid, admin_uuid, 'create', 'booking', gen_random_uuid()::text, 'info',
        '{"listingName": "Kulturhuset - Storsalen"}'::jsonb,
        '127.0.0.1', 'Mozilla/5.0', NOW() - INTERVAL '12 hours'
    );
    
    INSERT INTO audit_logs (tenant_id, user_id, action, resource, resource_id, severity, metadata, ip_address, user_agent, timestamp)
    VALUES (
        tenant_uuid, manager_uuid, 'confirm', 'booking', gen_random_uuid()::text, 'info',
        '{"listingName": "Idrettshallen - Hovedhall"}'::jsonb,
        '127.0.0.1', 'Mozilla/5.0', NOW() - INTERVAL '1 day'
    );
    
    INSERT INTO audit_logs (tenant_id, user_id, action, resource, resource_id, severity, metadata, ip_address, user_agent, timestamp)
    VALUES (
        tenant_uuid, staff_uuid, 'create', 'booking', gen_random_uuid()::text, 'info',
        '{"listingName": "Tennisbane 1"}'::jsonb,
        '127.0.0.1', 'Mozilla/5.0', NOW() - INTERVAL '1.5 days'
    );
    
    INSERT INTO audit_logs (tenant_id, user_id, action, resource, resource_id, severity, metadata, ip_address, user_agent, timestamp)
    VALUES (
        tenant_uuid, admin_uuid, 'update', 'listing', gen_random_uuid()::text, 'info',
        '{"listingName": "Kulturhuset - Storsalen", "changes": ["pricing", "description"]}'::jsonb,
        '127.0.0.1', 'Mozilla/5.0', NOW() - INTERVAL '2 days'
    );
    
    INSERT INTO audit_logs (tenant_id, user_id, action, resource, resource_id, severity, metadata, ip_address, user_agent, timestamp)
    VALUES (
        tenant_uuid, admin_uuid, 'publish', 'listing', gen_random_uuid()::text, 'info',
        '{"listingName": "Biblioteket - Auditorium"}'::jsonb,
        '127.0.0.1', 'Mozilla/5.0', NOW() - INTERVAL '2.5 days'
    );
    
    INSERT INTO audit_logs (tenant_id, user_id, action, resource, resource_id, severity, metadata, ip_address, user_agent, timestamp)
    VALUES (
        tenant_uuid, manager_uuid, 'login', 'auth', manager_uuid::text, 'info',
        '{"method": "bankid"}'::jsonb,
        '127.0.0.1', 'Mozilla/5.0', NOW() - INTERVAL '3 days'
    );
    
    INSERT INTO audit_logs (tenant_id, user_id, action, resource, resource_id, severity, metadata, ip_address, user_agent, timestamp)
    VALUES (
        tenant_uuid, staff_uuid, 'cancel', 'booking', gen_random_uuid()::text, 'warning',
        '{"listingName": "Rådhussalen", "reason": "Endret planer"}'::jsonb,
        '127.0.0.1', 'Mozilla/5.0', NOW() - INTERVAL '3.5 days'
    );
    
    INSERT INTO audit_logs (tenant_id, user_id, action, resource, resource_id, severity, metadata, ip_address, user_agent, timestamp)
    VALUES (
        tenant_uuid, admin_uuid, 'create', 'user', gen_random_uuid()::text, 'info',
        '{"userName": "Ny Bruker", "role": "member"}'::jsonb,
        '127.0.0.1', 'Mozilla/5.0', NOW() - INTERVAL '4 days'
    );
    
    INSERT INTO audit_logs (tenant_id, user_id, action, resource, resource_id, severity, metadata, ip_address, user_agent, timestamp)
    VALUES (
        tenant_uuid, admin_uuid, 'update', 'listing', gen_random_uuid()::text, 'info',
        '{"listingName": "Idrettshallen - Hovedhall", "changes": ["capacity"]}'::jsonb,
        '127.0.0.1', 'Mozilla/5.0', NOW() - INTERVAL '4.5 days'
    );
    
    INSERT INTO audit_logs (tenant_id, user_id, action, resource, resource_id, severity, metadata, ip_address, user_agent, timestamp)
    VALUES (
        tenant_uuid, staff_uuid, 'create', 'booking', gen_random_uuid()::text, 'info',
        '{"listingName": "Padelbane 1"}'::jsonb,
        '127.0.0.1', 'Mozilla/5.0', NOW() - INTERVAL '5 days'
    );
    
    INSERT INTO audit_logs (tenant_id, user_id, action, resource, resource_id, severity, metadata, ip_address, user_agent, timestamp)
    VALUES (
        tenant_uuid, manager_uuid, 'confirm', 'booking', gen_random_uuid()::text, 'info',
        '{"listingName": "Kommunehuset - Styrerom"}'::jsonb,
        '127.0.0.1', 'Mozilla/5.0', NOW() - INTERVAL '5.5 days'
    );
    
    INSERT INTO audit_logs (tenant_id, user_id, action, resource, resource_id, severity, metadata, ip_address, user_agent, timestamp)
    VALUES (
        tenant_uuid, admin_uuid, 'login', 'auth', admin_uuid::text, 'info',
        '{"method": "bankid"}'::jsonb,
        '127.0.0.1', 'Mozilla/5.0', NOW() - INTERVAL '6 days'
    );
    
    INSERT INTO audit_logs (tenant_id, user_id, action, resource, resource_id, severity, metadata, ip_address, user_agent, timestamp)
    VALUES (
        tenant_uuid, admin_uuid, 'publish', 'listing', gen_random_uuid()::text, 'info',
        '{"listingName": "Fotballbane - Kunstgress"}'::jsonb,
        '127.0.0.1', 'Mozilla/5.0', NOW() - INTERVAL '6.5 days'
    );
    
    INSERT INTO audit_logs (tenant_id, user_id, action, resource, resource_id, severity, metadata, ip_address, user_agent, timestamp)
    VALUES (
        tenant_uuid, demo_uuid, 'create', 'booking', gen_random_uuid()::text, 'info',
        '{"listingName": "Grendehuset Vest"}'::jsonb,
        '127.0.0.1', 'Mozilla/5.0', NOW() - INTERVAL '7 days'
    );
    
    -- Older activities (last 30 days)
    
    INSERT INTO audit_logs (tenant_id, user_id, action, resource, resource_id, severity, metadata, ip_address, user_agent, timestamp)
    VALUES (
        tenant_uuid, manager_uuid, 'complete', 'booking', gen_random_uuid()::text, 'info',
        '{"listingName": "Festiviteten - Hovedsal"}'::jsonb,
        '127.0.0.1', 'Mozilla/5.0', NOW() - INTERVAL '10 days'
    );
    
    INSERT INTO audit_logs (tenant_id, user_id, action, resource, resource_id, severity, metadata, ip_address, user_agent, timestamp)
    VALUES (
        tenant_uuid, staff_uuid, 'create', 'booking', gen_random_uuid()::text, 'info',
        '{"listingName": "Svømmehallen - Hovedbasseng"}'::jsonb,
        '127.0.0.1', 'Mozilla/5.0', NOW() - INTERVAL '12 days'
    );
    
    INSERT INTO audit_logs (tenant_id, user_id, action, resource, resource_id, severity, metadata, ip_address, user_agent, timestamp)
    VALUES (
        tenant_uuid, admin_uuid, 'archive', 'listing', gen_random_uuid()::text, 'warning',
        '{"listingName": "Gammelt Møterom", "reason": "Renovering"}'::jsonb,
        '127.0.0.1', 'Mozilla/5.0', NOW() - INTERVAL '15 days'
    );
    
    INSERT INTO audit_logs (tenant_id, user_id, action, resource, resource_id, severity, metadata, ip_address, user_agent, timestamp)
    VALUES (
        tenant_uuid, demo_uuid, 'login', 'auth', demo_uuid::text, 'info',
        '{"method": "email"}'::jsonb,
        '127.0.0.1', 'Mozilla/5.0', NOW() - INTERVAL '18 days'
    );
    
    INSERT INTO audit_logs (tenant_id, user_id, action, resource, resource_id, severity, metadata, ip_address, user_agent, timestamp)
    VALUES (
        tenant_uuid, admin_uuid, 'create', 'listing', gen_random_uuid()::text, 'info',
        '{"listingName": "Nytt Lokale", "category": "LOKALER_OG_BANER"}'::jsonb,
        '127.0.0.1', 'Mozilla/5.0', NOW() - INTERVAL '20 days'
    );
    
    INSERT INTO audit_logs (tenant_id, user_id, action, resource, resource_id, severity, metadata, ip_address, user_agent, timestamp)
    VALUES (
        tenant_uuid, staff_uuid, 'update', 'user', staff_uuid::text, 'info',
        '{"changes": ["profile", "preferences"]}'::jsonb,
        '127.0.0.1', 'Mozilla/5.0', NOW() - INTERVAL '25 days'
    );
    
    RAISE NOTICE '✅ Inserted % audit log entries', 20;
END $$;

-- Verification query
SELECT 
  action,
  resource,
  COUNT(*) as count,
  MIN(timestamp) as earliest,
  MAX(timestamp) as latest
FROM audit_logs
GROUP BY action, resource
ORDER BY latest DESC;
