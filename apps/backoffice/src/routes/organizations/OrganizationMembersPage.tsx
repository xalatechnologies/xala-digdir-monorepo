/**
 * Organization Members Page
 * Dedicated page for org admins to manage organization members
 */

import { useParams, Link } from 'react-router-dom';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Badge,
  Spinner,
  ArrowLeftIcon,
  UsersIcon,
  BuildingIcon,
} from '@xala/ds';
import {
  useOrganization,
  useOrganizationMembers,
  type ActorType,
} from '@digilist/client-sdk';
import { MemberManagement } from '../../components/organizations/MemberManagement';

import { useT } from '@xala/i18n';
const actorTypeLabels: Record<ActorType, string> = {
  private: 'Privatperson',
  business: 'Bedrift',
  sports_club: 'Idrettslag',
  youth_organization: 'Ungdomsorganisasjon',
  school: 'Skole',
  municipality: 'Kommune',
};

const actorTypeColors: Record<ActorType, 'neutral' | 'info' | 'success' | 'warning'> = {
  private: 'neutral',
  business: 'info',
  sports_club: 'success',
  youth_organization: 'warning',
  school: 'info',
  municipality: 'success',
};

export function OrganizationMembersPage() {
  const t = useT();

  const { id } = useParams<{ id: string }>();

  // Queries
  const { data: orgData, isLoading: orgLoading } = useOrganization(id!);
  const organization = orgData?.data;

  const { data: membersData, isLoading: membersLoading } = useOrganizationMembers(id!);
  const members = membersData?.data ?? [];

  const isLoading = orgLoading || membersLoading;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Spinner data-size="lg" aria-label={t('organizations.ariaLabel.lasterMedlemmer')} />
      </div>
    );
  }

  if (!organization) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
        <BuildingIcon
          style={{
            fontSize: 'var(--ds-font-size-heading-lg)',
            color: 'var(--ds-color-neutral-text-subtle)',
            marginBottom: 'var(--ds-spacing-3)',
          }}
        />
        <Heading level={3} data-size="sm">{t('organizations.text.organisasjonIkkeFunnet')}</Heading>
        <Paragraph
          data-size="sm"
          style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)' }}
        >
          Organisasjonen eksisterer ikke eller er slettet.
        </Paragraph>
        <Link to="/organizations">
          <Button variant="secondary" data-size="sm" style={{ marginTop: 'var(--ds-spacing-4)' }} type="button">
            <ArrowLeftIcon />
            Tilbake til oversikt
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <Link to={`/organizations/${id}`}>
          <Button variant="tertiary" data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }} type="button">
            <ArrowLeftIcon />
            Tilbake til {organization.name}
          </Button>
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--ds-spacing-4)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)', marginBottom: 'var(--ds-spacing-2)' }}>
              <UsersIcon style={{ fontSize: 'var(--ds-font-size-heading-md)', color: 'var(--ds-color-accent-text-default)' }} />
              <Heading level={2} data-size="lg">
                Medlemmer
              </Heading>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
              <Paragraph
                data-size="sm"
                style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}
              >
                {organization.name}
              </Paragraph>
              <Badge color={actorTypeColors[organization.actorType]} data-size="sm">
                {actorTypeLabels[organization.actorType]}
              </Badge>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
            <Badge color="info">
              <UsersIcon />
              {members.length} {members.length === 1 ? 'medlem' : 'medlemmer'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 'var(--ds-spacing-3)',
        }}
      >
        <Card>
          <div style={{ padding: 'var(--ds-spacing-4)', textAlign: 'center' }}>
            <Paragraph
              data-size="xs"
              style={{ color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}
            >
              Totalt medlemmer
            </Paragraph>
            <Heading level={3} data-size="lg" style={{ color: 'var(--ds-color-info-text-default)' }}>
              {members.length}
            </Heading>
          </div>
        </Card>

        <Card>
          <div style={{ padding: 'var(--ds-spacing-4)', textAlign: 'center' }}>
            <Paragraph
              data-size="xs"
              style={{ color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}
            >
              Administratorer
            </Paragraph>
            <Heading level={3} data-size="lg" style={{ color: 'var(--ds-color-success-text-default)' }}>
              {members.filter(m => m.role === 'admin').length}
            </Heading>
          </div>
        </Card>

        <Card>
          <div style={{ padding: 'var(--ds-spacing-4)', textAlign: 'center' }}>
            <Paragraph
              data-size="xs"
              style={{ color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}
            >
              Vanlige medlemmer
            </Paragraph>
            <Heading level={3} data-size="lg" style={{ color: 'var(--ds-color-neutral-text-default)' }}>
              {members.filter(m => m.role === 'member').length}
            </Heading>
          </div>
        </Card>
      </div>

      {/* Member Management */}
      <Card>
        <div style={{ padding: 'var(--ds-spacing-4)' }}>
          <MemberManagement organizationId={organization.id} members={members} />
        </div>
      </Card>
    </div>
  );
}
