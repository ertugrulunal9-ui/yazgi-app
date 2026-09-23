# Branch Protection Checklist (Required Check: `p0_p1_critical`)

This checklist makes the critical CI job mandatory before merge.

## 1) Preconditions
- `main` (or target branch) must have at least one recent workflow run.
- In Actions, confirm job exists in `.github/workflows/ci.yml`:
  - Job id: `p0_p1_critical`
- If no run exists, trigger CI once from `main`.

## 2) Create or edit branch protection rule
1. Go to GitHub repo -> `Settings` -> `Branches`.
2. Under `Branch protection rules`, click `Add rule` (or edit existing).
3. Set `Branch name pattern` (example: `main`).

## 3) Enable merge gates
1. Enable `Require a pull request before merging`.
2. Optional but recommended:
   - `Require approvals` (at least `1`)
   - `Dismiss stale pull request approvals when new commits are pushed`
   - `Require review from Code Owners`

## 4) Add required status checks
1. Enable `Require status checks to pass before merging`.
2. In the checks list, select the critical check context exactly as shown:
   - `p0_p1_critical` or `CI / p0_p1_critical` (UI can differ)
3. Recommended: also select `quality`.
4. Recommended: enable `Require branches to be up to date before merging`.

## 5) Anti-bypass hardening
1. Enable `Do not allow bypassing the above settings`.
2. Enable `Include administrators`.

## 6) Validate
1. Save rule.
2. Open a test PR to `main`.
3. Confirm merge is blocked until `p0_p1_critical` passes.

## Troubleshooting
- Check not listed:
  - The workflow may not have run on target branch in the last 7 days.
  - Trigger a run on `main`, then reopen rule editor.
- Wrong check name selected:
  - Required check context must match GitHub UI text exactly.
- Job renamed later:
  - Update required check selection after changes in `.github/workflows/ci.yml`.

## Maintenance tip
- If you convert to GitHub `Rulesets`, apply the same required-check logic there too.
