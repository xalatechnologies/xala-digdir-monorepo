import React from 'react';
import { Container, Tabs, TabList, Tab, TabPanel, Stack, Heading } from '@xala/ds';
import { useT } from '@xala/i18n';
import { ConsentSettings, DataSubjectRequestForm } from '../components';

export function PrivacyPage() {
  const t = useT();
  const [activeTab, setActiveTab] = React.useState('consents');

  return (
    <Container maxWidth="1200px" style={{ padding: 'var(--ds-spacing-6) var(--ds-spacing-4)' }}>
      <Stack direction="column" gap="24px">
        <Heading size="xl">{t('gdpr.privacy.title')}</Heading>

        <Tabs value={activeTab} onChange={setActiveTab}>
          <TabList aria-label={t('gdpr.settings.tabsLabel')}>
            <Tab value="consents">{t('gdpr.settings.consentsTab')}</Tab>
            <Tab value="requests">{t('gdpr.settings.requestsTab')}</Tab>
          </TabList>

          <TabPanel value="consents">
            <div style={{ marginTop: 'var(--ds-spacing-6)' }}>
              <ConsentSettings />
            </div>
          </TabPanel>

          <TabPanel value="requests">
            <div style={{ marginTop: 'var(--ds-spacing-6)' }}>
              <DataSubjectRequestForm />
            </div>
          </TabPanel>
        </Tabs>
      </Stack>
    </Container>
  );
}
