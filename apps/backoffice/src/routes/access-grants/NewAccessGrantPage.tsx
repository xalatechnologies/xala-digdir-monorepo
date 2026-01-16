/**
 * New Access Grant Page
 * Commune Admin page for granting organization access to rental objects
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  FormField,
  Select,
  Spinner,
  Stack,
  ArrowLeftIcon,
  ShieldCheckIcon,
  Alert,
  Textfield,
} from '@xala/ds';
import {
  useOrganizations,
  useListings,
  useGrantAccess,
  type CreateAccessGrantDTO,
} from '@digilist/client-sdk';
import { FormSection, FormActions } from '../../components/shared';

export function NewAccessGrantPage() {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState<CreateAccessGrantDTO>({
    organizationId: '',
    rentalObjectId: '',
    expiresAt: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Queries
  const { data: orgData, isLoading: orgsLoading } = useOrganizations({ limit: 100 });
  const organizations = orgData?.data ?? [];

  const { data: listingsData, isLoading: listingsLoading } = useListings({ limit: 100 });
  const listings = listingsData?.data ?? [];

  // Mutations
  const grantAccessMutation = useGrantAccess();

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.organizationId) {
      newErrors.organizationId = 'Velg en organisasjon';
    }

    if (!formData.rentalObjectId) {
      newErrors.rentalObjectId = 'Velg et utleieobjekt';
    }

    // Validate expiry date is in the future if provided
    if (formData.expiresAt) {
      const expiresAt = new Date(formData.expiresAt);
      if (expiresAt <= new Date()) {
        newErrors.expiresAt = 'Utløpsdato må være i fremtiden';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) {
      return;
    }

    try {
      await grantAccessMutation.mutateAsync({
        organizationId: formData.organizationId,
        rentalObjectId: formData.rentalObjectId,
        expiresAt: formData.expiresAt || undefined,
        notes: formData.notes || undefined,
      });

      navigate('/access-grants');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Kunne ikke opprette tilgangstildeling';
      setSubmitError(errorMessage);
    }
  };

  const handleCancel = () => {
    navigate('/access-grants');
  };

  const handleChange = (field: keyof typeof formData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    // Clear submit error
    if (submitError) {
      setSubmitError(null);
    }
  };

  const isLoading = orgsLoading || listingsLoading;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <Link to="/access-grants">
          <Button variant="tertiary" data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }} type="button">
            <ArrowLeftIcon />
            Tilbake til oversikt
          </Button>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
          <ShieldCheckIcon style={{ fontSize: 'var(--ds-font-size-heading-md)', color: 'var(--ds-color-brand-base)' }} />
          <div>
            <Heading level={2} data-size="lg">
              Ny tilgangstildeling
            </Heading>
            <Paragraph
              data-size="sm"
              style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)' }}
            >
              Gi en organisasjon tilgang til et utleieobjekt
            </Paragraph>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {submitError && (
        <Alert severity="danger">
          <Heading level={3} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-1)' }}>
            Feil ved oppretting
          </Heading>
          <Paragraph data-size="sm">{submitError}</Paragraph>
        </Alert>
      )}

      {/* Form */}
      <Card>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
            <Spinner data-size="lg" aria-label="Laster data..." />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <Stack spacing={5}>
              {/* Organization Selection */}
              <FormSection
                title="Organisasjon"
                description="Velg organisasjonen som skal få tilgang"
              >
                <FormField
                  label="Organisasjon"
                  required
                  error={errors.organizationId || undefined}
                >
                  <Select
                    value={formData.organizationId}
                    onChange={(e) => handleChange('organizationId')(e.target.value)}
                    aria-label="Velg organisasjon"
                  >
                    <option value="">Velg organisasjon...</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                        {org.organizationNumber ? ` (${org.organizationNumber})` : ''}
                      </option>
                    ))}
                  </Select>
                </FormField>
              </FormSection>

              {/* Rental Object Selection */}
              <FormSection
                title="Utleieobjekt"
                description="Velg utleieobjektet organisasjonen skal få tilgang til"
              >
                <FormField
                  label="Utleieobjekt"
                  required
                  error={errors.rentalObjectId || undefined}
                >
                  <Select
                    value={formData.rentalObjectId}
                    onChange={(e) => handleChange('rentalObjectId')(e.target.value)}
                    aria-label="Velg utleieobjekt"
                  >
                    <option value="">Velg utleieobjekt...</option>
                    {listings.map((listing) => (
                      <option key={listing.id} value={listing.id}>
                        {listing.name}
                        {listing.type ? ` (${listing.type})` : ''}
                      </option>
                    ))}
                  </Select>
                </FormField>
              </FormSection>

              {/* Validity Period */}
              <FormSection
                title="Gyldighetsperiode"
                description="Valgfritt: Angi når tilgangen utløper"
              >
                <Stack spacing={4}>
                  <FormField
                    label="Utløpsdato"
                    error={errors.expiresAt || undefined}
                  >
                    <Textfield
                      type="date"
                      value={formData.expiresAt || ''}
                      onChange={(e) => handleChange('expiresAt')(e.target.value)}
                      aria-label="Utløpsdato"
                    />
                  </FormField>

                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Hvis ingen dato angis, vil tilgangen gjelde uten utløpsdato.
                  </Paragraph>
                </Stack>
              </FormSection>

              {/* Notes */}
              <FormSection
                title="Notater"
                description="Valgfritt: Legg til interne notater om tildelingen"
              >
                <FormField label="Notater">
                  <Textfield
                    value={formData.notes || ''}
                    onChange={(e) => handleChange('notes')(e.target.value)}
                    placeholder="F.eks. Avtale gjelder sesong 2024/2025"
                    aria-label="Notater"
                  />
                </FormField>
              </FormSection>

              {/* Actions */}
              <FormActions
                submitText="Opprett tilgangstildeling"
                onCancel={handleCancel}
                isSubmitting={grantAccessMutation.isPending}
                submittingText="Oppretter..."
              />
            </Stack>
          </form>
        )}
      </Card>
    </div>
  );
}
