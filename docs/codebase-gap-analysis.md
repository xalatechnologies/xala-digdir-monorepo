# Codebase Gap Analysis (Performance, Architecture, Reuse)

## Scope

This document summarizes observed architecture, performance, code quality, and reuse gaps based on targeted sampling of shared layout and realtime providers across apps. It is not a full static analysis; findings below are tied to specific files.

Sampled files:

- `apps/backoffice/src/components/layout/AppLayout.tsx`
- `apps/minside/src/components/layout/AppLayout.tsx`
- `apps/backoffice/src/components/layout/Header.tsx`
- `apps/minside/src/components/layout/Header.tsx`
- `apps/backoffice/src/providers/RealtimeProvider.tsx`
- `apps/minside/src/providers/RealtimeProvider.tsx`
- `apps/web/src/providers/RealtimeProvider.tsx`

## Architecture and Code Quality Gaps

- Hardcoded UI strings exist in shared layout and header components, which conflicts with i18n-first rules.
- Raw HTML elements and inline styles are used in core layout and header components, which conflicts with design-system usage guidance.
- Realtime integration diverges across apps: `apps/web` uses a custom provider and event tracking pattern, while backoffice/minside rely on SDK hooks.

## Performance Risks

- `apps/web` stores every realtime event in state and updates it for every incoming event, which can lead to unbounded growth and frequent re-renders.
- `apps/minside` uses an unthrottled `resize` listener that updates state on every resize event, potentially causing excessive renders.

## Duplication and Reuse Gaps

- Backoffice and minside have nearly identical realtime provider logic with only minor differences in subscriptions.
- App layout and header structures are similar across backoffice and minside, with repeated inline styling and layout scaffolding.
- Page title mapping logic appears duplicated across apps and is not localized.

## Reuse Opportunities

- Create a shared realtime provider (configurable subscription list) in a shared UI package or the SDK to eliminate duplication and keep behavior consistent.
- Introduce layout primitives (app shell, header, sidebar) in `@xala/ds` or a dedicated shared UI package so apps compose consistent layouts without raw HTML/inline styles.
- Centralize navigation metadata (routes, titles, icons) and localize via `@xala/i18n` to remove hardcoded strings and duplicated route maps.
- Provide a shared responsive hook (e.g., `useIsMobile`) to standardize viewport handling and debounce resize events.

## Suggested Next Steps

1. Decide target location for shared layout primitives (`packages/ds` vs new UI package).
2. Align realtime provider behavior and event handling across apps.
3. Replace hardcoded strings with i18n keys and ensure keys exist in `packages/i18n` locales.
4. Introduce shared navigation metadata for titles and sidebar items.
