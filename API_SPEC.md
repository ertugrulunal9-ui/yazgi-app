# CloudSync Backend API Specification (v1)

Status: Draft  
Last Updated: 2026-02-17

## 1. Scope

This document defines the backend contract for CloudSync save operations:

- authentication and required auth claims
- ownership enforcement (user can only access own saves)
- integrity and versioning
- rate limiting and abuse controls
- delete endpoints for slot-level and full-data deletion
- server-authoritative monetization entitlements (`/v1/entitlements`)

This spec is intentionally strict: no unauthenticated sync, no cleartext HTTP.

## 2. Security Baseline

1. HTTPS only (`TLS 1.2+`), no plaintext HTTP.
2. Enable HSTS on production domains.
3. All save endpoints require `Authorization: Bearer <token>`.
4. Server does not trust client-provided `userId`.
5. Every write is validated for payload size, schema, and integrity headers.

## 3. Authentication

## 3.1 Accepted Tokens

The API accepts JWT access tokens from one of:

- Firebase Auth ID token
- custom signed token (your auth server)
- Apple/Google sign-in token exchanged into backend access token

## 3.2 Required Claims

Server must validate:

- `sub` (required, canonical user id)
- `iss` (trusted issuer list)
- `aud` (expected audience/app id)
- `exp` and `nbf`
- signature (issuer public keys / JWKS)

Optional but recommended:

- `auth_time`
- `provider`
- `device_id` (if available)

## 3.3 Auth Errors

- `401` invalid or missing token
- `403` authenticated but forbidden (ownership mismatch, disabled account, etc.)

## 4. Ownership Rules

Canonical ownership key = `token.sub`.

Rules:

1. Every read/write/delete query is scoped by `token.sub`.
2. If request path contains a `userId`, server must verify `path.userId == token.sub`, otherwise return `403`.
3. Database queries must always include `user_id = token.sub`.

## 5. API Versioning and Routes

Base path: `/v1`

Canonical routes:

- `GET /v1/saves/{slotId}`
- `PUT /v1/saves/{slotId}`
- `DELETE /v1/saves/{slotId}`
- `GET /v1/saves` (list user slot metadata)
- `DELETE /v1/saves` (delete all saves for authenticated user)
- `GET /v1/entitlements`
- `POST /v1/entitlements/refresh`
- `POST /v1/webhooks/revenuecat`

Compatibility routes (optional, temporary):

- `GET /saves/{userId}/{slotId}`
- `PUT /saves/{userId}/{slotId}`
- `DELETE /saves/{userId}/{slotId}`

If compatibility routes are enabled, ownership check is mandatory.

## 6. Data Model (Server-Side)

Server-managed record shape:

```json
{
  "userId": "auth_sub",
  "slotId": "1",
  "data": {},
  "metadata": {
    "version": 1,
    "lastPlayed": 1739820000000
  },
  "clientChecksum": "abc123",
  "serverSha256": "hex_sha256",
  "revision": 42,
  "createdAt": "2026-02-17T10:00:00Z",
  "updatedAt": "2026-02-17T10:01:00Z",
  "deletedAt": null
}
```

Notes:

- `revision` increments on every write.
- `serverSha256` is computed from request payload bytes.
- soft-delete is allowed via `deletedAt`.

## 7. Request Validation and Integrity

Required write headers:

- `Authorization: Bearer <token>`
- `Content-Type: application/json`
- `X-Save-Version: <number>`
- `X-Save-Checksum: <string>`
- `X-Content-SHA256: <hex>`

Optional:

- `If-Match: "<revision>"` for optimistic concurrency
- `Idempotency-Key: <uuid>`
- `X-Save-HMAC: <hex>` (if client/server shared secret exists)

Server validation:

1. verify schema and max payload size
2. recompute SHA-256 and compare with `X-Content-SHA256`
3. compare body checksum with `X-Save-Checksum` policy
4. reject invalid integrity with `400 integrity_mismatch`

## 8. Endpoints

## 8.1 PUT /v1/saves/{slotId}

Create or update save for authenticated user.

Request body:

```json
{
  "metadata": {
    "slotId": "1",
    "version": 1,
    "checksum": "abc123",
    "lastPlayed": 1739820000000
  },
  "playerName": "Player",
  "stats": {},
  "gameState": {}
}
```

Responses:

- `201` created
- `200` updated
- `409` conflict (If-Match mismatch / stale revision)
- `413` payload too large

Response headers:

- `ETag: "42"` (current revision)

## 8.2 GET /v1/saves/{slotId}

Fetch one slot.

Responses:

- `200` with save payload
- `404` slot not found
- `410` slot deleted (optional soft-delete behavior)

## 8.3 GET /v1/saves

List user slots metadata only (for save picker).

Query params:

- `includeDeleted=false` (default)

Responses:

- `200` with metadata list

## 8.4 DELETE /v1/saves/{slotId}

Delete one slot for authenticated user.

Behavior:

- preferred: soft delete (`deletedAt` set)
- optional hard delete via backend admin policy

Responses:

- `204` success
- `404` not found

## 8.5 DELETE /v1/saves

Delete all saves for authenticated user (KVKK/GDPR user request flow).

Responses:

- `202` accepted (async job) or `204` completed

If async:

- return `jobId`
- expose job status endpoint (`GET /v1/jobs/{jobId}`)

## 8.6 GET /v1/entitlements

Fetch server-authoritative monetization state for authenticated user.

Response:

```json
{
  "userId": "auth_sub",
  "products": ["save_slots_premium", "remove_ads"],
  "flags": {
    "premiumSlots": true,
    "removeAds": true,
    "seasonPass": false
  },
  "source": "revenuecat_api",
  "revision": 12,
  "updatedAt": "2026-02-17T12:30:00Z"
}
```

## 8.7 POST /v1/entitlements/refresh

Refresh entitlement state server-side from billing provider (RevenueCat API).

- `200` refreshed state
- `502` provider/API failure

## 8.8 POST /v1/webhooks/revenuecat

RevenueCat webhook ingestion endpoint (server-to-server).

- protected by webhook secret header/bearer
- updates server-side entitlements for `app_user_id`
- `204` accepted and persisted

## 9. Conflict Handling

Recommended mode: optimistic concurrency.

1. Client reads save and gets `ETag`.
2. Client writes with `If-Match`.
3. If revision differs, return `409` with remote metadata:

```json
{
  "error": {
    "code": "save_conflict",
    "message": "Revision mismatch"
  },
  "remote": {
    "slotId": "1",
    "revision": 43,
    "lastPlayed": 1739820100000
  }
}
```

## 10. Rate Limit and Abuse Protection

Minimum limits (per user, with IP fallback):

- `GET /v1/saves/{slotId}`: 120 req/min
- `GET /v1/saves`: 60 req/min
- `PUT /v1/saves/{slotId}`: 30 req/min
- `DELETE /v1/saves/{slotId}`: 10 req/min
- `DELETE /v1/saves`: 3 req/hour

Required controls:

- `429` with `Retry-After`
- max payload size (recommended: `512 KB`)
- WAF rules (path traversal, JSON bombs, brute force)
- suspicious activity alerts (rapid slot churn, high error rate)

## 11. Error Format

All errors return:

```json
{
  "error": {
    "code": "rate_limited",
    "message": "Too many requests",
    "requestId": "req_123"
  }
}
```

Standard codes:

- `auth_missing_token`
- `auth_invalid_token`
- `auth_forbidden`
- `ownership_mismatch`
- `validation_error`
- `integrity_mismatch`
- `save_conflict`
- `save_not_found`
- `payload_too_large`
- `rate_limited`
- `internal_error`

## 12. Privacy and Compliance (KVKK/GDPR)

1. Document exactly which fields are synced.
2. Keep analytics consent separate from sync consent.
3. Provide user-access and user-delete flow (`DELETE /v1/saves`).
4. Encrypt data at rest in backend storage.
5. Define retention and backup deletion policy.
6. Log access in audit trail without leaking save content.

## 13. Implementation Checklist

- [x] JWT validation with issuer/audience checks
- [x] Ownership enforcement via `sub`
- [x] HTTPS/TLS enforcement + HSTS response header support
- [x] Integrity checks (`X-Content-SHA256`, checksum)
- [x] Revision + ETag conflict handling
- [x] Rate limiting + abuse detection
- [x] Slot delete + full delete endpoint
- [x] Audit logs + request id propagation
- [x] Persistent encrypted at-rest storage
- [x] Monetization entitlement endpoints + webhook ingestion
