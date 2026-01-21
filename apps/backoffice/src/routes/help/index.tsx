/**
 * Help & Support Page
 *
 * Main help hub with role-aware quick start guides and resource links.
 * Available to all org_member users (CAP_NAV_HELP capability).
 */
import * as React from 'react';
import { Heading, Paragraph, Card, Badge } from '@xalatechnologies/platform/ui';
import { Link } from 'react-router-dom';
import { useAuth } from '@xala/auth';
import { useT } from '@xala/i18n';

// =============================================================================
// Types (for translation lookup)
// =============================================================================

interface HelpSectionKey {
  titleKey: string;
  descriptionKey: string;
  href: string;
  icon: string;
  external?: boolean;
}

interface QuickStartItemKey {
  titleKey: string;
  descriptionKey: string;
}

const helpSectionKeys: HelpSectionKey[] = [
  {
    titleKey: 'help.sections.gettingStarted.title',
    descriptionKey: 'help.sections.gettingStarted.description',
    href: '/help/guides',
    icon: 'BookIcon',
  },
  {
    titleKey: 'help.sections.faq.title',
    descriptionKey: 'help.sections.faq.description',
    href: '/help/faq',
    icon: 'InfoIcon',
  },
  {
    titleKey: 'help.sections.support.title',
    descriptionKey: 'help.sections.support.description',
    href: 'mailto:support@digilist.no',
    icon: 'EnvelopeIcon',
    external: true,
  },
];

const quickStartKeysByRole: Record<string, QuickStartItemKey[]> = {
  org_member: [
    { titleKey: 'help.quickStart.orgMember.viewRentalObjects.title', descriptionKey: 'help.quickStart.orgMember.viewRentalObjects.description' },
    { titleKey: 'help.quickStart.orgMember.processBookings.title', descriptionKey: 'help.quickStart.orgMember.processBookings.description' },
    { titleKey: 'help.quickStart.orgMember.viewCalendar.title', descriptionKey: 'help.quickStart.orgMember.viewCalendar.description' },
    { titleKey: 'help.quickStart.orgMember.communicate.title', descriptionKey: 'help.quickStart.orgMember.communicate.description' },
  ],
  org_admin: [
    { titleKey: 'help.quickStart.orgAdmin.manageUsers.title', descriptionKey: 'help.quickStart.orgAdmin.manageUsers.description' },
    { titleKey: 'help.quickStart.orgAdmin.createRentalObjects.title', descriptionKey: 'help.quickStart.orgAdmin.createRentalObjects.description' },
    { titleKey: 'help.quickStart.orgAdmin.processBookings.title', descriptionKey: 'help.quickStart.orgAdmin.processBookings.description' },
    { titleKey: 'help.quickStart.orgAdmin.viewReports.title', descriptionKey: 'help.quickStart.orgAdmin.viewReports.description' },
    { titleKey: 'help.quickStart.orgAdmin.manageMessages.title', descriptionKey: 'help.quickStart.orgAdmin.manageMessages.description' },
  ],
  tenant_admin: [
    { titleKey: 'help.quickStart.tenantAdmin.configureOrg.title', descriptionKey: 'help.quickStart.tenantAdmin.configureOrg.description' },
    { titleKey: 'help.quickStart.tenantAdmin.activateFeatures.title', descriptionKey: 'help.quickStart.tenantAdmin.activateFeatures.description' },
    { titleKey: 'help.quickStart.tenantAdmin.manageUsers.title', descriptionKey: 'help.quickStart.tenantAdmin.manageUsers.description' },
    { titleKey: 'help.quickStart.tenantAdmin.setupIntegrations.title', descriptionKey: 'help.quickStart.tenantAdmin.setupIntegrations.description' },
    { titleKey: 'help.quickStart.tenantAdmin.exportReports.title', descriptionKey: 'help.quickStart.tenantAdmin.exportReports.description' },
  ],
  admin: [
    { titleKey: 'help.quickStart.admin.systemAdmin.title', descriptionKey: 'help.quickStart.admin.systemAdmin.description' },
    { titleKey: 'help.quickStart.admin.userAccess.title', descriptionKey: 'help.quickStart.admin.userAccess.description' },
    { titleKey: 'help.quickStart.admin.featuresModules.title', descriptionKey: 'help.quickStart.admin.featuresModules.description' },
    { titleKey: 'help.quickStart.admin.auditLog.title', descriptionKey: 'help.quickStart.admin.auditLog.description' },
    { titleKey: 'help.quickStart.admin.integrations.title', descriptionKey: 'help.quickStart.admin.integrations.description' },
  ],
};

const roleLabelKeys: Record<string, string> = {
  org_member: 'help.roles.orgMember',
  org_admin: 'help.roles.orgAdmin',
  tenant_admin: 'help.roles.tenantAdmin',
  admin: 'help.roles.admin',
};

// Keyboard shortcut keys for translation
const keyboardShortcutKeys = [
  { key: '?', descriptionKey: 'help.shortcuts.showShortcuts' },
  { key: 'g d', descriptionKey: 'help.shortcuts.goToDashboard' },
  { key: 'g b', descriptionKey: 'help.shortcuts.goToBookings' },
  { key: 'g c', descriptionKey: 'help.shortcuts.goToCalendar' },
  { key: 'g m', descriptionKey: 'help.shortcuts.goToMessages' },
  { key: 'g h', descriptionKey: 'help.shortcuts.goToHelp' },
];

// =============================================================================
// Icons
// =============================================================================

function ChevronRightIcon(): React.ReactElement {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

// =============================================================================
// Component
// =============================================================================

export default function HelpPage(): React.ReactElement {
  const t = useT();
  const { data: session } = useAuth();
  const userRole = session?.user?.role ?? 'org_member';
  const quickStartItemKeys = quickStartKeysByRole[userRole] ?? quickStartKeysByRole.org_member;
  const roleLabelKey = roleLabelKeys[userRole] ?? roleLabelKeys.org_member;
  const roleLabel = t(roleLabelKey);

  return (
    <div style={{ padding: 'var(--ds-spacing-6)', maxWidth: '1200px' }}>
      {/* Header */}
      <header style={{ marginBottom: 'var(--ds-spacing-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)', marginBottom: 'var(--ds-spacing-2)' }}>
          <Heading level={1} data-size="lg">
            {t('help.page.title')}
          </Heading>
          <Badge data-color="info" data-size="sm">
            {roleLabel}
          </Badge>
        </div>
        <Paragraph data-size="md" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('help.page.description')}
        </Paragraph>
      </header>

      {/* Help Section Cards */}
      <section style={{ marginBottom: 'var(--ds-spacing-10)' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 'var(--ds-spacing-5)',
          }}
        >
          {helpSectionKeys.map((section) => (
            <Link
              key={section.titleKey}
              to={section.href}
              style={{ textDecoration: 'none' }}
              {...(section.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              <Card
                style={{
                  padding: 'var(--ds-spacing-5)',
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--ds-shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: 'var(--ds-spacing-3)' }}>
                  {section.icon}
                </div>
                <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                  {t(section.titleKey)}
                </Heading>
                <Paragraph
                  data-size="sm"
                  style={{ color: 'var(--ds-color-neutral-text-subtle)', flex: 1 }}
                >
                  {t(section.descriptionKey)}
                </Paragraph>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-1)',
                    marginTop: 'var(--ds-spacing-3)',
                    color: 'var(--ds-color-accent-text-default)',
                    fontSize: 'var(--ds-font-size-sm)',
                    fontWeight: 'var(--ds-font-weight-medium)',
                  }}
                >
                  {section.external ? t('help.openLink') : t('help.readMore')}
                  <ChevronRightIcon />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Start Guide - Role Aware */}
      <section>
        <Heading level={2} data-size="md" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('help.quickStartGuide.page.title')}
        </Heading>
        <Paragraph
          data-size="sm"
          style={{
            color: 'var(--ds-color-neutral-text-subtle)',
            marginBottom: 'var(--ds-spacing-4)',
          }}
        >
          {t('help.quickStartGuide.page.description', { role: roleLabel.toLowerCase() })}
        </Paragraph>
        <div
          style={{
            backgroundColor: 'var(--ds-color-neutral-surface-hover)',
            borderRadius: 'var(--ds-border-radius-lg)',
            padding: 'var(--ds-spacing-6)',
          }}
        >
          <ol
            style={{
              paddingLeft: 'var(--ds-spacing-6)',
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--ds-spacing-4)',
            }}
          >
            {quickStartItemKeys.map((item, index) => (
              <li key={index}>
                <strong style={{ display: 'block', marginBottom: 'var(--ds-spacing-1)' }}>
                  {t(item.titleKey)}
                </strong>
                <span style={{ color: 'var(--ds-color-neutral-text-subtle)', fontSize: 'var(--ds-font-size-sm)' }}>
                  {t(item.descriptionKey)}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Keyboard Shortcuts */}
      <section style={{ marginTop: 'var(--ds-spacing-10)' }}>
        <Heading level={2} data-size="md" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('help.keyboardShortcuts.page.title')}
        </Heading>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 'var(--ds-spacing-3)',
          }}
        >
          {keyboardShortcutKeys.map((shortcut) => (
            <div
              key={shortcut.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-3)',
                padding: 'var(--ds-spacing-3)',
                backgroundColor: 'var(--ds-color-neutral-surface-default)',
                borderRadius: 'var(--ds-border-radius-md)',
                border: '1px solid var(--ds-color-neutral-border-subtle)',
              }}
            >
              <kbd
                style={{
                  padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
                  backgroundColor: 'var(--ds-color-neutral-surface-hover)',
                  borderRadius: 'var(--ds-border-radius-sm)',
                  fontFamily: 'var(--ds-font-family-mono)',
                  fontSize: 'var(--ds-font-size-sm)',
                  border: '1px solid var(--ds-color-neutral-border-subtle)',
                  minWidth: '40px',
                  textAlign: 'center',
                }}
              >
                {shortcut.key}
              </kbd>
              <span style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                {t(shortcut.descriptionKey)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
