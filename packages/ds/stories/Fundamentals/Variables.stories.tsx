import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Fundamentals/Variables',
  parameters: {
    docs: {
      description: {
        component: `
CSS Variables (Custom Properties) from Designsystemet.

All styling should use these variables instead of hard-coded values.

## Reference
[Designsystemet Variables](https://designsystemet.no/no/fundamentals/design-elements/variables)
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

const ColorSwatch = ({ variable, label }: { variable: string; label?: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)', marginBottom: 'var(--ds-spacing-2)' }}>
    <div
      style={{
        width: '48px',
        height: '48px',
        backgroundColor: `var(${variable})`,
        borderRadius: 'var(--ds-border-radius-md)',
        border: '1px solid var(--ds-color-neutral-border-default)',
      }}
    />
    <div>
      <code style={{ fontSize: 'var(--ds-font-size-sm)' }}>{variable}</code>
      {label && <div style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>{label}</div>}
    </div>
  </div>
);

const SpacingSwatch = ({ variable, size }: { variable: string; size: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)', marginBottom: 'var(--ds-spacing-2)' }}>
    <div
      style={{
        width: `var(${variable})`,
        height: '24px',
        backgroundColor: 'var(--ds-color-accent-base-default)',
        borderRadius: 'var(--ds-border-radius-sm)',
      }}
    />
    <code style={{ fontSize: 'var(--ds-font-size-sm)', minWidth: '180px' }}>{variable}</code>
    <span style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>{size}</span>
  </div>
);

/**
 * Accent color scale
 */
export const AccentColors: Story = {
  render: () => (
    <div>
      <h3 style={{ marginBottom: 'var(--ds-spacing-4)' }}>Accent Colors</h3>
      <ColorSwatch variable="--ds-color-accent-background-default" label="Background default" />
      <ColorSwatch variable="--ds-color-accent-background-tinted" label="Background tinted" />
      <ColorSwatch variable="--ds-color-accent-surface-default" label="Surface default" />
      <ColorSwatch variable="--ds-color-accent-surface-hover" label="Surface hover" />
      <ColorSwatch variable="--ds-color-accent-surface-active" label="Surface active" />
      <ColorSwatch variable="--ds-color-accent-border-subtle" label="Border subtle" />
      <ColorSwatch variable="--ds-color-accent-border-default" label="Border default" />
      <ColorSwatch variable="--ds-color-accent-border-strong" label="Border strong" />
      <ColorSwatch variable="--ds-color-accent-base-default" label="Base default" />
      <ColorSwatch variable="--ds-color-accent-base-hover" label="Base hover" />
      <ColorSwatch variable="--ds-color-accent-base-active" label="Base active" />
      <ColorSwatch variable="--ds-color-accent-text-subtle" label="Text subtle" />
      <ColorSwatch variable="--ds-color-accent-text-default" label="Text default" />
      <ColorSwatch variable="--ds-color-accent-contrast-default" label="Contrast default" />
    </div>
  ),
};

/**
 * Neutral color scale
 */
export const NeutralColors: Story = {
  render: () => (
    <div>
      <h3 style={{ marginBottom: 'var(--ds-spacing-4)' }}>Neutral Colors</h3>
      <ColorSwatch variable="--ds-color-neutral-background-default" label="Background default" />
      <ColorSwatch variable="--ds-color-neutral-background-tinted" label="Background tinted" />
      <ColorSwatch variable="--ds-color-neutral-surface-default" label="Surface default" />
      <ColorSwatch variable="--ds-color-neutral-surface-hover" label="Surface hover" />
      <ColorSwatch variable="--ds-color-neutral-surface-active" label="Surface active" />
      <ColorSwatch variable="--ds-color-neutral-border-subtle" label="Border subtle" />
      <ColorSwatch variable="--ds-color-neutral-border-default" label="Border default" />
      <ColorSwatch variable="--ds-color-neutral-border-strong" label="Border strong" />
      <ColorSwatch variable="--ds-color-neutral-base-default" label="Base default" />
      <ColorSwatch variable="--ds-color-neutral-base-hover" label="Base hover" />
      <ColorSwatch variable="--ds-color-neutral-text-subtle" label="Text subtle" />
      <ColorSwatch variable="--ds-color-neutral-text-default" label="Text default" />
    </div>
  ),
};

/**
 * Semantic colors (success, warning, danger, info)
 */
export const SemanticColors: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--ds-spacing-8)' }}>
      <div>
        <h4 style={{ marginBottom: 'var(--ds-spacing-3)', color: 'var(--ds-color-success-text-default)' }}>Success</h4>
        <ColorSwatch variable="--ds-color-success-surface-default" label="Surface" />
        <ColorSwatch variable="--ds-color-success-border-default" label="Border" />
        <ColorSwatch variable="--ds-color-success-base-default" label="Base" />
        <ColorSwatch variable="--ds-color-success-text-default" label="Text" />
      </div>
      <div>
        <h4 style={{ marginBottom: 'var(--ds-spacing-3)', color: 'var(--ds-color-warning-text-default)' }}>Warning</h4>
        <ColorSwatch variable="--ds-color-warning-surface-default" label="Surface" />
        <ColorSwatch variable="--ds-color-warning-border-default" label="Border" />
        <ColorSwatch variable="--ds-color-warning-base-default" label="Base" />
        <ColorSwatch variable="--ds-color-warning-text-default" label="Text" />
      </div>
      <div>
        <h4 style={{ marginBottom: 'var(--ds-spacing-3)', color: 'var(--ds-color-danger-text-default)' }}>Danger</h4>
        <ColorSwatch variable="--ds-color-danger-surface-default" label="Surface" />
        <ColorSwatch variable="--ds-color-danger-border-default" label="Border" />
        <ColorSwatch variable="--ds-color-danger-base-default" label="Base" />
        <ColorSwatch variable="--ds-color-danger-text-default" label="Text" />
      </div>
      <div>
        <h4 style={{ marginBottom: 'var(--ds-spacing-3)', color: 'var(--ds-color-info-text-default)' }}>Info</h4>
        <ColorSwatch variable="--ds-color-info-surface-default" label="Surface" />
        <ColorSwatch variable="--ds-color-info-border-default" label="Border" />
        <ColorSwatch variable="--ds-color-info-base-default" label="Base" />
        <ColorSwatch variable="--ds-color-info-text-default" label="Text" />
      </div>
    </div>
  ),
};

/**
 * Spacing scale
 */
export const Spacing: Story = {
  render: () => (
    <div>
      <h3 style={{ marginBottom: 'var(--ds-spacing-4)' }}>Spacing Scale</h3>
      <SpacingSwatch variable="--ds-spacing-0" size="0" />
      <SpacingSwatch variable="--ds-spacing-1" size="4px / 0.25rem" />
      <SpacingSwatch variable="--ds-spacing-2" size="8px / 0.5rem" />
      <SpacingSwatch variable="--ds-spacing-3" size="12px / 0.75rem" />
      <SpacingSwatch variable="--ds-spacing-4" size="16px / 1rem" />
      <SpacingSwatch variable="--ds-spacing-5" size="20px / 1.25rem" />
      <SpacingSwatch variable="--ds-spacing-6" size="24px / 1.5rem" />
      <SpacingSwatch variable="--ds-spacing-7" size="28px / 1.75rem" />
      <SpacingSwatch variable="--ds-spacing-8" size="32px / 2rem" />
      <SpacingSwatch variable="--ds-spacing-9" size="36px / 2.25rem" />
      <SpacingSwatch variable="--ds-spacing-10" size="40px / 2.5rem" />
      <SpacingSwatch variable="--ds-spacing-11" size="44px / 2.75rem" />
      <SpacingSwatch variable="--ds-spacing-12" size="48px / 3rem" />
      <SpacingSwatch variable="--ds-spacing-14" size="56px / 3.5rem" />
      <SpacingSwatch variable="--ds-spacing-16" size="64px / 4rem" />
      <SpacingSwatch variable="--ds-spacing-18" size="72px / 4.5rem" />
      <SpacingSwatch variable="--ds-spacing-20" size="80px / 5rem" />
    </div>
  ),
};

/**
 * Border radius
 */
export const BorderRadius: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-4)' }}>
      {[
        { variable: '--ds-border-radius-sm', label: 'sm' },
        { variable: '--ds-border-radius-md', label: 'md' },
        { variable: '--ds-border-radius-lg', label: 'lg' },
        { variable: '--ds-border-radius-xl', label: 'xl' },
        { variable: '--ds-border-radius-2xl', label: '2xl' },
        { variable: '--ds-border-radius-3xl', label: '3xl' },
        { variable: '--ds-border-radius-4xl', label: '4xl' },
        { variable: '--ds-border-radius-full', label: 'full' },
      ].map(({ variable, label }) => (
        <div key={variable} style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              backgroundColor: 'var(--ds-color-accent-base-default)',
              borderRadius: `var(${variable})`,
              marginBottom: 'var(--ds-spacing-2)',
            }}
          />
          <code style={{ fontSize: 'var(--ds-font-size-xs)' }}>{label}</code>
        </div>
      ))}
    </div>
  ),
};

/**
 * Shadows
 */
export const Shadows: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-6)' }}>
      {['xs', 'sm', 'md', 'lg', 'xl'].map((size) => (
        <div key={size} style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '120px',
              height: '80px',
              backgroundColor: 'var(--ds-color-neutral-background-default)',
              borderRadius: 'var(--ds-border-radius-md)',
              boxShadow: `var(--ds-shadow-${size})`,
              marginBottom: 'var(--ds-spacing-3)',
            }}
          />
          <code style={{ fontSize: 'var(--ds-font-size-sm)' }}>--ds-shadow-{size}</code>
        </div>
      ))}
    </div>
  ),
};

/**
 * Font sizes
 */
export const FontSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
      {[
        { variable: '--ds-font-size-1', label: 'font-size-1 (12px)' },
        { variable: '--ds-font-size-2', label: 'font-size-2 (14px)' },
        { variable: '--ds-font-size-3', label: 'font-size-3 (16px)' },
        { variable: '--ds-font-size-4', label: 'font-size-4 (18px)' },
        { variable: '--ds-font-size-5', label: 'font-size-5 (21px)' },
        { variable: '--ds-font-size-6', label: 'font-size-6 (24px)' },
        { variable: '--ds-font-size-7', label: 'font-size-7 (30px)' },
        { variable: '--ds-font-size-8', label: 'font-size-8 (36px)' },
        { variable: '--ds-font-size-9', label: 'font-size-9 (48px)' },
        { variable: '--ds-font-size-10', label: 'font-size-10 (60px)' },
      ].map(({ variable, label }) => (
        <div key={variable} style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--ds-spacing-4)' }}>
          <span style={{ fontSize: `var(${variable})` }}>Aa</span>
          <code style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            {label}
          </code>
        </div>
      ))}
    </div>
  ),
};

/**
 * Complete usage example
 */
export const UsageExample: Story = {
  render: () => (
    <div>
      <h3 style={{ marginBottom: 'var(--ds-spacing-4)' }}>Usage Example</h3>
      <div
        style={{
          padding: 'var(--ds-spacing-6)',
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
          border: '1px solid var(--ds-color-neutral-border-default)',
          borderRadius: 'var(--ds-border-radius-lg)',
          boxShadow: 'var(--ds-shadow-md)',
        }}
      >
        <h4 style={{ 
          fontSize: 'var(--ds-font-size-5)', 
          color: 'var(--ds-color-neutral-text-default)',
          marginBottom: 'var(--ds-spacing-2)',
        }}>
          Card Title
        </h4>
        <p style={{ 
          fontSize: 'var(--ds-font-size-3)', 
          color: 'var(--ds-color-neutral-text-subtle)',
          marginBottom: 'var(--ds-spacing-4)',
        }}>
          This card uses only CSS variables for styling.
        </p>
        <button style={{
          padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
          backgroundColor: 'var(--ds-color-accent-base-default)',
          color: 'var(--ds-color-accent-contrast-default)',
          border: 'none',
          borderRadius: 'var(--ds-border-radius-md)',
          fontSize: 'var(--ds-font-size-2)',
          cursor: 'pointer',
        }}>
          Action
        </button>
      </div>
      
      <pre style={{ 
        marginTop: 'var(--ds-spacing-4)',
        padding: 'var(--ds-spacing-4)',
        backgroundColor: 'var(--ds-color-neutral-surface-hover)',
        borderRadius: 'var(--ds-border-radius-md)',
        fontSize: 'var(--ds-font-size-2)',
        overflow: 'auto',
      }}>
{`// Always use CSS variables
<div style={{
  padding: 'var(--ds-spacing-6)',
  backgroundColor: 'var(--ds-color-neutral-surface-default)',
  borderRadius: 'var(--ds-border-radius-lg)',
  boxShadow: 'var(--ds-shadow-md)',
}}>
  ...
</div>`}
      </pre>
    </div>
  ),
};
