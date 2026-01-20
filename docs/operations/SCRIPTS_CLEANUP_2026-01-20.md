# Root Scripts Cleanup - Move to `scripts/` Directory

**Date:** 2026-01-20  
**Action:** Moved all root-level scripts to `scripts/` directory  
**Status:** ✅ Complete

---

## Problem

Root directory was cluttered with script files that should have been in the `scripts/` folder, violating the project's organization rules.

**Rules Violated:**
> ⚠️ **CRITICAL RULES:**
> - **NEVER create script files (.sh, .js, .mjs, .ts) in the repository root**
> - All utility scripts → `scripts/`

---

## Files Moved

All 8 root-level scripts have been moved to `scripts/`:

| File | Type | Purpose |
|------|------|---------|
| `create-comprehensive-translations.py` | Python | Create comprehensive translation files |
| `create-json-translations.py` | Python | Generate JSON translation files |
| `dev-run.sh` | Shell | Development run script |
| `extract-all-missing-translations.js` | JavaScript | Extract missing translations |
| `fix_e2e_imports.py` | Python | Fix E2E test imports |
| `fix_imports.py` | Python | Fix import statements |
| `generate-json-translations.js` | JavaScript | Generate JSON translations |
| `seed-translations.sh` | Shell | Seed translation data |

---

## New Locations

```
Before:
├── create-comprehensive-translations.py  ❌ Root
├── create-json-translations.py           ❌ Root
├── dev-run.sh                            ❌ Root
├── extract-all-missing-translations.js   ❌ Root
├── fix_e2e_imports.py                    ❌ Root
├── fix_imports.py                        ❌ Root
├── generate-json-translations.js         ❌ Root
└── seed-translations.sh                  ❌ Root

After:
└── scripts/
    ├── create-comprehensive-translations.py  ✅
    ├── create-json-translations.py           ✅
    ├── dev-run.sh                            ✅
    ├── extract-all-missing-translations.js   ✅
    ├── fix_e2e_imports.py                    ✅
    ├── fix_imports.py                        ✅
    ├── generate-json-translations.js         ✅
    └── seed-translations.sh                  ✅
```

---

## Updated Paths

If you have any references to these scripts, update the paths:

### Shell Scripts

```bash
# Old
./dev-run.sh
./seed-translations.sh

# New
./scripts/dev-run.sh
./scripts/seed-translations.sh
```

### JavaScript Scripts

```bash
# Old
node create-comprehensive-translations.py
node generate-json-translations.js
node extract-all-missing-translations.js

# New
node scripts/create-comprehensive-translations.py
node scripts/generate-json-translations.js
node scripts/extract-all-missing-translations.js
```

### Python Scripts

```bash
# Old
python create-comprehensive-translations.py
python create-json-translations.py
python fix_imports.py
python fix_e2e_imports.py

# New
python scripts/create-comprehensive-translations.py
python scripts/create-json-translations.py
python scripts/fix_imports.py
python scripts/fix_e2e_imports.py
```

---

## package.json Scripts (If Any)

Check if any npm/pnpm scripts reference these files:

```bash
# Search for references
grep -r "dev-run.sh\|seed-translations.sh\|generate-json-translations" package.json
grep -r "create-comprehensive-translations\|fix_imports" package.json
```

If found, update the paths:

```json
{
  "scripts": {
    "dev:run": "scripts/dev-run.sh",
    "seed:translations": "scripts/seed-translations.sh",
    "translations:generate": "node scripts/generate-json-translations.js"
  }
}
```

---

## CI/CD Updates (If Applicable)

Check GitHub workflows for references:

```bash
grep -r "dev-run.sh\|seed-translations" .github/workflows/
```

Update workflow files if needed:

```yaml
# Old
- name: Seed translations
  run: ./seed-translations.sh

# New
- name: Seed translations
  run: ./scripts/seed-translations.sh
```

---

## Current Scripts Directory Structure

```
scripts/
├── add-category-translations.js      ✅ Translation management
├── add-filter-translations.js        ✅ Translation management
├── add-missing-translations.js       ✅ Translation management
├── add-missing-web-translations.js   ✅ Translation management
├── create-comprehensive-translations.py  ✅ NEW (moved from root)
├── create-json-translations.py       ✅ NEW (moved from root)
├── dev-run.sh                        ✅ NEW (moved from root)
├── extract-all-missing-translations.js   ✅ NEW (moved from root)
├── fix_e2e_imports.py                ✅ NEW (moved from root)
├── fix_imports.py                    ✅ NEW (moved from root)
├── fix-ds-violations.sh              ✅ Design system fixes
├── generate-json-translations.js     ✅ NEW (moved from root)
├── i18n-audit.sh                     ✅ i18n auditing
├── seed-translations.sh              ✅ NEW (moved from root)
└── quality/
    └── verify-sdk-coverage.js        ✅ Quality checks
```

---

## Root Directory Now Clean

Root directory now only contains **allowed files**:

### ✅ Allowed in Root

- `README.md` - Main repository README
- `AGENTS.md` - AI agent guidance
- `CLAUDE.md` - Claude-specific guidance  
- `AI_RULES.md` - AI coding rules
- `CHANGELOG.md` - Change log
- Configuration files (`.npmrc`, `package.json`, `tsconfig.json`, etc.)
- Markdown documentation files

### ❌ NOT Allowed in Root

- ~~Script files (.sh, .js, .py, .mjs)~~ → **All moved to `scripts/`** ✅
- ~~Test files (.test.ts, .spec.ts)~~ → Should be in `tests/`
- ~~Build output~~ → Should be in `.gitignore`

---

## Verification

To verify the cleanup:

```bash
# Check root for any remaining scripts
ls *.sh *.js *.py *.mjs 2>/dev/null

# Should return empty or only config files like:
# - eslint.config.js (config file - allowed)
# - prettier.config.cjs (config file - allowed)

# Check scripts directory
ls scripts/
# Should show all utility scripts including the newly moved ones
```

---

## Benefits

1. ✅ **Cleaner root directory** - Easier to navigate
2. ✅ **Better organization** - All scripts in one place
3. ✅ **Follows project standards** - Adheres to .cursorrules
4. ✅ **Easier to find** - Developers know where to look
5. ✅ **Consistent structure** - Matches other organized directories

---

## Related Documentation

- `.cursorrules` - Project organization rules (lines about script organization)
- `AGENTS.md` - Rules for script organization
- `scripts/` - README.md (if exists, should document all scripts)

---

## Maintenance

Going forward, **always create new scripts in `scripts/`**:

```bash
# ✅ Correct
touch scripts/my-new-script.sh

# ❌ Wrong
touch my-new-script.sh
```

---

**Status:** ✅ Complete - Root directory cleaned, all scripts organized  
**Files Moved:** 8 scripts  
**Breaking Changes:** Paths to these scripts need updating if referenced elsewhere  
**Next Action:** Update any references in package.json, CI/CD, or documentation
