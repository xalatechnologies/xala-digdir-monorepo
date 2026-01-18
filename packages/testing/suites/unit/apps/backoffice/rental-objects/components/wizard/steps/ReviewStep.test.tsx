/**
 * Unit Tests for ReviewStep Component
 * Tests final review and category-specific section rendering
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReviewStep } from './ReviewStep';
import type { UseRentalObjectWizardReturn } from '../../../hooks/useRentalObjectWizard';

// Mock @xala/i18n
vi.mock('@xala/i18n', () => ({
  useT: () => (key: string) => key,
}));

// Mock @xala/ds icons
vi.mock('@xala/ds', async () => {
  const actual = await vi.importActual('@xala/ds');
  return {
    ...actual,
    EyeIcon: () => <div data-testid="eye-icon" />,
    CheckCircleIcon: () => <div data-testid="check-circle-icon" />,
    AlertTriangleIcon: () => <div data-testid="alert-triangle-icon" />,
    EditIcon: () => <div data-testid="edit-icon" />,
  };
});

describe.skip('ReviewStep', () => {
  let mockWizard: UseRentalObjectWizardReturn;

  beforeEach(() => {
    mockWizard = {
      formData: {
        category: 'LOKALER_OG_BANER',
        name: 'Test Rental Object',
        description: 'Test description',
        images: ['image1.jpg', 'image2.jpg'],
        pickupLocation: { address: '123 Main St', city: 'Oslo' },
        capacity: 50,
        basePrice: 10000,
        pricingUnit: 'hour',
        memberDiscount: 10,
      },
      updateFormData: vi.fn(),
      errors: {},
      currentStep: 'review',
      steps: [],
      goToStep: vi.fn(),
      nextStep: vi.fn(),
      prevStep: vi.fn(),
      canGoNext: true,
      canGoPrev: true,
      isFirstStep: false,
      isLastStep: true,
      saveDraft: vi.fn(),
      publish: vi.fn(),
      cancel: vi.fn(),
      isSaving: false,
      isPublishing: false,
    } as unknown as UseRentalObjectWizardReturn;
  });

  describe.skip('Rendering', () => {
    it('should render header with icon and title', () => {
      render(<ReviewStep wizard={mockWizard} />);

      expect(screen.getByTestId('eye-icon')).toBeInTheDocument();
      expect(screen.getByText('wizard.step.review')).toBeInTheDocument();
      expect(screen.getByText('rentalObjects.reviewDescription')).toBeInTheDocument();
    });

    it('should render success alert when no errors', () => {
      render(<ReviewStep wizard={mockWizard} />);

      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
      expect(screen.getByText('form.review.readyToPublish')).toBeInTheDocument();
    });

    it('should render error alert when errors exist', () => {
      mockWizard.errors = {
        basics: ['Name is required'],
      };

      render(<ReviewStep wizard={mockWizard} />);

      expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument();
      expect(screen.getByText('form.review.hasErrors')).toBeInTheDocument();
    });

    it('should render info message at bottom', () => {
      render(<ReviewStep wizard={mockWizard} />);

      expect(screen.getByText('rentalObjects.reviewInfo')).toBeInTheDocument();
    });
  });

  describe.skip('Basic Information Section', () => {
    it('should render name field', () => {
      render(<ReviewStep wizard={mockWizard} />);

      expect(screen.getByText('form.basics.name')).toBeInTheDocument();
      expect(screen.getByText('Test Rental Object')).toBeInTheDocument();
    });

    it('should render category badge', () => {
      render(<ReviewStep wizard={mockWizard} />);

      expect(screen.getByText('form.basics.category')).toBeInTheDocument();
      expect(screen.getByText('form.category.LOKALER_OG_BANER')).toBeInTheDocument();
    });

    it('should render description', () => {
      render(<ReviewStep wizard={mockWizard} />);

      expect(screen.getByText('form.basics.description')).toBeInTheDocument();
      expect(screen.getByText(/Test description/)).toBeInTheDocument();
    });

    it('should handle missing category gracefully', () => {
      mockWizard.formData.category = undefined;

      render(<ReviewStep wizard={mockWizard} />);

      expect(screen.getByText('-')).toBeInTheDocument();
    });
  });

  describe.skip('Media Section', () => {
    it('should render image count when images exist', () => {
      render(<ReviewStep wizard={mockWizard} />);

      expect(screen.getByText(/2.*form\.review\.imagesUploaded/)).toBeInTheDocument();
    });

    it('should render image thumbnails', () => {
      render(<ReviewStep wizard={mockWizard} />);

      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(2);
      expect(images[0]).toHaveAttribute('src', 'image1.jpg');
      expect(images[1]).toHaveAttribute('src', 'image2.jpg');
    });

    it('should render +N indicator when more than 4 images', () => {
      mockWizard.formData.images = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg'];

      render(<ReviewStep wizard={mockWizard} />);

      expect(screen.getByText('+2')).toBeInTheDocument();
    });

    it('should render "no images" message when no images', () => {
      mockWizard.formData.images = [];

      render(<ReviewStep wizard={mockWizard} />);

      expect(screen.getByText('form.review.noImages')).toBeInTheDocument();
    });
  });

  describe.skip('Category-Specific Sections - LOKALER_OG_BANER', () => {
    beforeEach(() => {
      mockWizard.formData.category = 'LOKALER_OG_BANER';
    });

    it('should render location section', () => {
      render(<ReviewStep wizard={mockWizard} />);

      expect(screen.getByText('wizard.step.location')).toBeInTheDocument();
      expect(screen.getByText('form.location.address')).toBeInTheDocument();
      expect(screen.getByText('123 Main St')).toBeInTheDocument();
    });

    it('should render capacity section', () => {
      render(<ReviewStep wizard={mockWizard} />);

      expect(screen.getByText('wizard.step.capacity')).toBeInTheDocument();
      expect(screen.getByText('form.capacity.maxPersons')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
    });

    it('should render opening hours section', () => {
      render(<ReviewStep wizard={mockWizard} />);

      expect(screen.getByText('wizard.step.openingHours')).toBeInTheDocument();
      expect(screen.getByText('form.review.openingHoursConfigured')).toBeInTheDocument();
    });
  });

  describe.skip('Category-Specific Sections - UTSTYR_OG_INVENTAR', () => {
    beforeEach(() => {
      mockWizard.formData.category = 'UTSTYR_OG_INVENTAR';
      mockWizard.formData.totalQuantity = 10;
      mockWizard.formData.inventoryPolicy = 'FIFO';
    });

    it('should render inventory section', () => {
      render(<ReviewStep wizard={mockWizard} />);

      expect(screen.getByText('wizard.step.inventory')).toBeInTheDocument();
      expect(screen.getByText('form.inventory.totalQuantity')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('should render pickup section', () => {
      render(<ReviewStep wizard={mockWizard} />);

      expect(screen.getByText('wizard.step.pickup')).toBeInTheDocument();
      expect(screen.getByText('form.pickup.location')).toBeInTheDocument();
    });

    it('should not render location section', () => {
      render(<ReviewStep wizard={mockWizard} />);

      expect(screen.queryByText('wizard.step.openingHours')).not.toBeInTheDocument();
    });
  });

  describe.skip('Category-Specific Sections - KJORETOY_OG_TRANSPORT', () => {
    beforeEach(() => {
      mockWizard.formData.category = 'KJORETOY_OG_TRANSPORT';
      mockWizard.formData.totalQuantity = 5;
      mockWizard.formData.licenseRequired = true;
      mockWizard.formData.ageRequirement = 18;
      mockWizard.formData.depositRequired = true;
    });

    it('should render inventory section', () => {
      render(<ReviewStep wizard={mockWizard} />);

      expect(screen.getByText('wizard.step.inventory')).toBeInTheDocument();
    });

    it('should render pickup section', () => {
      render(<ReviewStep wizard={mockWizard} />);

      expect(screen.getByText('wizard.step.pickup')).toBeInTheDocument();
    });

    it('should render requirements section', () => {
      render(<ReviewStep wizard={mockWizard} />);

      expect(screen.getByText('wizard.step.requirements')).toBeInTheDocument();
      expect(screen.getByText('form.requirements.licenseRequired')).toBeInTheDocument();
      expect(screen.getByText('form.requirements.minimumAge')).toBeInTheDocument();
    });
  });

  describe.skip('Category-Specific Sections - OPPLEVELSER_OG_ARRANGEMENT', () => {
    beforeEach(() => {
      mockWizard.formData.category = 'OPPLEVELSER_OG_ARRANGEMENT';
      mockWizard.formData.capacity = 20;
      mockWizard.formData.packages = [
        { name: 'Basic Package', price: 500 },
        { name: 'Premium Package', price: 1000 },
      ];
      mockWizard.formData.scheduleType = 'fixed';
    });

    it('should render capacity section', () => {
      render(<ReviewStep wizard={mockWizard} />);

      expect(screen.getByText('wizard.step.capacity')).toBeInTheDocument();
      expect(screen.getByText('form.capacity.maxParticipants')).toBeInTheDocument();
    });

    it('should render packages section', () => {
      render(<ReviewStep wizard={mockWizard} />);

      expect(screen.getByText('wizard.step.packages')).toBeInTheDocument();
      expect(screen.getByText(/2.*form\.review\.packagesConfigured/)).toBeInTheDocument();
    });

    it('should render schedule section', () => {
      render(<ReviewStep wizard={mockWizard} />);

      expect(screen.getByText('wizard.step.schedule')).toBeInTheDocument();
      expect(screen.getByText('form.schedule.type')).toBeInTheDocument();
    });
  });

  describe.skip('Booking Configuration Section', () => {
    it('should render base price', () => {
      render(<ReviewStep wizard={mockWizard} />);

      expect(screen.getByText('form.booking.basePrice')).toBeInTheDocument();
      expect(screen.getByText('10000 øre')).toBeInTheDocument();
    });

    it('should render pricing unit', () => {
      render(<ReviewStep wizard={mockWizard} />);

      expect(screen.getByText('form.booking.pricingUnit')).toBeInTheDocument();
      expect(screen.getByText('hour')).toBeInTheDocument();
    });

    it('should render member discount', () => {
      render(<ReviewStep wizard={mockWizard} />);

      expect(screen.getByText('form.booking.memberDiscount')).toBeInTheDocument();
      expect(screen.getByText('10%')).toBeInTheDocument();
    });
  });

  describe.skip('Content Section', () => {
    it('should render rich content preview', () => {
      mockWizard.formData.richContent = 'This is a very long content description';

      render(<ReviewStep wizard={mockWizard} />);

      expect(screen.getByText('wizard.step.content')).toBeInTheDocument();
      expect(screen.getByText(/This is a very long content/)).toBeInTheDocument();
    });

    it('should render FAQ count', () => {
      mockWizard.formData.faqs = [
        { question: 'Q1', answer: 'A1' },
        { question: 'Q2', answer: 'A2' },
      ];

      render(<ReviewStep wizard={mockWizard} />);

      expect(screen.getByText(/2.*form\.review\.faqItems/)).toBeInTheDocument();
    });

    it('should render "no content" message when richContent is empty', () => {
      mockWizard.formData.richContent = '';

      render(<ReviewStep wizard={mockWizard} />);

      expect(screen.getByText('form.review.noContent')).toBeInTheDocument();
    });
  });

  describe.skip('Edit Navigation', () => {
    it('should call goToStep when edit button clicked', () => {
      render(<ReviewStep wizard={mockWizard} />);

      const editButtons = screen.getAllByText('form.review.edit');
      fireEvent.click(editButtons[0]); // Click first edit button

      expect(mockWizard.goToStep).toHaveBeenCalledWith(expect.any(String));
    });

    it('should have edit buttons for all sections', () => {
      render(<ReviewStep wizard={mockWizard} />);

      const editButtons = screen.getAllByText('form.review.edit');
      // Should have edit buttons for: basics, media, location, capacity, opening-hours, booking, content
      expect(editButtons.length).toBeGreaterThan(5);
    });
  });

  describe.skip('Accessibility', () => {
    it('should have proper aria-hidden on decorative icons', () => {
      render(<ReviewStep wizard={mockWizard} />);

      const icons = [
        screen.getByTestId('eye-icon'),
        screen.queryByTestId('check-circle-icon'),
        screen.queryByTestId('alert-triangle-icon'),
      ].filter(Boolean);

      icons.forEach((icon) => {
        if (icon) {
          expect(icon.parentElement).toHaveAttribute('aria-hidden', 'true');
        }
      });
    });

    it('should have proper alt text for images', () => {
      render(<ReviewStep wizard={mockWizard} />);

      const images = screen.getAllByRole('img');
      images.forEach((img, i) => {
        expect(img).toHaveAttribute('alt', `Image ${i + 1}`);
      });
    });
  });
});
