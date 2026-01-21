/**
 * Role Guide Page - Curated articles for specific app + role combinations
 */

import { useParams, Link } from 'react-router-dom';
import { Heading, Paragraph, Breadcrumb, Card } from '@xalatechnologies/platform/ui';
import { useT } from '@xalatechnologies/platform/i18n';

// Role key mapping for i18n
const ROLE_KEYS: Record<string, string> = {
  'end-user': 'docs.roles.endUser',
  'org-member': 'docs.roles.orgMember',
  'org-admin': 'docs.roles.orgAdmin',
  'tenant-admin': 'docs.roles.tenantAdmin',
  'saas-admin': 'docs.roles.saasAdmin',
};

// App key mapping for i18n
const APP_KEYS: Record<string, string> = {
  web: 'docs.apps.web',
  backoffice: 'docs.apps.backoffice',
  minside: 'docs.apps.minside',
  'tenant-admin': 'docs.apps.tenantAdmin',
  'saas-admin': 'docs.apps.saasAdmin',
};

export function RoleGuidePage() {
  const { app, role } = useParams<{ app: string; role: string }>();
  const t = useT();

  // Get translated labels with fallback to empty string
  const roleKey = ROLE_KEYS[role || ''] || 'docs.roles.endUser';
  const appKey = APP_KEYS[app || ''] || 'docs.apps.web';
  const roleLabel = t(roleKey) || role || '';
  const appLabel = t(appKey) || app || '';

  const breadcrumbItems = [
    { label: t('docs.nav.home'), href: '/' },
    { label: t('docs.nav.roleGuides'), href: '/roles/web/end-user' },
    { label: `${roleLabel} (${appLabel})` },
  ];

  // Checklist items using i18n keys
  const checklistItems = [
    { key: 'docs.checklist.login', fallback: 'Log in to the platform' },
    { key: 'docs.checklist.explore', fallback: 'Explore available venues' },
    { key: 'docs.checklist.firstBooking', fallback: 'Create your first booking' },
    { key: 'docs.checklist.addPayment', fallback: 'Add payment information' },
  ];

  return (
    <div style={{ /* container - converted from CSS module */ }}>
      <Breadcrumb items={breadcrumbItems} />

      <header style={{ /* header - converted from CSS module */ }}>
        <Heading level={1}>
          {roleLabel}
        </Heading>
        <Paragraph data-size="lg" style={{ /* subtitle - converted from CSS module */ }}>
          {t('docs.roleGuide.guideFor')} {appLabel}
        </Paragraph>
      </header>

      <section style={{ /* checklist - converted from CSS module */ }}>
        <Heading level={2}>{t('docs.roleGuide.gettingStarted')}</Heading>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <ul style={{ /* checklistItems - converted from CSS module */ }}>
            {checklistItems.map((item, index) => {
              const label = t(item.key) || item.fallback;
              return (
                <li key={index}>
                  <input type="checkbox" id={`check-${index}`} aria-label={label} />
                  <label htmlFor={`check-${index}`}>{label}</label>
                </li>
              );
            })}
          </ul>
        </Card>
      </section>

      <section style={{ /* articles - converted from CSS module */ }}>
        <Heading level={2}>{t('docs.roleGuide.relevantArticles')}</Heading>
        <div style={{ /* articleGrid - converted from CSS module */ }}>
          <Link to="/booking/getting-started" style={{ /* articleLink - converted from CSS module */ }}>
            <Card style={{ padding: 'var(--ds-spacing-4)' }}>
              <Heading level={4}>{t('docs.article.gettingStartedBooking')}</Heading>
              <Paragraph data-size="sm">{t('docs.article.gettingStartedBookingDesc')}</Paragraph>
            </Card>
          </Link>
          <Link to="/payments/payment-methods" style={{ /* articleLink - converted from CSS module */ }}>
            <Card style={{ padding: 'var(--ds-spacing-4)' }}>
              <Heading level={4}>{t('docs.article.paymentMethods')}</Heading>
              <Paragraph data-size="sm">{t('docs.article.paymentMethodsDesc')}</Paragraph>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default RoleGuidePage;
