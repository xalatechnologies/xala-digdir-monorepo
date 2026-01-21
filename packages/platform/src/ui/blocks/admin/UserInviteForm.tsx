/**
 * UserInviteForm - Reusable User Invitation Form
 *
 * A comprehensive form component for inviting users with:
 * - Email validation
 * - Role selection
 * - Organization assignment
 * - Optional scope delegation
 *
 * Usage:
 * ```tsx
 * <UserInviteForm
 *   availableRoles={roles}
 *   availableOrganizations={organizations}
 *   onSubmit={handleInvite}
 * />
 * ```
 */
import React, { useState } from 'react';
import { Card } from '@digdir/designsystemet-react';
import {
  Heading,
  Paragraph,
  Button,
  Textfield,
  Textarea,
  Select,
  Checkbox,
  Alert,
  Label,
} from '@digdir/designsystemet-react';
import {
  MailIcon,
  ShieldIcon,
  CheckIcon,
} from '../../primitives/icons';

export interface InviteUserFormData {
  email: string;
  role: string;
  organizationId?: string;
  sendEmail?: boolean;
  message?: string;
  assignScope?: boolean;
}

export interface UserInviteFormProps {
  /**
   * Available roles for selection
   */
  availableRoles: Array<{
    id: string;
    name: string;
    description: string;
  }>;

  /**
   * Available organizations
   */
  availableOrganizations?: Array<{
    id: string;
    name: string;
  }>;

  /**
   * Callback when form is submitted
   */
  onSubmit: (data: InviteUserFormData) => void | Promise<void>;

  /**
   * Callback when form is cancelled
   */
  onCancel?: () => void;

  /**
   * Loading state
   */
  loading?: boolean;

  /**
   * Default values
   */
  defaultValues?: Partial<InviteUserFormData>;

  /**
   * Show organization field
   */
  showOrganization?: boolean;

  /**
   * Show scope assignment option
   */
  showScopeOption?: boolean;

  /**
   * Show custom message field
   */
  showMessageField?: boolean;
}

export function UserInviteForm({
  availableRoles,
  availableOrganizations = [],
  onSubmit,
  onCancel,
  loading = false,
  defaultValues,
  showOrganization = true,
  showScopeOption = false,
  showMessageField = true,
}: UserInviteFormProps) {
  const [formData, setFormData] = useState<InviteUserFormData>({
    email: defaultValues?.email || '',
    role: defaultValues?.role || '',
    organizationId: defaultValues?.organizationId,
    sendEmail: defaultValues?.sendEmail !== false,
    message: defaultValues?.message || '',
    assignScope: defaultValues?.assignScope || false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof InviteUserFormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof InviteUserFormData, boolean>>>({});

  // Validation
  const validateEmail = (email: string): string | undefined => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Invalid email address';
    return undefined;
  };

  const validateRole = (role: string): string | undefined => {
    if (!role) return 'Role is required';
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof InviteUserFormData, string>> = {};

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const roleError = validateRole(formData.role);
    if (roleError) newErrors.role = roleError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers
  const handleChange = (field: keyof InviteUserFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleBlur = (field: keyof InviteUserFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Validate on blur
    if (field === 'email') {
      const error = validateEmail(formData.email);
      if (error) {
        setErrors((prev) => ({ ...prev, email: error }));
      }
    } else if (field === 'role') {
      const error = validateRole(formData.role);
      if (error) {
        setErrors((prev) => ({ ...prev, role: error }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
  };

  const selectedRole = availableRoles.find((r) => r.id === formData.role);

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
      }}
    >
      <Card style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
        {/* Header */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
            <MailIcon style={{ color: 'var(--ds-color-accent-base-default)' }} />
            <Heading data-size="sm" style={{ margin: 0 }}>
              Invite User
            </Heading>
          </div>
          <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            Send an invitation to join your organization
          </Paragraph>
        </div>

        {/* Email Field */}
        <div>
          <Label id="email-label" htmlFor="email">
            Email Address *
          </Label>
          <Textfield
            id="email"
            type="email"
            aria-labelledby="email-label"
            placeholder="user@example.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            disabled={loading}
            error={touched.email ? errors.email : undefined}
            style={{ width: '100%' }}
          />
          {touched.email && errors.email && (
            <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-danger-text-default)' }}>
              {errors.email}
            </Paragraph>
          )}
        </div>

        {/* Role Field */}
        <div>
          <Label htmlFor="role">
            Role *
          </Label>
          <Select
            id="role"
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value)}
            onBlur={() => handleBlur('role')}
            disabled={loading}
            style={{ width: '100%' }}
          >
            <option value="">Select a role...</option>
            {availableRoles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </Select>
          {touched.role && errors.role && (
            <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-danger-text-default)' }}>
              {errors.role}
            </Paragraph>
          )}
          {selectedRole && (
            <Alert data-color="info" data-size="sm" style={{ marginTop: 'var(--ds-spacing-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                <ShieldIcon />
                <div>
                  <strong>{selectedRole.name}:</strong> {selectedRole.description}
                </div>
              </div>
            </Alert>
          )}
        </div>

        {/* Organization Field */}
        {showOrganization && availableOrganizations.length > 0 && (
          <div>
            <Label htmlFor="organization">
              Organization (Optional)
            </Label>
            <Select
              id="organization"
              value={formData.organizationId || ''}
              onChange={(e) => handleChange('organizationId', e.target.value || undefined)}
              disabled={loading}
              style={{ width: '100%' }}
            >
              <option value="">No organization</option>
              {availableOrganizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </Select>
            <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              Assign the user to an organization
            </Paragraph>
          </div>
        )}

        {/* Custom Message */}
        {showMessageField && (
          <div>
            <Label htmlFor="message">
              Custom Message (Optional)
            </Label>
            <Textarea
              id="message"
              placeholder="Add a personalized message to the invitation email..."
              value={formData.message}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('message', e.target.value)}
              disabled={loading}
              rows={4}
              style={{ width: '100%' }}
            />
          </div>
        )}

        {/* Options */}
        <div
          style={{
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
            borderRadius: 'var(--ds-border-radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--ds-spacing-3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--ds-spacing-3)' }}>
            <Checkbox
              id="sendEmail"
              checked={formData.sendEmail}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('sendEmail', e.target.checked)}
              disabled={loading}
              value="sendEmail"
              aria-labelledby="sendEmail-label"
            />
            <label id="sendEmail-label" htmlFor="sendEmail" style={{ cursor: 'pointer' }}>
              <div style={{ fontWeight: 'var(--ds-font-weight-semibold)' }}>
                Send invitation email
              </div>
              <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                User will receive an email with a link to set up their account
              </Paragraph>
            </label>
          </div>
          {showScopeOption && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--ds-spacing-3)' }}>
              <Checkbox
                id="assignScope"
                checked={formData.assignScope}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('assignScope', e.target.checked)}
                disabled={loading}
                value="assignScope"
                aria-labelledby="assignScope-label"
              />
              <label id="assignScope-label" htmlFor="assignScope" style={{ cursor: 'pointer' }}>
                <div style={{ fontWeight: 'var(--ds-font-weight-semibold)' }}>
                  Configure scope after invitation
                </div>
                <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Proceed to scope assignment after creating the user
                </Paragraph>
              </label>
            </div>
          )}
        </div>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--ds-spacing-3)',
            paddingTop: 'var(--ds-spacing-4)',
            borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
          }}
        >
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? 'Sending Invitation...' : (
              <>
                <CheckIcon /> Send Invitation
              </>
            )}
          </Button>
        </div>
      </Card>
    </form>
  );
}
