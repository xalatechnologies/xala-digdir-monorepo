# Demo Users for Database Seeding

This document specifies demo users to be seeded into the database for testing the demo login functionality across all applications.

---

## Overview

Each demo user has:
- **Name**: Display name
- **Email**: Unique email address
- **Token**: Demo access token (UUID format)
- **Role**: User role for RBAC
- **Apps**: Which applications they can access

---

## Backoffice App Users

### Super Admin
```json
{
  "name": "Ola Nordmann",
  "email": "ola.nordmann@digilist.no",
  "token": "demo-backoffice-super-admin-001",
  "role": "super_admin",
  "apps": ["backoffice"],
  "redirect": "/dashboard"
}
```

### Admin
```json
{
  "name": "Kari Hansen",
  "email": "kari.hansen@oslo.kommune.no",
  "token": "demo-backoffice-admin-001",
  "role": "admin",
  "apps": ["backoffice"],
  "redirect": "/dashboard"
}
```

### Tenant Admin
```json
{
  "name": "Per Olsen",
  "email": "per.olsen@bergen.kommune.no",
  "token": "demo-backoffice-tenant-admin-001",
  "role": "tenant_admin",
  "apps": ["backoffice"],
  "redirect": "/rental-objects"
}
```

---

## Web App Users

### Regular User
```json
{
  "name": "Emma Berg",
  "email": "emma.berg@example.com",
  "token": "demo-web-user-001",
  "role": "user",
  "apps": ["web"],
  "redirect": "/listings"
}
```

### Organization
```json
{
  "name": "Sportsklubben Oslo",
  "email": "kontakt@sportsklubben-oslo.no",
  "token": "demo-web-organization-001",
  "role": "organization",
  "apps": ["web"],
  "redirect": "/listings"
}
```

---

## Minside App Users

### Regular User
```json
{
  "name": "Lars Andersen",
  "email": "lars.andersen@example.com",
  "token": "demo-minside-user-001",
  "role": "user",
  "apps": ["minside"],
  "redirect": "/bookings"
}
```

### Organization
```json
{
  "name": "Idrettslaget Vestland",
  "email": "post@idrettslaget-vestland.no",
  "token": "demo-minside-organization-001",
  "role": "organization",
  "apps": ["minside"],
  "redirect": "/organization"
}
```

---

## SaaS Admin App Users

### Super Admin (Platform Owner)
```json
{
  "name": "Admin Digilist",
  "email": "admin@digilist.no",
  "token": "demo-saas-admin-super-admin-001",
  "role": "super_admin",
  "apps": ["saas-admin"],
  "redirect": "/tenants"
}
```

### Platform Support
```json
{
  "name": "Support Team",
  "email": "support@digilist.no",
  "token": "demo-saas-admin-support-001",
  "role": "super_admin",
  "apps": ["saas-admin"],
  "redirect": "/tenants"
}
```

---

## Tenant Admin App Users

### Tenant Admin (Kommune Admin)
```json
{
  "name": "Kristine Johnsen",
  "email": "kristine.johnsen@trondheim.kommune.no",
  "token": "demo-tenant-admin-admin-001",
  "role": "tenant_admin",
  "apps": ["tenant-admin"],
  "redirect": "/"
}
```

### Tenant Configurator
```json
{
  "name": "Morten Larsen",
  "email": "morten.larsen@stavanger.kommune.no",
  "token": "demo-tenant-admin-configurator-001",
  "role": "tenant_admin",
  "apps": ["tenant-admin"],
  "redirect": "/"
}
```

---

## Multi-App Access Users

### Full Platform Access (Testing)
```json
{
  "name": "Test User Full Access",
  "email": "test.fullaccess@digilist.no",
  "token": "demo-all-apps-super-admin-001",
  "role": "super_admin",
  "apps": ["backoffice", "web", "minside", "saas-admin", "tenant-admin"],
  "redirect": "/"
}
```

---

## Database Seeding Script

### SQL Insert Statements

```sql
-- Backoffice users
INSERT INTO users (name, email, demo_token, role, created_at, updated_at) VALUES
('Ola Nordmann', 'ola.nordmann@digilist.no', 'demo-backoffice-super-admin-001', 'super_admin', NOW(), NOW()),
('Kari Hansen', 'kari.hansen@oslo.kommune.no', 'demo-backoffice-admin-001', 'admin', NOW(), NOW()),
('Per Olsen', 'per.olsen@bergen.kommune.no', 'demo-backoffice-tenant-admin-001', 'tenant_admin', NOW(), NOW());

-- Web app users
INSERT INTO users (name, email, demo_token, role, created_at, updated_at) VALUES
('Emma Berg', 'emma.berg@example.com', 'demo-web-user-001', 'user', NOW(), NOW()),
('Sportsklubben Oslo', 'kontakt@sportsklubben-oslo.no', 'demo-web-organization-001', 'organization', NOW(), NOW());

-- Minside users
INSERT INTO users (name, email, demo_token, role, created_at, updated_at) VALUES
('Lars Andersen', 'lars.andersen@example.com', 'demo-minside-user-001', 'user', NOW(), NOW()),
('Idrettslaget Vestland', 'post@idrettslaget-vestland.no', 'demo-minside-organization-001', 'organization', NOW(), NOW());

-- SaaS Admin users
INSERT INTO users (name, email, demo_token, role, created_at, updated_at) VALUES
('Admin Digilist', 'admin@digilist.no', 'demo-saas-admin-super-admin-001', 'super_admin', NOW(), NOW()),
('Support Team', 'support@digilist.no', 'demo-saas-admin-support-001', 'super_admin', NOW(), NOW());

-- Tenant Admin users
INSERT INTO users (name, email, demo_token, role, created_at, updated_at) VALUES
('Kristine Johnsen', 'kristine.johnsen@trondheim.kommune.no', 'demo-tenant-admin-admin-001', 'tenant_admin', NOW(), NOW()),
('Morten Larsen', 'morten.larsen@stavanger.kommune.no', 'demo-tenant-admin-configurator-001', 'tenant_admin', NOW(), NOW());

-- Multi-app testing user
INSERT INTO users (name, email, demo_token, role, created_at, updated_at) VALUES
('Test User Full Access', 'test.fullaccess@digilist.no', 'demo-all-apps-super-admin-001', 'super_admin', NOW(), NOW());
```

---

## Token Format

Demo tokens follow the pattern:
```
demo-{app}-{role}-{sequence}
```

**Examples:**
- `demo-backoffice-super-admin-001`
- `demo-web-user-001`
- `demo-minside-organization-001`
- `demo-saas-admin-super-admin-001`
- `demo-tenant-admin-admin-001`

---

## Testing Instructions

### 1. Seed Database
Run the SQL insert statements above to populate demo users.

### 2. Test Each App

**Backoffice:**
- Go to https://backoffice-test.digilist.no/login
- Click "Demo Login"
- Enter: Name: `Ola Nordmann`, Email: `ola.nordmann@digilist.no`, Token: `demo-backoffice-super-admin-001`
- Should redirect to `/dashboard`

**Web:**
- Go to https://web-test.digilist.no/login
- Click "Demo Login"
- Enter: Name: `Emma Berg`, Email: `emma.berg@example.com`, Token: `demo-web-user-001`
- Should redirect to `/listings`

**Minside:**
- Go to https://minside-test.digilist.no/login
- Click "Demo Login"
- Enter: Name: `Lars Andersen`, Email: `lars.andersen@example.com`, Token: `demo-minside-user-001`
- Should redirect to `/bookings`

**SaaS Admin:**
- Go to https://saas-admin.digilist.no/login
- Click "Demo Login"
- Enter: Name: `Admin Digilist`, Email: `admin@digilist.no`, Token: `demo-saas-admin-super-admin-001`
- Should redirect to `/tenants`

**Tenant Admin:**
- Go to https://tenant-admin.digilist.no/login
- Click "Demo Login"
- Enter: Name: `Kristine Johnsen`, Email: `kristine.johnsen@trondheim.kommune.no`, Token: `demo-tenant-admin-admin-001`
- Should redirect to `/`

### 3. Verify Role-Based Access
- Test that each user is redirected to the correct landing page based on their role
- Verify localStorage contains the correct user object

---

## Security Notes

⚠️ **Important:**
- These tokens are for DEMO/TESTING purposes only
- NEVER use these tokens in production
- Demo login should be disabled in production environments
- Tokens should be rotated regularly in test environments
- Consider adding expiration dates to demo tokens

---

## Future Enhancements

- [ ] Add token expiration (30 days)
- [ ] Add token usage tracking
- [ ] Add IP whitelisting for demo tokens
- [ ] Add rate limiting per token
- [ ] Add audit logging for demo logins
