/**
 * ConsentPopup Component
 * 
 * GDPR consent management popup dialog that displays required and optional
 * consent types and allows users to grant or deny consent.
 * 
 * This component is reusable across all apps (web, minside, etc.)
 * and follows the SDK-first architecture pattern.
 */

import React, { useEffect, useRef } from 'react';
import {
  Heading,
  Paragraph,
  Button,
  Stack,
  Checkbox,
  Alert,
} from '@xala/ds';
import { useT } from '@xala/i18n';
import {
  useShowConsentPopup,
  usePendingRequiredConsents,
  useGrantMultipleConsents,
  useConsentTypes,
} from '@digilist/client-sdk/hooks';
import type { ConsentTypeDTO } from '@digilist/client-sdk/types';

interface ConsentState {
  [consentTypeId: string]: boolean;
}

export function ConsentPopup() {
  const t = useT();
  const { shouldShow } = useShowConsentPopup();
  const { pendingConsents } = usePendingRequiredConsents();
  const { data: consentTypesData } = useConsentTypes();
  const { mutate: grantConsents, isPending } = useGrantMultipleConsents();

  const [consentState, setConsentState] = React.useState<ConsentState>({});
  const [showError, setShowError] = React.useState(false);

  const allConsentTypes = consentTypesData?.data || [];
  const requiredConsents = allConsentTypes.filter((c) => c.required);
  const optionalConsents = allConsentTypes.filter((c) => !c.required);

  if (!shouldShow || pendingConsents.length === 0) {
    return null;
  }

  const handleConsentChange = (consentTypeId: string, granted: boolean) => {
    setConsentState((prev) => ({
      ...prev,
      [consentTypeId]: granted,
    }));
    setShowError(false);
  };

  const handleAcceptRequired = () => {
    const allRequiredAccepted = requiredConsents.every(
      (c) => consentState[c.id] === true
    );

    if (!allRequiredAccepted) {
      setShowError(true);
      return;
    }

    grantConsents({
      consents: allConsentTypes.map((c) => ({
        consentTypeId: c.id,
        granted: consentState[c.id] === true,
        source: 'web',
      })),
    });
  };

  const handleAcceptAll = () => {
    grantConsents({
      consents: allConsentTypes.map((c) => ({
        consentTypeId: c.id,
        granted: true,
        source: 'web',
      })),
    });
  };

  const renderConsentItem = (consent: ConsentTypeDTO) => {
    const isChecked = consentState[consent.id] === true;

    return (
      <Stack key={consent.id} direction="column" gap="8px">
        <Checkbox
          checked={isChecked}
          onChange={(e) => handleConsentChange(consent.id, e.target.checked)}
          disabled={isPending}
        >
          <Stack direction="column" gap="4px">
            <strong>
              {consent.name}
              {consent.required && (
                <span style={{ color: 'var(--ds-color-danger-text-default)' }}>
                  {' '}
                  *
                </span>
              )}
            </strong>
            <Paragraph size="sm">{consent.description}</Paragraph>
            {consent.legalBasis && (
              <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                {t('gdpr.legalBasis')}: {t(`gdpr.legalBasisTypes.${consent.legalBasis}`)}
              </Paragraph>
            )}
          </Stack>
        </Checkbox>
      </Stack>
    );
  };

  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
    }
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="consent-dialog-title"
      style={{
        padding: 'var(--ds-spacing-6)',
        borderRadius: 'var(--ds-border-radius-md)',
        border: 'none',
        boxShadow: 'var(--ds-shadow-xl)',
        maxWidth: '600px',
        width: '90vw',
      }}
    >
      <Stack direction="column" gap="24px">
        <Heading id="consent-dialog-title" size="lg">
          {t('gdpr.consentPopup.title')}
        </Heading>

        <Paragraph>{t('gdpr.consentPopup.description')}</Paragraph>

        {showError && (
          <Alert severity="danger">
            {t('gdpr.consentPopup.requiredError')}
          </Alert>
        )}

        {requiredConsents.length > 0 && (
          <Stack direction="column" gap="16px">
            <Heading size="sm">{t('gdpr.consentPopup.requiredConsents')}</Heading>
            {requiredConsents.map(renderConsentItem)}
          </Stack>
        )}

        {optionalConsents.length > 0 && (
          <Stack direction="column" gap="16px">
            <Heading size="sm">{t('gdpr.consentPopup.optionalConsents')}</Heading>
            {optionalConsents.map(renderConsentItem)}
          </Stack>
        )}

        <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('gdpr.consentPopup.manageInfo')}
        </Paragraph>

        <Stack direction="row" gap="12px" style={{ justifyContent: 'flex-end' }}>
          <Button
            variant="secondary"
            onClick={handleAcceptRequired}
            disabled={isPending}
          >
            {t('gdpr.consentPopup.acceptRequired')}
          </Button>
          <Button
            variant="primary"
            onClick={handleAcceptAll}
            disabled={isPending}
          >
            {t('gdpr.consentPopup.acceptAll')}
          </Button>
        </Stack>
      </Stack>
    </dialog>
  );
}
