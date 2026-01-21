import { useT } from '@xala/i18n';
import { Heading } from '@xalatechnologies/platform/ui';
import { useRentalObjectWizard } from '@/features/rental-objects/hooks/useRentalObjectWizard';
import { InventoryStep } from './InventoryStep';
import { PickupStep } from './PickupStep';
import { RequirementsStep } from './RequirementsStep';

interface ResourcesStepProps {
  wizard: ReturnType<typeof useRentalObjectWizard>;
}

export function ResourcesStep({ wizard }: ResourcesStepProps) {
  const t = useT();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-8)' }}>
      <div>
        <Heading level={2} data-size="md" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          {t('wizard.step.resources')}
        </Heading>
      </div>

      <InventoryStep wizard={wizard} />

      <div style={{ paddingTop: 'var(--ds-spacing-8)', borderTop: '1px solid var(--ds-color-neutral-border-default)' }}>
        <PickupStep wizard={wizard} />
      </div>

      <div style={{ paddingTop: 'var(--ds-spacing-8)', borderTop: '1px solid var(--ds-color-neutral-border-default)' }}>
        <RequirementsStep wizard={wizard} />
      </div>
    </div>
  );
}
