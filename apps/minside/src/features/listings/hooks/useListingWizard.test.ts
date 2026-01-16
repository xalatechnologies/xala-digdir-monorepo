import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, beforeEach, afterEach } from 'vitest';
import { useListingWizard } from './useListingWizard';
import * as clientSDK from '@digilist/client-sdk';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock SDK hooks
vi.mock('@digilist/client-sdk', () => ({
  useListing: vi.fn(),
  useCreateListing: vi.fn(),
  useUpdateListing: vi.fn(),
}));

describe('useListingWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Default mock implementations
    (clientSDK.useListing as any).mockReturnValue({
      data: null,
      isLoading: false,
    });

    (clientSDK.useCreateListing as any).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    (clientSDK.useUpdateListing as any).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Initialization', () => {
    it('should initialize with correct default state in create mode', () => {
      const { result } = renderHook(() => useListingWizard());

      expect(result.current.currentStep).toBe(0);
      expect(result.current.isEditMode).toBe(false);
      expect(result.current.isDirty).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSaving).toBe(false);
      expect(result.current.formData.type).toBe('SPACE');
      expect(result.current.formData.status).toBe('draft');
      expect(result.current.errors).toEqual({});
    });

    it('should initialize with custom initial type', () => {
      const { result } = renderHook(() =>
        useListingWizard({ initialType: 'SERVICE' })
      );

      expect(result.current.formData.type).toBe('SERVICE');
    });

    it('should initialize in edit mode when listingId is provided', () => {
      const { result } = renderHook(() =>
        useListingWizard({ listingId: 'listing-123' })
      );

      expect(result.current.isEditMode).toBe(true);
    });

    it('should restore draft from localStorage in create mode', () => {
      const draftData = {
        type: 'EVENT',
        name: 'Test Event',
        description: 'Test Description',
      };
      localStorage.setItem('listing-wizard-draft', JSON.stringify(draftData));

      const { result } = renderHook(() => useListingWizard());

      expect(result.current.formData.type).toBe('EVENT');
      expect(result.current.formData.name).toBe('Test Event');
      expect(result.current.formData.description).toBe('Test Description');
    });

    it('should not restore draft from localStorage in edit mode', () => {
      const draftData = {
        type: 'EVENT',
        name: 'Draft Event',
      };
      localStorage.setItem('listing-wizard-draft', JSON.stringify(draftData));

      const { result } = renderHook(() =>
        useListingWizard({ listingId: 'listing-123', initialType: 'SPACE' })
      );

      // Should use default, not localStorage draft
      expect(result.current.formData.type).toBe('SPACE');
      expect(result.current.formData.name).toBe('');
    });
  });

  describe('Step Navigation', () => {
    it('should navigate to next step', () => {
      const { result } = renderHook(() => useListingWizard());

      expect(result.current.currentStep).toBe(0);
      expect(result.current.canGoNext).toBe(true);
      expect(result.current.isFirstStep).toBe(true);
      expect(result.current.isLastStep).toBe(false);

      act(() => {
        result.current.nextStep();
      });

      expect(result.current.currentStep).toBe(1);
      expect(result.current.isFirstStep).toBe(false);
    });

    it('should navigate to previous step', () => {
      const { result } = renderHook(() => useListingWizard());

      // Navigate to step 2 first
      act(() => {
        result.current.nextStep();
        result.current.nextStep();
      });

      expect(result.current.currentStep).toBe(2);
      expect(result.current.canGoPrev).toBe(true);

      act(() => {
        result.current.prevStep();
      });

      expect(result.current.currentStep).toBe(1);
    });

    it('should navigate to specific step', () => {
      const { result } = renderHook(() => useListingWizard());

      act(() => {
        result.current.goToStep(3);
      });

      expect(result.current.currentStep).toBe(3);
    });

    it('should not navigate beyond last step', () => {
      const { result } = renderHook(() => useListingWizard());

      const lastStepIndex = result.current.steps.length - 1;

      act(() => {
        result.current.goToStep(lastStepIndex);
      });

      expect(result.current.currentStep).toBe(lastStepIndex);
      expect(result.current.canGoNext).toBe(false);
      expect(result.current.isLastStep).toBe(true);

      act(() => {
        result.current.nextStep();
      });

      // Should stay on last step
      expect(result.current.currentStep).toBe(lastStepIndex);
    });

    it('should not navigate before first step', () => {
      const { result } = renderHook(() => useListingWizard());

      expect(result.current.currentStep).toBe(0);
      expect(result.current.canGoPrev).toBe(false);

      act(() => {
        result.current.prevStep();
      });

      // Should stay on first step
      expect(result.current.currentStep).toBe(0);
    });

    it('should not allow goToStep with invalid index', () => {
      const { result } = renderHook(() => useListingWizard());

      act(() => {
        result.current.goToStep(-1);
      });

      expect(result.current.currentStep).toBe(0);

      act(() => {
        result.current.goToStep(999);
      });

      expect(result.current.currentStep).toBe(0);
    });
  });

  describe('Steps Based on Listing Type', () => {
    it('should show correct steps for SPACE type', () => {
      const { result } = renderHook(() =>
        useListingWizard({ initialType: 'SPACE' })
      );

      const stepIds = result.current.steps.map((s) => s.id);
      expect(stepIds).toContain('basics');
      expect(stepIds).toContain('location');
      expect(stepIds).toContain('openingHours');
      expect(stepIds).toContain('bookingConfig');
    });

    it('should show correct steps for SERVICE type', () => {
      const { result } = renderHook(() =>
        useListingWizard({ initialType: 'SERVICE' })
      );

      const stepIds = result.current.steps.map((s) => s.id);
      expect(stepIds).toContain('basics');
      expect(stepIds).toContain('content');
      expect(stepIds).toContain('bookingConfig');
      expect(stepIds).not.toContain('location');
      expect(stepIds).not.toContain('openingHours');
    });

    it('should update steps when listing type changes', () => {
      const { result } = renderHook(() =>
        useListingWizard({ initialType: 'SPACE' })
      );

      const initialSteps = result.current.steps.length;

      act(() => {
        result.current.updateFormData({ type: 'SERVICE' });
      });

      // SERVICE has fewer steps than SPACE
      expect(result.current.steps.length).toBeLessThan(initialSteps);
    });
  });

  describe('Form Data Management', () => {
    it('should update form data', () => {
      const { result } = renderHook(() => useListingWizard());

      expect(result.current.isDirty).toBe(false);

      act(() => {
        result.current.updateFormData({
          name: 'Test Listing',
          description: 'Test Description',
        });
      });

      expect(result.current.formData.name).toBe('Test Listing');
      expect(result.current.formData.description).toBe('Test Description');
      expect(result.current.isDirty).toBe(true);
    });

    it('should set field value', () => {
      const { result } = renderHook(() => useListingWizard());

      act(() => {
        result.current.setFieldValue('name', 'New Name');
      });

      expect(result.current.formData.name).toBe('New Name');
      expect(result.current.isDirty).toBe(true);
    });

    it('should preserve existing data when updating', () => {
      const { result } = renderHook(() => useListingWizard());

      act(() => {
        result.current.updateFormData({ name: 'First Name' });
        result.current.updateFormData({ description: 'Description' });
      });

      expect(result.current.formData.name).toBe('First Name');
      expect(result.current.formData.description).toBe('Description');
    });

    it('should auto-save to localStorage when dirty in create mode', async () => {
      const { result } = renderHook(() => useListingWizard());

      act(() => {
        result.current.updateFormData({ name: 'Auto-saved Listing' });
      });

      await waitFor(() => {
        const saved = localStorage.getItem('listing-wizard-draft');
        expect(saved).toBeTruthy();
        const parsed = JSON.parse(saved!);
        expect(parsed.name).toBe('Auto-saved Listing');
      });
    });

    it('should not auto-save to localStorage in edit mode', async () => {
      const { result } = renderHook(() =>
        useListingWizard({ listingId: 'listing-123' })
      );

      act(() => {
        result.current.updateFormData({ name: 'Should Not Save' });
      });

      // Wait a bit to ensure effect has run
      await new Promise((resolve) => setTimeout(resolve, 100));

      const saved = localStorage.getItem('listing-wizard-draft');
      expect(saved).toBeNull();
    });
  });

  describe('Error Management', () => {
    it('should set errors for a step', () => {
      const { result } = renderHook(() => useListingWizard());

      act(() => {
        result.current.setErrors('basics', ['Name is required', 'Type is required']);
      });

      expect(result.current.errors.basics).toEqual([
        'Name is required',
        'Type is required',
      ]);
    });

    it('should clear errors for a specific step', () => {
      const { result } = renderHook(() => useListingWizard());

      act(() => {
        result.current.setErrors('basics', ['Error 1']);
        result.current.setErrors('content', ['Error 2']);
      });

      expect(result.current.errors.basics).toEqual(['Error 1']);
      expect(result.current.errors.content).toEqual(['Error 2']);

      act(() => {
        result.current.clearErrors('basics');
      });

      expect(result.current.errors.basics).toBeUndefined();
      expect(result.current.errors.content).toEqual(['Error 2']);
    });

    it('should clear all errors when no step specified', () => {
      const { result } = renderHook(() => useListingWizard());

      act(() => {
        result.current.setErrors('basics', ['Error 1']);
        result.current.setErrors('content', ['Error 2']);
      });

      expect(Object.keys(result.current.errors).length).toBe(2);

      act(() => {
        result.current.clearErrors();
      });

      expect(result.current.errors).toEqual({});
    });
  });

  describe('Save Draft', () => {
    it('should create new listing in create mode', async () => {
      const mockMutateAsync = vi.fn().mockResolvedValue({
        data: { id: 'new-listing-123' },
      });

      (clientSDK.useCreateListing as any).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      });

      const { result } = renderHook(() => useListingWizard());

      act(() => {
        result.current.updateFormData({
          name: 'New Listing',
          description: 'Test',
        });
      });

      await act(async () => {
        await result.current.saveDraft();
      });

      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'SPACE',
          name: 'New Listing',
          description: 'Test',
        })
      );

      expect(mockNavigate).toHaveBeenCalledWith(
        '/listings/new-listing-123',
        { replace: true }
      );

      expect(localStorage.getItem('listing-wizard-draft')).toBeNull();
    });

    it('should update existing listing in edit mode', async () => {
      const mockMutateAsync = vi.fn().mockResolvedValue({
        data: { id: 'listing-123' },
      });

      (clientSDK.useUpdateListing as any).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      });

      const { result } = renderHook(() =>
        useListingWizard({ listingId: 'listing-123' })
      );

      act(() => {
        result.current.updateFormData({ name: 'Updated Name' });
      });

      await act(async () => {
        await result.current.saveDraft();
      });

      expect(mockMutateAsync).toHaveBeenCalledWith({
        id: 'listing-123',
        data: expect.objectContaining({
          name: 'Updated Name',
        }),
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should set isDirty to false after successful save', async () => {
      const mockMutateAsync = vi.fn().mockResolvedValue({
        data: { id: 'new-listing-123' },
      });

      (clientSDK.useCreateListing as any).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      });

      const { result } = renderHook(() => useListingWizard());

      act(() => {
        result.current.updateFormData({ name: 'Test' });
      });

      expect(result.current.isDirty).toBe(true);

      await act(async () => {
        await result.current.saveDraft();
      });

      expect(result.current.isDirty).toBe(false);
    });
  });

  describe('Publish', () => {
    it('should save and navigate on publish', async () => {
      const mockMutateAsync = vi.fn().mockResolvedValue({
        data: { id: 'new-listing-123' },
      });

      (clientSDK.useCreateListing as any).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      });

      const onComplete = vi.fn();
      const { result } = renderHook(() =>
        useListingWizard({ onComplete })
      );

      act(() => {
        result.current.updateFormData({ name: 'Published Listing' });
      });

      await act(async () => {
        await result.current.publish();
      });

      expect(mockMutateAsync).toHaveBeenCalled();
      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Published Listing',
        })
      );
      expect(mockNavigate).toHaveBeenCalledWith('/listings');
    });
  });

  describe('Cancel', () => {
    it('should navigate without confirmation when not dirty', () => {
      const confirmSpy = vi.spyOn(window, 'confirm');
      const { result } = renderHook(() => useListingWizard());

      act(() => {
        result.current.cancel();
      });

      expect(confirmSpy).not.toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/listings');
      expect(localStorage.getItem('listing-wizard-draft')).toBeNull();
    });

    it('should show confirmation when dirty and cancel if not confirmed', () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
      const { result } = renderHook(() => useListingWizard());

      act(() => {
        result.current.updateFormData({ name: 'Changed' });
      });

      act(() => {
        result.current.cancel();
      });

      expect(confirmSpy).toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();

      confirmSpy.mockRestore();
    });

    it('should navigate when dirty and confirmed', () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const { result } = renderHook(() => useListingWizard());

      act(() => {
        result.current.updateFormData({ name: 'Changed' });
      });

      act(() => {
        result.current.cancel();
      });

      expect(confirmSpy).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/listings');
      expect(localStorage.getItem('listing-wizard-draft')).toBeNull();

      confirmSpy.mockRestore();
    });
  });

  describe('Loading States', () => {
    it('should reflect loading state from useListing', () => {
      (clientSDK.useListing as any).mockReturnValue({
        data: null,
        isLoading: true,
      });

      const { result } = renderHook(() =>
        useListingWizard({ listingId: 'listing-123' })
      );

      expect(result.current.isLoading).toBe(true);
    });

    it('should reflect saving state from mutations', () => {
      (clientSDK.useCreateListing as any).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: true,
      });

      const { result } = renderHook(() => useListingWizard());

      expect(result.current.isSaving).toBe(true);
    });
  });

  describe('Edit Mode Data Loading', () => {
    it('should load existing listing data in edit mode', async () => {
      const mockListing = {
        data: {
          id: 'listing-123',
          name: 'Existing Listing',
          slug: 'existing-listing',
          type: 'EVENT',
          status: 'published',
          description: 'An existing listing',
          images: ['image1.jpg'],
          capacity: 50,
          pricing: {
            basePrice: 100,
            currency: 'NOK',
            unit: 'hour',
          },
          metadata: {
            location: { address: '123 Main St' },
            amenities: ['WiFi', 'Parking'],
            openingHours: { monday: { open: '09:00', close: '17:00' } },
          },
        },
      };

      (clientSDK.useListing as any).mockReturnValue({
        data: mockListing,
        isLoading: false,
      });

      const { result } = renderHook(() =>
        useListingWizard({ listingId: 'listing-123' })
      );

      await waitFor(() => {
        expect(result.current.formData.id).toBe('listing-123');
        expect(result.current.formData.name).toBe('Existing Listing');
        expect(result.current.formData.type).toBe('EVENT');
        expect(result.current.formData.capacity).toBe(50);
        expect(result.current.formData.location?.address).toBe('123 Main St');
        expect(result.current.formData.content?.amenities).toEqual([
          'WiFi',
          'Parking',
        ]);
      });
    });
  });
});
