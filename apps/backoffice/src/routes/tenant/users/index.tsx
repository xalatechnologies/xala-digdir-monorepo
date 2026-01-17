/**
 * Tenant User List Page
 * BO-TENANT-ADMIN can view and manage all users within their tenant (kommune)
 *
 * Features:
 * - Paginated table with search and filters
 * - Role filter (BO-ORG-ADMIN, BO-ORG-MEMBER)
 * - Status filter (Active, Suspended, Pending Invite)
 * - Quick actions (View, Edit, Deactivate)
 * - Invite new users button
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Badge,
  Table,
  Spinner,
  PlusIcon,
  FilterIcon,
  UsersIcon,
  SearchIcon,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  MoreVerticalIcon,
  EditIcon,
  UserMinusIcon,
  UserCheckIcon,
  EmptyState,
  PageHeader,
  Container,
  Stack,
  TextField,
} from '@xala/ds';
import { useUsers } from '@digilist/client-sdk/hooks';
import { useT } from '@xala/i18n';

type UserRole = 'BO-ORG-ADMIN' | 'BO-ORG-MEMBER' | 'BO-CASE-HANDLER' | 'BO-TENANT-ADMIN';
type UserStatus = 'active' | 'suspended' | 'pending_invite';

interface TenantUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  organizationName?: string;
  createdAt: string;
  lastLoginAt?: string;
}

const roleLabels: Record<UserRole, string> = {
  'BO-TENANT-ADMIN': 'Tenant Admin',
  'BO-ORG-ADMIN': 'Organisasjonsadministrator',
  'BO-ORG-MEMBER': 'Organisasjonsmedlem',
  'BO-CASE-HANDLER': 'Saksbehandler',
};

const roleColors: Record<UserRole, 'success' | 'info' | 'warning' | 'neutral'> = {
  'BO-TENANT-ADMIN': 'success',
  'BO-ORG-ADMIN': 'info',
  'BO-ORG-MEMBER': 'neutral',
  'BO-CASE-HANDLER': 'warning',
};

const statusLabels: Record<UserStatus, string> = {
  active: 'Aktiv',
  suspended: 'Suspendert',
  pending_invite: 'Venter invitasjon',
};

const statusColors: Record<UserStatus, 'success' | 'warning' | 'danger'> = {
  active: 'success',
  suspended: 'danger',
  pending_invite: 'warning',
};

export function TenantUsersListPage() {
  const t = useT();
  const navigate = useNavigate();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const limit = 50;

  // Queries
  const { data: usersData, isLoading, error } = useUsers({
    role: roleFilter === 'all' ? undefined : roleFilter,
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: searchQuery || undefined,
    page,
    limit,
  });

  const users = (usersData?.data ?? []) as TenantUser[];
  const totalUsers = usersData?.meta?.total ?? 0;
  const totalPages = Math.ceil(totalUsers / limit);

  // Handlers
  const handleInviteUser = () => {
    navigate('/tenant/users/invite');
  };

  const handleViewUser = (userId: string) => {
    navigate(`/users/${userId}`);
  };

  const handleEditUser = (userId: string) => {
    navigate(`/users/${userId}/edit`);
  };

  const handleDeactivateUser = async (userId: string) => {
    if (confirm(t('tenantAdmin.users.confirmDeactivate'))) {
      // TODO: Implement deactivation mutation
      console.log('Deactivate user:', userId);
    }
  };

  const handleReactivateUser = async (userId: string) => {
    // TODO: Implement reactivation mutation
    console.log('Reactivate user:', userId);
  };

  // Loading state
  if (isLoading) {
    return (
      <Container>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spinner size="lg" />
        </div>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container>
        <EmptyState
          icon={<UsersIcon aria-hidden />}
          title={t('common.error')}
          description={t('tenantAdmin.users.loadError')}
        />
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader
        title={t('tenantAdmin.nav.users')}
        description={t('tenantAdmin.users.description')}
        breadcrumbs={[
          { label: t('nav.dashboard'), href: '/' },
          { label: t('tenantAdmin.nav.users'), href: '/tenant/users' },
        ]}
        actions={
          <Button
            variant="primary"
            icon={<PlusIcon aria-hidden />}
            onClick={handleInviteUser}
          >
            {t('tenantAdmin.users.inviteUser')}
          </Button>
        }
      />

      <Stack gap="6">
        {/* Filters Bar */}
        <Card>
          <Stack gap="4">
            {/* Search */}
            <TextField
              label={t('common.search')}
              placeholder={t('tenantAdmin.users.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<SearchIcon aria-hidden />}
            />

            {/* Filters */}
            <div style={{ display: 'flex', gap: 'var(--ds-spacing-4)', flexWrap: 'wrap' }}>
              {/* Role Filter */}
              <Dropdown>
                <DropdownTrigger asChild>
                  <Button variant="secondary" icon={<FilterIcon aria-hidden />}>
                    {roleFilter === 'all' ? t('tenantAdmin.users.allRoles') : roleLabels[roleFilter]}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem onClick={() => setRoleFilter('all')}>
                    {t('tenantAdmin.users.allRoles')}
                  </DropdownItem>
                  <DropdownItem onClick={() => setRoleFilter('BO-ORG-ADMIN')}>
                    {roleLabels['BO-ORG-ADMIN']}
                  </DropdownItem>
                  <DropdownItem onClick={() => setRoleFilter('BO-ORG-MEMBER')}>
                    {roleLabels['BO-ORG-MEMBER']}
                  </DropdownItem>
                  <DropdownItem onClick={() => setRoleFilter('BO-CASE-HANDLER')}>
                    {roleLabels['BO-CASE-HANDLER']}
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>

              {/* Status Filter */}
              <Dropdown>
                <DropdownTrigger asChild>
                  <Button variant="secondary" icon={<FilterIcon aria-hidden />}>
                    {statusFilter === 'all' ? t('tenantAdmin.users.allStatuses') : statusLabels[statusFilter]}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem onClick={() => setStatusFilter('all')}>
                    {t('tenantAdmin.users.allStatuses')}
                  </DropdownItem>
                  <DropdownItem onClick={() => setStatusFilter('active')}>
                    {statusLabels.active}
                  </DropdownItem>
                  <DropdownItem onClick={() => setStatusFilter('suspended')}>
                    {statusLabels.suspended}
                  </DropdownItem>
                  <DropdownItem onClick={() => setStatusFilter('pending_invite')}>
                    {statusLabels.pending_invite}
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </Stack>
        </Card>

        {/* Users Table */}
        <Card>
          {users.length === 0 ? (
            <EmptyState
              icon={<UsersIcon aria-hidden />}
              title={t('tenantAdmin.users.noUsers')}
              description={t('tenantAdmin.users.noUsersDescription')}
              action={
                <Button variant="primary" onClick={handleInviteUser}>
                  {t('tenantAdmin.users.inviteUser')}
                </Button>
              }
            />
          ) : (
            <>
              <Table>
                <Table.Head>
                  <Table.Row>
                    <Table.HeaderCell>{t('users.name')}</Table.HeaderCell>
                    <Table.HeaderCell>{t('users.email')}</Table.HeaderCell>
                    <Table.HeaderCell>{t('users.role')}</Table.HeaderCell>
                    <Table.HeaderCell>{t('tenantAdmin.users.organization')}</Table.HeaderCell>
                    <Table.HeaderCell>{t('common.status')}</Table.HeaderCell>
                    <Table.HeaderCell>{t('tenantAdmin.users.createdAt')}</Table.HeaderCell>
                    <Table.HeaderCell>{t('common.actions')}</Table.HeaderCell>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  {users.map((user) => (
                    <Table.Row key={user.id}>
                      <Table.Cell>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                          <UsersIcon size="sm" aria-hidden />
                          <span>{user.name}</span>
                        </div>
                      </Table.Cell>
                      <Table.Cell>{user.email}</Table.Cell>
                      <Table.Cell>
                        <Badge color={roleColors[user.role]} size="sm">
                          {roleLabels[user.role]}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Paragraph size="sm">{user.organizationName ?? '-'}</Paragraph>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color={statusColors[user.status]} size="sm">
                          {statusLabels[user.status]}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Paragraph size="sm">
                          {new Date(user.createdAt).toLocaleDateString('nb-NO')}
                        </Paragraph>
                      </Table.Cell>
                      <Table.Cell>
                        <Dropdown>
                          <DropdownTrigger asChild>
                            <Button variant="tertiary" size="sm" icon={<MoreVerticalIcon aria-hidden />}>
                              {t('common.actions')}
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu>
                            <DropdownItem onClick={() => handleViewUser(user.id)}>
                              <UsersIcon aria-hidden /> {t('common.view')}
                            </DropdownItem>
                            <DropdownItem onClick={() => handleEditUser(user.id)}>
                              <EditIcon aria-hidden /> {t('common.edit')}
                            </DropdownItem>
                            {user.status === 'active' ? (
                              <DropdownItem onClick={() => handleDeactivateUser(user.id)}>
                                <UserMinusIcon aria-hidden /> {t('tenantAdmin.users.deactivate')}
                              </DropdownItem>
                            ) : (
                              <DropdownItem onClick={() => handleReactivateUser(user.id)}>
                                <UserCheckIcon aria-hidden /> {t('tenantAdmin.users.reactivate')}
                              </DropdownItem>
                            )}
                          </DropdownMenu>
                        </Dropdown>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 'var(--ds-spacing-6)',
                  padding: 'var(--ds-spacing-4) var(--ds-spacing-6)',
                }}>
                  <Paragraph size="sm">
                    {t('common.showing')} {((page - 1) * limit) + 1}-{Math.min(page * limit, totalUsers)} {t('common.of')} {totalUsers}
                  </Paragraph>
                  <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      {t('common.previous')}
                    </Button>
                    <Paragraph size="sm" style={{ alignSelf: 'center', padding: '0 var(--ds-spacing-4)' }}>
                      {t('common.page')} {page} {t('common.of')} {totalPages}
                    </Paragraph>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      {t('common.next')}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </Stack>
    </Container>
  );
}

export default TenantUsersListPage;
