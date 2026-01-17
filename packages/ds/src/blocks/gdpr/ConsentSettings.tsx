/**
 * ConsentSettings Component
 * 
 * GDPR consent management settings page that displays all consent types
 * and allows users to manage their consent preferences.
 * 
 * This component is reusable across all apps (web, minside, etc.)
 * and follows the SDK-first architecture pattern.
 */

import React from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Stack,
  Switch,
  Alert,
  Spinner,
  Badge,
} from '@xala/ds';
import { useT } from '@xala/i18n';
import {
  useConsentTypes,
  useMyConsents,
  useGrantConsent,
} from '@digilist/client-sdk/hooks';
import type { ConsentTypeDTO, UserConsentSummaryDTO } from '@digilist/client-sdk/types';

export function ConsentSettings() {
  const t = useT();
  const { data: consentTypesData, isLoading: isLoadingTypes } = useConsentTypes();
  const { data: myConsentsData, isLoading: isLoadingConsents } = useMyConsents();
  const { mutate: grantConsent, isPending } = useGrantConsent();

  const consentTypes = consentTypesData?.data || [];
  const myConsents = myConsentsData?.data || [];

  const isLoading = isLoadingTypes || isLoadingConsents;

  const getConsentStatus = (consentTypeId: string): boolean => {
    const userConsent = myConsents.find((c) => c.consentTypeId === consentTypeId);
    return userConsent?.granted ?? false;
  };

  const getConsentVersion = (consentTypeId: string): number | undefined => {
    const userConsent = myConsents.find((c) => c.consentTypeId === consentTypeId);
    return userConsent?.version;
  };

  const handleToggle = (consent: ConsentTypeDTO, granted: boolean) => {
    if (consent.required && !granted) {
      // Cannot revoke required consent
      return;
    }

    grantConsent({
      consentTypeId: consent.id,
      granted,
      source: 'web',
    });
  };

  if (isLoading) {
    return (
      <Stack direction="column" gap="24px" style={{ alignItems: 'center', padding: '48px' }}>
        <Spinner size="lg" />
        <Paragraph>{t('common.loading')}</Paragraph>
      </Stack>
    );
  }

  const renderConsentCard = (consent: ConsentTypeDTO) => {
    const isGranted = getConsentStatus(consent.id);
    const version = getConsentVersion(consent.id);
    const isOutdated = version !== undefined && version < consent.version;

    return (
      <Card key={consent.id}>
        <Stack direction="column" gap="16px">
          <Stack direction="row" gap="12px" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Stack direction="column" gap="8px" style={{ flex: 1 }}>
              <Stack direction="row" gap="8px" style={{ alignItems: 'center' }}>
                <Heading size="sm">{consent.name}</Heading>
                {consent.required && (
                  <Badge color="info" size="sm">
                    {t('gdpr.required')}
                  </Badge>
                )}
                {isOutdated && (
                  <Badge color="warning" size="sm">
                    {t('gdpr.outdatedVersion')}
                  </Badge>
                )}
              </Stack>
              <Paragraph size="sm">{consent.description}</Paragraph>
              {consent.legalBasis && (
                <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {t('gdpr.legalBasis')}: {t(`gdpr.legalBasisTypes.${consent.legalBasis}`)}
                </Paragraph>
              )}
            </Stack>
            <Switch
              checked={isGranted}
              onChange={(e) => handleToggle(consent, e.target.checked)}
              disabled={isPending || (consent.required && isGranted)}
              aria-label={t('gdpr.toggleConsent', { name: consent.name })}
            />
          </Stack>

          {isOutdated && (
            <Alert severity="warning" size="sm">
              {t('gdpr.versionMismatch', {
                current: version,
                latest: consent.version,
              })}
            </Alert>
          )}

          {consent.required && isGranted && (
            <Paragraph size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('gdpr.cannotRevokeRequired')}
            </Paragraph>
          )}
        </Stack>
      </Card>
    );
  };

  const requiredConsents = consentTypes.filter((c) => c.required);
  const optionalConsents = consentTypes.filter((c) => !c.required);

  return (
    <Stack direction="column" gap="32px">
      <Stack direction="column" gap="16px">
        <Heading size="lg">{t('gdpr.settings.title')}</Heading>
        <Paragraph>{t('gdpr.settings.description')}</Paragraph>
      </Stack>

      {requiredConsents.length > 0 && (
        <Stack direction="column" gap="16px">
          <Heading size="md">{t('gdpr.settings.requiredConsents')}</Heading>
          <Stack direction="column" gap="12px">
            {requiredConsents.map(renderConsentCard)}
          </Stack>
        </Stack>
      )}

      {optionalConsents.length > 0 && (
        <Stack direction="column" gap="16px">
          <Heading size="md">{t('gdpr.settings.optionalConsents')}</Heading>
          <Stack direction="column" gap="12px">
            {optionalConsents.map(renderConsentCard)}
          </Stack>
        </Stack>
      )}

      <Alert severity="info">
        {t('gdpr.settings.privacyPolicyLink')}
      </Alert>
    </Stack>
  );
}
