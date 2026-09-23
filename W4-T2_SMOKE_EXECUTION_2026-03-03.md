# W4-T2 Smoke Execution Report

Date: 3 March 2026  
Owner: QA + Dev

## 1. Pre-Smoke Gate

- [x] `npm run typecheck` is green
- [x] `npm test -- --watch=false` is green
- [x] Latest Sprint 3 premium QA report is attached (`W3-T4_PREMIUM_QA_VALIDATION_REPORT_2026-03-03.md`)
- [ ] RC build installed on iOS + Android (Android: started, iOS: pending confirmation)

Evidence:

```bash
npm run typecheck
npm test -- --watch=false
```

Result snapshot:
- Typecheck: PASS
- Jest full suite: PASS (105/105 suites, 1252/1252 tests)
- Save export/import compatibility suite: PASS (`__tests__/save/SaveExportImport.test.ts`)

## 2. Smoke Block A (Core Progression)

| Case | Android | iOS | Evidence | Notes |
| --- | --- | --- | --- | --- |
| New game start works | PASS | PENDING | Runtime log session (2026-03-03 07:26-07:47) | Session started normally; HUB/EVENT flow active. |
| Age progression advances correctly | PASS | PENDING | Runtime log session (2026-03-03 07:26-07:47) | Age moved from 8 -> 9 at turn transition (turn 19 -> 20). |
| Event loop continues without dead-end | PASS | PENDING | Runtime log session (2026-03-03 07:26-07:47) | Consecutive `advanceTurnInContext` and `event_completed` entries observed. |
| Game over screen renders correctly | PASS | PENDING | Runtime log session (2026-03-03 18:18) + chat screenshot evidence | `game_ended` analytics event and `phase: GAME_OVER` transition observed; screen rendered without crash. |

## 3. Smoke Block B (Save and Run Lifecycle)

| Case | Android | iOS | Evidence | Notes |
| --- | --- | --- | --- | --- |
| Save slot create works | PASS | PENDING | QA runtime confirmation (2026-03-03) | Save/Load flow reported as working on Android. |
| Load existing slot works | PASS | PENDING | QA runtime confirmation (2026-03-03) | Save/Load flow reported as working on Android. |
| Export slot works | SCOPE_CUT_MVP | SCOPE_CUT_MVP | `src/components/SaveSlotPicker.tsx`, `src/components/SaveSlotCard.tsx` | Save transfer UI removed from MVP; post-MVP feature. |
| Import slot works | SCOPE_CUT_MVP | SCOPE_CUT_MVP | `src/components/SaveSlotPicker.tsx`, `src/components/SaveSlotCard.tsx` | Save transfer UI removed from MVP; post-MVP feature. |
| Backup recovery path works for corrupted payload | PASS | PENDING | Runtime log (2026-03-03 18:36) | `integrity signature mismatch -> attempting restore from backup` observed; app continued without crash. |
| Run card / summary renders without crash | PASS | PENDING | Game over screenshot evidence (chat, 2026-03-03) | End screen summary panel rendered fully without crash. |

## 4. Smoke Block C (Monetization and Flags)

| Case | Android | iOS | Evidence | Notes |
| --- | --- | --- | --- | --- |
| Premium flag OFF state is stable | PASS | PENDING | QA runtime confirmation (2026-03-03) | No crash/hang observed with premium disabled path. |
| Premium flag ON purchase/restore entry is stable | PASS | PENDING | QA runtime confirmation (2026-03-03) | Entry flow opens/stays stable in runtime toggles. |
| Kill-switch blocks purchase/restore deterministically | PASS | PENDING | QA runtime confirmation (2026-03-03) | Kill-switch behavior reported deterministic in smoke run. |
| Ads and premium coexistence behavior is correct | PASS | PENDING | QA runtime confirmation (2026-03-03) | No runtime conflict/crash reported. |
| Settings feature-flag toggles do not crash app | PASS | PENDING | QA runtime confirmation (2026-03-03) | Dev flag toggles are stable in settings panel. |

## 5. Regression Spot Checks

| Case | Android | iOS | Evidence | Notes |
| --- | --- | --- | --- | --- |
| AppShell navigation and settings panel | PENDING | PENDING | - | - |
| Onboarding flow and resume | PENDING | PENDING | - | - |
| Social and economy screens render | PENDING | PENDING | - | - |
| Analytics events emit without runtime errors | PASS | PENDING | Runtime log session (2026-03-03 07:26-07:47) | Analytics stream active; no runtime exception observed. |

## 6. Defect Summary

| ID | Severity | Module | Status | Owner |
| --- | --- | --- | --- | --- |
| QA-P0-01 | P0 | Premium / Store setup | Deferred (post-MVP activation) | Dev B |
| QA-P1-02 | P1 | Save Export/Import (Android) | Closed by MVP scope-cut | Dev A |

## 7. Run Observations

- `EventValidation` tag-depth and missing-tag warnings are content-quality warnings; no crash or dead-end behavior observed in this run.
- Analytics stream is stable in runtime, but duplicate `achievement_unlocked` emits in the same timestamp window should be reviewed in post-smoke analytics sanity check.
- `Slot 1 checksum mismatch detected, attempting checksum repair` was observed and auto-recovered; no crash observed (watch as P2 unless data loss is reproduced).
- Save Export/Import UI is removed for MVP to reduce release risk; save/load path remains active.
