import type { Meta, StoryObj } from '@storybook/react-vite';
import { Heading, Paragraph, Label, Link } from '@xalatechnologies/platform/ui';

const meta: Meta = {
  title: 'Components/Typography',
  parameters: {
    docs: {
      description: {
        component: `
Typography components for text styling.

## Components
- **Heading**: Page and section headings
- **Paragraph**: Body text
- **Ingress**: Lead paragraphs
- **Label**: Form labels and captions
- **Link**: Inline links

## Accessibility
- Semantic heading levels
- Proper text hierarchy
- Link styling for visibility
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Headings: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
      <Heading level={1}>Heading Level 1</Heading>
      <Heading level={2}>Heading Level 2</Heading>
      <Heading level={3}>Heading Level 3</Heading>
      <Heading level={4}>Heading Level 4</Heading>
      <Heading level={5}>Heading Level 5</Heading>
      <Heading level={6}>Heading Level 6</Heading>
    </div>
  ),
};

export const HeadingSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
      <Heading level={2} data-size="2xs">2XS Heading</Heading>
      <Heading level={2} data-size="xs">XS Heading</Heading>
      <Heading level={2} data-size="sm">SM Heading</Heading>
      <Heading level={2} data-size="md">MD Heading</Heading>
      <Heading level={2} data-size="lg">LG Heading</Heading>
      <Heading level={2} data-size="xl">XL Heading</Heading>
      <Heading level={2} data-size="2xl">2XL Heading</Heading>
    </div>
  ),
};

export const Paragraphs: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
      <Paragraph data-size="sm">
        Small paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
        Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </Paragraph>
      <Paragraph data-size="md">
        Medium paragraph (default). Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
        Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </Paragraph>
      <Paragraph data-size="lg">
        Large paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
        Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </Paragraph>
    </div>
  ),
};

export const LeadParagraph: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
      <Heading level={1}>Article Title</Heading>
      <Paragraph data-size="lg">
        This is a lead paragraph that summarizes the article. It's styled 
        larger than regular paragraphs to stand out as a lead-in text.
      </Paragraph>
      <Paragraph>
        This is a regular paragraph that follows the lead. It contains the 
        main body text of the article.
      </Paragraph>
    </div>
  ),
};

export const Labels: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
      <Label data-size="sm">Small Label</Label>
      <Label data-size="md">Medium Label</Label>
      <Label data-size="lg">Large Label</Label>
    </div>
  ),
};

export const InlineLink: Story = {
  render: () => (
    <Paragraph>
      Read more about our <Link href="#">booking policies</Link> and 
      <Link href="#">terms of service</Link> before making a reservation.
    </Paragraph>
  ),
};

export const CombinedExample: Story = {
  render: () => (
    <article>
      <Heading level={1} data-size="xl">Welcome to Digilist</Heading>
      <Paragraph data-size="lg">
        The modern platform for booking municipal facilities and services. 
        Easily find and reserve spaces for your activities.
      </Paragraph>
      <Heading level={2} data-size="md">How it works</Heading>
      <Paragraph>
        Browse available <Link href="#">listings</Link>, select your preferred 
        date and time, and complete your booking in minutes. It's that simple.
      </Paragraph>
      <Heading level={2} data-size="md">Get started</Heading>
      <Paragraph>
        Create an account to start booking today. Need help? 
        Check out our <Link href="#">FAQ</Link> or <Link href="#">contact us</Link>.
      </Paragraph>
    </article>
  ),
};
