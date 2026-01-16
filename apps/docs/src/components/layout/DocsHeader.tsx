import {
  HeaderActions,
  HeaderThemeToggle,
  Paragraph,
  ExternalLinkIcon,
} from '@xala/ds';
import { useTheme } from '../../App';

interface DocsHeaderProps {
  title?: string;
}

export function DocsHeader({ title }: DocsHeaderProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
        borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
        boxShadow: 'var(--ds-shadow-xs)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '72px',
          padding: '0 var(--ds-spacing-6)',
        }}
      >
        {/* Left side - Page title */}
        <div style={{ flex: '1 1 0', minWidth: 0 }}>
          {title && (
            <Paragraph
              data-size="lg"
              style={{
                margin: 0,
                fontWeight: 'var(--ds-font-weight-semibold)',
                color: 'var(--ds-color-neutral-text-default)',
              }}
            >
              {title}
            </Paragraph>
          )}
        </div>

        {/* Right side - Actions */}
        <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'flex-end' }}>
          <HeaderActions spacing="var(--ds-spacing-3)">
            <HeaderThemeToggle
              isDark={isDark}
              onToggle={toggleTheme}
            />
            <div
              style={{
                width: '1px',
                height: '28px',
                backgroundColor: 'var(--ds-color-neutral-border-subtle)',
                margin: '0 var(--ds-spacing-2)',
              }}
            />
            <a
              href="https://github.com/xala-platform"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-2)',
                padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
                borderRadius: 'var(--ds-border-radius-md)',
                textDecoration: 'none',
                color: 'var(--ds-color-neutral-text-default)',
                fontSize: 'var(--ds-font-size-sm)',
                fontWeight: 'var(--ds-font-weight-medium)',
                backgroundColor: 'transparent',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--ds-color-neutral-surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              GitHub
              <ExternalLinkIcon size={16} />
            </a>
          </HeaderActions>
        </div>
      </div>
    </header>
  );
}
