/**
 * Users Page - SaaS Admin
 * Platform-wide user management across all tenants
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
        <Spinner size="lg" aria-label={t('common.loading')} />
      </Stack>
    );
  }

  return (
    <Stack direction="column" gap={20}>
      {/* Header */}
      <Stack direction="column" gap={1}>
        <Heading level={2} size="md">
          {t('saasAdmin.nav.users')}
        </Heading>
        <Paragraph size="sm" color="subtle">
          {t('saasAdmin.nav.usersDesc')}
        </Paragraph>
      </Stack>

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
          <Stack direction="horizontal" justify="center" align="center" style={{ padding: 'var(--ds-spacing-8)' }}>
            <Paragraph size="sm" color="subtle">
              {t('common.noResults')}
            </Paragraph>
          </Stack>
        ) : (
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>{t('common.name')}</Table.HeaderCell>
                <Table.HeaderCell>{t('auth.email', { defaultValue: 'Email' })}</Table.HeaderCell>
                <Table.HeaderCell>{t('saasAdmin.tenants.tenantName', { defaultValue: 'Tenant' })}</Table.HeaderCell>
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
                    <Text size="sm">{user.email || '—'}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="sm">{user.tenantId || '—'}</Text>
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

      {/* Results info */}
      <Stack direction="horizontal" justify="end" align="center">
        <Text size="sm" color="var(--ds-color-neutral-text-subtle)">
          {t('common.showing', { defaultValue: 'Showing' })} {filteredUsers.length} {t('common.of', { defaultValue: 'of' })} {users.length} {t('saasAdmin.nav.users', { defaultValue: 'users' })}
        </Text>
      </Stack>
    </Stack>
  );
}

export default UsersPage;
