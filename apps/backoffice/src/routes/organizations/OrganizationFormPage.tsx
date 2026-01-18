/**
 * Organization Form Page
 * Full-page form for creating and editing organizations
 */

import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Spinner,
  ArrowLeftIcon,
} from '@xala/ds';
import {
  useOrganization,
  useCreateOrganization,
  useUpdateOrganization,
  useUpdateOrganizationBranding,
  type CreateOrganizationDTO,
} from '@digilist/client-sdk';
import { OrganizationForm } from '../../components/organizations/OrganizationForm';
import { OrganizationWizard, type OrganizationWizardData } from '../../components/organizations/OrganizationWizard';
import { useT } from '@xala/i18n';

export function OrganizationFormPage() {
  const t = useT();
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  // Queries
  const { data: orgData, isLoading } = useOrganization(id!, {
    enabled: isEditing,
  });
  const organization = orgData?.data;

  // Mutations
  const createOrgMutation = useCreateOrganization();
  const updateOrgMutation = useUpdateOrganization();
  const updateBrandingMutation = useUpdateOrganizationBranding();

  // Handlers
  const handleSubmit = async (data: CreateOrganizationDTO) => {
    if (isEditing && id) {
      await updateOrgMutation.mutateAsync({ id, data });
      navigate(`/organizations/${id}`);
    } else {
      const result = await createOrgMutation.mutateAsync(data);
      navigate(`/organizations/${result.data.id}`);
    }
  };

  const handleCancel = () => {
    if (isEditing && id) {
      navigate(`/organizations/${id}`);
    } else {
      navigate('/organizations');
    }
  };

  const handleWizardComplete = async (data: OrganizationWizardData) => {
    // Extract basic organization fields for creation
    const createData: CreateOrganizationDTO = {
      name: data.name,
      actorType: data.actorType || 'municipality',
      organizationNumber: data.organizationNumber,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      postalCode: data.postalCode,
    };

    // Create the organization
    const result = await createOrgMutation.mutateAsync(createData);
    const newOrgId = result.data.id;

    // Update branding if provided
    if (data.branding) {
      const { logo, primaryColor, secondaryColor, favicon } = data.branding;
      if (logo || primaryColor || secondaryColor || favicon) {
        await updateBrandingMutation.mutateAsync({
          id: newOrgId,
          data: {
            logo,
            primaryColor,
            secondaryColor,
            favicon,
          },
        });
      }
    }

    // Navigate to the new organization
    navigate(`/organizations/${newOrgId}`);
  };

  if (isEditing && isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Spinner data-size="lg" aria-label={t("state.loading")} />
      </div>
    );
  }

  if (isEditing && !organization) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Heading level={3} data-size="sm">{t('organizations.text.organisasjonIkkeFunnet')}</Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)' }}>
          Organisasjonen eksisterer ikke eller er slettet.
        </Paragraph>
        <Link to="/organizations">
          <Button variant="secondary" data-size="sm" style={{ marginTop: 'var(--ds-spacing-4)' }} type="button">
            <ArrowLeftIcon />
            Tilbake til oversikt
          </Button>
        </Link>
      </div>
    );
  }

  // Render wizard for creation, form for editing
  if (!isEditing) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)', maxWidth: '1000px', margin: '0 auto', padding: 'var(--ds-spacing-4)' }}>
        {/* Back button */}
        <div>
          <Link to="/organizations">
            <Button variant="tertiary" data-size="sm" type="button">
              <ArrowLeftIcon />
              Tilbake til oversikt
            </Button>
          </Link>
        </div>

        {/* Wizard */}
        <OrganizationWizard
          onComplete={handleWizardComplete}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  // Edit mode - show traditional form
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <Link to={`/organizations/${id}`}>
          <Button variant="tertiary" data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }} type="button">
            <ArrowLeftIcon />
            Tilbake til organisasjon
          </Button>
        </Link>

        <Heading level={2} data-size="lg">
          Rediger organisasjon
        </Heading>
        <Paragraph
          data-size="sm"
          style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)' }}
        >
          Oppdater informasjon om organisasjonen
        </Paragraph>
      </div>

      {/* Form */}
      <Card>
        <OrganizationForm
          organization={organization ?? null}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </Card>
    </div>
  );
}
