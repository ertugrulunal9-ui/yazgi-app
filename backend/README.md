# CloudSync Backend

This folder contains a hardened CloudSync backend implementation aligned with `API_SPEC.md`.

## Run

```bash
npm run cloudsync:server
```

Default bind:

- host: `0.0.0.0`
- port: `8787`

Health check:

```bash
curl http://localhost:8787/health
```

## Required Environment (production)

- `CLOUDSYNC_JWT_HS256_SECRET` or `CLOUDSYNC_JWT_HS256_SECRETS` (JWT signature secret(s))
- `CLOUDSYNC_JWT_ISSUERS` (comma-separated issuer allowlist)
- `CLOUDSYNC_JWT_AUDIENCES` (comma-separated audience allowlist)
- `CLOUDSYNC_ENCRYPTION_KEYS` (comma-separated `kid:base64_32byte_key` entries)
- `CLOUDSYNC_ACTIVE_ENC_KEY_ID` (active encryption key id for writes)

Optional:

- `PORT`
- `HOST`
- `CLOUDSYNC_MAX_BODY_BYTES` (default: `524288`)
- `CLOUDSYNC_SOFT_DELETE` (`true` by default)
- `CLOUDSYNC_ALLOW_DEV_TOKENS` (`false` by default)
- `CLOUDSYNC_REQUIRE_TLS` (`true` by default)
- `CLOUDSYNC_ENABLE_HSTS` (`true` by default)
- `CLOUDSYNC_TRUST_PROXY` (`true` by default)
- `CLOUDSYNC_DB_PATH` (default: `backend/data/cloudsync.store.enc.json`)
- `CLOUDSYNC_AUDIT_LOG_PATH` (default: `backend/data/cloudsync.audit.log`)
- `CLOUDSYNC_REVENUECAT_SECRET_API_KEY` (for `/v1/entitlements/refresh`)
- `CLOUDSYNC_REVENUECAT_WEBHOOK_SECRET` (for `/v1/webhooks/revenuecat`)
- `CLOUDSYNC_ENTITLEMENT_MAP` (optional entitlement mapping override, `entitlement=product`)

## Dev Token Mode

For local testing only:

1. set `CLOUDSYNC_ALLOW_DEV_TOKENS=true`
2. use `Authorization: Bearer dev_<user-sub>`

Example:

```bash
curl -X GET \
  -H "Authorization: Bearer dev_test-user-1" \
  http://localhost:8787/v1/saves/1
```

## Implemented Endpoints

- `GET /health`
- `GET /v1/saves`
- `PUT /v1/saves/{slotId}`
- `GET /v1/saves/{slotId}`
- `DELETE /v1/saves/{slotId}`
- `DELETE /v1/saves`
- `GET /v1/entitlements`
- `POST /v1/entitlements/refresh`
- `POST /v1/webhooks/revenuecat`

Compatibility routes (ownership-checked):

- `GET /saves/{userId}/{slotId}`
- `PUT /saves/{userId}/{slotId}`
- `DELETE /saves/{userId}/{slotId}`

## Security Notes

- Save and entitlement data is persisted to encrypted at-rest storage.
- Audit trail is written to JSONL log (`CLOUDSYNC_AUDIT_LOG_PATH`) without save payload content.
- TLS is enforced by default on non-loopback requests.
- HSTS headers are emitted for secure requests.
- Key rotation is supported via multiple JWT secrets and multiple encryption keys.
