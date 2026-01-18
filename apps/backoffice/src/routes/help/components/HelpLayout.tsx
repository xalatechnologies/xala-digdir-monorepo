/**
 * HelpLayout Component
 *
 * Layout wrapper for help pages with right-side Table of Contents.
 * Features:
 * - Sticky TOC on desktop
 * - Smooth scroll to sections
 * - Active section highlighting
 * - Role-aware content filtering
 */
import * as React from 'react';
import { Heading, Paragraph, Button } from '@xala/ds';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@xala/auth';
import { useT } from '@xala/i18n';

// =============================================================================
// Types
// =============================================================================

export interface TocItem {
  id: string;
  title: string;
  /** Roles that can see this section. Empty = all roles */
  roles?: string[];
}

export interface HelpLayoutProps {
  /** Page title */
  title: string;
  /** Page description */
  description?: string;
  /** Table of contents items */
  tocItems?: TocItem[];
  /** Show back button */
  showBackButton?: boolean;
  /** Child content */
  children: React.ReactNode;
}

// =============================================================================
// Icons
// =============================================================================

function ChevronLeftIcon(): React.ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ListIcon(): React.ReactElement {
  const t = useT();
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

// =============================================================================
// Hooks
// =============================================================================

function useActiveSection(tocItems: TocItem[]): string | null {
  const [activeId, setActiveId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (tocItems.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0% -35% 0%',
        threshold: 0,
      }
    );

    tocItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [tocItems]);

  return activeId;
}

// =============================================================================
// Component
// =============================================================================

export function HelpLayout({
  title,
  description,
  tocItems = [],
  showBackButton = false,
  children,
}: HelpLayoutProps): React.ReactElement {
  const location = useLocation();
  const { data: session } = useAuth();
  const userRole = session?.user?.role ?? 'org_member';

  // Filter TOC items based on user role
  const visibleTocItems = tocItems.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    return item.roles.includes(userRole);
  });

  const activeId = useActiveSection(visibleTocItems);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--ds-spacing-8)',
        padding: 'var(--ds-spacing-6)',
        maxWidth: '1400px',
      }}
    >
      {/* Main Content */}
      <main style={{ flex: 1, minWidth: 0 }}>
        <header style={{ marginBottom: 'var(--ds-spacing-8)' }}>
          {showBackButton && (
            <Link
              to="/help"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-1)',
                color: 'var(--ds-color-accent-text-default)',
                textDecoration: 'none',
                marginBottom: 'var(--ds-spacing-3)',
                fontSize: 'var(--ds-font-size-sm)',
              }}
            >
              <ChevronLeftIcon />
              Tilbake til Hjelp
            </Link>
          )}
          <Heading level={1} data-size="lg">
            {title}
          </Heading>
          {description && (
            <Paragraph
              data-size="md"
              style={{
                color: 'var(--ds-color-neutral-text-subtle)',
                marginTop: 'var(--ds-spacing-2)',
              }}
            >
              {description}
            </Paragraph>
          )}
        </header>

        {children}
      </main>

      {/* Right-Side Table of Contents */}
      {visibleTocItems.length > 0 && (
        <aside
          style={{
            width: '240px',
            flexShrink: 0,
            display: 'none', // Hidden on mobile
          }}
          className="help-toc"
        >
          <nav
            style={{
              position: 'sticky',
              top: 'var(--ds-spacing-6)',
              padding: 'var(--ds-spacing-4)',
              backgroundColor: 'var(--ds-color-neutral-surface-default)',
              borderRadius: 'var(--ds-border-radius-md)',
              border: '1px solid var(--ds-color-neutral-border-subtle)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-2)',
                marginBottom: 'var(--ds-spacing-3)',
                color: 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              <ListIcon />
              <Paragraph
                data-size="xs"
                style={{
                  margin: 0,
                  fontWeight: 'var(--ds-font-weight-medium)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                På denne siden
              </Paragraph>
            </div>

            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--ds-spacing-1)',
              }}
            >
              {visibleTocItems.map((item) => {
                const isActive = activeId === item.id;

                return (
                  <li key={item.id}>
                    <Button
                      type="button"
                      variant="tertiary"
                      onClick={() => scrollToSection(item.id)}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                        borderRadius: 'var(--ds-border-radius-sm)',
                        backgroundColor: isActive
                          ? 'var(--ds-color-accent-surface-default)'
                          : 'transparent',
                        color: isActive
                          ? 'var(--ds-color-accent-text-default)'
                          : 'var(--ds-color-neutral-text-subtle)',
                        fontSize: 'var(--ds-font-size-sm)',
                        fontWeight: isActive
                          ? 'var(--ds-font-weight-medium)'
                          : 'var(--ds-font-weight-regular)',
                        borderLeft: isActive
                          ? '2px solid var(--ds-color-accent-base-default)'
                          : '2px solid transparent',
                      }}
                    >
                      {item.title}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Inject CSS for responsive TOC */}
          <style>{`
            t('common.media_minwidth_1024px_helptoc')
          `}</style>
        </aside>
      )}
    </div>
  );
}

export default HelpLayout;
