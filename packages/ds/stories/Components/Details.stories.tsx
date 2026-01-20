import type { Meta, StoryObj } from '@storybook/react-vite';
import { Details, Paragraph } from '../../src';
import React from 'react';

const meta: Meta = {
  title: 'Components/Details',
  parameters: {
    docs: {
      description: {
        component: `
Details (Accordion) component for collapsible content sections.

## When to Use
- FAQ sections
- Additional information that doesn't need to be visible by default
- Complex forms with optional sections
- Progressive disclosure of content

## Accessibility
- Keyboard accessible (Enter/Space to toggle)
- State announced to screen readers
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Details>
      <Details.Summary>Click to expand</Details.Summary>
      <Details.Content>
        <Paragraph>This is the hidden content that appears when expanded.</Paragraph>
      </Details.Content>
    </Details>
  ),
};

export const Multiple: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
      <Details>
        <Details.Summary>Section 1: Getting Started</Details.Summary>
        <Details.Content>
          <Paragraph>Learn how to set up your account and make your first booking.</Paragraph>
        </Details.Content>
      </Details>
      <Details>
        <Details.Summary>Section 2: Managing Bookings</Details.Summary>
        <Details.Content>
          <Paragraph>Learn how to view, modify, and cancel your bookings.</Paragraph>
        </Details.Content>
      </Details>
      <Details>
        <Details.Summary>Section 3: Payment Options</Details.Summary>
        <Details.Content>
          <Paragraph>We accept various payment methods including Vipps and credit cards.</Paragraph>
        </Details.Content>
      </Details>
    </div>
  ),
};

export const OpenByDefault: Story = {
  render: function Render() {
    const [open, setOpen] = React.useState(true);
    return (
      <Details open={open} onToggle={() => setOpen(!open)}>
        <Details.Summary>Already expanded</Details.Summary>
        <Details.Content>
          <Paragraph>This content is visible by default because the details is open.</Paragraph>
        </Details.Content>
      </Details>
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
      <Details data-size="sm">
        <Details.Summary>Small size</Details.Summary>
        <Details.Content>
          <Paragraph>Content for small details.</Paragraph>
        </Details.Content>
      </Details>
      <Details data-size="md">
        <Details.Summary>Medium size (default)</Details.Summary>
        <Details.Content>
          <Paragraph>Content for medium details.</Paragraph>
        </Details.Content>
      </Details>
      <Details data-size="lg">
        <Details.Summary>Large size</Details.Summary>
        <Details.Content>
          <Paragraph>Content for large details.</Paragraph>
        </Details.Content>
      </Details>
    </div>
  ),
};

export const FAQ: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
      <Details>
        <Details.Summary>How do I cancel my booking?</Details.Summary>
        <Details.Content>
          <Paragraph>
            You can cancel your booking up to 24 hours before the scheduled time. 
            Go to My Bookings, find the booking you want to cancel, and click the Cancel button.
          </Paragraph>
        </Details.Content>
      </Details>
      <Details>
        <Details.Summary>What is the refund policy?</Details.Summary>
        <Details.Content>
          <Paragraph>
            Cancellations made more than 48 hours in advance receive a full refund. 
            Cancellations within 24-48 hours receive a 50% refund.
          </Paragraph>
        </Details.Content>
      </Details>
      <Details>
        <Details.Summary>Can I modify my booking?</Details.Summary>
        <Details.Content>
          <Paragraph>
            Yes, you can modify your booking up to 24 hours before the scheduled time, 
            subject to availability.
          </Paragraph>
        </Details.Content>
      </Details>
    </div>
  ),
};
