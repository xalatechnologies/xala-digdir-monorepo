import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Badge,
  Alert,
} from '@xala/ds';
import { UserIcon, ShieldIcon, BuildingIcon, CheckIcon } from '@xala/ds';
import { UserInviteForm } from '../../src/blocks/admin/UserInviteForm';
import { PermissionMatrix } from '../../src/blocks/admin/PermissionMatrix';
import { ScopeSelector } from '../../src/blocks/admin/ScopeSelector';
import { EffectivePermissionsView } from '../../src/blocks/admin/EffectivePermissionsView';
import type { InviteUserFormData } from '../../src/blocks/admin/UserInviteForm';
import type { Role, Permission } from '../../src/blocks/admin/PermissionMatrix';
import type { ScopeAssignment } from '../../src/blocks/admin/ScopeSelector';

/**
 * Admin components for user and permission management.
 *
 * ## Components
 * - **UserInviteForm**: Form for inviting users with role assignment
 * - **PermissionMatrix**: Role permissions grid (Phase 3)
 * - **ScopeSelector**: Delegation boundary UI (Phase 3)
 * - **EffectivePermissionsView**: Computed permissions display (Phase 3)
 *
 * ## Features
 * - Email validation
 * - Role selection with descriptions
 * - Organization assignment
 * - Custom invitation messages
 *
 * ## Accessibility
 * - Form field labels
 * - Error announcements
 * - Keyboard navigation
 */
const meta: Meta<typeof UserInviteForm> = {
  title: 'Blocks/Admin',
  component: UserInviteForm,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Admin components for managing users, roles, and permissions.

## UserInviteForm
Complete form for inviting new users:
- Email validation
- Role selection
- Organization assignment
- Custom message
- Scope delegation option

## Permission Components (Phase 3)
- PermissionMatrix: Edit role permissions
- ScopeSelector: Configure access scope
- EffectivePermissionsView: View computed permissions
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof UserInviteForm>;

// Sample data
const sampleRoles = [
  { id: 'admin', name: 'Administrator', description: 'Full system access including user management' },
  { id: 'manager', name: 'Manager', description: 'Can manage bookings and rental objects' },
  { id: 'operator', name: 'Operator', description: 'Can view and process bookings' },
  { id: 'viewer', name: 'Viewer', description: 'Read-only access to bookings and reports' },
];

const sampleOrganizations = [
  { id: 'org-1', name: 'Oslo Kommune' },
  { id: 'org-2', name: 'Bergen Kommune' },
  { id: 'org-3', name: 'Trondheim Kommune' },
];

const samplePermissions: Permission[] = [
  { id: 'user.read', name: 'View Users', description: 'View user list and details', category: 'Users', risk: 'low' },
  { id: 'user.create', name: 'Create Users', description: 'Create new users', category: 'Users', risk: 'medium' },
  { id: 'user.delete', name: 'Delete Users', description: 'Delete users from system', category: 'Users', risk: 'high' },
  { id: 'booking.read', name: 'View Bookings', description: 'View booking list and details', category: 'Bookings', risk: 'low' },
  { id: 'booking.create', name: 'Create Bookings', description: 'Create new bookings', category: 'Bookings', risk: 'low' },
  { id: 'booking.approve', name: 'Approve Bookings', description: 'Approve pending bookings', category: 'Bookings', risk: 'medium' },
  { id: 'listing.manage', name: 'Manage Listings', description: 'Create and edit rental objects', category: 'Listings', risk: 'medium' },
  { id: 'reports.view', name: 'View Reports', description: 'Access analytics and reports', category: 'Reports', risk: 'low' },
  { id: 'settings.manage', name: 'Manage Settings', description: 'Configure system settings', category: 'Settings', risk: 'high' },
];

const sampleRolesWithPermissions: Role[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full access',
    color: '#dc2626',
    permissions: samplePermissions.map(p => p.id),
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Manage bookings and listings',
    color: '#2563eb',
    permissions: ['user.read', 'booking.read', 'booking.create', 'booking.approve', 'listing.manage', 'reports.view'],
  },
  {
    id: 'operator',
    name: 'Operator',
    description: 'Process bookings',
    color: '#16a34a',
    permissions: ['booking.read', 'booking.create', 'booking.approve'],
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access',
    color: '#6b7280',
    permissions: ['user.read', 'booking.read', 'reports.view'],
  },
];

/**
 * Default user invite form
 */
export const Default: Story = {
  args: {
    availableRoles: sampleRoles,
    availableOrganizations: sampleOrganizations,
    onSubmit: async (data: InviteUserFormData) => {
      console.log('Invite submitted:', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
    onCancel: () => console.log('Cancelled'),
  },
};

/**
 * Form with default values (editing)
 */
export const WithDefaultValues: Story = {
  render: () => (
    <UserInviteForm
      availableRoles={sampleRoles}
      availableOrganizations={sampleOrganizations}
      defaultValues={{
        email: 'ola.nordmann@example.com',
        role: 'manager',
        organizationId: 'org-1',
        sendEmail: true,
        message: 'Velkommen til teamet!',
      }}
      onSubmit={async (data: InviteUserFormData) => {
        console.log('Updated:', data);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }}
      onCancel={() => console.log('Cancelled')}
    />
  ),
};

/**
 * Form without organization field
 */
export const WithoutOrganization: Story = {
  render: () => (
    <UserInviteForm
      availableRoles={sampleRoles}
      showOrganization={false}
      onSubmit={async (data: InviteUserFormData) => {
        console.log('Invite:', data);
      }}
    />
  ),
};

/**
 * Form with scope option enabled
 */
export const WithScopeOption: Story = {
  render: () => (
    <UserInviteForm
      availableRoles={sampleRoles}
      availableOrganizations={sampleOrganizations}
      showScopeOption={true}
      onSubmit={async (data: InviteUserFormData) => {
        console.log('Invite with scope:', data);
      }}
      onCancel={() => console.log('Cancelled')}
    />
  ),
};

/**
 * Form without message field (minimal)
 */
export const Minimal: Story = {
  render: () => (
    <UserInviteForm
      availableRoles={sampleRoles}
      showOrganization={false}
      showMessageField={false}
      onSubmit={async (data: InviteUserFormData) => {
        console.log('Minimal invite:', data);
      }}
    />
  ),
};

/**
 * Form in loading state
 */
export const Loading: Story = {
  render: () => (
    <UserInviteForm
      availableRoles={sampleRoles}
      availableOrganizations={sampleOrganizations}
      loading={true}
      defaultValues={{
        email: 'loading@example.com',
        role: 'operator',
      }}
      onSubmit={async () => {}}
    />
  ),
};

/**
 * Interactive example with success feedback
 */
export const InteractiveWithFeedback: Story = {
  render: () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState<InviteUserFormData | null>(null);

    const handleSubmit = async (data: InviteUserFormData) => {
      setIsSubmitting(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSubmitting(false);
      setSubmitted(data);
    };

    if (submitted) {
      return (
        <Card style={{ padding: 'var(--ds-spacing-6)', textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--ds-color-success-surface-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--ds-spacing-4)',
          }}>
            <CheckIcon size={32} style={{ color: 'var(--ds-color-success-base-default)' }} />
          </div>
          <Heading level={2} data-size="md" style={{ margin: 0 }}>
            Invitation Sent!
          </Heading>
          <Paragraph style={{ marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            An invitation has been sent to <strong>{submitted.email}</strong>
          </Paragraph>
          <div style={{ marginTop: 'var(--ds-spacing-4)' }}>
            <Badge data-color="accent">{sampleRoles.find(r => r.id === submitted.role)?.name}</Badge>
          </div>
          <Button
            style={{ marginTop: 'var(--ds-spacing-4)' }}
            variant="secondary"
            onClick={() => setSubmitted(null)}
          >
            Invite Another User
          </Button>
        </Card>
      );
    }

    return (
      <UserInviteForm
        availableRoles={sampleRoles}
        availableOrganizations={sampleOrganizations}
        loading={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={() => console.log('Cancelled')}
      />
    );
  },
};

/**
 * Permission Matrix (Phase 3 Preview)
 */
export const PermissionMatrixPreview: Story = {
  render: () => (
    <div>
      <Alert data-color="info" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
        <Paragraph style={{ margin: 0 }}>
          <strong>Phase 3 Component:</strong> The Permission Matrix will be fully implemented
          when tenant admin features are activated.
        </Paragraph>
      </Alert>
      <PermissionMatrix
        roles={sampleRolesWithPermissions}
        permissions={samplePermissions}
        showRiskIndicators={true}
        groupByCategory={true}
        onPermissionToggle={(roleId: string, permId: string, enabled: boolean) =>
          console.log('Toggle:', { roleId, permId, enabled })
        }
      />
    </div>
  ),
};

/**
 * Scope Selector (Phase 3 Preview)
 */
export const ScopeSelectorPreview: Story = {
  render: () => (
    <div>
      <Alert data-color="info" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
        <Paragraph style={{ margin: 0 }}>
          <strong>Phase 3 Component:</strong> The Scope Selector will allow administrators
          to define delegation boundaries for users.
        </Paragraph>
      </Alert>
      <ScopeSelector
        userId="user-123"
        currentScope={{
          scopeType: 'organization',
          organizationIds: ['org-1'],
        }}
        availableObjects={[
          { id: 'obj-1', name: 'Idrettshall A', type: 'SPACE', category: 'sports' },
          { id: 'obj-2', name: 'Møterom B', type: 'SPACE', category: 'meeting' },
        ]}
        availableOrganizations={[
          { id: 'org-1', name: 'Oslo Kommune', rentalObjectCount: 15 },
        ]}
        onScopeChange={(scope: ScopeAssignment) => console.log('Scope changed:', scope)}
      />
    </div>
  ),
};

/**
 * Effective Permissions View (Phase 3 Preview)
 */
export const EffectivePermissionsPreview: Story = {
  render: () => (
    <div>
      <Alert data-color="info" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
        <Paragraph style={{ margin: 0 }}>
          <strong>Phase 3 Component:</strong> The Effective Permissions View will show
          computed permissions from all sources (role, organization, scope).
        </Paragraph>
      </Alert>
      <EffectivePermissionsView
        userId="user-123"
        permissions={[
          {
            id: 'booking.read',
            name: 'View Bookings',
            description: 'View booking list and details',
            category: 'Bookings',
            source: 'role',
            sourceDetail: 'Manager role',
            risk: 'low',
          },
          {
            id: 'booking.approve',
            name: 'Approve Bookings',
            description: 'Approve pending bookings',
            category: 'Bookings',
            source: 'scope',
            sourceDetail: 'Oslo Kommune scope',
            risk: 'medium',
          },
        ]}
        showSource={true}
        showRiskIndicators={true}
        groupByCategory={true}
      />
    </div>
  ),
};

/**
 * Admin Dashboard (complete example)
 */
export const AdminDashboard: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState<'invite' | 'permissions' | 'scope'>('invite');

    return (
      <div>
        <Heading level={1} data-size="lg" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          User Administration
        </Heading>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: 'var(--ds-spacing-2)',
          marginBottom: 'var(--ds-spacing-4)',
          borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
          paddingBottom: 'var(--ds-spacing-2)',
        }}>
          <Button
            variant={activeTab === 'invite' ? 'primary' : 'tertiary'}
            data-size="sm"
            onClick={() => setActiveTab('invite')}
          >
            <UserIcon size={16} />
            Invite User
          </Button>
          <Button
            variant={activeTab === 'permissions' ? 'primary' : 'tertiary'}
            data-size="sm"
            onClick={() => setActiveTab('permissions')}
          >
            <ShieldIcon size={16} />
            Permissions
          </Button>
          <Button
            variant={activeTab === 'scope' ? 'primary' : 'tertiary'}
            data-size="sm"
            onClick={() => setActiveTab('scope')}
          >
            <BuildingIcon size={16} />
            Scope
          </Button>
        </div>

        {/* Content */}
        {activeTab === 'invite' && (
          <UserInviteForm
            availableRoles={sampleRoles}
            availableOrganizations={sampleOrganizations}
            showScopeOption={true}
            onSubmit={async (data: InviteUserFormData) => {
              console.log('Invite:', data);
              await new Promise(resolve => setTimeout(resolve, 1000));
            }}
            onCancel={() => console.log('Cancelled')}
          />
        )}

        {activeTab === 'permissions' && (
          <PermissionMatrix
            roles={sampleRolesWithPermissions}
            permissions={samplePermissions}
            showRiskIndicators={true}
            groupByCategory={true}
          />
        )}

        {activeTab === 'scope' && (
          <ScopeSelector
            userId="user-123"
            onScopeChange={() => {}}
          />
        )}
      </div>
    );
  },
};
