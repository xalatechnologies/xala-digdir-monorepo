/**
 * Demo Users Seed Data
 * SSA-L Compliance: Demo users for Skien kommune demo scenarios
 *
 * User roles covered:
 * - citizen: Regular citizens who can browse and book resources
 * - caseworker: Municipal employees who process bookings and handle approvals
 * - admin: System administrators with full access to tenant configuration
 */

// ============================================================================
// UUID Constants (deterministic for testing)
// ============================================================================

// Tenant IDs (reuse from main seed / demo-rental-objects)
export const TENANT_SKIEN = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
export const TENANT_PORSGRUNN = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d';

// Organization IDs (reuse from main seed)
export const ORG_SKIEN_HALL = '11111111-1111-1111-1111-111111111111';
export const ORG_KULTURHUS = '22222222-2222-2222-2222-222222222222';
export const ORG_PORSGRUNN = '33333333-3333-3333-3333-333333333333';
export const ORG_UNGDOMSKLUBB = '44444444-4444-4444-4444-444444444444';
export const ORG_SKIEN_SKOLE = '66666666-1111-1111-1111-111111111111';
export const ORG_SKIEN_BIBLIOTEK = '77777777-1111-1111-1111-111111111111';
export const ORG_SKIEN_PARK = '88888888-1111-1111-1111-111111111111';
export const ORG_SKIEN_GRENDEHUS = '99999999-1111-1111-1111-111111111111';

// ============================================================================
// Demo User UUID Generator (deterministic)
// ============================================================================
function generateUserId(index: number): string {
  const hex = index.toString(16).padStart(4, '0');
  return `u0000000-${hex}-4000-8000-000000000000`;
}

// ============================================================================
// Demo User Types
// ============================================================================

export type UserRole = 'citizen' | 'caseworker' | 'admin';
export type UserStatus = 'active' | 'inactive' | 'pending';

export interface DemoUser {
  id: string;
  tenantId: string;
  organizationId: string | null;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  metadata: {
    phone?: string;
    department?: string;
    title?: string;
    permissions?: string[];
    preferredLanguage?: string;
    notificationPreferences?: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    verifiedAt?: string;
    notes?: string;
  };
}

// ============================================================================
// Demo Users (15 users across roles)
// ============================================================================

export const DEMO_USERS: DemoUser[] = [
  // ============================================================================
  // ADMIN USERS (1-3)
  // ============================================================================
  {
    id: generateUserId(1),
    tenantId: TENANT_SKIEN,
    organizationId: null,
    email: 'admin@skien.kommune.no',
    name: 'Kristian Administrator',
    role: 'admin',
    status: 'active',
    metadata: {
      phone: '+47 35 58 00 01',
      department: 'IT-avdelingen',
      title: 'Systemadministrator',
      permissions: [
        'tenant.manage',
        'users.manage',
        'organizations.manage',
        'listings.manage',
        'bookings.manage',
        'reports.view',
        'audit.view',
        'settings.manage',
      ],
      preferredLanguage: 'nb-NO',
      notificationPreferences: { email: true, sms: true, push: true },
      verifiedAt: '2024-01-15T10:00:00Z',
      notes: 'Primary system administrator for Skien kommune',
    },
  },
  {
    id: generateUserId(2),
    tenantId: TENANT_SKIEN,
    organizationId: null,
    email: 'superadmin@skien.kommune.no',
    name: 'Line Overordnet',
    role: 'admin',
    status: 'active',
    metadata: {
      phone: '+47 35 58 00 02',
      department: 'Kommunedirektørens stab',
      title: 'IT-sjef',
      permissions: [
        'tenant.manage',
        'users.manage',
        'organizations.manage',
        'listings.manage',
        'bookings.manage',
        'reports.view',
        'audit.view',
        'settings.manage',
        'billing.manage',
      ],
      preferredLanguage: 'nb-NO',
      notificationPreferences: { email: true, sms: false, push: true },
      verifiedAt: '2024-01-10T08:00:00Z',
      notes: 'IT-sjef med overordnet ansvar',
    },
  },
  {
    id: generateUserId(3),
    tenantId: TENANT_PORSGRUNN,
    organizationId: null,
    email: 'admin@porsgrunn.kommune.no',
    name: 'Pål Administrator',
    role: 'admin',
    status: 'active',
    metadata: {
      phone: '+47 35 55 00 01',
      department: 'Digitalisering',
      title: 'Systemadministrator',
      permissions: [
        'tenant.manage',
        'users.manage',
        'organizations.manage',
        'listings.manage',
        'bookings.manage',
        'reports.view',
        'audit.view',
        'settings.manage',
      ],
      preferredLanguage: 'nb-NO',
      notificationPreferences: { email: true, sms: true, push: true },
      verifiedAt: '2024-02-01T09:00:00Z',
      notes: 'Primary admin for Porsgrunn kommune',
    },
  },

  // ============================================================================
  // CASEWORKER USERS (4-8)
  // ============================================================================
  {
    id: generateUserId(4),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_SKIEN_HALL,
    email: 'saksbehandler.idrett@skien.kommune.no',
    name: 'Marte Idrettsen',
    role: 'caseworker',
    status: 'active',
    metadata: {
      phone: '+47 35 58 20 00',
      department: 'Kultur og fritid',
      title: 'Saksbehandler - Idrett',
      permissions: [
        'listings.view',
        'listings.edit',
        'bookings.manage',
        'bookings.approve',
        'reports.view',
      ],
      preferredLanguage: 'nb-NO',
      notificationPreferences: { email: true, sms: true, push: true },
      verifiedAt: '2024-01-20T11:00:00Z',
      notes: 'Ansvarlig for idrettsanlegg og haller',
    },
  },
  {
    id: generateUserId(5),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_KULTURHUS,
    email: 'saksbehandler.kultur@skien.kommune.no',
    name: 'Henrik Kultursen',
    role: 'caseworker',
    status: 'active',
    metadata: {
      phone: '+47 35 90 55 00',
      department: 'Kultur og fritid',
      title: 'Saksbehandler - Kultur',
      permissions: [
        'listings.view',
        'listings.edit',
        'bookings.manage',
        'bookings.approve',
        'reports.view',
      ],
      preferredLanguage: 'nb-NO',
      notificationPreferences: { email: true, sms: false, push: true },
      verifiedAt: '2024-01-22T14:00:00Z',
      notes: 'Ansvarlig for kulturhus og scener',
    },
  },
  {
    id: generateUserId(6),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_SKIEN_SKOLE,
    email: 'saksbehandler.skole@skien.kommune.no',
    name: 'Eva Skolesen',
    role: 'caseworker',
    status: 'active',
    metadata: {
      phone: '+47 35 58 60 00',
      department: 'Oppvekst',
      title: 'Saksbehandler - Skolelokaler',
      permissions: [
        'listings.view',
        'listings.edit',
        'bookings.manage',
        'bookings.approve',
        'reports.view',
      ],
      preferredLanguage: 'nb-NO',
      notificationPreferences: { email: true, sms: true, push: false },
      verifiedAt: '2024-02-05T09:30:00Z',
      notes: 'Ansvarlig for utleie av skolelokaler',
    },
  },
  {
    id: generateUserId(7),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_SKIEN_GRENDEHUS,
    email: 'saksbehandler.grendehus@skien.kommune.no',
    name: 'Olav Grendehusen',
    role: 'caseworker',
    status: 'active',
    metadata: {
      phone: '+47 35 58 90 00',
      department: 'Kultur og fritid',
      title: 'Saksbehandler - Grendehus',
      permissions: [
        'listings.view',
        'listings.edit',
        'bookings.manage',
        'bookings.approve',
        'reports.view',
      ],
      preferredLanguage: 'nb-NO',
      notificationPreferences: { email: true, sms: true, push: true },
      verifiedAt: '2024-02-10T10:00:00Z',
      notes: 'Koordinator for grendehus og lokale forsamlingslokaler',
    },
  },
  {
    id: generateUserId(8),
    tenantId: TENANT_PORSGRUNN,
    organizationId: ORG_PORSGRUNN,
    email: 'saksbehandler@porsgrunn.kommune.no',
    name: 'Silje Saksbehandlersen',
    role: 'caseworker',
    status: 'active',
    metadata: {
      phone: '+47 35 55 10 00',
      department: 'Kultur og idrett',
      title: 'Saksbehandler',
      permissions: [
        'listings.view',
        'listings.edit',
        'bookings.manage',
        'bookings.approve',
        'reports.view',
      ],
      preferredLanguage: 'nb-NO',
      notificationPreferences: { email: true, sms: true, push: true },
      verifiedAt: '2024-02-15T08:45:00Z',
      notes: 'Generell saksbehandler for Porsgrunn',
    },
  },

  // ============================================================================
  // CITIZEN USERS (9-15)
  // ============================================================================
  {
    id: generateUserId(9),
    tenantId: TENANT_SKIEN,
    organizationId: null,
    email: 'ole.nordmann@example.no',
    name: 'Ole Nordmann',
    role: 'citizen',
    status: 'active',
    metadata: {
      phone: '+47 900 11 222',
      preferredLanguage: 'nb-NO',
      notificationPreferences: { email: true, sms: false, push: true },
      verifiedAt: '2024-03-01T16:00:00Z',
      notes: 'Aktiv bruker, booker regelmessig idrettshaller',
    },
  },
  {
    id: generateUserId(10),
    tenantId: TENANT_SKIEN,
    organizationId: null,
    email: 'kari.hansen@example.no',
    name: 'Kari Hansen',
    role: 'citizen',
    status: 'active',
    metadata: {
      phone: '+47 900 33 444',
      preferredLanguage: 'nb-NO',
      notificationPreferences: { email: true, sms: true, push: true },
      verifiedAt: '2024-03-05T12:30:00Z',
      notes: 'Representerer Skien Håndballklubb',
    },
  },
  {
    id: generateUserId(11),
    tenantId: TENANT_SKIEN,
    organizationId: null,
    email: 'per.olsen@example.no',
    name: 'Per Olsen',
    role: 'citizen',
    status: 'active',
    metadata: {
      phone: '+47 900 55 666',
      preferredLanguage: 'nb-NO',
      notificationPreferences: { email: true, sms: false, push: false },
      verifiedAt: '2024-03-10T09:15:00Z',
      notes: 'Bruker primært kulturhus for private arrangementer',
    },
  },
  {
    id: generateUserId(12),
    tenantId: TENANT_SKIEN,
    organizationId: null,
    email: 'lise.berg@example.no',
    name: 'Lise Berg',
    role: 'citizen',
    status: 'active',
    metadata: {
      phone: '+47 900 77 888',
      preferredLanguage: 'nb-NO',
      notificationPreferences: { email: true, sms: true, push: true },
      verifiedAt: '2024-03-15T14:00:00Z',
      notes: 'Leder for Skien Kammerorkester, booker øvingslokaler',
    },
  },
  {
    id: generateUserId(13),
    tenantId: TENANT_SKIEN,
    organizationId: null,
    email: 'tor.andersen@example.no',
    name: 'Tor Andersen',
    role: 'citizen',
    status: 'pending',
    metadata: {
      phone: '+47 900 99 000',
      preferredLanguage: 'nb-NO',
      notificationPreferences: { email: true, sms: false, push: true },
      notes: 'Nyregistrert bruker, venter på verifisering',
    },
  },
  {
    id: generateUserId(14),
    tenantId: TENANT_PORSGRUNN,
    organizationId: null,
    email: 'anna.johansen@example.no',
    name: 'Anna Johansen',
    role: 'citizen',
    status: 'active',
    metadata: {
      phone: '+47 901 11 222',
      preferredLanguage: 'nb-NO',
      notificationPreferences: { email: true, sms: true, push: true },
      verifiedAt: '2024-03-20T11:00:00Z',
      notes: 'Porsgrunn innbygger, aktiv i friidrett',
    },
  },
  {
    id: generateUserId(15),
    tenantId: TENANT_SKIEN,
    organizationId: null,
    email: 'erik.svendsen@example.no',
    name: 'Erik Svendsen',
    role: 'citizen',
    status: 'inactive',
    metadata: {
      phone: '+47 901 33 444',
      preferredLanguage: 'nb-NO',
      notificationPreferences: { email: false, sms: false, push: false },
      verifiedAt: '2024-01-01T10:00:00Z',
      notes: 'Deaktivert etter eget ønske, kan reaktiveres',
    },
  },
];

// ============================================================================
// Export Functions
// ============================================================================

/**
 * Get all demo users for seeding
 */
export function getDemoUsers(): DemoUser[] {
  return DEMO_USERS;
}

/**
 * Get demo users count
 */
export function getDemoUsersCount(): number {
  return DEMO_USERS.length;
}

/**
 * Get demo users by role
 */
export function getDemoUsersByRole(role: UserRole): DemoUser[] {
  return DEMO_USERS.filter((user) => user.role === role);
}

/**
 * Get demo users by tenant
 */
export function getDemoUsersByTenant(tenantId: string): DemoUser[] {
  return DEMO_USERS.filter((user) => user.tenantId === tenantId);
}

/**
 * Get demo users by status
 */
export function getDemoUsersByStatus(status: UserStatus): DemoUser[] {
  return DEMO_USERS.filter((user) => user.status === status);
}

/**
 * Get admin users
 */
export function getAdminUsers(): DemoUser[] {
  return getDemoUsersByRole('admin');
}

/**
 * Get caseworker users
 */
export function getCaseworkerUsers(): DemoUser[] {
  return getDemoUsersByRole('caseworker');
}

/**
 * Get citizen users
 */
export function getCitizenUsers(): DemoUser[] {
  return getDemoUsersByRole('citizen');
}

/**
 * Transform to database-compatible format for Drizzle insert
 */
export function toDatabaseFormat(user: DemoUser) {
  return {
    id: user.id,
    tenantId: user.tenantId,
    organizationId: user.organizationId,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    metadata: user.metadata,
  };
}

/**
 * Get all demo users in database format
 */
export function getAllDemoUsersForDatabase() {
  return DEMO_USERS.map(toDatabaseFormat);
}

// ============================================================================
// Self-verification
// ============================================================================
if (require.main === module) {
  console.log(`Total demo users: ${getDemoUsersCount()}`);
  console.log(`Admin users: ${getAdminUsers().length}`);
  console.log(`Caseworker users: ${getCaseworkerUsers().length}`);
  console.log(`Citizen users: ${getCitizenUsers().length}`);
  console.log(`Skien tenant: ${getDemoUsersByTenant(TENANT_SKIEN).length}`);
  console.log(`Porsgrunn tenant: ${getDemoUsersByTenant(TENANT_PORSGRUNN).length}`);
  console.log(`Active users: ${getDemoUsersByStatus('active').length}`);
  console.log(`Pending users: ${getDemoUsersByStatus('pending').length}`);
  console.log(`Inactive users: ${getDemoUsersByStatus('inactive').length}`);
}
