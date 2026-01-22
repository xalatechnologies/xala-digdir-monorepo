# @xala/eslint-config - ESLint Configuration

@xala/eslint-config provides shared ESLint configuration with custom rules and guardrails to ensure code quality, consistency, and architectural compliance across the Xala Diglist Platform.

## Overview

The ESLint config enforces:
- **TypeScript best practices** and type safety
- **React patterns** and hooks rules
- **Contract-first compliance** (no transformers)
- **Design system usage** (no direct @digdir imports)
- **Accessibility standards** (A11y rules)
- **Security best practices**

## Installation

```bash
# In your app or package
pnpm add -D @xala/eslint-config

# Install peer dependencies
pnpm add -D eslint typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

## Configuration

### Basic Setup
```json
// .eslintrc.json
{
  "extends": ["@xala/eslint-config"],
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "root": true
}
```

### App Configuration
```json
// apps/web/.eslintrc.json
{
  "extends": [
    "@xala/eslint-config",
    "@xala/eslint-config/react",
    "@xala/eslint-config/accessibility"
  ],
  "parserOptions": {
    "project": "./tsconfig.json",
    "tsconfigRootDir": __dirname
  },
  "rules": {
    // App-specific overrides
    "@xala/no-hardcoded-text": "error"
  }
}
```

### Package Configuration
```json
// packages/ds/.eslintrc.json
{
  "extends": [
    "@xala/eslint-config",
    "@xala/eslint-config/package"
  ],
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "rules": {
    // Package-specific rules
    "@xala/export-pattern": "error"
  }
}
```

## Core Rules

### Contract-First Rules

#### No Transformers
```typescript
// ❌ Forbidden - Transformer functions
function toViewModel(dto: DTO): ViewModel {
  return {
    // transformation logic
  };
}

// ❌ Forbidden - Adapter functions
function adaptApiResponse(response: any): AdaptedResponse {
  return {
    // adaptation logic
  };
}

// ❌ Forbidden - Mapper functions
function mapToUIModel(data: Data): UIModel {
  return {
    // mapping logic
  };
}

// ✅ Allowed - Use DTOs directly
function Component({ listing }: { listing: ListingDTO }) {
  return <div>{listing.title}</div>;
}
```

#### No ViewModels
```typescript
// ❌ Forbidden - ViewModel interfaces
interface ListingViewModel {
  id: string;
  displayName: string;
  isEditable: boolean;
}

// ❌ Forbidden - UI Models
interface CardUIModel {
  title: string;
  subtitle: string;
  actions: ActionModel[];
}

// ✅ Allowed - Use Projection DTOs
interface ListingCardProjectionDTO {
  id: string;
  title: string;
  permissions: {
    canEdit: boolean;
  };
}
```

### Design System Rules

#### No Direct @digdir Imports
```typescript
// ❌ Forbidden - Direct imports
import { Button } from '@digdir/designsystemet-react';
import { TextField } from '@digdir/designsystemet-css';

// ✅ Required - Use facade
import { Button, Input } from '@xala/ds';
```

#### No Hardcoded Styles
```typescript
// ❌ Forbidden - Hardcoded values
<div style={{ padding: '16px', color: '#005124' }}>
  Content
</div>

// ❌ Forbidden - Magic numbers
const StyledDiv = styled.div`
  margin-top: 24px;
  font-size: 18px;
`;

// ✅ Required - Use tokens
<div style={{ 
  padding: 'var(--ds-spacing-4)', 
  color: 'var(--ds-color-primary)' 
}}>
  Content
</div>

const StyledDiv = styled.div`
  margin-top: ${tokens.spacing[6]};
  font-size: ${tokens.typography.fontSize.lg};
`;
```

### TypeScript Rules

#### Strict Type Safety
```typescript
// ❌ Avoid - Any types
function processData(data: any): any {
  return data.map((item: any) => item.value);
}

// ✅ Required - Explicit types
interface DataItem {
  id: string;
  value: string;
}

function processData(data: DataItem[]): string[] {
  return data.map(item => item.value);
}
```

#### No Optional Chaining for Required Fields
```typescript
// ❌ Avoid - Optional chaining for required fields
function getTitle(listing?: ListingDTO): string {
  return listing?.title || ''; // title is required
}

// ✅ Required - Handle explicitly
function getTitle(listing: ListingDTO): string {
  return listing.title; // TypeScript ensures it exists
}
```

### React Rules

#### Hooks Dependencies
```typescript
// ❌ Forbidden - Missing dependencies
useEffect(() => {
  fetchData(userId);
}, []); // Missing userId dependency

// ✅ Required - All dependencies
useEffect(() => {
  fetchData(userId);
}, [userId]);
```

#### No Direct State Mutations
```typescript
// ❌ Forbidden - Direct mutation
const [items, setItems] = useState([]);
items.push(newItem); // Direct mutation

// ✅ Required - Use setter
const [items, setItems] = useState([]);
setItems(prev => [...prev, newItem]);
```

## Custom Rules Implementation

### No Transformers Rule
```javascript
// packages/eslint-config/src/rules/no-transformers.js
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow transformer functions',
      category: 'Architecture',
      recommended: true,
    },
    schema: [],
  },
  create(context) {
    const transformerPatterns = [
      /^(to|from|map|adapt|transform)/,
      /ViewModel$/,
      /UIModel$/,
      /View$/,
    ];
    
    return {
      FunctionDeclaration(node) {
        const name = node.id?.name;
        if (name && transformerPatterns.some(pattern => pattern.test(name))) {
          context.report({
            node,
            message: `Transformer function '${name}' is not allowed. Use Projection DTOs directly.`,
          });
        }
      },
      FunctionExpression(node) {
        const parent = node.parent;
        if (parent.type === 'VariableDeclarator') {
          const name = parent.id.name;
          if (name && transformerPatterns.some(pattern => pattern.test(name))) {
            context.report({
              node,
              message: `Transformer function '${name}' is not allowed. Use Projection DTOs directly.`,
            });
          }
        }
      },
      TSTypeAliasDeclaration(node) {
        const name = node.id.name;
        if (transformerPatterns.some(pattern => pattern.test(name))) {
          context.report({
            node,
            message: `Type alias '${name}' is not allowed. Use Projection DTOs directly.`,
          });
        }
      },
    };
  },
};
```

### No Direct Digdir Imports Rule
```javascript
// packages/eslint-config/src/rules/no-direct-digdir-imports.js
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow direct imports from @digdir packages',
      category: 'Design System',
      recommended: true,
    },
    schema: [],
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (source.startsWith('@digdir/')) {
          context.report({
            node,
            message: `Direct import from '${source}' is not allowed. Use @xala/ds instead.`,
          });
        }
      },
    };
  },
};
```

### No Hardcoded Styles Rule
```javascript
// packages/eslint-config/src/rules/no-hardcoded-styles.js
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow hardcoded style values',
      category: 'Design System',
      recommended: true,
    },
    schema: [{
      type: 'object',
      properties: {
        allowPixelValues: {
          type: 'boolean',
          default: false,
        },
      },
    }],
  },
  create(context) {
    const { allowPixelValues } = context.options[0] || {};
    
    const hardcodedPatterns = [
      /\b\d+px\b/,
      /#[0-9a-fA-F]{3,6}/,
      /\b(rgb|hsl)a?\([^)]+\)/,
      /\b(0|1|2|3|4|5|6|7|8|9|10|12|14|16|18|20|24|32|40|48|56|64|72|80|96|112|128|144|160|176|192|208|224|240|256)\s*(rem|em)/,
    ];
    
    return {
      JSXAttribute(node) {
        if (node.name.name === 'style') {
          const value = node.value.value;
          if (typeof value === 'string') {
            hardcodedPatterns.forEach(pattern => {
              if (pattern.test(value) && (!allowPixelValues || !pattern.test(/\b\d+px\b/))) {
                context.report({
                  node,
                  message: 'Hardcoded style values are not allowed. Use design tokens.',
                });
              }
            });
          }
        }
      },
      TemplateElement(node) {
        const value = node.value.raw;
        hardcodedPatterns.forEach(pattern => {
          if (pattern.test(value)) {
            context.report({
              node,
              message: 'Hardcoded style values are not allowed. Use design tokens.',
            });
          }
        });
      },
    };
  },
};
```

## Rule Configurations

### Base Configuration
```javascript
// packages/eslint-config/src/index.js
module.exports = {
  extends: [
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
  },
  plugins: [
    '@typescript-eslint',
    '@xala',
  ],
  rules: {
    // TypeScript rules
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    
    // Custom rules
    '@xala/no-transformers': 'error',
    '@xala/no-direct-digdir-imports': 'error',
    '@xala/no-hardcoded-styles': 'error',
  },
};
```

### React Configuration
```javascript
// packages/eslint-config/src/react.js
module.exports = {
  extends: [
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    '@xala',
  ],
  plugins: [
    'react',
    'react-hooks',
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // React rules
    'react/prop-types': 'off', // Using TypeScript
    'react/react-in-jsx-scope': 'off', // Not needed in React 17+
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // Custom React rules
    '@xala/jsx-a11y': 'error',
  },
  overrides: [
    {
      files: ['*.tsx'],
      rules: {
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      },
    },
  ],
};
```

### Accessibility Configuration
```javascript
// packages/eslint-config/src/accessibility.js
module.exports = {
  extends: [
    'plugin:jsx-a11y/recommended',
    '@xala',
  ],
  plugins: [
    'jsx-a11y',
  ],
  rules: {
    // A11y rules
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-proptypes': 'error',
    'jsx-a11y/aria-unsupported-elements': 'error',
    'jsx-a11y/role-has-required-aria-props': 'error',
    'jsx-a11y/role-supports-aria-props': 'error',
    'jsx-a11y/interactive-supports-focus': 'error',
    'jsx-a11y/click-events-have-key-events': 'error',
  },
};
```

## Pre-commit Hooks

### Husky Configuration
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "pnpm lint"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

### Lint-staged Configuration
```javascript
// .lintstagedrc.js
module.exports = {
  '*.{ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    'pnpm type-check',
  ],
  '*.{js,jsx}': [
    'eslint --fix',
    'prettier --write',
  ],
  '*.{json,md,yml,yaml}': [
    'prettier --write',
  ],
};
```

## IDE Integration

### VS Code Settings
```json
// .vscode/settings.json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
  ],
  "eslint.workingDirectories": [
    "apps/*",
    "packages/*",
  ],
  "typescript.preferences.importModuleSpecifier": "relative",
}
```

### ESLint Extension
```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
  ],
}
```

## Automation

### CI/CD Integration
```yaml
# .github/workflows/lint.yml
name: Lint

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - name: Run ESLint
        run: pnpm lint
      - name: Check contract compliance
        run: pnpm scan:compliance
```

### Package Scripts
```json
// package.json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix",
    "lint:changed": "eslint --changed --since=main",
    "lint:contracts": "pnpm lint --rulesdir ./packages/eslint-config/src/rules"
  }
}
```

## Troubleshooting

### Common Issues

#### TypeScript Project Errors
```bash
# Error: Parsing error: "parserOptions.project" has been set
# Solution: Ensure tsconfig.json includes all files
{
  "include": [
    "src/**/*",
    "**/*.test.ts",
    "**/*.test.tsx"
  ],
  "exclude": ["node_modules", "dist"]
}
```

#### Rule Conflicts
```json
// Override conflicting rules
{
  "extends": ["@xala/eslint-config"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn", // Downgrade to warning
    "react-hooks/exhaustive-deps": "off", // Disable if needed
  }
}
```

#### Performance Issues
```bash
# Use cache for faster linting
pnpm lint --cache

# Lint only changed files
pnpm lint:changed

# Use faster TypeScript parser
# .eslintrc.json
{
  "parserOptions": {
    "project": true,
    "tsconfigRootDir": __dirname,
    "EXPERIMENTAL_useProjectService": true
  }
}
```

## Best Practices

### 1. Rule Management
- Start with recommended config
- Add rules as needed
- Document custom rules
- Review rule effectiveness

### 2. Team Adoption
- Educate on rule purpose
- Provide migration guide
- Allow temporary overrides
- Gradually increase strictness

### 3. Maintenance
- Update dependencies regularly
- Review new ESLint features
- Monitor rule performance
- Gather team feedback

### 4. Automation
- Integrate with CI/CD
- Use pre-commit hooks
- Automate fixes where possible
- Track lint debt

## Related Documentation

- [Development Workflow](../03-development-workflow.md)
- [Contract-First Guide](../guides/01-contract-first.md)
- [Design System Architecture](../architecture/04-design-system.md)
- [Testing Strategy](../guides/02-testing.md)
