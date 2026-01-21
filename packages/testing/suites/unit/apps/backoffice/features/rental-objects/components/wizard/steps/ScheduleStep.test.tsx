/**
 * Unit Tests for ScheduleStep Component
 * Tests schedule configuration for experiences category
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScheduleStep } from './ScheduleStep';
import type { UseRentalObjectWizardReturn } from '@xala/backoffice/hooks/useRentalObjectWizard';

// Mock @xala/i18n
vi.mock('@xala/i18n', () => ({
  useT: () => (key: string) => key,
}));

// Mock @xalatechnologies/platform/ui icons
vi.mock('@xalatechnologies/platform/ui', async () => {
  const actual = await vi.importActual('@xalatechnologies/platform/ui');
  return {
    ...actual,
    CalendarIcon: () => <div data-testid="calendar-icon" />,
    ClockIcon: () => <div data-testid="clock-icon" />,
  };
});

// SKIPPED
describe.skip('ScheduleStep', () => {
  let mockWizard: UseRentalObjectWizardReturn;

  beforeEach(() => {
    mockWizard = {
      formData: {
        scheduleType: 'fixed',
        recurringPattern: 'weekly',
        startTime: '',
        endTime: '',
        daysOfWeek: [],
      },
      updateFormData: vi.fn(),
      errors: {},
      currentStep: 'schedule',
      steps: [],
      goToStep: vi.fn(),
      nextStep: vi.fn(),
      prevStep: vi.fn(),
      canGoNext: true,
      canGoPrev: true,
      isFirstStep: false,
      isLastStep: false,
      saveDraft: vi.fn(),
      publish: vi.fn(),
      cancel: vi.fn(),
      isSaving: false,
      isPublishing: false,
    } as unknown as UseRentalObjectWizardReturn;
  });

  describe('Rendering', () => {
    it('should render header with icon and title', () => {
      render(<ScheduleStep wizard={mockWizard} />);

      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
      expect(screen.getByText('wizard.step.schedule')).toBeInTheDocument();
      expect(screen.getByText('rentalObjects.scheduleDescription')).toBeInTheDocument();
    });

    it('should render schedule type section', () => {
      render(<ScheduleStep wizard={mockWizard} />);

      expect(screen.getByText('form.schedule.scheduleType')).toBeInTheDocument();
    });

    it('should render error alert when errors exist', () => {
      mockWizard.errors = {
        schedule: ['Schedule error 1', 'Schedule error 2'],
      };

      render(<ScheduleStep wizard={mockWizard} />);

      expect(screen.getByText('Schedule error 1')).toBeInTheDocument();
      expect(screen.getByText('Schedule error 2')).toBeInTheDocument();
    });

    it('should render info message at bottom', () => {
      render(<ScheduleStep wizard={mockWizard} />);

      expect(screen.getByText('rentalObjects.scheduleInfo')).toBeInTheDocument();
    });
  });

  describe('Schedule Type Selection', () => {
    it('should render fixed schedule option', () => {
      render(<ScheduleStep wizard={mockWizard} />);

      expect(screen.getByText('form.schedule.fixed')).toBeInTheDocument();
      expect(screen.getByText('form.schedule.fixedDescription')).toBeInTheDocument();
    });

    it('should render on-demand schedule option', () => {
      render(<ScheduleStep wizard={mockWizard} />);

      expect(screen.getByText('form.schedule.onDemand')).toBeInTheDocument();
      expect(screen.getByText('form.schedule.onDemandDescription')).toBeInTheDocument();
    });

    it('should highlight selected schedule type', () => {
      mockWizard.formData.scheduleType = 'fixed';

      const { container } = render(<ScheduleStep wizard={mockWizard} />);

      const fixedOption = screen.getByText('form.schedule.fixed').closest('label');
      expect(fixedOption).toHaveStyle({
        backgroundColor: 'var(--ds-color-accent-surface-default)',
      });
    });

    it('should update scheduleType when option clicked', () => {
      render(<ScheduleStep wizard={mockWizard} />);

      const onDemandRadio = screen.getByDisplayValue('on-demand');
      fireEvent.click(onDemandRadio);

      expect(mockWizard.updateFormData).toHaveBeenCalledWith({
        scheduleType: 'on-demand',
      });
    });
  });

  describe('Fixed Schedule Configuration', () => {
    beforeEach(() => {
      mockWizard.formData.scheduleType = 'fixed';
    });

    it('should show configuration section when fixed schedule selected', () => {
      render(<ScheduleStep wizard={mockWizard} />);

      expect(screen.getByText('form.schedule.configureSchedule')).toBeInTheDocument();
    });

    it('should render recurring pattern dropdown', () => {
      render(<ScheduleStep wizard={mockWizard} />);

      const patternSelect = screen.getByLabelText('form.schedule.recurringPattern');
      expect(patternSelect).toBeInTheDocument();
    });

    it('should update recurringPattern when selection changes', () => {
      render(<ScheduleStep wizard={mockWizard} />);

      const patternSelect = screen.getByLabelText('form.schedule.recurringPattern');
      fireEvent.change(patternSelect, { target: { value: 'daily' } });

      expect(mockWizard.updateFormData).toHaveBeenCalledWith({
        recurringPattern: 'daily',
      });
    });

    it('should render start time field', () => {
      render(<ScheduleStep wizard={mockWizard} />);

      const startTimeInput = screen.getByLabelText('form.schedule.startTime');
      expect(startTimeInput).toBeInTheDocument();
      expect(startTimeInput).toHaveAttribute('type', 'time');
    });

    it('should update startTime when value changes', () => {
      render(<ScheduleStep wizard={mockWizard} />);

      const startTimeInput = screen.getByLabelText('form.schedule.startTime');
      fireEvent.change(startTimeInput, { target: { value: '10:00' } });

      expect(mockWizard.updateFormData).toHaveBeenCalledWith({
        startTime: '10:00',
      });
    });

    it('should render end time field', () => {
      render(<ScheduleStep wizard={mockWizard} />);

      const endTimeInput = screen.getByLabelText('form.schedule.endTime');
      expect(endTimeInput).toBeInTheDocument();
      expect(endTimeInput).toHaveAttribute('type', 'time');
    });

    it('should update endTime when value changes', () => {
      render(<ScheduleStep wizard={mockWizard} />);

      const endTimeInput = screen.getByLabelText('form.schedule.endTime');
      fireEvent.change(endTimeInput, { target: { value: '12:00' } });

      expect(mockWizard.updateFormData).toHaveBeenCalledWith({
        endTime: '12:00',
      });
    });
  });

  describe('Days of Week Selection', () => {
    beforeEach(() => {
      mockWizard.formData.scheduleType = 'fixed';
      mockWizard.formData.recurringPattern = 'weekly';
    });

    it('should show days of week when weekly pattern selected', () => {
      render(<ScheduleStep wizard={mockWizard} />);

      expect(screen.getByText('form.schedule.daysOfWeek')).toBeInTheDocument();
    });

    it('should render checkboxes for all days of the week', () => {
      render(<ScheduleStep wizard={mockWizard} />);

      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

      days.forEach((day) => {
        expect(screen.getByText(`day.${day}`)).toBeInTheDocument();
      });
    });

    it('should add day when checkbox checked', () => {
      mockWizard.formData.daysOfWeek = [];

      render(<ScheduleStep wizard={mockWizard} />);

      const mondayCheckbox = screen.getByLabelText('day.monday');
      fireEvent.click(mondayCheckbox);

      expect(mockWizard.updateFormData).toHaveBeenCalledWith({
        daysOfWeek: ['monday'],
      });
    });

    it('should remove day when checkbox unchecked', () => {
      mockWizard.formData.daysOfWeek = ['monday', 'tuesday'];

      render(<ScheduleStep wizard={mockWizard} />);

      const mondayCheckbox = screen.getByLabelText('day.monday');
      fireEvent.click(mondayCheckbox);

      expect(mockWizard.updateFormData).toHaveBeenCalledWith({
        daysOfWeek: ['tuesday'],
      });
    });

    it('should show selected days as checked', () => {
      mockWizard.formData.daysOfWeek = ['monday', 'wednesday', 'friday'];

      render(<ScheduleStep wizard={mockWizard} />);

      const mondayCheckbox = screen.getByLabelText('day.monday') as HTMLInputElement;
      const tuesdayCheckbox = screen.getByLabelText('day.tuesday') as HTMLInputElement;
      const wednesdayCheckbox = screen.getByLabelText('day.wednesday') as HTMLInputElement;

      expect(mondayCheckbox.checked).toBe(true);
      expect(tuesdayCheckbox.checked).toBe(false);
      expect(wednesdayCheckbox.checked).toBe(true);
    });

    it('should not show days of week when daily pattern selected', () => {
      mockWizard.formData.recurringPattern = 'daily';

      render(<ScheduleStep wizard={mockWizard} />);

      expect(screen.queryByText('form.schedule.daysOfWeek')).not.toBeInTheDocument();
    });
  });

  describe('On-Demand Configuration', () => {
    beforeEach(() => {
      mockWizard.formData.scheduleType = 'on-demand';
    });

    it('should hide schedule configuration when on-demand selected', () => {
      render(<ScheduleStep wizard={mockWizard} />);

      expect(screen.queryByText('form.schedule.configureSchedule')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('form.schedule.recurringPattern')).not.toBeInTheDocument();
    });

    it('should show on-demand message', () => {
      render(<ScheduleStep wizard={mockWizard} />);

      const onDemandOption = screen.getByText('form.schedule.on-demandDescription');
      expect(onDemandOption).toBeInTheDocument();
    });
  });

  describe('Existing Data Display', () => {
    it('should display existing scheduleType', () => {
      mockWizard.formData.scheduleType = 'on-demand';

      render(<ScheduleStep wizard={mockWizard} />);

      const onDemandRadio = screen.getByDisplayValue('on-demand') as HTMLInputElement;
      expect(onDemandRadio.checked).toBe(true);
    });

    it('should display existing recurringPattern', () => {
      mockWizard.formData.scheduleType = 'fixed';
      mockWizard.formData.recurringPattern = 'daily';

      render(<ScheduleStep wizard={mockWizard} />);

      const patternSelect = screen.getByLabelText('form.schedule.recurringPattern');
      expect(patternSelect).toHaveValue('daily');
    });

    it('should display existing start and end times', () => {
      mockWizard.formData.scheduleType = 'fixed';
      mockWizard.formData.startTime = '09:00';
      mockWizard.formData.endTime = '17:00';

      render(<ScheduleStep wizard={mockWizard} />);

      const startTimeInput = screen.getByLabelText('form.schedule.startTime');
      const endTimeInput = screen.getByLabelText('form.schedule.endTime');

      expect(startTimeInput).toHaveValue('09:00');
      expect(endTimeInput).toHaveValue('17:00');
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-hidden on decorative icons', () => {
      render(<ScheduleStep wizard={mockWizard} />);

      const icons = [
        screen.getByTestId('calendar-icon'),
        screen.queryByTestId('clock-icon'),
      ].filter(Boolean);

      icons.forEach((icon) => {
        if (icon) {
          expect(icon.parentElement).toHaveAttribute('aria-hidden', 'true');
        }
      });
    });

    it('should have proper labels for radio inputs', () => {
      render(<ScheduleStep wizard={mockWizard} />);

      const fixedRadio = screen.getByDisplayValue('fixed');
      const onDemandRadio = screen.getByDisplayValue('on-demand');

      expect(fixedRadio).toHaveAttribute('type', 'radio');
      expect(onDemandRadio).toHaveAttribute('type', 'radio');
      expect(fixedRadio).toHaveAttribute('name', 'scheduleType');
      expect(onDemandRadio).toHaveAttribute('name', 'scheduleType');
    });

    it('should have proper labels for all form fields', () => {
      mockWizard.formData.scheduleType = 'fixed';
      mockWizard.formData.recurringPattern = 'weekly';

      render(<ScheduleStep wizard={mockWizard} />);

      expect(screen.getByLabelText('form.schedule.recurringPattern')).toBeInTheDocument();
      expect(screen.getByLabelText('form.schedule.startTime')).toBeInTheDocument();
      expect(screen.getByLabelText('form.schedule.endTime')).toBeInTheDocument();
    });
  });
});
