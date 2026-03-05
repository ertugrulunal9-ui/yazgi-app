# Yazgi MVP Detailed Implementation Plan (4 Weeks)

Created: 2 March 2026  
Window: 2 March 2026 - 29 March 2026  
Source baseline: `MVP_ROADMAP_2026-03-02.md`

## 1. Outcome Targets

1. Ship an MVP Release Candidate (RC) by Friday, 27 March 2026.
2. Bring engineering quality gates to green:
   - `npm run typecheck` passes.
   - `npm test -- --watch=false` passes.
3. Keep gameplay loop stable while integrating current branch packages:
   - milestone summary
   - fate transparency
   - economy depth
   - micro goals
4. Prepare premium path for controlled rollout with feature flag gates.

## 2. Capacity and Team Model

| Role | Capacity / Week | 4-Week Total | Responsibility |
| --- | ---: | ---: | --- |
| Dev A | 4.5 eng-day | 18 eng-day | Core gameplay logic, ending resolver, save contracts |
| Dev B | 4.5 eng-day | 18 eng-day | App shell, analytics contracts, monetization hardening |
| QA (0.5) | 2.5 qa-day | 10 qa-day | Regression matrix, smoke flows, release sign-off |
| Total | 11.5 day/week | 46 day | Delivery + quality |

## 3. Scope Baseline (What is In / Out)

### In Scope (MVP)

1. Fix currently failing suites and keep test baseline stable.
2. Align ending/career logic with current game rules.
3. Align save export/import and encryption expectations with v5 save schema.
4. Align analytics experiment bitmask with current feature-flag set.
5. Stabilize `AppShell` integration path for test/runtime consistency.
6. Harden premium purchase/restore flows behind feature flag.

### Out of Scope (Post-MVP)

1. Full permanent flags global rollout.
2. Large content expansion for social/economy events.
3. New major gameplay systems not already in branch.

## 4. Workstreams and Task Matrix

| ID | Workstream | Files / Modules | Estimate | Owner | Dependency | Done When |
| --- | --- | --- | ---: | --- | --- | --- |
| W1-T1 | Causal failure mapping (non-linear baseline) | `__tests__/*`, affected source modules | 0.5d | Dev A + Dev B | none | Each failing suite linked to root cause cluster and owner |
| W1-T2 | Secret ending threshold test sync | `__tests__/utils/endingResolver.edgeCases.test.ts`, `__tests__/utils/endingResolver.test.ts` | 0.06d | Dev A | W1-T1 | 2 ending suites aligned to current threshold logic |
| W1-T3 | personalitySystem breakdown expectation sync | `__tests__/utils/personalitySystem.test.ts`, `src/utils/personalitySystem.ts` (if needed) | 0.03d | Dev B | W1-T1 | personality suite closes with approved risk formula |
| W1-T4 | economicRecoveryEvents test sync | `__tests__/data/economicRecoveryEvents.test.ts` | 0.03d | Dev B | W1-T1 | recovery suite reflects current event set contract |
| W1-T5 | AppShell Modal import/renderer fix | `src/appShell/AppShell.tsx`, `src/components/ui/Modal.tsx`, `src/components/PaywallModal.tsx`, `__tests__/app/AppShell.integration.test.tsx` | 0.5d | Dev B | W1-T1 | AppShell integration suite passes |
| W1-T6 | Bitmask sync (feature flags <-> experimentBucketing) | `src/utils/experimentBucketing.ts`, `src/config/featureFlags.ts`, `__tests__/analytics/experimentAssignment.test.ts` | 0.5d | Dev B | W1-T1 | bitmask format/order test suite passes |
| W1-T7 | endingResolver + career scoring alignment | `src/utils/endingResolver.ts`, `src/utils/gameUtils.ts`, `__tests__/utils/gameUtilsExtended.test.ts` | 1.5d | Dev A | W1-T2 | ending and career suites pass without behavior regression |
| W1-T8 | Sprint 1 gate | all touched modules | 0.5d | Dev A + Dev B + QA | W1-T2..W1-T7 | failing suite count reaches `<=4` |
| W2-T1 | Save export/import contract decision (v5 authority) | `src/save/SaveSlot.ts`, `src/save/SaveManager.ts`, `__tests__/save/SaveExportImport.test.ts` | 0.5d | Dev A + QA | W1 complete | explicit contract note for export version and encryption prefix policy |
| W2-T2 | Save encryption/export suite closure | `src/save/SaveManager.ts`, `src/save/SaveSlot.ts`, `__tests__/save/SaveExportImport.test.ts` | 0.5d | Dev A | W2-T1 | Save suite passes and migration/backward behavior validated |
| W2-T3 | Full suite gate to green | all | 1.0d | Dev A + Dev B + QA | W2-T2 | full test command green |
| W3-T1 | Premium rollout design | `src/config/featureFlags.ts`, `src/services/subscriptionManager.ts` | 0.5d | Dev B | W2 complete | Rollout doc with kill-switch and fallback paths |
| W3-T2 | Paywall + purchase hardening | `src/components/PaywallModal.tsx`, `src/services/subscriptionManager.ts`, `src/appShell/SettingsPanel.tsx` | 2.0d | Dev B | W3-T1 | Happy/fail/cancel/restore paths behave deterministically |
| W3-T3 | Runtime config hardening | `app.json`, env resolution in subscription/ads services | 1.0d | Dev A | W3-T1 | Missing config handled gracefully; no crash path |
| W3-T4 | Premium QA matrix | runtime flows + manual test scripts | 1.5d | QA | W3-T2/3 | Sandbox-ready validation report |
| W4-T1 | RC stabilization bugfix batch | cross-module | 2.0d | Dev A + Dev B | W3 complete | No P0/P1 bugs open |
| W4-T2 | Release checks and smoke | gameplay + save/load + monetization toggles | 1.5d | QA | W4-T1 | Smoke checklist signed |
| W4-T3 | Release notes and go/no-go | release docs | 0.5d | Dev A + QA | W4-T2 | Ship/no-ship decision documented |

## 5. Sprint Plan with Exact Dates

## Sprint 1 - Stabilization  
Dates: Monday 2 March 2026 - Sunday 8 March 2026

### Sprint Goal
Close the fast-impact P1 cluster first and hit `<=4` failing suites early in the sprint, then spend remaining time on ending/career hard fixes.

### Revised Priority Order (Sprint 1)

| Priority | Task | Estimate | Expected Effect |
| --- | --- | ---: | --- |
| P1 | Secret ending thresholds -> test sync | 30 min | closes 2 suites quickly |
| P1 | personalitySystem breakdown expectation sync | 15 min | closes 1 suite |
| P1 | economicRecoveryEvents test sync | 15 min | closes 1 suite |
| P1 | AppShell Modal import fix | 1-4 h | closes 1 suite |
| P2 | Bitmask sync (featureFlags <-> experimentBucketing) | 2-4 h | closes 1 suite |
| P3 | endingResolver + career scoring alignment | 1-2 day | closes 2 suites |
| P4 | Save encryption prefix/export contract closure | 0.5 day | closes 1 suite (Sprint 2) |

### Day-by-Day

1. Monday, 2 March 2026
   - Build causal failure map (root cause clusters, not linear baseline snapshot).
   - Execute P1 fast wins in order: secret ending tests, personality breakdown sync, economicRecovery test sync.
   - Start AppShell modal/import fix.
2. Tuesday, 3 March 2026
   - Finish AppShell integration fix and re-run focused integration suites.
   - Execute bitmask sync and close `experimentAssignment` suite.
3. Wednesday, 4 March 2026
   - Start `endingResolver` + `gameUtils` scoring alignment.
   - Validate locale-sensitive ending outputs and mismatch routing.
4. Thursday, 5 March 2026
   - Complete ending/career hard fixes.
   - Run focused suite batch for ending/career modules.
5. Friday, 6 March 2026
   - Run Sprint 1 gate: target failing suites `<=4`.
   - Run `typecheck` and targeted full regression subset.
6. Saturday, 7 March 2026
   - Buffer for regression fixes only (no new scope).
7. Sunday, 8 March 2026
   - Freeze sprint output and prep Sprint 2 handoff.

### Sprint 1 Exit Criteria

1. `npm run typecheck` passes.
2. Failing suite count reduced to `<=4`.
3. P1 fast-win cluster fully completed.
4. No new P0 regression introduced.

## Sprint 2 - Contract and Data Alignment  
Dates: Monday 9 March 2026 - Sunday 15 March 2026

### Sprint Goal
Bring full test gate to green by closing save export/encryption contract and any residual failures from Sprint 1.

### Day-by-Day

1. Monday, 9 March 2026
   - Finalize save contract decision (`SAVE_EXPORT_VERSION`, backup cap, encryption prefix expectations).
   - Update test contract document.
2. Tuesday, 10 March 2026
   - Implement save export/import compatibility updates.
   - Verify bounded backup behavior and migration metadata consistency.
3. Wednesday, 11 March 2026
   - Full-suite run and triage residual failures.
   - Close remaining save and ending edge regressions.
4. Thursday, 12 March 2026
   - Full run: unit + integration + save suites.
   - Lock green baseline for RC track.
5. Friday, 13 March 2026
   - Full `npm test -- --watch=false` gate.
   - Fix residual flakes.
6. Saturday, 14 March 2026
   - Buffer for any failing suite fallout.
7. Sunday, 15 March 2026
   - Freeze sprint output and prepare premium rollout backlog.

### Sprint 2 Exit Criteria

1. `npm run typecheck` passes.
2. `npm test -- --watch=false` passes.
3. Save/export/import contract explicitly versioned and documented.

## Sprint 3 - Premium Hardening and Rollout Readiness  
Dates: Monday 16 March 2026 - Sunday 22 March 2026

### Sprint Goal
Make premium flow dark-launch ready behind feature flag.

### Day-by-Day

1. Monday, 16 March 2026
   - Define rollout policy for `PREMIUM_SUBSCRIPTION`:
     - default off
     - progressive exposure
     - rollback trigger
2. Tuesday, 17 March 2026
   - Harden purchase and restore flow error handling.
   - Verify cancellation path does not produce false errors.
3. Wednesday, 18 March 2026
   - Harden runtime key resolution (`env` + `app.json` extras).
   - Add safe fallbacks when RevenueCat keys are missing.
4. Thursday, 19 March 2026
   - QA sandbox scenarios:
     - purchase success
     - purchase cancel
     - restore success/fail
     - network loss
5. Friday, 20 March 2026
   - Address QA findings and lock dark-launch checklist.
6. Saturday, 21 March 2026
   - Buffer for premium edge-case fixes.
7. Sunday, 22 March 2026
   - Freeze sprint output and prep RC week.

### Sprint 3 Exit Criteria

1. Premium flows are stable when flag ON.
2. App remains stable when premium flag OFF.
3. Rollback via feature flag is verified.

## Sprint 4 - RC Stabilization and Release Gate  
Dates: Monday 23 March 2026 - Sunday 29 March 2026

### Sprint Goal
Produce Release Candidate and complete ship/no-ship decision.

### Day-by-Day

1. Monday, 23 March 2026
   - Open RC branch.
   - Run complete automated checks.
2. Tuesday, 24 March 2026
   - Manual smoke block A:
     - onboarding
     - core turn loop
     - event selection
3. Wednesday, 25 March 2026
   - Manual smoke block B:
     - save/load/export/import
     - game over + run card
     - social/economy screens
4. Thursday, 26 March 2026
   - Manual smoke block C:
     - monetization toggles
     - premium + ads coexistence
     - settings and feature flags
5. Friday, 27 March 2026
   - Final bugfix cut.
   - Go/no-go review and RC sign-off.
6. Saturday, 28 March 2026
   - Reserve day for emergency patch only.
7. Sunday, 29 March 2026
   - Publish post-MVP backlog and close cycle.

### Sprint 4 Exit Criteria

1. All automated gates green.
2. Manual smoke checklist signed by QA.
3. No open P0/P1 bugs.

## 6. Technical Implementation Rules

1. Use small PR slices:
   - target <= 400 changed lines for logic PRs
   - separate test-only PR when contract changes are intentional
2. Branch strategy:
   - `feat/s1-ending-alignment`
   - `feat/s2-save-contract-v5`
   - `feat/s3-premium-hardening`
   - `release/rc-2026-03-27`
3. Required checks before merge:
   - `npm run typecheck`
   - `npm test -- --watch=false`
   - focused suite rerun for touched area
4. Feature flag policy:
   - risky features default OFF
   - enable only after QA pass
   - keep fast rollback path

## 7. QA and Test Strategy

### Automated Gates

1. `npm run typecheck`
2. `npm test -- --watch=false`
3. Focused suites for touched modules:
   - `__tests__/utils/endingResolver.test.ts`
   - `__tests__/utils/endingResolver.edgeCases.test.ts`
   - `__tests__/utils/gameUtilsExtended.test.ts`
   - `__tests__/utils/personalitySystem.test.ts`
   - `__tests__/analytics/experimentAssignment.test.ts`
   - `__tests__/save/SaveExportImport.test.ts`
   - `__tests__/app/AppShell.integration.test.tsx`
   - `__tests__/data/economicRecoveryEvents.test.ts`

### Manual Smoke Matrix

1. New game -> age progression -> event loop -> game over.
2. Save slot create/load/export/import and backup integrity.
3. AppShell navigation, settings, onboarding path.
4. Feature flag toggles and fallback behavior.
5. Premium purchase/restore flows in sandbox mode.

## 8. Risk Register

| Risk | Trigger | Impact | Mitigation | Owner |
| --- | --- | --- | --- | --- |
| Save contract drift | Tests expect v2 while runtime is v5 | Release delay, import breakage | Contract decision in Sprint 2 Day 1; enforce via tests | Dev A |
| Bitmask drift after flag changes | Flag set updated without analytics sync | Corrupt GA4 experiment data | Move bitmask sync to Sprint 1 and lock order with tests | Dev B |
| Premium config missing | Missing RevenueCat/AdMob keys at runtime | Runtime errors / blocked paywall | Runtime guard + fallback UI + launch checklist | Dev B |
| Late regression in AppShell | Modal/provider mismatch in tests vs runtime | Core app flow instability | Dedicated integration suite gate each sprint | Dev B |
| Scope creep | New content requests during P0 window | MVP slip | Strict cut-line enforcement, post-MVP queue | PM/Scrum |

## 9. Change Control (Scope Management)

1. Any new feature request during this window must include:
   - user value
   - business impact
   - effort estimate
   - what existing item will be removed (scope swap)
2. No unplanned P2 work enters Sprint 1 or Sprint 2.
3. Escalate blocker within same day; do not carry hidden risk to next sprint.

## 10. Deliverables by End of Plan

1. RC-ready codebase with green gates.
2. Updated contracts:
   - ending/career behavior
   - save export/import/encryption expectations
   - analytics bitmask mapping
3. Premium rollout pack:
   - feature flag strategy
   - sandbox validation report
   - rollback procedure
4. Release decision package:
   - smoke report
   - risk summary
   - ship/no-ship record

## 11. Execution Artifacts (Created During Delivery)

1. `PREMIUM_ROLLOUT_CHECKLIST_2026-03-02.md`
2. `W3-T4_PREMIUM_QA_RUNBOOK_2026-03-03.md`
3. `W3-T4_PREMIUM_QA_VALIDATION_REPORT_2026-03-03.md`
4. `W4_RELEASE_SMOKE_CHECKLIST_2026-03-03.md`
5. `W4_GO_NO_GO_TEMPLATE_2026-03-03.md`
6. `W4_RELEASE_NOTES_TEMPLATE_2026-03-03.md`
7. `MVP_EXECUTION_STATUS_2026-03-03.md`
8. `reports/qa/w3-t4-preflight-2026-03-03.md`
9. `W3-T4_CLOSURE_DECISION_2026-03-03.md`
