/**
 * Branding Editor Page
 * SaaS Admin page for editing tenant branding (colors, logo, typography)
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Textfield,
  Select,
  Spinner,
  Badge,
  ArrowLeftIcon,
  SaveIcon,
  RefreshCwIcon,
} from '@xala/ds';
import { useSaasTenant } from '@digilist/client-sdk/hooks';
import { useT } from '@xala/i18n';

// Design system token mapping
const DS_TOKENS = {
  primaryColor: '--ds-color-brand-base-default',
  secondaryColor: '--ds-color-accent-base-default',
  accentColor: '--ds-color-info-base-default',
  successColor: '--ds-color-success-base-default',
  warningColor: '--ds-color-warning-base-default',
  dangerColor: '--ds-color-danger-base-default',
};

// Font options
const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter (Standard)' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Source Sans Pro', label: 'Source Sans Pro' },
];

// Default branding values
const DEFAULT_BRANDING = {
  primaryColor: '#0067c5',
  secondaryColor: '#1e2b3c',
  accentColor: '#0090d4',
  logoUrl: '',
  faviconUrl: '',
  headingFont: 'Inter',
  bodyFont: 'Inter',
  borderRadius: 'md',
};

interface BrandingData {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string;
  faviconUrl: string;
  headingFont: string;
  bodyFont: string;
  borderRadius: string;
}

export function BrandingEditorPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const t = useT();
  const navigate = useNavigate();

  // Form state
  const [branding, setBranding] = useState<BrandingData>({ ...DEFAULT_BRANDING });
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Queries
  const { data: tenantData, isLoading } = useSaasTenant(tenantId!);
  const tenant = tenantData?.data;

  // Initialize form (would normally fetch from branding API)
  useEffect(() => {
    if (tenant) {
      // In real implementation, fetch branding from API
      // For now, use defaults
      setBranding({ ...DEFAULT_BRANDING });
    }
  }, [tenant]);

  const handleColorChange = (field: keyof BrandingData, value: string) => {
    setBranding((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleReset = () => {
    setBranding({ ...DEFAULT_BRANDING });
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // In real implementation, call branding API
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      setHasChanges(false);
      // Show success toast
    } catch (error) {
      console.error('Failed to save branding:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Spinner data-size="lg" aria-label={t('common.loading')} />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--ds-spacing-8)' }}>
        <Heading level={3} data-size="sm">
          Tenant ikke funnet
        </Heading>
        <Link to="/branding">
          <Button variant="secondary" style={{ marginTop: 'var(--ds-spacing-4)' }} type="button">
            <ArrowLeftIcon />
            Tilbake
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--ds-spacing-8)' }}>
      {/* Header */}
      <Link to="/branding">
        <Button variant="tertiary" data-size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }} type="button">
          <ArrowLeftIcon />
          Tilbake til oversikt
        </Button>
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--ds-spacing-6)' }}>
        <div>
          <Heading level={1} data-size="lg" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
            Rediger branding
          </Heading>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {tenant.name}
            </Paragraph>
            <Badge color="info">{tenant.slug}</Badge>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
          <Button variant="tertiary" onClick={handleReset} type="button">
            <RefreshCwIcon />
            Tilbakestill
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
            {isSaving ? (
              <Spinner data-size="sm" aria-label="Lagrer..." />
            ) : (
              <>
                <SaveIcon />
                Lagre endringer
              </>
            )}
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 'var(--ds-spacing-6)' }}>
        {/* Editor Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          {/* Colors */}
          <Card style={{ padding: 'var(--ds-spacing-6)' }}>
            <Heading level={2} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
              Farger
            </Heading>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--ds-spacing-4)' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-1)', fontWeight: 'var(--ds-font-weight-medium)' }}>
                  Primærfarge
                </label>
                <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
                  <input
                    type="color"
                    value={branding.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    style={{ width: 48, height: 40, padding: 0, border: 'none', cursor: 'pointer' }}
                  />
                  <Textfield
                    value={branding.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    style={{ flex: 1 }}
                  />
                </div>
                <Paragraph data-size="xs" style={{ marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {DS_TOKENS.primaryColor}
                </Paragraph>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-1)', fontWeight: 'var(--ds-font-weight-medium)' }}>
                  Sekundærfarge
                </label>
                <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
                  <input
                    type="color"
                    value={branding.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    style={{ width: 48, height: 40, padding: 0, border: 'none', cursor: 'pointer' }}
                  />
                  <Textfield
                    value={branding.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    style={{ flex: 1 }}
                  />
                </div>
                <Paragraph data-size="xs" style={{ marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {DS_TOKENS.secondaryColor}
                </Paragraph>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-1)', fontWeight: 'var(--ds-font-weight-medium)' }}>
                  Aksentfarge
                </label>
                <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
                  <input
                    type="color"
                    value={branding.accentColor}
                    onChange={(e) => handleColorChange('accentColor', e.target.value)}
                    style={{ width: 48, height: 40, padding: 0, border: 'none', cursor: 'pointer' }}
                  />
                  <Textfield
                    value={branding.accentColor}
                    onChange={(e) => handleColorChange('accentColor', e.target.value)}
                    style={{ flex: 1 }}
                  />
                </div>
                <Paragraph data-size="xs" style={{ marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {DS_TOKENS.accentColor}
                </Paragraph>
              </div>
            </div>
          </Card>

          {/* Logo & Favicon */}
          <Card style={{ padding: 'var(--ds-spacing-6)' }}>
            <Heading level={2} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
              Logo og ikon
            </Heading>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-1)', fontWeight: 'var(--ds-font-weight-medium)' }}>
                  Logo URL
                </label>
                <Textfield
                  value={branding.logoUrl}
                  onChange={(e) => handleColorChange('logoUrl', e.target.value)}
                  placeholder="https://example.com/logo.svg"
                />
                <Paragraph data-size="xs" style={{ marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Anbefalt: SVG eller PNG med gjennomsiktig bakgrunn
                </Paragraph>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-1)', fontWeight: 'var(--ds-font-weight-medium)' }}>
                  Favicon URL
                </label>
                <Textfield
                  value={branding.faviconUrl}
                  onChange={(e) => handleColorChange('faviconUrl', e.target.value)}
                  placeholder="https://example.com/favicon.ico"
                />
              </div>
            </div>
          </Card>

          {/* Typography */}
          <Card style={{ padding: 'var(--ds-spacing-6)' }}>
            <Heading level={2} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
              Typografi
            </Heading>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--ds-spacing-4)' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-1)', fontWeight: 'var(--ds-font-weight-medium)' }}>
                  Overskrift-font
                </label>
                <Select
                  value={branding.headingFont}
                  onChange={(e) => handleColorChange('headingFont', e.target.value)}
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-1)', fontWeight: 'var(--ds-font-weight-medium)' }}>
                  Brødtekst-font
                </label>
                <Select
                  value={branding.bodyFont}
                  onChange={(e) => handleColorChange('bodyFont', e.target.value)}
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </Card>
        </div>

        {/* Live Preview */}
        <div>
          <Card style={{ padding: 'var(--ds-spacing-4)', position: 'sticky', top: 'var(--ds-spacing-4)' }}>
            <Heading level={3} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
              Forhåndsvisning
            </Heading>

            {/* Preview Container */}
            <div
              style={{
                border: '1px solid var(--ds-color-neutral-border-subtle)',
                borderRadius: 'var(--ds-border-radius-md)',
                overflow: 'hidden',
              }}
            >
              {/* Preview Header */}
              <div
                style={{
                  backgroundColor: branding.primaryColor,
                  padding: 'var(--ds-spacing-4)',
                  color: 'white',
                }}
              >
                {branding.logoUrl ? (
                  <img
                    src={branding.logoUrl}
                    alt="Logo"
                    style={{ height: 32 }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div style={{ fontWeight: 'bold', fontFamily: branding.headingFont }}>
                    {tenant.name}
                  </div>
                )}
              </div>

              {/* Preview Content */}
              <div style={{ padding: 'var(--ds-spacing-4)', backgroundColor: 'white' }}>
                <h3 style={{ fontFamily: branding.headingFont, marginBottom: 'var(--ds-spacing-2)' }}>
                  Overskrift
                </h3>
                <p style={{ fontFamily: branding.bodyFont, marginBottom: 'var(--ds-spacing-3)' }}>
                  Dette er eksempel på brødtekst med valgt font.
                </p>
                <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
                  <button
                    type="button"
                    style={{
                      backgroundColor: branding.primaryColor,
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Primær
                  </button>
                  <button
                    type="button"
                    style={{
                      backgroundColor: branding.secondaryColor,
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Sekundær
                  </button>
                  <button
                    type="button"
                    style={{
                      backgroundColor: 'transparent',
                      color: branding.accentColor,
                      border: `1px solid ${branding.accentColor}`,
                      padding: '8px 16px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Aksent
                  </button>
                </div>
              </div>
            </div>

            {/* Color Swatches */}
            <div style={{ marginTop: 'var(--ds-spacing-4)' }}>
              <Paragraph data-size="xs" style={{ marginBottom: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-medium)' }}>
                Fargepalett
              </Paragraph>
              <div style={{ display: 'flex', gap: 'var(--ds-spacing-1)' }}>
                {[branding.primaryColor, branding.secondaryColor, branding.accentColor].map((color, i) => (
                  <div
                    key={i}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--ds-border-radius-sm)',
                      backgroundColor: color,
                      border: '1px solid var(--ds-color-neutral-border-subtle)',
                    }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default BrandingEditorPage;
