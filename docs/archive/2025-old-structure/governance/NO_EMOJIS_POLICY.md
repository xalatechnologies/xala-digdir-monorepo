# No Emojis Policy

**Effective Date:** 2026-01-22  
**Status:** Mandatory  
**Enforcement:** ESLint Rule + Code Review

---

## Policy Statement

**Emojis are prohibited in all production code.** Use high-quality SVG icons instead.

## Rationale

### Why No Emojis?

1. **Inconsistent Rendering**
   - Emojis render differently across platforms (iOS, Android, Windows, macOS)
   - Font support varies by operating system
   - Colors and styles are not controllable

2. **Accessibility Issues**
   - Screen readers announce emojis inconsistently
   - Some screen readers spell out emoji names verbosely
   - No control over alt text or ARIA labels

3. **Professional Appearance**
   - SVG icons provide consistent, professional look
   - Icons can be styled with CSS (color, size, etc.)
   - Better alignment with design system

4. **Localization Problems**
   - Emoji meanings vary across cultures
   - Some emojis are offensive in certain regions
   - SVG icons with proper labels are clearer

5. **Technical Limitations**
   - Emojis increase bundle size unpredictably
   - Font loading can cause layout shifts
   - No control over emoji updates (OS-dependent)

---

## What to Use Instead

### Recommended Icon Libraries

#### 1. NAV Aksel Icons (Primary - Norwegian Public Sector)
```tsx
import { EnvelopeClosedIcon, CalendarIcon, PersonIcon } from '@navikt/aksel-icons';

// ✅ Good - 900+ icons, Norwegian public sector standard
<EnvelopeClosedIcon title="Email" fontSize="1.5rem" />
<CalendarIcon aria-label="Calendar" />
<PersonIcon />
```

**Why Aksel Icons?**
- 900+ icons designed for Norwegian public services
- Consistent meaning across public sector
- Available in stroke and fill variants
- Supports resizing and color adjustments
- Open for contributions
- [Icon Overview](https://aksel.nav.no/ikoner)
- [NPM Package](https://www.npmjs.com/package/@navikt/aksel-icons)

#### 2. Lucide React (General Purpose)
```tsx
import { Mail, Calendar, User, Settings } from 'lucide-react';

// ✅ Good - Use when Aksel doesn't have the icon
<Mail className="icon" />
<Calendar size={24} color="var(--ds-color-accent-base-default)" />
```

#### 3. Designsystemet Icons
```tsx
import { MailIcon, CalendarIcon } from '@digdir/designsystemet-react-icons';

// ✅ Good - Fallback option
<MailIcon />
<CalendarIcon aria-label="Calendar" />
```

#### 3. Custom SVG Icons
```tsx
// ✅ Good - Inline SVG
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="..." fill="currentColor" />
</svg>

// ✅ Good - SVG Component
import { CustomIcon } from './icons/CustomIcon';
<CustomIcon />
```

---

## Examples

### ❌ Bad - Using Emojis

```tsx
// Emojis in UI
<div>📧 Email</div>
<button>🎨 Theme</button>
<h1>Welcome 👋</h1>

// Emojis in code
const icon = '📅';
const status = '✅';

// Emojis in stories
export const Example = {
  render: () => <div>🚀 Launch</div>
};
```

### ✅ Good - Using SVG Icons

```tsx
import { EnvelopeClosedIcon, PaletteIcon, HandWaveIcon } from '@navikt/aksel-icons';
import { Mail, Palette, Hand, Calendar, Check, Rocket } from 'lucide-react';

// SVG icons in UI
<div>
  <EnvelopeClosedIcon fontSize="1.25rem" /> Email
</div>
<button>
  <PaletteIcon fontSize="1rem" /> Theme
</button>
<h1>
  Welcome <HandWaveIcon fontSize="1.5rem" />
</h1>

// Icon components
const icon = <Calendar />;
const status = <Check color="green" />;

// Icons in stories
export const Example = {
  render: () => (
    <div>
      <Rocket size={20} /> Launch
    </div>
  )
};
```

---

## ESLint Enforcement

### Rule Configuration

```javascript
// eslint.config.js
{
  rules: {
    '@xala-technologies/governance/no-emojis': 'error',
  }
}
```

### Rule Options

```javascript
{
  rules: {
    '@xala-technologies/governance/no-emojis': ['error', {
      allowInComments: false,  // Disallow emojis in comments
      allowInTests: false,     // Disallow emojis in test files
    }]
  }
}
```

### Detected Violations

The ESLint rule detects emojis in:
- ✅ String literals
- ✅ Template literals
- ✅ JSX text content
- ✅ Comments (if enabled)
- ✅ Variable values

---

## Migration Guide

### Step 1: Find Emojis

```bash
# Search for emojis in codebase
grep -r -P "[\x{1F300}-\x{1F9FF}]" packages/
```

### Step 2: Replace with Icons

```tsx
// Before
<div>📧 {email}</div>

// After
import { Mail } from 'lucide-react';
<div><Mail size={16} /> {email}</div>
```

### Step 3: Update Stories

```tsx
// Before
export const Feature = {
  render: () => (
    <Card>
      <div>🎨 Themes</div>
      <div>🌍 i18n</div>
    </Card>
  )
};

// After
import { Palette, Globe } from 'lucide-react';

export const Feature = {
  render: () => (
    <Card>
      <div><Palette size={20} /> Themes</div>
      <div><Globe size={20} /> i18n</div>
    </Card>
  )
};
```

---

## Icon Selection Guide

### Common Replacements

| Emoji | Icon Component | Library |
|-------|----------------|---------|
| 📧 | `<Mail />` | lucide-react |
| 📅 | `<Calendar />` | lucide-react |
| 🎨 | `<Palette />` | lucide-react |
| ⚙️ | `<Settings />` | lucide-react |
| 👤 | `<User />` | lucide-react |
| 🔍 | `<Search />` | lucide-react |
| ✓ | `<Check />` | lucide-react |
| ✕ | `<X />` | lucide-react |
| ⚠️ | `<AlertTriangle />` | lucide-react |
| ℹ️ | `<Info />` | lucide-react |
| 🚀 | `<Rocket />` | lucide-react |
| 🌍 | `<Globe />` | lucide-react |
| 🏠 | `<Home />` | lucide-react |
| 📁 | `<Folder />` | lucide-react |
| 📄 | `<File />` | lucide-react |
| 🔒 | `<Lock />` | lucide-react |
| 🔓 | `<Unlock />` | lucide-react |
| ♿ | `<Accessibility />` | lucide-react |

### Icon Sizing

```tsx
// Small (16px)
<Icon size={16} />

// Medium (20px) - Default
<Icon size={20} />

// Large (24px)
<Icon size={24} />

// Extra Large (32px)
<Icon size={32} />
```

### Icon Styling

```tsx
// Color
<Icon color="var(--ds-color-accent-base-default)" />

// CSS Class
<Icon className="custom-icon" />

// Inline Style
<Icon style={{ color: 'var(--ds-color-danger-text-default)' }} />
```

---

## Exceptions

### None

There are **no exceptions** to this policy. All emojis must be replaced with SVG icons.

### Test Files

Even test files should use SVG icons for consistency and to avoid false positives in production code.

---

## Enforcement

### Pre-Commit Hook

```bash
# .husky/pre-commit
pnpm lint
# Will fail if emojis detected
```

### CI/CD Pipeline

```yaml
# .github/workflows/lint.yml
- name: Lint Code
  run: pnpm lint
  # Fails build if emojis detected
```

### Code Review

All pull requests are checked for emoji usage. PRs with emojis will be rejected.

---

## Resources

### Icon Libraries

- [Lucide React](https://lucide.dev/) - Primary icon library
- [Designsystemet Icons](https://designsystemet.no/no/fundamentals/design-elements/icons) - Norwegian Design System icons
- [Heroicons](https://heroicons.com/) - Alternative icon library

### Tools

- [Emoji Detector](https://github.com/mathiasbynens/emoji-regex) - Find emojis in code
- [SVG Optimizer](https://jakearchibald.github.io/svgomg/) - Optimize custom SVGs

---

## FAQ

**Q: Can I use emojis in commit messages?**  
A: Yes, commit messages are not code.

**Q: Can I use emojis in documentation?**  
A: No, use SVG icons in MDX/Markdown files too.

**Q: What about emojis in user-generated content?**  
A: User content can contain emojis, but UI chrome must use icons.

**Q: Can I use emojis in Storybook stories?**  
A: No, all stories must use SVG icons.

**Q: What if an icon doesn't exist?**  
A: Create a custom SVG icon or request it from the design team.

---

**Last Updated:** 2026-01-22  
**Maintained By:** Platform Team  
**Questions:** Contact #platform-support
