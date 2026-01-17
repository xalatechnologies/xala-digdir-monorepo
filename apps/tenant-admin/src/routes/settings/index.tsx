/**
 * Settings Page - Tenant Admin
 * General tenant settings and configuration
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
          {t('tenantAdmin.nav.settings', { defaultValue: 'Settings' })}
        </Heading>
        <Paragraph data-size="sm" data-color="subtle">
          {t('tenantAdmin.nav.settingsDesc', { defaultValue: 'Manage tenant settings and configuration' })}
        </Paragraph>
      </Stack>

      {/* Settings Content */}
      <Card>
        <Stack direction="column" gap={4}>
          <Heading level={3} data-size="sm" style={{ margin: 0 }}>
            {t('tenantAdmin.settings.general', { defaultValue: 'General Settings' })}
          </Heading>
          <Paragraph data-size="sm" data-color="subtle">
            {t('tenantAdmin.settings.comingSoon', { defaultValue: 'Settings management will be available soon.' })}
          </Paragraph>
        </Stack>
      </Card>
    </Stack>
  );
}

export default SettingsPage;
