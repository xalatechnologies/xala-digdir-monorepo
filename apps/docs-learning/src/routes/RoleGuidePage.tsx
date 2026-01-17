/**
 * Role Guide Page - Curated articles for specific app + role combinations
 */

import { useParams, Link } from 'react-router-dom';
import { Heading, Paragraph, Breadcrumb, Card } from '@xala/ds';
import { useT } from '@xala/i18n';
import styles from './RoleGuidePage.module.css';

const ROLE_LABELS: Record<string, string> = {
  'end-user': 'Sluttbruker',
  'org-member': 'Organisasjonsmedlem',
  'org-admin': 'Organisasjonsadministrator',
  'tenant-admin': 'Leieradministrator',
  'saas-admin': 'SaaS-administrator',
};

const APP_LABELS: Record<string, string> = {
  web: 'Nettside',
  backoffice: 'Backoffice',
  minside: 'Min side',
  'tenant-admin': 'Leieradmin',
  'saas-admin': 'SaaS Admin',
};

export function RoleGuidePage() {
  const { app, role } = useParams<{ app: string; role: string }>();
  const t = useT();

  const breadcrumbItems = [
    { label: t('docs.nav.home') || 'Dokumentasjon', href: '/' },
    { label: t('docs.nav.roleGuides') || 'Rolleguider', href: '/roles/web/end-user' },
    { label: `${ROLE_LABELS[role || ''] || role} (${APP_LABELS[app || ''] || app})` },
  ];

  const checklistItems = [
    'Logg inn på plattformen',
    'Utforsk tilgjengelige lokaler',
    'Opprett din første booking',
    'Legg til betalingsinformasjon',
  ];

  return (
    <div className={styles.container}>
      <Breadcrumb items={breadcrumbItems} />

      <header className={styles.header}>
        <Heading level={1}>
          {ROLE_LABELS[role || ''] || role}
        </Heading>
        <Paragraph data-size="lg" className={styles.subtitle}>
          Guide for {APP_LABELS[app || ''] || app}
        </Paragraph>
      </header>

      <section className={styles.checklist}>
        <Heading level={2}>{t('docs.roleGuide.gettingStarted') || 'Kom i gang'}</Heading>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <ul className={styles.checklistItems}>
            {checklistItems.map((item, index) => (
              <li key={index}>
                <input type="checkbox" id={`check-${index}`} aria-label={item} />
                <label htmlFor={`check-${index}`}>{item}</label>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section className={styles.articles}>
        <Heading level={2}>{t('docs.roleGuide.relevantArticles') || 'Relevante artikler'}</Heading>
        <div className={styles.articleGrid}>
          <Link to="/booking/getting-started" className={styles.articleLink}>
            <Card className={styles.articleCard} style={{ padding: 'var(--ds-spacing-4)' }}>
              <Heading level={4}>Kom i gang med booking</Heading>
              <Paragraph data-size="sm">Lær grunnleggende booking</Paragraph>
            </Card>
          </Link>
          <Link to="/payments/payment-methods" className={styles.articleLink}>
            <Card className={styles.articleCard} style={{ padding: 'var(--ds-spacing-4)' }}>
              <Heading level={4}>Betalingsmetoder</Heading>
              <Paragraph data-size="sm">Tilgjengelige betalingsmåter</Paragraph>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default RoleGuidePage;
