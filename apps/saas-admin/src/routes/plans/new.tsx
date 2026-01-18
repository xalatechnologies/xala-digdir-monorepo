/**
 * Plan Create Page
 * SaaS Admin page for creating new subscription plans
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
import { useCreateSaasPlan } from '@digilist/client-sdk/hooks';
import type { CreatePlanRequest, SeatLimits, Entitlements, BillingPeriod } from '@digilist/client-sdk/types';
import { useT } from '@xala/i18n';

const DEFAULT_SEAT_LIMITS: SeatLimits = {
  maxUsers: 5,
  maxOrganizations: 1,
  maxListings: 10,
  maxBookingsPerMonth: 100,
  maxStorageMb: 500,
};

const DEFAULT_ENTITLEMENTS: Entitlements = {
  modules: {
    rating: false,
    recommendations: false,
    feedback: true,
    favorites: true,
    share: true,
    recurringBookings: false,
  },
  integrations: {
    visma: false,
    rco: false,
    acos: false,
    outlook: false,
    vipps: false,
  },
  features: {
    customBranding: false,
    apiAccess: false,
    webhooks: false,
    advancedReporting: false,
    prioritySupport: false,
  },
};

interface FormData {
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  currency: string;
  billingPeriod: BillingPeriod;
  trialDays: number;
  isPublic: boolean;
  seatLimits: SeatLimits;
  entitlements: Entitlements;
}

interface FormErrors {
  name?: string;
  slug?: string;
  basePrice?: string;
}

export function PlanCreatePage() {
  const t = useT();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    description: '',
    basePrice: 0,
    currency: 'NOK',
    billingPeriod: 'monthly',
    trialDays: 0,
    isPublic: true,
    seatLimits: { ...DEFAULT_SEAT_LIMITS },
    entitlements: JSON.parse(JSON.stringify(DEFAULT_ENTITLEMENTS)),
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Mutations
  const createMutation = useCreateSaasPlan();

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

  const handleSeatLimitChange = (field: keyof SeatLimits, value: string) => {
    const numValue = parseInt(value, 10) || 0;
    setFormData((prev) => ({
      ...prev,
      seatLimits: { ...prev.seatLimits, [field]: numValue },
    }));
  };

  const handleModuleToggle = (module: keyof Entitlements['modules']) => {
    setFormData((prev) => ({
      ...prev,
      entitlements: {
        ...prev.entitlements,
        modules: { ...prev.entitlements.modules, [module]: !prev.entitlements.modules[module] },
      },
    }));
  };

  const handleIntegrationToggle = (integration: keyof Entitlements['integrations']) => {
    setFormData((prev) => ({
      ...prev,
      entitlements: {
        ...prev.entitlements,
        integrations: { ...prev.entitlements.integrations, [integration]: !prev.entitlements.integrations[integration] },
      },
    }));
  };

  const handleFeatureToggle = (feature: keyof Entitlements['features']) => {
    setFormData((prev) => ({
      ...prev,
      entitlements: {
        ...prev.entitlements,
        features: { ...prev.entitlements.features, [feature]: !prev.entitlements.features[feature] },
      },
    }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('validation.required');
    }

    if (!formData.slug.trim()) {
      newErrors.slug = t('validation.required');
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = t('validation.slugFormat');
    }

    if (formData.basePrice < 0) {
      newErrors.basePrice = t('validation.minValue', { min: 0 });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    try {
      const request: CreatePlanRequest = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || undefined,
        basePrice: formData.basePrice,
        currency: formData.currency,
        billingPeriod: formData.billingPeriod,
        trialDays: formData.trialDays,
        isPublic: formData.isPublic,
        seatLimits: formData.seatLimits,
        entitlements: formData.entitlements,
      };

      const result = await createMutation.mutateAsync(request);
      navigate(`/plans/${result.data.id}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('errors.generic');
      setSubmitError(message);
    }
  };

  const billingPeriodOptions = [
    { value: 'monthly', label: t('saasAdmin.plans.monthly') },
    { value: 'yearly', label: t('saasAdmin.plans.yearly') },
    { value: 'lifetime', label: t('saasAdmin.plans.lifetime') },
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'var(--ds-spacing-8)' }}>
      {/* Back navigation */}
      <Link to="/plans">
        <Button variant="tertiary" size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }} type="button">
          <ArrowLeftIcon />
          {t('action.back')}
        </Button>
      </Link>

      {/* Header */}
      <Heading level={1} size="lg" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
        {t('saasAdmin.plans.createPlan')}
      </Heading>
      <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-6)' }}>
        {t('saasAdmin.planCreate.description', { defaultValue: 'Opprett en ny abonnementsplan.' })}
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
          <Heading level={2} size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
            {t('saasAdmin.tenantCreate.basicInfo', { defaultValue: 'Grunnleggende informasjon' })}
          </Heading>

          <Stack direction="column" gap={16}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-4)' }}>
              <Textfield
                label={t('label.name')}
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                error={errors.name}
                required
                placeholder={t('saasAdmin.planCreate.namePlaceholder', { defaultValue: 'Profesjonell' })}
              />

              <Textfield
                label="Slug"
                value={formData.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                error={errors.slug}
                required
                placeholder={t('common.professional')}
              />
            </div>

            <Textfield
              label={t('label.description')}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder={t('saasAdmin.planCreate.descriptionPlaceholder', { defaultValue: 'Fullverdig plan for mellomstore kommuner' })}
            />
          </Stack>
        </Card>

        {/* Pricing */}
        <Card style={{ padding: 'var(--ds-spacing-6)', marginBottom: 'var(--ds-spacing-4)' }}>
          <Heading level={2} size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
            {t('saasAdmin.planCreate.pricing', { defaultValue: 'Prising' })}
          </Heading>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--ds-spacing-4)' }}>
            <Textfield
              label={t('saasAdmin.plans.price')}
              type="number"
              min={0}
              value={formData.basePrice.toString()}
              onChange={(e) => setFormData((prev) => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
              error={errors.basePrice}
            />

            <Select
              label={t('saasAdmin.planCreate.currency', { defaultValue: 'Valuta' })}
              value={formData.currency}
              onChange={(e) => setFormData((prev) => ({ ...prev, currency: e.target.value }))}
            >
              <option value="NOK">{t('saasAdmin.text.nok')}</option>
              <option value="EUR">{t('saasAdmin.text.eur')}</option>
              <option value="USD">{t('saasAdmin.text.usd')}</option>
            </Select>

            <Select
              label={t('saasAdmin.plans.interval')}
              value={formData.billingPeriod}
              onChange={(e) => setFormData((prev) => ({ ...prev, billingPeriod: e.target.value as BillingPeriod }))}
            >
              {billingPeriodOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>

            <Textfield
              label={t('saasAdmin.plans.trialPeriod')}
              type="number"
              min={0}
              value={formData.trialDays.toString()}
              onChange={(e) => setFormData((prev) => ({ ...prev, trialDays: parseInt(e.target.value, 10) || 0 }))}
            />
          </div>

          <div style={{ marginTop: 'var(--ds-spacing-4)' }}>
            <Switch
              checked={formData.isPublic}
              onChange={() => setFormData((prev) => ({ ...prev, isPublic: !prev.isPublic }))}
            >
              {t('saasAdmin.plans.public')}
            </Switch>
          </div>
        </Card>

        {/* Seat Limits */}
        <Card style={{ padding: 'var(--ds-spacing-6)', marginBottom: 'var(--ds-spacing-4)' }}>
          <Heading level={2} size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
            {t('saasAdmin.tenantCreate.seatLimits', { defaultValue: 'Grenser' })}
          </Heading>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--ds-spacing-4)' }}>
            <Textfield
              label={t('saasAdmin.tenantCreate.maxUsers', { defaultValue: 'Maks brukere' })}
              type="number"
              min={1}
              value={formData.seatLimits.maxUsers.toString()}
              onChange={(e) => handleSeatLimitChange('maxUsers', e.target.value)}
            />
            <Textfield
              label={t('saasAdmin.tenantCreate.maxOrganizations', { defaultValue: 'Maks orgs' })}
              type="number"
              min={1}
              value={formData.seatLimits.maxOrganizations.toString()}
              onChange={(e) => handleSeatLimitChange('maxOrganizations', e.target.value)}
            />
            <Textfield
              label={t('saasAdmin.tenantCreate.maxListings', { defaultValue: 'Maks RO' })}
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
              label={t('saasAdmin.tenantCreate.maxStorage', { defaultValue: 'Maks MB' })}
              type="number"
              min={100}
              value={formData.seatLimits.maxStorageMb.toString()}
              onChange={(e) => handleSeatLimitChange('maxStorageMb', e.target.value)}
            />
          </div>
        </Card>

        {/* Entitlements */}
        <Card style={{ padding: 'var(--ds-spacing-6)', marginBottom: 'var(--ds-spacing-6)' }}>
          <Heading level={2} size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
            {t('saasAdmin.planCreate.entitlements', { defaultValue: 'Berettigelser' })}
          </Heading>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--ds-spacing-6)' }}>
            {/* Modules */}
            <div>
              <Heading level={3} size="xs" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
                {t('saasAdmin.planCreate.modules', { defaultValue: 'Moduler' })}
              </Heading>
              <Stack direction="column" gap={8}>
                {Object.keys(formData.entitlements.modules).map((key) => (
                  <Switch
                    key={key}
                    checked={formData.entitlements.modules[key as keyof typeof formData.entitlements.modules]}
                    onChange={() => handleModuleToggle(key as keyof typeof formData.entitlements.modules)}
                  >
                    {key}
                  </Switch>
                ))}
              </Stack>
            </div>

            {/* Integrations */}
            <div>
              <Heading level={3} size="xs" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
                {t('saasAdmin.planCreate.integrations', { defaultValue: 'Integrasjoner' })}
              </Heading>
              <Stack direction="column" gap={8}>
                {Object.keys(formData.entitlements.integrations).map((key) => (
                  <Switch
                    key={key}
                    checked={formData.entitlements.integrations[key as keyof typeof formData.entitlements.integrations]}
                    onChange={() => handleIntegrationToggle(key as keyof typeof formData.entitlements.integrations)}
                  >
                    {key}
                  </Switch>
                ))}
              </Stack>
            </div>

            {/* Features */}
            <div>
              <Heading level={3} size="xs" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
                {t('saasAdmin.planCreate.features', { defaultValue: 'Funksjoner' })}
              </Heading>
              <Stack direction="column" gap={8}>
                {Object.keys(formData.entitlements.features).map((key) => (
                  <Switch
                    key={key}
                    checked={formData.entitlements.features[key as keyof typeof formData.entitlements.features]}
                    onChange={() => handleFeatureToggle(key as keyof typeof formData.entitlements.features)}
                  >
                    {key}
                  </Switch>
                ))}
              </Stack>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', justifyContent: 'flex-end' }}>
          <Link to="/plans">
            <Button variant="secondary" type="button">
              {t('action.cancel')}
            </Button>
          </Link>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <Spinner size="sm" aria-label={t('state.saving')} />
            ) : (
              <>
                <SaveIcon />
                {t('saasAdmin.plans.createPlan')}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default PlanCreatePage;
