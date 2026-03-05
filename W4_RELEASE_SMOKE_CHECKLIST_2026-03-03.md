# Sprint 4 Release Smoke Checklist (W4-T2)

Date: 3 March 2026  
Owner: QA  
Window target: 23-29 March 2026

## 1. Pre-Smoke Gate

- [x] `npm run typecheck` is green
- [x] `npm test -- --watch=false` is green
- [x] Latest Sprint 3 premium QA report is attached
- [ ] RC build installed on iOS + Android

## 2. Smoke Block A (Core Progression)

- [x] New game start works
- [x] Age progression advances correctly
- [x] Event loop continues without dead-end
- [x] Game over screen renders correctly

## 3. Smoke Block B (Save and Run Lifecycle)

- [x] Save slot create works
- [x] Load existing slot works
- [x] Export slot works (scope-cut for MVP; deferred post-MVP)
- [x] Import slot works (scope-cut for MVP; deferred post-MVP)
- [x] Backup recovery path works for corrupted payload
- [x] Run card / summary renders without crash

## 4. Smoke Block C (Monetization and Flags)

- [x] Premium flag OFF state is stable
- [x] Premium flag ON purchase/restore entry is stable
- [x] Kill-switch blocks purchase/restore deterministically
- [x] Ads and premium coexistence behavior is correct
- [x] Settings feature-flag toggles do not crash app

## 5. Regression Spot Checks

- [ ] AppShell navigation and settings panel
- [ ] Onboarding flow and resume
- [ ] Social and economy screens render
- [x] Analytics events emit without runtime errors

## 6. Defect Summary

| ID | Severity | Module | Status | Owner |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

## 7. Sign-Off

- QA result: [ ] PASS [ ] FAIL
- QA owner:
- Date:
- Notes:
