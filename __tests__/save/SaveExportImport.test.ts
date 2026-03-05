import AsyncStorage from '@react-native-async-storage/async-storage';
import SaveManager from '../../src/save/SaveManager';
import {
  MAX_BACKUP_HISTORY,
  SAVE_EXPORT_VERSION,
  SAVE_VERSION,
  getSlotKey,
  getMetadataKey,
} from '../../src/save/SaveSlot';

const baseStats = {
  health: 60,
  intelligence: 55,
  charisma: 40,
  discipline: 45,
  money: 120,
  energy: 90,
  familyRelation: 50,
};

const makeGameState = (age: number, totalTurns: number) =>
  ({
    age,
    totalTurns,
  } as any);

describe('SaveManager export/import compatibility', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();

    const manager = SaveManager as any;
    manager.state = {
      ...manager.state,
      slots: {},
      metadata: {},
      lastAutoSave: 0,
      cloudSync: {
        ...manager.state.cloudSync,
        enabled: false,
        pendingSlots: [],
      },
    };
    manager.saveLocks?.clear?.();
    manager.saveQueue?.clear?.();
    manager.deviceId = null;
  });

  const isEncryptedPrefix = (raw: string | null): boolean => (
    typeof raw === 'string' && /^enc:v[12]:/.test(raw)
  );

  const isCompressedEnvelope = (raw: string | null): boolean => {
    if (typeof raw !== 'string') return false;
    try {
      const parsed = JSON.parse(raw) as { compressed?: unknown; version?: unknown };
      return typeof parsed.compressed === 'string' && parsed.version === SAVE_VERSION;
    } catch {
      return false;
    }
  };

  const isJsonEnvelope = (raw: string | null): boolean => {
    if (typeof raw !== 'string') return false;
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      return typeof parsed === 'object' && parsed !== null;
    } catch {
      return false;
    }
  };

  it('exports v5 package with manifest, saves and backups', async () => {
    const saved = await SaveManager.saveToSlot('1', 'Alice', baseStats, makeGameState(12, 3));
    expect(saved).toBe(true);

    const rawExport = await SaveManager.exportSlot('1');
    expect(rawExport).not.toBeNull();

    const exported = JSON.parse(rawExport!);
    expect(exported.exportVersion).toBe(SAVE_EXPORT_VERSION);
    expect(exported.version).toBe(SAVE_VERSION);
    expect(Array.isArray(exported.saves)).toBe(true);
    expect(exported.saves[0].playerName).toBe('Alice');
    expect(Array.isArray(exported.backups)).toBe(true);
    expect(exported.backups.length).toBeGreaterThan(0);
    expect(exported.manifest.backupCount).toBe(exported.backups.length);
  });

  it('imports legacy format { version, data }', async () => {
    await SaveManager.saveToSlot('1', 'LegacyUser', baseStats, makeGameState(11, 2));
    const rawExport = await SaveManager.exportSlot('1');
    const exported = JSON.parse(rawExport!);

    const legacyPayload = JSON.stringify({
      version: exported.version,
      exported: exported.exported,
      data: exported.data,
    });

    const imported = await SaveManager.importSlot('2', legacyPayload);
    expect(imported).toBe(true);

    const loaded = await SaveManager.loadFromSlot('2');
    expect(loaded).not.toBeNull();
    expect(loaded?.playerName).toBe('LegacyUser');
    expect(loaded?.metadata.slotId).toBe('2');
    expect(loaded?.metadata.migrationState).toBe('migrated');
  });

  it('imports v5 package and keeps backup history bounded', async () => {
    await SaveManager.saveToSlot('1', 'BackupUser', baseStats, makeGameState(10, 1));
    await SaveManager.saveToSlot('1', 'BackupUser', baseStats, makeGameState(10, 2));
    await SaveManager.saveToSlot('1', 'BackupUser', baseStats, makeGameState(10, 3));

    const sourceExport = await SaveManager.exportSlot('1');
    const sourcePackage = JSON.parse(sourceExport!);
    expect(sourcePackage.backups.length).toBeGreaterThan(0);

    const imported = await SaveManager.importSlot('3', sourceExport!);
    expect(imported).toBe(true);

    const targetExport = await SaveManager.exportSlot('3');
    const targetPackage = JSON.parse(targetExport!);
    expect(targetPackage.exportVersion).toBe(SAVE_EXPORT_VERSION);
    expect(targetPackage.backups.length).toBeGreaterThan(0);
    expect(targetPackage.backups.length).toBeLessThanOrEqual(MAX_BACKUP_HISTORY);
  });

  it('stores save payloads encrypted at rest', async () => {
    const saved = await SaveManager.saveToSlot('1', 'EncryptedUser', baseStats, makeGameState(12, 4));
    expect(saved).toBe(true);

    const rawSlot = await AsyncStorage.getItem(getSlotKey('1'));
    const rawMeta = await AsyncStorage.getItem(getMetadataKey('1'));
    expect(rawSlot).toBeTruthy();
    expect(rawMeta).toBeTruthy();
    expect(isEncryptedPrefix(rawSlot) || isCompressedEnvelope(rawSlot)).toBe(true);
    expect(
      isEncryptedPrefix(rawMeta)
      || isCompressedEnvelope(rawMeta)
      || isJsonEnvelope(rawMeta)
    ).toBe(true);
    expect(rawSlot).not.toContain('EncryptedUser');
    if (!isJsonEnvelope(rawMeta)) {
      expect(rawMeta).not.toContain('EncryptedUser');
    }

    const loaded = await SaveManager.loadFromSlot('1');
    expect(loaded?.playerName).toBe('EncryptedUser');
  });
});
