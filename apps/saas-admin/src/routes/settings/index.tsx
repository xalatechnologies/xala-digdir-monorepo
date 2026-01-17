/**
 * Settings Page - SaaS Admin
 * Platform-wide configuration and settings
 */

import {
  Card,
  Heading,
  Paragraph,
  Stack,
} from '@xala/ds';
import { useT } from '@xala/i18n';

export function SettingsPage() {
  const t = useT();

  return (
    <Stack direction="column" gap={20}>
      {/* Header */}
      <Stack direction="column" gap={1}>
        <Heading level={2} data-size="md">
          {t('saasAdmin.nav.settings')}
        </Heading>
        <Paragraph data-size="sm" data-color="subtle">
          {t('saasAdmin.nav.settingsDesc')}
        </Paragraph>
      </Stack>

      {/* Settings Content */}
      <Card>
        <Stack direction="column" gap={4}>
          <Heading level={3} data-size="sm" style={{ margin: 0 }}>
            {t('saasAdmin.settings.platformConfig', { defaultValue: 'Platform Configuration' })}
          </Heading>
          <Paragraph data-size="sm" data-color="subtle">
            {t('saasAdmin.settings.comingSoon', { defaultValue: 'Settings management will be available soon.' })}
          </Paragraph>
        </Stack>
      </Card>
    </Stack>
  );
}

export default SettingsPage;
