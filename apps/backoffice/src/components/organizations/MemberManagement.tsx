/**
 * Member Management Component
 * Add, remove, and manage organization members
 */

import { useState } from 'react';
import {
  Button,
  Table,
  Badge,
  Dropdown,
  Stack,
  Paragraph,
  Select,
  FormField,
  PlusIcon,
  TrashIcon,
  EditIcon,
  UserIcon,
  MoreVerticalIcon,
} from '@xala/ds';
import { useUsers, type OrganizationMember, organizationService } from '@digilist/client-sdk';
import { useQueryClient } from '@tanstack/react-query';
import { useT } from '@xala/i18n';

interface MemberManagementProps {
  organizationId: string;
  members: OrganizationMember[];
}

export function MemberManagement({ organizationId, members }: MemberManagementProps) {
  // Translation function available for future localization
  const _t = useT(); // eslint-disable-line @typescript-eslint/no-unused-vars
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'member'>('member');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch users for the add member dropdown
  const { data: usersData } = useUsers();
  const t = useT();
  const allUsers = usersData?.data ?? [];

  // Filter out users who are already members
  const availableUsers = allUsers.filter(
    user => !members.some(member => member.userId === user.id)
  );

  const handleAddMember = async () => {
    if (!selectedUserId) return;

    setIsSubmitting(true);
    try {
      await organizationService.addMember(organizationId, {
        userId: selectedUserId,
        role: selectedRole,
      });

      // Refresh members list
      queryClient.invalidateQueries({ queryKey: ['organizations', organizationId, 'members'] });

      // Reset form
      setSelectedUserId('');
      setSelectedRole('member');
      setIsAdding(false);
    } catch {
      // Failed to add member
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm(t('common.er_du_sikker_paa'))) {
      return;
    }

    try {
      await organizationService.removeMember(organizationId, memberId);
      queryClient.invalidateQueries({ queryKey: ['organizations', organizationId, 'members'] });
    } catch {
      // Failed to remove member
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: 'admin' | 'member') => {
    try {
      await organizationService.updateMember(organizationId, memberId, { role: newRole });
      queryClient.invalidateQueries({ queryKey: ['organizations', organizationId, 'members'] });
    } catch {
      // Failed to update member role
    }
  };

  return (
    <Stack spacing={4}>
      {/* Add Member Section */}
      <div>
        {!isAdding ? (
          <Button variant="secondary" data-size="sm" onClick={() => setIsAdding(true)} type="button">
            <PlusIcon />
            Legg til medlem
          </Button>
        ) : (
          <div
            style={{
              padding: 'var(--ds-spacing-4)',
              backgroundColor: 'var(--ds-color-neutral-surface-default)',
              borderRadius: 'var(--ds-border-radius-md)',
              border: '1px solid var(--ds-color-neutral-border-default)',
            }}
          >
            <Stack spacing={3}>
              <Paragraph data-size="sm" style={{ fontWeight: 'var(--ds-font-weight-semibold)' }}>
                Legg til nytt medlem
              </Paragraph>

              <FormField label={t('common.velg_bruker')} required>
                <Select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="">{t('common.velg_en_bruker')}</option>
                  {availableUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Rolle" required>
                <Select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as 'admin' | 'member')}
                  disabled={isSubmitting}
                >
                  <option value="member">{t('organizations.text.medlem')}</option>
                  <option value="admin">{t('organizations.text.administrator')}</option>
                </Select>
              </FormField>

              <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
                <Button
                  onClick={handleAddMember}
                  disabled={!selectedUserId || isSubmitting} type="button"
                >
                  {isSubmitting ? t('common.legger_til') : 'Legg til'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsAdding(false);
                    setSelectedUserId('');
                    setSelectedRole('member');
                  }}
                  disabled={isSubmitting} type="button"
                >
                  Avbryt
                </Button>
              </div>
            </Stack>
          </div>
        )}
      </div>

      {/* Members List */}
      {members.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: 'var(--ds-spacing-8)',
            backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
            borderRadius: 'var(--ds-border-radius-md)',
          }}
        >
          <UserIcon
            style={{
              fontSize: 'var(--ds-font-size-heading-lg)',
              color: 'var(--ds-color-neutral-text-subtle)',
              marginBottom: 'var(--ds-spacing-2)',
            }}
          />
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
            Ingen medlemmer ennå. Legg til det første medlemmet for å komme i gang.
          </Paragraph>
        </div>
      ) : (
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>{t('organizations.label.name')}</Table.HeaderCell>
              <Table.HeaderCell>E-post</Table.HeaderCell>
              <Table.HeaderCell>{t('organizations.text.role')}</Table.HeaderCell>
              <Table.HeaderCell>{t('common.medlem_siden')}</Table.HeaderCell>
              <Table.HeaderCell style={{ width: '80px' }}>{t('organizations.text.handlinger')}</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {members.map(member => (
              <Table.Row key={member.id}>
                <Table.Cell>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                    <UserIcon style={{ color: 'var(--ds-color-neutral-text-subtle)' }} />
                    <span style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                      {member.user?.name || 'Ukjent bruker'}
                    </span>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  {member.user?.email || '–'}
                </Table.Cell>
                <Table.Cell>
                  <Badge color={member.role === 'admin' ? 'success' : 'neutral'}>
                    {member.role === 'admin' ? 'Administrator' : 'Medlem'}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <span style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {new Date(member.joinedAt).toLocaleDateString('nb-NO')}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <Dropdown.TriggerContext>
                    <Dropdown.Trigger asChild>
                      <Button variant="tertiary" data-size="sm" aria-label={t('organizations.ariaLabel.handlinger')} type="button">
                        <MoreVerticalIcon />
                      </Button>
                    </Dropdown.Trigger>
                    <Dropdown placement="bottom-end">
                      <Dropdown.List>
                        <Dropdown.Item>
                          <Dropdown.Button onClick={() => handleUpdateRole(member.id, member.role === 'admin' ? 'member' : 'admin')}>
                            <EditIcon />
                            {member.role === 'admin' ? t('common.gjor_til_medlem') : 'Gjør til admin'}
                          </Dropdown.Button>
                        </Dropdown.Item>
                        <Dropdown.Item>
                          <Dropdown.Button onClick={() => handleRemoveMember(member.id)}>
                            <TrashIcon />
                            Fjern medlem
                          </Dropdown.Button>
                        </Dropdown.Item>
                      </Dropdown.List>
                    </Dropdown>
                  </Dropdown.TriggerContext>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </Stack>
  );
}
