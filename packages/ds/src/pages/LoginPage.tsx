/**
 * LoginPage Component
 * Reusable login page that adapts to each application
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AppAuthConfig } from '@xala/auth/config';
import { useT } from '@xala/i18n';
import { LoginLayout, LoginOption } from '../blocks/LoginComponents';
import { DemoLoginDialog } from '../composed/DemoLoginDialog';
import { IdPortenIcon, MicrosoftIcon, VippsIcon, BankIdIcon } from '../primitives/icons';

// Icon mapping for auth providers
const PROVIDER_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  idporten: IdPortenIcon,
  vipps: VippsIcon,
  microsoft: MicrosoftIcon,
  demo: BankIdIcon,
};

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
  
  /** Localization props for login page text */
  loginTitle?: string;
  loginSubtitle?: string;
  demoDialogTitle?: string;
  demoDialogDescription?: string;
  demoDialogLabels?: {
    name: string;
    email: string;
    token: string;
  };
  demoDialogPlaceholders?: {
    name: string;
    email: string;
    token: string;
  };
  demoDialogCancelText?: string;
  demoDialogSubmitText?: string;
  demoDialogLoadingText?: string;
  demoDialogValidation?: {
    nameRequired: string;
    emailRequired: string;
    tokenRequired: string;
    invalidEmail: string;
  };
  
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
  loginTitle,
  loginSubtitle,
  demoDialogTitle,
  demoDialogDescription,
  demoDialogLabels,
  demoDialogPlaceholders,
  demoDialogCancelText,
  demoDialogSubmitText,
  demoDialogLoadingText,
  demoDialogValidation,
  onProviderClick,
  isAuthenticated = false,
  isLoading = false,
  demoLoginOpen = false,
  onDemoLoginOpen,
  onDemoLoginClose,
  onDemoLoginSubmit,
}: LoginPageProps) {
  const navigate = useNavigate();
  const t = useT();
  
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
        title={loginTitle || t('auth.loginTitle')}
        subtitle={loginSubtitle || t('auth.loginSubtitle')}
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
      
      {onDemoLoginClose && onDemoLoginSubmit && (
        <DemoLoginDialog
          open={demoLoginOpen}
          onClose={onDemoLoginClose}
          onSubmit={onDemoLoginSubmit}
          title={demoDialogTitle || t('auth.demoLogin.title')}
          description={demoDialogDescription || t('auth.demoLogin.description')}
          cancelText={demoDialogCancelText || t('common.cancel')}
          submitText={demoDialogSubmitText || t('auth.demoLogin.submit')}
          loadingText={demoDialogLoadingText || t('auth.demoLogin.loading')}
          validationMessages={demoDialogValidation || {
            nameRequired: t('validation.nameRequired'),
            emailRequired: t('validation.emailRequired'),
            tokenRequired: t('validation.tokenRequired'),
            invalidEmail: t('validation.invalidEmail'),
          }}
          labels={demoDialogLabels || {
            name: t('form.name'),
            email: t('form.email'),
            token: t('auth.demoLogin.tokenLabel'),
          }}
          placeholders={demoDialogPlaceholders || {
            name: t('form.namePlaceholder'),
            email: t('form.emailPlaceholder'),
            token: t('auth.demoLogin.tokenPlaceholder'),
          }}
        />
      )}
    </>
  );
}
