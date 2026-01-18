/**
 * Translations Management Page
 * 
 * SaaS Admin page for managing i18n translations.
 * Supports viewing, editing, and exporting translations by namespace.
 */
import React, { useState, useMemo } from 'react';
import {
  Heading,
  Paragraph,
  Card,
  Button,
  Textfield,
  NativeSelect,
  Table,
  Tag,
  Dialog,
} from '@digdir/designsystemet-react';
import { useT } from '@xala/i18n';

// Namespace definitions
const NAMESPACES = [
  { value: 'common', label: 'Common', count: 861 },
  { value: 'auth', label: 'Authentication', count: 69 },
  { value: 'bookings', label: 'Bookings', count: 83 },
  { value: 'calendar', label: 'Calendar', count: 25 },
  { value: 'help', label: 'Help', count: 145 },
  { value: 'nav', label: 'Navigation', count: 78 },
  { value: 'organizations', label: 'Organizations', count: 94 },
  { value: 'payment', label: 'Payment', count: 21 },
  { value: 'saasAdmin', label: 'SaaS Admin', count: 427 },
  { value: 'seasons', label: 'Seasons', count: 90 },
  { value: 'settings', label: 'Settings', count: 173 },
  { value: 'tenantAdmin', label: 'Tenant Admin', count: 203 },
  { value: 'form', label: 'Form', count: 175 },
  { value: 'docs', label: 'Documentation', count: 110 },
  { value: 'security', label: 'Security', count: 94 },
  { value: 'rentalObjects', label: 'Rental Objects', count: 67 },
  { value: 'integrations', label: 'Integrations', count: 74 },
  { value: 'misc', label: 'Miscellaneous', count: 1633 },
] as const;

const LANGUAGES = [
  { value: 'nb', label: 'Norsk Bokmål' },
  { value: 'en', label: 'English' },
  { value: 'nn', label: 'Norsk Nynorsk' },
] as const;

interface Translation {
  id: string;
  namespace: string;
  key: string;
  language: string;
  value: string;
  isSystemDefault: boolean;
  tenantId: string | null;
}

export function TranslationsPage(): React.ReactElement {
  const t = useT();
  const [selectedNamespace, setSelectedNamespace] = useState('common');
  const [selectedLanguage, setSelectedLanguage] = useState('nb');
  const [searchQuery, setSearchQuery] = useState('');
  const [showExportDialog, setShowExportDialog] = useState(false);
  
  // Mock data - replace with API fetch
  const [translations] = useState<Translation[]>([
    { id: '1', namespace: 'common', key: 'save', language: 'nb', value: 'Lagre', isSystemDefault: true, tenantId: null },
    { id: '2', namespace: 'common', key: 'cancel', language: 'nb', value: 'Avbryt', isSystemDefault: true, tenantId: null },
    { id: '3', namespace: 'common', key: 'delete', language: 'nb', value: 'Slett', isSystemDefault: true, tenantId: null },
    { id: '4', namespace: 'payment', key: 'success', language: 'nb', value: 'Betaling vellykket!', isSystemDefault: true, tenantId: null },
    { id: '5', namespace: 'payment', key: 'failed', language: 'nb', value: 'Betaling feilet', isSystemDefault: true, tenantId: null },
  ]);
  
  const filteredTranslations = useMemo(() => {
    return translations.filter(tr => {
      const matchesNamespace = tr.namespace === selectedNamespace;
      const matchesLanguage = tr.language === selectedLanguage;
      const matchesSearch = !searchQuery || 
        tr.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tr.value.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesNamespace && matchesLanguage && matchesSearch;
    });
  }, [translations, selectedNamespace, selectedLanguage, searchQuery]);
  
  const totalKeys = useMemo(() => {
    return NAMESPACES.reduce((sum, ns) => sum + ns.count, 0);
  }, []);
  
  const handleExport = () => {
    const exportData = translations
      .filter(tr => tr.namespace === selectedNamespace && tr.language === selectedLanguage)
      .reduce((acc, tr) => {
        acc[tr.key] = tr.value;
        return acc;
      }, {} as Record<string, string>);
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedNamespace}-${selectedLanguage}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportDialog(false);
  };
  
  return (
    <div style={{ padding: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--ds-spacing-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-4)' }}>
          <div>
            <Heading level={1} data-size="lg">
              {t('saasAdmin.translations.title')}
            </Heading>
            <Paragraph data-size="md" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('saasAdmin.translations.description')}
            </Paragraph>
          </div>
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
            <Button variant="secondary" onClick={() => setShowExportDialog(true)}>
              {t('common.export')}
            </Button>
            <Button>
              {t('saasAdmin.translations.importJson')}
            </Button>
          </div>
        </div>
        
        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--ds-spacing-4)', marginTop: 'var(--ds-spacing-4)' }}>
          <Card style={{ padding: 'var(--ds-spacing-4)', textAlign: 'center' }}>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('saasAdmin.translations.totalKeys')}
            </Paragraph>
            <Heading level={2} data-size="lg">{totalKeys.toLocaleString()}</Heading>
          </Card>
          <Card style={{ padding: 'var(--ds-spacing-4)', textAlign: 'center' }}>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('saasAdmin.translations.namespaces')}
            </Paragraph>
            <Heading level={2} data-size="lg">{NAMESPACES.length}</Heading>
          </Card>
          <Card style={{ padding: 'var(--ds-spacing-4)', textAlign: 'center' }}>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('saasAdmin.translations.languages')}
            </Paragraph>
            <Heading level={2} data-size="lg">{LANGUAGES.length}</Heading>
          </Card>
        </div>
        
        {/* Filters */}
        <Card style={{ padding: 'var(--ds-spacing-4)', marginTop: 'var(--ds-spacing-4)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 'var(--ds-spacing-4)', alignItems: 'end' }}>
            <div>
              <label htmlFor="namespace-select" style={{ display: 'block', marginBottom: 'var(--ds-spacing-1)', fontWeight: 500 }}>
                {t('saasAdmin.translations.namespace')}
              </label>
              <NativeSelect
                id="namespace-select"
                value={selectedNamespace}
                onChange={(e) => setSelectedNamespace(e.target.value)}
              >
                {NAMESPACES.map(ns => (
                  <option key={ns.value} value={ns.value}>
                    {ns.label} ({ns.count})
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div>
              <label htmlFor="language-select" style={{ display: 'block', marginBottom: 'var(--ds-spacing-1)', fontWeight: 500 }}>
                {t('saasAdmin.translations.language')}
              </label>
              <NativeSelect
                id="language-select"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div>
              <Textfield
                label={t('common.search')}
                placeholder={t('saasAdmin.translations.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </Card>
        
        {/* Translations Table */}
        <Card style={{ padding: 'var(--ds-spacing-4)', marginTop: 'var(--ds-spacing-4)' }}>
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>{t('saasAdmin.translations.key')}</Table.HeaderCell>
                <Table.HeaderCell>{t('saasAdmin.translations.value')}</Table.HeaderCell>
                <Table.HeaderCell>{t('saasAdmin.translations.source')}</Table.HeaderCell>
                <Table.HeaderCell>{t('common.actions')}</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {filteredTranslations.map(translation => (
                <Table.Row key={translation.id}>
                  <Table.Cell>
                    <code style={{ 
                      fontSize: 'var(--ds-font-size-sm)',
                      backgroundColor: 'var(--ds-color-neutral-background-subtle)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}>
                      {translation.key}
                    </code>
                  </Table.Cell>
                  <Table.Cell>{translation.value}</Table.Cell>
                  <Table.Cell>
                    <Tag 
                      color={translation.isSystemDefault ? 'neutral' : 'info'}
                      data-size="sm"
                    >
                      {translation.isSystemDefault 
                        ? t('saasAdmin.translations.systemDefault')
                        : t('saasAdmin.translations.tenantOverride')
                      }
                    </Tag>
                  </Table.Cell>
                  <Table.Cell>
                    <Button variant="tertiary" data-size="sm">
                      {t('common.edit')}
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          
          {filteredTranslations.length === 0 && (
            <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
              <Paragraph>{t('common.noResults')}</Paragraph>
            </div>
          )}
        </Card>
      </div>
      
      {/* Export Dialog */}
      <Dialog.Root open={showExportDialog} onOpenChange={setShowExportDialog}>
        <Dialog.Content>
          <Dialog.Header>{t('saasAdmin.translations.exportTitle')}</Dialog.Header>
          <Dialog.Description>
            {t('saasAdmin.translations.exportDescription', {
              namespace: selectedNamespace,
              language: selectedLanguage,
            })}
          </Dialog.Description>
          <Dialog.Footer>
            <Button variant="secondary" onClick={() => setShowExportDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleExport}>
              {t('common.export')}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}

export default TranslationsPage;
