/**
 * Docs Releases Page - Placeholder for release notes
 */

import { Heading, Paragraph, Card, Badge } from '@xala/ds';
import { useT } from '@xala/i18n';
import styles from './DocsReleasesPage.module.css';

export function DocsReleasesPage() {
  const t = useT();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Heading level={1}>{t('docs.releases.title') || 'Endringslogg'}</Heading>
        <Paragraph data-size="lg" className={styles.subtitle}>
          {t('docs.releases.subtitle') || 'Se hva som er nytt i Digilist'}
        </Paragraph>
      </header>

      <div className={styles.releases}>
        <Card className={styles.releaseCard} style={{ padding: 'var(--ds-spacing-4)' }}>
          <div className={styles.releaseHeader}>
            <Heading level={3}>v2.5.0</Heading>
            <Badge data-color="accent">Nyeste</Badge>
          </div>
          <Paragraph data-size="sm" className={styles.releaseDate}>15. januar 2026</Paragraph>
          <ul className={styles.releaseList}>
            <li>✨ Ny dokumentasjonsplattform</li>
            <li>🔧 Forbedret søkefunksjon</li>
            <li>🐛 Diverse feilrettinger</li>
          </ul>
        </Card>

        <Card className={styles.releaseCard} style={{ padding: 'var(--ds-spacing-4)' }}>
          <div className={styles.releaseHeader}>
            <Heading level={3}>v2.4.0</Heading>
          </div>
          <Paragraph data-size="sm" className={styles.releaseDate}>1. januar 2026</Paragraph>
          <ul className={styles.releaseList}>
            <li>📊 Ny rapportmodul</li>
            <li>🔐 Forbedret sikkerhet</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

export default DocsReleasesPage;
