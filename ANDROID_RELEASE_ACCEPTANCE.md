# Android soft-launch acceptance

Updated: 2026-10-01. Scope: ads-only Android release. Premium subscriptions,
cloud sync, and the iOS launch are outside this acceptance. Keep
`PREMIUM_SUBSCRIPTION=false` in the effective Remote Config as well as in code.

Passing automated checks does not close the three manual release gates below.
Record results for the exact candidate commit and Play versionCode, not an old
development APK or Expo Go session. Do not mark unexecuted checks PASS.

## Before building

```sh
npm ci
npm run deps:policy
npm run audit:prod
npm run typecheck:all
npm run lint
npm run test:ci -- --watchAll=false
npm run release:monetization:check
```

The native `android/` directory is tracked. Verify its manifest and Gradle
configuration, not only `app.json`. The native AdMob app ID must match the
production Android app ID in `app.json`. Analytics native collection must be
disabled by default; the app enables it only after explicit analytics opt-in.

## Gate 1: signed AAB

1. Log in to the Expo account that owns the EAS project. Inspect existing
   production builds and credentials before creating new ones.
2. From the reviewed candidate commit, run:

   ```sh
   npx eas-cli build --platform android --profile production
   ```

3. Record the EAS build ID/URL, candidate SHA, package `com.yazgi.app`,
   versionCode, AAB SHA-256, targetSdk 36, and upload-certificate SHA-256.
4. Check that the AAB is signed with the intended upload key. Source Gradle
   uses a debug signing configuration; EAS injects its signing configuration
   during the remote build. Validate the resulting artifact, not that source
   setting alone. Do not generate a replacement key for an existing Play app.
5. Upload this exact AAB to the Play internal testing track and record the
   accepted release/versionCode. Compare the upload certificate against Play
   Console's **upload** certificate, not the separate Play app-signing key.

PASS requires the signed artifact plus Play internal-track acceptance. An Expo
Android JavaScript export is insufficient. Never commit signing credentials.

## Gate 2: physical-device smoke

Install the candidate through the Play internal testing link. Record device
model, Android version, date/time, candidate SHA, and installed versionCode.
Do not clear existing user saves without backing them up or using a dedicated
test device/profile.

| Case | Expected result | Status / evidence |
| --- | --- | --- |
| Cold launch | Starts without crash or ANR | PENDING |
| Quick start and first choice | A fresh run starts and a choice works | PENDING |
| Ad consent rejected | Gameplay continues with the supported consent state | PENDING |
| Ad consent accepted | Rewarded/interstitial flow works; no reward before completion | PENDING |
| Ad dismissed / no fill | Gameplay recovers without crash or a stuck screen | PENDING |
| Save, force stop, reopen, load | The same run and progress are restored | PENDING |
| End of run | Summary works; notification prompt follows explicit user action | PENDING |
| Effective launch flags | Premium subscription UI remains dark | PENDING |

Attach screenshots/video and relevant crash logs. Distinguish no-fill from an
integration failure; repeat unverified ad-display paths on a configured tester
device. Preserve failed cases and their resolution history.

## Gate 3: analytics arrival and ordering

This is the project's P0 measurement acceptance, separate from Play upload
requirements. Use the same signed candidate on one dedicated test device and
one fresh run. Dashboard results must be recorded by an operator with Firebase
Analytics access.

1. Enable DebugView for the connected device:

   ```sh
   adb shell setprop debug.firebase.analytics.app com.yazgi.app
   ```

2. With analytics opt-in OFF, cold launch and start a run. Confirm the four
   custom funnel events below are absent; also inspect native automatic
   collection before opt-in. Ad consent is separate from analytics opt-in.
3. Enable analytics in Settings, force stop, and relaunch. Start one fresh
   Quick Start run. Select a meaningful choice and play through a known
   scheduled follow-up. Do not inject development events as release proof.
4. In Firebase Analytics > DebugView, select this device and record the
   chronological event stream and parameter details:

   | Event | Required fields / acceptance |
   | --- | --- |
   | `app_open` | `privacy_scope=analytics_opt_in`; once for this launch |
   | `quick_start` | `used_existing_character`, `start_age` |
   | `first_choice` | `event_id`, `choice_index`, `age`, `turn`, finite nonnegative `elapsed_ms`; once for this fresh run |
   | `delayed_consequence_seen` | Correct `source_event_id`, `target_event_id`, `age`, `turn` for the displayed follow-up |

   Filter `app_open` to `privacy_scope=analytics_opt_in` to distinguish the
   custom funnel opening from Firebase automatically collected app-open events.
   The four custom events must arrive in that order without missing steps or
   unexpected duplicates. Extra unrelated telemetry is allowed. Capture device event times
   and the observed opening-to-first-choice duration. `elapsed_ms` currently
   measures the gameplay hook's first-choice window, so it alone does not prove
   opening-to-choice time below 90 seconds.
5. Disable analytics and repeat actions; verify subsequent custom events stop.
6. Remove device debug mode after the test:

   ```sh
   adb shell setprop debug.firebase.analytics.app .none.
   ```

PASS requires observed dashboard arrival/order and opt-in/off evidence. Wrapper
tests and device logs alone are insufficient. The current event schema has no
persisted run ID; this controlled single-run check does not establish correct
attribution across multiple runs or resumed sessions. Track run correlation as
a separate measurement follow-up if that reporting is needed.

## Record the decision

Create a dated report under `reports/qa/` with all three gate results, evidence
links, reviewer, build identifiers, and unresolved defects. Leave any unobserved
gate PENDING/BLOCKED and withhold the production rollout until the three gates
pass. Use the reviewed rollout procedure for closed testing and staged release.

## Dependency follow-up

Expo SDK migration remains separate from this release. Inventory each active
advisory and its dependency path, verify the target SDK's compatibility, and
remove allowlist entries only after a fresh audit proves they are no longer
needed. Keep the audit gate active; do not use `npm audit fix --force`.

References:
- https://docs.expo.dev/build-reference/android-builds/
- https://firebase.google.com/docs/analytics/debugview
- https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/
