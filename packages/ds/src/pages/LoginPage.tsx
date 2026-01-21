/**
 * LoginPage Component
 *
 * Reusable login page that adapts to each application.
 * Domain-agnostic - receives all configuration and labels via props.
 *
 * @example
 * ```tsx
 * // In app with auth and i18n
 * import { useT } from '@xala/i18n';
 * import { useNavigate } from 'react-router-dom';
 * import { authConfig } from './auth-config';
 *
 * function MyLoginPage() {
 *   const t = useT();
 *   const navigate = useNavigate();
 *
 *   return (
 *     <LoginPage
 *       config={authConfig}
 *       isAuthenticated={isAuthenticated}
 *       onProviderClick={handleProviderClick}
 *       onNavigate={navigate}
 *       labels={{
 *         loginTitle: t('auth.loginTitle'),
 *         loginSubtitle: t('auth.loginSubtitle'),
 *       }}
 *     />
 *   );
 * }
 * ```
 */

import { useEffect } from 'react';
import { LoginLayout, LoginOption } from '../blocks/LoginComponents';
import { DemoLoginDialog } from '../composed/DemoLoginDialog';
import { IdPortenIcon, MicrosoftIcon, VippsIcon, BankIdIcon } from '../primitives/icons';

// =============================================================================
// Types
// =============================================================================

/**
 * Auth provider configuration
 */
export interface AuthProvider {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon?: React.ComponentType<{ size?: number }>;
}

/**
 * App authentication configuration (domain-agnostic)
 */
export interface LoginPageAuthConfig {
  app: string;
  providers: AuthProvider[];
  redirectAfterLogin: string;
  branding?: {
    name: string;
    tagline: string;
    logoUrl?: string;
    logoHref?: string;
  };
  panel?: {
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
  footerLinks?: Array<{
    href: string;
    label: string;
  }>;
}

export interface LoginPageLabels {
  loginTitle: string;
  loginSubtitle: string;
  demoDialogTitle: string;
  demoDialogDescription: string;
  demoDialogLabels: {
    name: string;
    email: string;
    token: string;
  };
  demoDialogPlaceholders: {
    name: string;
    email: string;
    token: string;
  };
  demoDialogCancelText: string;
  demoDialogSubmitText: string;
  demoDialogLoadingText: string;
  demoDialogValidation: {
    nameRequired: string;
    emailRequired: string;
    tokenRequired: string;
    invalidEmail: string;
  };
}

export interface LoginPageProps {
  /** App-specific authentication configuration */
  config: LoginPageAuthConfig;

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

  /** Labels for i18n */
  labels?: Partial<LoginPageLabels>;

  /** Callback when user clicks a login provider */
  onProviderClick: (providerId: string) => void;

  /** Navigation function (e.g., from react-router useNavigate) */
  onNavigate: (path: string) => void;

  /** Current authentication state */
  isAuthenticated?: boolean;

  /** Whether auth state is loading */
  isLoading?: boolean;

  /** Whether to show demo login option (default: true if demo provider exists in config) */
  showDemoLogin?: boolean;

  /** Demo login dialog state */
  demoLoginOpen?: boolean;

  /** Callback to open demo login dialog */
  onDemoLoginOpen?: () => void;

  /** Callback to close demo login dialog */
  onDemoLoginClose?: () => void;

  /** Callback when demo login form is submitted */
  onDemoLoginSubmit?: (data: { name: string; email: string; token: string }) => Promise<void>;
}

// =============================================================================
// Default Labels
// =============================================================================

const DEFAULT_LABELS: LoginPageLabels = {
  loginTitle: 'Logg inn',
  loginSubtitle: 'Velg innloggingsmetode for a fortsette.',
  demoDialogTitle: 'Demo innlogging',
  demoDialogDescription: 'Logg inn med testbruker',
  demoDialogLabels: {
    name: 'Navn',
    email: 'E-post',
    token: 'Demo-token',
  },
  demoDialogPlaceholders: {
    name: 'Ola Nordmann',
    email: 'ola@example.com',
    token: 'demo-token',
  },
  demoDialogCancelText: 'Avbryt',
  demoDialogSubmitText: 'Logg inn',
  demoDialogLoadingText: 'Logger inn...',
  demoDialogValidation: {
    nameRequired: 'Navn er pakrevd',
    emailRequired: 'E-post er pakrevd',
    tokenRequired: 'Token er pakrevd',
    invalidEmail: 'Ugyldig e-postadresse',
  },
};

// Icon mapping for auth providers
const PROVIDER_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  idporten: IdPortenIcon,
  vipps: VippsIcon,
  microsoft: MicrosoftIcon,
  demo: BankIdIcon,
};

// =============================================================================
// Component
// =============================================================================

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
  labels: customLabels,
  onProviderClick,
  onNavigate,
  isAuthenticated = false,
  isLoading = false,
  showDemoLogin = true,
  demoLoginOpen = false,
  onDemoLoginOpen,
  onDemoLoginClose,
  onDemoLoginSubmit,
}: LoginPageProps) {
  const labels = { ...DEFAULT_LABELS, ...customLabels };

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
      onNavigate(config.redirectAfterLogin);
    }
  }, [isAuthenticated, isLoading, onNavigate, config.redirectAfterLogin]);

  // Get enabled providers, optionally filtering out demo
  const enabledProviders = config.providers.filter(p => {
    if (!p.enabled) return false;
    if (p.id === 'demo' && !showDemoLogin) return false;
    return true;
  });

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
        title={labels.loginTitle}
        subtitle={labels.loginSubtitle}
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
        {enabledProviders.map(provider => {
          const IconComponent = provider.icon || PROVIDER_ICONS[provider.id];
          return (
            <LoginOption
              key={provider.id}
              icon={IconComponent ? <IconComponent size={40} /> : <></>}
              title={provider.name}
              description={provider.description}
              onClick={() => handleProviderClick(provider.id)}
              disabled={!provider.enabled}
            />
          );
        })}
      </LoginLayout>

      {showDemoLogin && onDemoLoginClose && onDemoLoginSubmit && (
        <DemoLoginDialog
          open={demoLoginOpen}
          onClose={onDemoLoginClose}
          onSubmit={onDemoLoginSubmit}
          title={labels.demoDialogTitle}
          description={labels.demoDialogDescription}
          cancelText={labels.demoDialogCancelText}
          submitText={labels.demoDialogSubmitText}
          loadingText={labels.demoDialogLoadingText}
          validationMessages={labels.demoDialogValidation}
          labels={labels.demoDialogLabels}
          placeholders={labels.demoDialogPlaceholders}
        />
      )}
    </>
  );
}
