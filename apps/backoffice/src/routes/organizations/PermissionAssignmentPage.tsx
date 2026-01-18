/**
 * Permission Assignment Page
 * Org Admin view for managing per-rental-object member permissions
 *
 * Shows a permission matrix with:
 * - Rows: Organization members
 * - Columns: Rental objects the org has access to
 * - Cells: Permission toggles (RO_VIEW, RO_BOOK, RO_BOOK_EDIT, RO_BOOK_CANCEL)
 */

import { useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useT } from '@xala/i18n';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Badge,
  Spinner,
  Checkbox,
  Table,
  ArrowLeftIcon,
  ShieldCheckIcon,
  UsersIcon,
  BuildingIcon,
  CheckCircleIcon,
  HeaderSearch,
} from '@xala/ds';
import {
  useOrganization,
  useOrganizationMembers,
  useAccessibleRentalObjects,
  usePermissionAssignmentsByOrganization,
  useAssignPermissions,
  useAvailablePermissions,
  RentalObjectPermission,
  type ActorType,
  type PermissionAssignmentWithDetails,
} from '@digilist/client-sdk';

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



// Permissions that can be assigned to regular members
const memberPermissions: RentalObjectPermission[] = [
  RentalObjectPermission.RO_VIEW,
  RentalObjectPermission.RO_BOOK,
  RentalObjectPermission.RO_BOOK_EDIT,
  RentalObjectPermission.RO_BOOK_CANCEL,
];

export function PermissionAssignmentPage() {
  const { id } = useParams<{ id: string }>();
  const t = useT();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRentalObject, setSelectedRentalObject] = useState<string | null>(null);

  // Human-readable labels for permissions
  const permissionLabels: Record<RentalObjectPermission, string> = {
    [RentalObjectPermission.RO_VIEW]: 'Vis',
    [RentalObjectPermission.RO_BOOK]: 'Book',
    [RentalObjectPermission.RO_BOOK_EDIT]: 'Rediger',
    [RentalObjectPermission.RO_BOOK_CANCEL]: 'Kanseller',
    [RentalObjectPermission.RO_ASSIGN_CASE_HANDLERS]: 'Tildel saksbehandlere',
    [RentalObjectPermission.RO_ASSIGN_PERMISSIONS]: 'Tildel rettigheter',
    [RentalObjectPermission.RO_MANAGE_MEMBERS]: t('actions.administrer_medlemmer'),
  };

  // Queries
  const { data: orgData, isLoading: orgLoading } = useOrganization(id!);
  const organization = orgData?.data;

  const { data: membersData, isLoading: membersLoading } = useOrganizationMembers(id!);
  const members = membersData?.data ?? [];

  const { data: accessibleROData, isLoading: roLoading } = useAccessibleRentalObjects(id!);
  const rentalObjects = accessibleROData?.data ?? [];

  const { data: assignmentsData, isLoading: assignmentsLoading } = usePermissionAssignmentsByOrganization(id!);
  const assignments = (assignmentsData?.data ?? []) as PermissionAssignmentWithDetails[];

  const { data: availablePermsData } = useAvailablePermissions();
  const availablePermissions = availablePermsData?.data ?? memberPermissions;

  // Mutations
  const assignPermissionsMutation = useAssignPermissions();

  const isLoading = orgLoading || membersLoading || roLoading || assignmentsLoading;

  // Filter members by search query
  const filteredMembers = useMemo(() => {
    if (!searchQuery) return members;
    const query = searchQuery.toLowerCase();
    return members.filter(
      (member) =>
        member.user?.name?.toLowerCase().includes(query) ||
        member.user?.email?.toLowerCase().includes(query)
    );
  }, [members, searchQuery]);

  // Build a lookup map for quick permission checks
  const permissionMap = useMemo(() => {
    const map = new Map<string, RentalObjectPermission[]>();
    assignments.forEach((assignment) => {
      const key = `${assignment.userId}:${assignment.rentalObjectId}`;
      map.set(key, assignment.permissions);
    });
    return map;
  }, [assignments]);

  // Check if a member has a specific permission for a rental object
  const hasPermission = useCallback(
    (userId: string, rentalObjectId: string, permission: RentalObjectPermission): boolean => {
      const key = `${userId}:${rentalObjectId}`;
      const perms = permissionMap.get(key);
      return perms?.includes(permission) ?? false;
    },
    [permissionMap]
  );

  // Get all permissions for a member on a rental object
  const getMemberPermissions = useCallback(
    (userId: string, rentalObjectId: string): RentalObjectPermission[] => {
      const key = `${userId}:${rentalObjectId}`;
      return permissionMap.get(key) ?? [];
    },
    [permissionMap]
  );

  // Toggle a permission for a member on a rental object
  const handleTogglePermission = async (
    userId: string,
    rentalObjectId: string,
    permission: RentalObjectPermission
  ) => {
    const currentPerms = getMemberPermissions(userId, rentalObjectId);
    let newPerms: RentalObjectPermission[];

    if (currentPerms.includes(permission)) {
      // Remove permission
      newPerms = currentPerms.filter((p) => p !== permission);
    } else {
      // Add permission
      newPerms = [...currentPerms, permission];
    }

    await assignPermissionsMutation.mutateAsync({
      organizationId: id!,
      userId,
      rentalObjectId,
      permissions: newPerms,
    });
  };

  // Count total assigned permissions
  const totalAssignedPermissions = useMemo(() => {
    return assignments.reduce((sum, a) => sum + a.permissions.length, 0);
  }, [assignments]);

  // Filter to show selected rental object or all
  const visibleRentalObjects = selectedRentalObject
    ? rentalObjects.filter((ro) => ro.rentalObjectId === selectedRentalObject)
    : rentalObjects;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Spinner data-size="lg" aria-label={t('organizations.ariaLabel.lasterRettigheter')} />
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
        <Heading level={3} data-size="sm">
          Organisasjon ikke funnet
        </Heading>
        <Paragraph
          data-size="sm"
          style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)' }}
        >
          Organisasjonen eksisterer ikke eller er slettet.
        </Paragraph>
        <Link to="/organizations">
          <Button
            variant="secondary"
            data-size="sm"
            style={{ marginTop: 'var(--ds-spacing-4)' }}
            type="button"
          >
            <ArrowLeftIcon />
            Tilbake til oversikt
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-5)',
        maxWidth: '1400px',
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div>
        <Link to={`/organizations/${id}`}>
          <Button
            variant="tertiary"
            data-size="sm"
            style={{ marginBottom: 'var(--ds-spacing-3)' }}
            type="button"
          >
            <ArrowLeftIcon />
            Tilbake til {organization.name}
          </Button>
        </Link>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 'var(--ds-spacing-4)',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-3)',
                marginBottom: 'var(--ds-spacing-2)',
              }}
            >
              <ShieldCheckIcon
                style={{
                  fontSize: 'var(--ds-font-size-heading-md)',
                  color: 'var(--ds-color-accent-text-default)',
                }}
              />
              <Heading level={2} data-size="lg">
                Rettighetsadministrasjon
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
            <Badge color="success">
              <CheckCircleIcon />
              {totalAssignedPermissions} tildelinger
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
              style={{
                color: 'var(--ds-color-neutral-text-subtle)',
                marginBottom: 'var(--ds-spacing-1)',
              }}
            >
              Medlemmer
            </Paragraph>
            <Heading
              level={3}
              data-size="lg"
              style={{ color: 'var(--ds-color-info-text-default)' }}
            >
              {members.length}
            </Heading>
          </div>
        </Card>

        <Card>
          <div style={{ padding: 'var(--ds-spacing-4)', textAlign: 'center' }}>
            <Paragraph
              data-size="xs"
              style={{
                color: 'var(--ds-color-neutral-text-subtle)',
                marginBottom: 'var(--ds-spacing-1)',
              }}
            >
              Utleieobjekter
            </Paragraph>
            <Heading
              level={3}
              data-size="lg"
              style={{ color: 'var(--ds-color-success-text-default)' }}
            >
              {rentalObjects.length}
            </Heading>
          </div>
        </Card>

        <Card>
          <div style={{ padding: 'var(--ds-spacing-4)', textAlign: 'center' }}>
            <Paragraph
              data-size="xs"
              style={{
                color: 'var(--ds-color-neutral-text-subtle)',
                marginBottom: 'var(--ds-spacing-1)',
              }}
            >
              Rettigheter tildelt
            </Paragraph>
            <Heading
              level={3}
              data-size="lg"
              style={{ color: 'var(--ds-color-accent-text-default)' }}
            >
              {totalAssignedPermissions}
            </Heading>
          </div>
        </Card>

        <Card>
          <div style={{ padding: 'var(--ds-spacing-4)', textAlign: 'center' }}>
            <Paragraph
              data-size="xs"
              style={{
                color: 'var(--ds-color-neutral-text-subtle)',
                marginBottom: 'var(--ds-spacing-1)',
              }}
            >
              Tilgjengelige rettigheter
            </Paragraph>
            <Heading
              level={3}
              data-size="lg"
              style={{ color: 'var(--ds-color-neutral-text-default)' }}
            >
              {availablePermissions.length}
            </Heading>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div
          style={{
            display: 'flex',
            gap: 'var(--ds-spacing-3)',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <div style={{ flex: '1 1 300px', minWidth: '200px' }}>
            <HeaderSearch
              placeholder={t('common.sok_etter_medlem')}
              value={searchQuery}
              onSearchChange={(value) => setSearchQuery(value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
            <Button
              variant={selectedRentalObject === null ? 'primary' : 'secondary'}
              data-size="sm"
              onClick={() => setSelectedRentalObject(null)}
              type="button"
            >
              Alle utleieobjekter
            </Button>
            {rentalObjects.slice(0, 5).map((ro) => (
              <Button
                key={ro.rentalObjectId}
                variant={selectedRentalObject === ro.rentalObjectId ? 'primary' : 'secondary'}
                data-size="sm"
                onClick={() => setSelectedRentalObject(ro.rentalObjectId)}
                type="button"
              >
                {ro.rentalObjectName}
              </Button>
            ))}
            {rentalObjects.length > 5 && (
              <Badge color="neutral">+{rentalObjects.length - 5} flere</Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Empty state */}
      {rentalObjects.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
            <BuildingIcon
              style={{
                fontSize: 'var(--ds-font-size-heading-lg)',
                color: 'var(--ds-color-neutral-text-subtle)',
                marginBottom: 'var(--ds-spacing-3)',
              }}
            />
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              Ingen utleieobjekter tilgjengelig
            </Heading>
            <Paragraph
              data-size="sm"
              style={{ color: 'var(--ds-color-neutral-text-subtle)' }}
            >
              Denne organisasjonen har ikke fått tilgang til noen utleieobjekter ennå.
              <br />
              Kommune-administrator må tildele tilgang før rettigheter kan administreres.
            </Paragraph>
            <Link to="/access-grants">
              <Button
                data-size="sm"
                style={{ marginTop: 'var(--ds-spacing-4)' }}
                type="button"
              >
                t('actions.gaa_til_tilgangstildelinger')
              </Button>
            </Link>
          </div>
        </Card>
      ) : members.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
            <UsersIcon
              style={{
                fontSize: 'var(--ds-font-size-heading-lg)',
                color: 'var(--ds-color-neutral-text-subtle)',
                marginBottom: 'var(--ds-spacing-3)',
              }}
            />
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              Ingen medlemmer
            </Heading>
            <Paragraph
              data-size="sm"
              style={{ color: 'var(--ds-color-neutral-text-subtle)' }}
            >
              Legg til medlemmer i organisasjonen før du kan tildele rettigheter.
            </Paragraph>
            <Link to={`/organizations/${id}/members`}>
              <Button
                data-size="sm"
                style={{ marginTop: 'var(--ds-spacing-4)' }}
                type="button"
              >
                Administrer medlemmer
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        /* Permission Matrix */
        visibleRentalObjects.map((rentalObject) => (
          <Card key={rentalObject.rentalObjectId}>
            <div style={{ marginBottom: 'var(--ds-spacing-4)' }}>
              <Heading level={3} data-size="sm">
                {rentalObject.rentalObjectName}
              </Heading>
              <Paragraph
                data-size="xs"
                style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}
              >
                Tilgang via:{' '}
                {rentalObject.accessSource === 'direct' ? 'Direkte' : 'Tilgangstildeling'}
              </Paragraph>
            </div>

            <div style={{ overflow: 'auto' }}>
              <Table>
                <Table.Head>
                  <Table.Row>
                    <Table.HeaderCell style={{ minWidth: '200px' }}>{t('organizations.text.medlem')}</Table.HeaderCell>
                    {memberPermissions.map((permission) => (
                      <Table.HeaderCell
                        key={permission}
                        style={{ textAlign: 'center', minWidth: '100px' }}
                      >
                        {permissionLabels[permission]}
                      </Table.HeaderCell>
                    ))}
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  {filteredMembers.map((member) => (
                    <Table.Row key={member.userId}>
                      <Table.Cell>
                        <div>
                          <div style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                            {member.user?.name ?? 'Ukjent bruker'}
                          </div>
                          <div
                            style={{
                              fontSize: 'var(--ds-font-size-xs)',
                              color: 'var(--ds-color-neutral-text-subtle)',
                            }}
                          >
                            {member.user?.email}
                          </div>
                          {member.role && (
                            <Badge
                              color={member.role === 'admin' ? 'success' : 'neutral'}
                              data-size="sm"
                              style={{ marginTop: 'var(--ds-spacing-1)' }}
                            >
                              {member.role === 'admin' ? 'Administrator' : 'Medlem'}
                            </Badge>
                          )}
                        </div>
                      </Table.Cell>
                      {memberPermissions.map((permission) => (
                        <Table.Cell
                          key={permission}
                          style={{ textAlign: 'center', verticalAlign: 'middle' }}
                        >
                          <Checkbox
                            checked={hasPermission(
                              member.userId,
                              rentalObject.rentalObjectId,
                              permission
                            )}
                            onChange={() =>
                              handleTogglePermission(
                                member.userId,
                                rentalObject.rentalObjectId,
                                permission
                              )
                            }
                            aria-label={`${permissionLabels[permission]} for ${member.user?.name} på ${rentalObject.rentalObjectName}`}
                            disabled={assignPermissionsMutation.isPending}
                          />
                        </Table.Cell>
                      ))}
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>

            {filteredMembers.length === 0 && (
              <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-4)' }}>
                <Paragraph
                  data-size="sm"
                  style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}
                >
                  Ingen medlemmer matcher søket
                </Paragraph>
              </div>
            )}
          </Card>
        ))
      )}

      {/* Legend */}
      <Card>
        <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
          Rettighetsbeskrivelser
        </Heading>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--ds-spacing-3)',
          }}
        >
          <div>
            <Badge color="info" data-size="sm">
              Vis
            </Badge>
            <Paragraph
              data-size="xs"
              style={{
                color: 'var(--ds-color-neutral-text-subtle)',
                margin: 0,
                marginTop: 'var(--ds-spacing-1)',
              }}
            >
              Kan se detaljer og tilgjengelighet for utleieobjektet
            </Paragraph>
          </div>
          <div>
            <Badge color="success" data-size="sm">
              Book
            </Badge>
            <Paragraph
              data-size="xs"
              style={{
                color: 'var(--ds-color-neutral-text-subtle)',
                margin: 0,
                marginTop: 'var(--ds-spacing-1)',
              }}
            >
              Kan opprette bookinger på utleieobjektet
            </Paragraph>
          </div>
          <div>
            <Badge color="warning" data-size="sm">
              Rediger
            </Badge>
            <Paragraph
              data-size="xs"
              style={{
                color: 'var(--ds-color-neutral-text-subtle)',
                margin: 0,
                marginTop: 'var(--ds-spacing-1)',
              }}
            >
              Kan redigere organisasjonens bookinger
            </Paragraph>
          </div>
          <div>
            <Badge color="danger" data-size="sm">
              Kanseller
            </Badge>
            <Paragraph
              data-size="xs"
              style={{
                color: 'var(--ds-color-neutral-text-subtle)',
                margin: 0,
                marginTop: 'var(--ds-spacing-1)',
              }}
            >
              Kan kansellere organisasjonens bookinger
            </Paragraph>
          </div>
        </div>
      </Card>
    </div>
  );
}
