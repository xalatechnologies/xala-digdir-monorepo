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

interface MemberManagementProps {
  organizationId: string;
  members: OrganizationMember[];
}

export function MemberManagement({ organizationId, members }: MemberManagementProps) {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'member'>('member');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch users for the add member dropdown
  const { data: usersData } = useUsers();
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
    } catch (error) {
      console.error('Failed to add member:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Er du sikker på at du vil fjerne dette medlemmet?')) {
      return;
    }

    try {
      await organizationService.removeMember(organizationId, memberId);
      queryClient.invalidateQueries({ queryKey: ['organizations', organizationId, 'members'] });
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: 'admin' | 'member') => {
    try {
      await organizationService.updateMember(organizationId, memberId, { role: newRole });
      queryClient.invalidateQueries({ queryKey: ['organizations', organizationId, 'members'] });
    } catch (error) {
      console.error('Failed to update member role:', error);
    }
  };

  return (
    <Stack spacing={4}>
      {/* Add Member Section */}
      <div>
        {!isAdding ? (
          <Button variant="secondary" data-size="sm" onClick={() => setIsAdding(true)}>
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
              <Paragraph data-size="sm" style={{ fontWeight: 600 }}>
                Legg til nytt medlem
              </Paragraph>

              <FormField label="Velg bruker" required>
                <Select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="">Velg en bruker...</option>
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
                  <option value="member">Medlem</option>
                  <option value="admin">Administrator</option>
                </Select>
              </FormField>

              <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
                <Button
                  size="sm"
                  onClick={handleAddMember}
                  disabled={!selectedUserId || isSubmitting}
                >
                  {isSubmitting ? 'Legger til...' : 'Legg til'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setIsAdding(false);
                    setSelectedUserId('');
                    setSelectedRole('member');
                  }}
                  disabled={isSubmitting}
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
              fontSize: '48px',
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
              <Table.HeaderCell>Navn</Table.HeaderCell>
              <Table.HeaderCell>E-post</Table.HeaderCell>
              <Table.HeaderCell>Rolle</Table.HeaderCell>
              <Table.HeaderCell>Medlem siden</Table.HeaderCell>
              <Table.HeaderCell style={{ width: '80px' }}>Handlinger</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {members.map(member => (
              <Table.Row key={member.id}>
                <Table.Cell>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                    <UserIcon style={{ color: 'var(--ds-color-neutral-text-subtle)' }} />
                    <span style={{ fontWeight: 500 }}>
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
                  <Dropdown>
                    <Dropdown.Trigger asChild>
                      <Button variant="tertiary" data-size="sm" aria-label="Handlinger">
                        <MoreVerticalIcon />
                      </Button>
                    </Dropdown.Trigger>
                    <Dropdown.Content>
                      <Dropdown.Item
                        onClick={() => handleUpdateRole(member.id, member.role === 'admin' ? 'member' : 'admin')}
                      >
                        <EditIcon />
                        {member.role === 'admin' ? 'Gjør til medlem' : 'Gjør til admin'}
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => handleRemoveMember(member.id)} color="danger">
                        <TrashIcon />
                        Fjern medlem
                      </Dropdown.Item>
                    </Dropdown.Content>
                  </Dropdown>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </Stack>
  );
}
