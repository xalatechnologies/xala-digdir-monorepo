/**
 * Login Components
 *
 * Reusable components for authentication pages including
 * SSO provider buttons, feature items, and layout components.
 */
import * as React from 'react';
import { Button, Heading, Paragraph } from '@digdir/designsystemet-react';
import { useT } from '@xala/i18n';
import { cn } from '../utils';

// =============================================================================
// LoginOption - SSO Provider Button
// =============================================================================

export interface LoginOptionProps {
  /** Icon element (typically an auth provider icon) */
  icon: React.ReactNode;
  /** Provider title (e.g., "ID-porten", "Microsoft") */
  title: string;
  /** Provider description (e.g., "Personlig innlogging med BankID") */
  description: string;
  /** Click handler for login action */
  onClick: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
}

export function LoginOption({
  icon,
  title,
  description,
  onClick,
  disabled = false,
  className,
}: LoginOptionProps): React.ReactElement {
  // Generate testid from title (e.g., "Demo Innlogging" -> "login-option-demo-innlogging")
  const testId = `login-option-${title.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <Button
      data-testid={testId}
      type="button"
      variant="secondary"
      onClick={onClick}
      disabled={disabled}
      className={cn('login-option', className)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-spacing-4)',
        width: '100%',
        padding: 'var(--ds-spacing-4)',
        height: 'auto',
        textAlign: 'left',
        justifyContent: 'flex-start',
      }}
    >
      <div style={{ flexShrink: 0 }}>{icon}</div>
      <div>
        <Paragraph
          data-size="md"
          style={{
            fontWeight: 'var(--ds-font-weight-medium)',
            color: 'var(--ds-color-neutral-text-default)',
            margin: 0,
            lineHeight: 'var(--ds-line-height-sm)',
          }}
        >
          {title}
        </Paragraph>
        <Paragraph
          data-size="sm"
          style={{
            color: 'var(--ds-color-neutral-text-subtle)',
            margin: 0,
            marginTop: 'var(--ds-spacing-1)',
            lineHeight: 'var(--ds-line-height-md)',
          }}
        >
          {description}
        </Paragraph>
      </div>
    </Button>
  );
}

// =============================================================================
// FeatureItem - Marketing Feature Display
// =============================================================================

export interface FeatureItemProps {
  /** Icon element */
  icon: React.ReactNode;
  /** Feature title */
  title: string;
  /** Feature description */
  description: string;
  /** Text color variant */
  variant?: 'light' | 'dark';
  /** Custom class name */
  className?: string;
}

export function FeatureItem({
  icon,
  title,
  description,
  variant = 'light',
  className,
}: FeatureItemProps): React.ReactElement {
  // For 'light' variant (on colored background), use white text for WCAG compliance
  const textColor = variant === 'light'
    ? 'var(--ds-color-neutral-text-inverse)'
    : 'var(--ds-color-neutral-text-default)';
  const iconBg = variant === 'light'
    ? 'rgba(255, 255, 255, 0.2)'
    : 'var(--ds-color-neutral-surface-hover)';

  return (
    <div
      className={cn('feature-item', className)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--ds-spacing-3)',
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: '36px',
          height: '36px',
          borderRadius: 'var(--ds-border-radius-md)',
          backgroundColor: iconBg,
          color: textColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </div>
      <div>
        <Paragraph
          data-size="sm"
          style={{
            fontWeight: 'var(--ds-font-weight-medium)',
            color: textColor,
            margin: 0,
            lineHeight: 'var(--ds-line-height-sm)',
          }}
        >
          {title}
        </Paragraph>
        <Paragraph
          data-size="xs"
          style={{
            color: textColor,
            margin: 0,
            marginTop: 'var(--ds-spacing-1)',
            lineHeight: 'var(--ds-line-height-md)',
          }}
        >
          {description}
        </Paragraph>
      </div>
    </div>
  );
}

// =============================================================================
// IntegrationBadge - Integration/Certification Pills
// =============================================================================

export interface IntegrationBadgeProps {
  /** Integration/certification name */
  label: string;
  /** Badge variant */
  variant?: 'light' | 'dark';
  /** Custom class name */
  className?: string;
}

export function IntegrationBadge({
  label,
  variant = 'light',
  className,
}: IntegrationBadgeProps): React.ReactElement {
  const bgColor = variant === 'light'
    ? 'rgba(255, 255, 255, 0.95)'
    : 'var(--ds-color-neutral-surface-hover)';
  const textColor = variant === 'light'
    ? 'var(--ds-color-neutral-text-default)'
    : 'var(--ds-color-neutral-text-default)';

  return (
    <span
      className={cn('integration-badge', className)}
      style={{
        padding: 'var(--ds-spacing-1) var(--ds-spacing-3)',
        backgroundColor: bgColor,
        borderRadius: 'var(--ds-border-radius-full)',
        fontSize: 'var(--ds-font-size-xs)',
        fontWeight: 'var(--ds-font-weight-medium)',
        lineHeight: 'var(--ds-line-height-sm)',
        color: textColor,
      }}
    >
      {label}
    </span>
  );
}

// =============================================================================
// LoginFooterLink - Footer Navigation Link
// =============================================================================

export interface LoginFooterLinkProps {
  /** Link URL */
  href: string;
  /** Link text */
  children: React.ReactNode;
  /** Open in new tab */
  external?: boolean;
  /** Custom class name */
  className?: string;
}

export function LoginFooterLink({
  href,
  children,
  external = true,
  className,
}: LoginFooterLinkProps): React.ReactElement {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={cn('login-footer-link', className)}
      style={{
        fontSize: 'var(--ds-font-size-sm)',
        color: 'var(--ds-color-neutral-text-default)',
        textDecoration: 'none',
        transition: 'color 0.2s ease, text-decoration 0.2s ease',
        fontWeight: 'var(--ds-font-weight-medium)',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--ds-color-accent-text-default)';
        e.currentTarget.style.textDecoration = 'underline';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--ds-color-neutral-text-default)';
        e.currentTarget.style.textDecoration = 'none';
      }}
    >
      {children}
    </a>
  );
}

// =============================================================================
// LoginLayout - Split-Screen Login Layout
// =============================================================================

export interface LoginLayoutProps {
  /** Logo element */
  logo?: React.ReactNode;
  /** Brand name */
  brandName?: string;
  /** Brand tagline */
  brandTagline?: string;
  /** URL to navigate to when clicking the logo */
  logoHref?: string;
  /** Login form title */
  title?: string;
  /** Login form subtitle */
  subtitle?: string;
  /** Login options/buttons */
  children: React.ReactNode;
  /** Right panel title */
  panelTitle?: string;
  /** Right panel subtitle */
  panelSubtitle?: string;
  /** Right panel description */
  panelDescription?: string;
  /** Feature items for right panel */
  features?: Array<{
    icon: React.ReactNode;
    title: string;
    description: string;
  }>;
  /** Integration/certification badges */
  integrations?: string[];
  /** Footer links */
  footerLinks?: Array<{
    href: string;
    label: string;
  }>;
  /** Copyright text */
  copyright?: string;
  /** Custom class name */
  className?: string;
}

export function LoginLayout({
  logo,
  brandName = 'DIGILIST',
  brandTagline = 'ENKEL BOOKING',
  logoHref,
  title = 'Logg inn',
  subtitle = 'Velg innloggingsmetode for å fortsette.',
  children,
  panelTitle = 'Backoffice',
  panelSubtitle = 'En helhetlig bookingløsning',
  panelDescription,
  features = [],
  integrations = [],
  footerLinks = [],
  copyright = `© ${new Date().getFullYear()} Digilist. Alle rettigheter reservert.`,
  className,
}: LoginLayoutProps): React.ReactElement {
  return (
    <>
      <style>{`
        .login-layout {
          display: flex;
          flex-direction: row;
          min-height: 100vh;
        }
        .login-form-panel,
        .login-info-panel {
          width: 50%;
        }
        @media (max-width: 1024px) {
          .login-info-panel {
            display: none !important;
          }
          .login-form-panel {
            width: 100% !important;
          }
        }
      `}</style>
      <div
        className={cn('login-layout', className)}
        style={{
          display: 'flex',
          minHeight: '100vh',
          flexDirection: 'row',
        }}
      >
      {/* Left side - Login form */}
      <div
        style={{
          width: '50%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--ds-color-neutral-background-default)',
        }}
        className="login-form-panel"
      >
        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: 'clamp(var(--ds-spacing-6), 5vw, var(--ds-spacing-12))',
            maxWidth: '480px',
            margin: '0 auto',
            width: '100%',
          }}
        >
          {/* Logo/Brand */}
          <div style={{ marginBottom: 'var(--ds-spacing-10)' }}>
            {logoHref ? (
              <a
                href={logoHref}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-4)',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  flexWrap: 'wrap',
                }}
              >
                {logo || (
                  <img
                    src="/logo.svg"
                    alt={brandName}
                    style={{
                      height: 'clamp(80px, 12vw, 120px)',
                      width: 'auto',
                    }}
                  />
                )}
                <div style={{ minWidth: '0', flex: '1 1 auto' }}>
                  <div
                    style={{
                      fontSize: 'clamp(var(--ds-font-size-2xl), 5vw, var(--ds-font-size-3xl))',
                      fontWeight: 'var(--ds-font-weight-bold)',
                      color: 'var(--ds-color-accent-base-default)',
                      lineHeight: 'var(--ds-line-height-sm)',
                      letterSpacing: 'var(--ds-letter-spacing-9)',
                      wordBreak: 'break-word',
                      textTransform: 'uppercase',
                    }}
                  >
                    {brandName}
                  </div>
                  <div
                    style={{
                      fontSize: 'clamp(var(--ds-font-size-sm), 2.5vw, var(--ds-font-size-lg))',
                      color: 'var(--ds-color-neutral-text-default)',
                      letterSpacing: 'var(--ds-letter-spacing-9)',
                      marginTop: 'var(--ds-spacing-2)',
                      fontWeight: 'var(--ds-font-weight-medium)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {brandTagline}
                  </div>
                </div>
              </a>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)', flexWrap: 'wrap' }}>
                {logo || (
                  <img
                    src="/logo.svg"
                    alt={brandName}
                    style={{
                      height: 'clamp(80px, 12vw, 120px)',
                      width: 'auto',
                    }}
                  />
                )}
                <div style={{ minWidth: '0', flex: '1 1 auto' }}>
                  <div
                    style={{
                      fontSize: 'clamp(var(--ds-font-size-2xl), 5vw, var(--ds-font-size-3xl))',
                      fontWeight: 'var(--ds-font-weight-bold)',
                      color: 'var(--ds-color-accent-base-default)',
                      lineHeight: 'var(--ds-line-height-sm)',
                      letterSpacing: 'var(--ds-letter-spacing-9)',
                      wordBreak: 'break-word',
                      textTransform: 'uppercase',
                    }}
                  >
                    {brandName}
                  </div>
                  <div
                    style={{
                      fontSize: 'clamp(var(--ds-font-size-sm), 2.5vw, var(--ds-font-size-lg))',
                      color: 'var(--ds-color-neutral-text-default)',
                      letterSpacing: 'var(--ds-letter-spacing-9)',
                      marginTop: 'var(--ds-spacing-2)',
                      fontWeight: 'var(--ds-font-weight-medium)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {brandTagline}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Login section */}
          <div>
            <Heading level={1} data-size="xl" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              {title}
            </Heading>
            <Paragraph
              data-size="md"
              style={{ color: 'var(--ds-color-neutral-text-default)', marginBottom: 'var(--ds-spacing-8)' }}
            >
              {subtitle}
            </Paragraph>

            {/* Login options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
              {children}
            </div>
          </div>
        </div>

        {/* Footer */}
        {(footerLinks.length > 0 || copyright) && (
          <div
            style={{
              padding: 'var(--ds-spacing-8) clamp(var(--ds-spacing-6), 5vw, var(--ds-spacing-12))',
              borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
              backgroundColor: 'var(--ds-color-neutral-background-subtle)',
            }}
          >
            {footerLinks.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--ds-spacing-2)',
                  flexWrap: 'wrap',
                  marginBottom: 'var(--ds-spacing-4)',
                }}
              >
                {footerLinks.map((link, index) => (
                  <React.Fragment key={link.href}>
                    {index > 0 && (
                      <span 
                        style={{ 
                          color: 'var(--ds-color-neutral-text-subtle)',
                          padding: '0 var(--ds-spacing-2)',
                        }}
                      >
                        •
                      </span>
                    )}
                    <LoginFooterLink href={link.href}>{link.label}</LoginFooterLink>
                  </React.Fragment>
                ))}
              </div>
            )}
            {copyright && (
              <Paragraph 
                data-size="xs" 
                style={{ 
                  color: 'var(--ds-color-neutral-text-subtle)', 
                  margin: 0,
                  textAlign: 'center',
                  fontWeight: 'var(--ds-font-weight-regular)',
                }}
              >
                {copyright}
              </Paragraph>
            )}
          </div>
        )}
      </div>

      {/* Right side - Product info */}
      <div
        style={{
          width: '50%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'clamp(var(--ds-spacing-6), 5vw, var(--ds-spacing-8))',
          background: 'linear-gradient(135deg, var(--ds-color-accent-base-default) 0%, var(--ds-color-accent-base-hover) 100%)',
        }}
        className="login-info-panel"
      >
        <div style={{ maxWidth: '480px', margin: '0 auto', width: '100%' }}>
          {/* Header */}
          <div style={{ marginBottom: 'var(--ds-spacing-10)' }}>
            {panelTitle && (
              <Paragraph
                data-size="xs"
                style={{
                  color: 'var(--ds-color-neutral-text-inverse)',
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--ds-letter-spacing-9)',
                  fontWeight: 'var(--ds-font-weight-medium)',
                  marginBottom: 'var(--ds-spacing-3)',
                  wordBreak: 'break-word',
                  lineHeight: 'var(--ds-line-height-sm)',
                }}
              >
                {panelTitle}
              </Paragraph>
            )}
            <Heading
              level={2}
              data-size="2xl"
              style={{
                color: 'var(--ds-color-neutral-text-inverse)',
                marginBottom: 'var(--ds-spacing-4)',
                wordBreak: 'break-word',
              }}
            >
              {panelSubtitle}
            </Heading>
            {panelDescription && (
              <Paragraph
                data-size="md"
                style={{
                  color: 'var(--ds-color-neutral-text-inverse)',
                  wordBreak: 'break-word',
                  lineHeight: 'var(--ds-line-height-md)',
                }}
              >
                {panelDescription}
              </Paragraph>
            )}
          </div>

          {/* Features */}
          {features.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--ds-spacing-6)',
                marginBottom: 'var(--ds-spacing-10)',
              }}
            >
              {features.map((feature) => (
                <FeatureItem
                  key={feature.title}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  variant="light"
                />
              ))}
            </div>
          )}

          {/* Integrations */}
          {integrations.length > 0 && (
            <div>
              <Paragraph
                data-size="xs"
                style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  marginBottom: 'var(--ds-spacing-3)',
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--ds-letter-spacing-9)',
                  lineHeight: 'var(--ds-line-height-sm)',
                }}
              >
                Integrasjoner & Sertifiseringer
              </Paragraph>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--ds-spacing-2)',
                }}
              >
                {integrations.map((integration) => (
                  <IntegrationBadge key={integration} label={integration} variant="light" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
}

export default LoginLayout;
