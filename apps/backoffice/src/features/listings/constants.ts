/**
 * Listing constants
 */
import type { ListingType } from '@digilist/client-sdk';
import { useT } from '@xala/i18n';

// Listing type options for filtering and selection
export const LISTING_TYPE_OPTIONS: Array<{ id: ListingType | 'ALL'; label: string }> = [
  { id: 'ALL', label: 'Alle typer' },
  { id: 'SPACE', label: 'Lokaler' },
  { id: 'RESOURCE', label: 'Ressurser' },
  { id: 'SERVICE', label: 'Tjenester' },
  { id: 'EVENT', label: 'Arrangementer' },
  { id: 'VEHICLE', label: 'Kjøretøy' },
  { id: 'OTHER', label: 'Annet' },
];

// Listing type labels mapping
export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  SPACE: 'Lokaler',
  RESOURCE: 'Ressurser',
  SERVICE: 'Tjenester',
  EVENT: 'Arrangementer',
  VEHICLE: 'Kjøretøy',
  OTHER: 'Annet',
};
