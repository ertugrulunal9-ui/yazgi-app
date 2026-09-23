# Phase 7 i18n Validation Report

Date: 2026-02-26  
Scope: Missing key, fallback chain, screen smoke, text overflow, CI gate

## 1) Missing Key / Parity

- TR leaf keys: `1282`
- EN leaf keys: `3560`
- Missing in EN (TR baseline): `0` ✅
- Missing in TR (EN-only keys): `2278` (expected due EN event override/generated coverage)

Source:
- `__tests__/i18n/Phase7I18nValidation.test.ts` (`keeps EN leaf-key coverage for all TR leaf keys`)

## 2) Fallback Chain + Runtime Missing-Key Warning

- EN->TR fallback behavior: ✅
  - Synthetic TR-only key probe returned TR fallback when EN key was absent.
- Missing-key runtime warning behavior: ✅
  - Fallback chain exhausted case logged warning once (deduplicated).

Source:
- `__tests__/i18n/Phase7I18nValidation.test.ts`

## 3) Screen Smoke (EN Locale)

Validated screens:
- MainMenuScreen ✅
- GameScreen ✅
- SocialScreen ✅
- ReportCardScreen ✅
- SaveSlotPicker ✅

Sources:
- `__tests__/components/Phase7ScreenSmoke.test.tsx`
- `__tests__/components/SocialLocaleSmoke.test.tsx`

## 4) Text Overflow Check

- Scoped EN UI strings (`app/save/social/exams/game/...`) max length: `84`
- Threshold: `<= 90` ✅
- Additional long-string smoke:
  - SaveSlotPicker title rendered with intentionally long EN string without crash ✅

Source:
- `__tests__/i18n/Phase7I18nValidation.test.ts`
- `__tests__/components/Phase7ScreenSmoke.test.tsx`

## 5) CI/Test Commands

Executed:

```bash
npx jest --runInBand __tests__/i18n/Phase7I18nValidation.test.ts __tests__/components/Phase7ScreenSmoke.test.tsx __tests__/components/SocialLocaleSmoke.test.tsx
npm run typecheck -- --pretty false
```

Results:
- Jest: `3` suites, `13` tests passed
- Typecheck: pass

Additional note:
- `npm run typecheck:tests` currently fails due pre-existing unrelated test typing issues
  (`P0CriticalScenarios`, `achievementSystem`, `TurnMediator`), not introduced by Phase 7 changes.

## Risks / Decision

- Residual risk: pixel-perfect truncation on real devices still requires manual visual pass (different font scales and screen widths).
- Blocking issue: none found in automated Phase 7 scope.
- Ship decision: **GO**.
