/**
 * Login Components
 *
 * Reusable components for authentication pages including
 * SSO provider buttons, feature items, and layout components.
 */
import * as React from 'react';
import { Button, Heading, Paragraph } from '@digdir/designsystemet-react';
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
  return (
    <Button
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
        <div
          style={{
            fontSize: 'var(--ds-font-size-md)',
            fontWeight: 'var(--ds-font-weight-medium)',
            color: 'var(--ds-color-neutral-text-default)',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 'var(--ds-font-size-sm)',
            color: 'var(--ds-color-neutral-text-subtle)',
            marginTop: 'var(--ds-spacing-0)',
          }}
        >
          {description}
        </div>
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
  const textColor = variant === 'light' 
    ? 'var(--digilist-login-overlay-text, #ffffff)' 
    : 'var(--ds-color-neutral-text-default)';
  const subtleColor = variant === 'light'
    ? 'var(--digilist-login-overlay-text-muted, rgba(255, 255, 255, 0.8))'
    : 'var(--ds-color-neutral-text-subtle)';
  const iconBg = variant === 'light'
    ? 'rgba(255, 255, 255, 0.15)'
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
          }}
        >
          {title}
        </Paragraph>
        <Paragraph
          data-size="xs"
          style={{
            color: subtleColor,
            margin: 0,
            marginTop: 'var(--ds-spacing-1)',
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
    ? 'rgba(255, 255, 255, 0.15)'
    : 'var(--ds-color-neutral-surface-hover)';
  const textColor = variant === 'light'
    ? 'var(--digilist-login-overlay-text, #ffffff)'
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
        color: 'var(--ds-color-neutral-text-subtle)',
        textDecoration: 'none',
        transition: 'color 0.2s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ds-color-accent-text-default)')}
      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ds-color-neutral-text-subtle)')}
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
    <div
      className={cn('login-layout', className)}
      style={{
        display: 'flex',
        minHeight: '100vh',
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
      >
        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: 'var(--ds-spacing-12)',
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
                }}
              >
                {logo || (
                  <img
                    src="/logo.svg"
                    alt={brandName}
                    style={{
                      height: '80px',
                      width: 'auto',
                    }}
                  />
                )}
                <div>
                  <div
                    style={{
                      fontSize: '1.75rem',
                      fontWeight: 'var(--ds-font-weight-bold)',
                      color: 'var(--ds-color-accent-base-default)',
                      lineHeight: 1.1,
                      letterSpacing: '0.05em',
                    }}
                  >
                    {brandName}
                  </div>
                  <div
                    style={{
                      fontSize: 'var(--ds-font-size-sm)',
                      color: 'var(--ds-color-neutral-text-subtle)',
                      letterSpacing: '0.1em',
                      marginTop: 'var(--ds-spacing-1)',
                    }}
                  >
                    {brandTagline}
                  </div>
                </div>
              </a>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)' }}>
                {logo || (
                  <img
                    src="/logo.svg"
                    alt={brandName}
                    style={{
                      height: '80px',
                      width: 'auto',
                    }}
                  />
                )}
                <div>
                  <div
                    style={{
                      fontSize: '1.75rem',
                      fontWeight: 'var(--ds-font-weight-bold)',
                      color: 'var(--ds-color-accent-base-default)',
                      lineHeight: 1.1,
                      letterSpacing: '0.05em',
                    }}
                  >
                    {brandName}
                  </div>
                  <div
                    style={{
                      fontSize: 'var(--ds-font-size-sm)',
                      color: 'var(--ds-color-neutral-text-subtle)',
                      letterSpacing: '0.1em',
                      marginTop: 'var(--ds-spacing-1)',
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
              style={{ color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-8)' }}
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
              padding: 'var(--ds-spacing-6) var(--ds-spacing-12)',
              borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
            }}
          >
            {footerLinks.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-6)',
                  marginBottom: 'var(--ds-spacing-3)',
                }}
              >
                {footerLinks.map((link, index) => (
                  <React.Fragment key={link.href}>
                    {index > 0 && (
                      <span style={{ color: 'var(--ds-color-neutral-border-default)' }}>·</span>
                    )}
                    <LoginFooterLink href={link.href}>{link.label}</LoginFooterLink>
                  </React.Fragment>
                ))}
              </div>
            )}
            {copyright && (
              <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
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
          padding: 'var(--ds-spacing-12)',
          background: 'linear-gradient(135deg, var(--ds-color-accent-base-default) 0%, #1a3a6e 100%)',
        }}
      >
        <div style={{ maxWidth: '480px', margin: '0 auto', width: '100%' }}>
          {/* Header */}
          <div style={{ marginBottom: 'var(--ds-spacing-10)' }}>
            <Paragraph
              data-size="xs"
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                textTransform: 'uppercase',
                letterSpacing: 'var(--ds-letter-spacing-wider, 0.1em)',
                fontWeight: 'var(--ds-font-weight-medium)',
                marginBottom: 'var(--ds-spacing-3)',
              }}
            >
              {panelTitle}
            </Paragraph>
            <Heading
              level={2}
              data-size="2xl"
              style={{
                color: 'var(--digilist-login-overlay-text, #ffffff)',
                marginBottom: 'var(--ds-spacing-4)',
                lineHeight: 'var(--ds-line-height-condensed)',
              }}
            >
              {panelSubtitle}
            </Heading>
            {panelDescription && (
              <Paragraph
                data-size="md"
                style={{
                  color: 'var(--digilist-login-overlay-text-muted, rgba(255, 255, 255, 0.8))',
                  lineHeight: 1.6,
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
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginBottom: 'var(--ds-spacing-3)',
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--ds-letter-spacing-wide, 0.05em)',
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
  );
}

// =============================================================================
// DemoLoginFormData - Form data type for demo login
// =============================================================================

export interface DemoLoginFormData {
  /** User's display name */
  name: string;
  /** User's email address */
  email: string;
  /** Demo token for authentication */
  token: string;
  /** Selected role (optional) */
  role?: string;
}

// =============================================================================
// DemoLoginDialog - Demo Login Modal
// =============================================================================

export interface DemoLoginDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog is closed */
  onClose: () => void;
  /** Callback when form is submitted */
  onSubmit: (data: DemoLoginFormData) => Promise<void>;
  /** Dialog title */
  title?: string;
  /** Dialog description */
  description?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Submit button text */
  submitText?: string;
  /** Loading text shown during submission */
  loadingText?: string;
  /** Validation error messages */
  validationMessages?: {
    nameRequired?: string;
    emailRequired?: string;
    tokenRequired?: string;
    invalidEmail?: string;
  };
  /** Form field labels */
  labels?: {
    name?: string;
    email?: string;
    token?: string;
    role?: string;
  };
  /** Form field placeholders */
  placeholders?: {
    name?: string;
    email?: string;
    token?: string;
    role?: string;
  };
  /** Available roles for selection */
  roles?: Array<{ value: string; label: string }>;
  /** Custom class name */
  className?: string;
}

export function DemoLoginDialog({
  open,
  onClose,
  onSubmit,
  title = 'Demo Login',
  description = 'Enter your details to login with a demo token.',
  cancelText = 'Cancel',
  submitText = 'Login',
  loadingText = 'Logging in...',
  validationMessages = {},
  labels = {},
  placeholders = {},
  roles,
  className,
}: DemoLoginDialogProps): React.ReactElement | null {
  const [formData, setFormData] = React.useState<DemoLoginFormData>({
    name: '',
    email: '',
    token: '',
    role: roles?.[0]?.value || '',
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setFormData({
        name: '',
        email: '',
        token: '',
        role: roles?.[0]?.value || '',
      });
      setErrors({});
      setSubmitError(null);
      setIsSubmitting(false);
    }
  }, [open, roles]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = validationMessages.nameRequired || 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = validationMessages.emailRequired || 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = validationMessages.invalidEmail || 'Invalid email format';
    }

    if (!formData.token.trim()) {
      newErrors.token = validationMessages.tokenRequired || 'Token is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof DemoLoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (!open) return null;

  return (
    <div
      className={cn('demo-login-dialog-overlay', className)}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-login-title"
    >
      <div
        className="demo-login-dialog"
        style={{
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          borderRadius: 'var(--ds-border-radius-lg)',
          padding: 'var(--ds-spacing-6)',
          width: '100%',
          maxWidth: '400px',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Heading level={2} data-size="lg" id="demo-login-title" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          {title}
        </Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-6)' }}>
          {description}
        </Paragraph>

        <form onSubmit={handleSubmit}>
          {/* Name field */}
          <div style={{ marginBottom: 'var(--ds-spacing-4)' }}>
            <label
              htmlFor="demo-name"
              style={{
                display: 'block',
                fontSize: 'var(--ds-font-size-sm)',
                fontWeight: 'var(--ds-font-weight-medium)',
                marginBottom: 'var(--ds-spacing-1)',
                color: 'var(--ds-color-neutral-text-default)',
              }}
            >
              {labels.name || 'Name'}
            </label>
            <input
              type="text"
              id="demo-name"
              name="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={placeholders.name || 'Enter your name'}
              disabled={isSubmitting}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'demo-name-error' : undefined}
              style={{
                width: '100%',
                padding: 'var(--ds-spacing-3)',
                border: `1px solid ${errors.name ? 'var(--ds-color-danger-border-default)' : 'var(--ds-color-neutral-border-default)'}`,
                borderRadius: 'var(--ds-border-radius-md)',
                fontSize: 'var(--ds-font-size-md)',
                backgroundColor: 'var(--ds-color-neutral-background-default)',
                color: 'var(--ds-color-neutral-text-default)',
                boxSizing: 'border-box',
              }}
            />
            {errors.name && (
              <Paragraph id="demo-name-error" data-size="xs" style={{ color: 'var(--ds-color-danger-text-default)', marginTop: 'var(--ds-spacing-1)' }}>
                {errors.name}
              </Paragraph>
            )}
          </div>

          {/* Email field */}
          <div style={{ marginBottom: 'var(--ds-spacing-4)' }}>
            <label
              htmlFor="demo-email"
              style={{
                display: 'block',
                fontSize: 'var(--ds-font-size-sm)',
                fontWeight: 'var(--ds-font-weight-medium)',
                marginBottom: 'var(--ds-spacing-1)',
                color: 'var(--ds-color-neutral-text-default)',
              }}
            >
              {labels.email || 'Email'}
            </label>
            <input
              type="email"
              id="demo-email"
              name="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder={placeholders.email || 'Enter your email'}
              disabled={isSubmitting}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'demo-email-error' : undefined}
              style={{
                width: '100%',
                padding: 'var(--ds-spacing-3)',
                border: `1px solid ${errors.email ? 'var(--ds-color-danger-border-default)' : 'var(--ds-color-neutral-border-default)'}`,
                borderRadius: 'var(--ds-border-radius-md)',
                fontSize: 'var(--ds-font-size-md)',
                backgroundColor: 'var(--ds-color-neutral-background-default)',
                color: 'var(--ds-color-neutral-text-default)',
                boxSizing: 'border-box',
              }}
            />
            {errors.email && (
              <Paragraph id="demo-email-error" data-size="xs" style={{ color: 'var(--ds-color-danger-text-default)', marginTop: 'var(--ds-spacing-1)' }}>
                {errors.email}
              </Paragraph>
            )}
          </div>

          {/* Role field (optional) */}
          {roles && roles.length > 0 && (
            <div style={{ marginBottom: 'var(--ds-spacing-4)' }}>
              <label
                htmlFor="demo-role"
                style={{
                  display: 'block',
                  fontSize: 'var(--ds-font-size-sm)',
                  fontWeight: 'var(--ds-font-weight-medium)',
                  marginBottom: 'var(--ds-spacing-1)',
                  color: 'var(--ds-color-neutral-text-default)',
                }}
              >
                {labels.role || 'Role'}
              </label>
              <select
                id="demo-role"
                name="role"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: 'var(--ds-spacing-3)',
                  border: '1px solid var(--ds-color-neutral-border-default)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  fontSize: 'var(--ds-font-size-md)',
                  backgroundColor: 'var(--ds-color-neutral-background-default)',
                  color: 'var(--ds-color-neutral-text-default)',
                  boxSizing: 'border-box',
                }}
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Token field */}
          <div style={{ marginBottom: 'var(--ds-spacing-6)' }}>
            <label
              htmlFor="demo-token"
              style={{
                display: 'block',
                fontSize: 'var(--ds-font-size-sm)',
                fontWeight: 'var(--ds-font-weight-medium)',
                marginBottom: 'var(--ds-spacing-1)',
                color: 'var(--ds-color-neutral-text-default)',
              }}
            >
              {labels.token || 'Demo Token'}
            </label>
            <input
              type="text"
              id="demo-token"
              name="token"
              value={formData.token}
              onChange={(e) => handleInputChange('token', e.target.value)}
              placeholder={placeholders.token || 'Enter demo token'}
              disabled={isSubmitting}
              aria-invalid={!!errors.token}
              aria-describedby={errors.token ? 'demo-token-error' : undefined}
              style={{
                width: '100%',
                padding: 'var(--ds-spacing-3)',
                border: `1px solid ${errors.token ? 'var(--ds-color-danger-border-default)' : 'var(--ds-color-neutral-border-default)'}`,
                borderRadius: 'var(--ds-border-radius-md)',
                fontSize: 'var(--ds-font-size-md)',
                backgroundColor: 'var(--ds-color-neutral-background-default)',
                color: 'var(--ds-color-neutral-text-default)',
                boxSizing: 'border-box',
              }}
            />
            {errors.token && (
              <Paragraph id="demo-token-error" data-size="xs" style={{ color: 'var(--ds-color-danger-text-default)', marginTop: 'var(--ds-spacing-1)' }}>
                {errors.token}
              </Paragraph>
            )}
          </div>

          {/* Submit error */}
          {submitError && (
            <div
              style={{
                padding: 'var(--ds-spacing-3)',
                backgroundColor: 'var(--ds-color-danger-surface-default)',
                border: '1px solid var(--ds-color-danger-border-default)',
                borderRadius: 'var(--ds-border-radius-md)',
                marginBottom: 'var(--ds-spacing-4)',
              }}
              role="alert"
            >
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-danger-text-default)', margin: 0 }}>
                {submitError}
              </Paragraph>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {cancelText}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? loadingText : submitText}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginLayout;
