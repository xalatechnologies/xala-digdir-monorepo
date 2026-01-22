# Icon Usage Guide

**Last Updated:** 2026-01-22  
**Status:** Official Guideline

---

## Icon Library Strategy

The Xala Platform uses a **dual-library approach** for icons:

1. **Primary:** `@navikt/aksel-icons` (Norwegian public sector standard)
2. **Secondary:** `lucide-react` (General purpose fallback)

---

## When to Use Which Library

### Use NAV Aksel Icons When:

✅ Icon represents common public sector concepts  
✅ Icon is available in Aksel's 900+ icon set  
✅ Building Norwegian government/municipal applications  
✅ Need consistency with other Norwegian public services  

**Examples:**
- Document icons (forms, contracts, certificates)
- Person/user icons
- Building/organization icons
- Calendar/time icons
- Communication icons (email, phone, chat)

### Use Lucide React When:

✅ Aksel doesn't have the specific icon needed  
✅ Building general-purpose features  
✅ Need specific technical/developer icons  
✅ International applications (non-Norwegian)  

**Examples:**
- Code/developer tools icons
- Social media icons
- Specific brand icons
- Advanced UI controls

---

## Installation

Both libraries are already installed in the platform:

```bash
# Already included in @xala-technologies/platform
@navikt/aksel-icons  # 900+ Norwegian public sector icons
lucide-react         # 1000+ general purpose icons
```

---

## Usage Examples

### NAV Aksel Icons (Primary)

```tsx
import { 
  EnvelopeClosedIcon,
  CalendarIcon,
  PersonIcon,
  BuildingIcon,
  FileTextIcon,
  PhoneIcon
} from '@navikt/aksel-icons';

function ContactCard() {
  return (
    <Card>
      <PersonIcon fontSize="2rem" aria-label="Person" />
      <Heading level={3}>John Doe</Heading>
      
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', alignItems: 'center' }}>
        <EnvelopeClosedIcon fontSize="1.25rem" />
        <span>john@example.com</span>
      </div>
      
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', alignItems: 'center' }}>
        <PhoneIcon fontSize="1.25rem" />
        <span>+47 123 45 678</span>
      </div>
    </Card>
  );
}
```

### Lucide React (Fallback)

```tsx
import { 
  Code,
  Terminal,
  Github,
  Zap,
  Layers
} from 'lucide-react';

function DeveloperTools() {
  return (
    <div>
      <Code size={24} color="var(--ds-color-accent-base-default)" />
      <Terminal size={24} />
      <Github size={24} />
    </div>
  );
}
```

---

## Styling Icons

### NAV Aksel Icons

```tsx
// Size with fontSize
<EnvelopeClosedIcon fontSize="1.5rem" />
<EnvelopeClosedIcon fontSize="2rem" />

// Color with CSS
<EnvelopeClosedIcon style={{ color: 'var(--ds-color-accent-base-default)' }} />

// Accessibility
<EnvelopeClosedIcon title="Send email" />
<EnvelopeClosedIcon aria-label="Email address" />
```

### Lucide React

```tsx
// Size with size prop
<Mail size={16} />
<Mail size={24} />
<Mail size={32} />

// Color with color prop or CSS
<Mail color="var(--ds-color-accent-base-default)" />
<Mail style={{ color: 'var(--ds-color-danger-base-default)' }} />

// Accessibility
<Mail aria-label="Email" />
```

---

## Accessibility Requirements

All icons MUST follow these accessibility guidelines:

### 1. Decorative Icons
If the icon is purely decorative (text nearby explains it):

```tsx
// ✅ Good - aria-hidden for decorative icons
<div>
  <EnvelopeClosedIcon aria-hidden="true" />
  <span>Email</span>
</div>
```

### 2. Meaningful Icons
If the icon conveys meaning without text:

```tsx
// ✅ Good - Provide accessible label
<button>
  <EnvelopeClosedIcon title="Send email" />
</button>

// ✅ Good - Use aria-label
<button aria-label="Send email">
  <EnvelopeClosedIcon aria-hidden="true" />
</button>
```

### 3. Interactive Icons
For clickable icons:

```tsx
// ✅ Good - Button with label
<Button aria-label="Delete item">
  <TrashIcon fontSize="1.25rem" />
</Button>

// ✅ Good - Tooltip + label
<button aria-label="Settings" title="Open settings">
  <CogIcon size={20} />
</button>
```

---

## Common Icon Mappings

### Aksel → Lucide Equivalents

| Concept | Aksel Icon | Lucide Fallback |
|---------|-----------|-----------------|
| Email | `EnvelopeClosedIcon` | `Mail` |
| Calendar | `CalendarIcon` | `Calendar` |
| Person | `PersonIcon` | `User` |
| Building | `BuildingIcon` | `Building2` |
| Phone | `PhoneIcon` | `Phone` |
| Document | `FileTextIcon` | `FileText` |
| Settings | `CogIcon` | `Settings` |
| Search | `MagnifyingGlassIcon` | `Search` |
| Close | `XMarkIcon` | `X` |
| Check | `CheckmarkIcon` | `Check` |

---

## Icon Selection Checklist

Before adding an icon to your component:

- [ ] Check if Aksel has the icon: [aksel.nav.no/ikoner](https://aksel.nav.no/ikoner)
- [ ] If yes, use Aksel icon
- [ ] If no, check Lucide: [lucide.dev](https://lucide.dev)
- [ ] Add proper accessibility attributes
- [ ] Use design tokens for colors
- [ ] Test with screen reader
- [ ] Verify icon renders correctly in all themes

---

## Resources

### NAV Aksel Icons
- **Icon Browser:** [aksel.nav.no/ikoner](https://aksel.nav.no/ikoner)
- **NPM Package:** [@navikt/aksel-icons](https://www.npmjs.com/package/@navikt/aksel-icons)
- **Figma:** [Core Icons 3](https://www.figma.com/community/file/1214869602572392330/Core-Icons-3)
- **Guidelines:** [Accessible Icon Usage](https://aksel.nav.no/god-praksis/artikler/tilgjengelig-ikonbruk)

### Lucide React
- **Icon Browser:** [lucide.dev](https://lucide.dev)
- **NPM Package:** [lucide-react](https://www.npmjs.com/package/lucide-react)
- **GitHub:** [lucide-icons/lucide](https://github.com/lucide-icons/lucide)

### Designsystemet
- **Icons Guide:** [designsystemet.no/en/fundamentals/theme/icons](https://designsystemet.no/en/fundamentals/theme/icons)
- **Accessibility:** [WCAG Icon Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html)

---

## Contributing New Icons

If you need an icon that doesn't exist in either library:

1. **Check if it's a common public sector need**
   - If yes → [Submit to Aksel](https://github.com/digdir/designsystemet/discussions/categories/ikonforesp%C3%B8rsler)
   
2. **Create custom SVG icon**
   - Follow Aksel's design guidelines
   - Place in `packages/platform/src/ui/icons/`
   - Export from `packages/platform/src/ui/icons/index.ts`
   - Add to Storybook with examples

3. **Document the icon**
   - Add to icon catalog story
   - Include accessibility example
   - Show usage in context

---

## Migration from Emojis

If you're replacing emojis with icons, use this mapping:

| Emoji | Aksel Icon | Lucide Icon |
|-------|-----------|-------------|
| 📧 | `EnvelopeClosedIcon` | `Mail` |
| 📅 | `CalendarIcon` | `Calendar` |
| 👤 | `PersonIcon` | `User` |
| 🏢 | `BuildingIcon` | `Building2` |
| ⚙️ | `CogIcon` | `Settings` |
| 🔍 | `MagnifyingGlassIcon` | `Search` |
| ✅ | `CheckmarkIcon` | `Check` |
| ❌ | `XMarkIcon` | `X` |
| ⚠️ | `ExclamationmarkTriangleIcon` | `AlertTriangle` |
| 🎨 | `PaletteIcon` | `Palette` |
| 📱 | `PhoneIcon` | `Smartphone` |
| 🌍 | `GlobeIcon` | `Globe` |

---

## ESLint Enforcement

The `no-emojis` ESLint rule enforces this policy:

```typescript
// ❌ Will fail ESLint
const icon = '📧';
<div>📅 Calendar</div>

// ✅ Will pass ESLint
import { EnvelopeClosedIcon } from '@navikt/aksel-icons';
<EnvelopeClosedIcon />
```

See [NO_EMOJIS_POLICY.md](../governance/NO_EMOJIS_POLICY.md) for full details.
