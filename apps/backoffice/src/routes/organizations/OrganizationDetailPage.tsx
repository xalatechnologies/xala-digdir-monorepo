/**
 * Organization Detail Page
 * Full-page view for viewing and managing a single organization
 */

import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Badge,
  Spinner,
  Stack,
  Tabs,
  EditIcon,
  ArrowLeftIcon,
  TrashIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  UsersIcon,
} from '@xala/ds';
import {
  useOrganization,
  useOrganizationMembers,
  useDeleteOrganization,
  useVerifyOrganization,
  type ActorType,
  type OrganizationStatus,
} from '@digilist/client-sdk';
import { MemberManagement } from '../../components/organizations/MemberManagement';
import { FormSection } from '../../components/shared';

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

const statusColors: Record<OrganizationStatus, 'success' | 'warning' | 'danger'> = {
  active: 'success',
  inactive: 'warning',
  suspended: 'danger',
};

export function OrganizationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Queries
  const { data: orgData, isLoading } = useOrganization(id!);
  const organization = orgData?.data;

  const { data: membersData } = useOrganizationMembers(id!);
  const members = membersData?.data ?? [];

  // Mutations
  const deleteOrgMutation = useDeleteOrganization();
  const verifyOrgMutation = useVerifyOrganization();

  // Handlers
  const handleDelete = async () => {
    if (confirm('Er du sikker på at du vil slette denne organisasjonen?')) {
      await deleteOrgMutation.mutateAsync(id!);
      navigate('/organizations');
    }
  };

  const handleVerify = async () => {
    await verifyOrgMutation.mutateAsync(id!);
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Heading level={3} data-size="sm">Organisasjon ikke funnet</Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)' }}>
          Organisasjonen eksisterer ikke eller er slettet.
        </Paragraph>
        <Link to="/organizations">
          <Button variant="secondary" size="sm" style={{ marginTop: 'var(--ds-spacing-4)' }}>
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
        <Link to="/organizations">
          <Button variant="tertiary" size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
            <ArrowLeftIcon />
            Tilbake til oversikt
          </Button>
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Heading level={2} data-size="lg">
              {organization.name}
            </Heading>
            <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', marginTop: 'var(--ds-spacing-2)' }}>
              <Badge color={actorTypeColors[organization.actorType]}>
                {actorTypeLabels[organization.actorType]}
              </Badge>
              <Badge color={statusColors[organization.status]}>
                {organization.status === 'active' ? 'Aktiv' : organization.status === 'inactive' ? 'Inaktiv' : 'Suspendert'}
              </Badge>
              {organization.verified && (
                <Badge color="success">
                  <CheckCircleIcon /> Verifisert
                </Badge>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
            <Link to={`/organizations/${id}/edit`}>
              <Button variant="secondary" size="sm">
                <EditIcon />
                Rediger
              </Button>
            </Link>
            {!organization.verified && (
              <Button variant="secondary" size="sm" onClick={handleVerify}>
                <ShieldCheckIcon />
                Verifiser
              </Button>
            )}
            <Button variant="danger" size="sm" onClick={handleDelete}>
              <TrashIcon />
              Slett
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <Tabs defaultValue="info">
        <Tabs.List>
          <Tabs.Trigger value="info">Informasjon</Tabs.Trigger>
          <Tabs.Trigger value="members">
            <UsersIcon />
            Medlemmer ({members.length})
          </Tabs.Trigger>
          <Tabs.Trigger value="bookings">Bookinger</Tabs.Trigger>
          <Tabs.Trigger value="seasons">Sesongleie</Tabs.Trigger>
        </Tabs.List>

        {/* Information Tab */}
        <Tabs.Content value="info">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--ds-spacing-4)' }}>
            <Card>
              <FormSection title="Grunnleggende informasjon">
                <Stack gap={3}>
                  <div>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                      Type organisasjon
                    </div>
                    <Badge color={actorTypeColors[organization.actorType]}>
                      {actorTypeLabels[organization.actorType]}
                    </Badge>
                  </div>

                  {organization.organizationNumber && (
                    <div>
                      <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                        Organisasjonsnummer
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: 'var(--ds-font-size-md)' }}>
                        {organization.organizationNumber}
                      </div>
                    </div>
                  )}

                  <div>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                      Status
                    </div>
                    <Badge color={statusColors[organization.status]}>
                      {organization.status === 'active' ? 'Aktiv' : organization.status === 'inactive' ? 'Inaktiv' : 'Suspendert'}
                    </Badge>
                  </div>

                  <div>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                      Verifisert
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-1)' }}>
                      {organization.verified ? (
                        <>
                          <CheckCircleIcon style={{ color: 'var(--ds-color-success-text-default)' }} />
                          <span>Ja</span>
                        </>
                      ) : (
                        <>
                          <XCircleIcon style={{ color: 'var(--ds-color-neutral-text-subtle)' }} />
                          <span>Nei</span>
                        </>
                      )}
                    </div>
                  </div>
                </Stack>
              </FormSection>
            </Card>

            <Card>
              <FormSection title="Kontaktinformasjon">
                <Stack gap={3}>
                  {organization.email ? (
                    <div>
                      <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                        E-post
                      </div>
                      <a href={`mailto:${organization.email}`} style={{ color: 'var(--ds-color-accent-text-default)' }}>
                        {organization.email}
                      </a>
                    </div>
                  ) : (
                    <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                      Ingen e-postadresse registrert
                    </Paragraph>
                  )}

                  {organization.phone && (
                    <div>
                      <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                        Telefon
                      </div>
                      <a href={`tel:${organization.phone}`} style={{ color: 'var(--ds-color-accent-text-default)' }}>
                        {organization.phone}
                      </a>
                    </div>
                  )}

                  {(organization.address || organization.city || organization.postalCode) ? (
                    <div>
                      <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                        Adresse
                      </div>
                      <div>
                        {organization.address && <div>{organization.address}</div>}
                        {(organization.postalCode || organization.city) && (
                          <div>{[organization.postalCode, organization.city].filter(Boolean).join(' ')}</div>
                        )}
                      </div>
                    </div>
                  ) : (
                    !organization.email && !organization.phone && (
                      <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                        Ingen adresse registrert
                      </Paragraph>
                    )
                  )}
                </Stack>
              </FormSection>
            </Card>
          </div>
        </Tabs.Content>

        {/* Members Tab */}
        <Tabs.Content value="members">
          <Card>
            <MemberManagement organizationId={organization.id} members={members} />
          </Card>
        </Tabs.Content>

        {/* Bookings Tab */}
        <Tabs.Content value="bookings">
          <Card>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              Bookinger fra denne organisasjonen vil vises her.
            </Paragraph>
          </Card>
        </Tabs.Content>

        {/* Seasons Tab */}
        <Tabs.Content value="seasons">
          <Card>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              Sesongleie-avtaler for denne organisasjonen vil vises her.
            </Paragraph>
          </Card>
        </Tabs.Content>
      </Tabs>
    </div>
  );
}
