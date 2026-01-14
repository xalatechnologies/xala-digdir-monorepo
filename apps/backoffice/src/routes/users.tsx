/**
 * Users Management Page - Complete Admin View
 * Create, invite, and manage backoffice users with roles
 */

import { useState, useMemo } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Badge,
  Table,
  Dropdown,
  Spinner,
  Drawer,
  DrawerSection,
  Stack,
  PlusIcon,
  MoreVerticalIcon,
  FilterIcon,
  UserIcon,
  UsersIcon,
  EditIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  MailIcon,
  HeaderSearch,
} from '@xala/ds';
import {
  useUsers,
  useUser,
  useCreateUser,
  useUpdateUser,
  useDeactivateUser,
  useReactivateUser,
  type User,
  type UserRole,
  type UserStatus,
} from '@digilist/client-sdk';
import { useT } from '@xala/i18n';
import { UserForm } from '../components/users/UserForm';

type ViewMode = 'list' | 'detail';

const roleLabels: Record<UserRole, string> = {
  super_admin: 'Superadmin',
  admin: 'Administrator',
  saksbehandler: 'Saksbehandler',
  user: 'Bruker',
};

const roleColors: Record<UserRole, 'success' | 'info' | 'warning' | 'neutral'> = {
  super_admin: 'success',
  admin: 'info',
  saksbehandler: 'warning',
  user: 'neutral',
};

const statusColors: Record<UserStatus, 'success' | 'warning' | 'danger'> = {
  active: 'success',
  inactive: 'warning',
  suspended: 'danger',
};

export function UsersPage() {
  const t = useT();

  // State
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');

  // Queries
  const { data: usersData, isLoading } = useUsers({
    role: roleFilter === 'all' ? undefined : roleFilter,
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: searchQuery || undefined,
  });
  const users = usersData?.data ?? [];

  const { data: selectedUserData } = useUser(selectedUserId ?? '', {
    enabled: !!selectedUserId,
  });
  const selectedUser = selectedUserData?.data;

  // Mutations
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deactivateUserMutation = useDeactivateUser();
  const reactivateUserMutation = useReactivateUser();

  // Handlers
  const handleCreate = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDeactivate = async (id: string) => {
    if (confirm('Er du sikker på at du vil deaktivere denne brukeren?')) {
      await deactivateUserMutation.mutateAsync(id);
    }
  };

  const handleReactivate = async (id: string) => {
    await reactivateUserMutation.mutateAsync(id);
  };

  const handleViewDetail = (user: User) => {
    setSelectedUserId(user.id);
    setViewMode('detail');
  };

  const handleFormSubmit = async (data: any) => {
    if (editingUser) {
      await updateUserMutation.mutateAsync({ id: editingUser.id, data });
    } else {
      await createUserMutation.mutateAsync(data);
    }
    setIsFormOpen(false);
    setEditingUser(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Heading level={2} data-size="md">
            Brukere
          </Heading>
          <Paragraph
            data-size="sm"
            style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)' }}
          >
            Administrer backoffice-brukere og tilgangsroller
          </Paragraph>
        </div>
        <Button onClick={handleCreate} size="md">
          <PlusIcon />
          Inviter bruker
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 300px', minWidth: '200px' }}>
            <HeaderSearch
              placeholder="Søk etter bruker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
            />
          </div>

          <Dropdown>
            <Dropdown.Trigger asChild>
              <Button variant="secondary" size="sm">
                <FilterIcon />
                Rolle: {roleFilter === 'all' ? 'Alle' : roleLabels[roleFilter]}
              </Button>
            </Dropdown.Trigger>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setRoleFilter('all')}>Alle</Dropdown.Item>
              <Dropdown.Item onClick={() => setRoleFilter('admin')}>Administrator</Dropdown.Item>
              <Dropdown.Item onClick={() => setRoleFilter('saksbehandler')}>Saksbehandler</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown>
            <Dropdown.Trigger asChild>
              <Button variant="secondary" size="sm">
                <FilterIcon />
                Status: {statusFilter === 'all' ? 'Alle' : statusFilter}
              </Button>
            </Dropdown.Trigger>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setStatusFilter('all')}>Alle</Dropdown.Item>
              <Dropdown.Item onClick={() => setStatusFilter('active')}>Aktiv</Dropdown.Item>
              <Dropdown.Item onClick={() => setStatusFilter('inactive')}>Inaktiv</Dropdown.Item>
              <Dropdown.Item onClick={() => setStatusFilter('suspended')}>Suspendert</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Card>

      {/* Results */}
      <Card>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
            <Spinner size="lg" />
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
            <UsersIcon style={{ fontSize: '48px', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-3)' }} />
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              Ingen brukere funnet
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
                ? 'Prøv å endre søkekriteriene'
                : 'Inviter din første bruker for å komme i gang'}
            </Paragraph>
          </div>
        ) : (
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>Navn</Table.HeaderCell>
                <Table.HeaderCell>E-post</Table.HeaderCell>
                <Table.HeaderCell>Telefon</Table.HeaderCell>
                <Table.HeaderCell>Rolle</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Sist innlogget</Table.HeaderCell>
                <Table.HeaderCell style={{ width: '80px' }}>Handlinger</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {users.map((user) => (
                <Table.Row key={user.id} style={{ cursor: 'pointer' }} onClick={() => handleViewDetail(user)}>
                  <Table.Cell>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                      <UserIcon style={{ color: 'var(--ds-color-neutral-text-subtle)' }} />
                      <span style={{ fontWeight: 500 }}>{user.name}</span>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <span style={{ fontSize: 'var(--ds-font-size-sm)' }}>{user.email}</span>
                  </Table.Cell>
                  <Table.Cell>
                    {user.phone ? (
                      <span style={{ fontSize: 'var(--ds-font-size-sm)' }}>{user.phone}</span>
                    ) : (
                      <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>–</span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={roleColors[user.role]}>
                      {roleLabels[user.role]}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={statusColors[user.status]}>
                      {user.status === 'active' ? 'Aktiv' : user.status === 'inactive' ? 'Inaktiv' : 'Suspendert'}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {user.lastLoginAt ? (
                      <span style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                        {new Date(user.lastLoginAt).toLocaleDateString('nb-NO')}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>Aldri</span>
                    )}
                  </Table.Cell>
                  <Table.Cell onClick={(e) => e.stopPropagation()}>
                    <Dropdown>
                      <Dropdown.Trigger asChild>
                        <Button variant="tertiary" size="sm" aria-label="Handlinger">
                          <MoreVerticalIcon />
                        </Button>
                      </Dropdown.Trigger>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => handleViewDetail(user)}>
                          <UserIcon />
                          Se detaljer
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleEdit(user)}>
                          <EditIcon />
                          Rediger
                        </Dropdown.Item>
                        {user.status === 'active' ? (
                          <Dropdown.Item onClick={() => handleDeactivate(user.id)} color="danger">
                            <XCircleIcon />
                            Deaktiver
                          </Dropdown.Item>
                        ) : (
                          <Dropdown.Item onClick={() => handleReactivate(user.id)}>
                            <CheckCircleIcon />
                            Reaktiver
                          </Dropdown.Item>
                        )}
                      </Dropdown.Menu>
                    </Dropdown>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Card>

      {/* Create/Edit Form Drawer */}
      {isFormOpen && (
        <Drawer
          open={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingUser(null);
          }}
          title={editingUser ? 'Rediger bruker' : 'Inviter bruker'}
          size="md"
        >
          <UserForm
            user={editingUser}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingUser(null);
            }}
          />
        </Drawer>
      )}

      {/* Detail Drawer */}
      {viewMode === 'detail' && selectedUser && (
        <Drawer
          open={viewMode === 'detail'}
          onClose={() => {
            setViewMode('list');
            setSelectedUserId(null);
          }}
          title={selectedUser.name}
          size="md"
        >
          <Stack gap={4}>
            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
              <Button variant="secondary" size="sm" onClick={() => handleEdit(selectedUser)}>
                <EditIcon />
                Rediger
              </Button>
              {selectedUser.status === 'active' ? (
                <Button variant="secondary" size="sm" onClick={() => handleDeactivate(selectedUser.id)}>
                  <XCircleIcon />
                  Deaktiver
                </Button>
              ) : (
                <Button variant="secondary" size="sm" onClick={() => handleReactivate(selectedUser.id)}>
                  <CheckCircleIcon />
                  Reaktiver
                </Button>
              )}
            </div>

            {/* User Information */}
            <DrawerSection title="Brukerinformasjon">
              <Stack gap={3}>
                <div>
                  <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                    E-post
                  </div>
                  <a href={`mailto:${selectedUser.email}`} style={{ color: 'var(--ds-color-accent-text-default)' }}>
                    {selectedUser.email}
                  </a>
                </div>

                {selectedUser.phone && (
                  <div>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                      Telefon
                    </div>
                    <a href={`tel:${selectedUser.phone}`} style={{ color: 'var(--ds-color-accent-text-default)' }}>
                      {selectedUser.phone}
                    </a>
                  </div>
                )}

                <div>
                  <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                    Rolle
                  </div>
                  <Badge color={roleColors[selectedUser.role]}>
                    {roleLabels[selectedUser.role]}
                  </Badge>
                </div>

                <div>
                  <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                    Status
                  </div>
                  <Badge color={statusColors[selectedUser.status]}>
                    {selectedUser.status === 'active' ? 'Aktiv' : selectedUser.status === 'inactive' ? 'Inaktiv' : 'Suspendert'}
                  </Badge>
                </div>

                {selectedUser.lastLoginAt && (
                  <div>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                      Sist innlogget
                    </div>
                    <div>{new Date(selectedUser.lastLoginAt).toLocaleString('nb-NO')}</div>
                  </div>
                )}

                <div>
                  <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                    Opprettet
                  </div>
                  <div>{new Date(selectedUser.createdAt).toLocaleDateString('nb-NO')}</div>
                </div>
              </Stack>
            </DrawerSection>

            {/* Activity Section (placeholder) */}
            <DrawerSection title="Aktivitet">
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                Brukerens aktivitetslogg vil vises her.
              </Paragraph>
            </DrawerSection>
          </Stack>
        </Drawer>
      )}
    </div>
  );
}
