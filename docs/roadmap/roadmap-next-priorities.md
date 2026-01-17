# DIGILIST / XALA — NEXT PRIORITIES

**Context:** Feature flag system (Level 2.1) is under development. This document identifies the next high-priority features to focus on.

**Last Updated:** 2026-01-17

---

## IMMEDIATE PRIORITIES (Do First)

### 1. Complete Level 0 Validation ⚡ CRITICAL

**Why:** Level 0 is the foundation. Everything else builds on it. We must validate it's 100% stable.

**Canonical Flow to Validate:**
"User books → Admin approves → User sees notification"

**Tasks:**
- [ ] Write E2E test for full booking flow
- [ ] Verify rental object listing + details UI
- [ ] Test availability calendar display
- [ ] Test booking creation flow
- [ ] Test admin approval queue
- [ ] Test notification delivery (at least in-app)
- [ ] Fix any bugs discovered

**Estimated Effort:** 2-3 days
**Risk:** LOW (mostly validation, not new features)
**Blockers:** None

**Deliverable:**
- E2E test suite passing
- Level 0 checklist 100% ✅
- Confidence to expand scope

---

## HIGH-VALUE QUICK WINS (Parallel Work)

### 2. Real-Time Notifications (Complete 0.4) ⚡ HIGH VALUE

**Why:**
- Infrastructure exists (DB schema, API endpoints)
- WebSocket integration is the missing piece
- Real-time updates are a competitive advantage
- Unblocks user experience for all booking flows

**Tasks:**
- [ ] Implement WebSocket server (apps/api)
- [ ] Add notification events (booking created/approved/rejected/cancelled)
- [ ] Integrate realtime client in SDK
- [ ] Add notification bell component to apps
- [ ] Add notification center page (minside)
- [ ] E2E test: Real-time notification delivery

**Estimated Effort:** 3-5 days
**Risk:** MEDIUM (WebSocket can be tricky)
**Blockers:** None (can work in parallel with Level 0 validation)

**Deliverable:**
- Users receive real-time notifications
- Notification center UI in minside
- WebSocket connection stable

---

### 3. Calendar & Blocking (1.1) 🎯 HIGH VALUE

**Why:**
- Critical for admins to manage maintenance/closures
- Prevents invalid bookings
- Builds on stable rental objects
- Relatively self-contained
- High ROI for municipal customers

**Tasks:**
- [ ] DB: Create `domain.blocks` table (might already exist)
- [ ] API: Block CRUD endpoints
- [ ] Contracts: `BlockDTO`
- [ ] SDK: `blockService` + `useBlocks()` hook
- [ ] Apps (backoffice): Block management UI
- [ ] Apps (web): Display blocks in availability calendar
- [ ] E2E test: Admin creates block, user sees it

**Estimated Effort:** 3-4 days
**Risk:** LOW (straightforward CRUD + display)
**Blockers:** Level 0 availability calendar must work

**Deliverable:**
- Admins can create/edit/delete blocks
- Blocks prevent bookings
- Users see blocks in calendar

---

### 4. Pricing System (1.2) 💰 HIGH VALUE

**Why:**
- Essential for real municipal deployments
- Booking quote is user-facing value
- Enables revenue tracking
- Foundation for billing/reporting later

**Tasks:**
- [ ] DB: `domain.pricing_groups`, `domain.pricing_rules`
- [ ] API: Pricing configuration + quote calculation endpoint
- [ ] Contracts: `PricingDTO`, `BookingQuoteDTO`
- [ ] SDK: `pricingService` + `usePricing()` hook
- [ ] Apps (backoffice): Pricing configuration UI
- [ ] Apps (web): Display pricing on listing details
- [ ] Apps (web): Show quote before booking confirmation
- [ ] E2E test: Configure pricing, get quote, create booking

**Estimated Effort:** 5-7 days
**Risk:** MEDIUM (pricing logic can be complex)
**Blockers:** Level 0 booking flow must work

**Deliverable:**
- Admins can configure pricing per rental object
- Users see pricing on listings
- Users get quote before booking
- Booking includes calculated price

---

## FOUNDATIONAL WORK (Parallel to Quick Wins)

### 5. Complete Backoffice Essentials (1.3) 🏢 MEDIUM-HIGH VALUE

**Why:**
- Admins need better tools
- Some infrastructure exists (booking queue, listing management)
- Reports are high-value for decision-makers
- Dashboard provides visibility

**Tasks:**
- [ ] Dashboard: KPI cards (total bookings, revenue, utilization)
- [ ] Booking queue: Filter/sort improvements
- [ ] Listing management: Bulk operations
- [ ] Reports: CSV export for bookings
- [ ] Reports: Revenue report
- [ ] Audit log viewer UI
- [ ] E2E test: Admin workflow

**Estimated Effort:** 5-7 days
**Risk:** LOW (mostly UI improvements)
**Blockers:** None (existing infrastructure)

**Deliverable:**
- Improved admin dashboard
- Better booking queue
- Basic reporting exports
- Audit log viewer

---

### 6. Complete Audit + Monitoring (2.3) 📊 MEDIUM VALUE

**Why:**
- Audit logs exist but need better visibility
- Operational monitoring is critical for production
- Health checks needed for uptime monitoring
- Foundation for compliance (GDPR Article 30)

**Tasks:**
- [ ] API: Health check endpoint (`/health`, `/readiness`)
- [ ] API: Metrics endpoint (basic stats)
- [ ] API: Error alerting (log aggregation)
- [ ] Apps (backoffice): Audit log viewer improvements
- [ ] Apps (backoffice): System status dashboard
- [ ] Monitoring: Setup alerts for critical errors
- [ ] E2E test: Audit log search/filter

**Estimated Effort:** 3-5 days
**Risk:** LOW (mostly infrastructure + UI)
**Blockers:** None

**Deliverable:**
- Health check endpoints
- System monitoring dashboard
- Better audit log viewer
- Error alerting configured

---

## LATER (After Feature Flags Released)

### 7. Messaging (3.1) - Wait for Feature Flags

**Why wait:** Should be module-gated, nice-to-have not must-have

### 8. GDPR Baseline (2.4) - Important but can wait

**Why wait:** Compliance is important but current audit logs provide baseline. Can be enhanced after core features stable.

### 9. Favorites, Activities, Reviews (3.2-3.4) - Wait for Feature Flags

**Why wait:** All optional UX enhancements that should be module-gated

---

## RECOMMENDED SPRINT PLAN

### Sprint 1 (Week 1)
**Goal:** Stabilize Level 0

| Task | Owner | Priority |
|------|-------|----------|
| Write E2E test for canonical booking flow | QA/Dev | P0 |
| Fix any bugs discovered in Level 0 | Dev | P0 |
| Verify all Level 0 items working | QA | P0 |

**Exit Criteria:** Level 0 checklist 100% ✅, E2E test passing

---

### Sprint 2 (Week 2)
**Goal:** Real-Time Notifications + Calendar Blocking

**Team A:**
| Task | Owner | Priority |
|------|-------|----------|
| Implement WebSocket server | Backend Dev | P1 |
| Integrate realtime client in SDK | SDK Dev | P1 |
| Build notification center UI | Frontend Dev | P1 |
| E2E test: Real-time notifications | QA | P1 |

**Team B (Parallel):**
| Task | Owner | Priority |
|------|-------|----------|
| Build calendar blocking API | Backend Dev | P1 |
| Build block management UI (backoffice) | Frontend Dev | P1 |
| Display blocks in availability calendar | Frontend Dev | P1 |
| E2E test: Block creation + display | QA | P1 |

**Exit Criteria:**
- Real-time notifications working
- Calendar blocking working
- Both features have E2E tests

---

### Sprint 3 (Week 3)
**Goal:** Pricing System

| Task | Owner | Priority |
|------|-------|----------|
| DB: Pricing tables migration | Backend Dev | P1 |
| API: Pricing config + quote calculation | Backend Dev | P1 |
| SDK: Pricing service + hooks | SDK Dev | P1 |
| Backoffice: Pricing configuration UI | Frontend Dev | P1 |
| Web: Display pricing + quote | Frontend Dev | P1 |
| E2E test: Pricing flow | QA | P1 |

**Exit Criteria:**
- Admins can configure pricing
- Users see pricing + quotes
- Bookings include prices

---

### Sprint 4 (Week 4)
**Goal:** Backoffice Improvements + Monitoring

**Team A:**
| Task | Owner | Priority |
|------|-------|----------|
| Dashboard KPIs | Frontend Dev | P2 |
| Report exports (CSV) | Backend Dev | P2 |
| Audit log viewer improvements | Frontend Dev | P2 |

**Team B (Parallel):**
| Task | Owner | Priority |
|------|-------|----------|
| Health check endpoints | Backend Dev | P2 |
| System monitoring dashboard | Frontend Dev | P2 |
| Error alerting setup | DevOps | P2 |

**Exit Criteria:**
- Better admin tools
- Operational monitoring in place

---

## SUMMARY: FOCUS AREAS (Priority Order)

| # | Feature | Level | Priority | Effort | Risk | Blockers |
|---|---------|-------|----------|--------|------|----------|
| 1 | **Level 0 Validation** | 0 | ⚡ P0 | 2-3 days | LOW | None |
| 2 | **Real-Time Notifications** | 0.4 | ⚡ P1 | 3-5 days | MEDIUM | None |
| 3 | **Calendar Blocking** | 1.1 | 🎯 P1 | 3-4 days | LOW | Level 0 |
| 4 | **Pricing System** | 1.2 | 💰 P1 | 5-7 days | MEDIUM | Level 0 |
| 5 | **Backoffice Essentials** | 1.3 | 🏢 P2 | 5-7 days | LOW | None |
| 6 | **Audit + Monitoring** | 2.3 | 📊 P2 | 3-5 days | LOW | None |
| 7 | **Messaging** | 3.1 | P3 | TBD | MEDIUM | Feature Flags |
| 8 | **GDPR Baseline** | 2.4 | P3 | TBD | MEDIUM | - |
| 9 | **Other Level 3 Modules** | 3.x | P4 | TBD | - | Feature Flags |

---

## KEY PRINCIPLES

1. **Stabilize before expanding** - Level 0 must be 100% before adding complexity
2. **High value first** - Features that directly impact user experience or admin efficiency
3. **Parallel work** - Teams can work on multiple items simultaneously if no dependencies
4. **Test as you go** - E2E tests required for each feature before "done"
5. **Wait for feature flags** - Optional UX modules (Level 3) should wait for feature flag system

---

## DECISION CRITERIA: "Should we build this next?"

Ask these questions:

1. **Does Level 0 work perfectly?** If no → stop, fix Level 0 first
2. **Does it build on stable foundation?** If no → wait for dependencies
3. **Is it high-value for users/admins?** If no → lower priority
4. **Can it be module-gated?** If yes → wait for feature flags (unless critical)
5. **Is it low-risk?** If yes → good candidate for parallel work
6. **Do we have capacity?** If no → prioritize

---

## ANTI-PATTERNS TO AVOID

❌ **Don't:**
- Start Level 3 features before Level 0 is stable
- Build complex features without E2E tests
- Add optional features before feature flag system is ready
- Work on too many things in parallel (context switching)
- Skip validation/testing to "move faster"

✅ **Do:**
- Finish what you start (definition of done includes tests)
- Validate Level 0 thoroughly first
- Focus on high-value, low-risk additions
- Use feature flags for optional modules
- Monitor production closely after each deployment

---

## WHEN FEATURE FLAGS ARE READY

Once feature flag system (Level 2.1) is deployed:

1. **Immediately gate existing optional features** - Identify any non-core features and add flags
2. **Add module management UI** - Backoffice can enable/disable modules per tenant
3. **Then proceed with Level 3 modules** - Messaging, Favorites, Activities, Reviews
4. **Then add integrations** - Vipps, Postmark, Twilio (all gated)

---

## DOCUMENT HISTORY

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-17 | 1.0 | Initial priorities document created |

---

**End of Document**
