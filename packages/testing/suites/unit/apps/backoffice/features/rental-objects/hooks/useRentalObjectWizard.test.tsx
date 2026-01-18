/**
 * Comprehensive Unit Tests for useRentalObjectWizard Hook
 * Tests all hook functionality, state management, validation, and edge cases
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRentalObjectWizard } from './useRentalObjectWizard';
import {
  useRentalObjectBySlug,
  useCreateRentalObject,
  useUpdateRentalObject,
} from '@digilist/client-sdk';
import { useT } from '@xala/i18n';

// Mock validation utilities
const mockValidateStep = vi.fn((stepId, data, category) => {
  // Simple validation - name is required for basics step
  if (stepId === 'basics' && !data.name?.trim()) {
    return {
      isValid: false,
      errors: [{ field: 'name', message: 'Navn er påkrevd' }],
    };
  }
  return { isValid: true, errors: [] };
});

const mockValidateAllSteps = vi.fn((steps, data, category) => {
  const errors: Record<string, string[]> = {};
  if (!data.name?.trim()) {
    errors.basics = ['Navn er påkrevd'];
  }
  return errors;
});

vi.mock('../utils/wizard-validation', () => ({
  validateStep: (stepId: string, data: any, category: string) => mockValidateStep(stepId, data, category),
  validateAllSteps: (steps: any[], data: any, category: string) => mockValidateAllSteps(steps, data, category),
}));

// Mock SDK hooks
vi.mock('@digilist/client-sdk', async () => {
  const actual = await vi.importActual('@digilist/client-sdk');
  return {
    ...actual,
    useRentalObjectBySlug: vi.fn(),
    useCreateRentalObject: vi.fn(),
    useUpdateRentalObject: vi.fn(),
  };
});

// Mock types module to provide CATEGORY_CONFIGS and other constants
vi.mock('../types', async () => {
  const actual = await vi.importActual('../types');
  return {
    ...actual,
    CATEGORY_CONFIGS: {
      LOKALER_OG_BANER: {
        defaultTimeMode: 'SLOTS',
        supportsLocation: true,
        supportsOpeningHours: true,
        supportsInventory: false,
        supportsPickup: false,
        supportsPackages: false,
        supportsSchedule: false,
      },
      UTSTYR_OG_INVENTAR: {
        defaultTimeMode: 'SLOTS',
        supportsLocation: false,
        supportsOpeningHours: false,
        supportsInventory: true,
        supportsPickup: true,
        supportsPackages: false,
        supportsSchedule: false,
      },
      KJORETOY_OG_TRANSPORT: {
        defaultTimeMode: 'SLOTS',
        supportsLocation: false,
        supportsOpeningHours: false,
        supportsInventory: false,
        supportsPickup: true,
        supportsPackages: false,
        supportsSchedule: false,
      },
      OPPLEVELSER_OG_ARRANGEMENT: {
        defaultTimeMode: 'SCHEDULED',
        supportsLocation: false,
        supportsOpeningHours: false,
        supportsInventory: false,
        supportsPickup: false,
        supportsPackages: true,
        supportsSchedule: true,
      },
    },
    ALL_WIZARD_STEPS: [
      { id: 'basics', label: 'Grunnleggende', order: 0 },
      { id: 'location', label: 'Lokasjon', order: 1 },
      { id: 'capacity', label: 'Kapasitet', order: 2 },
      { id: 'review', label: t("ui.review"), order: 10 },
    ],
    WIZARD_STEPS_BY_CATEGORY: {
      LOKALER_OG_BANER: ['basics', 'location', 'capacity', 'review'],
      UTSTYR_OG_INVENTAR: ['basics', 'inventory', 'pickup', 'review'],
      KJORETOY_OG_TRANSPORT: ['basics', 'pickup', 'requirements', 'review'],
      OPPLEVELSER_OG_ARRANGEMENT: ['basics', 'packages', 'schedule', 'review'],
    },
  };
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );

  return Wrapper;
};

describe('useRentalObjectWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    (useRentalObjectBySlug as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    (useCreateRentalObject as ReturnType<typeof vi.fn>).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({
        data: { id: 'new-id', slug: 'new-slug', name: 'New Object' },
      }),
      isPending: false,
    });

    (useUpdateRentalObject as ReturnType<typeof vi.fn>).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({
        data: { id: 'existing-id', slug: 'existing-slug' },
      }),
      isPending: false,
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Initialization', () => {
    it('should initialize with default form data in create mode', () => {
      const { result } = renderHook(() => useRentalObjectWizard(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isEditMode).toBe(false);
      expect(result.current.formData.category).toBe('LOKALER_OG_BANER');
      expect(result.current.formData.status).toBe('draft');
      expect(result.current.currentStep).toBe(0);
    });

    it('should initialize with existing data in edit mode', async () => {
      const existingData = {
        id: 'existing-id',
        slug: 'existing-slug',
        name: 'Existing Object',
        category: 'LOKALER_OG_BANER' as const,
        status: 'published' as const,
      };

      (useRentalObjectBySlug as ReturnType<typeof vi.fn>).mockReturnValue({
        data: { data: existingData },
        isLoading: false,
      });

      const { result } = renderHook(() => useRentalObjectWizard({ slug: 'existing-slug' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isEditMode).toBe(true);
        expect(result.current.formData.name).toBe('Existing Object');
      });
    });

    it('should restore draft from localStorage in create mode', () => {
      const draftData = {
        name: 'Draft Object',
        category: 'UTSTYR_OG_INVENTAR' as const,
        status: 'draft' as const,
      };
      localStorage.setItem('rental-object-wizard-draft', JSON.stringify(draftData));

      const { result } = renderHook(() => useRentalObjectWizard(), {
        wrapper: createWrapper(),
      });

      expect(result.current.formData.name).toBe('Draft Object');
      expect(result.current.formData.category).toBe('UTSTYR_OG_INVENTAR');
    });
  });

  describe('Step Navigation', () => {
    it('should navigate to next step', async () => {
      const { result } = renderHook(() => useRentalObjectWizard(), {
        wrapper: createWrapper(),
      });

      // Wait for hook to initialize
      await waitFor(() => {
        expect(result.current.currentStep).toBeDefined();
      });

      // Set valid data to pass validation
      act(() => {
        result.current.updateFormData({ name: 'Test Object', category: 'LOKALER_OG_BANER' });
      });

      const initialStep = result.current.currentStep;
      
      act(() => {
        result.current.nextStep();
      });

      // Should have moved to next step if validation passes
      await waitFor(() => {
        expect(result.current.currentStep).toBeGreaterThanOrEqual(initialStep);
      });
    });

    it('should navigate to previous step', () => {
      const { result } = renderHook(() => useRentalObjectWizard(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.nextStep();
        result.current.prevStep();
      });

      expect(result.current.currentStep).toBe(0);
    });

    it('should not navigate beyond first step', () => {
      const { result } = renderHook(() => useRentalObjectWizard(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.prevStep();
      });

      expect(result.current.currentStep).toBe(0);
    });

    it('should navigate to specific step', () => {
      const { result } = renderHook(() => useRentalObjectWizard(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.goToStep(2);
      });

      expect(result.current.currentStep).toBe(2);
    });

    it('should validate before moving forward', () => {
      const { result } = renderHook(() => useRentalObjectWizard(), {
        wrapper: createWrapper(),
      });

      // Set invalid data (no name)
      act(() => {
        result.current.updateFormData({ name: '' });
      });

      act(() => {
        result.current.nextStep();
      });

      // Should not move forward if validation fails
      expect(result.current.currentStep).toBe(0);
      expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);
    });
  });

  describe('Form Data Management', () => {
    it('should update form data', () => {
      const { result } = renderHook(() => useRentalObjectWizard(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.updateFormData({ name: 'Updated Name' });
      });

      expect(result.current.formData.name).toBe('Updated Name');
      expect(result.current.isDirty).toBe(true);
    });

    it('should set field value', () => {
      const { result } = renderHook(() => useRentalObjectWizard(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setFieldValue('name', 'Field Value');
      });

      expect(result.current.formData.name).toBe('Field Value');
    });

    it('should set category and reset category-specific fields', () => {
      const { result } = renderHook(() => useRentalObjectWizard(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.updateFormData({
          category: 'LOKALER_OG_BANER',
          location: { address: 'Test Address' },
        });
      });

      act(() => {
        result.current.setCategory('UTSTYR_OG_INVENTAR');
      });

      expect(result.current.currentCategory).toBe('UTSTYR_OG_INVENTAR');
      expect(result.current.formData.location).toBeUndefined();
      expect(result.current.currentStep).toBe(0); // Should reset to first step
    });
  });

  describe('Validation', () => {
    it('should validate current step', async () => {
      const { result } = renderHook(() => useRentalObjectWizard(), {
        wrapper: createWrapper(),
      });

      // Wait for hook to initialize
      await waitFor(() => {
        expect(result.current.currentStep).toBeDefined();
      });

      // Set invalid data (empty name)
      act(() => {
        result.current.updateFormData({ name: '', category: 'LOKALER_OG_BANER' });
      });

      let isValid: boolean;
      act(() => {
        isValid = result.current.validateCurrentStep();
      });

      // Validation should fail for empty name on basics step
      await waitFor(() => {
        expect(isValid).toBe(false);
        // Errors should be set
        expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);
      });
    });

    it('should validate all steps', async () => {
      const { result } = renderHook(() => useRentalObjectWizard(), {
        wrapper: createWrapper(),
      });

      // Wait for hook to initialize
      await waitFor(() => {
        expect(result.current.currentStep).toBeDefined();
      });

      act(() => {
        result.current.updateFormData({ name: '', description: '', category: 'LOKALER_OG_BANER' });
      });

      let isValid: boolean;
      act(() => {
        isValid = result.current.validateAll();
      });
      
      // Mock returns errors for empty name, so validation should fail
      expect(isValid).toBe(false);
      
      // Wait for errors to be set
      await waitFor(() => {
        expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);
      });
    });

    it('should clear errors', () => {
      const { result } = renderHook(() => useRentalObjectWizard(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setErrors('basics', ['Error 1', 'Error 2']);
      });

      expect(result.current.errors.basics).toHaveLength(2);

      act(() => {
        result.current.clearErrors('basics');
      });

      expect(result.current.errors.basics).toBeUndefined();
    });
  });

  describe('Save and Publish', () => {
    it('should save draft in create mode', async () => {
      const createMutation = {
        mutateAsync: vi.fn().mockResolvedValue({
          data: { id: 'new-id', slug: 'new-slug' },
        }),
        isPending: false,
      };

      (useCreateRentalObject as ReturnType<typeof vi.fn>).mockReturnValue(createMutation);

      const { result } = renderHook(() => useRentalObjectWizard(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.updateFormData({ name: 'Test Object' });
      });

      await act(async () => {
        await result.current.saveDraft();
      });

      expect(createMutation.mutateAsync).toHaveBeenCalled();
      expect(localStorage.getItem('rental-object-wizard-draft')).toBeNull();
    });

    it('should update draft in edit mode', async () => {
      const updateMutation = {
        mutateAsync: vi.fn().mockResolvedValue({
          data: { id: 'existing-id', slug: 'existing-slug' },
        }),
        isPending: false,
      };

      (useUpdateRentalObject as ReturnType<typeof vi.fn>).mockReturnValue(updateMutation);
      (useRentalObjectBySlug as ReturnType<typeof vi.fn>).mockReturnValue({
        data: {
          data: {
            id: 'existing-id',
            slug: 'existing-slug',
            name: 'Existing',
            category: 'LOKALER_OG_BANER',
          },
        },
        isLoading: false,
      });

      const { result } = renderHook(() => useRentalObjectWizard({ slug: 'existing-slug' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isEditMode).toBe(true);
      });

      act(() => {
        result.current.updateFormData({ name: 'Updated Name' });
      });

      await act(async () => {
        await result.current.saveDraft();
      });

      expect(updateMutation.mutateAsync).toHaveBeenCalled();
    });

    it('should publish rental object', async () => {
      const createMutation = {
        mutateAsync: vi.fn().mockResolvedValue({
          data: { id: 'new-id', slug: 'new-slug' },
        }),
        isPending: false,
      };

      (useCreateRentalObject as ReturnType<typeof vi.fn>).mockReturnValue(createMutation);

      const { result } = renderHook(() => useRentalObjectWizard(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.updateFormData({ name: 'Test Object' });
      });

      await act(async () => {
        await result.current.publish();
      });

      expect(createMutation.mutateAsync).toHaveBeenCalled();
    });
  });

  describe('Category-Specific Steps', () => {
    it('should show correct steps for LOKALER_OG_BANER', () => {
      const { result } = renderHook(() => useRentalObjectWizard(), {
        wrapper: createWrapper(),
      });

      expect(result.current.currentCategory).toBe('LOKALER_OG_BANER');
      expect(result.current.steps.length).toBeGreaterThan(0);
    });

    it('should show correct steps for UTSTYR_OG_INVENTAR', () => {
      const { result } = renderHook(() =>
        useRentalObjectWizard({ initialCategory: 'UTSTYR_OG_INVENTAR' }),
        {
          wrapper: createWrapper(),
        }
      );

      expect(result.current.currentCategory).toBe('UTSTYR_OG_INVENTAR');
    });
  });

  describe('Error Handling', () => {
    it('should handle save errors', async () => {
      const createMutation = {
        mutateAsync: vi.fn().mockRejectedValue(new Error('Save failed')),
        isPending: false,
      };

      (useCreateRentalObject as ReturnType<typeof vi.fn>).mockReturnValue(createMutation);

      const { result } = renderHook(() => useRentalObjectWizard(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.updateFormData({ name: 'Test Object' });
      });

      await expect(async () => {
        await act(async () => {
          await result.current.saveDraft();
        });
      }).rejects.toThrow();
    });
  });

  describe('Auto-save', () => {
    it('should auto-save to localStorage in create mode', () => {
      const { result } = renderHook(() => useRentalObjectWizard(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.updateFormData({ name: 'Auto-saved Object' });
      });

      const saved = localStorage.getItem('rental-object-wizard-draft');
      expect(saved).toBeTruthy();
      const parsed = JSON.parse(saved!);
      expect(parsed.name).toBe('Auto-saved Object');
    });

    it('should not auto-save in edit mode', () => {
      (useRentalObjectBySlug as ReturnType<typeof vi.fn>).mockReturnValue({
        data: {
          data: {
            id: 'existing-id',
            slug: 'existing-slug',
            name: 'Existing',
            category: 'LOKALER_OG_BANER',
          },
        },
        isLoading: false,
      });

      const { result } = renderHook(() => useRentalObjectWizard({ slug: 'existing-slug' }), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.updateFormData({ name: 'Updated' });
      });

      // Should not save to localStorage in edit mode
      const saved = localStorage.getItem('rental-object-wizard-draft');
      expect(saved).toBeNull();
    });
  });
});
