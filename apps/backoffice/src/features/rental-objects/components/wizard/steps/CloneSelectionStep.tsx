import { useState } from 'react';
import { useT } from '@xala/i18n';
import { Heading, Paragraph, Button, Card, Grid, Stack, Center, PlusIcon, CopyIcon } from '@xala/ds';
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
      <Stack direction="vertical" gap="lg">
        <Stack direction="horizontal" justify="between" align="center">
          <Stack direction="vertical" gap="xs">
            <Heading level={2} data-size="md">{t('rentalObjects.clone.title')}</Heading>
            <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('rentalObjects.clone.description')}
            </Paragraph>
          </Stack>
          <Button variant="tertiary" onClick={() => setShowCloneSelector(false)} type="button">
            {t('action.cancel')}
          </Button>
        </Stack>

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
        />
      </Stack>
    );
  }

  return (
    <Stack direction="vertical" gap="xl">
      <Center style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <Stack direction="vertical" gap="sm" align="center">
          <Heading level={2} data-size="lg">{t('rentalObjects.wizard.welcome')}</Heading>
          <Paragraph data-size="lg" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
            {t('rentalObjects.wizard.welcomeDescription')}
          </Paragraph>
        </Stack>
      </Center>

      <Grid cols={{ base: 1, md: 2 }} gap="lg" autoFit minColWidth="300px">
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
          <Stack direction="vertical" gap="md" align="start" style={{ height: '100%' }}>
            <Center
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--ds-border-radius-full)',
                backgroundColor: 'var(--ds-color-accent-surface-subtle)',
                color: 'var(--ds-color-accent-text-default)',
              }}
            >
              <PlusIcon size={24} />
            </Center>
            <Stack direction="vertical" gap="xs">
              <Heading level={3} data-size="sm">
                {t('rentalObjects.wizard.startScratch')}
              </Heading>
              <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                {t('rentalObjects.wizard.startScratchDescription')}
              </Paragraph>
            </Stack>
          </Stack>
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
          <Stack direction="vertical" gap="md" align="start" style={{ height: '100%' }}>
            <Center
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--ds-border-radius-full)',
                backgroundColor: 'var(--ds-color-success-surface-subtle)',
                color: 'var(--ds-color-success-text-default)',
              }}
            >
              <CopyIcon size={24} />
            </Center>
            <Stack direction="vertical" gap="xs">
              <Heading level={3} data-size="sm">
                {t('rentalObjects.wizard.clone')}
              </Heading>
              <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                {t('rentalObjects.wizard.cloneDescription')}
              </Paragraph>
            </Stack>
          </Stack>
        </Card>
      </Grid>
    </Stack>
  );
}
