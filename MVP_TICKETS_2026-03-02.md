# Yazgi MVP Ticket Backlog (Auto Split)

Source: `MVP_IMPLEMENTATION_PLAN_2026-03-02.md`  
Created: 2 March 2026

## Sprint 1 (2 Mar 2026 - 8 Mar 2026)

| Ticket | Priority | Estimate | Owner | Depends On | Summary |
| --- | --- | --- | --- | --- | --- |
| YAZGI-MVP-001 | P1 | 0.5d | Dev A + Dev B | - | Causal failure mapping for all failing suites |
| YAZGI-MVP-002 | P1 | 0.5h | Dev A | YAZGI-MVP-001 | Secret ending threshold test sync |
| YAZGI-MVP-003 | P1 | 0.25h | Dev B | YAZGI-MVP-001 | personalitySystem breakdown expectation sync |
| YAZGI-MVP-004 | P1 | 0.25h | Dev B | YAZGI-MVP-001 | economicRecoveryEvents test sync |
| YAZGI-MVP-005 | P1 | 0.5d | Dev B | YAZGI-MVP-001 | AppShell modal import and renderer fix |
| YAZGI-MVP-006 | P2 | 0.5d | Dev B | YAZGI-MVP-001 | Bitmask sync between featureFlags and experimentBucketing |
| YAZGI-MVP-007 | P3 | 1.5d | Dev A | YAZGI-MVP-002 | endingResolver and career scoring alignment |
| YAZGI-MVP-008 | P1 | 0.5d | Dev A + Dev B + QA | YAZGI-MVP-002..007 | Sprint 1 gate run and <=4 failing suites target |

## Sprint 2 (9 Mar 2026 - 15 Mar 2026)

| Ticket | Priority | Estimate | Owner | Depends On | Summary |
| --- | --- | --- | --- | --- | --- |
| YAZGI-MVP-009 | P4 | 0.5d | Dev A + QA | YAZGI-MVP-008 | Save export/import contract decision (v5 authority) |
| YAZGI-MVP-010 | P4 | 0.5d | Dev A | YAZGI-MVP-009 | Save encryption/export suite closure |
| YAZGI-MVP-011 | P1 | 1.0d | Dev A + Dev B + QA | YAZGI-MVP-010 | Full suite gate to green |

## Sprint 3 (16 Mar 2026 - 22 Mar 2026)

| Ticket | Priority | Estimate | Owner | Depends On | Summary |
| --- | --- | --- | --- | --- | --- |
| YAZGI-MVP-012 | P2 | 0.5d | Dev B | YAZGI-MVP-011 | Premium rollout design with kill switch |
| YAZGI-MVP-013 | P2 | 2.0d | Dev B | YAZGI-MVP-012 | Paywall and purchase flow hardening |
| YAZGI-MVP-014 | P2 | 1.0d | Dev A | YAZGI-MVP-012 | Runtime config hardening for revenue and ads |
| YAZGI-MVP-015 | P2 | 1.5d | QA | YAZGI-MVP-013, YAZGI-MVP-014 | Premium QA matrix and sandbox validation |

## Sprint 4 (23 Mar 2026 - 29 Mar 2026)

| Ticket | Priority | Estimate | Owner | Depends On | Summary |
| --- | --- | --- | --- | --- | --- |
| YAZGI-MVP-016 | P1 | 2.0d | Dev A + Dev B | YAZGI-MVP-015 | RC stabilization bugfix batch |
| YAZGI-MVP-017 | P1 | 1.5d | QA | YAZGI-MVP-016 | Release checks and full smoke |
| YAZGI-MVP-018 | P1 | 0.5d | Dev A + QA | YAZGI-MVP-017 | Release notes and go/no-go decision |

## Ticket Details

### YAZGI-MVP-001
- Type: Spike
- Description: Map each failing suite to root cause cluster and assign owner.
- Acceptance Criteria:
  - Failing suites grouped by root cause, not linear list.
  - Each cluster has one owner and one target fix ticket.
  - Mapping doc linked in sprint board.

### YAZGI-MVP-002
- Type: Task
- Description: Align secret ending thresholds and current test expectations.
- Acceptance Criteria:
  - `__tests__/utils/endingResolver.test.ts` and `__tests__/utils/endingResolver.edgeCases.test.ts` pass.
  - No forced downgrade in non-secret ending paths.

### YAZGI-MVP-003
- Type: Task
- Description: Sync personality breakdown expectation with current formula.
- Acceptance Criteria:
  - `__tests__/utils/personalitySystem.test.ts` passes.
  - Expected risk values documented in test comment.

### YAZGI-MVP-004
- Type: Task
- Description: Sync economic recovery tests with current event catalog.
- Acceptance Criteria:
  - `__tests__/data/economicRecoveryEvents.test.ts` passes.
  - Assertions check invariants, not stale fixed count if intentional.

### YAZGI-MVP-005
- Type: Bug
- Description: Fix AppShell integration failure caused by modal import/render mismatch.
- Acceptance Criteria:
  - `__tests__/app/AppShell.integration.test.tsx` passes.
  - Runtime app flow for modal paths still works.

### YAZGI-MVP-006
- Type: Task
- Description: Align bitmask format and order with active feature flag list.
- Acceptance Criteria:
  - `__tests__/analytics/experimentAssignment.test.ts` passes.
  - Bitmask contract length/order documented in code.

### YAZGI-MVP-007
- Type: Task
- Description: Align endingResolver and career scoring with current game balancing.
- Acceptance Criteria:
  - `__tests__/utils/gameUtilsExtended.test.ts` passes.
  - ending/career outputs remain coherent in Turkish locale.

### YAZGI-MVP-008
- Type: QA Gate
- Description: Run Sprint 1 consolidated quality gate.
- Acceptance Criteria:
  - `npm run typecheck` passes.
  - Failing suite count is `<=4`.
  - No new P0 regression.

### YAZGI-MVP-009
- Type: Decision
- Description: Lock save contract authority for v5 export/import and encryption behavior.
- Acceptance Criteria:
  - Explicit decision recorded for export version and encryption prefix expectations.
  - Team sign-off (Dev A + QA).

### YAZGI-MVP-010
- Type: Task
- Description: Implement save/export/encryption changes based on locked contract.
- Acceptance Criteria:
  - `__tests__/save/SaveExportImport.test.ts` passes.
  - Backward import behavior verified.

### YAZGI-MVP-011
- Type: QA Gate
- Description: Reach full green baseline.
- Acceptance Criteria:
  - `npm run typecheck` passes.
  - `npm test -- --watch=false` passes.

### YAZGI-MVP-012
- Type: Task
- Description: Define premium rollout strategy with safe rollback.
- Acceptance Criteria:
  - Rollout plan includes default OFF, staged exposure, rollback trigger.

### YAZGI-MVP-013
- Type: Task
- Description: Harden purchase, cancel, restore, and fail flows in paywall/subscription.
- Acceptance Criteria:
  - Happy/fail/cancel/restore flows deterministic.
  - No crash on unavailable RevenueCat runtime.

### YAZGI-MVP-014
- Type: Task
- Description: Harden runtime config resolution for RevenueCat and AdMob.
- Acceptance Criteria:
  - Missing keys do not crash app.
  - Error path gives controlled fallback behavior.

### YAZGI-MVP-015
- Type: QA
- Description: Execute premium sandbox matrix and record evidence.
- Acceptance Criteria:
  - Matrix includes purchase success/cancel/fail/restore/network-loss.
  - Sign-off report attached.

### YAZGI-MVP-016
- Type: Task
- Description: Execute RC stabilization bugfix batch.
- Acceptance Criteria:
  - No open P0/P1 defects for RC scope.

### YAZGI-MVP-017
- Type: QA Gate
- Description: Execute release smoke checks.
- Acceptance Criteria:
  - Core loop, save/load, monetization toggle checks pass.
  - Smoke report signed by QA.

### YAZGI-MVP-018
- Type: Release
- Description: Produce release notes and go/no-go decision.
- Acceptance Criteria:
  - Ship/no-ship decision documented.
  - RC notes and known issues list completed.
