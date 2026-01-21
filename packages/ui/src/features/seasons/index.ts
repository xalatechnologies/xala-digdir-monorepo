/**
 * Seasons Feature Kit
 *
 * Domain-specific components and mappers for seasonal booking management.
 * This feature kit provides thin wrappers around platform patterns with
 * domain-specific DTO mapping.
 *
 * ## Usage Patterns
 *
 * ### Pattern 1: Using Mappers with Components
 * ```tsx
 * import {
 *   SeasonCard,
 *   mapSeasonDTOToCardData,
 * } from '@digilist/ui/features/seasons';
 *
 * function SeasonsList({ seasons }: { seasons: SeasonDTO[] }) {
 *   const t = useT();
 *
 *   return (
 *     <Grid columns={3}>
 *       {seasons.map(season => (
 *         <SeasonCard
 *           key={season.id}
 *           season={mapSeasonDTOToCardData(season, t)}
 *           onViewDetails={(id) => navigate(`/seasons/${id}`)}
 *           onApply={(id) => handleApply(id)}
 *         />
 *       ))}
 *     </Grid>
 *   );
 * }
 * ```
 *
 * ### Pattern 2: Using Components Directly with CardData
 * ```tsx
 * import { SeasonCard, VenueCard } from '@digilist/ui/features/seasons';
 * import type { SeasonCardData, VenueCardData } from '@digilist/ui/features/seasons';
 *
 * function SeasonPage({ season, venues }) {
 *   return (
 *     <>
 *       <SeasonCard season={season} />
 *       {venues.map(venue => (
 *         <VenueCard key={venue.id} venue={venue} />
 *       ))}
 *     </>
 *   );
 * }
 * ```
 *
 * ### Pattern 3: Using Helper Functions
 * ```tsx
 * import {
 *   getActiveSeasons,
 *   getDaysUntilDeadline,
 *   formatSeasonDateRange,
 * } from '@digilist/ui/features/seasons';
 *
 * const activeSeasons = getActiveSeasons(allSeasons);
 * const daysLeft = getDaysUntilDeadline(season.applicationDeadline);
 * const period = formatSeasonDateRange(season.startDate, season.endDate);
 * ```
 */

// =============================================================================
// Domain-to-Display Mappers
// =============================================================================

export {
  // Season mappers
  mapSeasonDTOToCardData,
  mapSeasonDTOsToCardData,
  getSeasonStatusBadge,
  type SeasonDTO,

  // Venue mappers
  mapVenueDTOToCardData,
  mapVenueDTOsToCardData,
  type VenueDTO,

  // Status types
  type SeasonStatusColor,
  type SeasonStatusBadge,

  // Date helpers
  formatSeasonDate,
  formatSeasonDateRange,

  // Filter/query helpers
  isSeasonAcceptingApplications,
  getDaysUntilDeadline,
  filterSeasonsByStatus,
  getActiveSeasons,
} from './mappers';

// =============================================================================
// Re-export Domain Components from blocks
// =============================================================================

export {
  // Season card
  SeasonCard,
  type SeasonCardProps,
  type SeasonCardData,
  type SeasonStatus,

  // Venue card
  VenueCard,
  type VenueCardProps,
  type VenueCardData,
} from '../../blocks/seasons';
