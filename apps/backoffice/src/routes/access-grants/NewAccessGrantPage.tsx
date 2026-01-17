/**
 * New Access Grant Page
 * Commune Admin page for granting organization access to rental objects
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  FormField,
  Select,
  Spinner,
  Stack,
  ArrowLeftIcon,
  ShieldCheckIcon,
  Alert,
  Textfield,
} from '@xala/ds';
import {
  useOrganizations,
  useRentalObjects,
  useGrantAccess,
  type CreateAccessGrantDTO,
} from '@digilist/client-sdk';
import { useT } from '@xala/i18n';
import { FormSection, FormActions } from '../../components/shared';

export function NewAccessGrantPage() {
  const t = useT();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState<CreateAccessGrantDTO>({
    organizationId: '',
    rentalObjectId: '',
    expiresAt: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Queries
  const { data: orgData, isLoading: orgsLoading } = useOrganizations({ limit: 100 });
  const organizations = orgData?.data ?? [];

  const { data: rentalObjectsData, isLoading: rentalObjectsLoading } = useRentalObjects({ limit: 100 });
  const rentalObjects = rentalObjectsData?.data ?? [];

  // Mutations
  const grantAccessMutation = useGrantAccess();

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.organizationId) {
      newErrors.organizationId = t('accessGrants.validation.organizationRequired');
    }

    if (!formData.rentalObjectId) {
      newErrors.rentalObjectId = t('accessGrants.validation.rentalObjectRequired');
    }

    // Validate expiry date is in the future if provided
    if (formData.expiresAt) {
      const expiresAt = new Date(formData.expiresAt);
      if (expiresAt <= new Date()) {
        newErrors.expiresAt = t('accessGrants.validation.expiryFuture');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) {
      return;
    }

    try {
      await grantAccessMutation.mutateAsync({
        organizationId: formData.organizationId,
        rentalObjectId: formData.rentalObjectId,
        expiresAt: formData.expiresAt || undefined,
        notes: formData.notes || undefined,
      });

      navigate('/access-grants');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t('accessGrants.createError');
      setSubmitError(errorMessage);
    }
  };

  const handleCancel = () => {
    navigate('/access-grants');
  };

  const handleChange = (field: keyof typeof formData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    // Clear submit error
    if (submitError) {
      setSubmitError(null);
    }
  };

  const isLoading = orgsLoading || rentalObjectsLoading;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <Link to="/access-grants">
          <Button variant="tertiary" data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }} type="button">
            <ArrowLeftIcon />
            {t('accessGrants.backToOverview')}
          </Button>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
          <ShieldCheckIcon style={{ fontSize: 'var(--ds-font-size-heading-md)', color: 'var(--ds-color-brand-base)' }} />
          <div>
            <Heading level={2} data-size="lg">
              {t('accessGrants.newAccessGrant')}
            </Heading>
            <Paragraph
              data-size="sm"
              style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)' }}
            >
              {t('accessGrants.newAccessGrantDescription')}
            </Paragraph>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {submitError && (
        <Alert severity="danger">
          <Heading level={3} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-1)' }}>
            {t('accessGrants.errorCreating')}
          </Heading>
          <Paragraph data-size="sm">{submitError}</Paragraph>
        </Alert>
      )}

      {/* Form */}
      <Card>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
            <Spinner data-size="lg" aria-label={t('accessGrants.loadingData')} />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <Stack spacing={5}>
              {/* Organization Selection */}
              <FormSection
                title={t('accessGrants.form.organizationSection')}
                description={t('accessGrants.form.organizationDescription')}
              >
                <FormField
                  label={t('accessGrants.form.organizationLabel')}
                  required
                  error={errors.organizationId || undefined}
                >
                  <Select
                    value={formData.organizationId}
                    onChange={(e) => handleChange('organizationId')(e.target.value)}
                    aria-label={t('accessGrants.form.selectOrganizationAria')}
                  >
                    <option value="">{t('accessGrants.form.selectOrganization')}</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                        {org.organizationNumber ? ` (${org.organizationNumber})` : ''}
                      </option>
                    ))}
                  </Select>
                </FormField>
              </FormSection>

              {/* Rental Object Selection */}
              <FormSection
                title={t('accessGrants.form.rentalObjectSection')}
                description={t('accessGrants.form.rentalObjectDescription')}
              >
                <FormField
                  label={t('accessGrants.form.rentalObjectLabel')}
                  required
                  error={errors.rentalObjectId || undefined}
                >
                  <Select
                    value={formData.rentalObjectId}
                    onChange={(e) => handleChange('rentalObjectId')(e.target.value)}
                    aria-label={t('accessGrants.form.selectRentalObjectAria')}
                  >
                    <option value="">{t('accessGrants.form.selectRentalObject')}</option>
                    {rentalObjects.map((rentalObject) => (
                      <option key={rentalObject.id} value={rentalObject.id}>
                        {rentalObject.name}
                        {rentalObject.category ? ` (${rentalObject.category})` : ''}
                      </option>
                    ))}
                  </Select>
                </FormField>
              </FormSection>

              {/* Validity Period */}
              <FormSection
                title={t('accessGrants.form.validitySection')}
                description={t('accessGrants.form.validityDescription')}
              >
                <Stack spacing={4}>
                  <FormField
                    label={t('accessGrants.form.expiryLabel')}
                    error={errors.expiresAt || undefined}
                  >
                    <Textfield
                      type="date"
                      value={formData.expiresAt || ''}
                      onChange={(e) => handleChange('expiresAt')(e.target.value)}
                      aria-label={t('accessGrants.form.expiryAria')}
                    />
                  </FormField>

                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t('accessGrants.form.noExpiryNote')}
                  </Paragraph>
                </Stack>
              </FormSection>

              {/* Notes */}
              <FormSection
                title={t('accessGrants.form.notesSection')}
                description={t('accessGrants.form.notesDescription')}
              >
                <FormField label={t('accessGrants.form.notesLabel')}>
                  <Textfield
                    value={formData.notes || ''}
                    onChange={(e) => handleChange('notes')(e.target.value)}
                    placeholder={t('accessGrants.form.notesPlaceholder')}
                    aria-label={t('accessGrants.form.notesAria')}
                  />
                </FormField>
              </FormSection>

              {/* Actions */}
              <FormActions
                submitText={t('accessGrants.form.submit')}
                onCancel={handleCancel}
                isSubmitting={grantAccessMutation.isPending}
                submittingText={t('accessGrants.form.submitting')}
              />
            </Stack>
          </form>
        )}
      </Card>
    </div>
  );
}
