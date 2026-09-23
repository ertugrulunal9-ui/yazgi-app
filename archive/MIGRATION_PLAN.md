# Local-First to CloudSync Migration Plan

Status: Local-Only Active  
Last Updated: 2026-02-17

## 1. Current Decision

CloudSync is intentionally disabled for cost control.  
Production path is local-first:

- AsyncStorage persistence
- JSON export/import for transfer
- backup history for rollback/recovery
- CloudSync-ready metadata in save schema

## 2. Phase Plan

## Phase A (Now): Harden Local Save

Goals:

- reliable local persistence
- portable export/import
- corruption recovery via backups

Checklist:

- [x] save metadata includes migration-ready fields
- [x] export package includes manifest + backups
- [x] import supports legacy and new formats
- [x] backup retention policy (5 entries)
- [x] schema validation and checksum flow

Exit criteria:

- local save/load stable across app restart
- transfer between two devices works using JSON

## Phase B (Pre-Cloud Preparation)

Goals:

- keep API contract ready without running backend infra
- avoid future breaking change in client format

Checklist:

- [x] `API_SPEC.md` draft exists
- [ ] define auth token provider decision (Firebase/custom)
- [ ] define entitlement source of truth for purchases
- [ ] decide conflict policy (`last-write-wins` vs revision conflict)

Exit criteria:

- no schema redesign required to start backend.

## Phase C (CloudSync Beta)

Goals:

- limited rollout with authenticated users only.

Checklist:

- [ ] auth required for all sync operations
- [ ] ownership checks enforced server-side (`token.sub`)
- [ ] rate limit and payload limit enabled
- [ ] soft delete + delete-all user flow
- [ ] telemetry for sync failures and conflicts

Exit criteria:

- beta users can restore saves on a new device with acceptable failure rate.

## Phase D (CloudSync Production)

Goals:

- secure, observable, recoverable sync in production.

Checklist:

- [ ] prod database with encryption-at-rest
- [ ] audit trail for write/delete operations
- [ ] key rotation policy documented and tested
- [ ] HSTS and strict TLS posture on public endpoints
- [ ] privacy/retention docs aligned with KVKK/GDPR

Exit criteria:

- security and compliance baseline approved.

## 3. Client Migration Strategy

When CloudSync becomes available:

1. keep local save as source of truth until first successful sync.
2. upload local save with `revision/clientRevision/idempotencyKey`.
3. store returned server revision.
4. continue dual-write (local + cloud) during rollout window.
5. only switch to cloud-preferred read path after stable sync metrics.

## 4. Risk Notes

- Local storage can be modified on rooted/jailbroken devices.
- Export JSON can be edited manually; validation reduces but does not remove this risk.
- Without server-authoritative entitlement, monetization abuse risk remains medium.

## 5. Trigger to Start CloudSync Work

Start Phase C when one of these thresholds is met:

- active user count exceeds current support limit for manual transfer UX
- measurable churn from device-switch loss
- support burden from save recovery exceeds acceptable level

