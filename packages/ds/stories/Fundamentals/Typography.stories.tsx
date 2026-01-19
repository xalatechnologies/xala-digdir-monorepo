import type { Meta, StoryObj } from '@storybook/react';
import { Heading, Paragraph, Label } from '@digdir/designsystemet-react';

const meta: Meta = {
  title: 'Fundamentals/Typography',
  parameters: {
    docs: {
      description: {
        component: `
Typography system from Designsystemet with Digilist theme.

## Type Scale
Based on a modular scale with responsive sizing via \`data-size\` attribute.

## Font
Uses Inter font family for optimal readability.

## Reference
[Designsystemet Typography](https://designsystemet.no/no/fundamentals/design-elements/typography)
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

/**
 * Heading sizes from 2xl to 2xs
 */
export const Headings: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
      <Heading level={1} data-size="2xl">Heading 2XL (h1)</Heading>
      <Heading level={1} data-size="xl">Heading XL (h1)</Heading>
      <Heading level={2} data-size="lg">Heading LG (h2)</Heading>
      <Heading level={2} data-size="md">Heading MD (h2)</Heading>
      <Heading level={3} data-size="sm">Heading SM (h3)</Heading>
      <Heading level={3} data-size="xs">Heading XS (h3)</Heading>
      <Heading level={4} data-size="2xs">Heading 2XS (h4)</Heading>
    </div>
  ),
};

/**
 * Body text variants
 */
export const BodyText: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)', maxWidth: '600px' }}>
      <div>
        <Label>Body XL</Label>
        <Paragraph data-size="xl">
          Dette er brødtekst i XL-størrelse. Brukes for fremhevet innhold.
        </Paragraph>
      </div>
      <div>
        <Label>Body LG</Label>
        <Paragraph data-size="lg">
          Dette er brødtekst i LG-størrelse. God for ingress og viktig informasjon.
        </Paragraph>
      </div>
      <div>
        <Label>Body MD (default)</Label>
        <Paragraph data-size="md">
          Dette er standard brødtekst. Den brukes for mesteparten av innholdet på siden.
          Lengre avsnitt bør bruke denne størrelsen for optimal lesbarhet.
        </Paragraph>
      </div>
      <div>
        <Label>Body SM</Label>
        <Paragraph data-size="sm">
          Dette er mindre brødtekst. Brukes for sekundært innhold, bildetekster, og metadata.
        </Paragraph>
      </div>
      <div>
        <Label>Body XS</Label>
        <Paragraph data-size="xs">
          Minste brødtekst. Brukes sparsommelig for fotnoter og juridisk tekst.
        </Paragraph>
      </div>
    </div>
  ),
};

/**
 * Paragraph variants (short vs long)
 */
export const ParagraphVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)', maxWidth: '700px' }}>
      <div>
        <Label style={{ marginBottom: 'var(--ds-spacing-2)' }}>Short (compact line-height)</Label>
        <Paragraph variant="short">
          Kort variant har tettere linjeavstand og passer for UI-tekst, 
          knapper, og korte beskrivelser hvor kompakthet er ønsket.
        </Paragraph>
      </div>
      <div>
        <Label style={{ marginBottom: 'var(--ds-spacing-2)' }}>Long (relaxed line-height)</Label>
        <Paragraph variant="long">
          Lang variant har romsligere linjeavstand og er ideell for lengre tekster 
          som artikler og dokumentasjon. Den økte linjeavstanden gjør det lettere 
          å følge teksten over flere linjer og forbedrer lesbarheten betydelig 
          for omfattende innhold.
        </Paragraph>
      </div>
    </div>
  ),
};

/**
 * Labels and form typography
 */
export const FormTypography: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)', maxWidth: '400px' }}>
      <div>
        <Label data-size="lg">Large Label</Label>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          Description text for the field
        </Paragraph>
      </div>
      <div>
        <Label data-size="md">Medium Label (default)</Label>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          Helper text explaining the field
        </Paragraph>
      </div>
      <div>
        <Label data-size="sm">Small Label</Label>
        <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          Compact helper text
        </Paragraph>
      </div>
      <div>
        <Label>Field with Error</Label>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-danger-text-default)' }}>
          This field is required
        </Paragraph>
      </div>
    </div>
  ),
};

/**
 * Responsive sizes via data-size attribute
 */
export const ResponsiveSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      <div data-size="sm" style={{ padding: 'var(--ds-spacing-4)', backgroundColor: 'var(--ds-color-neutral-surface-hover)', borderRadius: 'var(--ds-border-radius-md)' }}>
        <Heading level={3} data-size="sm">Small Size Context</Heading>
        <Paragraph>All text in this container uses small size tokens.</Paragraph>
      </div>
      <div data-size="md" style={{ padding: 'var(--ds-spacing-4)', backgroundColor: 'var(--ds-color-neutral-surface-hover)', borderRadius: 'var(--ds-border-radius-md)' }}>
        <Heading level={3} data-size="sm">Medium Size Context (default)</Heading>
        <Paragraph>All text in this container uses medium size tokens.</Paragraph>
      </div>
      <div data-size="lg" style={{ padding: 'var(--ds-spacing-4)', backgroundColor: 'var(--ds-color-neutral-surface-hover)', borderRadius: 'var(--ds-border-radius-md)' }}>
        <Heading level={3} data-size="sm">Large Size Context</Heading>
        <Paragraph>All text in this container uses large size tokens.</Paragraph>
      </div>
    </div>
  ),
};

/**
 * Typography with semantic colors
 */
export const SemanticColors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
      <Paragraph style={{ color: 'var(--ds-color-neutral-text-default)' }}>
        Default text color - primary content
      </Paragraph>
      <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
        Subtle text color - secondary content, descriptions
      </Paragraph>
      <Paragraph style={{ color: 'var(--ds-color-accent-text-default)' }}>
        Accent text color - links, interactive elements
      </Paragraph>
      <Paragraph style={{ color: 'var(--ds-color-success-text-default)' }}>
        Success text color - positive feedback
      </Paragraph>
      <Paragraph style={{ color: 'var(--ds-color-warning-text-default)' }}>
        Warning text color - cautionary messages
      </Paragraph>
      <Paragraph style={{ color: 'var(--ds-color-danger-text-default)' }}>
        Danger text color - errors, destructive actions
      </Paragraph>
    </div>
  ),
};

/**
 * Complete typography example
 */
export const ArticleExample: Story = {
  render: () => (
    <article style={{ maxWidth: '700px' }}>
      <Heading level={1} data-size="xl" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
        Velkommen til Digilist
      </Heading>
      <Paragraph data-size="lg" variant="short" style={{ marginBottom: 'var(--ds-spacing-6)', color: 'var(--ds-color-neutral-text-subtle)' }}>
        En moderne plattform for booking og utleie av lokaler og ressurser.
      </Paragraph>
      
      <Heading level={2} data-size="md" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
        Slik fungerer det
      </Heading>
      <Paragraph variant="long" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
        Digilist gjør det enkelt å finne og reservere lokaler i din kommune. 
        Søk blant tilgjengelige rom, sjekk ledighet i sanntid, og book direkte. 
        Alt fra møterom til idrettshaller er samlet på ett sted.
      </Paragraph>
      
      <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
        For utleiere
      </Heading>
      <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
        Administrer dine lokaler effektivt med full oversikt over bookinger, 
        tilgjengelighet og inntekter.
      </Paragraph>
      
      <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
        Sist oppdatert: Januar 2026
      </Paragraph>
    </article>
  ),
};
