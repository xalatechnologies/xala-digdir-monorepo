# DS-First Architecture - CI Enforcement Rules

## ESLint Rules

Add to `.eslintrc.js`:

```javascript
module.exports = {
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@digdir/designsystemet-react'],
            message: 'Import from @xala/ds instead of @digdir/designsystemet-react'
          }
        ]
      }
    ]
  }
};
```

## CI Pipeline Checks

Add to `.github/workflows/ds-enforcement.yml`:

```yaml
name: DS Enforcement

on: [pull_request]

jobs:
  check-violations:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Check for direct @digdir imports
        run: |
          if grep -r "from '@digdir/designsystemet-react'" apps/ --include="*.tsx" --include="*.ts"; then
            echo "Error: Direct @digdir imports found. Use @xala/ds instead."
            exit 1
          fi
          
      - name: Check for CSS modules in apps
        run: |
          COUNT=$(find apps -name "*.module.css" -type f | wc -l)
          if [ "$COUNT" -gt "0" ]; then
            echo "Warning: $COUNT CSS module files found in apps/. Consider migrating to DS tokens."
            find apps -name "*.module.css" -type f
          fi
```

## Token Namespace Summary

| Category | Tokens |
|----------|--------|
| Colors | `--ds-color-*`, `--ds-extended-avatar-*` |
| Spacing | `--ds-spacing-*`, `--ds-sizing-*` |
| Shadows | `--ds-shadow-*` |
| Z-Index | `--ds-z-index-*` |
| Animation | Custom: 150ms/250ms/350ms |
