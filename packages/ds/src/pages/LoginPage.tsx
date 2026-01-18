/**
 * LoginPage Component
 * Reusable login page that adapts to each application
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AppAuthConfig } from '@xala/auth/config';
import { LoginLayout, LoginOption } from '../blocks/LoginComponents';
import { DemoLoginDialog } from '../composed/DemoLoginDialog';

export interface LoginPageProps {
  /** App-specific authentication configuration */
  config: AppAuthConfig;
  
  /** Branding configuration (optional, uses config.branding if not provided) */
  brandConfig?: {
    name: string;
    tagline: string;
    logoUrl?: string;
    logoHref?: string;
  };
  
  /** Right panel configuration (optional, uses config.panel if not provided) */
  panelConfig?: {
    title: string;
    subtitle: string;
    description?: string;
    features: Array<{
      icon?: React.ReactNode;
      title: string;
      description: string;
    }>;
    integrations: string[];
  };
  
  /** Footer links (optional, uses config.footerLinks if not provided) */
  footerLinks?: Array<{
    href: string;
    label: string;
  }>;
  
  /** Callback when user clicks a login provider */
  onProviderClick: (providerId: string) => void;
  
  /** Current authentication state */
  isAuthenticated?: boolean;
  
  /** Whether auth state is loading */
  isLoading?: boolean;
  
  /** Demo login dialog state */
  demoLoginOpen?: boolean;
  
  /** Callback to open demo login dialog */
  onDemoLoginOpen?: () => void;
  
  /** Callback to close demo login dialog */
  onDemoLoginClose?: () => void;
  
  /** Callback when demo login form is submitted */
  onDemoLoginSubmit?: (data: { name: string; email: string; token: string }) => Promise<void>;
}

/**
 * LoginPage Component
 * 
 * Renders a consistent login page across all applications with:
 * - Dynamic provider options based on app config
 * - Branding and panel content from config
 * - Auto-redirect when authenticated
 * - Demo login dialog support
 */
export function LoginPage({
  config,
  brandConfig,
  panelConfig,
  footerLinks,
  onProviderClick,
  isAuthenticated = false,
  isLoading = false,
  demoLoginOpen = false,
  onDemoLoginOpen,
  onDemoLoginClose,
  onDemoLoginSubmit,
}: LoginPageProps) {
  const navigate = useNavigate();
  
  // Use config values as defaults
  const branding = brandConfig || config.branding || {
    name: 'DIGILIST',
    tagline: 'ENKEL BOOKING',
  };
  
  const panel = panelConfig || config.panel || {
    title: config.app,
    subtitle: 'Booking og administrasjon',
    features: [],
    integrations: [],
  };
  
  const links = footerLinks || config.footerLinks || [];
  
  // Auto-redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate(config.redirectAfterLogin);
    }
  }, [isAuthenticated, isLoading, navigate, config.redirectAfterLogin]);
  
  // Get enabled providers
  const enabledProviders = config.providers.filter(p => p.enabled);
  
  // Handle provider click
  const handleProviderClick = (providerId: string) => {
    if (providerId === 'demo' && onDemoLoginOpen) {
      onDemoLoginOpen();
    } else {
      onProviderClick(providerId);
    }
  };
  
  return (
    <>
      <LoginLayout
        brandName={branding.name}
        brandTagline={branding.tagline}
        logoHref={branding.logoHref}
        title="Logg inn"
        subtitle="Velg innloggingsmetode for å fortsette."
        panelTitle={panel.title}
        panelSubtitle={panel.subtitle}
        panelDescription={panel.description}
        features={panel.features.map(f => ({
          icon: f.icon as React.ReactNode,
          title: f.title,
          description: f.description,
        }))}
        integrations={panel.integrations}
        footerLinks={links}
      >
        {enabledProviders.map(provider => (
          <LoginOption
            key={provider.id}
            icon={provider.icon ? <provider.icon /> : <></>}
            title={provider.name}
            description={provider.description}
            onClick={() => handleProviderClick(provider.id)}
            disabled={!provider.enabled}
          />
        ))}
      </LoginLayout>
      
      {onDemoLoginClose && onDemoLoginSubmit && (
        <DemoLoginDialog
          open={demoLoginOpen}
          onClose={onDemoLoginClose}
          onSubmit={onDemoLoginSubmit}
          title="Demo Innlogging"
          description="Logg inn med demo-token for testing"
          cancelText="Avbryt"
          submitText="Logg inn"
          loadingText="Logger inn..."
          validationMessages={{
            nameRequired: 'Navn er påkrevd',
            emailRequired: 'E-post er påkrevd',
            tokenRequired: 'Token er påkrevd',
            invalidEmail: 'Ugyldig e-postadresse',
          }}
          labels={{
            name: 'Navn',
            email: 'E-post',
            token: 'Demo Token',
          }}
          placeholders={{
            name: 'Ola Nordmann',
            email: 'ola@example.com',
            token: 'demo-token-123',
          }}
        />
      )}
    </>
  );
}
