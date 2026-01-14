/**
 * EmailRecipientsInput Component
 * Manage email recipients for scheduled reports
 */

import { useState } from 'react';
import {
  Card,
  Stack,
  Heading,
  Paragraph,
  FormField,
  Textfield,
  Button,
  Badge,
  PlusIcon,
  XCircleIcon,
} from '@xala/ds';
import type { EmailRecipient } from '@digilist/client-sdk';

interface EmailRecipientsInputProps {
  value: EmailRecipient[];
  onChange: (recipients: EmailRecipient[]) => void;
}

export function EmailRecipientsInput({ value, onChange }: EmailRecipientsInputProps) {
  const [newRecipient, setNewRecipient] = useState<Partial<EmailRecipient>>({
    email: '',
    name: '',
  });
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddRecipient = () => {
    if (!newRecipient.email) {
      setEmailError('E-postadresse er påkrevd');
      return;
    }

    if (!validateEmail(newRecipient.email)) {
      setEmailError('Ugyldig e-postadresse');
      return;
    }

    // Check for duplicate email
    if (value.some((r) => r.email === newRecipient.email)) {
      setEmailError('E-postadressen er allerede lagt til');
      return;
    }

    const recipient: EmailRecipient = {
      email: newRecipient.email,
      ...(newRecipient.name && { name: newRecipient.name }),
    };

    onChange([...value, recipient]);
    setNewRecipient({ email: '', name: '' });
    setEmailError(null);
  };

  const handleRemoveRecipient = (email: string) => {
    onChange(value.filter((r) => r.email !== email));
  };

  const handleEmailChange = (email: string) => {
    setNewRecipient({ ...newRecipient, email });
    if (emailError) {
      setEmailError(null);
    }
  };

  const handleNameChange = (name: string) => {
    setNewRecipient({ ...newRecipient, name });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddRecipient();
    }
  };

  return (
    <Card>
      <Stack gap={5}>
        <div>
          <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
            E-postmottakere
          </Heading>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
            Legg til e-postadresser som skal motta rapporten
          </Paragraph>
        </div>

        <Stack gap={4}>
          {/* Add New Recipient Form */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr auto',
              gap: 'var(--ds-spacing-3)',
              alignItems: 'end',
            }}
          >
            <FormField
              label="E-postadresse"
              description={emailError || undefined}
              error={!!emailError}
            >
              <Textfield
                type="email"
                value={newRecipient.email || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleEmailChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="eksempel@kommune.no"
                error={!!emailError}
              />
            </FormField>

            <FormField label="Navn (valgfritt)">
              <Textfield
                type="text"
                value={newRecipient.name || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNameChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ole Nordmann"
              />
            </FormField>

            <Button
              onClick={handleAddRecipient}
              variant="secondary"
              style={{ marginBottom: 'var(--ds-spacing-1)' }}
            >
              <PlusIcon style={{ marginRight: 'var(--ds-spacing-2)' }} />
              Legg til
            </Button>
          </div>

          {/* Recipients List */}
          {value.length > 0 ? (
            <div>
              <Paragraph
                data-size="sm"
                style={{
                  fontWeight: 500,
                  marginBottom: 'var(--ds-spacing-3)',
                  color: 'var(--ds-color-neutral-text-default)',
                }}
              >
                Mottakere ({value.length})
              </Paragraph>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--ds-spacing-2)',
                }}
              >
                {value.map((recipient) => (
                  <div
                    key={recipient.email}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 'var(--ds-spacing-3)',
                      backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
                      borderRadius: 'var(--ds-border-radius-md)',
                      border: '1px solid var(--ds-color-neutral-border-subtle)',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--ds-spacing-2)',
                        }}
                      >
                        <Paragraph
                          data-size="sm"
                          style={{
                            fontWeight: 500,
                            color: 'var(--ds-color-neutral-text-default)',
                          }}
                        >
                          {recipient.email}
                        </Paragraph>
                        {recipient.name && (
                          <Badge color="neutral" style={{ fontSize: '0.75rem' }}>
                            {recipient.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="tertiary"
                      size="sm"
                      onClick={() => handleRemoveRecipient(recipient.email)}
                      aria-label={`Fjern ${recipient.email}`}
                    >
                      <XCircleIcon style={{ width: '16px', height: '16px' }} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: 'var(--ds-spacing-4)',
                backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
                borderRadius: 'var(--ds-border-radius-md)',
                textAlign: 'center',
              }}
            >
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                Ingen mottakere lagt til ennå. Legg til minst én e-postadresse for å motta rapporten.
              </Paragraph>
            </div>
          )}
        </Stack>

        {/* Info Message */}
        {value.length > 0 && (
          <div
            style={{
              padding: 'var(--ds-spacing-3)',
              backgroundColor: 'var(--ds-color-info-surface-subtle)',
              borderRadius: 'var(--ds-border-radius-md)',
              borderLeft: '3px solid var(--ds-color-info-border-default)',
            }}
          >
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-info-text-default)' }}>
              Rapporten sendes til alle angitte mottakere når den genereres.
            </Paragraph>
          </div>
        )}
      </Stack>
    </Card>
  );
}
