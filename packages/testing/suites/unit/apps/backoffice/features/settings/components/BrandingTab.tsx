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
import { useBrandingSettings } from '@digilist/api/hooks/useBrandingSettings';
import { useT } from '@xala/i18n';

export function BrandingTab() {
  // Translation function available for future localization
  const _t = useT(); // eslint-disable-line @typescript-eslint/no-unused-vars
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
            label="Logo URL"
            description="URL til logo (vil vises i toppen av siden)"
          >
            <Textfield
              aria-label="Logo URL"
              value={brandingData.logo}
              onChange={(e) => updateField('logo', e.target.value)}
              placeholder="https://example.com/logo.png"
            />
          </FormField>

          <FormField
            label="Primærfarge"
            description="Hovedfarge for knapper og UI-elementer"
          >
            <Textfield
              aria-label="Primærfarge"
              value={brandingData.primaryColor}
              onChange={(e) => updateField('primaryColor', e.target.value)}
            />
          </FormField>

          <FormField
            label="Sekundærfarge"
            description="Farge for mindre fremtredende elementer"
          >
            <Textfield
              aria-label="Sekundærfarge"
              value={brandingData.secondaryColor}
              onChange={(e) => updateField('secondaryColor', e.target.value)}
            />
          </FormField>

          <FormField
            label="Favicon URL"
            description="URL til favicon (vises i nettleserens fane)"
          >
            <Textfield
              aria-label="Favicon URL"
              value={brandingData.favicon}
              onChange={(e) => updateField('favicon', e.target.value)}
              placeholder="https://example.com/favicon.ico"
            />
          </FormField>
        </Stack>

        <div style={{ paddingTop: 'var(--ds-spacing-3)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)' }}>
          <Button onClick={saveBrandingSettings} disabled={isSaving} type="button" aria-label="Lagre endringer">
            <SaveIcon />
            {isSaving ? 'Lagrer...' : 'Lagre endringer'}
          </Button>
        </div>
      </Stack>
    </Card>
  );
}
