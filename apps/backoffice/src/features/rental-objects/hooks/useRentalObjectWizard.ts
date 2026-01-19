/**
 * Rental Object Wizard Hook
 * Manages wizard state, step navigation, and form data persistence
 * Uses category-specific steps instead of type-based steps
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useRentalObjectBySlug,
  useCreateRentalObject,
  useUpdateRentalObject,
} from '@digilist/client-sdk';
import type {
  RentalObjectCategory,
  WizardStepId,
  WizardStep,
  RentalObject,
  CreateRentalObjectDTO,
} from '../types';
import {
  ALL_WIZARD_STEPS,
  WIZARD_STEPS_BY_CATEGORY,
  CATEGORY_CONFIGS,
} from '../types';
import { validateStep, validateAllSteps } from '../utils/wizard-validation';
import { useT } from '@xala/i18n';

export interface UseRentalObjectWizardOptions {
  /** Rental object slug for edit mode */
  slug?: string | undefined;
  /** Rental object ID to clone from */
  cloneFromId?: string | undefined;
  /** Initial category (for create mode) */
  initialCategory?: RentalObjectCategory | undefined;
  /** Callback when wizard completes */
  onComplete?: ((rentalObject: RentalObject) => void) | undefined;
}

export interface UseRentalObjectWizardReturn {
  // State
  currentStep: number;
  steps: WizardStep[];
  formData: Partial<RentalObject>;
  errors: Record<string, string[]>;
  isDirty: boolean;
  isLoading: boolean;
  isSaving: boolean;
  isEditMode: boolean;
  currentCategory: RentalObjectCategory;
  categoryConfig: typeof CATEGORY_CONFIGS[RentalObjectCategory];

  // Navigation
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  isLastStep: boolean;
  isFirstStep: boolean;

  // Data management
  updateFormData: (data: Partial<RentalObject>) => void;
  setFieldValue: <K extends keyof RentalObject>(field: K, value: RentalObject[K]) => void;
  setErrors: (stepId: WizardStepId, errors: string[]) => void;
  clearErrors: (stepId?: WizardStepId) => void;
  setCategory: (category: RentalObjectCategory) => void;

  // Actions
  saveDraft: () => Promise<void>;
  publish: () => Promise<void>;
  cancel: () => void;
  validateCurrentStep: () => boolean;
  validateAll: () => boolean;
}

const STORAGE_KEY = 'rental-object-wizard-draft';

function getDefaultFormData(category?: RentalObjectCategory): Partial<RentalObject> {
  const cat = category || 'LOKALER_OG_BANER';
  const config = CATEGORY_CONFIGS[cat];
  
  return {
    category: cat,
    status: 'draft',
    name: '',
    description: '',
    timeMode: config.defaultTimeMode,
    pricing: {
      basePrice: 0,
      currency: 'NOK',
      unit: 'hour',
    },
  };
}

export function useRentalObjectWizard(
  options: UseRentalObjectWizardOptions = {}
): UseRentalObjectWizardReturn {
  // Translation function available for future localization
  const t = useT();
  const { slug, cloneFromId, initialCategory, onComplete } = options;
  const navigate = useNavigate();
  const isEditMode = !!slug;
  const isCloneMode = !!cloneFromId;

  // SDK hooks - fetch by slug for edit mode or clone mode
  const { data: existingObject, isLoading: isLoadingObject } = useRentalObjectBySlug(slug || cloneFromId || '', {
    enabled: isEditMode || isCloneMode,
  });
  const createMutation = useCreateRentalObject();
  const updateMutation = useUpdateRentalObject();

  // Local state
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<RentalObject>>(() => {
    // Try to restore from localStorage for create mode
    if (!isEditMode) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Ignore parse errors
        }
      }
    }
    return getDefaultFormData(initialCategory);
  });
  const [errors, setErrorsState] = useState<Record<string, string[]>>({});
  const [isDirty, setIsDirty] = useState(false);

  // Current category
  const currentCategory = (formData.category || 'LOKALER_OG_BANER') as RentalObjectCategory;
  const categoryConfig = CATEGORY_CONFIGS[currentCategory] || CATEGORY_CONFIGS.LOKALER_OG_BANER;

  // Load existing rental object data in edit mode or clone mode
  useEffect(() => {
    if ((isEditMode || isCloneMode) && existingObject?.data) {
      const obj = existingObject.data as any; // Cast to any to avoid type mismatches with outdated contracts
      setFormData({
        // For clone mode, don't include id and slug (create new object)
        ...(isEditMode && { id: obj.id, slug: obj.slug }),
        name: isCloneMode ? `${obj.name} (Copy)` : obj.name,
        category: obj.category as RentalObjectCategory,
        subcategory: obj.subcategory,
        status: 'draft', // Always start as draft for clones
        images: obj.images,
        pricing: obj.pricing,
        description: obj.description,
        timeMode: obj.timeMode,
        capacity: obj.capacity,
        // Load category-specific fields from metadata or direct fields
        location: obj.location,
        openingHours: obj.openingHours,
        inventory: obj.inventory,
        pickup: obj.pickup,
        requirements: obj.requirements,
        packages: obj.packages,
        schedule: obj.schedule,
        content: obj.content,
        bookingConfig: obj.bookingConfig,
      });
      setIsDirty(false);
    }
  }, [isEditMode, isCloneMode, existingObject]);

  // Auto-save draft to localStorage (create mode only)
  useEffect(() => {
    if (!isEditMode && isDirty) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData, isDirty, isEditMode]);

  // Get steps based on category
  const steps: WizardStep[] = useMemo(() => {
    const stepIds = WIZARD_STEPS_BY_CATEGORY[currentCategory] || WIZARD_STEPS_BY_CATEGORY.LOKALER_OG_BANER || [];
    return ALL_WIZARD_STEPS
      .filter((stepId) => stepIds.includes(stepId))
      .map((id) => ({ 
        id,
        titleKey: `wizard.step.${id}.title`,
        descriptionKey: `wizard.step.${id}.description`,
        completed: false, // TODO: Implement completed logic
        hasErrors: !!errors[id]?.length
      }));
  }, [currentCategory, errors]);

  // Navigation helpers
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const canGoNext = currentStep < steps.length - 1;
  const canGoPrev = currentStep > 0;

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < steps.length) {
      const currentStepId = steps[currentStep]?.id;
      if (currentStepId && step > currentStep) {
        // Only validate when moving forward
        const result = validateStep(currentStepId, formData, currentCategory);
        if (!result.isValid) {
          setErrorsState((prev) => ({
            ...prev,
            [currentStepId]: result.errors.map((e) => e.message),
          }));
        }
      }
      setCurrentStep(step);
    }
  }, [steps.length, currentStep, steps, formData, currentCategory]);

  const nextStep = useCallback(() => {
    if (canGoNext) {
      const currentStepId = steps[currentStep]?.id;
      if (currentStepId) {
        const result = validateStep(currentStepId, formData, currentCategory);
        if (!result.isValid) {
          setErrorsState((prev) => ({
            ...prev,
            [currentStepId]: result.errors.map((e) => e.message),
          }));
          return;
        }
        setErrorsState((prev) => {
          const next = { ...prev };
          delete next[currentStepId];
          return next;
        });
      }
      setCurrentStep((prev) => prev + 1);
    }
  }, [canGoNext, currentStep, steps, formData, currentCategory]);

  const prevStep = useCallback(() => {
    if (canGoPrev) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [canGoPrev]);

  // Data management
  const updateFormData = useCallback((data: Partial<RentalObject>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setIsDirty(true);
  }, []);

  const setFieldValue = useCallback(<K extends keyof RentalObject>(
    field: K,
    value: RentalObject[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }, []);

  const setCategory = useCallback((category: RentalObjectCategory) => {
    const config = CATEGORY_CONFIGS[category];
    if (!config) return;

    setFormData((prev) => {
      // Cast to any to access potentially missing properties on type
      const prevAny = prev as any;
      const configAny = config as any;
      
      return {
        ...prev,
        category,
        timeMode: config.defaultTimeMode,
        // Reset category-specific fields - using explicit checks on casted config
        location: configAny.supportsLocation ? prevAny.location : undefined,
        openingHours: configAny.supportsOpeningHours ? prevAny.openingHours : undefined,
        inventory: configAny.supportsInventory ? prevAny.inventory : undefined,
        pickup: configAny.supportsPickup ? prevAny.pickup : undefined,
        packages: configAny.supportsPackages ? prevAny.packages : undefined,
        schedule: configAny.supportsSchedule ? prevAny.schedule : undefined,
      };
    });
    setIsDirty(true);
    // Reset to first step when category changes
    setCurrentStep(0);
  }, []);

  const setErrors = useCallback((stepId: WizardStepId, stepErrors: string[]) => {
    setErrorsState((prev) => ({ ...prev, [stepId]: stepErrors }));
  }, []);

  const clearErrors = useCallback((stepId?: WizardStepId) => {
    if (stepId) {
      setErrorsState((prev) => {
        const next = { ...prev };
        delete next[stepId];
        return next;
      });
    } else {
      setErrorsState({});
    }
  }, []);

  const validateCurrentStep = useCallback(() => {
    const currentStepId = steps[currentStep]?.id;
    if (!currentStepId) return true;

    const result = validateStep(currentStepId, formData, currentCategory);
    if (!result.isValid) {
      setErrorsState((prev) => ({
        ...prev,
        [currentStepId]: result.errors.map((e) => e.message),
      }));
      return false;
    }
    setErrorsState((prev) => {
      const next = { ...prev };
      delete next[currentStepId];
      return next;
    });
    return true;
  }, [currentStep, steps, formData, currentCategory]);

  const validateAll = useCallback(() => {
    const allErrors = validateAllSteps(steps, formData, currentCategory);
    const hasErrors = Object.keys(allErrors).length > 0;
    setErrorsState(allErrors);
    return !hasErrors;
  }, [steps, formData, currentCategory]);

  // Transform form data to API format
  const toCreateDTO = useCallback((): CreateRentalObjectDTO => {
    const dto: CreateRentalObjectDTO = {
      category: formData.category || 'LOKALER_OG_BANER',
      name: formData.name || '',
    };
    
    // Explicit casts for properties that might be missing in older types
    const data = formData as any;
    
    if (formData.slug) dto.slug = formData.slug;
    if (formData.subcategory) dto.subcategory = formData.subcategory;
    if (formData.description) dto.description = formData.description;
    if (formData.timeMode) dto.timeMode = formData.timeMode;
    if (formData.location) dto.location = formData.location;
    if (formData.capacity !== undefined) dto.capacity = formData.capacity;
    if (data.openingHours) dto.openingHours = data.openingHours;
    if (data.inventory) dto.inventory = data.inventory;
    if (data.pickup) dto.pickup = data.pickup;
    if (data.requirements) dto.requirements = data.requirements;
    if (data.packages) dto.packages = data.packages;
    if (data.schedule) dto.schedule = data.schedule;
    if (data.content) dto.content = data.content;
    if (data.bookingConfig) dto.bookingConfig = data.bookingConfig;
    if (formData.pricing) {
      dto.pricing = {
        basePrice: formData.pricing.basePrice,
        currency: formData.pricing.currency,
        unit: formData.pricing.unit,
      };
    }
    if (formData.organizationId) dto.organizationId = formData.organizationId;
    
    return dto;
  }, [formData]);

  // Save draft
  const saveDraft = useCallback(async () => {
    if (createMutation.isPending || updateMutation.isPending) {
      return;
    }

    try {
      const objectId = formData.id;

      if (objectId) {
        await updateMutation.mutateAsync({
          id: objectId,
          data: toCreateDTO(),
        });
      } else {
        const result = await createMutation.mutateAsync(toCreateDTO());
        localStorage.removeItem(STORAGE_KEY);

        if (result.data) {
          setFormData((prev) => ({
            ...prev,
            id: result.data.id,
            slug: result.data.slug,
          }));

          if (result.data.slug) {
            navigate(`/rental-objects/${result.data.slug}`, { replace: true });
          }
        }
      }
      setIsDirty(false);
    } catch (error) {
      console.error(t('validation.failed_to_save_draft'), error);
      throw error;
    }
  }, [formData.id, toCreateDTO, createMutation, updateMutation, navigate, t]);

  // Publish
  const publish = useCallback(async () => {
    try {
      await saveDraft();
      onComplete?.(formData as RentalObject);
      navigate('/rental-objects');
    } catch (error) {
      console.error(t('validation.failed_to_publish'), error);
      throw error;
    }
  }, [saveDraft, formData, onComplete, navigate, t]);

  // Cancel wizard
  const cancel = useCallback(() => {
    if (isDirty) {
      const confirmed = window.confirm('Du har ulagrede endringer. Vil du virkelig avbryte?');
      if (!confirmed) return;
    }
    localStorage.removeItem(STORAGE_KEY);
    navigate('/rental-objects');
  }, [isDirty, navigate]);

  return {
    // State
    currentStep,
    steps,
    formData,
    errors,
    isDirty,
    isLoading: isLoadingObject,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isEditMode,
    currentCategory,
    categoryConfig,

    // Navigation
    goToStep,
    nextStep,
    prevStep,
    canGoNext,
    canGoPrev,
    isLastStep,
    isFirstStep,

    // Data management
    updateFormData,
    setFieldValue,
    setErrors,
    clearErrors,
    setCategory,

    // Actions
    saveDraft,
    publish,
    cancel,
    validateCurrentStep,
    validateAll,
  };
}
