import type { Meta, StoryObj } from '@storybook/react';
import { Container } from '../../src/primitives/container';
import { Grid } from '../../src/primitives/grid';
import { Stack } from '../../src/primitives/stack';

const meta: Meta = {
  title: 'Primitives/Layout',
  parameters: {
    docs: {
      description: {
        component: `
Low-level layout primitives for building consistent UIs.

## Components
- **Container** - Centered container with max-width
- **Grid** - CSS Grid wrapper
- **Stack** - Flexbox stack (vertical/horizontal)

## When to Use
- Building page layouts
- Creating consistent spacing
- Component composition
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

const Box = ({ children, color = 'accent' }: { children: React.ReactNode; color?: string }) => (
  <div
    style={{
      padding: 'var(--ds-spacing-4)',
      backgroundColor: `var(--ds-color-${color}-surface-default)`,
      border: `1px solid var(--ds-color-${color}-border-default)`,
      borderRadius: 'var(--ds-border-radius-md)',
      textAlign: 'center',
    }}
  >
    {children}
  </div>
);

/**
 * Container with max-width and centered content
 */
export const ContainerDefault: Story = {
  name: 'Container',
  render: () => (
    <Container style={{ backgroundColor: 'var(--ds-color-neutral-surface-hover)' }}>
      <Box>Content inside a Container</Box>
    </Container>
  ),
};

/**
 * Fluid container (no max-width)
 */
export const ContainerFluid: Story = {
  name: 'Container Fluid',
  render: () => (
    <Container fluid style={{ backgroundColor: 'var(--ds-color-neutral-surface-hover)' }}>
      <Box>Full-width fluid container</Box>
    </Container>
  ),
};

/**
 * Basic CSS Grid
 */
export const GridBasic: Story = {
  name: 'Grid',
  render: () => (
    <Grid columns="repeat(3, 1fr)" gap="var(--ds-spacing-4)">
      <Box>Column 1</Box>
      <Box>Column 2</Box>
      <Box>Column 3</Box>
      <Box>Column 4</Box>
      <Box>Column 5</Box>
      <Box>Column 6</Box>
    </Grid>
  ),
};

/**
 * Grid with different column sizes
 */
export const GridMixed: Story = {
  name: 'Grid Mixed Columns',
  render: () => (
    <Grid columns="1fr 2fr 1fr" gap="var(--ds-spacing-4)">
      <Box>Sidebar</Box>
      <Box>Main Content (2fr)</Box>
      <Box>Sidebar</Box>
    </Grid>
  ),
};

/**
 * Auto-fit grid for responsive cards
 */
export const GridAutoFit: Story = {
  name: 'Grid Auto-fit',
  render: () => (
    <Grid columns="repeat(auto-fit, minmax(var(--ds-spacing-48), 1fr))" gap="var(--ds-spacing-4)">
      <Box>Card 1</Box>
      <Box>Card 2</Box>
      <Box>Card 3</Box>
      <Box>Card 4</Box>
    </Grid>
  ),
};

/**
 * Vertical stack (default)
 */
export const StackVertical: Story = {
  name: 'Stack Vertical',
  render: () => (
    <Stack spacing="var(--ds-spacing-4)">
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
    </Stack>
  ),
};

/**
 * Horizontal stack
 */
export const StackHorizontal: Story = {
  name: 'Stack Horizontal',
  render: () => (
    <Stack direction="horizontal" spacing="var(--ds-spacing-4)">
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
    </Stack>
  ),
};

/**
 * Stack with alignment
 */
export const StackAligned: Story = {
  name: 'Stack Aligned',
  render: () => (
    <Stack direction="horizontal" spacing="var(--ds-spacing-4)" justify="between" align="center" style={{ minHeight: 'var(--ds-spacing-32)', backgroundColor: 'var(--ds-color-neutral-surface-hover)', padding: 'var(--ds-spacing-4)' }}>
      <Box>Left</Box>
      <Box>Center</Box>
      <Box>Right</Box>
    </Stack>
  ),
};

/**
 * Combined layout example
 */
export const CombinedLayout: Story = {
  name: 'Combined Example',
  render: () => (
    <Container>
      <Stack spacing="var(--ds-spacing-6)">
        <Box color="info">Header</Box>
        <Grid columns="var(--ds-spacing-64) 1fr" gap="var(--ds-spacing-4)">
          <Stack spacing="var(--ds-spacing-2)">
            <Box color="warning">Nav Item 1</Box>
            <Box color="warning">Nav Item 2</Box>
            <Box color="warning">Nav Item 3</Box>
          </Stack>
          <Stack spacing="var(--ds-spacing-4)">
            <Box>Main Content Area</Box>
            <Grid columns="repeat(2, 1fr)" gap="var(--ds-spacing-4)">
              <Box color="success">Card 1</Box>
              <Box color="success">Card 2</Box>
            </Grid>
          </Stack>
        </Grid>
        <Box color="neutral">Footer</Box>
      </Stack>
    </Container>
  ),
};
