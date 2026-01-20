import type { Meta, StoryObj } from '@storybook/react';
import { ErrorSummary, Heading } from '@digdir/designsystemet-react';

const meta: Meta = {
  title: 'Components/ErrorSummary',
  parameters: {
    docs: {
      description: {
        component: `
ErrorSummary displays a summary of form validation errors.

## When to Use
- Form validation errors at the top of a form
- After form submission with errors
- To guide users to fix multiple errors

## Accessibility
- Uses role="alert" to announce errors
- Links to specific form fields with errors
- Receives focus after form submission
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
    <ErrorSummary>
      <ErrorSummary.Heading>Please fix the following errors:</ErrorSummary.Heading>
      <ErrorSummary.List>
        <ErrorSummary.Item>
          <ErrorSummary.Link href="#name">Name is required</ErrorSummary.Link>
        </ErrorSummary.Item>
        <ErrorSummary.Item>
          <ErrorSummary.Link href="#email">Enter a valid email address</ErrorSummary.Link>
        </ErrorSummary.Item>
      </ErrorSummary.List>
    </ErrorSummary>
  ),
};

export const MultipleErrors: Story = {
  render: () => (
    <ErrorSummary>
      <ErrorSummary.Heading>There are 4 errors in your form</ErrorSummary.Heading>
      <ErrorSummary.List>
        <ErrorSummary.Item>
          <ErrorSummary.Link href="#firstName">First name is required</ErrorSummary.Link>
        </ErrorSummary.Item>
        <ErrorSummary.Item>
          <ErrorSummary.Link href="#lastName">Last name is required</ErrorSummary.Link>
        </ErrorSummary.Item>
        <ErrorSummary.Item>
          <ErrorSummary.Link href="#phone">Phone number must be 8 digits</ErrorSummary.Link>
        </ErrorSummary.Item>
        <ErrorSummary.Item>
          <ErrorSummary.Link href="#terms">You must accept the terms</ErrorSummary.Link>
        </ErrorSummary.Item>
      </ErrorSummary.List>
    </ErrorSummary>
  ),
};

export const SingleError: Story = {
  render: () => (
    <ErrorSummary>
      <ErrorSummary.Heading>Please fix the following error:</ErrorSummary.Heading>
      <ErrorSummary.List>
        <ErrorSummary.Item>
          <ErrorSummary.Link href="#date">Select a valid date</ErrorSummary.Link>
        </ErrorSummary.Item>
      </ErrorSummary.List>
    </ErrorSummary>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      <ErrorSummary data-size="sm">
        <ErrorSummary.Heading>Small size</ErrorSummary.Heading>
        <ErrorSummary.List>
          <ErrorSummary.Item>
            <ErrorSummary.Link href="#field1">Error message</ErrorSummary.Link>
          </ErrorSummary.Item>
        </ErrorSummary.List>
      </ErrorSummary>
      <ErrorSummary data-size="md">
        <ErrorSummary.Heading>Medium size (default)</ErrorSummary.Heading>
        <ErrorSummary.List>
          <ErrorSummary.Item>
            <ErrorSummary.Link href="#field2">Error message</ErrorSummary.Link>
          </ErrorSummary.Item>
        </ErrorSummary.List>
      </ErrorSummary>
      <ErrorSummary data-size="lg">
        <ErrorSummary.Heading>Large size</ErrorSummary.Heading>
        <ErrorSummary.List>
          <ErrorSummary.Item>
            <ErrorSummary.Link href="#field3">Error message</ErrorSummary.Link>
          </ErrorSummary.Item>
        </ErrorSummary.List>
      </ErrorSummary>
    </div>
  ),
};
