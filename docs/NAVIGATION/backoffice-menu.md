# Backoffice Navigation Specification

**Version:** 1.0.0  
**Last Updated:** 2026-01-19  
**Status:** Implementation Ready

---

## Overview

The Backoffice navigation system is **database-driven**, **role-based**, and **feature-flag aware**. All menu configuration is controlled from the SaaS Admin control plane and delivered to clients via the DK API layer.

### Core Principles

1. **Contract-First**: Clients receive a fully-resolved menu DTO from DK API
2. **Zero Client Logic**: No role checks or feature flag evaluation in the UI
3. **Single Source of Truth**: Database schema drives all menu behavior
4. **SaaS Admin Control**: All menu templates, flags, and assignments managed centrally
5. **Smart Categorization**: Menu items grouped into logical categories to reduce cognitive load

---

## Smart Sidebar Categories

Menu items are organized into the following categories:

### A) Overview
**Purpose**: High-level dashboard and key metrics  
**Icon**: `dashboard`  
**Items**:
- Dashboard (`/dashboard`)

### B) Operations (Daily Work)
**Purpose**: Core operational tasks performed daily  
**Icon**: `calendar`  
**Items**:
- Bookings (`/bookings`) - All bookings management
- Calendar (`/calendar`) - Visual calendar view
- Pending Requests (`/bookings/pending`) - Requires approval
- Seasons (`/seasons`) - Seasonal rental management [FEATURE_RECURRING]
- Reviews (`/reviews`) - Customer feedback [FEATURE_REVIEWS]

### C) Resources & Pricing
**Purpose**: Manage rental inventory and pricing  
**Icon**: `building`  
**Items**:
- Listings (`/rental-objects`) - Rental object catalog
- Price Groups (`/price-groups`) - Pricing configuration

### D) Communication
**Purpose**: Messaging and templates  
**Icon**: `mail`  
**Items**:
- Messages (`/messages`) - Inbox and conversations
- Message Templates (`/message-templates`) - Reusable templates

### E) Insights
**Purpose**: Analytics and financial reporting  
**Icon**: `chart`  
**Items**:
- Reports (`/reports`) - Analytics and exports
- Economy (`/economy`) - Financial overview [FEATURE_ECONOMY]

### F) Governance & Compliance
**Purpose**: Audit, security, and system management  
**Icon**: `shield-check`  
**Items**:
- Audit Log (`/audit`) - System audit trail [FEATURE_AUDIT_LOG]
- System (`/system`) - System configuration (Tenant Admin only)

### G) Settings & Support
**Purpose**: Configuration and help resources  
**Icon**: `settings`  
**Items**:
- Settings (`/settings`) - User and tenant settings
- Help & Support (`/help`) - Documentation and support

---

## Role Visibility Matrix

| Menu Item | SAAS_ADMIN | TENANT_ADMIN | ORG_ADMIN | TENANT_USER | ORG_USER | CASE_HANDLER |
|-----------|------------|--------------|-----------|-------------|----------|--------------|
| **Overview** |
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Operations** |
| Bookings | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (read-only) |
| Calendar | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pending Requests | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Seasons | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Reviews | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| **Resources** |
| Listings | ✓ | ✓ | ✓ | ✓ (read-only) | ✓ (read-only) | ✓ (read-only) |
| Price Groups | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Communication** |
| Messages | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Message Templates | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Insights** |
| Reports | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Economy | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Governance** |
| Audit Log | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| System | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Settings** |
| Settings | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Help & Support | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## Permission Requirements

Each menu item requires specific permissions:

| Menu Item | Required Permissions |
|-----------|---------------------|
| Dashboard | `view:dashboard` |
| Bookings | `view:bookings` |
| Calendar | `view:calendar` |
| Pending Requests | `approve:bookings` OR `deny:bookings` |
| Seasons | `view:seasons` |
| Reviews | `view:reviews` |
| Listings | `view:rental_objects` |
| Price Groups | `manage:pricing` |
| Messages | `view:messages` |
| Message Templates | `manage:message_templates` |
| Reports | `view:reports` |
| Economy | `view:economy` |
| Audit Log | `view:audit_log` |
| System | `manage:system` |
| Settings | `view:settings` |
| Help & Support | (none - always visible) |

---

## Feature Flag Requirements

| Menu Item | Required Feature Flags |
|-----------|----------------------|
| Seasons | `FEATURE_RECURRING` |
| Reviews | `FEATURE_REVIEWS` |
| Economy | `FEATURE_ECONOMY` |
| Audit Log | `FEATURE_AUDIT_LOG` |

---

## Menu Item Keys (Stable Identifiers)

Each menu item has a stable key used for:
- Role overrides
- Analytics tracking
- Deep linking
- Localization

### Standard Keys

```typescript
// Category keys
'overview'
'operations'
'resources'
'communication'
'insights'
'governance'
'settings'

// Item keys
'dashboard'
'bookings'
'bookings.pending'
'calendar'
'seasons'
'reviews'
'rental-objects'
'price-groups'
'messages'
'message-templates'
'reports'
'economy'
'audit-log'
'system'
'settings'
'help'
```

---

## Localization

All labels support Norwegian Bokmål (nb) and English (en):

| Key | Norwegian (nb) | English (en) |
|-----|---------------|--------------|
| overview | Oversikt | Overview |
| operations | Drift | Operations |
| resources | Ressurser | Resources |
| communication | Kommunikasjon | Communication |
| insights | Innsikt | Insights |
| governance | Styring | Governance |
| settings | Innstillinger | Settings |
| dashboard | Dashbord | Dashboard |
| bookings | Bookinger | Bookings |
| bookings.pending | Ventende forespørsler | Pending Requests |
| calendar | Kalender | Calendar |
| seasons | Sesongleie | Seasonal Rentals |
| reviews | Anmeldelser | Reviews |
| rental-objects | Utleieobjekter | Listings |
| price-groups | Prisgrupper | Price Groups |
| messages | Meldinger | Messages |
| message-templates | Meldingsmaler | Message Templates |
| reports | Rapporter | Reports |
| economy | Økonomi | Economy |
| audit-log | Revisjonslogg | Audit Log |
| system | System | System |
| settings | Innstillinger | Settings |
| help | Hjelp og støtte | Help & Support |

---

## Icon Registry

All icons use SVG keys from the shared icon registry:

| Icon Key | Usage |
|----------|-------|
| `dashboard` | Overview category, Dashboard item |
| `calendar` | Operations category, Calendar item |
| `building` | Resources category, Listings item |
| `mail` | Communication category, Messages item |
| `chart` | Insights category, Reports item |
| `shield-check` | Governance category, Audit Log item |
| `settings` | Settings category, Settings item |
| `clock` | Bookings, Pending Requests |
| `repeat` | Seasons (recurring) |
| `star` | Reviews |
| `currency` | Price Groups, Economy |
| `file-text` | Message Templates |
| `help-circle` | Help & Support |

---

## Menu Resolution Flow

```
User Request → DK API /backoffice/menu
    ↓
1. Load user context (tenant, roles, permissions)
    ↓
2. Load tenant's assigned menu template
    ↓
3. Load categories + items for template
    ↓
4. Apply feature flag gating
    ↓
5. Apply permission gating
    ↓
6. Apply role overrides (hidden/forced/order)
    ↓
7. Localize labels based on user language
    ↓
8. Return MenuTreeDTO
    ↓
Client renders sidebar (no logic, just DTO)
```

---

## Case Handler Special Rules

Case Handlers have a restricted view focused on operational tasks:

**Visible Categories**:
- Operations (primary focus)
- Communication
- Settings & Support

**Visible Items**:
- Dashboard (read-only overview)
- Bookings (read-only list)
- Pending Requests (approve/deny actions)
- Calendar (read-only view)
- Messages (communication with users)
- Settings (personal settings only)
- Help & Support

**Hidden Items**:
- Seasons, Reviews (not part of case handling workflow)
- All Resources items (read-only access via booking details)
- All Insights items (no reporting access)
- All Governance items (no admin access)

---

## SaaS Admin Control

SaaS Admins can:

1. **Create Menu Templates**: Define new menu structures
2. **Publish Templates**: Make templates available to tenants
3. **Assign Templates**: Assign specific template versions to tenants
4. **Toggle Feature Flags**: Enable/disable features per tenant
5. **Configure Role Overrides**: Customize menu per role without duplicating templates
6. **Reorder Categories**: Change category sort order
7. **Add Custom Items**: Inject tenant-specific menu items

---

## Migration Strategy

### Phase 1: Schema + Default Template
- Deploy DB schema
- Seed default menu template with all current items
- Assign default template to all existing tenants

### Phase 2: DK API Implementation
- Implement menu resolution service
- Deploy DK endpoints
- Add Client SDK types and hooks

### Phase 3: UI Migration
- Replace hardcoded Sidebar with DTO-driven component
- Remove all role checks from menu rendering
- Add loading states and error handling

### Phase 4: SaaS Admin UI
- Build template management interface
- Build feature flag toggle interface
- Build tenant assignment interface

### Phase 5: Testing & Validation
- Unit tests for resolution engine
- Integration tests for DK API
- E2E tests for each role
- Performance testing for large tenants

---

## Compliance & Security

1. **Audit Trail**: All menu template changes logged
2. **Version Control**: Templates are versioned and immutable once published
3. **Rollback Support**: Can revert tenant to previous template version
4. **Permission Validation**: DK API validates permissions server-side
5. **No Client Bypass**: Clients cannot access routes not in their menu DTO

---

## Performance Considerations

1. **Caching**: Menu DTOs cached per user session
2. **Invalidation**: Cache invalidated on:
   - Feature flag toggle
   - Template assignment change
   - Role change
   - Permission change
3. **Preloading**: Menu DTO fetched on login and cached
4. **Lazy Loading**: Category expansion loads child items on demand (if tree is deep)

---

## Future Enhancements

1. **Personalization**: User can pin/reorder favorite items
2. **Search**: Global menu search across all items
3. **Badges**: Dynamic badges for counts (e.g., "5 pending requests")
4. **Contextual Help**: Inline help tooltips per menu item
5. **Analytics**: Track menu usage per role to optimize defaults
6. **A/B Testing**: Test different menu structures per tenant cohort

---

## References

- Schema Spec: `docs/ARCH/db-menu-schema.md`
- DK API Spec: `docs/API/dk-menu-endpoints.md`
- Client SDK Spec: `packages/client-sdk/docs/menu-hooks.md`
- Test Matrix: `docs/TESTING/menu-test-matrix.md`
