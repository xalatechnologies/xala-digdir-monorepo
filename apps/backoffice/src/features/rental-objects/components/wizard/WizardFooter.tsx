/**
 * WizardFooter
 * Navigation footer for the rental object wizard with prev/next/save/publish actions
 */

import { useT } from '@xala/i18n';
import { Button, Stack, Spinner } from '@xala/ds';
import type { UseRentalObjectWizardReturn } from '../../hooks/useRentalObjectWizard';

export interface WizardFooterProps {
  wizard: UseRentalObjectWizardReturn;
}

export function WizardFooter({ wizard }: WizardFooterProps) {
  const t = useT();

  const {
    canGoPrev,
    canGoNext,
    isLastStep,
    isSaving,
    prevStep,
    nextStep,
    saveDraft,
    publish,
    cancel,
  } = wizard;

  return (
    <div
      style={{
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
        borderTop: '1px solid var(--ds-color-neutral-border-default)',
        padding: 'var(--ds-spacing-6) var(--ds-spacing-8)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 'var(--ds-spacing-4)',
      }}
    >
      {/* Left Side - Cancel Button */}
      <Button
        variant="tertiary"
        onClick={cancel}
        disabled={isSaving} type="button"
      >
        {t('common.cancel')}
      </Button>

      {/* Center - Step Navigation */}
      <Stack direction="row" gap={3} align="center">
        {/* Previous Button */}
        <Button
          variant="secondary"
          onClick={prevStep}
          disabled={!canGoPrev || isSaving} type="button"
        >
          {t('wizard.goToPreviousStep')}
        </Button>

        {/* Next Button */}
        {!isLastStep && (
          <Button
            variant="primary"
            onClick={nextStep}
            disabled={!canGoNext || isSaving} type="button"
          >
            {isSaving ? (
              <Stack direction="row" gap={2} align="center">
                <Spinner size="sm" />
                {t('common.loading')}
              </Stack>
            ) : (
              t('wizard.goToNextStep')
            )}
          </Button>
        )}
      </Stack>

      {/* Right Side - Save/Publish Actions */}
      <Stack direction="row" gap={3}>
        {/* Save Draft Button */}
        <Button
          variant="secondary"
          onClick={saveDraft}
          disabled={isSaving} type="button"
        >
          {isSaving ? (
            <Stack direction="row" gap={2} align="center">
              <Spinner size="sm" />
              {t('common.loading')}
            </Stack>
          ) : (
            t('wizard.saveDraft')
          )}
        </Button>

        {/* Publish Button (only on last step) */}
        {isLastStep && (
          <Button
            variant="primary"
            onClick={publish}
            disabled={isSaving} type="button"
          >
            {isSaving ? (
              <Stack direction="row" gap={2} align="center">
                <Spinner size="sm" />
                {t('common.loading')}
              </Stack>
            ) : (
              t('wizard.saveAndPublish')
            )}
          </Button>
        )}
      </Stack>
    </div>
  );
}
