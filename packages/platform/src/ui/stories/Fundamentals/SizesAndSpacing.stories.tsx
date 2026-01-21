import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Fundamentals/Sizes and Spacing',
  parameters: {
    docs: {
      description: {
        component: `
Sizes and spacing system from Designsystemet.

## Size Modes
Components can be rendered in three size modes using \`data-size\`:
- **sm** - Small/compact
- **md** - Medium (default)
- **lg** - Large/comfortable

## Spacing Scale
Uses \`--ds-spacing-*\` tokens for consistent rhythm.

## Reference
[Designsystemet Sizes and Spacing](https://designsystemet.no/no/fundamentals/design-elements/sizes-and-spacing)
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

/**
 * Size modes affect component dimensions
 */
export const SizeModes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-8)' }}>
      <div data-size="sm">
        <h4 style={{ marginBottom: 'var(--ds-spacing-2)' }}>Small (data-size="sm")</h4>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', alignItems: 'center' }}>
          <button className="ds-button" data-variant="primary" type="button">Button</button>
          <input type="text" placeholder="Input field" style={{ padding: 'var(--ds-spacing-2)', borderRadius: 'var(--ds-border-radius-md)' }} />
          <span style={{ padding: 'var(--ds-spacing-1) var(--ds-spacing-2)', backgroundColor: 'var(--ds-color-accent-surface-default)', borderRadius: 'var(--ds-border-radius-sm)', fontSize: 'var(--ds-font-size-sm)' }}>Tag</span>
        </div>
      </div>
      
      <div data-size="md">
        <h4 style={{ marginBottom: 'var(--ds-spacing-2)' }}>Medium (data-size="md") - Default</h4>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', alignItems: 'center' }}>
          <button className="ds-button" data-variant="primary" type="button">Button</button>
          <input type="text" placeholder="Input field" style={{ padding: 'var(--ds-spacing-2)', borderRadius: 'var(--ds-border-radius-md)' }} />
          <span style={{ padding: 'var(--ds-spacing-1) var(--ds-spacing-2)', backgroundColor: 'var(--ds-color-accent-surface-default)', borderRadius: 'var(--ds-border-radius-sm)', fontSize: 'var(--ds-font-size-sm)' }}>Tag</span>
        </div>
      </div>
      
      <div data-size="lg">
        <h4 style={{ marginBottom: 'var(--ds-spacing-2)' }}>Large (data-size="lg")</h4>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', alignItems: 'center' }}>
          <button className="ds-button" data-variant="primary" type="button">Button</button>
          <input type="text" placeholder="Input field" style={{ padding: 'var(--ds-spacing-2)', borderRadius: 'var(--ds-border-radius-md)' }} />
          <span style={{ padding: 'var(--ds-spacing-1) var(--ds-spacing-2)', backgroundColor: 'var(--ds-color-accent-surface-default)', borderRadius: 'var(--ds-border-radius-sm)', fontSize: 'var(--ds-font-size-sm)' }}>Tag</span>
        </div>
      </div>
    </div>
  ),
};

/**
 * Visual spacing scale
 */
export const SpacingScale: Story = {
  render: () => {
    const spacings = [
      { token: '0', value: '0' },
      { token: '1', value: '4px / 0.25rem' },
      { token: '2', value: '8px / 0.5rem' },
      { token: '3', value: '12px / 0.75rem' },
      { token: '4', value: '16px / 1rem' },
      { token: '5', value: '20px / 1.25rem' },
      { token: '6', value: '24px / 1.5rem' },
      { token: '7', value: '28px / 1.75rem' },
      { token: '8', value: '32px / 2rem' },
      { token: '9', value: '36px / 2.25rem' },
      { token: '10', value: '40px / 2.5rem' },
      { token: '11', value: '44px / 2.75rem' },
      { token: '12', value: '48px / 3rem' },
      { token: '14', value: '56px / 3.5rem' },
      { token: '16', value: '64px / 4rem' },
      { token: '18', value: '72px / 4.5rem' },
      { token: '20', value: '80px / 5rem' },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-1)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 120px', gap: 'var(--ds-spacing-2)', padding: 'var(--ds-spacing-2)', backgroundColor: 'var(--ds-color-neutral-surface-hover)', borderRadius: 'var(--ds-border-radius-md)', fontWeight: 'var(--ds-font-weight-semibold)', fontSize: 'var(--ds-font-size-sm)' }}>
          <span>Token</span>
          <span>Visual</span>
          <span>Value</span>
        </div>
        {spacings.map(({ token, value }) => (
          <div key={token} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 120px', gap: 'var(--ds-spacing-2)', alignItems: 'center', padding: 'var(--ds-spacing-2)' }}>
            <code style={{ fontSize: 'var(--ds-font-size-sm)' }}>--ds-spacing-{token}</code>
            <div style={{ height: '24px', display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  width: `var(--ds-spacing-${token})`,
                  height: '24px',
                  backgroundColor: 'var(--ds-color-accent-base-default)',
                  borderRadius: 'var(--ds-border-radius-sm)',
                  minWidth: token === '0' ? '2px' : undefined,
                }}
              />
            </div>
            <span style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>{value}</span>
          </div>
        ))}
      </div>
    );
  },
};

/**
 * Spacing in practice - padding and margins
 */
export const SpacingInPractice: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      <div>
        <h4 style={{ marginBottom: 'var(--ds-spacing-2)' }}>Padding Examples</h4>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-4)', flexWrap: 'wrap' }}>
          {['2', '4', '6', '8'].map((size) => (
            <div key={size} style={{ backgroundColor: 'var(--ds-color-accent-surface-default)', borderRadius: 'var(--ds-border-radius-md)' }}>
              <div style={{ padding: `var(--ds-spacing-${size})`, backgroundColor: 'var(--ds-color-neutral-background-default)', borderRadius: 'var(--ds-border-radius-md)', border: '1px dashed var(--ds-color-accent-border-default)' }}>
                <code style={{ fontSize: 'var(--ds-font-size-xs)' }}>padding: spacing-{size}</code>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 style={{ marginBottom: 'var(--ds-spacing-2)' }}>Gap Examples (Flexbox/Grid)</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          {['2', '4', '6'].map((size) => (
            <div key={size}>
              <code style={{ fontSize: 'var(--ds-font-size-xs)', marginBottom: 'var(--ds-spacing-1)', display: 'block' }}>gap: spacing-{size}</code>
              <div style={{ display: 'flex', gap: `var(--ds-spacing-${size})` }}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} style={{ width: '48px', height: '48px', backgroundColor: 'var(--ds-color-accent-base-default)', borderRadius: 'var(--ds-border-radius-md)' }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};

/**
 * Component sizing tokens
 */
export const ComponentSizing: Story = {
  render: () => {
    const sizings = [
      { token: '0', value: '0' },
      { token: '1', value: '4px' },
      { token: '2', value: '8px' },
      { token: '3', value: '12px' },
      { token: '4', value: '16px' },
      { token: '5', value: '20px' },
      { token: '6', value: '24px' },
      { token: '7', value: '28px' },
      { token: '8', value: '32px' },
      { token: '9', value: '36px' },
      { token: '10', value: '40px' },
      { token: '11', value: '44px' },
      { token: '12', value: '48px' },
    ];

    return (
      <div>
        <h4 style={{ marginBottom: 'var(--ds-spacing-4)' }}>Size Tokens (--ds-size-*)</h4>
        <p style={{ marginBottom: 'var(--ds-spacing-4)', color: 'var(--ds-color-neutral-text-subtle)', fontSize: 'var(--ds-font-size-sm)' }}>
          Used for component heights, widths, and icon sizes.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-4)', alignItems: 'flex-end' }}>
          {sizings.slice(4).map(({ token, value }) => (
            <div key={token} style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: `var(--ds-size-${token})`,
                  height: `var(--ds-size-${token})`,
                  backgroundColor: 'var(--ds-color-accent-base-default)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  marginBottom: 'var(--ds-spacing-2)',
                }}
              />
              <code style={{ fontSize: 'var(--ds-font-size-xs)', display: 'block' }}>{token}</code>
              <span style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

/**
 * Semantic spacing usage
 */
export const SemanticUsage: Story = {
  render: () => (
    <div style={{ maxWidth: '600px' }}>
      <h4 style={{ marginBottom: 'var(--ds-spacing-4)' }}>When to Use Which Spacing</h4>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--ds-font-size-sm)' }}>
        <thead>
          <tr style={{ backgroundColor: 'var(--ds-color-neutral-surface-hover)' }}>
            <th style={{ padding: 'var(--ds-spacing-3)', textAlign: 'left', borderBottom: '1px solid var(--ds-color-neutral-border-default)' }}>Use Case</th>
            <th style={{ padding: 'var(--ds-spacing-3)', textAlign: 'left', borderBottom: '1px solid var(--ds-color-neutral-border-default)' }}>Token</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: 'var(--ds-spacing-3)', borderBottom: '1px solid var(--ds-color-neutral-border-subtle)' }}>Inline elements, icon gaps</td>
            <td style={{ padding: 'var(--ds-spacing-3)', borderBottom: '1px solid var(--ds-color-neutral-border-subtle)' }}><code>spacing-1, spacing-2</code></td>
          </tr>
          <tr>
            <td style={{ padding: 'var(--ds-spacing-3)', borderBottom: '1px solid var(--ds-color-neutral-border-subtle)' }}>Form field gaps, button groups</td>
            <td style={{ padding: 'var(--ds-spacing-3)', borderBottom: '1px solid var(--ds-color-neutral-border-subtle)' }}><code>spacing-3, spacing-4</code></td>
          </tr>
          <tr>
            <td style={{ padding: 'var(--ds-spacing-3)', borderBottom: '1px solid var(--ds-color-neutral-border-subtle)' }}>Card padding, section gaps</td>
            <td style={{ padding: 'var(--ds-spacing-3)', borderBottom: '1px solid var(--ds-color-neutral-border-subtle)' }}><code>spacing-5, spacing-6</code></td>
          </tr>
          <tr>
            <td style={{ padding: 'var(--ds-spacing-3)', borderBottom: '1px solid var(--ds-color-neutral-border-subtle)' }}>Page sections, large containers</td>
            <td style={{ padding: 'var(--ds-spacing-3)', borderBottom: '1px solid var(--ds-color-neutral-border-subtle)' }}><code>spacing-8, spacing-10</code></td>
          </tr>
          <tr>
            <td style={{ padding: 'var(--ds-spacing-3)', borderBottom: '1px solid var(--ds-color-neutral-border-subtle)' }}>Major page divisions</td>
            <td style={{ padding: 'var(--ds-spacing-3)', borderBottom: '1px solid var(--ds-color-neutral-border-subtle)' }}><code>spacing-12+</code></td>
          </tr>
        </tbody>
      </table>
    </div>
  ),
};

/**
 * Card layout example with proper spacing
 */
export const CardLayoutExample: Story = {
  render: () => (
    <div style={{ maxWidth: '400px' }}>
      <div
        style={{
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
          border: '1px solid var(--ds-color-neutral-border-default)',
          borderRadius: 'var(--ds-border-radius-lg)',
          overflow: 'hidden',
        }}
      >
        <div style={{ 
          height: '160px', 
          backgroundColor: 'var(--ds-color-accent-surface-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--ds-color-accent-text-default)',
        }}>
          Image Area
        </div>
        
        <div style={{ padding: 'var(--ds-spacing-6)' }}>
          <h3 style={{ 
            fontSize: 'var(--ds-font-size-5)', 
            marginBottom: 'var(--ds-spacing-2)',
            color: 'var(--ds-color-neutral-text-default)',
          }}>
            Card Title
          </h3>
          
          <p style={{ 
            fontSize: 'var(--ds-font-size-3)', 
            color: 'var(--ds-color-neutral-text-subtle)',
            marginBottom: 'var(--ds-spacing-4)',
          }}>
            Description text with proper line spacing for readability.
          </p>
          
          <div style={{ 
            display: 'flex', 
            gap: 'var(--ds-spacing-2)',
            marginBottom: 'var(--ds-spacing-4)',
          }}>
            <span style={{ 
              padding: 'var(--ds-spacing-1) var(--ds-spacing-2)', 
              backgroundColor: 'var(--ds-color-accent-surface-default)',
              borderRadius: 'var(--ds-border-radius-sm)',
              fontSize: 'var(--ds-font-size-2)',
            }}>
              Tag 1
            </span>
            <span style={{ 
              padding: 'var(--ds-spacing-1) var(--ds-spacing-2)', 
              backgroundColor: 'var(--ds-color-accent-surface-default)',
              borderRadius: 'var(--ds-border-radius-sm)',
              fontSize: 'var(--ds-font-size-2)',
            }}>
              Tag 2
            </span>
          </div>
        </div>
        
        <div style={{ 
          padding: 'var(--ds-spacing-4) var(--ds-spacing-6)',
          backgroundColor: 'var(--ds-color-neutral-surface-hover)',
          borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: 'var(--ds-font-size-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            Meta info
          </span>
          <button style={{
            padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-accent-base-default)',
            color: 'var(--ds-color-accent-contrast-default)',
            border: 'none',
            borderRadius: 'var(--ds-border-radius-md)',
            fontSize: 'var(--ds-font-size-2)',
            cursor: 'pointer',
          }} type="button">
            Action
          </button>
        </div>
      </div>
      
      <div style={{ marginTop: 'var(--ds-spacing-4)', fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>
        <strong>Spacing used:</strong> spacing-1 (tags), spacing-2 (gaps), spacing-4 (sections), spacing-6 (card padding)
      </div>
    </div>
  ),
};
