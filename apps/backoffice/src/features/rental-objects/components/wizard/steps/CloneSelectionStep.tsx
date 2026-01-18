import { useState } from 'react';
import { useT } from '@xala/i18n';
import { Heading, Paragraph, Button, Card, Grid, PlusIcon, CopyIcon } from '@xala/ds';
import { RentalObjectsTable } from '@/features/rental-objects/components/list/RentalObjectsTable';
import type { RentalObject } from '@digilist/client-sdk/types';
import { useRentalObjects } from '@digilist/client-sdk';

interface CloneSelectionStepProps {
  onSelect: (mode: 'create' | 'clone', cloneSource?: RentalObject) => void;
}

export function CloneSelectionStep({ onSelect }: CloneSelectionStepProps) {
  const t = useT();
  const [showCloneSelector, setShowCloneSelector] = useState(false);
  
  // Fetch all rental objects (type=RESOURCE) for cloning
  const queryParams = { type: 'RESOURCE', limit: 100 } as any; 
  const { data: response, isLoading } = useRentalObjects(queryParams);
  const rentalObjects = response?.data || [];

  if (showCloneSelector) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
            <Heading level={2} data-size="md">{t('rentalObjects.clone.title')}</Heading>
            <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('rentalObjects.clone.description')}
            </Paragraph>
          </div>
          <Button variant="tertiary" onClick={() => setShowCloneSelector(false)} type="button">
            {t('action.cancel')}
          </Button>
        </div>

        <RentalObjectsTable
          items={rentalObjects || []}
          isLoading={isLoading}
          onSelectionChange={(ids) => {
            if (ids.length > 0 && rentalObjects) {
              const selected = rentalObjects.find(r => r.id === ids[0]);
              if (selected) {
                 onSelect('clone', selected);
              }
            }
          }}
          // Simplified table props for selection mode could be added here if Table separate props were supported
          // For now we rely on row click or selection handling
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-8)' }}>
      <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <Heading level={2} data-size="lg">{t('rentalObjects.wizard.welcome')}</Heading>
        <Paragraph data-size="lg" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('rentalObjects.wizard.welcomeDescription')}
        </Paragraph>
      </div>

      <Grid columns="repeat(auto-fit, minmax(300px, 1fr))" gap="var(--ds-spacing-6)">
        {/* Create New */}
        <Card
          style={{
            cursor: 'pointer',
            transition: 'border-color 0.2s',
            height: '100%',
          }}
          onClick={() => onSelect('create')}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--ds-color-accent-border-default)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--ds-color-neutral-border-default)'}
        >
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--ds-border-radius-full)',
                backgroundColor: 'var(--ds-color-accent-surface-subtle)',
                color: 'var(--ds-color-accent-text-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PlusIcon size={24} />
            </div>
            <div>
              <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-1)' }}>
                {t('rentalObjects.wizard.startScratch')}
              </Heading>
              <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                {t('rentalObjects.wizard.startScratchDescription')}
              </Paragraph>
            </div>
          </div>
        </Card>

        {/* Clone */}
        <Card
          style={{
            cursor: 'pointer',
            transition: 'border-color 0.2s',
            height: '100%',
          }}
          onClick={() => setShowCloneSelector(true)}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--ds-color-accent-border-default)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--ds-color-neutral-border-default)'}
        >
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--ds-border-radius-full)',
                backgroundColor: 'var(--ds-color-success-surface-subtle)',
                color: 'var(--ds-color-success-text-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CopyIcon size={24} />
            </div>
            <div>
              <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-1)' }}>
                {t('rentalObjects.wizard.clone')}
              </Heading>
              <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                {t('rentalObjects.wizard.cloneDescription')}
              </Paragraph>
            </div>
          </div>
        </Card>
      </Grid>
    </div>
  );
}
