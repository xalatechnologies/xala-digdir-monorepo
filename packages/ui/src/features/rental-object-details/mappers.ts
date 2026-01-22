/**
 * @digilist/ui - Rental Object Details Mappers
 *
 * Maps SDK DTOs to platform component props for rental object detail widgets.
 */

// =============================================================================
// Contact Info Types & Mapper
// =============================================================================

/**
 * Contact info DTO from SDK
 * Compatible with @digilist/client-sdk contact types
 */
export interface ContactInfoDTO {
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
  website?: string;
  organization?: string;
}

/**
 * Props for platform ContactInfoCard component
 */
interface ContactInfoCardProps {
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
}

/**
 * Maps a Contact DTO from SDK to ContactInfoCard props.
 *
 * Use with the platform ContactInfoCard component:
 * @example
 * ```tsx
 * import { ContactInfoCard } from '@xalatechnologies/platform/ui';
 * import { mapContactInfoToCardProps } from '@digilist/ui/features/rental-object-details';
 *
 * function ContactSection({ contact }: { contact: ContactInfoDTO }) {
 *   return <ContactInfoCard {...mapContactInfoToCardProps(contact)} />;
 * }
 * ```
 */
export function mapContactInfoToCardProps(dto: ContactInfoDTO | undefined): ContactInfoCardProps {
  if (!dto) {
    return {};
  }

  return {
    name: dto.name,
    email: dto.email,
    phone: dto.phone,
    website: dto.website,
  };
}

// =============================================================================
// Opening Hours Types & Mapper
// =============================================================================

/**
 * Day hours DTO from SDK
 */
export interface DayHoursDTO {
  day: string;
  dayIndex: number; // 0 = Sunday, 1 = Monday, etc.
  open?: string;
  close?: string;
  isClosed: boolean;
  breaks?: Array<{ start: string; end: string }>;
}

/**
 * Exceptional day DTO from SDK
 */
export interface ExceptionalDayDTO {
  date: string;
  label: string;
  hours?: { open: string; close: string };
  isClosed: boolean;
}

/**
 * Opening hours DTO from SDK
 * Compatible with @digilist/client-sdk opening hours types
 */
export interface OpeningHoursDTO {
  regular: DayHoursDTO[];
  exceptions?: ExceptionalDayDTO[];
}

/**
 * Single day hours for platform OpeningHoursCard
 */
interface OpeningHoursCardDay {
  day: string;
  hours: string;
  isClosed?: boolean;
}

/**
 * Props for platform OpeningHoursCard component
 */
interface OpeningHoursCardProps {
  days: OpeningHoursCardDay[];
}

/**
 * Day name mapping for Norwegian localization
 */
const DAY_NAMES: Record<number, string> = {
  0: 'Søndag',
  1: 'Mandag',
  2: 'Tirsdag',
  3: 'Onsdag',
  4: 'Torsdag',
  5: 'Fredag',
  6: 'Lørdag',
};

/**
 * Maps opening hours DTO from SDK to OpeningHoursCard props.
 *
 * Use with the platform OpeningHoursCard component:
 * @example
 * ```tsx
 * import { OpeningHoursCard } from '@xalatechnologies/platform/ui';
 * import { mapOpeningHoursToCardProps } from '@digilist/ui/features/rental-object-details';
 *
 * function OpeningHoursSection({ openingHours }: { openingHours: OpeningHoursDTO }) {
 *   return <OpeningHoursCard {...mapOpeningHoursToCardProps(openingHours)} />;
 * }
 * ```
 */
export function mapOpeningHoursToCardProps(dto: OpeningHoursDTO | undefined): OpeningHoursCardProps {
  if (!dto || !dto.regular || dto.regular.length === 0) {
    return { days: [] };
  }

  // Sort days: Monday (1) to Sunday (0 treated as 7)
  const sortedDays = [...dto.regular].sort((a, b) => {
    const aIndex = a.dayIndex === 0 ? 7 : a.dayIndex;
    const bIndex = b.dayIndex === 0 ? 7 : b.dayIndex;
    return aIndex - bIndex;
  });

  const days: OpeningHoursCardDay[] = sortedDays.map((day) => {
    const dayName = day.day || DAY_NAMES[day.dayIndex] || '';
    const hours = day.isClosed
      ? 'Stengt'
      : day.open && day.close
        ? `${day.open} - ${day.close}`
        : '-';

    return {
      day: dayName,
      hours,
      isClosed: day.isClosed,
    };
  });

  return { days };
}
