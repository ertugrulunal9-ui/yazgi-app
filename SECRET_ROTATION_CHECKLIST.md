# Secret Rotation Checklist

Use this when a secret may have been committed to git or exposed in logs/build artifacts.

## Immediate Containment (Same Day)

- [ ] Revoke exposed keys immediately.
- [ ] Issue new keys/secrets from provider consoles.
- [ ] Update runtime secret stores (EAS/CI/CD/server env), not source code.
- [ ] Redeploy all affected services/apps.
- [ ] Verify old keys are rejected.

## Yazgi Targets

- [ ] `GEMINI_API_KEY` (AI integrations)
- [ ] Firebase/Google keys in mobile config (`google-services.json`, `GoogleService-Info.plist`)
- [ ] `CLOUDSYNC_JWT_HS256_SECRET` / `CLOUDSYNC_JWT_HS256_SECRETS`
- [ ] `CLOUDSYNC_ENCRYPTION_KEYS` (+ `CLOUDSYNC_ACTIVE_ENC_KEY_ID`)
- [ ] `CLOUDSYNC_REVENUECAT_SECRET_API_KEY`
- [ ] `CLOUDSYNC_REVENUECAT_WEBHOOK_SECRET`

## Post-Rotation Validation

- [ ] App login/save/monetization flows still work in staging.
- [ ] CloudSync auth fails with old JWT secret and succeeds with new one.
- [ ] RevenueCat webhook calls with old secret fail (`401`), new secret pass.
- [ ] Error logs contain no raw secrets/tokens.

## Git Hygiene

- [ ] Confirm sensitive files are ignored (`.env*`, Firebase service files).
- [ ] Remove tracked sensitive files from index (`git rm --cached ...`).
- [ ] If secrets were pushed, plan history cleanup (`git filter-repo` / BFG) and force-push with team coordination.
- [ ] Document rotation timestamp and owner in incident notes.
