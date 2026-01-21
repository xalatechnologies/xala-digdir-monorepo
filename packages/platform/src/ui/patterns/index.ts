// Platform UI Patterns
// Domain-neutral, reusable UI patterns

// Types
export * from './types';

// Pattern Components
export { FeatureChips } from './FeatureChips';
export type { FeatureChipsProps, FeatureChipsLabels } from './FeatureChips';

export { MetadataRow, MetadataRowInline } from './MetadataRow';
export type { MetadataRowProps } from './MetadataRow';

export { ResourceCard } from './ResourceCard';
export type { ResourceCardProps, ResourceCardVariant, ResourceCardImage } from './ResourceCard';

export { PricingSummary } from './PricingSummary';
export type {
  PricingSummaryProps,
  PricingSummaryLineItem,
  PriceLineItemType,
} from './PricingSummary';

export { SlotCalendar } from './SlotCalendar';
export type {
  SlotCalendarProps,
  SlotCalendarLabels,
  ViewMode as SlotViewMode,
  SelectionMode,
  CellStatus,
} from './SlotCalendar';

export { ResourceGrid } from './ResourceGrid';
export type { ResourceGridProps } from './ResourceGrid';

export { ResourceDetailHeader } from './ResourceDetailHeader';
export type { ResourceDetailHeaderProps } from './ResourceDetailHeader';

export { ScheduleCard } from './ScheduleCard';
export type { ScheduleCardProps } from './ScheduleCard';

// Utilities
export { cn, getGapValue, spacingValues } from './utils';

// Confirmation & Success Patterns
export { ConfirmationView } from './ConfirmationView';
export type {
  ConfirmationViewProps,
  ConfirmationDetail,
  ConfirmationVariant,
} from './ConfirmationView';

export { SuccessView } from './SuccessView';
export type {
  SuccessViewProps,
  SuccessDetail,
  SuccessAction,
} from './SuccessView';

// Form Wizard Modal
export { FormWizardModal } from './FormWizardModal';
export type { FormWizardModalProps, FormWizardModalLabels } from './FormWizardModal';
