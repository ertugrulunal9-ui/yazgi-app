# W4-T2 Save Transfer Scope-Cut Decision

Date: 3 March 2026  
Owners: Scrum/PM + Dev + QA

## Decision

`Save Export/Import` is removed from MVP runtime UI in Sprint 4 stabilization.

## Why

- Android runtime showed unusable transfer modal behavior during smoke execution.
- Feature is non-critical for MVP ship criteria compared with stable save/load.
- Keeping broken or partial transfer UX introduces release risk.

## Applied Change

- Transfer entry points are hidden in save UI:
  - `src/components/SaveSlotPicker.tsx`
  - `src/components/SaveSlotCard.tsx`
- Core save/load remains enabled.
- Transfer logic/code remains in repository for post-MVP reactivation.

## MVP Policy Impact

- W4-T2 checklist marks export/import as scope-cut (deferred).
- Post-MVP backlog should include:
  1. SaveExportModal layout/runtime fix on Android and iOS
  2. Transfer UX redesign + end-to-end manual QA
  3. Re-enable transfer entry points behind explicit rollout control
