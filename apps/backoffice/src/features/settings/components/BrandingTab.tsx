/**
 * BrandingTab Component
 * Manages branding and visual customization settings including logo, colors, and favicon
 */

import {
  Card,
  Heading,
  Paragraph,
  Button,
  Stack,
  FormField,
  Textfield,
  SaveIcon,
} from '@xalatechnologies/platform/ui';
import { useBrandingSettings } from '../hooks/useBrandingSettings';
import { useT } from '@xalatechnologies/platform/i18n';

export function BrandingTab() {
  const t = useT();
  const {
    brandingData,
    updateField,
    saveBrandingSettings,
    isSaving,
  } = useBrandingSettings();

  return (
    <Card>
      <Stack spacing={5}>
        <div>
          <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
            Visuell profil
          </Heading>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
            Tilpass utseende og merkevare
          </Paragraph>
        </div>

        <Stack spacing={4}>
          <FormField
            label={t('common.logo_url')}
            description={t('common.url_til_logo_vil')}
          >
            <Textfield
              aria-label={t('common.logo_url')}
              value={brandingData.logo}
              onChange={(e) => updateField('logo', e.target.value)}
              placeholder={t('settings.placeholder.httpsexamplecomlogopng')}
            />
          </FormField>

          <FormField
            label={t('common.primaerfarge')}
            description={t('common.hovedfarge_for_knapper_og')}
          >
            <Textfield
              aria-label={t('common.primaerfarge')}
              value={brandingData.primaryColor}
              onChange={(e) => updateField('primaryColor', e.target.value)}
            />
          </FormField>

          <FormField
            label={t('common.sekundaerfarge')}
            description={t('common.farge_for_mindre_fremtredende')}
          >
            <Textfield
              aria-label={t('common.sekundaerfarge')}
              value={brandingData.secondaryColor}
              onChange={(e) => updateField('secondaryColor', e.target.value)}
            />
          </FormField>

          <FormField
            label={t('common.favicon_url')}
            description={t('common.url_til_favicon_vises')}
          >
            <Textfield
              aria-label={t('common.favicon_url')}
              value={brandingData.favicon}
              onChange={(e) => updateField('favicon', e.target.value)}
              placeholder={t('settings.placeholder.httpsexamplecomfaviconico')}
            />
          </FormField>
        </Stack>

        <div style={{ paddingTop: 'var(--ds-spacing-3)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)' }}>
          <Button onClick={saveBrandingSettings} disabled={isSaving} type="button" aria-label={t('common.lagre_endringer')}>
            <SaveIcon />
            {isSaving ? t('state.saving') : 'Lagre endringer'}
          </Button>
        </div>
      </Stack>
    </Card>
  );
}
