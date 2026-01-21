/**
 * Packages Step Component
 * For configuring additional packages (experiences only)
 */

import { useT } from '@xala/i18n';
import {
  Heading,
  Paragraph,
  Alert,
  Card,
  Textfield,
  Textarea,
  Checkbox,
  Button,
  Badge,
  PlusIcon,
  TrashIcon,
  CreditCardIcon,
} from '@xalatechnologies/platform/ui';
import type { UseRentalObjectWizardReturn } from '@xala/backoffice/hooks/useRentalObjectWizard';

export interface PackagesStepProps {
  wizard: UseRentalObjectWizardReturn;
}

interface Package {
  id: string;
  name: string;
  description: string;
  price: number; // in NOK øre
  includedInBasePrice: boolean;
}

export function PackagesStep({ wizard }: PackagesStepProps) {
  const t = useT();
  const { formData, updateFormData, errors } = wizard;
  const currentStepErrors = errors['packages'] || [];

  const packages = (formData.packages || []) as Package[];

  const addPackage = () => {
    const newPackage: Package = {
      id: `pkg-${Date.now()}`,
      name: '',
      description: '',
      price: 0,
      includedInBasePrice: false,
    };
    updateFormData({ packages: [...packages, newPackage] });
  };

  const removePackage = (id: string) => {
    updateFormData({ packages: packages.filter((pkg) => pkg.id !== id) });
  };

  const updatePackage = (id: string, field: keyof Package, value: string | number | boolean) => {
    updateFormData({
      packages: packages.map((pkg) =>
        pkg.id === id ? { ...pkg, [field]: value } : pkg
      ),
    });
  };

  return (
    <Card
      style={{
        padding: 'var(--ds-spacing-6)',
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
        {/* Header */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-3)',
              marginBottom: 'var(--ds-spacing-2)',
            }}
          >
            <CreditCardIcon
              style={{
                width: '2rem',
                height: '2rem',
                color: 'var(--ds-color-accent-text-default)',
              }}
              aria-hidden="true"
            />
            <Heading level={2} data-size="md" style={{ margin: 0 }}>
              {t('wizard.step.packages')}
            </Heading>
          </div>
          <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            {t('rentalObjects.packagesDescription')}
          </Paragraph>
        </div>

        {/* Error Display */}
        {currentStepErrors.length > 0 && (
          <Alert severity="danger">
            <ul style={{ margin: 0, paddingLeft: 'var(--ds-spacing-4)' }}>
              {currentStepErrors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Packages List */}
        {packages.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
            {packages.map((pkg, index) => (
              <div
                key={pkg.id}
                style={{
                  padding: 'var(--ds-spacing-5)',
                  backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
                  border: '1px solid var(--ds-color-neutral-border-subtle)',
                  borderRadius: 'var(--ds-border-radius-md)',
                }}
              >
                {/* Package Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--ds-spacing-4)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                    <Badge color="info" size="sm">
                      {t('form.packages.package')} {index + 1}
                    </Badge>
                    {pkg.includedInBasePrice && (
                      <Badge color="success" size="sm">
                        {t('form.packages.included')}
                      </Badge>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="tertiary"
                    size="sm"
                    color="danger"
                    onClick={() => removePackage(pkg.id)}
                    aria-label={t('form.packages.removePackage')}
                  >
                    <TrashIcon
                      style={{ width: '1rem', height: '1rem' }}
                      aria-hidden="true"
                    />
                    {t('form.packages.remove')}
                  </Button>
                </div>

                {/* Package Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
                  <Textfield
                    label={t('form.packages.name')}
                    value={pkg.name}
                    onChange={(e) => updatePackage(pkg.id, 'name', e.target.value)}
                    required
                    placeholder={t('form.packages.namePlaceholder')}
                  />

                  <Textarea
                    label={t('form.packages.description')}
                    value={pkg.description}
                    onChange={(e) => updatePackage(pkg.id, 'description', e.target.value)}
                    rows={3}
                    placeholder={t('form.packages.descriptionPlaceholder')}
                  />

                  <Textfield
                    label={t('form.packages.price')}
                    type="number"
                    value={pkg.price.toString()}
                    onChange={(e) =>
                      updatePackage(pkg.id, 'price', e.target.value ? parseInt(e.target.value, 10) : 0)
                    }
                    min={0}
                    step={100}
                    placeholder="0"
                    description={t('form.packages.priceDescription')}
                  />

                  <Checkbox
                    checked={pkg.includedInBasePrice}
                    onChange={(e) => updatePackage(pkg.id, 'includedInBasePrice', e.target.checked)}
                  >
                    <span style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                      {t('form.packages.includedInBasePrice')}
                    </span>
                  </Checkbox>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: 'var(--ds-spacing-8)',
              textAlign: 'center',
              backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
              borderRadius: 'var(--ds-border-radius-md)',
              border: '1px dashed var(--ds-color-neutral-border-subtle)',
            }}
          >
            <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('form.packages.noPackages')}
            </Paragraph>
          </div>
        )}

        {/* Add Package Button */}
        <div>
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={addPackage}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-2)',
            }}
            aria-label={t('form.packages.addPackage')}
          >
            <PlusIcon
              style={{ width: '1.25rem', height: '1.25rem' }}
              aria-hidden="true"
            />
            {t('form.packages.addPackage')}
          </Button>
        </div>

        {/* Info Message */}
        <div
          style={{
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-info-surface-default)',
            borderLeft: '4px solid var(--ds-color-info-border-default)',
            borderRadius: 'var(--ds-border-radius-md)',
          }}
        >
          <Paragraph data-size="sm" style={{ margin: 0, display: 'flex', alignItems: 'flex-start', gap: 'var(--ds-spacing-2)' }}>
            <span style={{ fontSize: 'var(--ds-font-size-lg)', flexShrink: 0 }}>💡</span>
            <span>{t('rentalObjects.packagesInfo')}</span>
          </Paragraph>
        </div>
      </div>
    </Card>
  );
}
