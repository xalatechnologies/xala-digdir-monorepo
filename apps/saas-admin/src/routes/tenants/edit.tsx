/**
 * Tenant Edit Page
 * SaaS Admin page for editing existing tenant details
 * 
 * Follows DS rules: dedicated page (not modal), contract-first
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Textfield,
  Select,
  Alert,
  Spinner,
  Stack,
  ArrowLeftIcon,
  SaveIcon,
} from '@xalatechnologies/platform/ui';
import {
  useSaasTenant,
  useUpdateSaasTenant,
  useSaasPlans,
  type UpdateSaasTenantRequest,
  type SaasTenantStatus,
} from '@xalatechnologies/platform/sdk';
import { useT } from '@xala/i18n';

interface FormData {
  name: string;
  slug: string;
  domain: string;
  planId: string;
  status: SaasTenantStatus;
}

interface FormErrors {
  name?: string;
  slug?: string;
  domain?: string;
}

export function TenantEditPage() {
  const { id } = useParams<{ id: string }>();
  const t = useT();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    domain: '',
    planId: '',
    status: 'active',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Queries
  const { data: tenantData, isLoading, error: loadError } = useSaasTenant(id!);
  const tenant = tenantData?.data;
  
  const { data: plansData, isLoading: loadingPlans } = useSaasPlans({ status: 'active' });
  const plans = plansData?.data ?? [];

  // Mutations
  const updateMutation = useUpdateSaasTenant();

  // Initialize form with tenant data
  useEffect(() => {
    if (tenant) {
      setFormData({
        name: tenant.name,
        slug: tenant.slug,
        domain: tenant.domain ?? '',
        planId: tenant.subscriptionPlanId ?? '',
        status: tenant.status,
      });
    }
  }, [tenant]);

  // Track form changes
  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSlugChange = (value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    handleFieldChange('slug', sanitized);
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('validation.required');
    } else if (formData.name.length < 2) {
      newErrors.name = t('validation.minLength', { min: 2 });
    }

    if (!formData.slug.trim()) {
      newErrors.slug = t('validation.required');
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = t('validation.slugFormat');
    }

    if (formData.domain && !/^[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}$/.test(formData.domain)) {
      newErrors.domain = t('validation.domainFormat');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    try {
      const request: UpdateSaasTenantRequest = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        domain: formData.domain.trim() || undefined,
        planId: formData.planId || undefined,
        status: formData.status,
      };

      await updateMutation.mutateAsync({ tenantId: id!, data: request });
      navigate(`/tenants/${id}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('errors.generic');
      setSubmitError(message);
    }
  };

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Spinner size="lg" aria-label={t('state.loading')} />
      </div>
    );
  }

  if (loadError || !tenant) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--ds-spacing-8)' }}>
        <Alert severity="error">
          {t('saasAdmin.tenantEdit.notFound', { defaultValue: 'Tenant ikke funnet' })}
        </Alert>
        <Link to="/tenants">
          <Button variant="secondary" style={{ marginTop: 'var(--ds-spacing-4)' }} type="button">
            <ArrowLeftIcon />
            {t('action.back')}
          </Button>
        </Link>
      </div>
    );
  }

  const statusOptions: Array<{ value: SaasTenantStatus; label: string }> = [
    { value: 'active', label: t('saasAdmin.tenants.statusActive') },
    { value: 'inactive', label: t('status.inactive') },
    { value: 'suspended', label: t('saasAdmin.tenants.statusSuspended') },
    { value: 'pending', label: t('saasAdmin.tenants.statusPending') },
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--ds-spacing-8)' }}>
      {/* Back navigation */}
      <Link to={`/tenants/${id}`}>
        <Button variant="tertiary" size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }} type="button">
          <ArrowLeftIcon />
          {t('action.back')}
        </Button>
      </Link>

      {/* Header */}
      <Heading level={1} size="lg" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
        {t('saasAdmin.tenantEdit.page.title', { defaultValue: 'Rediger tenant' })}
      </Heading>
      <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-6)' }}>
        {tenant.name}
      </Paragraph>

      {/* Unsaved changes warning */}
      {isDirty && (
        <Alert severity="warning" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('saasAdmin.tenantEdit.unsavedChanges', { defaultValue: 'Du har ulagrede endringer.' })}
        </Alert>
      )}

      {/* Error banner */}
      {submitError && (
        <Alert severity="error" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {submitError}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <Card style={{ padding: 'var(--ds-spacing-6)', marginBottom: 'var(--ds-spacing-4)' }}>
          <Heading level={2} size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
            {t('saasAdmin.tenantCreate.basicInfo', { defaultValue: 'Grunnleggende informasjon' })}
          </Heading>

          <Stack direction="column" gap={16}>
            <Textfield
              label={t('label.name')}
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              error={errors.name}
              required
            />

            <Textfield
              label="Slug"
              value={formData.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              error={errors.slug}
              required
              description={t('saasAdmin.tenantCreate.slugDescription', { defaultValue: 'Unik identifikator (kun små bokstaver, tall og bindestrek)' })}
            />

            <Textfield
              label={t('saasAdmin.tenants.domain')}
              value={formData.domain}
              onChange={(e) => handleFieldChange('domain', e.target.value)}
              error={errors.domain}
              placeholder={t('common.bookingeksempelno')}
            />

            <Select
              label={t('label.status')}
              value={formData.status}
              onChange={(e) => handleFieldChange('status', e.target.value)}
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </Stack>
        </Card>

        {/* Subscription Plan */}
        <Card style={{ padding: 'var(--ds-spacing-6)', marginBottom: 'var(--ds-spacing-6)' }}>
          <Heading level={2} size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
            {t('saasAdmin.tenantCreate.subscription', { defaultValue: 'Abonnement' })}
          </Heading>

          {loadingPlans ? (
            <Spinner aria-label={t('state.loading')} />
          ) : (
            <Select
              label={t('saasAdmin.tenants.plan')}
              value={formData.planId}
              onChange={(e) => handleFieldChange('planId', e.target.value)}
            >
              <option value="">{t('saasAdmin.tenantCreate.noPlan', { defaultValue: '-- Ingen plan --' })}</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - {plan.basePrice} {plan.currency}/{plan.billingPeriod}
                </option>
              ))}
            </Select>
          )}
        </Card>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', justifyContent: 'flex-end' }}>
          <Link to={`/tenants/${id}`}>
            <Button variant="secondary" type="button">
              {t('action.cancel')}
            </Button>
          </Link>
          <Button type="submit" disabled={updateMutation.isPending || !isDirty}>
            {updateMutation.isPending ? (
              <Spinner size="sm" aria-label={t('state.saving')} />
            ) : (
              <>
                <SaveIcon />
                {t('action.save')}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default TenantEditPage;
