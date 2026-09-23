# W3-T4 Closure Decision (MVP Scope Cut)

Date: 3 March 2026  
Owners: Scrum/PM + Dev B + QA  
Related items: `W3-T4`, `QA-P0-01`

## 1. Decision

W3-T4 is closed for MVP with a scope cut:
- Premium purchase/restore **success-path sandbox validation** is deferred.
- MVP release will keep `PREMIUM_SUBSCRIPTION=false` by default.
- Premium can be enabled only after deferred store validation is complete.

## 2. Why Scope Cut Was Needed

- No active store distribution setup yet (Google Play Internal / TestFlight path incomplete).
- RevenueCat app keys in `app.json` are placeholders; runtime hits store-unavailable guard.
- Android runtime evidence confirms deterministic fail-safe behavior (`QA-P0-01`).

## 3. What Is Verified (Accepted for MVP)

1. Engineering gates are green for premium hardening code.
2. Deterministic guards are covered in automated tests:
   - `premium_disabled`
   - `premium_kill_switch`
   - `missing_config`
3. Runtime manual evidence confirms no crash in missing-config/store-unavailable scenario.

## 4. Deferred (Post-MVP) Validation

- TC-P0-01 Purchase success (iOS + Android)
- TC-P0-02 Purchase cancel (iOS + Android)
- TC-P0-03 Purchase network fail (iOS + Android)
- TC-P0-04 Restore success (iOS + Android)
- TC-P0-05 Restore no-active (iOS + Android)
- P1 premium flow stability scenarios on real store test channels

## 5. Release Policy Until Deferred Items Close

- `PREMIUM_SUBSCRIPTION` remains OFF in production.
- Rollback controls remain ready (`killSwitch`, purchase/restore gates).
- Go/No-Go for MVP uses premium fallback stability, not premium sales activation.

## 6. Re-Open Trigger

Re-open W3-T4 deferred block when both are ready:
1. Store test channels configured (Google Play Internal + TestFlight/sandbox).
2. Valid platform SDK keys (`goog_...`, `appl_...` or approved test-store strategy) injected in build/runtime.
