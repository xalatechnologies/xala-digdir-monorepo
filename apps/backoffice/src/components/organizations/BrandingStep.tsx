/**
 * Branding Step Component
 * Logo and color configuration for organization branding
 */

/* eslint-disable digdir/prefer-ds-components, digdir/require-interactive-labels -- File upload component */

import { useCallback, useState } from 'react';
import { Stack, FormField, Paragraph, Heading, Card, Button } from '@xala/ds';

// =============================================================================
// Types
// =============================================================================

export interface BrandingData {
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  favicon?: string;
}

export interface BrandingStepProps {
  data: BrandingData;
  onChange: (data: BrandingData) => void;
  errors?: string[];
}

// =============================================================================
// Component
// =============================================================================

export function BrandingStep({ data, onChange, errors = [] }: BrandingStepProps) {
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [isDraggingFavicon, setIsDraggingFavicon] = useState(false);

  // Logo upload handlers
  const handleLogoDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingLogo(true);
  }, []);

  const handleLogoDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingLogo(false);
  }, []);

  const handleLogoDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDraggingLogo(false);

      const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
      if (files.length === 0) return;

      const file = files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ ...data, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    },
    [data, onChange]
  );

  const handleLogoSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'));
      if (files.length === 0) return;

      const file = files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ ...data, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    },
    [data, onChange]
  );

  const handleRemoveLogo = useCallback(() => {
    onChange({ ...data, logo: undefined });
  }, [data, onChange]);

  // Favicon upload handlers
  const handleFaviconDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFavicon(true);
  }, []);

  const handleFaviconDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFavicon(false);
  }, []);

  const handleFaviconDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDraggingFavicon(false);

      const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
      if (files.length === 0) return;

      const file = files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ ...data, favicon: reader.result as string });
      };
      reader.readAsDataURL(file);
    },
    [data, onChange]
  );

  const handleFaviconSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'));
      if (files.length === 0) return;

      const file = files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ ...data, favicon: reader.result as string });
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    },
    [data, onChange]
  );

  const handleRemoveFavicon = useCallback(() => {
    onChange({ ...data, favicon: undefined });
  }, [data, onChange]);

  // Color handlers
  const handlePrimaryColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ ...data, primaryColor: e.target.value });
    },
    [data, onChange]
  );

  const handleSecondaryColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ ...data, secondaryColor: e.target.value });
    },
    [data, onChange]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div>
        <Heading level={2} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          Visuell identitet
        </Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
          Konfigurer logo, farger og favicon for organisasjonen
        </Paragraph>
      </div>

      {errors.length > 0 && (
        <div
          style={{
            padding: 'var(--ds-spacing-3)',
            backgroundColor: 'var(--ds-color-danger-surface-default)',
            borderRadius: 'var(--ds-border-radius-md)',
            border: '1px solid var(--ds-color-danger-border-default)',
          }}
        >
          {errors.map((error, idx) => (
            <Paragraph key={idx} data-size="sm" style={{ color: 'var(--ds-color-danger-text-default)', margin: 0 }}>
              {error}
            </Paragraph>
          ))}
        </div>
      )}

      {/* LOGO SECTION */}
      <Card
        style={{
          padding: 'var(--ds-spacing-5)',
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          border: '1px solid var(--ds-color-neutral-border-subtle)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--ds-color-accent-base-default)' }}>
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <div>
              <Heading level={3} data-size="xs" style={{ margin: 0 }}>
                Logo
              </Heading>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                Hovedlogo for organisasjonen
              </Paragraph>
            </div>
          </div>
        </div>

        {/* Logo drop zone */}
        {!data.logo ? (
          <div
            onDragOver={handleLogoDragOver}
            onDragLeave={handleLogoDragLeave}
            onDrop={handleLogoDrop}
            onClick={() => document.getElementById('logo-input')?.click()}
            style={{
              border: `2px dashed ${isDraggingLogo ? 'var(--ds-color-accent-border-default)' : 'var(--ds-color-neutral-border-default)'}`,
              borderRadius: 'var(--ds-border-radius-lg)',
              padding: 'var(--ds-spacing-6)',
              textAlign: 'center',
              backgroundColor: isDraggingLogo ? 'var(--ds-color-accent-surface-default)' : 'var(--ds-color-neutral-surface-default)',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--ds-color-neutral-text-subtle)" strokeWidth="1.5" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
              Dra og slipp logo her
            </Paragraph>
            <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              eller klikk for å velge fil • PNG, SVG anbefales
            </Paragraph>
            <input
              id="logo-input"
              type="file"
              accept="image/*"
              onChange={handleLogoSelect}
              style={{ display: 'none' }}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
            <div
              style={{
                position: 'relative',
                padding: 'var(--ds-spacing-4)',
                border: '1px solid var(--ds-color-neutral-border-subtle)',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-neutral-surface-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={data.logo}
                alt="Logo preview"
                style={{ maxWidth: '200px', maxHeight: '100px', objectFit: 'contain' }}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              data-size="sm"
              onClick={handleRemoveLogo}
              style={{ alignSelf: 'flex-start' }}
            >
              Fjern logo
            </Button>
          </div>
        )}
      </Card>

      {/* COLORS SECTION */}
      <Card
        style={{
          padding: 'var(--ds-spacing-5)',
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          border: '1px solid var(--ds-color-neutral-border-subtle)',
        }}
      >
        <div style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--ds-color-accent-base-default)' }}>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a10 10 0 0 1 0 20" />
            </svg>
            <div>
              <Heading level={3} data-size="xs" style={{ margin: 0 }}>
                Farger
              </Heading>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                Primær- og sekundærfarger for profilen
              </Paragraph>
            </div>
          </div>
        </div>

        <Stack spacing={4}>
          <FormField
            label="Primærfarge"
            description="Hovedfarge for organisasjonens profil"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
              <input
                type="color"
                value={data.primaryColor || '#0062BA'}
                onChange={handlePrimaryColorChange}
                style={{
                  width: '60px',
                  height: '40px',
                  border: '1px solid var(--ds-color-neutral-border-default)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  cursor: 'pointer',
                }}
              />
              <input
                type="text"
                value={data.primaryColor || '#0062BA'}
                onChange={handlePrimaryColorChange}
                placeholder="#0062BA"
                style={{
                  flex: 1,
                  padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                  border: '1px solid var(--ds-color-neutral-border-default)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  fontSize: 'var(--ds-font-size-sm)',
                  fontFamily: 'monospace',
                }}
              />
            </div>
          </FormField>

          <FormField
            label="Sekundærfarge"
            description="Komplementær farge til primærfargen"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
              <input
                type="color"
                value={data.secondaryColor || '#004C93'}
                onChange={handleSecondaryColorChange}
                style={{
                  width: '60px',
                  height: '40px',
                  border: '1px solid var(--ds-color-neutral-border-default)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  cursor: 'pointer',
                }}
              />
              <input
                type="text"
                value={data.secondaryColor || '#004C93'}
                onChange={handleSecondaryColorChange}
                placeholder="#004C93"
                style={{
                  flex: 1,
                  padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                  border: '1px solid var(--ds-color-neutral-border-default)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  fontSize: 'var(--ds-font-size-sm)',
                  fontFamily: 'monospace',
                }}
              />
            </div>
          </FormField>
        </Stack>
      </Card>

      {/* FAVICON SECTION */}
      <Card
        style={{
          padding: 'var(--ds-spacing-5)',
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          border: '1px solid var(--ds-color-neutral-border-subtle)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--ds-color-accent-base-default)' }}>
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
            <div>
              <Heading level={3} data-size="xs" style={{ margin: 0 }}>
                Favicon
              </Heading>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                Ikon som vises i nettleser-faner
              </Paragraph>
            </div>
          </div>
        </div>

        {/* Favicon drop zone */}
        {!data.favicon ? (
          <div
            onDragOver={handleFaviconDragOver}
            onDragLeave={handleFaviconDragLeave}
            onDrop={handleFaviconDrop}
            onClick={() => document.getElementById('favicon-input')?.click()}
            style={{
              border: `2px dashed ${isDraggingFavicon ? 'var(--ds-color-accent-border-default)' : 'var(--ds-color-neutral-border-default)'}`,
              borderRadius: 'var(--ds-border-radius-lg)',
              padding: 'var(--ds-spacing-6)',
              textAlign: 'center',
              backgroundColor: isDraggingFavicon ? 'var(--ds-color-accent-surface-default)' : 'var(--ds-color-neutral-surface-default)',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--ds-color-neutral-text-subtle)" strokeWidth="1.5" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
            <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
              Dra og slipp favicon her
            </Paragraph>
            <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              eller klikk for å velge fil • 32x32px ICO, PNG anbefales
            </Paragraph>
            <input
              id="favicon-input"
              type="file"
              accept="image/*"
              onChange={handleFaviconSelect}
              style={{ display: 'none' }}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
            <div
              style={{
                position: 'relative',
                padding: 'var(--ds-spacing-4)',
                border: '1px solid var(--ds-color-neutral-border-subtle)',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-neutral-surface-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={data.favicon}
                alt="Favicon preview"
                style={{ width: '32px', height: '32px', objectFit: 'contain' }}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              data-size="sm"
              onClick={handleRemoveFavicon}
              style={{ alignSelf: 'flex-start' }}
            >
              Fjern favicon
            </Button>
          </div>
        )}
      </Card>

      {/* Tips */}
      <div
        style={{
          padding: 'var(--ds-spacing-4)',
          backgroundColor: 'var(--ds-color-info-surface-default)',
          borderRadius: 'var(--ds-border-radius-md)',
          border: '1px solid var(--ds-color-info-border-default)',
          display: 'flex',
          gap: 'var(--ds-spacing-3)',
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ color: 'var(--ds-color-info-text-default)', flexShrink: 0, marginTop: '2px' }}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <div>
          <Heading level={4} data-size="2xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-info-text-default)' }}>
            Tips for visuell identitet
          </Heading>
          <ul style={{ margin: 0, paddingLeft: 'var(--ds-spacing-4)', color: 'var(--ds-color-info-text-default)' }}>
            <li><Paragraph data-size="xs" style={{ margin: 0 }}>Logo bør være i SVG eller PNG format med gjennomsiktig bakgrunn</Paragraph></li>
            <li><Paragraph data-size="xs" style={{ margin: 0 }}>Velg farger som følger WCAG retningslinjer for tilgjengelighet</Paragraph></li>
            <li><Paragraph data-size="xs" style={{ margin: 0 }}>Favicon bør være 32x32 piksler eller større for best kvalitet</Paragraph></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
