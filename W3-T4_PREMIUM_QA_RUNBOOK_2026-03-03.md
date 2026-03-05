# Sprint 3 - W3-T4 Premium QA Runbook (Executable)

Created: 3 March 2026  
Owner: QA (primary), Dev B (support), Dev A (runtime config support)  
Scope: Sprint 3 / W3-T4 `Premium QA matrix`

## 1. Objective

Validate premium monetization flow in sandbox with deterministic outcomes for:
- purchase success
- purchase cancel
- purchase fail (network)
- restore success/fail
- feature-flag OFF behavior
- kill-switch rollback behavior
- missing config safety (no crash)

Done when:
- all P0 test cases pass on iOS + Android
- no crash path exists in premium flow
- rollback controls (`PREMIUM_SUBSCRIPTION`, `killSwitch`) are verified

## 2. Test Environments

| Env ID | Platform | Build Type | Purpose |
| --- | --- | --- | --- |
| E1 | iOS | Internal sandbox build | Primary purchase/restore verification |
| E2 | Android | Internal sandbox build | Cross-platform verification |
| E3 | Local dev client | Dev feature-flag toggles + fast retest | Regression confirmation |

Required accounts/resources:
- 1 sandbox account with active subscription history
- 1 sandbox account without active subscription
- Network throttle/offline tool (or device airplane mode)
- Access to remote feature flag controls (or dev overrides)

## 3. Runtime Control Matrix

Use this matrix to set gates before each case.

| Profile | `PREMIUM_SUBSCRIPTION` | `killSwitch` | `purchasesEnabled` | `restoreEnabled` | RevenueCat Key |
| --- | --- | --- | --- | --- | --- |
| C0-FLAG-OFF | false | false | true | true | valid |
| C1-HAPPY | true | false | true | true | valid |
| C2-PURCHASE-BLOCK | true | false | false | true | valid |
| C3-RESTORE-BLOCK | true | false | true | false | valid |
| C4-KILL-SWITCH | true | true | true | true | valid |
| C5-MISSING-CONFIG | true | false | true | true | missing or placeholder |

## 4. Pre-Run Gate (Execute First)

1. Pull latest Sprint 3 branch and install dependencies.
2. Run automated gate commands:

```bash
npm run typecheck
npm test -- --watch=false __tests__/services/subscriptionManager.test.ts __tests__/services/monetization.test.ts __tests__/config/featureFlags.test.ts
```

Alternative single command:

```bash
npm run qa:w3t4:preflight
```

3. Confirm build opens and app reaches main menu on both platforms.
4. Confirm `app.json` premium rollout config exists:
   - `extra.premiumRollout.killSwitch`
   - `extra.premiumRollout.purchasesEnabled`
   - `extra.premiumRollout.restoreEnabled`

If step 2 fails, stop manual run and open blocker issue.

## 5. Executable Test Cases

## P0 Cases (Mandatory)

### TC-P0-01 Purchase Success

Setup:
- Apply profile `C1-HAPPY`
- Use sandbox account without active premium

Steps:
1. Launch app and open Settings.
2. Tap `Yazgi Premium` to open paywall.
3. Select monthly package.
4. Complete purchase in sandbox dialog.
5. Return to app.

Expected:
- Paywall closes automatically.
- Premium state becomes active.
- No error banner shown.
- Ads/premium-dependent UI path reflects premium state.

Evidence:
- Screenshot of pre-purchase paywall
- Screenshot of post-purchase premium-active state
- Timestamp + device/platform in report

### TC-P0-02 Purchase Cancel

Setup:
- Apply profile `C1-HAPPY`
- Use sandbox account without active premium

Steps:
1. Open paywall.
2. Start purchase flow.
3. Cancel from store dialog.

Expected:
- App does not crash.
- No hard failure modal/toast for cancel.
- Paywall stays usable for retry.

Evidence:
- Video/screenshot showing cancel return path
- Note that no blocking error appears

### TC-P0-03 Purchase Network Failure

Setup:
- Apply profile `C1-HAPPY`
- Disable network before confirming purchase (airplane mode)

Steps:
1. Open paywall.
2. Start purchase.
3. Trigger network loss before completion.

Expected:
- App remains responsive.
- User receives retry-safe error text.
- No premium entitlement is granted.

Evidence:
- Screenshot of network error state
- Confirmation that premium remains inactive

### TC-P0-04 Restore Success

Setup:
- Apply profile `C1-HAPPY`
- Use sandbox account with active premium history

Steps:
1. Open paywall.
2. Tap `Restore Purchases`.

Expected:
- Restore returns success.
- Premium state becomes active.
- Paywall closes automatically.

Evidence:
- Screenshot before restore
- Screenshot after restore (premium active)

### TC-P0-05 Restore No Active Subscription

Setup:
- Apply profile `C1-HAPPY`
- Use sandbox account with no active premium

Steps:
1. Open paywall.
2. Tap `Restore Purchases`.

Expected:
- Deterministic no-subscription message shown.
- App remains stable.
- Premium remains inactive.

Evidence:
- Screenshot of message
- Premium inactive confirmation

### TC-P0-06 Feature Flag OFF Safety

Setup:
- Apply profile `C0-FLAG-OFF`

Steps:
1. Relaunch app.
2. Open Settings.
3. Verify premium entry visibility/behavior.
4. If premium UI is reachable, trigger purchase/restore action.

Expected:
- Premium flow is blocked safely.
- No crash.
- Error behavior is deterministic (`premium_disabled`).

Evidence:
- Screenshot of settings/paywall state with flag OFF

### TC-P0-07 Kill-Switch Rollback

Setup:
- Apply profile `C4-KILL-SWITCH`

Steps:
1. Relaunch app.
2. Open paywall.
3. Attempt purchase.
4. Attempt restore.

Expected:
- Purchase/restore blocked deterministically.
- User sees temporary unavailable state.
- App remains stable.

Evidence:
- Screenshot of blocked purchase and restore path

### TC-P0-08 Missing Config Safety

Setup:
- Apply profile `C5-MISSING-CONFIG`
- Remove env keys or keep placeholder keys

Steps:
1. Relaunch app.
2. Open paywall.
3. Attempt purchase and restore.

Expected:
- No crash.
- Deterministic store/config unavailable behavior.
- Premium not granted.

Evidence:
- Screenshot of config/store unavailable message

## P1 Cases (Should Pass in Sprint 3)

### TC-P1-01 Purchases Disabled Gate

Setup:
- Apply profile `C2-PURCHASE-BLOCK`

Steps:
1. Open paywall.
2. Attempt purchase.
3. Attempt restore.

Expected:
- Purchase blocked (`purchases_disabled`).
- Restore remains available.

### TC-P1-02 Restore Disabled Gate

Setup:
- Apply profile `C3-RESTORE-BLOCK`

Steps:
1. Open paywall.
2. Attempt restore.
3. Attempt purchase.

Expected:
- Restore blocked (`restore_disabled`).
- Purchase remains available.

### TC-P1-03 App Restart Persistence

Setup:
- First complete successful purchase or restore

Steps:
1. Kill app process fully.
2. Relaunch app.
3. Check premium-dependent UI.

Expected:
- Premium state is reloaded correctly.
- No duplicate purchase prompts for active premium user.

## 6. Defect Logging Rules

Severity mapping:
- P0: crash, frozen UI, wrong entitlement grant, rollback not working
- P1: incorrect error message, action lock mismatch, recoverable flow break
- P2: cosmetic text/layout issue

Each defect ticket must include:
- Test Case ID (e.g., `TC-P0-03`)
- Platform + OS version + build number
- Profile used (e.g., `C4-KILL-SWITCH`)
- Repro steps (copy from this runbook + delta)
- Expected vs actual
- Screenshot/video evidence

## 7. Test Report Template

Use this block for final Sprint 3 sign-off report.

```md
# Sprint 3 W3-T4 QA Report
Date:
Tester:
Build:
Platforms:

## Summary
- Passed:
- Failed:
- Blocked:

## P0 Cases
- TC-P0-01: PASS/FAIL (evidence)
- TC-P0-02: PASS/FAIL (evidence)
- TC-P0-03: PASS/FAIL (evidence)
- TC-P0-04: PASS/FAIL (evidence)
- TC-P0-05: PASS/FAIL (evidence)
- TC-P0-06: PASS/FAIL (evidence)
- TC-P0-07: PASS/FAIL (evidence)
- TC-P0-08: PASS/FAIL (evidence)

## P1 Cases
- TC-P1-01: PASS/FAIL (evidence)
- TC-P1-02: PASS/FAIL (evidence)
- TC-P1-03: PASS/FAIL (evidence)

## Open Defects
- [ID] severity / owner / ETA

## Go / No-Go Recommendation
- GO or NO-GO
- Notes:
```

Result processing (recommended):

1. Fill `reports/qa/w3-t4-manual-results-input.json` with PASS/FAIL/BLOCKED values and evidence paths.
2. Generate merged manual report and update validation report:

```bash
npm run qa:w3t4:manual:report
```

Generated artifacts:
- `reports/qa/w3-t4-manual-results-latest.md`
- `W3-T4_PREMIUM_QA_VALIDATION_REPORT_2026-03-03.md` (manual section auto-updated)

## 8. Exit Criteria (W3-T4 Complete)

W3-T4 is complete only if:
1. All P0 cases pass on iOS and Android.
2. No open P0 defect remains.
3. Rollback controls (`flag OFF`, `killSwitch ON`) are verified with evidence.
4. QA report is shared with Dev B + Scrum owner.
