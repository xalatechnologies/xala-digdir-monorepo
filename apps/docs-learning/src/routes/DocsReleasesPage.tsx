/**
 * Docs Releases Page - Changelog/release notes
 */

import { Heading, Paragraph, Card, Badge } from '@xalatechnologies/platform/ui';
import { useT } from '@xalatechnologies/platform/i18n';

// Release data with i18n key references
const RELEASES = [
  {
    version: 'v2.5.0',
    dateKey: 'docs.releases.v250.date',
    isLatest: true,
    changesKeys: [
      'docs.releases.v250.change1',
      'docs.releases.v250.change2',
      'docs.releases.v250.change3',
    ],
  },
  {
    version: 'v2.4.0',
    dateKey: 'docs.releases.v240.date',
    isLatest: false,
    changesKeys: [
      'docs.releases.v240.change1',
      'docs.releases.v240.change2',
    ],
  },
];

export function DocsReleasesPage() {
  const t = useT();

  return (
    <div style={{ /* container - converted from CSS module */ }}>
      <header style={{ /* header - converted from CSS module */ }}>
        <Heading level={1}>{t('docs.releases.page.title')}</Heading>
        <Paragraph data-size="lg" style={{ /* subtitle - converted from CSS module */ }}>
          {t('docs.releases.page.description')}
        </Paragraph>
      </header>

      <div style={{ /* releases - converted from CSS module */ }}>
        {RELEASES.map((release) => (
          <Card key={release.version} style={{ /* releaseCard - converted from CSS module */ }} style={{ padding: 'var(--ds-spacing-4)' }}>
            <div style={{ /* releaseHeader - converted from CSS module */ }}>
              <Heading level={3}>{release.version}</Heading>
              {release.isLatest && (
                <Badge data-color="accent">{t('docs.releases.latest')}</Badge>
              )}
            </div>
            <Paragraph data-size="sm" style={{ /* releaseDate - converted from CSS module */ }}>
              {t(release.dateKey)}
            </Paragraph>
            <ul style={{ /* releaseList - converted from CSS module */ }}>
              {release.changesKeys.map((key, index) => (
                <li key={index}>{t(key)}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default DocsReleasesPage;
