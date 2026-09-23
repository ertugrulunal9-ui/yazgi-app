# Premium Rollout Checklist (Sprint 3)

Created: 2 March 2026
Owner: Dev B + QA

## 1. Runtime Policy

- Gate 1: `PREMIUM_SUBSCRIPTION` feature flag must be `true`.
- Gate 2: `extra.premiumRollout.killSwitch` must be `false`.
- Gate 3: `extra.premiumRollout.purchasesEnabled` controls new purchase flow.
- Gate 4: `extra.premiumRollout.restoreEnabled` controls restore flow.

Environment overrides (highest priority):
- `EXPO_PUBLIC_PREMIUM_KILL_SWITCH`
- `EXPO_PUBLIC_PREMIUM_PURCHASES_ENABLED`
- `EXPO_PUBLIC_PREMIUM_RESTORE_ENABLED`

## 2. Fallback Rules

- Feature flag OFF: paywall actions disabled, premium operations return deterministic `premium_disabled`.
- Kill-switch ON: premium operations return deterministic `premium_kill_switch`.
- Missing RevenueCat keys: deterministic `missing_config` (no crash).
- RevenueCat SDK unavailable: deterministic `revenuecat_unavailable` (no crash).

## 3. Dark Launch Sequence

1. Deploy with `PREMIUM_SUBSCRIPTION=false`, `killSwitch=false`.
2. Validate runtime status on internal build (`getPremiumRuntimeStatus`).
3. Set `PREMIUM_SUBSCRIPTION=true` for internal audience only.
4. Keep `purchasesEnabled=false`, test restore-only path.
5. Enable `purchasesEnabled=true` after sandbox pass.
6. If incident occurs, set `killSwitch=true` and verify purchase/restore block.

## 4. QA Matrix (Minimum)

- Purchase success -> entitlement granted -> paywall closes.
- Purchase cancel -> no hard error shown.
- Purchase failure (network) -> user sees retry-safe message.
- Restore success -> entitlement granted -> paywall closes.
- Restore with no entitlement -> deterministic message.
- Flag OFF/kill-switch ON -> app remains stable and does not crash.

Executable runbook:
- `W3-T4_PREMIUM_QA_RUNBOOK_2026-03-03.md`

## 5. Exit Criteria

- Premium paths behave deterministically in happy/fail/cancel/restore scenarios.
- Kill-switch rollback validated on at least one iOS and one Android sandbox build.
- No crash path when RevenueCat keys are missing or placeholders.
