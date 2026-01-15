import React from 'react';
import { Container, Tabs, TabsList, TabsTab, TabsPanel } from '@xala/ds';
import { useT } from '@xala/i18n';
import { ConsentSettings, DataSubjectRequestForm } from '../components';

export function PrivacySettingsPage() {
  const t = useT();
  const [activeTab, setActiveTab] = React.useState('consents');

  return (
    <Container maxWidth="1200px" style={{ padding: 'var(--ds-spacing-6) var(--ds-spacing-4)' }}>
      <Tabs value={activeTab} onChange={setActiveTab}>
        <TabsList aria-label={t('gdpr.settings.tabsLabel')}>
          <TabsTab value="consents">{t('gdpr.settings.consentsTab')}</TabsTab>
          <TabsTab value="requests">{t('gdpr.settings.requestsTab')}</TabsTab>
        </TabsList>

        <TabsPanel value="consents">
          <div style={{ marginTop: 'var(--ds-spacing-6)' }}>
            <ConsentSettings />
          </div>
        </TabsPanel>

        <TabsPanel value="requests">
          <div style={{ marginTop: 'var(--ds-spacing-6)' }}>
            <DataSubjectRequestForm />
          </div>
        </TabsPanel>
      </Tabs>
    </Container>
  );
}
