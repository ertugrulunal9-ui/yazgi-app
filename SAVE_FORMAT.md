# Save Format Specification (Local-First)

Status: Active  
Last Updated: 2026-02-17

## 1. Goals

- Keep saves local (AsyncStorage) until CloudSync is enabled.
- Support device transfer with JSON export/import.
- Keep format forward-compatible for future CloudSync migration.
- Preserve backup history to reduce save-loss risk.

## 2. Versioning

- Runtime save version: `SAVE_VERSION = 1`
- Schema version: `SAVE_SCHEMA_VERSION = 2`
- Export package version: `SAVE_EXPORT_VERSION = 2`

Version meaning:

- `version` = gameplay/save migration version.
- `schemaVersion` = transport/storage schema revision for metadata fields.
- `exportVersion` = JSON transfer package shape version.

## 3. Core Save Shape

`SaveSlotData`:

```json
{
  "metadata": {
    "slotId": "1",
    "characterName": "Player",
    "age": 14,
    "playtime": 320,
    "lastPlayed": 1760000000000,
    "version": 1,
    "checksum": "abc123",
    "schemaVersion": 2,
    "saveId": "save_xxx",
    "deviceId": "device_xxx",
    "revision": 8,
    "clientRevision": 8,
    "createdAt": 1760000000000,
    "updatedAt": 1760000000000,
    "idempotencyKey": "op_xxx",
    "migrationState": "pending",
    "status": "active",
    "isPremium": false
  },
  "playerName": "Player",
  "stats": {},
  "gameState": {}
}
```

## 4. Export Package Shape

Primary export object (`SaveExportPackage`):

```json
{
  "exportVersion": 2,
  "appVersion": "save-v1",
  "exportedAt": 1760000000000,
  "manifest": {
    "manifestVersion": 1,
    "slotIds": ["1"],
    "saveCount": 1,
    "backupCount": 3,
    "createdAt": 1760000000000,
    "checksum": "manifest_checksum"
  },
  "saves": [{ "...": "SaveSlotData" }],
  "backups": [{ "...": "SaveBackup" }],

  "version": 1,
  "exported": 1760000000000,
  "data": { "...": "SaveSlotData (legacy alias)" }
}
```

Compatibility notes:

- `version/exported/data` fields are kept for legacy import compatibility.
- New clients import both legacy and `exportVersion=2` formats.

## 5. Backup Strategy

- Latest backup key: `@yazgi_save/backup_{slotId}`
- Backup history key: `@yazgi_save/backup_{slotId}_history`
- Retention: `MAX_BACKUP_HISTORY = 5`
- History is sorted descending by `timestamp`.

On each save:

- current state is stored as latest backup.
- history is updated and trimmed to last 5 entries.

## 6. Validation and Integrity

Import pipeline:

1. payload size check (`<= 2 MB`).
2. JSON parse.
3. schema validation (`SaveValidation`).
4. optional auto-repair for known fields.
5. migration to current `SAVE_VERSION` when needed.
6. manifest checksum validation (if manifest exists).
7. persist via `saveToSlot`.
8. merge imported backups into local history.

Runtime integrity:

- each save has checksum over `{ playerName, stats, gameState }`.
- tamper detection also uses per-slot signature when secure store is available.

## 7. CloudSync Readiness Fields

These metadata fields are already stored locally and can map directly to CloudSync:

- `saveId`
- `deviceId`
- `revision`
- `clientRevision`
- `idempotencyKey`
- `createdAt`
- `updatedAt`
- `migrationState`

This reduces migration risk when backend sync is enabled later.

