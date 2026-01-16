/**
 * Listing constants
 */
import type { ListingType } from '@digilist/client-sdk';

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
