/**
 * Tenant User Invite Page
 * BO-TENANT-ADMIN can invite new users to their tenant (kommune)
 *
 * Features:
 * - Email validation
 * - Role selection (BO-ORG-ADMIN, BO-ORG-MEMBER, BO-CASE-HANDLER)
 * - Optional organization assignment
 * - Success toast + redirect to user list
 * - Inline error handling
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Textfield,
  Select,
  Alert,
  Spinner,
  PageHeader,
  Container,
  Stack,
  ArrowLeftIcon,
  SendIcon,
} from '@xala/ds';
import {
  useInviteTenantUser,
  useOrganizations,
} from '@digilist/client-sdk/hooks';
import { useT } from '@xala/i18n';
import { useToast } from '../../../providers/ToastProvider';
import type { TenantUserRole as UserRole } from '@digilist/client-sdk';

interface InviteUserFormData {
  email: string;
  role: UserRole | '';
  organizationId: string;
  firstName: string;
  lastName: string;
}

// Note: roleOptions will be initialized inside component to access t() function

export function TenantUserInvitePage() {
  const t = useT();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Role options with localized labels
  const roleOptions: { value: UserRole; label: string }[] = [
    { value: 'BO-ORG-ADMIN', label: t('tenantAdmin.roles.orgAdmin') },
    { value: 'BO-ORG-MEMBER', label: t('tenantAdmin.roles.orgMember') },
    { value: 'BO-CASE-HANDLER', label: t('tenantAdmin.roles.caseHandler') },
  ];

  // Form state
  const [formData, setFormData] = useState<InviteUserFormData>({
    email: '',
    role: '',
    organizationId: '',
    firstName: '',
    lastName: '',
  });

  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof InviteUserFormData, string>>>({});

  // Queries
  const { data: organizationsData, isLoading: isLoadingOrgs } = useOrganizations({ limit: 100 });
  const organizations = organizationsData?.data ?? [];

  // Mutations
  const inviteUserMutation = useInviteTenantUser();

  // Handlers
  const handleChange = (field: keyof InviteUserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof InviteUserFormData, string>> = {};

    // Required fields
    if (!formData.email) {
      errors.email = t('tenantAdmin.users.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t('tenantAdmin.users.emailInvalid');
    }

    if (!formData.role) {
      errors.role = t('tenantAdmin.users.roleRequired');
    }

    if (!formData.firstName) {
      errors.firstName = t('tenantAdmin.users.firstNameRequired');
    }

    if (!formData.lastName) {
      errors.lastName = t('tenantAdmin.users.lastNameRequired');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await inviteUserMutation.mutateAsync({
        email: formData.email,
        role: formData.role as UserRole,
        organizationId: formData.organizationId || undefined,
        firstName: formData.firstName,
        lastName: formData.lastName,
        sendEmail: true,
      });

      showToast({
        type: 'success',
        message: t('tenantAdmin.users.inviteSuccess'),
      });

      navigate('/tenant/users');
    } catch (error: any) {
      showToast({
        type: 'error',
        message: error.message || t('tenantAdmin.users.inviteError'),
      });
    }
  };

  const handleCancel = () => {
    navigate('/tenant/users');
  };

  return (
    <Container>
      <PageHeader
        title={t('tenantAdmin.users.inviteUser')}
        description={t('tenantAdmin.users.inviteDescription')}
        breadcrumbs={[
          { label: t('nav.dashboard'), href: '/' },
          { label: t('tenantAdmin.nav.users'), href: '/tenant/users' },
          { label: t('tenantAdmin.users.inviteUser'), href: '/tenant/users/invite' },
        ]}
        actions={
          <Button
            variant="tertiary"
            icon={<ArrowLeftIcon aria-hidden />}
            onClick={handleCancel} type="button"
          >
            {t('common.back')}
          </Button>
        }
      />

      <Stack gap="6">
        <Card>
          <form onSubmit={handleSubmit}>
            <Stack gap="6">
              <Heading level={2} size="md">
                {t('tenantAdmin.users.userDetails')}
              </Heading>

              {/* First Name */}
              <Textfield
                label={t('tenantAdmin.users.firstName')}
                placeholder={t('tenantAdmin.users.firstNamePlaceholder')}
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                error={validationErrors.firstName}
                required
              />

              {/* Last Name */}
              <Textfield
                label={t('tenantAdmin.users.lastName')}
                placeholder={t('tenantAdmin.users.lastNamePlaceholder')}
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                error={validationErrors.lastName}
                required
              />

              {/* Email */}
              <Textfield
                label={t('users.email')}
                type="email"
                placeholder={t('tenantAdmin.users.emailPlaceholder')}
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={validationErrors.email}
                description={t('tenantAdmin.users.emailDescription')}
                required
              />

              {/* Role */}
              <Select
                label={t('users.role')}
                placeholder={t('tenantAdmin.users.selectRole')}
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                error={validationErrors.role}
                required
              >
                <option value="">{t('tenantAdmin.users.selectRole')}</option>
                {roleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>

              {/* Organization (Optional) */}
              <Select
                label={t('tenantAdmin.users.organization')}
                placeholder={t('tenantAdmin.users.selectOrganization')}
                value={formData.organizationId}
                onChange={(e) => handleChange('organizationId', e.target.value)}
                description={t('tenantAdmin.users.organizationDescription')}
                disabled={isLoadingOrgs}
              >
                <option value="">{t('tenantAdmin.users.noOrganization')}</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </Select>

              {/* Info Alert */}
              <Alert variant="info">
                <Paragraph size="sm">
                  {t('tenantAdmin.users.inviteInfo')}
                </Paragraph>
              </Alert>

              {/* Form Actions */}
              <div style={{
                display: 'flex',
                gap: 'var(--ds-spacing-4)',
                justifyContent: 'flex-end',
                marginTop: 'var(--ds-spacing-4)',
              }}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancel}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  icon={<SendIcon aria-hidden />}
                  disabled={inviteUserMutation.isPending}
                >
                  {inviteUserMutation.isPending ? (
                    <>
                      <Spinner size="sm" />
                      {t('tenantAdmin.users.sending')}
                    </>
                  ) : (
                    t('tenantAdmin.users.sendInvite')
                  )}
                </Button>
              </div>
            </Stack>
          </form>
        </Card>

        {/* Help Card */}
        <Card variant="outlined">
          <Stack gap="4">
            <Heading level={3} size="sm">
              {t('tenantAdmin.users.inviteHelp')}
            </Heading>
            <Paragraph size="sm">
              {t('tenantAdmin.users.inviteHelpDescription')}
            </Paragraph>
            <ul style={{
              marginLeft: 'var(--ds-spacing-6)',
              fontSize: 'var(--ds-font-size-sm)',
              color: 'var(--ds-color-neutral-text-subtle)',
            }}>
              <li>{t('tenantAdmin.users.inviteHelpPoint1')}</li>
              <li>{t('tenantAdmin.users.inviteHelpPoint2')}</li>
              <li>{t('tenantAdmin.users.inviteHelpPoint3')}</li>
            </ul>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}

export default TenantUserInvitePage;
