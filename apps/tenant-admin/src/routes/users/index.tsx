/**
 * Users Page - Tenant Admin
 * Tenant user management
 */

import { useState, useMemo } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Table,
  Badge,
  Spinner,
  HeaderSearch,
  Text,
  Stack,
  Button,
  PlusIcon,
  EmptyState,
  DataPageHeader,
  UsersIcon,
} from '@xala/ds';
import { useUsers } from '@digilist/client-sdk/hooks';
import { useT } from '@xala/i18n';

export function UsersPage() {
  const t = useT();
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: usersData, isLoading } = useUsers({
    search: searchQuery || undefined,
  });
  const users = usersData?.data ?? [];

  // Filter users by search if needed
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  if (isLoading) {
    return (
      <Stack direction="horizontal" justify="center" align="center" style={{ padding: 'var(--ds-spacing-8)' }}>
        <Spinner data-size="lg" aria-label={t('common.loading')} />
      </Stack>
    );
  }

  return (
    <Stack direction="column" gap={20}>
      {/* Header */}
      <DataPageHeader
        title={t('tenantAdmin.nav.users')}
        count={usersData?.meta?.total ?? filteredUsers.length}
        countLabel={`{{count}} ${t('tenantAdmin.nav.users').toLowerCase()}`}
        actions={
          <Button variant="primary" data-size="sm">
            <PlusIcon />
            {t('common.create', { defaultValue: 'Create' })}
          </Button>
        }
      />
      {t('tenantAdmin.nav.usersDesc') && (
        <Paragraph data-size="sm" data-color="subtle" style={{ marginTop: 'var(--ds-spacing-2)' }}>
          {t('tenantAdmin.nav.usersDesc')}
        </Paragraph>
      )}

      {/* Search */}
      <Card>
        <HeaderSearch
          placeholder={t('common.search', { defaultValue: 'Search users...' })}
          value={searchQuery}
          onSearchChange={(value) => setSearchQuery(value)}
        />
      </Card>

      {/* Users Table */}
      <Card>
        {filteredUsers.length === 0 ? (
          <EmptyState
            icon={<UsersIcon size={48} />}
            title={t('common.noResults')}
            description={
              searchQuery
                ? t('dataPage.emptyState.tryDifferentFilters')
                : t('common.noResults')
            }
            size="md"
            bordered
          />
        ) : (
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>{t('common.name')}</Table.HeaderCell>
                <Table.HeaderCell>{t('auth.email', { defaultValue: 'Email' })}</Table.HeaderCell>
                <Table.HeaderCell>{t('common.status')}</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {filteredUsers.map((user) => (
                <Table.Row key={user.id}>
                  <Table.Cell>
                    <Text size="sm" weight="medium">
                      {user.name || t('common.unknown')}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text data-size="sm">{user.email || '—'}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={user.active ? 'success' : 'neutral'}>
                      {user.active ? t('saasAdmin.tenants.statusActive') : t('saasAdmin.tenants.statusSuspended')}
                    </Badge>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Card>
    </Stack>
  );
}

export default UsersPage;
