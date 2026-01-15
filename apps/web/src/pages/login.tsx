/**
 * Login Page - Web App
 *
 * Uses reusable login components from @xala/ds
 * Supports session-safe return-to-flow authentication with flow context preservation
 */
import { useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LoginLayout,
  LoginOption,
  IdPortenIcon,
  MicrosoftIcon,
  VippsIcon,
  PlatformIcon,
  AutomationIcon,
  ShieldCheckIcon,
} from '@xala/ds';
import { useAuth } from '../hooks/useAuth';
import { idportenService, vippsAuthService } from '@digilist/client-sdk';
import type { FlowContext } from '@digilist/client-sdk';

/**
 * Navigation state passed when redirecting with flow context
 */
export interface FlowContextNavigationState {
  /** The restored flow context containing booking state */
  flowContext: FlowContext;
  /** Whether this navigation is from a flow restoration */
  isFlowRestoration: boolean;
}

/**
 * Navigation state passed when flow context was expired
 */
export interface FlowContextExpiredState {
  /** Indicates the booking session expired */
  flowContextExpired: true;
}

export function LoginPage(): React.ReactElement {
  const { isAuthenticated, isLoading, login, restoreFlowContext, hasStoredContext } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Track if we've already processed flow restoration to prevent double navigation
  const flowRestorationProcessed = useRef(false);

  // Get fallback return path from location state (set by ProtectedRoute or direct navigation)
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  /**
   * Handle navigation after authentication
   * Prioritizes stored flow context over simple location state
   */
  const handlePostAuthNavigation = useCallback(() => {
    // Prevent double processing
    if (flowRestorationProcessed.current) {
      return;
    }

    // Check for stored flow context first (higher priority than location state)
    if (hasStoredContext) {
      const result = restoreFlowContext(true); // Clear after load

      if (result.hasContext && result.flowContext) {
        flowRestorationProcessed.current = true;

        // Navigate to the returnTo URL with complete flow context
        const navigationState: FlowContextNavigationState = {
          flowContext: result.flowContext,
          isFlowRestoration: true,
        };

        navigate(result.flowContext.returnTo, {
          replace: true,
          state: navigationState,
        });
        return;
      }

      // Handle expired flow context
      if (result.wasExpired) {
        flowRestorationProcessed.current = true;
        // Navigate to home with notification that session expired
        // The target page can show a toast about expired booking session
        const expiredState: FlowContextExpiredState = {
          flowContextExpired: true,
        };
        navigate('/', {
          replace: true,
          state: expiredState,
        });
        return;
      }

      // Handle invalid/corrupted flow context - gracefully fall back
      if (result.wasInvalid) {
        flowRestorationProcessed.current = true;
        navigate(from, { replace: true });
        return;
      }
    }

    // No flow context - use simple location state fallback
    flowRestorationProcessed.current = true;
    navigate(from, { replace: true });
  }, [hasStoredContext, restoreFlowContext, navigate, from]);

  // Navigate after successful authentication
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      handlePostAuthNavigation();
    }
  }, [isAuthenticated, isLoading, handlePostAuthNavigation]);

  if (isLoading) {
    return <></>;
  }

  const features = [
    {
      icon: <PlatformIcon size={20} />,
      title: 'Komplett plattform',
      description: 'Booking, betaling, kalender og rapportering i én løsning',
    },
    {
      icon: <AutomationIcon size={20} />,
      title: 'Automatisering',
      description: 'Regelbasert godkjenning reduserer manuelt arbeid',
    },
    {
      icon: <ShieldCheckIcon size={20} />,
      title: 'GDPR-klar & Sikker',
      description: 'Full etterlevelse av personvernregler og norske standarder',
    },
  ];

  const integrations = ['BankID', 'Vipps', 'Visma', 'RCO', 'ISO 27001', 'ISO 27701'];

  const footerLinks = [
    { href: 'https://digilist.no/personvern', label: 'Personvern' },
    { href: 'https://digilist.no/cookies', label: 'Vilkår for bruk' },
    { href: 'https://digilist.no/#book-demo', label: 'Kontakt support' },
  ];

  return (
    <LoginLayout
      brandName="DIGILIST"
      brandTagline="ENKEL BOOKING"
      logoHref="/"
      title="Logg inn"
      subtitle="Velg innloggingsmetode for å fortsette."
      panelTitle="Booking"
      panelSubtitle="En helhetlig bookingløsning"
      panelDescription="Skybasert plattform for booking av kommunale anlegg og ressurser med moderne design, betaling og rapportering."
      features={features}
      integrations={integrations}
      footerLinks={footerLinks}
      copyright="© 2026 Digilist. Alle rettigheter reservert."
    >
      <LoginOption
        icon={<VippsIcon />}
        title="Vipps"
        description="Rask og enkel innlogging med Vipps"
        onClick={() => {
          // Pass current URL for session persistence (booking flow)
          const returnTo = window.location.href;
          vippsAuthService.authorize(returnTo);
        }}
      />
      <LoginOption
        icon={<IdPortenIcon />}
        title="ID-porten"
        description="Personlig innlogging med BankID"
        onClick={() => {
          // Pass current URL for session persistence (booking flow)
          // Backend will auto-redirect based on user role or create user if needed
          const returnTo = window.location.href;
          idportenService.authorize(returnTo);
        }}
      />
      <LoginOption
        icon={<MicrosoftIcon />}
        title="Microsoft"
        description="Kommer snart"
        disabled
        onClick={() => {
          // Microsoft login temporarily disabled
          console.warn('Microsoft login is temporarily disabled');
        }}
      />
    </LoginLayout>
  );
}
