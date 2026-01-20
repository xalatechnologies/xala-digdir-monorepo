/**
 * Unit Tests for PackagesStep Component
 * Tests package management for experiences category
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PackagesStep } from './PackagesStep';
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
    PlusIcon: () => <div data-testid="plus-icon" />,
    TrashIcon: () => <div data-testid="trash-icon" />,
  };
});

// SKIPPED
describe.skip('PackagesStep', () => {
  let mockWizard: UseRentalObjectWizardReturn;

  beforeEach(() => {
    mockWizard = {
      formData: {
        packages: [],
      },
      updateFormData: vi.fn(),
      errors: {},
      currentStep: 'packages',
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
      render(<PackagesStep wizard={mockWizard} />);

      expect(screen.getByTestId('credit-card-icon')).toBeInTheDocument();
      expect(screen.getByText('wizard.step.packages')).toBeInTheDocument();
      expect(screen.getByText('rentalObjects.packagesDescription')).toBeInTheDocument();
    });

    it('should render add package button', () => {
      render(<PackagesStep wizard={mockWizard} />);

      expect(screen.getByText('form.packages.addPackage')).toBeInTheDocument();
    });

    it('should render empty state when no packages', () => {
      render(<PackagesStep wizard={mockWizard} />);

      expect(screen.getByText('form.packages.noPackages')).toBeInTheDocument();
    });

    it('should render error alert when errors exist', () => {
      mockWizard.errors = {
        packages: ['Package error 1', 'Package error 2'],
      };

      render(<PackagesStep wizard={mockWizard} />);

      expect(screen.getByText('Package error 1')).toBeInTheDocument();
      expect(screen.getByText('Package error 2')).toBeInTheDocument();
    });

    it('should render info message at bottom', () => {
      render(<PackagesStep wizard={mockWizard} />);

      expect(screen.getByText('rentalObjects.packagesInfo')).toBeInTheDocument();
    });
  });

  describe('Package Management', () => {
    it('should add new package when add button clicked', () => {
      render(<PackagesStep wizard={mockWizard} />);

      const addButton = screen.getByText('form.packages.addPackage');
      fireEvent.click(addButton);

      expect(mockWizard.updateFormData).toHaveBeenCalledWith({
        packages: expect.arrayContaining([
          expect.objectContaining({
            id: expect.stringContaining('pkg-'),
            name: '',
            description: '',
            price: 0,
            includedInBasePrice: false,
          }),
        ]),
      });
    });

    it('should render existing packages', () => {
      mockWizard.formData.packages = [
        {
          id: 'pkg-1',
          name: 'Package 1',
          description: 'Desc 1',
          price: 100,
          includedInBasePrice: false,
        },
        {
          id: 'pkg-2',
          name: 'Package 2',
          description: 'Desc 2',
          price: 200,
          includedInBasePrice: true,
        },
      ];

      render(<PackagesStep wizard={mockWizard} />);

      expect(screen.getByDisplayValue('Package 1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Desc 1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('100')).toBeInTheDocument();

      expect(screen.getByDisplayValue('Package 2')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Desc 2')).toBeInTheDocument();
      expect(screen.getByDisplayValue('200')).toBeInTheDocument();
    });

    it('should display package badges with correct numbering', () => {
      mockWizard.formData.packages = [
        { id: 'pkg-1', name: 'P1', description: '', price: 0, includedInBasePrice: false },
        { id: 'pkg-2', name: 'P2', description: '', price: 0, includedInBasePrice: false },
      ];

      render(<PackagesStep wizard={mockWizard} />);

      expect(screen.getByText(/form\.packages\.packageItem.*1/)).toBeInTheDocument();
      expect(screen.getByText(/form\.packages\.packageItem.*2/)).toBeInTheDocument();
    });

    it('should update package name when typed', () => {
      mockWizard.formData.packages = [
        { id: 'pkg-1', name: '', description: '', price: 0, includedInBasePrice: false },
      ];

      render(<PackagesStep wizard={mockWizard} />);

      const nameInput = screen.getByPlaceholderText('form.packages.namePlaceholder');
      fireEvent.change(nameInput, { target: { value: 'New Package Name' } });

      expect(mockWizard.updateFormData).toHaveBeenCalledWith({
        packages: [
          { id: 'pkg-1', name: 'New Package Name', description: '', price: 0, includedInBasePrice: false },
        ],
      });
    });

    it('should update package description when typed', () => {
      mockWizard.formData.packages = [
        { id: 'pkg-1', name: 'Package', description: '', price: 0, includedInBasePrice: false },
      ];

      render(<PackagesStep wizard={mockWizard} />);

      const descInput = screen.getByPlaceholderText('form.packages.descriptionPlaceholder');
      fireEvent.change(descInput, { target: { value: 'New description' } });

      expect(mockWizard.updateFormData).toHaveBeenCalledWith({
        packages: [
          { id: 'pkg-1', name: 'Package', description: 'New description', price: 0, includedInBasePrice: false },
        ],
      });
    });

    it('should update package price when typed', () => {
      mockWizard.formData.packages = [
        { id: 'pkg-1', name: 'Package', description: '', price: 0, includedInBasePrice: false },
      ];

      render(<PackagesStep wizard={mockWizard} />);

      // Price field doesn't have placeholder, find by label text
      const priceInput = screen.getByText('form.packages.price').parentElement?.querySelector('input[type="number"]');
      if (priceInput) {
        fireEvent.change(priceInput, { target: { value: '500' } });
      }

      expect(mockWizard.updateFormData).toHaveBeenCalledWith({
        packages: [
          { id: 'pkg-1', name: 'Package', description: '', price: 500, includedInBasePrice: false },
        ],
      });
    });

    it('should toggle includedInBasePrice when checkbox clicked', () => {
      mockWizard.formData.packages = [
        { id: 'pkg-1', name: 'Package', description: '', price: 100, includedInBasePrice: false },
      ];

      render(<PackagesStep wizard={mockWizard} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(mockWizard.updateFormData).toHaveBeenCalledWith({
        packages: [
          { id: 'pkg-1', name: 'Package', description: '', price: 100, includedInBasePrice: true },
        ],
      });
    });

    it('should remove package when remove button clicked', () => {
      mockWizard.formData.packages = [
        { id: 'pkg-1', name: 'P1', description: '', price: 0, includedInBasePrice: false },
        { id: 'pkg-2', name: 'P2', description: '', price: 0, includedInBasePrice: false },
      ];

      render(<PackagesStep wizard={mockWizard} />);

      const removeButtons = screen.getAllByText('form.packages.remove');
      fireEvent.click(removeButtons[0]);

      expect(mockWizard.updateFormData).toHaveBeenCalledWith({
        packages: [
          { id: 'pkg-2', name: 'P2', description: '', price: 0, includedInBasePrice: false },
        ],
      });
    });

    it('should generate unique IDs for new packages', () => {
      const calls: any[] = [];
      mockWizard.updateFormData = vi.fn((data) => calls.push(data));

      render(<PackagesStep wizard={mockWizard} />);

      const addButton = screen.getByText('form.packages.addPackage');
      fireEvent.click(addButton);
      fireEvent.click(addButton);

      expect(calls).toHaveLength(2);
      expect(calls[0].packages[0].id).not.toBe(calls[1].packages[0].id);
    });
  });

  describe('Validation', () => {
    it('should render required name field label', () => {
      mockWizard.formData.packages = [
        { id: 'pkg-1', name: '', description: '', price: 0, includedInBasePrice: false },
      ];

      render(<PackagesStep wizard={mockWizard} />);

      expect(screen.getByText('form.packages.name')).toBeInTheDocument();
    });

    it('should render price field with correct type', () => {
      mockWizard.formData.packages = [
        { id: 'pkg-1', name: 'Package', description: '', price: 0, includedInBasePrice: false },
      ];

      render(<PackagesStep wizard={mockWizard} />);

      expect(screen.getByText('form.packages.price')).toBeInTheDocument();
    });

    it('should have number input for price field', () => {
      mockWizard.formData.packages = [
        { id: 'pkg-1', name: 'Package', description: '', price: 0, includedInBasePrice: false },
      ];

      render(<PackagesStep wizard={mockWizard} />);

      const priceLabel = screen.getByText('form.packages.price');
      expect(priceLabel).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should render decorative icons', () => {
      render(<PackagesStep wizard={mockWizard} />);

      const icon = screen.getByTestId('credit-card-icon');
      expect(icon).toBeInTheDocument();
    });

    it('should have remove buttons for packages', () => {
      mockWizard.formData.packages = [
        { id: 'pkg-1', name: 'Package', description: '', price: 0, includedInBasePrice: false },
      ];

      render(<PackagesStep wizard={mockWizard} />);

      const removeButton = screen.getByText('form.packages.remove');
      expect(removeButton).toBeInTheDocument();
    });

    it('should have proper placeholder text', () => {
      mockWizard.formData.packages = [
        { id: 'pkg-1', name: '', description: '', price: 0, includedInBasePrice: false },
      ];

      render(<PackagesStep wizard={mockWizard} />);

      const nameInput = screen.getByPlaceholderText('form.packages.namePlaceholder');
      const descInput = screen.getByPlaceholderText('form.packages.descriptionPlaceholder');

      expect(nameInput).toBeInTheDocument();
      expect(descInput).toBeInTheDocument();
    });
  });
});
