# Play Store Publish Runbook (Monetization)

Date: 5 March 2026  
Owner: Product + Dev + QA

## 1. Config Gate

Run before any production build:

```bash
npm run release:monetization:check
```

Pass criteria:
- No AdMob test app IDs
- No AdMob test unit IDs
- No placeholder (`TODO/REPLACE`) RevenueCat or AdMob values
- `eas.json` production Android build type is `app-bundle`

## 2. Internal Test Track (Google Play)

1. Build and upload production bundle:
```bash
npx eas build --platform android --profile production
npx eas submit --platform android --profile production
```
2. Add internal testers.
3. Verify purchase + restore on at least 2 Android test devices.
4. Verify rewarded + interstitial ads are real-fill and policy-safe.

Exit criteria:
- Purchase success/cancel/fail paths are deterministic
- Restore works for active subscriber
- No crashes in paywall/ad flow

## 3. Closed Test Track

1. Promote from internal to closed track.
2. Run 48h monitoring window:
- Crash-free session rate
- Purchase conversion funnel
- Ad show success rate
- Refund/cancel anomalies

Rollback policy:
- Set `EXPO_PUBLIC_PREMIUM_KILL_SWITCH=true` (or `extra.premiumRollout.killSwitch=true`) if incidents occur.

## 4. Production Rollout

1. Start staged rollout (10% -> 25% -> 50% -> 100%).
2. Increase only if KPIs and crash metrics remain within baseline.
3. Keep kill-switch and purchase gate operational for first 7 days.

## 5. Post-Launch Checks (D+1, D+3, D+7)

- RevenueCat entitlement mismatch rate
- Purchase failure rate by reason (`network_error`, `missing_config`, etc.)
- Ad eCPM / fill / no-fill trend
- Policy warnings in Play Console
