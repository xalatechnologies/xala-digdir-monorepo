# Changesets

This monorepo uses [Changesets](https://github.com/changesets/changesets) to manage package versions and changelogs.

## Quick Reference

### Adding a Changeset

When you make changes to any package, add a changeset:

```bash
pnpm changeset
```

This will prompt you to:
1. Select which packages have changed
2. Choose the type of change (major/minor/patch)
3. Write a summary of the changes

### Versioning Packages

To apply all changesets and update package versions:

```bash
pnpm changeset:version
```

### Publishing Packages

To publish all updated packages to npm:

```bash
pnpm changeset:publish
```

## Semver Guidelines

| Change Type | When to Use | Examples |
|-------------|-------------|----------|
| **major** | Breaking changes | Removing exports, changing function signatures, dropping support |
| **minor** | New features (backward compatible) | Adding new exports, new optional parameters |
| **patch** | Bug fixes (backward compatible) | Fixing bugs, documentation updates |

## Package Groups

### Fixed Groups (Version Together)
Packages in fixed groups always version together - when one changes, all get the same version bump.

**Platform Core:**
- `@xalatechnologies/platform`
- `@xalatechnologies/enterprise`
- `@xalatechnologies/governance`
- `@xalatechnologies/database-schema`

**Domain Core:**
- `@digilist/client-sdk`
- `@digilist/contracts`
- `@digilist/domain`
- `@digilist/ui`
- `@digilist/runtime`
- `@digilist/database-schema`

## Ignored Packages

These packages are not published to npm:
- All apps (`@digilist/api`, `@digilist/web`, etc.)
- Test packages (`@digilist/testing`, `@digilist/testing-e2e`)

## CI/CD Integration

### On Pull Request
The `version.yml` workflow checks if changesets are needed.

### On Merge to Main
The `release.yml` workflow:
1. Creates a "Version Packages" PR if changesets exist
2. Publishes to npm when the version PR is merged

## Best Practices

1. **One changeset per PR** - Add a changeset for each PR that changes package behavior
2. **Be specific** - Describe what changed and why
3. **Reference issues** - Include issue numbers like "Fixes #123"
4. **Think about consumers** - Write summaries that help downstream users

## Example Changeset

```markdown
---
"@xalatechnologies/platform": minor
"@digilist/client-sdk": patch
---

Add new ResourceCard pattern for generic resource display

- Added `ResourceCard` to platform UI patterns
- Updated SDK to use new pattern internally
- Fixes #456
```

## Troubleshooting

### "No changesets present"
Run `pnpm changeset` to add one before versioning.

### "Cannot publish private package"
Check that the package isn't in the `ignore` list in `.changeset/config.json`.

### "Version mismatch between linked packages"
Run `pnpm changeset:version` to synchronize versions.

## Further Reading

- [Changesets Documentation](https://github.com/changesets/changesets/blob/main/docs/intro-to-using-changesets.md)
- [Monorepo Guide](https://github.com/changesets/changesets/blob/main/docs/monorepos.md)
