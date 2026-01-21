import { useT } from '@xalatechnologies/platform/i18n';
import { Heading, Paragraph, Card, CalendarIcon, ClockIcon } from '@xalatechnologies/platform/ui';
import { useRentalObjectWizard } from '@/features/rental-objects/hooks/useRentalObjectWizard';
import { OpeningHoursStep } from './OpeningHoursStep';
import { ScheduleStep } from './ScheduleStep';

interface AvailabilityStepProps {
  wizard: ReturnType<typeof useRentalObjectWizard>;
}

export function AvailabilityStep({ wizard }: AvailabilityStepProps) {
  const t = useT();
  const category = wizard.formData.category;
  const isVenue = category === 'LOKALER_OG_BANER';
  const isEvent = category === 'OPPLEVELSER_OG_ARRANGEMENT';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <Card style={{ 
        padding: 'var(--ds-spacing-6)', 
        background: 'linear-gradient(135deg, var(--ds-color-brand-1-surface-default) 0%, var(--ds-color-brand-1-surface-hover) 100%)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)', marginBottom: 'var(--ds-spacing-2)' }}>
          <CalendarIcon style={{ width: '1.5rem', height: '1.5rem', color: 'var(--ds-color-brand-1-text-default)' }} />
          <Heading level={2} data-size="md" style={{ margin: 0 }}>
            {t('wizard.step.availability')}
          </Heading>
        </div>
        <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
          {isVenue 
            ? 'Sett opp åpningstider for lokalet ditt. Brukere kan kun booke innenfor disse tidene.'
            : isEvent 
              ? 'Konfigurer tidspunktene når opplevelsen eller arrangementet er tilgjengelig.'
              : 'Definer når utstyret er tilgjengelig for utleie.'}
        </Paragraph>
      </Card>

      {/* Quick Tips */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: 'var(--ds-spacing-3)' 
      }}>
        <div style={{ 
          padding: 'var(--ds-spacing-4)', 
          backgroundColor: 'var(--ds-color-info-surface-default)',
          borderRadius: 'var(--ds-border-radius-md)',
          borderLeft: '4px solid var(--ds-color-info-border-default)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-1)' }}>
            <ClockIcon style={{ width: '1rem', height: '1rem' }} />
            <strong style={{ fontSize: '0.875rem' }}>Tips</strong>
          </div>
          <Paragraph data-size="sm" style={{ margin: 0 }}>
            Bruk "Kopier fra mandag" for å spare tid når du setter opp like åpningstider.
          </Paragraph>
        </div>
        
        <div style={{ 
          padding: 'var(--ds-spacing-4)', 
          backgroundColor: 'var(--ds-color-success-surface-default)',
          borderRadius: 'var(--ds-border-radius-md)',
          borderLeft: '4px solid var(--ds-color-success-border-default)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-1)' }}>
            <CalendarIcon style={{ width: '1rem', height: '1rem' }} />
            <strong style={{ fontSize: '0.875rem' }}>Fleksibilitet</strong>
          </div>
          <Paragraph data-size="sm" style={{ margin: 0 }}>
            Du kan alltid endre tilgjengeligheten senere fra detaljsiden.
          </Paragraph>
        </div>
      </div>

      {/* Opening Hours - for venues and equipment */}
      <OpeningHoursStep wizard={wizard} />
      
      {/* Schedule - for events and experiences */}
      <ScheduleStep wizard={wizard} />
    </div>
  );
}
