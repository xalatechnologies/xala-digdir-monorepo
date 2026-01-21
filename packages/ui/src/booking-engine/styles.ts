/**
 * BookingEngine Styles
 *
 * Extracted CSS styles for the BookingEngine component.
 * This file contains all the inline styles that were previously embedded in the component.
 */

export const bookingEngineStyles = `
  .booking-engine {
    --ube-radius: var(--ds-border-radius-xl);
    --ube-shadow: 0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
  }

  .booking-engine-card {
    background: var(--ds-color-neutral-background-default);
    border-radius: var(--ube-radius);
    border: 1px solid var(--ds-color-neutral-border-subtle);
    box-shadow: var(--ube-shadow);
    overflow: hidden;
  }

  /* Header */
  .booking-engine-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: var(--ds-spacing-6);
    background: linear-gradient(135deg, var(--ds-color-accent-surface-default) 0%, transparent 100%);
    border-bottom: 1px solid var(--ds-color-neutral-border-subtle);
  }

  .header-badge {
    display: inline-flex;
    margin-bottom: var(--ds-spacing-2);
  }

  .badge-label {
    font-size: var(--ds-font-size-xs);
    font-weight: var(--ds-font-weight-semibold);
    color: var(--ds-color-accent-text-default);
    background: var(--ds-color-accent-surface-default);
    padding: var(--ds-spacing-1) var(--ds-spacing-2);
    border-radius: var(--ds-border-radius-sm);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .header-price {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    padding: var(--ds-spacing-3) var(--ds-spacing-4);
    background: var(--ds-color-accent-base-default);
    border-radius: var(--ds-border-radius-lg);
    color: var(--ds-color-accent-contrast-default);
  }

  .price-from {
    font-size: var(--ds-font-size-xs);
    opacity: 0.8;
  }

  .price-amount {
    font-size: var(--ds-font-size-xl);
    font-weight: var(--ds-font-weight-bold);
    line-height: 1.2;
  }

  .price-unit {
    font-size: var(--ds-font-size-sm);
    opacity: 0.9;
  }

  /* Stepper */
  .booking-engine-stepper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--ds-spacing-4) var(--ds-spacing-6);
    background: var(--ds-color-neutral-surface-default);
    border-bottom: 1px solid var(--ds-color-neutral-border-subtle);
  }

  .stepper-track {
    display: flex;
    align-items: center;
    flex: 1;
  }

  .stepper-item {
    display: flex;
    align-items: center;
    gap: var(--ds-spacing-2);
    padding: var(--ds-spacing-2);
    border-radius: var(--ds-border-radius-md);
    transition: all 0.2s ease;
  }

  .stepper-item.completed {
    cursor: pointer;
  }

  .stepper-item.completed:hover {
    background: var(--ds-color-success-surface-hover);
  }

  .stepper-icon {
    width: 36px;
    height: 36px;
    border-radius: var(--ds-border-radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.3s ease;
  }

  .stepper-item.future .stepper-icon {
    background: var(--ds-color-neutral-surface-default);
    border: 2px solid var(--ds-color-neutral-border-subtle);
    color: var(--ds-color-neutral-text-subtle);
  }

  .stepper-item.active .stepper-icon {
    background: var(--ds-color-accent-base-default);
    color: var(--ds-color-accent-contrast-default);
    box-shadow: 0 0 0 4px var(--ds-color-accent-surface-default);
  }

  .stepper-item.completed .stepper-icon {
    background: var(--ds-color-success-surface-default);
    border: 2px solid var(--ds-color-success-border-subtle);
    color: var(--ds-color-success-base-default);
  }

  .stepper-label {
    font-size: var(--ds-font-size-sm);
    font-weight: var(--ds-font-weight-medium);
    white-space: nowrap;
  }

  .stepper-item.future .stepper-label {
    color: var(--ds-color-neutral-text-subtle);
  }

  .stepper-item.active .stepper-label {
    color: var(--ds-color-accent-text-default);
  }

  .stepper-item.completed .stepper-label {
    color: var(--ds-color-success-text-default);
  }

  .stepper-connector {
    flex: 1;
    height: 2px;
    background: var(--ds-color-neutral-border-subtle);
    margin: 0 var(--ds-spacing-2);
    min-width: 16px;
    transition: background 0.3s ease;
  }

  .stepper-connector.completed {
    background: var(--ds-color-success-border-default);
  }

  .stepper-progress {
    font-size: var(--ds-font-size-xs);
    color: var(--ds-color-neutral-text-subtle);
    padding: var(--ds-spacing-2) var(--ds-spacing-3);
    background: var(--ds-color-neutral-background-default);
    border-radius: var(--ds-border-radius-full);
    white-space: nowrap;
  }

  /* Content */
  .booking-engine-content {
    min-height: 500px;
  }

  /* Selection View */
  .selection-view {
    display: grid;
    grid-template-columns: 1fr 340px;
  }

  /* Calendar Panel */
  .calendar-panel {
    padding: var(--ds-spacing-5);
    border-right: 1px solid var(--ds-color-neutral-border-subtle);
  }

  .calendar-panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--ds-spacing-4);
    flex-wrap: wrap;
    gap: var(--ds-spacing-3);
  }

  .calendar-title {
    display: flex;
    align-items: center;
    gap: var(--ds-spacing-2);
    color: var(--ds-color-accent-base-default);
  }

  .calendar-navigation {
    display: flex;
    align-items: center;
    gap: var(--ds-spacing-2);
  }

  .nav-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: 1px solid var(--ds-color-neutral-border-default);
    border-radius: var(--ds-border-radius-md);
    background: var(--ds-color-neutral-background-default);
    color: var(--ds-color-neutral-text-default);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .nav-button:hover {
    background: var(--ds-color-neutral-surface-hover);
    border-color: var(--ds-color-accent-border-default);
    color: var(--ds-color-accent-base-default);
  }

  .nav-date {
    font-size: var(--ds-font-size-sm);
    font-weight: var(--ds-font-weight-semibold);
    min-width: 180px;
    text-align: center;
  }

  /* Calendar Grid */
  .calendar-grid-wrapper {
    overflow-x: auto;
    margin: 0 calc(-1 * var(--ds-spacing-5));
    padding: 0 var(--ds-spacing-5);
  }

  .calendar-grid {
    border: 1px solid var(--ds-color-neutral-border-subtle);
    border-radius: var(--ds-border-radius-lg);
    overflow: hidden;
    min-width: 600px;
  }

  .grid-row {
    display: grid;
    grid-template-columns: 60px repeat(7, 1fr);
  }

  .grid-row.header-row {
    background: var(--ds-color-neutral-surface-default);
    border-bottom: 1px solid var(--ds-color-neutral-border-subtle);
  }

  .grid-row:not(.header-row):not(:last-child) {
    border-bottom: 1px solid var(--ds-color-neutral-border-subtle);
  }

  .time-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--ds-spacing-2);
    font-size: var(--ds-font-size-xs);
    font-weight: var(--ds-font-weight-medium);
    color: var(--ds-color-neutral-text-subtle);
    background: var(--ds-color-neutral-surface-default);
    border-right: 1px solid var(--ds-color-neutral-border-subtle);
  }

  .day-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--ds-spacing-2) var(--ds-spacing-1);
    gap: 2px;
  }

  .day-cell.today {
    background: var(--ds-color-accent-surface-default);
  }

  .day-name {
    font-size: 10px;
    font-weight: var(--ds-font-weight-semibold);
    color: var(--ds-color-neutral-text-subtle);
    letter-spacing: 0.05em;
  }

  .day-number {
    font-size: var(--ds-font-size-md);
    font-weight: var(--ds-font-weight-bold);
    color: var(--ds-color-neutral-text-default);
  }

  .today-indicator {
    font-size: 9px;
    font-weight: var(--ds-font-weight-semibold);
    color: var(--ds-color-accent-text-default);
    text-transform: uppercase;
  }

  /* Slot Cells */
  .slot-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 38px;
    border-right: 1px solid var(--ds-color-neutral-border-subtle);
    position: relative;
    transition: all 0.15s ease;
  }

  .slot-cell:last-child {
    border-right: none;
  }

  .slot-cell.available {
    background: var(--ds-color-success-surface-default);
    cursor: pointer;
  }

  .slot-cell.available:hover {
    background: var(--ds-color-success-surface-hover);
    transform: scale(1.02);
    z-index: 1;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .slot-cell.selected {
    background: var(--ds-color-accent-base-default);
    color: var(--ds-color-accent-contrast-default);
    cursor: pointer;
  }

  .slot-cell.selected:hover {
    background: var(--ds-color-accent-base-hover);
  }

  .slot-cell.occupied {
    background: var(--ds-color-danger-surface-default);
  }

  .slot-cell.blocked,
  .slot-cell.unavailable {
    background: var(--ds-color-neutral-surface-default);
  }

  .slot-time {
    font-size: var(--ds-font-size-xs);
    font-weight: var(--ds-font-weight-medium);
  }

  .slot-cell.available .slot-time {
    color: var(--ds-color-success-text-default);
  }

  .slot-cell.occupied .slot-time {
    color: var(--ds-color-danger-text-default);
  }

  .slot-check {
    position: absolute;
    top: 2px;
    right: 2px;
  }

  /* Legend */
  .calendar-legend {
    display: flex;
    justify-content: center;
    gap: var(--ds-spacing-5);
    margin-top: var(--ds-spacing-4);
    flex-wrap: wrap;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: var(--ds-spacing-2);
    font-size: var(--ds-font-size-xs);
    color: var(--ds-color-neutral-text-subtle);
  }

  .legend-dot {
    width: 12px;
    height: 12px;
    border-radius: var(--ds-border-radius-sm);
  }

  .legend-dot.available {
    background: var(--ds-color-success-surface-default);
    border: 1px solid var(--ds-color-success-border-subtle);
  }

  .legend-dot.selected {
    background: var(--ds-color-accent-base-default);
  }

  .legend-dot.occupied {
    background: var(--ds-color-danger-surface-default);
    border: 1px solid var(--ds-color-danger-border-subtle);
  }

  .legend-dot.blocked {
    background: var(--ds-color-neutral-surface-default);
    border: 1px solid var(--ds-color-neutral-border-subtle);
  }

  /* Summary Panel */
  .summary-panel {
    padding: var(--ds-spacing-5);
    background: var(--ds-color-neutral-surface-default);
    display: flex;
    flex-direction: column;
    gap: var(--ds-spacing-4);
  }

  .summary-header {
    display: flex;
    align-items: center;
    gap: var(--ds-spacing-3);
    color: var(--ds-color-accent-base-default);
  }

  .summary-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--ds-spacing-8) var(--ds-spacing-4);
    gap: var(--ds-spacing-4);
  }

  .empty-illustration {
    width: 72px;
    height: 72px;
    border-radius: var(--ds-border-radius-full);
    background: var(--ds-color-neutral-background-default);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ds-color-neutral-text-subtle);
  }

  /* Selected Slots List */
  .selected-slots-list {
    flex: 1;
    overflow-y: auto;
    max-height: 240px;
  }

  .selected-slot-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--ds-spacing-3);
    background: var(--ds-color-neutral-background-default);
    border-radius: var(--ds-border-radius-md);
    margin-bottom: var(--ds-spacing-2);
    animation: slideIn 0.2s ease-out forwards;
    opacity: 0;
    transform: translateX(-10px);
  }

  @keyframes slideIn {
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .slot-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .slot-date {
    font-size: var(--ds-font-size-sm);
    font-weight: var(--ds-font-weight-medium);
    text-transform: capitalize;
  }

  .slot-time-range {
    font-size: var(--ds-font-size-xs);
    color: var(--ds-color-neutral-text-subtle);
  }

  .slot-remove {
    width: 28px;
    height: 28px;
    border: none;
    border-radius: var(--ds-border-radius-full);
    background: transparent;
    color: var(--ds-color-neutral-text-subtle);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
  }

  .slot-remove:hover {
    background: var(--ds-color-danger-surface-default);
    color: var(--ds-color-danger-base-default);
  }

  /* Price Summary */
  .price-summary {
    padding: var(--ds-spacing-4);
    background: var(--ds-color-accent-surface-default);
    border-radius: var(--ds-border-radius-md);
  }

  .price-row {
    display: flex;
    justify-content: space-between;
    font-size: var(--ds-font-size-sm);
    padding: var(--ds-spacing-1) 0;
  }

  .price-row.discount .price-value {
    color: var(--ds-color-success-text-default);
  }

  .price-row.total {
    margin-top: var(--ds-spacing-2);
    padding-top: var(--ds-spacing-3);
    border-top: 1px solid var(--ds-color-accent-border-subtle);
    font-weight: var(--ds-font-weight-semibold);
  }

  .price-row.total .price-value {
    font-size: var(--ds-font-size-lg);
    color: var(--ds-color-accent-base-default);
  }

  /* Summary Actions */
  .summary-actions {
    display: flex;
    gap: var(--ds-spacing-2);
  }

  .summary-actions button {
    flex: 1;
  }

  .summary-actions button:last-child {
    flex: 2;
  }

  /* Tips Section */
  .tips-section {
    padding: var(--ds-spacing-3);
    background: var(--ds-color-neutral-background-default);
    border-radius: var(--ds-border-radius-md);
    border: 1px dashed var(--ds-color-neutral-border-default);
    margin-top: auto;
  }

  .tips-list {
    margin: 0;
    padding-left: var(--ds-spacing-4);
    font-size: var(--ds-font-size-xs);
    color: var(--ds-color-neutral-text-subtle);
  }

  .tips-list li {
    margin-bottom: var(--ds-spacing-1);
  }

  /* Success View */
  .success-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--ds-spacing-12);
    min-height: 400px;
  }

  .success-icon {
    width: 96px;
    height: 96px;
    border-radius: var(--ds-border-radius-full);
    background: var(--ds-color-success-surface-default);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ds-color-success-base-default);
    margin-bottom: var(--ds-spacing-6);
    animation: bounceIn 0.5s ease-out;
  }

  @keyframes bounceIn {
    0% { transform: scale(0); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }

  /* Form & Confirm Views */
  .form-view,
  .confirm-view {
    padding: var(--ds-spacing-6);
  }

  /* Responsive */
  @media (max-width: 991px) {
    .selection-view {
      grid-template-columns: 1fr;
    }

    .calendar-panel {
      border-right: none;
      border-bottom: 1px solid var(--ds-color-neutral-border-subtle);
    }

    .summary-panel {
      max-height: 400px;
    }
  }

  @media (max-width: 767px) {
    .booking-engine-header {
      flex-direction: column;
      gap: var(--ds-spacing-4);
    }

    .header-price {
      align-self: flex-start;
    }

    .booking-engine-stepper {
      flex-direction: column;
      gap: var(--ds-spacing-3);
    }

    .stepper-track {
      flex-wrap: wrap;
      justify-content: center;
    }

    .stepper-label {
      display: none;
    }

    .calendar-panel-header {
      flex-direction: column;
      align-items: stretch;
    }

    .calendar-navigation {
      justify-content: center;
    }
  }

  /* ============================================ */
  /* Daily Mode Styles */
  /* ============================================ */
  .daily-mode .month-calendar,
  .range-mode .month-calendar {
    background: var(--ds-color-neutral-background-default);
    border: 1px solid var(--ds-color-neutral-border-subtle);
    border-radius: var(--ds-border-radius-lg);
    padding: var(--ds-spacing-4);
  }

  .month-header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: var(--ds-spacing-1);
    margin-bottom: var(--ds-spacing-2);
  }

  .month-day-name {
    text-align: center;
    font-size: var(--ds-font-size-xs);
    font-weight: var(--ds-font-weight-semibold);
    color: var(--ds-color-neutral-text-subtle);
    padding: var(--ds-spacing-2);
  }

  .month-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: var(--ds-spacing-1);
  }

  .month-day {
    aspect-ratio: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: var(--ds-border-radius-md);
    background: transparent;
    cursor: pointer;
    transition: all 0.15s ease;
    position: relative;
    min-height: 48px;
    font-family: inherit;
  }

  .month-day.empty {
    cursor: default;
  }

  .month-day.available:hover {
    background: var(--ds-color-accent-surface-hover);
  }

  .month-day.past {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .month-day.today {
    background: var(--ds-color-accent-surface-default);
  }

  .month-day.today .day-number {
    color: var(--ds-color-accent-base-default);
    font-weight: var(--ds-font-weight-bold);
  }

  .month-day.selected {
    background: var(--ds-color-accent-base-default);
  }

  .month-day.selected .day-number {
    color: var(--ds-color-accent-contrast-default);
  }

  .month-day.selected .day-price {
    display: none;
  }

  .month-day .day-number {
    font-size: var(--ds-font-size-sm);
    font-weight: var(--ds-font-weight-medium);
  }

  .month-day .day-price {
    font-size: 9px;
    color: var(--ds-color-success-text-default);
    margin-top: 2px;
  }

  .month-day .day-check {
    position: absolute;
    top: 4px;
    right: 4px;
    color: var(--ds-color-accent-contrast-default);
  }

  /* ============================================ */
  /* Date Range Mode Styles */
  /* ============================================ */
  .range-hint {
    display: flex;
    align-items: center;
    gap: var(--ds-spacing-2);
    padding: var(--ds-spacing-3);
    background: var(--ds-color-info-surface-default);
    border-radius: var(--ds-border-radius-md);
    margin-bottom: var(--ds-spacing-4);
    color: var(--ds-color-info-text-default);
  }

  .range-grid .month-day.in-range {
    background: var(--ds-color-accent-surface-default);
  }

  .range-grid .month-day.range-start,
  .range-grid .month-day.range-end {
    background: var(--ds-color-accent-base-default);
  }

  .range-grid .month-day.range-start .day-number,
  .range-grid .month-day.range-end .day-number {
    color: var(--ds-color-accent-contrast-default);
  }

  .range-grid .month-day.range-start {
    border-radius: var(--ds-border-radius-md) 0 0 var(--ds-border-radius-md);
  }

  .range-grid .month-day.range-end {
    border-radius: 0 var(--ds-border-radius-md) var(--ds-border-radius-md) 0;
  }

  .range-grid .month-day.range-start.range-end {
    border-radius: var(--ds-border-radius-md);
  }

  .range-summary {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--ds-spacing-4);
    padding: var(--ds-spacing-4);
    background: var(--ds-color-neutral-background-default);
    border-radius: var(--ds-border-radius-md);
  }

  .range-date-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--ds-spacing-1);
  }

  .range-label {
    font-size: var(--ds-font-size-xs);
    color: var(--ds-color-neutral-text-subtle);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .range-date {
    font-size: var(--ds-font-size-sm);
    font-weight: var(--ds-font-weight-semibold);
  }

  .range-arrow {
    font-size: var(--ds-font-size-lg);
    color: var(--ds-color-neutral-text-subtle);
  }

  .range-info {
    padding: var(--ds-spacing-3);
    background: var(--ds-color-neutral-background-default);
    border-radius: var(--ds-border-radius-md);
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    font-size: var(--ds-font-size-sm);
    padding: var(--ds-spacing-1) 0;
  }

  .info-value {
    font-weight: var(--ds-font-weight-semibold);
  }

  /* ============================================ */
  /* Event Mode Styles */
  /* ============================================ */
  .event-mode {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
  }

  .event-panel {
    padding: var(--ds-spacing-8);
    display: flex;
    flex-direction: column;
    gap: var(--ds-spacing-4);
  }

  .event-badge {
    display: inline-flex;
    padding: var(--ds-spacing-1) var(--ds-spacing-3);
    background: var(--ds-color-brand1-surface-default);
    color: var(--ds-color-brand1-text-default);
    font-size: var(--ds-font-size-xs);
    font-weight: var(--ds-font-weight-semibold);
    border-radius: var(--ds-border-radius-full);
    letter-spacing: 0.05em;
    width: fit-content;
  }

  .event-date-info {
    display: flex;
    align-items: center;
    gap: var(--ds-spacing-2);
    color: var(--ds-color-neutral-text-subtle);
    font-size: var(--ds-font-size-md);
  }

  .ticket-selector {
    padding: var(--ds-spacing-5);
    background: var(--ds-color-neutral-surface-default);
    border-radius: var(--ds-border-radius-lg);
    border: 1px solid var(--ds-color-neutral-border-subtle);
  }

  .ticket-type {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: var(--ds-spacing-4);
    align-items: center;
  }

  .ticket-info {
    display: flex;
    flex-direction: column;
    gap: var(--ds-spacing-1);
  }

  .ticket-price {
    font-size: var(--ds-font-size-lg);
    font-weight: var(--ds-font-weight-bold);
    color: var(--ds-color-accent-base-default);
  }

  .price-per {
    font-size: var(--ds-font-size-sm);
    font-weight: var(--ds-font-weight-regular);
    color: var(--ds-color-neutral-text-subtle);
  }

  .ticket-controls {
    display: flex;
    align-items: center;
    gap: var(--ds-spacing-2);
  }

  .ticket-btn {
    width: 40px;
    height: 40px;
    border: 1px solid var(--ds-color-neutral-border-default);
    border-radius: var(--ds-border-radius-md);
    background: var(--ds-color-neutral-background-default);
    font-size: var(--ds-font-size-xl);
    font-weight: var(--ds-font-weight-bold);
    color: var(--ds-color-neutral-text-default);
    cursor: pointer;
    transition: all 0.15s ease;
    font-family: inherit;
  }

  .ticket-btn:hover:not(:disabled) {
    background: var(--ds-color-accent-surface-hover);
    border-color: var(--ds-color-accent-border-default);
    color: var(--ds-color-accent-base-default);
  }

  .ticket-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .ticket-count {
    min-width: 48px;
    text-align: center;
    font-size: var(--ds-font-size-xl);
    font-weight: var(--ds-font-weight-bold);
  }

  .ticket-capacity {
    display: flex;
    align-items: center;
    gap: var(--ds-spacing-2);
    margin-top: var(--ds-spacing-4);
    padding-top: var(--ds-spacing-4);
    border-top: 1px solid var(--ds-color-neutral-border-subtle);
    font-size: var(--ds-font-size-sm);
    color: var(--ds-color-neutral-text-subtle);
  }

  .order-summary {
    padding: var(--ds-spacing-3);
    background: var(--ds-color-neutral-background-default);
    border-radius: var(--ds-border-radius-md);
  }

  .order-item {
    display: flex;
    justify-content: space-between;
    font-size: var(--ds-font-size-sm);
  }

  /* ============================================ */
  /* Recurring Mode Styles */
  /* ============================================ */
  .recurring-mode {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
  }

  .recurring-panel {
    padding: var(--ds-spacing-6);
  }

  .recurring-section {
    margin-bottom: var(--ds-spacing-6);
    padding: var(--ds-spacing-4);
    background: var(--ds-color-neutral-surface-default);
    border-radius: var(--ds-border-radius-lg);
  }

  .weekday-selector {
    display: flex;
    gap: var(--ds-spacing-2);
    flex-wrap: wrap;
  }

  .weekday-btn {
    padding: var(--ds-spacing-2) var(--ds-spacing-3);
    border: 1px solid var(--ds-color-neutral-border-default);
    border-radius: var(--ds-border-radius-md);
    background: var(--ds-color-neutral-background-default);
    font-size: var(--ds-font-size-sm);
    font-weight: var(--ds-font-weight-medium);
    cursor: pointer;
    transition: all 0.15s ease;
    font-family: inherit;
  }

  .weekday-btn:hover {
    border-color: var(--ds-color-accent-border-default);
    background: var(--ds-color-accent-surface-default);
  }

  .weekday-btn.selected {
    background: var(--ds-color-accent-base-default);
    border-color: var(--ds-color-accent-base-default);
    color: var(--ds-color-accent-contrast-default);
  }

  .time-selector,
  .date-selector {
    display: flex;
    align-items: flex-end;
    gap: var(--ds-spacing-3);
  }

  .time-input,
  .date-input {
    display: flex;
    flex-direction: column;
    gap: var(--ds-spacing-1);
    flex: 1;
  }

  .time-input label,
  .date-input label {
    font-size: var(--ds-font-size-xs);
    color: var(--ds-color-neutral-text-subtle);
  }

  .time-input select,
  .date-input input {
    padding: var(--ds-spacing-2) var(--ds-spacing-3);
    border: 1px solid var(--ds-color-neutral-border-default);
    border-radius: var(--ds-border-radius-md);
    background: var(--ds-color-neutral-background-default);
    font-size: var(--ds-font-size-sm);
    font-family: inherit;
  }

  .time-separator {
    padding-bottom: var(--ds-spacing-2);
    color: var(--ds-color-neutral-text-subtle);
  }

  .recurring-summary {
    padding: var(--ds-spacing-3);
    background: var(--ds-color-neutral-background-default);
    border-radius: var(--ds-border-radius-md);
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    font-size: var(--ds-font-size-sm);
    padding: var(--ds-spacing-2) 0;
    border-bottom: 1px solid var(--ds-color-neutral-border-subtle);
  }

  .summary-row:last-child {
    border-bottom: none;
  }

  .summary-row.highlight {
    font-weight: var(--ds-font-weight-semibold);
    color: var(--ds-color-accent-text-default);
  }

  /* ============================================ */
  /* Instant Mode Styles */
  /* ============================================ */
  .instant-mode {
    display: flex;
    justify-content: center;
  }

  .instant-panel {
    padding: var(--ds-spacing-12);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--ds-spacing-4);
    max-width: 500px;
    text-align: center;
  }

  .instant-icon {
    width: 96px;
    height: 96px;
    border-radius: var(--ds-border-radius-full);
    background: linear-gradient(135deg, var(--ds-color-accent-surface-default) 0%, var(--ds-color-brand1-surface-default) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ds-color-accent-base-default);
  }

  .instant-price-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--ds-spacing-5);
    background: var(--ds-color-neutral-surface-default);
    border-radius: var(--ds-border-radius-lg);
    margin: var(--ds-spacing-4) 0;
    width: 100%;
  }

  .instant-price-label {
    font-size: var(--ds-font-size-sm);
    color: var(--ds-color-neutral-text-subtle);
  }

  .instant-price-amount {
    font-size: var(--ds-font-size-2xl);
    font-weight: var(--ds-font-weight-bold);
    color: var(--ds-color-accent-base-default);
  }

  .instant-price-unit {
    font-size: var(--ds-font-size-sm);
    color: var(--ds-color-neutral-text-subtle);
  }

  /* ============================================ */
  /* Form Step Styles */
  /* ============================================ */
  .form-view {
    padding: var(--ds-spacing-6);
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--ds-spacing-6);
  }

  .form-section {
    padding: var(--ds-spacing-5);
    background: var(--ds-color-neutral-surface-default);
    border-radius: var(--ds-border-radius-lg);
  }

  .form-section.services-section,
  .form-section.terms-section {
    grid-column: span 2;
  }

  .form-group {
    margin-bottom: var(--ds-spacing-4);
  }

  .form-group:last-child {
    margin-bottom: 0;
  }

  .form-group label {
    display: block;
    margin-bottom: var(--ds-spacing-1);
    font-size: var(--ds-font-size-sm);
    font-weight: var(--ds-font-weight-medium);
    color: var(--ds-color-neutral-text-default);
  }

  .form-group input[type="text"],
  .form-group input[type="email"],
  .form-group input[type="tel"],
  .form-group input[type="number"],
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: var(--ds-spacing-3);
    border: 1px solid var(--ds-color-neutral-border-default);
    border-radius: var(--ds-border-radius-md);
    background: var(--ds-color-neutral-background-default);
    font-size: var(--ds-font-size-sm);
    font-family: inherit;
    transition: border-color 0.15s ease;
  }

  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: var(--ds-color-accent-border-default);
    box-shadow: 0 0 0 3px var(--ds-color-focus-outer);
  }

  .form-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--ds-spacing-4);
  }

  .checkbox-group label {
    display: flex;
    align-items: flex-start;
    gap: var(--ds-spacing-2);
    cursor: pointer;
  }

  .checkbox-group input[type="checkbox"] {
    width: 18px;
    height: 18px;
    margin-top: 2px;
    accent-color: var(--ds-color-accent-base-default);
  }

  .checkbox-group span {
    font-size: var(--ds-font-size-sm);
  }

  .checkbox-group a {
    color: var(--ds-color-accent-text-default);
    text-decoration: underline;
  }

  .services-list {
    display: flex;
    flex-direction: column;
    gap: var(--ds-spacing-2);
  }

  .service-item {
    display: flex;
    align-items: center;
    gap: var(--ds-spacing-3);
    padding: var(--ds-spacing-3);
    background: var(--ds-color-neutral-background-default);
    border-radius: var(--ds-border-radius-md);
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .service-item:hover {
    background: var(--ds-color-neutral-surface-hover);
  }

  .service-item input[type="checkbox"] {
    width: 20px;
    height: 20px;
    accent-color: var(--ds-color-accent-base-default);
  }

  .service-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .service-name {
    font-weight: var(--ds-font-weight-medium);
  }

  .service-desc {
    font-size: var(--ds-font-size-xs);
    color: var(--ds-color-neutral-text-subtle);
  }

  .service-price {
    font-weight: var(--ds-font-weight-semibold);
    color: var(--ds-color-accent-text-default);
  }

  .form-actions {
    display: flex;
    justify-content: space-between;
    margin-top: var(--ds-spacing-6);
    padding-top: var(--ds-spacing-6);
    border-top: 1px solid var(--ds-color-neutral-border-subtle);
  }

  /* ============================================ */
  /* Confirm Step Styles */
  /* ============================================ */
  .confirm-view {
    padding: var(--ds-spacing-6);
  }

  .confirm-grid {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: var(--ds-spacing-6);
  }

  .confirm-section {
    display: flex;
    flex-direction: column;
    gap: var(--ds-spacing-4);
  }

  .confirm-section.price-section {
    padding: var(--ds-spacing-5);
    background: var(--ds-color-neutral-surface-default);
    border-radius: var(--ds-border-radius-lg);
    height: fit-content;
    position: sticky;
    top: var(--ds-spacing-6);
  }

  .confirm-card {
    padding: var(--ds-spacing-4);
    background: var(--ds-color-neutral-surface-default);
    border-radius: var(--ds-border-radius-md);
  }

  .confirm-card.rental-object-card {
    display: flex;
    gap: var(--ds-spacing-4);
    align-items: center;
  }

  .rental-object-image {
    width: 80px;
    height: 60px;
    object-fit: cover;
    border-radius: var(--ds-border-radius-sm);
  }

  .rental-object-info {
    display: flex;
    flex-direction: column;
    gap: var(--ds-spacing-1);
  }

  .rental-object-type {
    font-size: var(--ds-font-size-xs);
    color: var(--ds-color-neutral-text-subtle);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .time-list {
    display: flex;
    flex-direction: column;
    gap: var(--ds-spacing-2);
  }

  .time-item {
    display: flex;
    justify-content: space-between;
    font-size: var(--ds-font-size-sm);
    padding: var(--ds-spacing-2);
    background: var(--ds-color-neutral-background-default);
    border-radius: var(--ds-border-radius-sm);
  }

  .more-times {
    font-size: var(--ds-font-size-xs);
    color: var(--ds-color-neutral-text-subtle);
    text-align: center;
    padding: var(--ds-spacing-2);
  }

  .date-range-display,
  .tickets-display {
    display: flex;
    flex-direction: column;
    gap: var(--ds-spacing-1);
    font-size: var(--ds-font-size-sm);
  }

  .event-date {
    font-size: var(--ds-font-size-xs);
    color: var(--ds-color-neutral-text-subtle);
  }

  .contact-summary p {
    margin: 0;
    padding: var(--ds-spacing-1) 0;
    font-size: var(--ds-font-size-sm);
  }

  .contact-summary p:first-child {
    padding-top: 0;
  }

  .details-summary {
    display: flex;
    flex-direction: column;
    gap: var(--ds-spacing-2);
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    font-size: var(--ds-font-size-sm);
  }

  .detail-row span:first-child {
    color: var(--ds-color-neutral-text-subtle);
  }

  .price-breakdown {
    margin-bottom: var(--ds-spacing-4);
  }

  .policy-notice {
    display: flex;
    gap: var(--ds-spacing-3);
    padding: var(--ds-spacing-3);
    background: var(--ds-color-info-surface-default);
    border-radius: var(--ds-border-radius-md);
    font-size: var(--ds-font-size-sm);
    color: var(--ds-color-info-text-default);
  }

  .policy-notice strong {
    display: block;
    margin-bottom: var(--ds-spacing-1);
  }

  .policy-notice p {
    margin: 0;
  }

  .confirm-actions {
    display: flex;
    justify-content: space-between;
    margin-top: var(--ds-spacing-6);
    padding-top: var(--ds-spacing-6);
    border-top: 1px solid var(--ds-color-neutral-border-subtle);
  }

  /* Responsive for new modes */
  @media (max-width: 991px) {
    .event-mode,
    .recurring-mode,
    .form-grid,
    .confirm-grid {
      grid-template-columns: 1fr;
    }

    .form-section.services-section,
    .form-section.terms-section {
      grid-column: span 1;
    }

    .confirm-section.price-section {
      position: static;
    }
  }

  @media (max-width: 767px) {
    .form-row {
      grid-template-columns: 1fr;
    }

    .ticket-type {
      grid-template-columns: 1fr;
      gap: var(--ds-spacing-3);
    }

    .ticket-controls {
      justify-content: center;
    }

    .weekday-selector {
      justify-content: center;
    }

    .time-selector,
    .date-selector {
      flex-direction: column;
      gap: var(--ds-spacing-2);
    }

    .time-separator {
      display: none;
    }
  }
`;
