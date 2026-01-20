# Storybook 10 Upgrade - Quick Install Guide

## 🚀 Install Commands (Run These Now)

```bash
# Navigate to ds package
cd packages/ds

# Install updated dependencies
pnpm install

# Clear Storybook cache
rm -rf node_modules/.cache/storybook

# Restart Storybook (kill current process first with Ctrl+C)
pnpm storybook
```

---

## ✅ What Was Fixed

**Packages upgraded to v10.1.11:**
- `@storybook/addon-a11y`
- `@storybook/addon-docs`
- `@storybook/addon-links`

**Deprecated packages removed:**
- ❌ `@storybook/blocks` (merged into `storybook` core)
- ❌ `@storybook/manager-api` (merged into `storybook` core)
- ❌ `@storybook/test` (merged into `storybook` core)
- ❌ `@storybook/theming` (merged into `storybook` core)

These packages no longer exist in Storybook 10 - they've been consolidated into the main `storybook` package. Imports now use `storybook/manager-api`, `storybook/theming`, etc.

---

## 🎯 Expected Result

After running the commands above:

✅ No more version mismatch warnings  
✅ Storybook starts cleanly  
✅ All stories render correctly  
✅ Console suppression still works  

---

## ⚠️ Safe Warnings (Ignore These)

These warnings are **normal and safe**:

```
▲  unable to find package.json for @digdir/designsystemet-css
```
→ CSS-only package, loads correctly

```
▲  No story files found for the specified pattern: src/**/*.stories.@(js|jsx|mjs|ts|tsx)
```
→ Stories are in `stories/` folder (intentional)

---

## 📚 Full Documentation

See `docs/guides/STORYBOOK_10_UPGRADE.md` for:
- Complete migration details
- Breaking changes
- Rollback plan
- Troubleshooting

---

**Time Required:** 2-5 minutes  
**Risk:** Low (can rollback if needed)
