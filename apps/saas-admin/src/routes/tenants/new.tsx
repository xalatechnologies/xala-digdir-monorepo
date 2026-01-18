/**
 * Tenant Create Page
 * SaaS Admin page for creating new tenants
 * 
 * Follows DS rules: dedicated page (not modal), contract-first
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Textfield,
  Select,
  Switch,
  Alert,
  Spinner,
  Stack,
  ArrowLeftIcon,
  SaveIcon,
} from '@xala/ds';
import { useCreateSaasTenant, useSaasPlans } from '@digilist/client-sdk/hooks';
import type { CreateSaasTenantRequest, SeatLimits } from '@digilist/client-sdk/types';
import { useT } from '@xala/i18n';

const DEFAULT_SEAT_LIMITS: SeatLimits = {
  maxUsers: 5,
  maxOrganizations: 1,
  maxListings: 10,
  maxBookingsPerMonth: 100,
  maxStorageMb: 500,
};

interface FormData {
  name: string;
  slug: string;
  domain: string;
  planId: string;
  seatLimits: SeatLimits;
  useCustomLimits: boolean;
}

interface FormErrors {
  name?: string;
  slug?: string;
  domain?: string;
}

export function TenantCreatePage() {
  const t = useT();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    domain: '',
    planId: '',
    seatLimits: { ...DEFAULT_SEAT_LIMITS },
    useCustomLimits: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Queries
  const { data: plansData, isLoading: loadingPlans } = useSaasPlans({ status: 'active' });
  const plans = plansData?.data ?? [];

  // Mutations
  const createMutation = useCreateSaasTenant();

  // Auto-generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 50);
  };

  // Handlers
  const handleNameChange = (value: string) => {
    const newSlug = generateSlug(value);
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: prev.slug === '' || prev.slug === generateSlug(prev.name) ? newSlug : prev.slug,
    }));
    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
  };

  const handleSlugChange = (value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData((prev) => ({ ...prev, slug: sanitized }));
    if (errors.slug) setErrors((prev) => ({ ...prev, slug: undefined }));
  };

  const handleDomainChange = (value: string) => {
    setFormData((prev) => ({ ...prev, domain: value }));
    if (errors.domain) setErrors((prev) => ({ ...prev, domain: undefined }));
  };

  const handlePlanChange = (planId: string) => {
    const selectedPlan = plans.find((p) => p.id === planId);
    setFormData((prev) => ({
      ...prev,
      planId,
      seatLimits: selectedPlan?.seatLimits ?? { ...DEFAULT_SEAT_LIMITS },
    }));
  };

  const handleSeatLimitChange = (field: keyof SeatLimits, value: string) => {
    const numValue = parseInt(value, 10) || 0;
    setFormData((prev) => ({
      ...prev,
      seatLimits: { ...prev.seatLimits, [field]: numValue },
    }));
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
      const request: CreateSaasTenantRequest = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        domain: formData.domain.trim() || undefined,
        planId: formData.planId || undefined,
        seatLimits: formData.useCustomLimits ? formData.seatLimits : undefined,
      };

      const result = await createMutation.mutateAsync(request);
      navigate(`/tenants/${result.data.id}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('errors.generic');
      setSubmitError(message);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--ds-spacing-8)' }}>
      {/* Back navigation */}
      <Link to="/tenants">
        <Button variant="tertiary" data-size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }} type="button">
          <ArrowLeftIcon />
          {t('common.back')}
        </Button>
      </Link>

      {/* Header */}
      <Heading level={1} data-size="lg" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
        {t('saasAdmin.tenants.createTenant')}
      </Heading>
      <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-6)' }}>
        {t('saasAdmin.tenants.createDescription', { defaultValue: 'Opprett en ny tenant i plattformen.' })}
      </Paragraph>

      {/* Error banner */}
      {submitError && (
        <Alert severity="error" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {submitError}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <Card style={{ padding: 'var(--ds-spacing-6)', marginBottom: 'var(--ds-spacing-4)' }}>
          <Heading level={2} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
            {t('saasAdmin.tenantCreate.basicInfo', { defaultValue: 'Grunnleggende informasjon' })}
          </Heading>

          <Stack direction="column" gap={16}>
            <Textfield
              label={t('common.name')}
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              error={errors.name}
              required
              placeholder={t('saasAdmin.tenantCreate.namePlaceholder', { defaultValue: 'Eksempel Kommune' })}
            />

            <Textfield
              label="Slug"
              value={formData.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              error={errors.slug}
              required
              placeholder={t('common.eksempelkommune')}
              description={t('saasAdmin.tenantCreate.slugDescription', { defaultValue: 'Unik identifikator (kun små bokstaver, tall og bindestrek)' })}
            />

            <Textfield
              label={t('saasAdmin.tenants.domain')}
              value={formData.domain}
              onChange={(e) => handleDomainChange(e.target.value)}
              error={errors.domain}
              placeholder={t('common.bookingeksempelno')}
              description={t('saasAdmin.tenantCreate.domainDescription', { defaultValue: 'Valgfritt egendefinert domene' })}
            />
          </Stack>
        </Card>

        {/* Subscription Plan */}
        <Card style={{ padding: 'var(--ds-spacing-6)', marginBottom: 'var(--ds-spacing-4)' }}>
          <Heading level={2} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
            {t('saasAdmin.tenantCreate.subscription', { defaultValue: 'Abonnement' })}
          </Heading>

          {loadingPlans ? (
            <Spinner aria-label={t('common.loading')} />
          ) : (
            <Select
              label={t('saasAdmin.tenants.plan')}
              value={formData.planId}
              onChange={(e) => handlePlanChange(e.target.value)}
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

        {/* Seat Limits */}
        <Card style={{ padding: 'var(--ds-spacing-6)', marginBottom: 'var(--ds-spacing-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-4)' }}>
            <div>
              <Heading level={2} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-1)' }}>
                {t('saasAdmin.tenantCreate.seatLimits', { defaultValue: 'Grenser' })}
              </Heading>
              <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                {t('saasAdmin.tenantCreate.seatLimitsDescription', { defaultValue: 'Overstyr standardgrenser fra valgt plan' })}
              </Paragraph>
            </div>
            <Switch
              checked={formData.useCustomLimits}
              onChange={() => setFormData((prev) => ({ ...prev, useCustomLimits: !prev.useCustomLimits }))}
            >
              {t('saasAdmin.tenantCreate.customLimits', { defaultValue: 'Egendefinerte grenser' })}
            </Switch>
          </div>

          {formData.useCustomLimits && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--ds-spacing-4)' }}>
              <Textfield
                label={t('saasAdmin.tenantCreate.maxUsers', { defaultValue: 'Maks brukere' })}
                type="number"
                min={1}
                value={formData.seatLimits.maxUsers.toString()}
                onChange={(e) => handleSeatLimitChange('maxUsers', e.target.value)}
              />
              <Textfield
                label={t('saasAdmin.tenantCreate.maxOrganizations', { defaultValue: 'Maks organisasjoner' })}
                type="number"
                min={1}
                value={formData.seatLimits.maxOrganizations.toString()}
                onChange={(e) => handleSeatLimitChange('maxOrganizations', e.target.value)}
              />
              <Textfield
                label={t('saasAdmin.tenantCreate.maxListings', { defaultValue: 'Maks leieobjekter' })}
                type="number"
                min={1}
                value={formData.seatLimits.maxListings.toString()}
                onChange={(e) => handleSeatLimitChange('maxListings', e.target.value)}
              />
              <Textfield
                label={t('saasAdmin.tenantCreate.maxBookings', { defaultValue: 'Maks bookinger/mnd' })}
                type="number"
                min={1}
                value={formData.seatLimits.maxBookingsPerMonth.toString()}
                onChange={(e) => handleSeatLimitChange('maxBookingsPerMonth', e.target.value)}
              />
              <Textfield
                label={t('saasAdmin.tenantCreate.maxStorage', { defaultValue: 'Maks lagring (MB)' })}
                type="number"
                min={100}
                value={formData.seatLimits.maxStorageMb.toString()}
                onChange={(e) => handleSeatLimitChange('maxStorageMb', e.target.value)}
              />
            </div>
          )}
        </Card>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', justifyContent: 'flex-end' }}>
          <Link to="/tenants">
            <Button variant="secondary" type="button">
              {t('common.cancel')}
            </Button>
          </Link>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <Spinner data-size="sm" aria-label={t('common.saving')} />
            ) : (
              <>
                <SaveIcon />
                {t('saasAdmin.tenants.createTenant')}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default TenantCreatePage;
