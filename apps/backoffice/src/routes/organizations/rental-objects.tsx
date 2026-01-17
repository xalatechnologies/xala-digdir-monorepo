/**
 * Organization Rental Object Assignment Page
 * BO-TENANT-ADMIN can assign/revoke rental object access for organizations
 *
 * Features:
 * - Two-column layout: Available | Assigned
 * - Search in each column
 * - Rental object cards with Name, Type, Status
 * - Assign/Revoke buttons (single + bulk operations)
 * - Success toast after operations
 * - Real-time updates
 */

import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Badge,
  Spinner,
  Checkbox,
  Textfield,
  PageHeader,
  Container,
  Stack,
  Grid,
  ArrowLeftIcon,
  ArrowRightIcon,
  SearchIcon,
  BuildingIcon,
  CheckCircleIcon,
  XCircleIcon,
  EmptyState,
} from '@xala/ds';
import {
  useOrganization,
  useRentalObjects,
  useAccessGrantsByOrganization,
  useGrantAccess,
  useBulkGrantAccess,
  useRevokeAccess,
} from '@digilist/client-sdk/hooks';
import { useT } from '@xala/i18n';
import { useToast } from '../../providers/ToastProvider';

interface RentalObject {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'draft';
  category?: string;
}

export function OrganizationRentalObjectsPage() {
  const t = useT();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { id: organizationId } = useParams<{ id: string }>();

  // State
  const [searchAvailable, setSearchAvailable] = useState('');
  const [searchAssigned, setSearchAssigned] = useState('');
  const [selectedAvailable, setSelectedAvailable] = useState<Set<string>>(new Set());
  const [selectedAssigned, setSelectedAssigned] = useState<Set<string>>(new Set());

  // Queries
  const { data: orgData, isLoading: isLoadingOrg } = useOrganization(organizationId!);
  const organization = orgData?.data;

  const { data: rentalObjectsData, isLoading: isLoadingRentalObjects } = useRentalObjects({ limit: 500 });
  const allRentalObjects = (rentalObjectsData?.data ?? []) as RentalObject[];

  const { data: accessGrantsData, isLoading: isLoadingAccessGrants } = useAccessGrantsByOrganization(organizationId!);
  const assignedRentalObjectIds = new Set(
    (accessGrantsData?.data ?? []).map(grant => grant.rentalObjectId)
  );

  // Mutations
  const grantAccessMutation = useGrantAccess();
  const bulkGrantAccessMutation = useBulkGrantAccess();
  const revokeAccessMutation = useRevokeAccess();

  // Computed lists
  const availableRentalObjects = useMemo(() => {
    return allRentalObjects
      .filter(ro => !assignedRentalObjectIds.has(ro.id))
      .filter(ro =>
        searchAvailable === '' ||
        ro.name.toLowerCase().includes(searchAvailable.toLowerCase()) ||
        ro.type?.toLowerCase().includes(searchAvailable.toLowerCase())
      );
  }, [allRentalObjects, assignedRentalObjectIds, searchAvailable]);

  const assignedRentalObjects = useMemo(() => {
    return allRentalObjects
      .filter(ro => assignedRentalObjectIds.has(ro.id))
      .filter(ro =>
        searchAssigned === '' ||
        ro.name.toLowerCase().includes(searchAssigned.toLowerCase()) ||
        ro.type?.toLowerCase().includes(searchAssigned.toLowerCase())
      );
  }, [allRentalObjects, assignedRentalObjectIds, searchAssigned]);

  // Handlers
  const handleBack = () => {
    navigate(`/organizations/${organizationId}`);
  };

  const handleToggleAvailable = (roId: string) => {
    setSelectedAvailable(prev => {
      const next = new Set(prev);
      if (next.has(roId)) {
        next.delete(roId);
      } else {
        next.add(roId);
      }
      return next;
    });
  };

  const handleToggleAssigned = (roId: string) => {
    setSelectedAssigned(prev => {
      const next = new Set(prev);
      if (next.has(roId)) {
        next.delete(roId);
      } else {
        next.add(roId);
      }
      return next;
    });
  };

  const handleAssignSelected = async () => {
    if (selectedAvailable.size === 0) return;

    try {
      if (selectedAvailable.size === 1) {
        const roId = Array.from(selectedAvailable)[0];
        await grantAccessMutation.mutateAsync({
          organizationId: organizationId!,
          rentalObjectId: roId,
        });
      } else {
        await bulkGrantAccessMutation.mutateAsync({
          organizationId: organizationId!,
          rentalObjectIds: Array.from(selectedAvailable),
        });
      }

      showToast({
        type: 'success',
        message: t('tenantAdmin.rentalObjects.assignSuccess', { count: selectedAvailable.size }),
      });

      setSelectedAvailable(new Set());
    } catch (error: any) {
      showToast({
        type: 'error',
        message: error.message || t('tenantAdmin.rentalObjects.assignError'),
      });
    }
  };

  const handleRevokeSelected = async () => {
    if (selectedAssigned.size === 0) return;

    if (!confirm(t('tenantAdmin.rentalObjects.confirmRevoke', { count: selectedAssigned.size }))) {
      return;
    }

    try {
      // Find access grant IDs for selected rental objects
      const grantsToRevoke = (accessGrantsData?.data ?? []).filter(grant =>
        selectedAssigned.has(grant.rentalObjectId)
      );

      await Promise.all(
        grantsToRevoke.map(grant => revokeAccessMutation.mutateAsync(grant.id))
      );

      showToast({
        type: 'success',
        message: t('tenantAdmin.rentalObjects.revokeSuccess', { count: selectedAssigned.size }),
      });

      setSelectedAssigned(new Set());
    } catch (error: any) {
      showToast({
        type: 'error',
        message: error.message || t('tenantAdmin.rentalObjects.revokeError'),
      });
    }
  };

  const handleSelectAllAvailable = () => {
    if (selectedAvailable.size === availableRentalObjects.length) {
      setSelectedAvailable(new Set());
    } else {
      setSelectedAvailable(new Set(availableRentalObjects.map(ro => ro.id)));
    }
  };

  const handleSelectAllAssigned = () => {
    if (selectedAssigned.size === assignedRentalObjects.length) {
      setSelectedAssigned(new Set());
    } else {
      setSelectedAssigned(new Set(assignedRentalObjects.map(ro => ro.id)));
    }
  };

  // Loading state
  if (isLoadingOrg || isLoadingRentalObjects || isLoadingAccessGrants) {
    return (
      <Container>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spinner size="lg" />
        </div>
      </Container>
    );
  }

  if (!organization) {
    return (
      <Container>
        <EmptyState
          icon={<BuildingIcon aria-hidden />}
          title={t('common.error')}
          description={t('tenantAdmin.organizations.notFound')}
        />
      </Container>
    );
  }

  const statusColors: Record<string, 'success' | 'warning' | 'neutral'> = {
    active: 'success',
    inactive: 'warning',
    draft: 'neutral',
  };

  return (
    <Container>
      <PageHeader
        title={t('tenantAdmin.rentalObjects.assignTitle', { orgName: organization.name })}
        description={t('tenantAdmin.rentalObjects.assignDescription')}
        breadcrumbs={[
          { label: t('nav.dashboard'), href: '/' },
          { label: t('nav.organizations'), href: '/organizations' },
          { label: organization.name, href: `/organizations/${organizationId}` },
          { label: t('tenantAdmin.rentalObjects.title'), href: `/organizations/${organizationId}/rental-objects` },
        ]}
        actions={
          <Button
            variant="tertiary"
            icon={<ArrowLeftIcon aria-hidden />}
            onClick={handleBack}
          >
            {t('common.back')}
          </Button>
        }
      />

      <Grid columns="repeat(2, 1fr)" gap="6">
        {/* Available Rental Objects Column */}
        <Card>
          <Stack gap="4">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Heading level={2} size="md">
                {t('tenantAdmin.rentalObjects.available')}
              </Heading>
              <Badge color="neutral">{availableRentalObjects.length}</Badge>
            </div>

            {/* Search */}
            <Textfield
              label={t('common.search')}
              placeholder={t('tenantAdmin.rentalObjects.searchPlaceholder')}
              value={searchAvailable}
              onChange={(e) => setSearchAvailable(e.target.value)}
              icon={<SearchIcon aria-hidden />}
              size="sm"
            />

            {/* Select All */}
            {availableRentalObjects.length > 0 && (
              <Checkbox
                label={t('tenantAdmin.rentalObjects.selectAll')}
                checked={selectedAvailable.size === availableRentalObjects.length}
                onChange={handleSelectAllAvailable}
              />
            )}

            {/* Rental Objects List */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--ds-spacing-3)',
              maxHeight: '600px',
              overflowY: 'auto',
            }}>
              {availableRentalObjects.length === 0 ? (
                <EmptyState
                  icon={<BuildingIcon aria-hidden />}
                  title={t('tenantAdmin.rentalObjects.noAvailable')}
                  description={t('tenantAdmin.rentalObjects.noAvailableDescription')}
                  compact
                />
              ) : (
                availableRentalObjects.map(ro => (
                  <Card key={ro.id} variant="outlined" style={{ padding: 'var(--ds-spacing-4)' }}>
                    <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', alignItems: 'flex-start' }}>
                      <Checkbox
                        checked={selectedAvailable.has(ro.id)}
                        onChange={() => handleToggleAvailable(ro.id)}
                        aria-label={`Select ${ro.name}`}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <Heading level={3} size="xs">{ro.name}</Heading>
                          <Badge color={statusColors[ro.status]} size="sm">
                            {ro.status}
                          </Badge>
                        </div>
                        <Paragraph size="sm" style={{ marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                          {ro.type} {ro.category && `• ${ro.category}`}
                        </Paragraph>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Assign Button */}
            <Button
              variant="primary"
              icon={<ArrowRightIcon aria-hidden />}
              onClick={handleAssignSelected}
              disabled={selectedAvailable.size === 0 || grantAccessMutation.isPending || bulkGrantAccessMutation.isPending}
              fullWidth
            >
              {t('tenantAdmin.rentalObjects.assign')} ({selectedAvailable.size})
            </Button>
          </Stack>
        </Card>

        {/* Assigned Rental Objects Column */}
        <Card>
          <Stack gap="4">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Heading level={2} size="md">
                {t('tenantAdmin.rentalObjects.assigned')}
              </Heading>
              <Badge color="success">{assignedRentalObjects.length}</Badge>
            </div>

            {/* Search */}
            <Textfield
              label={t('common.search')}
              placeholder={t('tenantAdmin.rentalObjects.searchPlaceholder')}
              value={searchAssigned}
              onChange={(e) => setSearchAssigned(e.target.value)}
              icon={<SearchIcon aria-hidden />}
              size="sm"
            />

            {/* Select All */}
            {assignedRentalObjects.length > 0 && (
              <Checkbox
                label={t('tenantAdmin.rentalObjects.selectAll')}
                checked={selectedAssigned.size === assignedRentalObjects.length}
                onChange={handleSelectAllAssigned}
              />
            )}

            {/* Rental Objects List */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--ds-spacing-3)',
              maxHeight: '600px',
              overflowY: 'auto',
            }}>
              {assignedRentalObjects.length === 0 ? (
                <EmptyState
                  icon={<CheckCircleIcon aria-hidden />}
                  title={t('tenantAdmin.rentalObjects.noAssigned')}
                  description={t('tenantAdmin.rentalObjects.noAssignedDescription')}
                  compact
                />
              ) : (
                assignedRentalObjects.map(ro => (
                  <Card key={ro.id} variant="outlined" style={{ padding: 'var(--ds-spacing-4)' }}>
                    <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', alignItems: 'flex-start' }}>
                      <Checkbox
                        checked={selectedAssigned.has(ro.id)}
                        onChange={() => handleToggleAssigned(ro.id)}
                        aria-label={`Select ${ro.name}`}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <Heading level={3} size="xs">{ro.name}</Heading>
                          <Badge color={statusColors[ro.status]} size="sm">
                            {ro.status}
                          </Badge>
                        </div>
                        <Paragraph size="sm" style={{ marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                          {ro.type} {ro.category && `• ${ro.category}`}
                        </Paragraph>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Revoke Button */}
            <Button
              variant="danger"
              icon={<XCircleIcon aria-hidden />}
              onClick={handleRevokeSelected}
              disabled={selectedAssigned.size === 0 || revokeAccessMutation.isPending}
              fullWidth
            >
              {t('tenantAdmin.rentalObjects.revoke')} ({selectedAssigned.size})
            </Button>
          </Stack>
        </Card>
      </Grid>
    </Container>
  );
}

export default OrganizationRentalObjectsPage;
