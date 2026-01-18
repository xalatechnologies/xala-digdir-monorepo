/**
 * Rental Object Custody Scopes
 */
export enum CustodyScope {
  RO_VIEW = 'RO_VIEW',
  RO_EDIT = 'RO_EDIT',
  RO_MEDIA = 'RO_MEDIA',
  RO_MAINTENANCE = 'RO_MAINTENANCE',
  RO_BOOKING_MANAGE = 'RO_BOOKING_MANAGE',
  RO_PRICING = 'RO_PRICING',
  RO_REPORTING = 'RO_REPORTING',
  RO_DELEGATE = 'RO_DELEGATE',
}

export type GranteeType = 'USER' | 'ORG';

export interface UserContext {
  userId: string;
  tenantId: string;
  role: string;
  organizationId?: string; // Current active organization context
  memberships?: string[]; // All organizations the user is a member of
}

export interface CustodyContext {
  rentalObjectId: string;
  tenantId: string;
}
