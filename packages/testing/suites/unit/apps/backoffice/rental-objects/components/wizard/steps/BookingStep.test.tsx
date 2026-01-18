/**
 * Unit Tests for BookingStep Component
 * Tests booking configuration for all categories
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BookingStep } from './BookingStep';
import type { UseRentalObjectWizardReturn } from '@xala/backoffice/hooks/useRentalObjectWizard';

// Mock @xala/i18n
vi.mock('@xala/i18n', () => ({
  useT: () => (key: string) => key,
}));

// Mock @xala/ds icons
vi.mock('@xala/ds', async () => {
  const actual = await vi.importActual('@xala/ds');
  return {
    ...actual,
    CreditCardIcon: () => <div data-testid="credit-card-icon" />,
    SettingsIcon: () => <div data-testid="settings-icon" />,
    ClockIcon: () => <div data-testid="clock-icon" />,
  };
});

describe('BookingStep', () => {
  let mockWizard: UseRentalObjectWizardReturn;

  beforeEach(() => {
    mockWizard = {
      formData: {
        category: 'LOKALER_OG_BANER',
        basePrice: 0,
        pricingUnit: 'hour',
        memberDiscount: 0,
        cancellationPolicy: '',
        minAdvanceNoticeHours: 0,
        maxAdvanceBookingDays: 0,
      },
      updateFormData: vi.fn(),
      errors: {},
      currentStep: 'booking',
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
      render(<BookingStep wizard={mockWizard} />);

      expect(screen.getByTestId('credit-card-icon')).toBeInTheDocument();
      expect(screen.getByText('wizard.step.booking')).toBeInTheDocument();
      expect(screen.getByText('rentalObjects.bookingDescription')).toBeInTheDocument();
    });

    it('should render pricing section with icon', () => {
      render(<BookingStep wizard={mockWizard} />);

      expect(screen.getByText('form.booking.pricing')).toBeInTheDocument();
    });

    it('should render policies section with icon', () => {
      render(<BookingStep wizard={mockWizard} />);

      expect(screen.getByText('form.booking.policies')).toBeInTheDocument();
      expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
    });

    it('should render restrictions section with icon', () => {
      render(<BookingStep wizard={mockWizard} />);

      expect(screen.getByText('form.booking.restrictions')).toBeInTheDocument();
      expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
    });

    it('should render error alert when errors exist', () => {
      mockWizard.errors = {
        booking: ['Booking error 1', 'Booking error 2'],
      };

      render(<BookingStep wizard={mockWizard} />);

      expect(screen.getByText('Booking error 1')).toBeInTheDocument();
      expect(screen.getByText('Booking error 2')).toBeInTheDocument();
    });

    it('should render info message at bottom', () => {
      render(<BookingStep wizard={mockWizard} />);

      expect(screen.getByText('rentalObjects.bookingInfo')).toBeInTheDocument();
    });
  });

  describe('Pricing Fields', () => {
    it('should render base price field with description', () => {
      render(<BookingStep wizard={mockWizard} />);

      const priceInput = screen.getByLabelText('form.booking.basePrice');
      expect(priceInput).toBeInTheDocument();
      expect(priceInput).toHaveAttribute('type', 'number');
      expect(priceInput).toHaveAttribute('min', '0');
      expect(priceInput).toHaveAttribute('required');
    });

    it('should update basePrice when value changes', () => {
      render(<BookingStep wizard={mockWizard} />);

      const priceInput = screen.getByLabelText('form.booking.basePrice');
      fireEvent.change(priceInput, { target: { value: '5000' } });

      expect(mockWizard.updateFormData).toHaveBeenCalledWith({
        basePrice: 5000,
      });
    });

    it('should render pricing unit dropdown', () => {
      render(<BookingStep wizard={mockWizard} />);

      const unitSelect = screen.getByLabelText('form.booking.pricingUnit');
      expect(unitSelect).toBeInTheDocument();
      expect(unitSelect).toHaveAttribute('required');
    });

    it('should update pricingUnit when selection changes', () => {
      render(<BookingStep wizard={mockWizard} />);

      const unitSelect = screen.getByLabelText('form.booking.pricingUnit');
      fireEvent.change(unitSelect, { target: { value: 'day' } });

      expect(mockWizard.updateFormData).toHaveBeenCalledWith({
        pricingUnit: 'day',
      });
    });

    it('should render member discount field', () => {
      render(<BookingStep wizard={mockWizard} />);

      const discountInput = screen.getByLabelText('form.booking.memberDiscount');
      expect(discountInput).toBeInTheDocument();
      expect(discountInput).toHaveAttribute('type', 'number');
      expect(discountInput).toHaveAttribute('min', '0');
      expect(discountInput).toHaveAttribute('max', '100');
    });

    it('should update memberDiscount when value changes', () => {
      render(<BookingStep wizard={mockWizard} />);

      const discountInput = screen.getByLabelText('form.booking.memberDiscount');
      fireEvent.change(discountInput, { target: { value: '15' } });

      expect(mockWizard.updateFormData).toHaveBeenCalledWith({
        memberDiscount: 15,
      });
    });
  });

  describe('Category-Specific Fields', () => {
    it('should render weekend price modifier for LOKALER_OG_BANER', () => {
      mockWizard.formData.category = 'LOKALER_OG_BANER';

      render(<BookingStep wizard={mockWizard} />);

      const weekendModifier = screen.getByLabelText('form.booking.weekendPriceModifier');
      expect(weekendModifier).toBeInTheDocument();
      expect(weekendModifier).toHaveAttribute('type', 'number');
      expect(weekendModifier).toHaveAttribute('min', '-100');
      expect(weekendModifier).toHaveAttribute('max', '100');
    });

    it('should not render weekend price modifier for other categories', () => {
      mockWizard.formData.category = 'UTSTYR_OG_INVENTAR';

      render(<BookingStep wizard={mockWizard} />);

      expect(screen.queryByLabelText('form.booking.weekendPriceModifier')).not.toBeInTheDocument();
    });
  });

  describe('Policies Section', () => {
    it('should render cancellation policy textarea', () => {
      render(<BookingStep wizard={mockWizard} />);

      const policyInput = screen.getByLabelText('form.booking.cancellationPolicy');
      expect(policyInput).toBeInTheDocument();
      expect(policyInput.tagName).toBe('TEXTAREA');
    });

    it('should update cancellationPolicy when text changes', () => {
      render(<BookingStep wizard={mockWizard} />);

      const policyInput = screen.getByLabelText('form.booking.cancellationPolicy');
      fireEvent.change(policyInput, { target: { value: 'Full refund 24h before' } });

      expect(mockWizard.updateFormData).toHaveBeenCalledWith({
        cancellationPolicy: 'Full refund 24h before',
      });
    });

    it('should have proper placeholder for cancellation policy', () => {
      render(<BookingStep wizard={mockWizard} />);

      const policyInput = screen.getByLabelText('form.booking.cancellationPolicy');
      expect(policyInput).toHaveAttribute(
        'placeholder',
        'form.booking.cancellationPolicyPlaceholder'
      );
    });
  });

  describe('Restrictions Section', () => {
    it('should render minimum advance notice field', () => {
      render(<BookingStep wizard={mockWizard} />);

      const minNoticeInput = screen.getByLabelText('form.booking.minAdvanceNotice');
      expect(minNoticeInput).toBeInTheDocument();
      expect(minNoticeInput).toHaveAttribute('type', 'number');
      expect(minNoticeInput).toHaveAttribute('min', '0');
    });

    it('should update minAdvanceNoticeHours when value changes', () => {
      render(<BookingStep wizard={mockWizard} />);

      const minNoticeInput = screen.getByLabelText('form.booking.minAdvanceNotice');
      fireEvent.change(minNoticeInput, { target: { value: '24' } });

      expect(mockWizard.updateFormData).toHaveBeenCalledWith({
        minAdvanceNoticeHours: 24,
      });
    });

    it('should render maximum advance booking field', () => {
      render(<BookingStep wizard={mockWizard} />);

      const maxAdvanceInput = screen.getByLabelText('form.booking.maxAdvanceBooking');
      expect(maxAdvanceInput).toBeInTheDocument();
      expect(maxAdvanceInput).toHaveAttribute('type', 'number');
      expect(maxAdvanceInput).toHaveAttribute('min', '0');
    });

    it('should update maxAdvanceBookingDays when value changes', () => {
      render(<BookingStep wizard={mockWizard} />);

      const maxAdvanceInput = screen.getByLabelText('form.booking.maxAdvanceBooking');
      fireEvent.change(maxAdvanceInput, { target: { value: '90' } });

      expect(mockWizard.updateFormData).toHaveBeenCalledWith({
        maxAdvanceBookingDays: 90,
      });
    });
  });

  describe('Existing Data Display', () => {
    it('should display existing basePrice value', () => {
      mockWizard.formData.basePrice = 15000;

      render(<BookingStep wizard={mockWizard} />);

      const priceInput = screen.getByLabelText('form.booking.basePrice');
      expect(priceInput).toHaveValue(15000);
    });

    it('should display existing pricingUnit value', () => {
      mockWizard.formData.pricingUnit = 'day';

      render(<BookingStep wizard={mockWizard} />);

      const unitSelect = screen.getByLabelText('form.booking.pricingUnit');
      expect(unitSelect).toHaveValue('day');
    });

    it('should display existing memberDiscount value', () => {
      mockWizard.formData.memberDiscount = 20;

      render(<BookingStep wizard={mockWizard} />);

      const discountInput = screen.getByLabelText('form.booking.memberDiscount');
      expect(discountInput).toHaveValue(20);
    });

    it('should display existing cancellationPolicy text', () => {
      mockWizard.formData.cancellationPolicy = 'Existing policy text';

      render(<BookingStep wizard={mockWizard} />);

      const policyInput = screen.getByLabelText('form.booking.cancellationPolicy');
      expect(policyInput).toHaveValue('Existing policy text');
    });
  });

  describe('Accessibility', () => {
    it('should render decorative icons', () => {
      render(<BookingStep wizard={mockWizard} />);

      const icons = [
        screen.getByTestId('credit-card-icon'),
        screen.getByTestId('settings-icon'),
        screen.getByTestId('clock-icon'),
      ];

      icons.forEach((icon) => {
        expect(icon).toBeInTheDocument();
      });
    });

    it('should have proper labels for all inputs', () => {
      render(<BookingStep wizard={mockWizard} />);

      expect(screen.getByText('form.booking.basePrice')).toBeInTheDocument();
      expect(screen.getByText('form.booking.pricingUnit')).toBeInTheDocument();
      expect(screen.getByText('form.booking.memberDiscount')).toBeInTheDocument();
      expect(screen.getByText('form.booking.cancellationPolicy')).toBeInTheDocument();
      expect(screen.getByText('form.booking.minAdvanceNotice')).toBeInTheDocument();
      expect(screen.getByText('form.booking.maxAdvanceBooking')).toBeInTheDocument();
    });
  });
});
