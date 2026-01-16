import React from 'react';
import { Container, Tabs, TabsList, TabsTab, TabsPanel, Paragraph } from '@xala/ds';
import { useT } from '@xala/i18n';
import { /* ConsentSettings, DataSubjectRequestForm */ } from '../components';

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
            {/* TODO: Re-enable when SDK consent hooks are implemented */}
            <Paragraph>Consent settings will be available soon.</Paragraph>
          </div>
        </TabsPanel>

        <TabsPanel value="requests">
          <div style={{ marginTop: 'var(--ds-spacing-6)' }}>
            {/* TODO: Re-enable when SDK GDPR hooks are implemented */}
            <Paragraph>Data subject request form will be available soon.</Paragraph>
          </div>
        </TabsPanel>
      </Tabs>
    </Container>
  );
}
