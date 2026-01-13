import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heading, Paragraph, Button } from '@xala/ds';
import { useAuth } from '../hooks/useAuth';

// ID-porten logo icon
const IdPortenIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#1E2B3C"/>
    <path d="M20 8L12 14V26L20 32L28 26V14L20 8Z" stroke="white" strokeWidth="2" fill="none"/>
    <rect x="18" y="14" width="4" height="8" fill="white"/>
    <rect x="18" y="24" width="4" height="3" fill="white"/>
  </svg>
);

// Microsoft logo icon
const MicrosoftIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#F3F3F3"/>
    <rect x="10" y="10" width="9" height="9" fill="#F25022"/>
    <rect x="21" y="10" width="9" height="9" fill="#7FBA00"/>
    <rect x="10" y="21" width="9" height="9" fill="#00A4EF"/>
    <rect x="21" y="21" width="9" height="9" fill="#FFB900"/>
  </svg>
);

// Feature icons
const PlatformIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const AutomationIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v4" />
    <path d="m6.8 15-3.5 2" />
    <path d="m20.7 17-3.5-2" />
    <path d="M6.8 9 3.3 7" />
    <path d="m20.7 7-3.5 2" />
    <circle cx="12" cy="12" r="4" />
  </svg>
);

const SecurityIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

interface LoginOptionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

function LoginOption({ icon, title, description, onClick }: LoginOptionProps) {
  return (
    <Button
      type="button"
      variant="secondary"
      onClick={onClick}
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

interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <div
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
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          color: 'var(--digilist-login-overlay-text)',
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
            color: 'var(--digilist-login-overlay-text)',
            margin: 0,
          }}
        >
          {title}
        </Paragraph>
        <Paragraph
          data-size="xs"
          style={{
            color: 'var(--digilist-login-overlay-text-muted)',
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

export function LoginPage() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, from]);

  if (isLoading) {
    return null;
  }

  const features = [
    {
      icon: <PlatformIcon />,
      title: 'Komplett plattform',
      description: 'Booking, betaling, kalender og rapportering i én løsning',
    },
    {
      icon: <AutomationIcon />,
      title: 'Automatisering',
      description: 'Regelbasert godkjenning reduserer manuelt arbeid',
    },
    {
      icon: <SecurityIcon />,
      title: 'GDPR-klar & Sikker',
      description: 'Full etterlevelse av personvernregler og norske standarder',
    },
  ];

  const integrations = ['BankID', 'Vipps', 'Visma', 'RCO', 'ISO 27001', 'ISO 27701'];

  return (
    <div
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)' }}>
              <img
                src="/logo.svg"
                alt="Digilist"
                style={{
                  height: '80px',
                  width: 'auto',
                }}
              />
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
                  DIGILIST
                </div>
                <div
                  style={{
                    fontSize: 'var(--ds-font-size-sm)',
                    color: 'var(--ds-color-neutral-text-subtle)',
                    letterSpacing: '0.1em',
                    marginTop: 'var(--ds-spacing-1)',
                  }}
                >
                  ENKEL BOOKING
                </div>
              </div>
            </div>
          </div>

          {/* Login section */}
          <div>
            <Heading level={1} data-size="xl" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              Logg inn
            </Heading>
            <Paragraph
              data-size="md"
              style={{ color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-8)' }}
            >
              Velg innloggingsmetode i henhold til kommunens retningslinjer.
            </Paragraph>

            {/* Login options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
              <LoginOption
                icon={<IdPortenIcon />}
                title="ID-porten"
                description="Personlig innlogging med BankID"
                onClick={() => login('idporten')}
              />
              <LoginOption
                icon={<MicrosoftIcon />}
                title="Microsoft"
                description="Single Sign-On (SSO)"
                onClick={() => login('microsoft')}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: 'var(--ds-spacing-6) var(--ds-spacing-12)',
            borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-6)',
              marginBottom: 'var(--ds-spacing-3)',
            }}
          >
            <a
              href="https://digilist.no/personvern"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 'var(--ds-font-size-sm)',
                color: 'var(--ds-color-neutral-text-subtle)',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ds-color-accent-text-default)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ds-color-neutral-text-subtle)')}
            >
              Personvern
            </a>
            <span style={{ color: 'var(--ds-color-neutral-border-default)' }}>·</span>
            <a
              href="https://digilist.no/cookies"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 'var(--ds-font-size-sm)',
                color: 'var(--ds-color-neutral-text-subtle)',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ds-color-accent-text-default)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ds-color-neutral-text-subtle)')}
            >
              Vilkår for bruk
            </a>
            <span style={{ color: 'var(--ds-color-neutral-border-default)' }}>·</span>
            <a
              href="https://digilist.no/#book-demo"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 'var(--ds-font-size-sm)',
                color: 'var(--ds-color-neutral-text-subtle)',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ds-color-accent-text-default)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ds-color-neutral-text-subtle)')}
            >
              Kontakt support
            </a>
          </div>
          <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            © 2026 Digilist. Alle rettigheter reservert.
          </Paragraph>
        </div>
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
              Backoffice
            </Paragraph>
            <Heading
              level={2}
              data-size="2xl"
              style={{
                color: 'var(--digilist-login-overlay-text)',
                marginBottom: 'var(--ds-spacing-4)',
                lineHeight: 'var(--ds-line-height-condensed)',
              }}
            >
              En helhetlig bookingløsning
            </Heading>
            <Paragraph
              data-size="md"
              style={{
                color: 'var(--digilist-login-overlay-text-muted)',
                lineHeight: 1.6,
              }}
            >
              Skybasert plattform for booking av kommunale anlegg og ressurser med moderne design, betaling og rapportering.
            </Paragraph>
          </div>

          {/* Features */}
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
              />
            ))}
          </div>

          {/* Integrations */}
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
                <span
                  key={integration}
                  style={{
                    padding: 'var(--ds-spacing-1) var(--ds-spacing-3)',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: 'var(--ds-border-radius-full)',
                    fontSize: 'var(--ds-font-size-xs)',
                    fontWeight: 'var(--ds-font-weight-medium)',
                    color: 'var(--digilist-login-overlay-text)',
                  }}
                >
                  {integration}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
