/**
 * @digilist/ui - Domain-Specific Icons
 *
 * ## Icon Architecture
 *
 * Icons in this system follow a two-tier approach per Designsystemet guidelines
 * (https://designsystemet.no/en/fundamentals/theme/icons):
 *
 * 1. **Platform Icons (@xalatechnologies/platform/ui)**
 *    - Primary: @navikt/aksel-icons (900+ icons, Norwegian public sector standard)
 *    - Secondary: lucide-react (for general icons not in aksel)
 *    - These are re-exported through the platform package
 *
 * 2. **Domain Icons (this file)**
 *    - Only for icons not available in platform
 *    - Custom domain-specific icons for Digilist rental booking
 *    - Should be minimal - prefer platform icons
 *
 * ## Usage
 *
 * ```tsx
 * // Prefer platform icons
 * import {
 *   CalendarIcon,
 *   ClockIcon,
 *   SearchIcon,
 *   // ... 100+ common icons
 * } from '@xalatechnologies/platform/ui';
 *
 * // Only use domain icons for Digilist-specific icons not in platform
 * import {
 *   LayersIcon,    // Seasonal/stacked booking concept
 *   DateRangeIcon, // Multi-day range with markers
 * } from '@digilist/ui/primitives/domain-icons';
 * ```
 *
 * ## Adding New Icons
 *
 * Before adding an icon here:
 * 1. Check @navikt/aksel-icons: https://aksel.nav.no/ikoner
 * 2. Check lucide icons: https://lucide.dev/icons
 * 3. Only add here if truly domain-specific and unavailable in platform
 */

import * as React from 'react';

// =============================================================================
// Standard Icon Props
// =============================================================================

interface IconProps {
  size?: number;
  className?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
}

// =============================================================================
// Booking Mode Icons (Domain-Specific)
// These represent Digilist-specific booking concepts
// =============================================================================

/**
 * Layers icon - Used for seasonal/recurring bookings.
 * Represents stacked time periods or recurring patterns.
 */
export function LayersIcon({
  size = 18,
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

/**
 * Date range icon - Used for multi-day bookings.
 * Shows a calendar with range markers.
 */
export function DateRangeIcon({
  size = 18,
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="14" x2="16" y2="14" />
      <line x1="8" y1="14" x2="8" y2="18" />
      <line x1="16" y1="14" x2="16" y2="18" />
    </svg>
  );
}

// =============================================================================
// Status Icons (Supplement to Platform)
// Only include if not in @navikt/aksel-icons or lucide
// =============================================================================

/**
 * Alert circle icon - Used for warnings and important notices.
 * @note Check if available in platform first (AlertCircle, ExclamationmarkCircle)
 */
export function AlertCircleIcon({
  size = 18,
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

/**
 * Warning icon (triangle with exclamation).
 * @note Check if available in platform first (AlertTriangle, ExclamationmarkTriangle)
 */
export function WarningIcon({
  size = 18,
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

// =============================================================================
// Visibility Icons
// =============================================================================

/**
 * Eye icon - Used for visibility settings.
 * @note Check platform for Eye/Show icon first
 */
export function EyeIcon({
  size = 18,
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/**
 * Eye-off icon - Used for hidden/private visibility.
 * @note Check platform for EyeOff/Hide icon first
 */
export function EyeOffIcon({
  size = 18,
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

// =============================================================================
// UI Control Icons
// =============================================================================

/**
 * Chevron down icon - For dropdowns and collapsible sections.
 * @note Check platform for ChevronDown icon first
 */
export function ChevronDownIcon({
  size = 18,
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/**
 * Minus icon - For decrease quantity, remove items.
 * @note Check platform for Minus icon first
 */
export function MinusIcon({
  size = 18,
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

/**
 * Tag icon - For pricing, labels, categories.
 * @note Check platform for Tag icon first
 */
export function TagIcon({
  size = 18,
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

// =============================================================================
// Amenity Icons (Domain-Specific for Rental Objects)
// These represent specific amenity types for Norwegian rental facilities
// =============================================================================

/**
 * Accessibility icon - For accessibility features.
 * @note Check platform for Accessibility/Wheelchair icon first
 */
export function AccessibilityIcon({
  size = 18,
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      <circle cx="12" cy="4.5" r="2.5" />
      <path d="M12 7v8" />
      <path d="M7 12h10" />
      <path d="M9 21l3-6 3 6" />
    </svg>
  );
}

/**
 * Air conditioner icon - For climate control amenities.
 */
export function AirConditionerIcon({
  size = 18,
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      <rect x="2" y="4" width="20" height="8" rx="2" />
      <path d="M6 16v4" />
      <path d="M12 16v4" />
      <path d="M18 16v4" />
      <path d="M6 12v2" />
      <path d="M18 12v2" />
    </svg>
  );
}

/**
 * Coffee icon - For kitchen/refreshment amenities.
 * @note Check platform for Coffee icon first
 */
export function CoffeeIcon({
  size = 18,
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      <line x1="6" y1="1" x2="6" y2="4" />
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  );
}

/**
 * Kitchen icon - For kitchen amenities.
 */
export function KitchenIcon({
  size = 18,
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="3" x2="9" y2="9" />
      <circle cx="7" cy="15" r="1" />
      <circle cx="17" cy="15" r="1" />
    </svg>
  );
}

/**
 * Microphone icon - For audio/presentation amenities.
 * @note Check platform for Microphone/Mic icon first
 */
export function MicrophoneIcon({
  size = 18,
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

/**
 * Parking icon - For parking amenities.
 * @note Check platform for Parking icon first (common in aksel)
 */
export function ParkingIcon({
  size = 18,
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
    </svg>
  );
}

/**
 * Speaker icon - For audio equipment amenities.
 * @note Check platform for Speaker/Volume icon first
 */
export function SpeakerIcon({
  size = 18,
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <circle cx="12" cy="14" r="4" />
      <line x1="12" y1="6" x2="12.01" y2="6" />
    </svg>
  );
}

/**
 * Storage icon - For storage amenities.
 * @note Check platform for Archive/Storage icon first
 */
export function StorageIcon({
  size = 18,
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" />
      <line x1="6" y1="18" x2="6.01" y2="18" />
    </svg>
  );
}

/**
 * Toilet icon - For restroom amenities.
 */
export function ToiletIcon({
  size = 18,
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      <path d="M19 3H5a2 2 0 0 0-2 2v6h18V5a2 2 0 0 0-2-2z" />
      <path d="M3 11v3a7 7 0 0 0 7 7h4a7 7 0 0 0 7-7v-3" />
    </svg>
  );
}

/**
 * TV icon - For display/screen amenities.
 * @note Check platform for TV/Monitor icon first
 */
export function TVIcon({
  size = 18,
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
      <polyline points="17 2 12 7 7 2" />
    </svg>
  );
}

/**
 * Whiteboard icon - For presentation amenities.
 */
export function WhiteboardIcon({
  size = 18,
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      <rect x="3" y="3" width="18" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

// =============================================================================
// Rules & Constraints Icons
// =============================================================================

/**
 * Utensils icon - For food/catering rules.
 * @note Check platform for Utensils/Cutlery icon first
 */
export function UtensilsIcon({
  size = 18,
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3v0v5" />
    </svg>
  );
}

/**
 * Volume off icon - For noise rules.
 * @note Check platform for VolumeOff/Mute icon first
 */
export function VolumeOffIcon({
  size = 18,
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

/**
 * Wrench icon - For maintenance/equipment rules.
 * @note Check platform for Wrench/Tool icon first
 */
export function WrenchIcon({
  size = 18,
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

// =============================================================================
// User Icons
// =============================================================================

/**
 * User check icon - For verified/confirmed user states.
 * @note Check platform for UserCheck icon first
 */
export function UserCheckIcon({
  size = 18,
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <polyline points="17 11 19 13 23 9" />
    </svg>
  );
}
