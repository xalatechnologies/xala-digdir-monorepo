/**
 * Docs Releases Page - Changelog/release notes
 */

import { Heading, Paragraph, Card, Badge } from '@xala/ds';
import { useT } from '@xala/i18n';
import styles from './DocsReleasesPage.module.css';

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
    <div className={styles.container}>
      <header className={styles.header}>
        <Heading level={1}>{t('docs.releases.page.title')}</Heading>
        <Paragraph data-size="lg" className={styles.subtitle}>
          {t('docs.releases.page.description')}
        </Paragraph>
      </header>

      <div className={styles.releases}>
        {RELEASES.map((release) => (
          <Card key={release.version} className={styles.releaseCard} style={{ padding: 'var(--ds-spacing-4)' }}>
            <div className={styles.releaseHeader}>
              <Heading level={3}>{release.version}</Heading>
              {release.isLatest && (
                <Badge data-color="accent">{t('docs.releases.latest')}</Badge>
              )}
            </div>
            <Paragraph data-size="sm" className={styles.releaseDate}>
              {t(release.dateKey)}
            </Paragraph>
            <ul className={styles.releaseList}>
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
