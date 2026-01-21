import type { ReactNode } from 'react';

// Base badge type for resources
export interface ResourceBadge {
  id: string;
  text: string;
  variant?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
  icon?: ReactNode;
}

// Price display configuration
export interface PriceDisplay {
  amount: string;
  unit?: string;
  prefix?: string;
  strikethrough?: string;
}

// Metadata item for key-value displays
export interface MetadataItem {
  id: string;
  icon?: ReactNode;
  label: string;
  value: string;
}

// Status indicator
export interface StatusIndicator {
  type: 'available' | 'limited' | 'unavailable' | 'pending' | 'confirmed';
  label: string;
}

// Slot calendar cell (different from types/resource-detail.ts CalendarCell)
export interface SlotCalendarCell {
  id: string;
  date: Date;
  status: 'available' | 'unavailable' | 'selected' | 'partial' | 'blocked';
  label?: string;
  price?: string;
  metadata?: Record<string, unknown>;
}

// Legacy alias
export type CalendarCell = SlotCalendarCell;

// Legend item for calendars/charts
export interface LegendItem {
  status: string;
  label: string;
  color: string;
}

// Price line item for summaries
export interface PriceLineItem {
  id: string;
  label: string;
  amount: string;
  type?: 'base' | 'discount' | 'fee' | 'tax' | 'subtotal';
  strikethrough?: string;
  description?: string;
}

// Action button configuration
export interface ActionButton {
  id: string;
  label: string;
  icon?: ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
}

// Simple breadcrumb for patterns (different from composed/Breadcrumbs)
export interface PatternBreadcrumbItem {
  label: string;
  href?: string;
}

// Schedule/opening hours entry
export interface ScheduleEntry {
  day: string;
  hours: string;
  isToday?: boolean;
  isClosed?: boolean;
}

// Feature/amenity chip
export interface PatternFeatureItem {
  id: string;
  label: string;
  icon?: ReactNode;
  available?: boolean;
}

// Wizard step for pattern wizards (different from composed/WizardStepper)
export interface PatternWizardStep {
  id: string;
  title: string;
  description?: string;
  isCompleted?: boolean;
  isActive?: boolean;
  isDisabled?: boolean;
}
