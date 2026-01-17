/**
 * Role Guide Page - Curated articles for specific app + role combinations
 */

import { useParams, Link } from 'react-router-dom';
import { Heading, Paragraph, Breadcrumb, Card, CardContent, Checkbox } from '@xala/ds';
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
        <Card>
          <CardContent>
            <ul className={styles.checklistItems}>
              <li><Checkbox checked={false} /> Logg inn på plattformen</li>
              <li><Checkbox checked={false} /> Utforsk tilgjengelige lokaler</li>
              <li><Checkbox checked={false} /> Opprett din første booking</li>
              <li><Checkbox checked={false} /> Legg til betalingsinformasjon</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className={styles.articles}>
        <Heading level={2}>{t('docs.roleGuide.relevantArticles') || 'Relevante artikler'}</Heading>
        <div className={styles.articleGrid}>
          <Link to="/booking/getting-started" className={styles.articleLink}>
            <Card className={styles.articleCard}>
              <CardContent>
                <Heading level={4}>Kom i gang med booking</Heading>
                <Paragraph data-size="sm">Lær grunnleggende booking</Paragraph>
              </CardContent>
            </Card>
          </Link>
          <Link to="/payments/payment-methods" className={styles.articleLink}>
            <Card className={styles.articleCard}>
              <CardContent>
                <Heading level={4}>Betalingsmetoder</Heading>
                <Paragraph data-size="sm">Tilgjengelige betalingsmåter</Paragraph>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default RoleGuidePage;
