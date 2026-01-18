import { useT } from '@xala/i18n';
import { Heading } from '@xala/ds';
import { useRentalObjectWizard } from '@/features/rental-objects/hooks/useRentalObjectWizard';
import { OpeningHoursStep } from './OpeningHoursStep';
import { ScheduleStep } from './ScheduleStep';
import { BookingStep } from './BookingStep';

interface AvailabilityStepProps {
  wizard: ReturnType<typeof useRentalObjectWizard>;
}

export function AvailabilityStep({ wizard }: AvailabilityStepProps) {
  const t = useT();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-8)' }}>
      <div>
        <Heading level={2} data-size="md" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          {t('wizard.step.availability')}
        </Heading>
      </div>

      {/* Opening Hours & Schedule are mutually exclusive mostly, but checking category or just rendering both if logic allows */}
      {/* For now we render based on current configuration logic, but since we are consolidating, we might need to conditionally render inside or just render all valid parts */}
      
      <OpeningHoursStep wizard={wizard} />
      <ScheduleStep wizard={wizard} />

      <div style={{ paddingTop: 'var(--ds-spacing-8)', borderTop: '1px solid var(--ds-color-neutral-border-default)' }}>
        <BookingStep wizard={wizard} />
      </div>
    </div>
  );
}
