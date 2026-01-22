# Storybook Testing Guide

## Running Storybook Tests

### Development Mode
```bash
cd packages/ds
pnpm storybook
```

### Test Runner
```bash
# Run interaction tests
pnpm test-storybook

# Run with a11y checks
pnpm test-storybook --stories-json
```

## Story Requirements

Every reusable UI component must have stories for:

| State | Required | Description |
|-------|----------|-------------|
| default | ✅ | Default props |
| loading | ✅ | Loading state |
| error | ✅ | Error state |
| empty | ✅ | Empty data state |
| longText | ⬛ | Long content handling |
| nb | ✅ | Norwegian locale |
| en | ✅ | English locale |

## A11y Testing

Each story automatically runs axe-core accessibility checks.

### Required Standards
- WCAG 2.1 AA compliance
- Color contrast ratios
- Keyboard navigation
- Screen reader compatibility

## Visual Regression

Baselines stored in: `/packages/ds/__snapshots__/`

Key components with visual baselines:
- Calendar grid
- Time-slot selector
- Booking summary
- Sidebar/menu shells
