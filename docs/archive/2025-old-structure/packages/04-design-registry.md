# @xala/ds-registry - Component Documentation

@xala/ds-registry provides comprehensive documentation, examples, and interactive playground for all design system components. It serves as the central hub for component discovery and usage guidance.

## Overview

The registry includes:
- **Interactive documentation** with live examples
- **Component playground** for experimentation
- **Design guidelines** and best practices
- **Accessibility documentation** for each component
- **Migration guides** and version history

## Accessing the Registry

### Development
```bash
# Start Storybook locally
pnpm -F @xala/ds-registry storybook

# Open browser
# http://localhost:6006
```

### Production
- **URL**: https://design.diglist.no
- **Versioned docs**: https://design.diglist.no/v1.0.0
- **API docs**: https://design.diglist.no/api

## Documentation Structure

```
packages/ds-registry/
├── .storybook/              # Storybook configuration
│   ├── main.ts             # Main config
│   ├── preview.ts          # Preview decorators
│   └── addons.ts           # Addon configuration
├── stories/                 # Component stories
│   ├── Introduction/       # Getting started
│   ├── Foundations/        # Design tokens
│   ├── Components/         # Component docs
│   │   ├── Button/         # Button stories
│   │   ├── Card/           # Card stories
│   │   └── ...
│   ├── Patterns/           # Usage patterns
│   └── Migration/          # Migration guides
├── docs/                   # Additional documentation
├── static/                 # Static assets
└── package.json
```

## Component Documentation

### Story Structure
Each component follows a consistent story structure:

```typescript
// stories/Components/Button/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@xala/ds';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Buttons are used to trigger actions.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the button',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading state',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    children: 'Button',
  },
};

// Variant stories
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
  parameters: {
    docs: {
      description: {
        story: 'Use primary buttons for the main action in a view.',
      },
    },
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

// Interactive story
export const Interactive: Story = {
  args: {
    children: 'Click me',
    onClick: () => alert('Button clicked!'),
  },
};

// Playground story
export const Playground: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    children: 'Play with me!',
  },
  parameters: {
    docs: {
      description: {
        story: 'Use the controls panel to experiment with different props.',
      },
    },
  },
};
```

### Documentation Enhancements
```typescript
// stories/Components/Button/Button.docs.mdx
import { Meta, Story, Canvas, ArgsTable } from '@storybook/blocks';
import { Button } from '@xala/ds';
import * as ButtonStories from './Button.stories';

<Meta of={ButtonStories} />

# Button

Buttons are used to trigger actions. They should be clear, concise, and indicate what happens when clicked.

## When to use

- Submitting forms
- Confirming actions
- Navigating to new pages
- Opening modals or dialogs

## When not to use

- For navigation links (use `<Link>` instead)
- For styling text (use `<Text>` instead)
- When there's no action (use `<div>` instead)

## Accessibility

Buttons are accessible by default:
- Proper ARIA roles
- Keyboard navigation support
- Screen reader announcements
- Focus management

<Canvas of={ButtonStories.Default} />
<ArgsTable of={Button} />

## Examples

### With Icons

```tsx
<Button>
  <Icon name="save" />
  Save
</Button>
```

### Loading State

```tsx
<Button loading>Submitting...</Button>
```

### Disabled State

```tsx
<Button disabled>Cannot click</Button>
```
```

## Design Foundations

### Design Tokens Documentation
```typescript
// stories/Foundations/Colors.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Foundations/Colors',
  parameters: {
    docs: {
      description: {
        component: 'Color tokens ensure consistency across the platform.',
      },
    },
  },
};

export default meta;

export const PrimaryColors: Story = {
  render: () => (
    <div className="token-grid">
      <TokenSwatch name="primary" value="var(--ds-color-primary)" />
      <TokenSwatch name="primary-hover" value="var(--ds-color-primary-hover)" />
      <TokenSwatch name="primary-active" value="var(--ds-color-primary-active)" />
    </div>
  ),
};

export const SemanticColors: Story = {
  render: () => (
    <div className="token-grid">
      <TokenSwatch name="success" value="var(--ds-color-success)" />
      <TokenSwatch name="warning" value="var(--ds-color-warning)" />
      <TokenSwatch name="danger" value="var(--ds-color-danger)" />
      <TokenSwatch name="info" value="var(--ds-color-info)" />
    </div>
  ),
};
```

### Typography Scale
```typescript
// stories/Foundations/Typography.stories.tsx
export const TypographyScale: Story = {
  render: () => (
    <div className="typography-scale">
      <Heading level={1} size="hero">
        Hero Heading
      </Heading>
      <Heading level={1}>Heading 1</Heading>
      <Heading level={2}>Heading 2</Heading>
      <Heading level={3}>Heading 3</Heading>
      <Text size="lg">Large Text</Text>
      <Text>Body Text</Text>
      <Text size="sm">Small Text</Text>
      <Caption>Caption Text</Caption>
    </div>
  ),
};
```

## Usage Patterns

### Form Patterns
```typescript
// stories/Patterns/FormPatterns.stories.tsx
export const LoginForm: Story = {
  render: () => (
    <Card>
      <Card.Header>
        <Card.Title>Login</Card.Title>
      </Card.Header>
      <Card.Content>
        <Stack spacing="md">
          <FormField>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Enter email" />
          </FormField>
          <FormField>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Enter password" />
          </FormField>
          <Checkbox>
            Remember me
          </Checkbox>
          <Button variant="primary" fullWidth>
            Login
          </Button>
        </Stack>
      </Card.Content>
    </Card>
  ),
};
```

### Data Display Patterns
```typescript
// stories/Patterns/DataDisplay.stories.tsx
export const UserCard: Story = {
  render: () => (
    <Card>
      <Card.Content>
        <Flex align="center" gap="md">
          <Avatar src="/avatar.jpg" size="lg" />
          <div>
            <Heading level={3}>John Doe</Heading>
            <Text color="secondary">john@example.com</Text>
            <Badge variant="success">Active</Badge>
          </div>
        </Flex>
      </Card.Content>
      <Card.Actions>
        <Button variant="outline" size="sm">
          View Profile
        </Button>
      </Card.Actions>
    </Card>
  ),
};
```

## Interactive Examples

### Component Playground
```typescript
// stories/Components/Button/Button.playground.tsx
import { useState } from 'react';
import { Button, Stack, Select, Toggle } from '@xala/ds';

export const Playground = () => {
  const [variant, setVariant] = useState('primary');
  const [size, setSize] = useState('md');
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  
  return (
    <Stack spacing="lg">
      <Stack direction="row" spacing="md">
        <Select value={variant} onValueChange={setVariant}>
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="primary">Primary</Select.Item>
            <Select.Item value="secondary">Secondary</Select.Item>
            <Select.Item value="outline">Outline</Select.Item>
            <Select.Item value="ghost">Ghost</Select.Item>
          </Select.Content>
        </Select>
        
        <Select value={size} onValueChange={setSize}>
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="sm">Small</Select.Item>
            <Select.Item value="md">Medium</Select.Item>
            <Select.Item value="lg">Large</Select.Item>
          </Select.Content>
        </Select>
      </Stack>
      
      <Stack direction="row" spacing="md">
        <Toggle
          pressed={disabled}
          onPressedChange={setDisabled}
        >
          Disabled
        </Toggle>
        
        <Toggle
          pressed={loading}
          onPressedChange={setLoading}
        >
          Loading
        </Toggle>
      </Stack>
      
      <Button
        variant={variant}
        size={size}
        disabled={disabled}
        loading={loading}
      >
        Sample Button
      </Button>
    </Stack>
  );
};
```

## Accessibility Documentation

### A11y Guidelines
```typescript
// stories/Foundations/Accessibility.stories.tsx
export const AccessibilityGuidelines: Story = {
  render: () => (
    <div className="a11y-guidelines">
      <Section>
        <Heading level={2}>Color Contrast</Heading>
        <Text>
          All text must meet WCAG AA contrast ratios:
          - Normal text: 4.5:1
          - Large text: 3:1
        </Text>
        <ContrastExamples />
      </Section>
      
      <Section>
        <Heading level={2}>Keyboard Navigation</Heading>
        <Text>
          All interactive elements must be keyboard accessible:
          - Tab order follows visual order
          - Focus indicators are visible
          - Skip links provided for navigation
        </Text>
        <KeyboardExamples />
      </Section>
      
      <Section>
        <Heading level={2}>Screen Reader Support</Heading>
        <Text>
          Components provide proper ARIA labels and announcements:
          - Semantic HTML elements
          - ARIA attributes where needed
          - Live regions for dynamic content
        </Text>
        <ScreenReaderExamples />
      </Section>
    </div>
  ),
};
```

### Component A11y Tests
```typescript
// stories/Components/Button/Button.a11y.stories.tsx
export const AccessibilityTests: Story = {
  render: () => (
    <div>
      <h3>Keyboard Navigation</h3>
      <Button>Tab to me and press Enter</Button>
      
      <h3>Screen Reader</h3>
      <Button aria-label="Save document">
        <Icon name="save" />
      </Button>
      
      <h3>Focus Management</h3>
      <Button autoFocus>Auto-focused button</Button>
    </div>
  ),
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'button-name',
            enabled: true,
          },
          {
            id: 'keyboard-navigation',
            enabled: true,
          },
        ],
      },
    },
  },
};
```

## Migration Guides

### Version Migration
```typescript
// stories/Migration/v1-to-v2.stories.tsx
export const ButtonMigration: Story = {
  render: () => (
    <MigrationGuide
      fromVersion="1.0"
      toVersion="2.0"
      component="Button"
    >
      <BreakingChanges>
        <Change>
          <OldCode>
            <Button primary>Click me</Button>
          </OldCode>
          <NewCode>
            <Button variant="primary">Click me</Button>
          </NewCode>
          <Reason>
            More consistent with other components and follows
            design system conventions.
          </Reason>
        </Change>
        
        <Change>
          <OldCode>
            <Button size="large">Large</Button>
          </OldCode>
          <NewCode>
            <Button size="lg">Large</Button>
          </NewCode>
          <Reason>
            Consistent with Tailwind CSS sizing scale.
          </Reason>
        </Change>
      </BreakingChanges>
      
      <Deprecations>
        <Deprecation
          prop="appearance"
          replacement="variant"
          version="2.0"
        />
      </Deprecations>
    </MigrationGuide>
  ),
};
```

## Configuration

### Storybook Configuration
```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../stories/**/*.stories.@(js|jsx|ts|tsx|mdx)',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-controls',
    '@storybook/addon-backgrounds',
    '@storybook/addon-viewport',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
};

export default config;
```

### Preview Configuration
```typescript
// .storybook/preview.ts
import type { Preview } from '@storybook/react';
import { DesignsystemetProvider } from '@xala/ds';

const preview: Preview = {
  parameters: {
    docs: {
      toc: true,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#1e293b',
        },
      ],
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1200px',
            height: '800px',
          },
        },
      },
    },
  },
  decorators: [
    (Story) => (
      <DesignsystemetProvider theme="digdir">
        <Story />
      </DesignsystemetProvider>
    ),
  ],
};

export default preview;
```

## Building and Deployment

### Build Configuration
```json
// package.json
{
  "scripts": {
    "build": "storybook build --docs -o dist",
    "build-storybook": "storybook build",
    "serve": "storybook serve -p 6006",
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

### Automated Deployment
```yaml
# .github/workflows/deploy-storybook.yml
name: Deploy Storybook

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm -F @xala/ds-registry build
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./packages/ds-registry/dist
```

## Best Practices

### 1. Documentation
- Write clear, concise descriptions
- Include real-world examples
- Document edge cases
- Provide context for usage

### 2. Story Organization
- Group related stories
- Use consistent naming
- Include accessibility examples
- Add interactive playgrounds

### 3. Visual Testing
- Include screenshot tests
- Test all variants
- Check responsive behavior
- Verify accessibility

### 4. Maintenance
- Update with component changes
- Review outdated examples
- Add new patterns regularly
- Monitor usage analytics

## Analytics and Feedback

### Usage Tracking
```typescript
// .storybook/manager.ts
import { addons } from '@storybook/addons';

addons.setConfig({
  enableShortcuts: true,
  showPanel: true,
  selectedPanel: 'storybook/docs/panel',
  initialActive: 'sidebar',
  sidebar: {
    showRoots: false,
    collapsedRoots: ['Other'],
  },
});
```

### Feedback Integration
```typescript
// stories/Components/Feedback/Feedback.stories.tsx
export const FeedbackForm: Story = {
  render: () => (
    <Card>
      <Card.Header>
        <Card.Title>Documentation Feedback</Card.Title>
      </Card.Header>
      <Card.Content>
        <Text>
          Found this documentation helpful? Let us know!
        </Text>
        <Button variant="outline" onClick={() => openFeedbackForm()}>
          Give Feedback
        </Button>
      </Card.Content>
    </Card>
  ),
};
```

## Related Documentation

- [Design System Architecture](../architecture/04-design-system.md)
- [@xala/ds](./02-design-system.md)
- [Component Testing Guide](../guides/02-testing.md)
- [Accessibility Guide](../guides/05-accessibility.md)
