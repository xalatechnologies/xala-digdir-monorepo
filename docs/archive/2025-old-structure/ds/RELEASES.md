# Releases

This document covers versioning, changelog, and release process for the DS package.

## Versioning

The DS follows semantic versioning:

- **Major**: Breaking changes to component APIs
- **Minor**: New components/features, non-breaking changes
- **Patch**: Bug fixes, documentation updates

## Changelog

### Maintaining the Changelog

Update `CHANGELOG.md` with every PR:

```markdown
## [Unreleased]

### Added
- New `MyBlock` component for X feature

### Changed
- Updated `DataTable` to support pagination

### Fixed
- Fixed focus trap in `Modal` component

### Deprecated
- `OldComponent` - use `NewComponent` instead
```

### Changelog Categories

- **Added**: New features
- **Changed**: Changes to existing features
- **Deprecated**: Features to be removed
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security fixes

## Release Process

### 1. Prepare Release

```bash
# Update version
pnpm version minor -F @xala/ds

# Update changelog
# Move [Unreleased] to [x.y.z] - YYYY-MM-DD
```

### 2. Token Rebuild Check

If Digdir Designsystemet has updates:

```bash
# Check for token updates
cd packages/ds-themes
pnpm tokens:build

# Review changes
git diff
```

### 3. Verify Build

```bash
pnpm -F @xala/ds storybook:build
pnpm -F @xala/backoffice build
pnpm -F @xala/minside build
```

### 4. Create Release PR

- Title: `chore: release @xala/ds vX.Y.Z`
- Include changelog updates
- Tag reviewers

### 5. Post-Release

- Update Storybook deployment
- Notify team of changes
- Update migration docs if needed

## Token Rebuild Reminders

Rebuild tokens when:

1. Digdir Designsystemet releases new version
2. Brand colors change
3. Theme structure updates

```bash
cd packages/ds-themes
pnpm tokens:build
```

See [Digdir changelog](https://designsystemet.no/en/components/changelog/) for updates.

## Breaking Changes

When introducing breaking changes:

1. Add to `### Changed` or `### Removed` in changelog
2. Create migration guide in `docs/ds/migrations/`
3. Add deprecation warnings in previous version
4. Document in component MDX

### Migration Guide Template

```markdown
# Migrating from vX to vY

## Breaking Changes

### ComponentName

**Before:**
\`\`\`tsx
<OldComponent prop="value" />
\`\`\`

**After:**
\`\`\`tsx
<NewComponent newProp="value" />
\`\`\`

### Tokens

**Before:**
\`\`\`css
--old-token-name
\`\`\`

**After:**
\`\`\`css
--ds-new-token-name
\`\`\`
```

## Version Compatibility

| DS Version | Digdir Version | React |
|------------|----------------|-------|
| 1.x | 1.9.x | 18.x |
| 0.x | 1.0.x | 18.x |

## Support

- Current version: Full support
- Previous minor: Bug fixes only
- Older versions: No support
