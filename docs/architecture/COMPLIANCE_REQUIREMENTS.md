# Compliance Requirements & Audit

**Version:** 1.0  
**Date:** 2026-01-19  
**Status:** Active Compliance Tracking

---

## 🎯 Compliance Targets

The Digilist Platform aims for **100% compliance** with:

1. **Norwegian Designsystemet (Digdir)** - Government design system
2. **WCAG 2.1 AA** - Web Content Accessibility Guidelines
3. **Universell Utforming** - Norwegian universal design regulations
4. **GDPR** - Data protection requirements
5. **NSM Architecture Principles** - National security and interoperability

---

## 1. Norwegian Designsystemet Compliance

### 1.1 Core Requirements

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Use @digdir/designsystemet-react components | ✅ Complete | All primitives from Digdir |
| Semantic HTML structures | ✅ Complete | Proper heading hierarchy, landmarks |
| Design tokens usage | ✅ Complete | CSS variables (--ds-color-*, --ds-spacing-*) |
| Component patterns documented | ✅ Complete | JSDoc on all components |
| Framework-agnostic CSS | ✅ Complete | Inline styles using tokens |

### 1.2 Component Compliance Matrix

```
@xala/ds Package Structure:
├── primitives/     ← Re-exports from @digdir/designsystemet-react
├── composed/       ← Composed components following Digdir patterns
├── blocks/         ← Business-logic components with Digdir base
└── tokens/         ← Design token utilities
```

**Rule:** Never import @digdir/* directly in apps - always through @xala/ds.

### 1.3 Implementation Checklist

- [x] Button, Input, Select, Checkbox, Radio from Digdir
- [x] Card, Table, Modal, Dropdown from Digdir
- [x] Typography (Heading, Paragraph, Label) from Digdir
- [x] Form validation patterns with ErrorSummary
- [x] Consistent spacing using DS tokens
- [x] Color contrast meeting AA requirements
- [x] Focus visible states on all interactive elements

---

## 2. WCAG 2.1 AA Compliance

### 2.1 Perceivable (Level AA)

| Criterion | Requirement | Status | Implementation |
|-----------|-------------|--------|----------------|
| 1.1.1 Non-text Content | Alt text for images | ✅ | All images have alt attributes |
| 1.3.1 Info and Relationships | Semantic structure | ✅ | Proper HTML landmarks and headings |
| 1.3.4 Orientation | Portrait/landscape | ✅ | Responsive layouts |
| 1.4.3 Contrast (Minimum) | 4.5:1 text contrast | ✅ | Digdir tokens ensure compliance |
| 1.4.4 Resize Text | 200% zoom support | ✅ | Relative units (rem, em) |
| 1.4.10 Reflow | No horizontal scroll | ✅ | Responsive grid layouts |
| 1.4.11 Non-text Contrast | 3:1 for UI | ✅ | Digdir border/surface tokens |

### 2.2 Operable (Level AA)

| Criterion | Requirement | Status | Implementation |
|-----------|-------------|--------|----------------|
| 2.1.1 Keyboard | Full keyboard access | ✅ | All components keyboard navigable |
| 2.1.2 No Keyboard Trap | Can exit all components | ✅ | Escape key handlers on modals/drawers |
| 2.4.1 Bypass Blocks | Skip links | ✅ | SkipLinks component implemented |
| 2.4.3 Focus Order | Logical tab order | ✅ | DOM order = visual order |
| 2.4.6 Headings and Labels | Descriptive headings | ✅ | PageHeader component |
| 2.4.7 Focus Visible | Visible focus indicator | ✅ | :focus-visible with 2px outline |
| 2.5.3 Label in Name | Visible text = accessible name | ✅ | aria-label matches visible text |

### 2.3 Understandable (Level AA)

| Criterion | Requirement | Status | Implementation |
|-----------|-------------|--------|----------------|
| 3.1.1 Language of Page | lang attribute | ✅ | html lang="nb-NO" |
| 3.2.3 Consistent Navigation | Same nav order | ✅ | Shared layout components |
| 3.3.1 Error Identification | Error messages | ✅ | ErrorSummary, inline errors |
| 3.3.2 Labels or Instructions | Form labels | ✅ | All inputs have labels |
| 3.3.3 Error Suggestion | Helpful errors | ✅ | Descriptive error text |

### 2.4 Robust (Level AA)

| Criterion | Requirement | Status | Implementation |
|-----------|-------------|--------|----------------|
| 4.1.2 Name, Role, Value | ARIA compliance | ✅ | Proper role, aria-* attributes |
| 4.1.3 Status Messages | Live regions | ✅ | Toast with aria-live |

### 2.5 Required Accessibility Components

```tsx
// All apps must include these in their root layout:
import { SkipLinks } from '@xala/ds';

function RootLayout({ children }) {
  return (
    <html lang="nb-NO">
      <body>
        <SkipLinks />
        <header role="banner">...</header>
        <main id="main-content" role="main">
          {children}
        </main>
        <footer role="contentinfo">...</footer>
      </body>
    </html>
  );
}
```

---

## 3. Universell Utforming (Norwegian Universal Design)

### 3.1 Legal Requirements

The **Forskrift om universell utforming av IKT-løsninger** mandates:

- WCAG 2.1 AA compliance for all public-facing websites
- Bokmål and Nynorsk language support
- Plain language (klarspråk) in all text
- Annual compliance reporting to Digdir

### 3.2 Implementation Status

| Requirement | Status | Notes |
|-------------|--------|-------|
| WCAG 2.1 AA | ✅ Complete | See section 2 |
| Bokmål support | ✅ Complete | Primary language |
| Nynorsk support | ✅ Complete | @xala/i18n translations |
| English support | ✅ Complete | For international users |
| Plain language | ⚠️ Review | Text review recommended |
| Compliance declaration | 📋 TODO | Add accessibility statement page |

### 3.3 Language Implementation

```tsx
// @xala/i18n provides multi-language support
import { useT, LanguageSwitcher } from '@xala/i18n';

function Component() {
  const t = useT();
  return <p>{t('common.welcome')}</p>;
}
```

**Supported Languages:**
- Norwegian Bokmål (nb) - Primary
- Norwegian Nynorsk (nn) - Required
- English (en) - Fallback
- French (fr) - Optional
- Arabic (ar) - Optional (RTL support)

---

## 4. GDPR Compliance

### 4.1 Technical Requirements

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Consent management | ✅ | ConsentPopup component |
| Cookie policy | ✅ | Cookie banner with preferences |
| Data export (Art. 20) | ✅ | DataSubjectRequestForm |
| Right to erasure (Art. 17) | ✅ | Account deletion flow |
| Privacy by design | ✅ | Minimal data collection |
| Audit logging | ✅ | All data access logged |

### 4.2 GDPR Components in @xala/ds

```tsx
// Consent management
import { ConsentPopup, ConsentSettings, DataSubjectRequestForm } from '@xala/ds';

// Usage
<ConsentPopup 
  onAccept={handleAccept}
  onDecline={handleDecline}
  onManage={handleManage}
/>

<DataSubjectRequestForm
  requestTypes={['export', 'deletion', 'correction']}
  onSubmit={handleRequest}
/>
```

### 4.3 Data Protection Audit Trail

All data operations are logged with:
- User ID
- Action type
- Timestamp
- IP address (anonymized)
- Resource affected

---

## 5. NSM Architecture Principles

### 5.1 Interoperability (Samhandlingsevne)

| Principle | Status | Implementation |
|-----------|--------|----------------|
| 6.1 Legal interoperability | ✅ | GDPR, eIDAS compliant |
| 6.2 Organizational interop | ✅ | Standard APIs |
| 6.3 Semantic interop | ✅ | Consistent data models |
| 6.4 Technical interop | ✅ | REST APIs, OpenAPI |
| 6.5 Mandatory IT standards | ✅ | Norwegian standards |
| 6.6 Open standards | ✅ | JSON, OAuth2, OIDC |

### 5.2 Security Principles

| Principle | Status | Implementation |
|-----------|--------|----------------|
| Authentication | ✅ | ID-porten, BankID |
| Authorization | ✅ | RBAC with permissions |
| Encryption in transit | ✅ | TLS 1.3 |
| Encryption at rest | ✅ | Database encryption |
| Audit logging | ✅ | Complete audit trail |
| Input validation | ✅ | TypeScript + runtime validation |

### 5.3 Modularity & Loose Coupling

```
Architecture follows NSM principles:
├── @digilist/api        ← Standalone backend
├── @digilist/client-sdk ← Decoupled client layer
├── @xala/ds             ← Reusable UI components
├── apps/web             ← Public-facing app
├── apps/backoffice      ← Admin app
└── apps/minside         ← User portal
```

---

## 6. Component Accessibility Checklist

### 6.1 For Every New Component

```markdown
## Accessibility Checklist

- [ ] Keyboard navigation works (Tab, Enter, Space, Escape)
- [ ] Focus indicator is visible (2px solid outline)
- [ ] Screen reader announces component correctly
- [ ] ARIA roles are appropriate (button, dialog, etc.)
- [ ] ARIA states update dynamically (aria-expanded, aria-selected)
- [ ] Color contrast meets 4.5:1 for text, 3:1 for UI
- [ ] Component works at 200% zoom
- [ ] Touch targets are at least 44x44px
- [ ] Error messages are announced to screen readers
- [ ] Loading states are announced (aria-busy)
```

### 6.2 Testing Tools

```bash
# Automated accessibility testing
pnpm test:a11y

# Manual testing checklist
1. Keyboard-only navigation
2. Screen reader (VoiceOver, NVDA)
3. High contrast mode
4. 200% browser zoom
5. Reduced motion preference
```

---

## 7. Compliance Monitoring

### 7.1 AccessibilityDashboard

The platform includes real-time accessibility monitoring:

```tsx
import { AccessibilityDashboard } from '@xala/ds';

// Displays metrics:
// - Keyboard navigation usage
// - Skip link usage
// - Screen reader detection
// - Focus issues detected
// - Compliance score (0-100)
```

### 7.2 Automated Audits

```yaml
# .github/workflows/accessibility.yml
- Run axe-core on all pages
- Check color contrast
- Validate HTML structure
- Test keyboard navigation
- Generate compliance report
```

---

## 8. Remediation Priorities

### 8.1 High Priority

| Issue | Component | Action |
|-------|-----------|--------|
| Add accessibility statement | App | Create /tilgjengelighet page |
| Plain language review | All text | Audit all user-facing text |

### 8.2 Medium Priority

| Issue | Component | Action |
|-------|-----------|--------|
| Enhanced focus indicators | Custom components | Add :focus-visible styles |
| Live region announcements | Toast, Alert | Verify aria-live works |

### 8.3 Low Priority

| Issue | Component | Action |
|-------|-----------|--------|
| RTL support testing | All | Test Arabic language |
| Print stylesheet | Pages | Add @media print styles |

---

## 9. Certification Goals

### Target Certifications

1. **Digdir Accessibility Audit** - Pass annual inspection
2. **WCAG 2.1 AA Conformance** - Self-declared
3. **Universal Design Certificate** - From Digdir
4. **ISO 27001** - Information security (future)

---

## 10. Resources

### Documentation
- [Designsystemet](https://designsystemet.no/en/)
- [WCAG 2.1](https://www.w3.org/TR/WCAG21/)
- [Digdir Universal Design](https://www.digdir.no/digitalisering-og-samordning/universell-utforming/1652)
- [NSM Architecture Principles](https://www.digdir.no/digitalisering-og-samordning/nasjonale-arkitekturprinsipper/3453)

### Testing Tools
- axe DevTools
- WAVE
- Lighthouse Accessibility Audit
- VoiceOver (macOS)
- NVDA (Windows)

---

**Maintained by:** Xala Technologies  
**Last Audit:** 2026-01-19  
**Next Review:** 2026-04-19
