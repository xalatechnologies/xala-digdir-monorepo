# ROADMAP EXECUTION PLAN

**Created:** 2026-01-17
**Status:** IN PROGRESS
**Feature Flags System:** Under development (parallel track)

---

## ORCHESTRATION STRATEGY

We will use specialized agents from `.agent/skills/` to execute roadmap priorities efficiently and production-ready.

### Available Specialized Agents

| Agent | Expertise | Use For |
|-------|-----------|---------|
| `testing-expert` | Playwright E2E, Vitest unit tests | Test creation and validation |
| `senior-architect` | System design, DDD, contracts | Architecture decisions |
| `api-backend-expert` | Fastify, Drizzle ORM, PostgreSQL | Backend development |
| `client-sdk-expert` | SDK services, React Query hooks | SDK development |
| `frontend-developer` | React, TypeScript, routing | UI development |
| `contracts-expert` | Zod schemas, DTOs, projections | API contracts |
| `design-system-expert` | @xala/ds components, tokens | UI components |
| `i18n-localization-expert` | Translation, formatters | Internationalization |
| `security-gdpr-expert` | RBAC, audit, compliance | Security review |
| `devops-deployment-expert` | CI/CD, Docker, PM2 | Deployment |

---

## PRIORITY 1: LEVEL 0 VALIDATION ⚡

**Goal:** Validate canonical flow: "User books → Admin approves → User sees notification"

**Timeline:** 2-3 days
**Risk:** LOW
**Blockers:** None

### Agent Assignments

#### Phase 1: Test Planning (testing-expert + senior-architect)
- [ ] **testing-expert**: Design E2E test structure for canonical flow
- [ ] **senior-architect**: Validate flow architecture and data dependencies
- [ ] **Deliverable**: Test specification document

#### Phase 2: Backend Verification (api-backend-expert)
- [ ] Verify booking creation endpoint
- [ ] Verify booking approval endpoint
- [ ] Verify notification creation on booking events
- [ ] Check audit logging for all mutations
- [ ] **Deliverable**: Backend status report

#### Phase 3: SDK Verification (client-sdk-expert)
- [ ] Verify `bookingService.create()` method
- [ ] Verify `bookingService.approve()` method
- [ ] Verify `notificationService` methods
- [ ] Verify React Query hooks
- [ ] **Deliverable**: SDK status report

#### Phase 4: Frontend Verification (frontend-developer)
- [ ] Verify booking creation form (web/minside)
- [ ] Verify booking approval UI (backoffice)
- [ ] Verify notification display
- [ ] Check data-testid attributes
- [ ] **Deliverable**: Frontend status report

#### Phase 5: E2E Test Implementation (testing-expert)
- [ ] Create Page Objects for Booking, Admin, Notifications
- [ ] Write E2E test spec
- [ ] Add authentication fixtures
- [ ] Run and debug test
- [ ] **Deliverable**: Passing E2E test

#### Phase 6: Validation & Sign-off (senior-architect + security-gdpr-expert)
- [ ] Review test coverage
- [ ] Verify audit logging compliance
- [ ] Check multi-tenant isolation
- [ ] Final production readiness check
- [ ] **Deliverable**: Level 0 ✅ sign-off

### Success Criteria
- [ ] E2E test passes consistently
- [ ] All Level 0 checklist items ✅
- [ ] No security or compliance issues
- [ ] Documentation updated

---

## PRIORITY 2: REAL-TIME NOTIFICATIONS ⚡

**Goal:** Complete WebSocket integration for real-time notifications

**Timeline:** 3-5 days
**Risk:** MEDIUM (WebSocket complexity)
**Blockers:** Level 0 must be validated first

### Agent Assignments

#### Phase 1: Architecture Design (senior-architect)
- [ ] Design WebSocket event schema
- [ ] Design channel subscription model
- [ ] Define notification event types
- [ ] Plan React Query invalidation strategy
- [ ] **Deliverable**: Architecture proposal

#### Phase 2: Backend Implementation (api-backend-expert)
- [ ] Implement WebSocket server in Fastify
- [ ] Add notification event broadcasting
- [ ] Create channel subscription logic
- [ ] Add authentication for WebSocket connections
- [ ] **Deliverable**: WebSocket server running

#### Phase 3: SDK Integration (client-sdk-expert)
- [ ] Extend realtime client for notifications
- [ ] Add notification event handlers
- [ ] Integrate with React Query
- [ ] Add auto-reconnection logic
- [ ] **Deliverable**: SDK realtime notification support

#### Phase 4: UI Implementation (frontend-developer + design-system-expert)
- [ ] Create NotificationBell component
- [ ] Create NotificationCenter page
- [ ] Add unread count badge
- [ ] Add mark-as-read functionality
- [ ] **Deliverable**: Notification UI components

#### Phase 5: i18n (i18n-localization-expert)
- [ ] Add notification translations (nb/en)
- [ ] Add notification template strings
- [ ] **Deliverable**: Localized notifications

#### Phase 6: Testing (testing-expert)
- [ ] E2E test: Real-time notification delivery
- [ ] E2E test: Mark as read
- [ ] Integration test: WebSocket server
- [ ] **Deliverable**: Passing tests

#### Phase 7: Security Review (security-gdpr-expert)
- [ ] Review WebSocket authentication
- [ ] Check tenant isolation in events
- [ ] Verify GDPR compliance (notification content)
- [ ] **Deliverable**: Security sign-off

### Success Criteria
- [ ] Real-time notifications work across all apps
- [ ] WebSocket connection stable
- [ ] Auto-reconnection on disconnect
- [ ] Tests passing
- [ ] Security approved

---

## PRIORITY 3: CALENDAR BLOCKING 🎯

**Goal:** Admins can create blocks, users see blocks in calendar

**Timeline:** 3-4 days
**Risk:** LOW
**Blockers:** Level 0 must be validated first

### Agent Assignments

#### Phase 1: Design (senior-architect + contracts-expert)
- [ ] Design `domain.blocks` table schema
- [ ] Design block types (maintenance, closed, private)
- [ ] Design BlockDTO and contracts
- [ ] **Deliverable**: Schema + contracts

#### Phase 2: Backend Implementation (api-backend-expert)
- [ ] Create `modules/blocks/` feature
- [ ] Implement block CRUD endpoints
- [ ] Add block conflict detection
- [ ] Integrate blocks into availability calculation
- [ ] Add audit logging
- [ ] **Deliverable**: Block API endpoints

#### Phase 3: SDK Implementation (client-sdk-expert)
- [ ] Create `blockService`
- [ ] Create `useBlocks()` hook
- [ ] Add block mutation hooks
- [ ] **Deliverable**: SDK block support

#### Phase 4: Backoffice UI (frontend-developer + design-system-expert)
- [ ] Create Block management page
- [ ] Create Block form (create/edit)
- [ ] Add block type selector
- [ ] Add date range picker
- [ ] **Deliverable**: Block management UI

#### Phase 5: Public Calendar Display (frontend-developer)
- [ ] Update availability calendar to show blocks
- [ ] Add block visual indicators
- [ ] Add block tooltips/details
- [ ] **Deliverable**: Blocks visible to users

#### Phase 6: i18n (i18n-localization-expert)
- [ ] Add block translations
- [ ] Add block type labels
- [ ] **Deliverable**: Localized blocks

#### Phase 7: Testing (testing-expert)
- [ ] E2E: Admin creates block
- [ ] E2E: Block prevents booking
- [ ] E2E: User sees block in calendar
- [ ] Integration: Conflict detection
- [ ] **Deliverable**: Passing tests

### Success Criteria
- [ ] Admins can create/edit/delete blocks
- [ ] Blocks prevent bookings
- [ ] Users see blocks in calendar
- [ ] Tests passing

---

## PRIORITY 4: PRICING SYSTEM 💰

**Goal:** Configurable pricing per rental object, booking quote calculation

**Timeline:** 5-7 days
**Risk:** MEDIUM (pricing logic complexity)
**Blockers:** Level 0 must be validated first

### Agent Assignments

#### Phase 1: Design (senior-architect + contracts-expert)
- [ ] Design pricing schema (groups, rules, discounts)
- [ ] Design quote calculation algorithm
- [ ] Design PricingDTO, QuoteDTO contracts
- [ ] **Deliverable**: Pricing architecture

#### Phase 2: Backend Implementation (api-backend-expert)
- [ ] Create `modules/pricing/` feature
- [ ] Implement pricing configuration endpoints
- [ ] Implement quote calculation service
- [ ] Add discount code validation
- [ ] Add audit logging
- [ ] **Deliverable**: Pricing API

#### Phase 3: SDK Implementation (client-sdk-expert)
- [ ] Create `pricingService`
- [ ] Create `usePricing()` hook
- [ ] Add quote calculation hook
- [ ] **Deliverable**: SDK pricing support

#### Phase 4: Backoffice UI (frontend-developer + ui-ux-designer)
- [ ] Create pricing configuration page
- [ ] Create pricing matrix editor
- [ ] Add pricing group management
- [ ] Add discount code management
- [ ] **Deliverable**: Pricing config UI

#### Phase 5: Public UI (frontend-developer)
- [ ] Display pricing on listing details
- [ ] Add booking quote preview
- [ ] Show pricing breakdown
- [ ] **Deliverable**: Pricing display

#### Phase 6: i18n (i18n-localization-expert)
- [ ] Add pricing translations
- [ ] Add currency formatting
- [ ] **Deliverable**: Localized pricing

#### Phase 7: Testing (testing-expert)
- [ ] E2E: Admin configures pricing
- [ ] E2E: User sees pricing
- [ ] E2E: Get booking quote
- [ ] Integration: Pricing calculation
- [ ] Unit: Discount validation
- [ ] **Deliverable**: Passing tests

#### Phase 8: Security Review (security-gdpr-expert)
- [ ] Review pricing access control
- [ ] Check tenant isolation
- [ ] **Deliverable**: Security sign-off

### Success Criteria
- [ ] Admins can configure pricing
- [ ] Users see pricing on listings
- [ ] Quote calculation works
- [ ] Tests passing
- [ ] Security approved

---

## EXECUTION WORKFLOW

### For Each Priority:

```
1. Senior Architect → Design & validate approach
2. Contracts Expert → Define DTOs and schemas (if needed)
3. API Backend Expert → Implement backend
4. Client SDK Expert → Implement SDK layer
5. Frontend Developer → Implement UI
   (+ Design System Expert if new components)
   (+ UI/UX Designer for complex flows)
6. i18n Expert → Add translations
7. Testing Expert → Write and run tests
8. Security/GDPR Expert → Security review (if needed)
9. DevOps Expert → Deploy (after all pass)
```

### Quality Gates

Each phase must pass before proceeding:
- [ ] Code review by relevant expert
- [ ] Tests passing
- [ ] i18n compliance (no hardcoded strings)
- [ ] Design system compliance
- [ ] Security review (for sensitive features)

---

## COORDINATION PRINCIPLES

1. **Parallel Work Where Possible**
   - Backend and SDK can work in parallel if contracts are defined
   - Multiple UIs can work in parallel if SDK is ready
   - Testing can start as soon as any layer is ready

2. **Clear Handoffs**
   - Each agent produces a deliverable
   - Next agent reviews deliverable before starting
   - Document blockers immediately

3. **Production-Ready Standard**
   - All code must pass design system compliance scan
   - All text must pass i18n localization scan
   - All code must pass duplicate code scanner
   - Security review for sensitive features
   - E2E tests required before "done"

4. **Communication**
   - Each agent creates status reports
   - Blockers escalated immediately
   - Architecture questions go to senior-architect

---

## TRACKING

### Current Status

| Priority | Status | Progress | ETA |
|----------|--------|----------|-----|
| Level 0 Validation | 🟡 IN PROGRESS | 0% | 2-3 days |
| Real-Time Notifications | ⚪ NOT STARTED | 0% | TBD |
| Calendar Blocking | ⚪ NOT STARTED | 0% | TBD |
| Pricing System | ⚪ NOT STARTED | 0% | TBD |

### Completed Phases

- [ ] Priority 1 - Phase 1: Test Planning
- [ ] Priority 1 - Phase 2: Backend Verification
- [ ] Priority 1 - Phase 3: SDK Verification
- [ ] Priority 1 - Phase 4: Frontend Verification
- [ ] Priority 1 - Phase 5: E2E Test Implementation
- [ ] Priority 1 - Phase 6: Validation & Sign-off

---

## DOCUMENT HISTORY

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-17 | 1.0 | Initial execution plan created |

---

**Next Action:** Invoke `testing-expert` skill to begin Priority 1, Phase 1.
